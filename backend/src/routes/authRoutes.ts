import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../database/db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password, name } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // PRD Security: Generic message to not leak account existence
      res.status(409).json({
        error: 'Registration error',
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name,
        profile: {
          create: {
            dailyGoalMinutes: 10,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    req.session.userId = user.id;
    req.session.email = user.email;

    res.status(201).json({
      message: 'Account registered successfully',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid login details' });
      return;
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Signed out successfully' });
  });
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.json({ user: null, isGuest: true });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      req.session.destroy(() => {});
      res.json({ user: null, isGuest: true });
      return;
    }

    res.json({ user, isGuest: false });
  } catch (error) {
    console.error('Auth /me error:', error);
    res.status(500).json({ error: 'Server error retrieving current session' });
  }
});

// POST /api/auth/migrate-guest
router.post('/migrate-guest', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { sessions = [], attempts = [] } = req.body;

    if (!Array.isArray(sessions) && !Array.isArray(attempts)) {
      res.status(400).json({ error: 'Invalid guest migration payload' });
      return;
    }

    let migratedSessionsCount = 0;
    for (const s of sessions) {
      if (!s.topicId || !s.difficulty) continue;

      const createdSession = await prisma.practiceSession.create({
        data: {
          userId,
          topicId: s.topicId,
          difficulty: s.difficulty,
          totalQuestions: s.totalQuestions || 0,
          correctCount: s.correctCount || 0,
          accuracyPercent: s.accuracyPercent || 0,
          averageTimeSeconds: s.averageTimeSeconds || 0,
          completedAt: s.completedAt ? new Date(s.completedAt) : new Date(),
        },
      });

      // Update topic progress
      const existingProgress = await prisma.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId: s.topicId,
          },
        },
      });

      if (existingProgress) {
        const total = existingProgress.totalAttempts + (s.totalQuestions || 0);
        const correct = existingProgress.correctAttempts + (s.correctCount || 0);
        const accuracy = total > 0 ? (correct / total) * 100 : 0;

        await prisma.topicProgress.update({
          where: { id: existingProgress.id },
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
            topicId: s.topicId,
            totalAttempts: s.totalQuestions || 0,
            correctAttempts: s.correctCount || 0,
            accuracyPercent: s.accuracyPercent || 0,
            lastPracticedAt: new Date(),
          },
        });
      }

      migratedSessionsCount++;
    }

    res.json({
      message: `Successfully migrated ${migratedSessionsCount} guest session(s) into your account!`,
      migratedCount: migratedSessionsCount,
    });
  } catch (error) {
    console.error('Guest migration error:', error);
    res.status(500).json({ error: 'Failed to migrate guest progress' });
  }
});

export default router;
