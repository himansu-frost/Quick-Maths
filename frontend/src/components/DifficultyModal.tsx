import React from 'react';
import { X, CheckCircle, Zap, Shield, Flame, Compass } from 'lucide-react';
import { Difficulty } from '../types';

interface DifficultyModalProps {
  isOpen: boolean;
  topicTitle: string;
  onSelectDifficulty: (diff: Difficulty) => void;
  onClose: () => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  topicTitle,
  onSelectDifficulty,
  onClose,
}) => {
  if (!isOpen) return null;

  const options: Array<{
    id: Difficulty;
    name: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'DEFAULT',
      name: 'Default (Balanced)',
      description: 'Standard everyday scenarios with realistic numbers. Recommended starting point (maps to Medium).',
      badge: 'Recommended',
      icon: <Compass className="h-5 w-5 text-emerald-600" />,
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
    {
      id: 'EASY',
      name: 'Easy',
      description: 'Friendly numbers, straightforward single-step operations, and minimal reading load.',
      badge: 'Warmup',
      icon: <Shield className="h-5 w-5 text-sky-600" />,
      color: 'border-sky-300 hover:border-sky-500 bg-white hover:bg-sky-50/30 text-slate-800',
    },
    {
      id: 'MEDIUM',
      name: 'Medium',
      description: 'Common real-life numbers, 2-step practical problems, and typical everyday calculations.',
      badge: 'Standard',
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      color: 'border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/30 text-slate-800',
    },
    {
      id: 'HARD',
      name: 'Hard',
      description: 'Multi-step reasoning, reverse calculations, stacked discounts, and less convenient numbers.',
      badge: 'Challenge',
      icon: <Flame className="h-5 w-5 text-rose-500" />,
      color: 'border-slate-200 hover:border-rose-500 bg-white hover:bg-rose-50/30 text-slate-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-left mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Practice Mode
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Select Practice Difficulty
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Choose how challenging you want your questions for{' '}
            <span className="font-semibold text-slate-800">{topicTitle}</span>.
          </p>
        </div>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectDifficulty(opt.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 ${opt.color} group hover:shadow-sm`}
            >
              <div className="p-2 rounded-lg bg-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                {opt.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                    {opt.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
