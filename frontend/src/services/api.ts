import { Topic, QuestionData, SubmissionResponse, DashboardProgress, PracticeSessionRecord } from '../types';

const API_BASE = '/api';

// Helper for local guest storage
const GUEST_SESSIONS_KEY = 'quick_maths_guest_sessions';

export const guestStorage = {
  getSessions(): PracticeSessionRecord[] {
    try {
      const data = localStorage.getItem(GUEST_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSession(session: PracticeSessionRecord) {
    try {
      const sessions = this.getSessions();
      sessions.unshift(session);
      localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save guest session:', e);
    }
  },
  clearSessions() {
    localStorage.removeItem(GUEST_SESSIONS_KEY);
  },
  getDashboardProgress(): DashboardProgress {
    const sessions = this.getSessions();
    const totalSessions = sessions.length;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTime = 0;

    const topicMap: Record<string, { total: number; correct: number; last: string }> = {};

    for (const s of sessions) {
      totalQuestions += s.totalQuestions;
      totalCorrect += s.correctCount;
      totalTime += s.averageTimeSeconds * s.totalQuestions;

      if (!topicMap[s.topicId]) {
        topicMap[s.topicId] = { total: 0, correct: 0, last: s.completedAt };
      }
      topicMap[s.topicId].total += s.totalQuestions;
      topicMap[s.topicId].correct += s.correctCount;
    }

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;
    const averageSolvingTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : null;

    return {
      hasData: totalQuestions > 0,
      overall: {
        totalSessions,
        totalQuestions,
        totalCorrect,
        overallAccuracy,
        averageSolvingTime,
      },
      streak: {
        currentStreak: totalSessions > 0 ? 1 : 0,
        longestStreak: totalSessions > 0 ? 1 : 0,
        totalActiveDays: totalSessions > 0 ? 1 : 0,
      },
      topicBreakdown: Object.entries(topicMap).map(([topicId, val]) => ({
        topicId,
        topicTitle: topicId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        icon: 'BookOpen',
        totalAttempts: val.total,
        correctAttempts: val.correct,
        accuracyPercent: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
        lastPracticedAt: val.last,
      })),
      recentSessions: sessions.slice(0, 5).map((s) => ({
        id: s.id,
        topicTitle: s.topicId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        difficulty: s.difficulty,
        totalQuestions: s.totalQuestions,
        correctCount: s.correctCount,
        accuracyPercent: Math.round(s.accuracyPercent),
        completedAt: s.completedAt,
      })),
    };
  },
};

// API calls
export const api = {
  async getTopics(): Promise<Topic[]> {
    const res = await fetch(`${API_BASE}/topics`);
    if (!res.ok) throw new Error('Failed to load topics');
    const data = await res.json();
    return data.topics;
  },

  async getTopic(id: string): Promise<Topic> {
    const res = await fetch(`${API_BASE}/topics/${id}`);
    if (!res.ok) throw new Error('Failed to load topic details');
    const data = await res.json();
    return data.topic;
  },

  async getQuestion(topicId: string, difficulty = 'MEDIUM'): Promise<QuestionData> {
    const res = await fetch(`${API_BASE}/practice/question?topicId=${topicId}&difficulty=${difficulty}`);
    if (!res.ok) throw new Error('Failed to generate question');
    const data = await res.json();
    return data.question;
  },

  async submitAnswer(payload: {
    questionId: string;
    userAnswer: string;
    elapsedSeconds: number;
    hintUsed: boolean;
    sessionId?: string;
  }): Promise<SubmissionResponse> {
    const res = await fetch(`${API_BASE}/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit answer');
    return res.json();
  },

  async startSession(topicId: string, difficulty: string): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/practice/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ topicId, difficulty }),
    });
    if (!res.ok) throw new Error('Failed to start session');
    const data = await res.json();
    return data.session;
  },

  async completeSession(
    sessionId: string,
    payload: { totalQuestions: number; correctCount: number; averageTimeSeconds: number }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/practice/session/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to complete session');
    return res.json();
  },

  async getDashboard(): Promise<DashboardProgress> {
    const res = await fetch(`${API_BASE}/progress/dashboard`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  async migrateGuestData(sessions: PracticeSessionRecord[]): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/migrate-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ sessions }),
    });
    if (!res.ok) throw new Error('Failed to migrate guest progress');
    return res.json();
  },
};
