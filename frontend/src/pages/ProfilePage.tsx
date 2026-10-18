import React from 'react';
import { User as UserIcon, Mail, Calendar, ShieldCheck, LogOut, Sparkles, Target, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { guestStorage } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, isGuest, openAuthModal, logout } = useAuth();
  const guestCount = guestStorage.getSessions().length;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Account & Preferences
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
          {isGuest ? 'Guest Profile' : 'User Profile'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your Quick Maths identity, practice preferences, and account synchronization.
        </p>
      </div>

      {isGuest ? (
        /* GUEST STATE CARD */
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <UserIcon className="h-8 w-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">
              You are practicing in Guest Mode
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Guests can read all lessons and practice questions freely. However, your progress is only saved in your current browser's local storage ({guestCount} session(s) saved).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 max-w-md mx-auto text-left text-xs text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <Sparkles className="h-4 w-4" />
              <span>Benefits of Creating an Account:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-emerald-900 opacity-90 pl-1">
              <li>Sync practice history and accuracy across phone & laptop</li>
              <li>Maintain multi-day calculation streaks</li>
              <li>Automatic safe migration of all your current guest sessions</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
            <button
              onClick={() => openAuthModal('register')}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Create Free Account
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
        /* REGISTERED USER PROFILE */
        <div className="space-y-6">
          {/* User Details Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Target className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-[11px] text-slate-500">Daily Practice Goal</div>
                  <div className="text-sm font-bold text-slate-900">10 Minutes Daily</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-[11px] text-slate-500">Account Status</div>
                  <div className="text-sm font-bold text-slate-900">Synchronized & Verified</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Signed in with secure server session
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
