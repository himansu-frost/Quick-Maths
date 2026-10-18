import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Lesson, Difficulty } from '../types';
import { DifficultyModal } from '../components/DifficultyModal';

export const LearnPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetch(`/api/topics/lesson/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Lesson not found');
          return res.json();
        })
        .then((data) => {
          setLesson(data.lesson);
          setSelectedOption(null);
          setIsChecked(false);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-10 w-3/4 bg-slate-200 rounded" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Lesson Not Found</h2>
        <Link
          to="/topics"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Topics</span>
        </Link>
      </div>
    );
  }

  const quickOptions: string[] = lesson.quickCheckOptions
    ? JSON.parse(lesson.quickCheckOptions)
    : [];

  const handleDifficultySelected = (diff: Difficulty) => {
    setIsDiffModalOpen(false);
    navigate(`/practice?topicId=${lesson.subtopic?.topicId}&difficulty=${diff}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      {/* Back Link */}
      <Link
        to={`/topic/${lesson.subtopic?.topicId}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to {lesson.subtopic?.topic?.title || 'Topic'}</span>
      </Link>

      {/* Lesson Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            {lesson.subtopic?.title}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
          {lesson.title}
        </h1>
      </div>

      {/* 1. CONCEPT EXPLANATION */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          1. The Principle
        </h3>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
          {lesson.concept}
        </p>

        {/* FORMULA HIGHLIGHT BOX */}
        {lesson.formula && (
          <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase mb-1">
              Key Formula
            </span>
            {lesson.formula}
          </div>
        )}
      </div>

      {/* 2. WORKED EXAMPLE & STEP-BY-STEP SOLUTION */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          2. Worked Example
        </h3>
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-900 font-semibold text-sm">
          {lesson.workedExample}
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Step-by-Step Solution
          </h4>
          <div className="text-xs sm:text-sm text-slate-600 space-y-2 whitespace-pre-line leading-relaxed font-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
            {lesson.stepByStepSolution}
          </div>
        </div>
      </div>

      {/* 3. MENTAL SHORTCUT */}
      {lesson.mentalShortcut && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-300/80 p-6 shadow-xs flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <span>Mental Calculation Shortcut</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            </h4>
            <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
              {lesson.mentalShortcut}
            </p>
          </div>
        </div>
      )}

      {/* 4. COMMON MISTAKES */}
      {lesson.commonMistakes && (
        <div className="rounded-2xl bg-rose-50/60 border border-rose-200 p-6 shadow-xs flex items-start gap-4">
          <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
              Common Pitfall to Avoid
            </h4>
            <p className="text-xs sm:text-sm text-rose-900 mt-1 leading-relaxed">
              {lesson.commonMistakes}
            </p>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE KNOWLEDGE CHECK */}
      {lesson.quickCheckQuestion && quickOptions.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Knowledge Check
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              1 Question
            </span>
          </div>

          <p className="text-sm font-bold text-slate-900">
            {lesson.quickCheckQuestion}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {quickOptions.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt === lesson.quickCheckAnswer;

              let style = 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50 text-slate-800';
              if (isChecked) {
                if (isCorrectAnswer) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                } else if (isSelected && !isCorrectAnswer) {
                  style = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                } else {
                  style = 'border-slate-200 opacity-60 text-slate-400';
                }
              } else if (isSelected) {
                style = 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold';
              }

              return (
                <button
                  key={opt}
                  disabled={isChecked}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between">
            {!isChecked ? (
              <button
                disabled={!selectedOption}
                onClick={() => setIsChecked(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-40 transition-all"
              >
                Check Answer
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {selectedOption === lesson.quickCheckAnswer ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Correct! You understand the concept.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                    <XCircle className="h-4 w-4" />
                    <span>Correct answer is: {lesson.quickCheckAnswer}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER ACTION */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          to={`/topic/${lesson.subtopic?.topicId}`}
          className="text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          Return to Subtopics
        </Link>
        <button
          onClick={() => setIsDiffModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>Practice This Concept</span>
        </button>
      </div>

      {/* Difficulty Selection Modal */}
      <DifficultyModal
        isOpen={isDiffModalOpen}
        topicTitle={lesson.subtopic?.topic?.title || 'Practice'}
        onSelectDifficulty={handleDifficultySelected}
        onClose={() => setIsDiffModalOpen(false)}
      />
    </div>
  );
};
