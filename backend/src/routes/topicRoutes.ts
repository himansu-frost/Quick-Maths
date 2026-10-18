import { Router, Request, Response } from 'express';
import { prisma } from '../database/db';

const router = Router();

// GET /api/topics - List all topics with subtopics count
router.get('/', async (req: Request, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        subtopics: {
          where: { isPublished: true },
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            displayOrder: true,
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    });

    res.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// GET /api/topics/:id - Single topic with full subtopics and lessons
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        subtopics: {
          where: { isPublished: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    res.json({ topic });
  } catch (error) {
    console.error('Error fetching topic details:', error);
    res.status(500).json({ error: 'Failed to fetch topic details' });
  }
});

// GET /api/topics/lesson/:id - Single lesson
router.get('/lesson/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        subtopic: {
          include: { topic: true },
        },
      },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
