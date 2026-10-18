import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BarChart2,
  Brain,
  Sparkles,
  Zap,
  Clock,
  Award,
} from 'lucide-react';
import { QuestionData, SubmissionResponse, Difficulty } from '../types';
import { api, guestStorage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PracticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const topicId = searchParams.get('topicId') || 'shopping-discounts';
  const difficulty = (searchParams.get('difficulty') || 'MEDIUM') as Difficulty;

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<SubmissionResponse | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

  // Timing tracking
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize practice session
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        if (!isGuest) {
          const sess = await api.startSession(topicId, difficulty);
          if (isMounted) setSessionId(sess.id);
        }
        await loadNextQuestion();
      } catch (err) {
        console.error('Session init error:', err);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [topicId, difficulty, isGuest]);

  const loadNextQuestion = async () => {
    setIsLoadingQuestion(true);
    setEvaluation(null);
    setUserAnswer('');
    setShowHint(false);
    setStartTime(Date.now());

    try {
      const q = await api.getQuestion(topicId, difficulty);
      setCurrentQuestion(q);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer.trim() || isSubmitting || evaluation) return;

    setIsSubmitting(true);
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setTotalElapsedSeconds((prev) => prev + elapsed);

    try {
      const result = await api.submitAnswer({
        questionId: currentQuestion.id,
        userAnswer,
        elapsedSeconds: elapsed,
        hintUsed: showHint,
        sessionId: sessionId || undefined,
      });

      setEvaluation(result);
      if (result.isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setQuestionCount((prev) => prev + 1);
    loadNextQuestion();
  };

  const handleEndSession = async () => {
    setIsSessionEnded(true);

    const attemptedCount = evaluation ? questionCount : Math.max(0, questionCount - 1);
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const avgTime = attemptedCount > 0 ? Math.round(totalElapsedSeconds / attemptedCount) : 0;

    // Trigger celebration if high accuracy!
    if (accuracy >= 70 && attemptedCount >= 2) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    if (sessionId && !isGuest) {
      try {
        await api.completeSession(sessionId, {
          totalQuestions: attemptedCount,
          correctCount,
          averageTimeSeconds: avgTime,
        });
      } catch (err) {
        console.error('Error saving session completion:', err);
      }
    } else {
      // Guest local storage
      guestStorage.saveSession({
        id: `guest-sess-${Date.now()}`,
        topicId,
        difficulty,
        totalQuestions: attemptedCount,
        correctCount,
        accuracyPercent: accuracy,
        averageTimeSeconds: avgTime,
        completedAt: new Date().toISOString(),
        attempts: [],
      });
    }
  };

  const formattedTopicTitle = topicId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // -------------------------------------------------------------
  // SESSION SUMMARY VIEW
  // -------------------------------------------------------------
  if (isSessionEnded) {
    const attemptedCount = evaluation ? questionCount : Math.max(0, questionCount - 1);
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const avgTime = attemptedCount > 0 ? Math.round(totalElapsedSeconds / attemptedCount) : 0;

    return (
      <div className="mx-auto max-w-xl px-4 py-12 animate-fade-in">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
            <Award className="h-8 w-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Practice Session Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {formattedTopicTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Difficulty: <span className="font-semibold text-slate-700">{difficulty}</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="text-xl font-extrabold text-slate-900">{attemptedCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Attempted</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="text-xl font-extrabold text-emerald-600">{correctCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Correct</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="text-xl font-extrabold text-slate-900">
                {attemptedCount > 0 ? `${accuracy}%` : 'N/A'}
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Accuracy</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="text-xl font-extrabold text-slate-900">{avgTime}s</div>
              <div className="text-[11px] font-semibold text-slate-500">Avg Time</div>
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="text-xs text-slate-600 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 leading-relaxed text-left">
            {accuracy >= 80 ? (
              <p>
                🔥 <strong>Phenomenal accuracy!</strong> Your calculations in {formattedTopicTitle} are sharp and consistent.
              </p>
            ) : accuracy >= 50 ? (
              <p>
                👍 <strong>Solid effort!</strong> You have the fundamental principles down. Review the step-by-step explanations to lock in the mental shortcuts.
              </p>
            ) : attemptedCount > 0 ? (
              <p>
                💡 <strong>Great practice reps.</strong> Everyday math is a muscle—reading the worked examples in the Learn tab will make these calculations second nature.
              </p>
            ) : (
              <p>Session concluded with no questions attempted.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setIsSessionEnded(false);
                setQuestionCount(1);
                setCorrectCount(0);
                setTotalElapsedSeconds(0);
                loadNextQuestion();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Practice Again</span>
            </button>

            <Link
              to="/topics"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
            >
              <span>Explore Topics</span>
            </Link>

            <Link
              to="/progress"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
            >
              <BarChart2 className="h-4 w-4 text-slate-500" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE QUESTION SCREEN
  // -------------------------------------------------------------
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header & Session Progress */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleEndSession}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>End Session</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {difficulty}
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Question #{questionCount}
          </span>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            {formattedTopicTitle}
          </span>
          {isLoadingQuestion ? (
            <div className="h-20 bg-slate-100 rounded-xl mt-3 animate-pulse" />
          ) : (
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 leading-relaxed">
              {currentQuestion?.questionText}
            </h2>
          )}
        </div>

        {/* HINT BUTTON / DRAWER */}
        {currentQuestion?.hint && (
          <div>
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
              >
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Need a hint?</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in">
                <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Guidance:</span>
                  <span>{currentQuestion.hint}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANSWER INPUT FORM */}
        {!evaluation ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Answer {currentQuestion?.unit ? `(${currentQuestion.unit})` : ''}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  required
                  autoFocus
                  placeholder={
                    currentQuestion?.acceptedRounding === 'INTEGER'
                      ? 'e.g. 1800'
                      : currentQuestion?.unit === 'time'
                      ? 'e.g. 4:20'
                      : 'e.g. 24.5'
                  }
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full text-base sm:text-lg font-bold text-slate-900 px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Press Enter ↵ to submit
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !userAnswer.trim()}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40"
              >
                {isSubmitting ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </form>
        ) : (
          /* EVALUATION & STEP-BY-STEP FEEDBACK */
          <div className="space-y-4 pt-2 border-t border-slate-100 animate-fade-in">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                evaluation.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              {evaluation.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {evaluation.isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                  <span className="text-xs font-semibold">
                    Correct Answer: <strong className="underline">{evaluation.correctAnswer}</strong>
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">{evaluation.feedbackMessage}</p>
              </div>
            </div>

            {/* Step-by-Step Explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Step-by-Step Calculation
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                {evaluation.stepByStepExplanation}
              </p>
            </div>

            {/* Mental Shortcut */}
            {evaluation.mentalShortcut && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                <Brain className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Mental Shortcut Tip:</span>
                  <span>{evaluation.mentalShortcut}</span>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                autoFocus
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:scale-[1.02] transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
