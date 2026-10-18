import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Flame,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DashboardProgress } from '../types';
import { api, guestStorage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProgressPage: React.FC = () => {
  const { user, isGuest, openAuthModal } = useAuth();
  const [data, setData] = useState<DashboardProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      setIsLoading(true);
      try {
        if (!isGuest) {
          const res = await api.getDashboard();
          setData(res);
        } else {
          const guestData = guestStorage.getDashboardProgress();
          setData(guestData);
        }
      } catch (err) {
        console.error('Error loading progress:', err);
        // Fallback to guest storage if unauthenticated
        setData(guestStorage.getDashboardProgress());
      } finally {
        setIsLoading(false);
      }
    }

    loadProgress();
  }, [isGuest]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const hasData = data?.hasData || false;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Analytics & Consistency
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Your Mathematics Progress
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isGuest
              ? 'Showing local session statistics stored on this browser.'
              : `Tracking verified progress for ${user?.name}.`}
          </p>
        </div>

        {isGuest && (
          <button
            onClick={() => openAuthModal('register')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Save Progress to Account</span>
          </button>
        )}
      </div>

      {/* Guest Mode Callout */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Guest Mode Active:</span> Your practice history is currently saved on this local device. To sync your progress across devices and preserve streaks permanently, create a free account.
          </div>
        </div>
      )}

      {/* OVERALL METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Attempted */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attempted</span>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data?.overall.totalQuestions || 0}
          </div>
          <span className="text-[11px] text-slate-500">Questions solved</span>
        </div>

        {/* Overall Accuracy (PRD requirement: do NOT show 0% if no attempts!) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accuracy</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {data?.overall.overallAccuracy !== null ? `${data?.overall.overallAccuracy}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-500">
            {data?.overall.totalCorrect || 0} correct answers
          </span>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data?.streak.currentStreak || 0} <span className="text-sm font-semibold text-slate-500">days</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Best: {data?.streak.longestStreak || 0} days
          </span>
        </div>

        {/* Avg Solving Speed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Speed</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data?.overall.averageSolvingTime !== null ? `${data?.overall.averageSolvingTime}s` : '—'}
          </div>
          <span className="text-[11px] text-slate-500">Per question</span>
        </div>
      </div>

      {/* ZERO-ATTEMPT EMPTY STATE */}
      {!hasData || !data ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <BarChart2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No practice sessions recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Start a practice session in any of the 11 topics to see your accuracy charts, solving speeds, and daily streaks populate automatically!
          </p>
          <div className="pt-2">
            <Link
              to="/topics"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Explore Topics & Practice</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* ANALYTICS CHARTS & TOPIC BREAKDOWN */
        <div className="space-y-8">
          {/* Recharts Topic Accuracy Chart */}
          {data.topicBreakdown && data.topicBreakdown.length > 0 && (
            <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Accuracy by Topic Category (%)
              </h3>
              <p className="text-xs text-slate-500">
                Shows comparative accuracy across practiced topics.
              </p>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.topicBreakdown}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="topicTitle"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      unit="%"
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Accuracy']}
                      labelFormatter={(label) => `Topic: ${label}`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="accuracyPercent" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Topic Performance List */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Topic-by-Topic Breakdown</h3>
            <div className="divide-y divide-slate-100">
              {data.topicBreakdown.map((t) => (
                <div key={t.topicId} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.topicTitle}</h4>
                    <span className="text-[11px] text-slate-500">
                      {t.correctAttempts} / {t.totalAttempts} correct answers
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-600">
                        {t.accuracyPercent}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">accuracy</span>
                    </div>
                    <Link
                      to={`/practice?topicId=${t.topicId}&difficulty=MEDIUM`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
