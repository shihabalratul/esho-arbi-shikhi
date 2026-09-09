import React, { useState } from 'react';
import { User, Check, Sparkles, X } from 'lucide-react';
import { AVATAR_COLORS, saveStoredUsername, saveStoredAvatarColor } from '../services/username';

interface UsernameModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave: (username: string, avatarColor: string) => void;
  initialUsername?: string;
  initialColor?: string;
  isMandatory?: boolean;
}

const SUGGESTED_NAMES = ['শিক্ষার্থী', 'সাদিক', 'মারুফ', 'আহমেদ', 'আয়েশা', 'ফাতিমা', 'ফারহান', 'জুবায়ের'];

export const UsernameModal: React.FC<UsernameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUsername = '',
  initialColor = AVATAR_COLORS[0],
  isMandatory = false,
}) => {
  const [name, setName] = useState(initialUsername);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setError('অনুগ্রহ করে একটি নাম লিখুন');
      return;
    }
    saveStoredUsername(clean);
    saveStoredAvatarColor(color);
    onSave(clean, color);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {!isMandatory && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md font-bold text-xl"
            style={{ backgroundColor: color }}
          >
            {name.trim() ? name.trim().charAt(0).toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-bengali">
              আপনার নাম নির্ধারণ করুন
            </h2>
            <p className="text-xs text-stone-500 font-bengali">
              কোনো লগইন ছাড়াই এই নামে বন্ধুরা আপনাকে রুমে দেখতে পাবে
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 font-bengali mb-1.5">
              ব্যবহারকারীর নাম (Username)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="যেমন: আহমদ বা সাদিক..."
              maxLength={25}
              autoFocus
              className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bengali text-stone-800 min-h-[44px]"
            />
            {error && <p className="text-xs text-rose-600 font-bengali mt-1">{error}</p>}
          </div>

          {/* Suggested Names */}
          <div>
            <span className="text-[11px] font-medium text-stone-400 font-bengali block mb-1.5">
              দ্রুত নাম বেছে নিতে পারেন:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_NAMES.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setName(sug);
                    if (error) setError('');
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-stone-200 font-bengali transition text-stone-600 min-h-[32px] flex items-center"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 font-bengali mb-1.5">
              অ্যাভাটার রঙ নির্বাচন করুন
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110 shadow-xs shrink-0"
                  style={{ backgroundColor: c }}
                  title="রঙ পরিবর্তন করুন"
                >
                  {color === c && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold font-bengali shadow-md transition flex items-center justify-center gap-2 min-h-[48px] active:scale-95 text-sm sm:text-base"
          >
            <Sparkles className="w-4 h-4" />
            <span>নিশ্চিত করুন ও এগিয়ে যান</span>
          </button>
        </form>
      </div>
    </div>
  );
};
