export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'DEFAULT';

export interface Lesson {
  id: string;
  subtopicId: string;
  title: string;
  concept: string;
  formula?: string | null;
  workedExample: string;
  stepByStepSolution: string;
  mentalShortcut?: string | null;
  commonMistakes?: string | null;
  quickCheckQuestion?: string | null;
  quickCheckOptions?: string | null; // JSON string array
  quickCheckAnswer?: string | null;
  displayOrder: number;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  displayOrder: number;
  lessons?: Lesson[];
  _count?: {
    lessons: number;
  };
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
  subtopics: Subtopic[];
}

export interface QuestionData {
  id: string;
  topicId: string;
  subtopicId: string;
  difficulty: string;
  questionText: string;
  unit?: string;
  acceptedRounding: string;
  hint: string;
}

export interface SubmissionResponse {
  isCorrect: boolean;
  correctAnswer: string;
  stepByStepExplanation: string;
  mentalShortcut?: string;
  feedbackMessage: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profile?: {
    dailyGoalMinutes: number;
    mathSkillGoal?: string;
  };
}

export interface PracticeAttemptRecord {
  questionId: string;
  topicId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  elapsedSeconds: number;
}

export interface PracticeSessionRecord {
  id: string;
  topicId: string;
  difficulty: string;
  totalQuestions: number;
  correctCount: number;
  accuracyPercent: number;
  averageTimeSeconds: number;
  completedAt: string;
  attempts: PracticeAttemptRecord[];
}

export interface DashboardProgress {
  hasData: boolean;
  overall: {
    totalSessions: number;
    totalQuestions: number;
    totalCorrect: number;
    overallAccuracy: number | null;
    averageSolvingTime: number | null;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
  };
  topicBreakdown: Array<{
    topicId: string;
    topicTitle: string;
    icon: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracyPercent: number;
    lastPracticedAt: string;
  }>;
  recentSessions: Array<{
    id: string;
    topicTitle: string;
    difficulty: string;
    totalQuestions: number;
    correctCount: number;
    accuracyPercent: number;
    completedAt: string;
  }>;
}
