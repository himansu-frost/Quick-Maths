import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
                Q
              </div>
              <span className="text-base font-bold text-slate-900">
                Quick<span className="text-emerald-600">Maths</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Everyday mathematics learning and practice designed for college students, Gen Z, and everyone looking to calculate with confidence and speed.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Educational Disclaimer:</span> Quick Maths teaches mathematical methods and practical calculation reasoning. Numerical estimates for taxes, loans, EMI, nutrition, or repairs do not replace personalized professional financial, legal, or medical advice.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Learning
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/topics" className="hover:text-emerald-600 transition-colors">
                  All 11 Topics
                </Link>
              </li>
              <li>
                <Link to="/practice?topicId=shopping-discounts" className="hover:text-emerald-600 transition-colors">
                  Discounts & Shopping
                </Link>
              </li>
              <li>
                <Link to="/practice?topicId=budgeting-expense-tracking" className="hover:text-emerald-600 transition-colors">
                  50/30/20 Budgeting
                </Link>
              </li>
              <li>
                <Link to="/practice?topicId=tipping-splitting-bills" className="hover:text-emerald-600 transition-colors">
                  Bill Splitting & Tips
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/progress" className="hover:text-emerald-600 transition-colors">
                  Progress Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-600 transition-colors">
                  Account & Settings
                </Link>
              </li>
              <li>
                <span className="text-slate-400 cursor-not-allowed">
                  Daily Challenge (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Quick Maths. Get better at maths.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built with deterministic mathematics & React + MySQL.
          </p>
        </div>
      </div>
    </footer>
  );
};
