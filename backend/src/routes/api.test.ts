import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../database/db';

describe('Quick Maths REST API Integration Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health returns status ok and database MySQL', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('MySQL');
  });

  it('GET /api/topics returns all 11 published categories', async () => {
    const res = await request(app).get('/api/topics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.topics)).toBe(true);
    expect(res.body.topics.length).toBe(11);

    const topicIds = res.body.topics.map((t: any) => t.id);
    expect(topicIds).toContain('shopping-discounts');
    expect(topicIds).toContain('budgeting-expense-tracking');
    expect(topicIds).toContain('loans-emi-interest');
  });

  it('GET /api/practice/question returns a valid question without exposing answer', async () => {
    const res = await request(app).get('/api/practice/question?topicId=shopping-discounts&difficulty=MEDIUM');
    expect(res.status).toBe(200);
    expect(res.body.question).toBeDefined();
    expect(res.body.question.questionText).toBeTruthy();
    expect(res.body.question.hint).toBeTruthy();
    expect(res.body.question.correctAnswer).toBeUndefined();
    expect(res.body.question.stepByStepExplanation).toBeUndefined();
  });

  it('POST /api/practice/submit validates submitted answer and returns explanation', async () => {
    // 1. Get question
    const qRes = await request(app).get('/api/practice/question?topicId=shopping-discounts&difficulty=MEDIUM');
    const qId = qRes.body.question.id;

    // 2. Submit wrong answer
    const subRes = await request(app).post('/api/practice/submit').send({
      questionId: qId,
      userAnswer: '99999999',
      elapsedSeconds: 10,
    });

    expect(subRes.status).toBe(200);
    expect(subRes.body.isCorrect).toBe(false);
    expect(subRes.body.correctAnswer).toBeDefined();
    expect(subRes.body.stepByStepExplanation).toBeDefined();
  });
});
