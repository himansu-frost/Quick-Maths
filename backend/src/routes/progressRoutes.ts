import { Router, Request, Response } from 'express';
import { prisma } from '../database/db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/progress/dashboard
router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    // 1. Fetch user's practice sessions
    const sessions = await prisma.practiceSession.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      include: { topic: true },
    });

    // 2. Fetch topic progress
    const topicProgresses = await prisma.topicProgress.findMany({
      where: { userId },
      include: { topic: true },
      orderBy: { totalAttempts: 'desc' },
    });

    // 3. Fetch daily activities for streak calculation
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { activityDate: 'asc' },
    });

    // Calculate overall metrics
    const totalSessions = sessions.length;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTime = 0;

    for (const s of sessions) {
      totalQuestions += s.totalQuestions;
      totalCorrect += s.correctCount;
      totalTime += s.averageTimeSeconds * s.totalQuestions;
    }

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;
    const averageSolvingTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : null;

    // Calculate streak
    const activityDates = dailyActivities.map((a) => a.activityDate);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (activityDates.length > 0) {
      // Simple calendar date streak calculation
      const sortedDates = [...new Set(activityDates)].sort();
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(sortedDates[i]);
          const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }

      // Check if current streak extends to today or yesterday
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const lastActive = sortedDates[sortedDates.length - 1];

      if (lastActive === today || lastActive === yesterday) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }

    res.json({
      hasData: totalQuestions > 0,
      overall: {
        totalSessions,
        totalQuestions,
        totalCorrect,
        overallAccuracy,
        averageSolvingTime,
      },
      streak: {
        currentStreak,
        longestStreak,
        totalActiveDays: dailyActivities.length,
      },
      topicBreakdown: topicProgresses.map((tp) => ({
        topicId: tp.topicId,
        topicTitle: tp.topic.title,
        icon: tp.topic.icon,
        totalAttempts: tp.totalAttempts,
        correctAttempts: tp.correctAttempts,
        accuracyPercent: Math.round(tp.accuracyPercent),
        lastPracticedAt: tp.lastPracticedAt,
      })),
      recentSessions: sessions.slice(0, 10).map((s) => ({
        id: s.id,
        topicTitle: s.topic.title,
        difficulty: s.difficulty,
        totalQuestions: s.totalQuestions,
        correctCount: s.correctCount,
        accuracyPercent: Math.round(s.accuracyPercent),
        completedAt: s.completedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard progress:', error);
    res.status(500).json({ error: 'Failed to load progress dashboard' });
  }
});

export default router;
