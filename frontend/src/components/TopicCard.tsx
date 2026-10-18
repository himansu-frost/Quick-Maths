import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Percent,
  UtensilsCrossed,
  CookingPot,
  Landmark,
  Car,
  Clock,
  Activity,
  Paintbrush,
  Receipt,
  Scale,
  ArrowRight,
  BookOpen,
  Play,
} from 'lucide-react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onPracticeClick: (topic: Topic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onPracticeClick }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Wallet':
        return <Wallet className="h-6 w-6 text-emerald-600" />;
      case 'Percent':
        return <Percent className="h-6 w-6 text-teal-600" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="h-6 w-6 text-amber-600" />;
      case 'CookingPot':
        return <CookingPot className="h-6 w-6 text-orange-600" />;
      case 'Landmark':
        return <Landmark className="h-6 w-6 text-indigo-600" />;
      case 'Car':
        return <Car className="h-6 w-6 text-blue-600" />;
      case 'Clock':
        return <Clock className="h-6 w-6 text-purple-600" />;
      case 'Activity':
        return <Activity className="h-6 w-6 text-rose-600" />;
      case 'Paintbrush':
        return <Paintbrush className="h-6 w-6 text-pink-600" />;
      case 'Receipt':
        return <Receipt className="h-6 w-6 text-cyan-600" />;
      case 'Scale':
        return <Scale className="h-6 w-6 text-emerald-700" />;
      default:
        return <BookOpen className="h-6 w-6 text-emerald-600" />;
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200">
      <div>
        {/* Card Header with Icon & Subtopics badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 group-hover:bg-emerald-50 transition-all">
            {getIcon(topic.icon)}
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100/70 group-hover:text-emerald-800 transition-colors">
            {topic.subtopics?.length || 1} subtopics
          </span>
        </div>

        {/* Title & Description */}
        <Link to={`/topic/${topic.id}`} className="block">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {topic.title}
          </h3>
          <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
            {topic.description}
          </p>
        </Link>
      </div>

      {/* Action Buttons: Learn & Practice */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/topic/${topic.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
          <span>Learn</span>
        </Link>
        <button
          onClick={() => onPracticeClick(topic)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors"
        >
          <Play className="h-3.5 w-3.5 fill-white" />
          <span>Practice</span>
        </button>
      </div>
    </div>
  );
};
