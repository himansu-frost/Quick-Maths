import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Topic, Difficulty } from '../types';
import { api } from '../services/api';
import { DifficultyModal } from '../components/DifficultyModal';

export const TopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api
        .getTopic(id)
        .then((data) => setTopic(data))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Topic Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested topic could not be located.</p>
        <Link
          to="/topics"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Topics</span>
        </Link>
      </div>
    );
  }

  const handleDifficultySelected = (diff: Difficulty) => {
    setIsDiffModalOpen(false);
    navigate(`/practice?topicId=${topic.id}&difficulty=${diff}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-10">
      {/* Back button */}
      <Link
        to="/topics"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Explore Topics</span>
      </Link>

      {/* Hero Banner with Learn and Practice Options */}
      <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Topic Overview
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            {topic.title}
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {topic.description}
          </p>

          {/* Educational Disclaimer callout for sensitive categories */}
          {['loans-emi-interest', 'salary-tax-planning', 'fitness-health-calculations'].includes(topic.id) && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Educational Notice:</strong> These calculations teach numerical formulas and mental estimation models. Results are approximations and do not constitute certified financial, legal, or medical advice.
              </span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setIsDiffModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Practice Questions</span>
            </button>

            {topic.subtopics[0]?.lessons?.[0] && (
              <Link
                to={`/learn/${topic.subtopics[0].lessons[0].id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-xs transition-all"
              >
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span>Start Learning Lessons</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Available Subtopics and Lessons */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Available Subtopics & Lessons</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Read step-by-step principles and test your understanding with quick checks.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {topic.subtopics.length} subtopics
          </span>
        </div>

        <div className="space-y-4">
          {topic.subtopics.map((subtopic, index) => (
            <div
              key={subtopic.id}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600">
                      Module {index + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {subtopic.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {subtopic.description}
                  </p>
                </div>
              </div>

              {/* Lessons within subtopic */}
              {subtopic.lessons && subtopic.lessons.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {subtopic.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/learn/${lesson.id}`}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                            {lesson.title}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Worked example • Mental shortcut • Quick check
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Lessons coming soon for this subtopic.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Selection Modal */}
      <DifficultyModal
        isOpen={isDiffModalOpen}
        topicTitle={topic.title}
        onSelectDifficulty={handleDifficultySelected}
        onClose={() => setIsDiffModalOpen(false)}
      />
    </div>
  );
};
