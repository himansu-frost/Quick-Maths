import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../database/db';
import {
  generateQuestionForTopic,
  validateAnswer,
  DifficultyLevel,
} from '../domain/maths/engine';

const router = Router();

// Store temporary question solutions in memory keyed by questionId for secure server-side validation
interface QuestionSecret {
  correctAnswer: string;
  numericAnswer: number;
  acceptedRounding: 'INTEGER' | '2_DECIMALS' | 'EXACT';
  stepByStepExplanation: string;
  mentalShortcut?: string;
  topicId: string;
  subtopicId: string;
  questionText: string;
  createdAt: number;
}

const questionSecretStore = new Map<string, QuestionSecret>();

// Clean up stale secrets every 15 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [id, sec] of questionSecretStore.entries()) {
    if (now - sec.createdAt > 3600000) {
      questionSecretStore.delete(id);
    }
  }
}, 900000);
cleanupInterval.unref();


// GET /api/practice/question?topicId=...&difficulty=...
router.get('/question', (req: Request, res: Response) => {
  try {
    const topicId = (req.query.topicId as string) || 'shopping-discounts';
    let difficulty = (req.query.difficulty as string)?.toUpperCase() || 'MEDIUM';

    // PRD: Default maps to Medium in MVP
    if (difficulty === 'DEFAULT') difficulty = 'MEDIUM';
    if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      difficulty = 'MEDIUM';
    }

    const question = generateQuestionForTopic(topicId, difficulty as DifficultyLevel);

    // Stash the answer securely on the server
    questionSecretStore.set(question.id, {
      correctAnswer: question.correctAnswer,
      numericAnswer: question.numericAnswer,
      acceptedRounding: question.acceptedRounding,
      stepByStepExplanation: question.stepByStepExplanation,
      mentalShortcut: question.mentalShortcut,
      topicId: question.topicId,
      subtopicId: question.subtopicId,
      questionText: question.questionText,
      createdAt: Date.now(),
    });

    // Return question WITHOUT revealing answer or explanation
    res.json({
      question: {
        id: question.id,
        topicId: question.topicId,
        subtopicId: question.subtopicId,
        difficulty: question.difficulty,
        questionText: question.questionText,
        unit: question.unit,
        acceptedRounding: question.acceptedRounding,
        hint: question.hint,
      },
    });
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

const submitSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string(),
  elapsedSeconds: z.number().min(0).default(5),
  hintUsed: z.boolean().default(false),
  sessionId: z.string().optional(),
});

// POST /api/practice/submit
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const parseResult = submitSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid submission data', details: parseResult.error });
      return;
    }

    const { questionId, userAnswer, elapsedSeconds, hintUsed, sessionId } = parseResult.data;
    const secret = questionSecretStore.get(questionId);

    if (!secret) {
      res.status(404).json({
        error: 'Question expired or not found. Please request a new question.',
      });
      return;
    }

    const validation = validateAnswer(
      userAnswer,
      secret.correctAnswer,
      secret.numericAnswer,
      secret.acceptedRounding
    );

    const userId = req.session?.userId;

    // If part of an active session, save attempt
    if (sessionId && userId) {
      try {
        await prisma.questionAttempt.create({
          data: {
            practiceSessionId: sessionId,
            userId,
            topicId: secret.topicId,
            subtopicId: secret.subtopicId,
            questionText: secret.questionText,
            userAnswer,
            correctAnswer: secret.correctAnswer,
            isCorrect: validation.isCorrect,
            elapsedSeconds,
            hintUsed,
            explanation: secret.stepByStepExplanation,
          },
        });
      } catch (dbErr) {
        console.error('Error saving attempt to db:', dbErr);
      }
    }

    // Return evaluation and full explanation
    res.json({
      isCorrect: validation.isCorrect,
      correctAnswer: secret.correctAnswer,
      stepByStepExplanation: secret.stepByStepExplanation,
      mentalShortcut: secret.mentalShortcut,
      feedbackMessage: validation.feedbackMessage,
    });
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({ error: 'Server error processing answer' });
  }
});

// POST /api/practice/session - Start a session
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { topicId, difficulty = 'MEDIUM', guestSessionToken } = req.body;
    const userId = req.session?.userId;

    const session = await prisma.practiceSession.create({
      data: {
        userId: userId || null,
        guestSessionToken: guestSessionToken || null,
        topicId,
        difficulty: difficulty === 'DEFAULT' ? 'MEDIUM' : difficulty,
      },
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start practice session' });
  }
});

// POST /api/practice/session/:id/complete
router.post('/session/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { totalQuestions, correctCount, averageTimeSeconds } = req.body;
    const userId = req.session?.userId;

    const accuracyPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const session = await prisma.practiceSession.update({
      where: { id },
      data: {
        totalQuestions,
        correctCount,
        accuracyPercent,
        averageTimeSeconds,
        completedAt: new Date(),
      },
    });

    // If registered user, update TopicProgress and DailyActivity
    if (userId) {
      // 1. TopicProgress
      const existingProg = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId: session.topicId,
          },
        },
      });

      if (existingProg) {
        const total = existingProg.totalAttempts + totalQuestions;
        const correct = existingProg.correctAttempts + correctCount;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;

        await prisma.topicProgress.update({
          where: { id: existingProg.id },
          data: {
            totalAttempts: total,
            correctAttempts: correct,
            accuracyPercent: accuracy,
            lastPracticedAt: new Date(),
          },
        });
      } else {
        await prisma.topicProgress.create({
          data: {
            userId,
            topicId: session.topicId,
            totalAttempts: totalQuestions,
            correctAttempts: correctCount,
            accuracyPercent,
            lastPracticedAt: new Date(),
          },
        });
      }

      // 2. DailyActivity for streak
      const today = new Date().toISOString().slice(0, 10);
      await prisma.dailyActivity.upsert({
        where: {
          userId_activityDate: {
            userId,
            activityDate: today,
          },
        },
        update: {
          questionsCompleted: { increment: totalQuestions },
          minutesSpent: { increment: Math.max(1, Math.round((averageTimeSeconds * totalQuestions) / 60)) },
        },
        create: {
          userId,
          activityDate: today,
          questionsCompleted: totalQuestions,
          minutesSpent: Math.max(1, Math.round((averageTimeSeconds * totalQuestions) / 60)),
        },
      });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ error: 'Failed to complete practice session' });
  }
});

export default router;
