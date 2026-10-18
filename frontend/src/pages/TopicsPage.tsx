import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter } from 'lucide-react';
import { Topic, Difficulty } from '../types';
import { api } from '../services/api';
import { TopicCard } from '../components/TopicCard';
import { DifficultyModal } from '../components/DifficultyModal';

export const TopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getTopics()
      .then((data) => setTopics(data))
      .catch((err) => console.error('Error loading topics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePracticeClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDiffModalOpen(true);
  };

  const handleDifficultySelected = (diff: Difficulty) => {
    setIsDiffModalOpen(false);
    if (selectedTopic) {
      navigate(`/practice?topicId=${selectedTopic.id}&difficulty=${diff}`);
    }
  };

  const filteredTopics = topics.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.subtopics?.some((s) => s.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Curriculum Taxonomy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Explore Everyday Maths Topics
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Choose from all 11 core categories. Each category features interactive lessons, worked step-by-step examples, and deterministic practice questions.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics (e.g. discounts, EMI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Grid of Topics */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-600 font-bold text-base">No topics found matching "{searchQuery}"</p>
          <p className="text-slate-400 text-xs mt-1">Try searching for keywords like "budget", "mileage", "tax", or "ratios".</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onPracticeClick={handlePracticeClick}
            />
          ))}
        </div>
      )}

      {/* Difficulty Selection Modal */}
      <DifficultyModal
        isOpen={isDiffModalOpen}
        topicTitle={selectedTopic?.title || 'Selected Topic'}
        onSelectDifficulty={handleDifficultySelected}
        onClose={() => setIsDiffModalOpen(false)}
      />
    </div>
  );
};
