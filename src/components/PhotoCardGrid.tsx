import React, { useState } from 'react';
import { Volume2, Bookmark, BookmarkCheck, RotateCw, Sparkles, ExternalLink, Undo2 } from 'lucide-react';
import { VocabularyItem } from '../types';
import { ItemIllustration } from './illustrations';
import { speakArabic, speakBangla } from '../utils/audio';

interface PhotoCardGridProps {
  items: VocabularyItem[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onSelectCard: (item: VocabularyItem) => void;
}

export const PhotoCardGrid: React.FC<PhotoCardGridProps> = ({
  items,
  bookmarks,
  onToggleBookmark,
  onSelectCard,
}) => {
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const photoItems = items.filter((item) => item.hasIllustration);

  const toggleFlip = (id: string) => {
    setFlippedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const flipAll = () => {
    if (flippedIds.length === photoItems.length) {
      setFlippedIds([]);
    } else {
      setFlippedIds(photoItems.map((i) => i.id));
    }
  };

  if (photoItems.length === 0) {
    return (
      <div className="p-12 text-center text-stone-500 font-bengali bg-white rounded-2xl border border-stone-200 shadow-xs my-6">
        <Sparkles className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="font-semibold text-stone-700">এই অধ্যায়ে কোনো চিত্রযুক্ত শব্দ নেই।</p>
        <p className="text-xs text-stone-400 mt-1">অনুগ্রহ করে অন্য কোনো অধ্যায় বা সকল অধ্যায় নির্বাচন করুন।</p>
      </div>
    );
  }

  const allFlipped = flippedIds.length === photoItems.length && photoItems.length > 0;

  return (
    <div className="space-y-4">
      {/* Top Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 bg-amber-50/60 border border-amber-200/60 rounded-xl px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100/90 text-amber-900 text-xs font-semibold font-bengali">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            সচিত্র ক্যাটালগ
          </span>
          <span className="text-xs text-stone-600 font-bengali">
            মোট <strong>{photoItems.length}</strong> টি চিত্রযুক্ত উপকরণ (উল্টানো: {flippedIds.length}/{photoItems.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-flip-all-gallery"
            onClick={flipAll}
            className="px-3 py-1.5 rounded-lg text-xs font-bengali font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition shadow-2xs flex items-center gap-1.5"
          >
            {allFlipped ? <Undo2 className="w-3.5 h-3.5 text-stone-600" /> : <RotateCw className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{allFlipped ? 'সব কার্ড ঢেকে দিন' : 'একসাথে সব নাম দেখুন'}</span>
          </button>
        </div>
      </div>

      {/* Grid of 3D Flippable Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photoItems.map((item) => {
          const isFlipped = flippedIds.includes(item.id);
          const isBookmarked = bookmarks.includes(item.id);

          return (
            <div
              key={item.id}
              className="h-64 sm:h-72 perspective-1000 select-none cursor-pointer"
              onClick={() => toggleFlip(item.id)}
            >
              <div
                id={`photo-card-${item.id}`}
                className={`relative w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d shadow-sm hover:shadow-md border border-stone-200 ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT: IMAGE ONLY (NO NAMES) */}
                <div className="absolute inset-0 w-full h-full rounded-2xl p-3 sm:p-4 flex flex-col justify-between backface-hidden bg-white">
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bengali border border-stone-200/60">
                      {item.lesson || 'পাঠ'}
                    </span>
                    <button
                      id={`btn-bookmark-grid-front-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(item.id);
                      }}
                      className={`p-1.5 rounded-full transition ${
                        isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                      }`}
                      title={isBookmarked ? 'প্রিয় তালিকা থেকে সরান' : 'প্রিয় তালিকায় রাখুন'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Centered Large Illustration */}
                  <div className="my-auto flex flex-col items-center justify-center p-2">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-2 rounded-2xl bg-amber-50/50 group-hover:scale-105 transition">
                      <ItemIllustration name={item.illustrationKey || 'pen'} className="w-full h-full drop-shadow-sm" />
                    </div>
                  </div>

                  {/* Bottom Prompt - No Name */}
                  <div className="w-full pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-bengali">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      নাম দেখতে চাপুন
                    </span>
                    <span className="text-stone-400">উল্টান</span>
                  </div>
                </div>

                {/* BACK: ARABIC & BANGLA NAME (SHOWN ONLY WHEN FLIPPED) */}
                <div className="absolute inset-0 w-full h-full rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between rotate-y-180 backface-hidden bg-gradient-to-b from-stone-900 to-stone-950 text-stone-100 border border-stone-800">
                  {/* Top Bar on Back */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bengali">
                      {item.category === 'food' ? 'খাদ্যদ্রব্য' : item.category === 'nature' ? 'প্রকৃতি' : item.category === 'animal' ? 'প্রাণী' : 'উপকরণ'}
                    </span>
                    <button
                      id={`btn-bookmark-grid-back-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(item.id);
                      }}
                      className={`p-1 rounded-full transition ${
                        isBookmarked ? 'text-amber-400 bg-amber-950/40' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5 fill-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Center Content on Back */}
                  <div className="my-auto flex flex-col items-center justify-center text-center space-y-1 py-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <h4 className="text-2xl sm:text-3xl font-bold text-amber-300 font-arabic dir-rtl leading-snug">
                        {item.arabic}
                      </h4>
                      <button
                        id={`btn-speech-grid-back-${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakArabic(item.arabicClean);
                        }}
                        className="p-1 rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white transition"
                        title="আরবী উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.banglaTranslit && (
                      <div className="text-[11px] text-stone-400 font-bengali">
                        ({item.banglaTranslit})
                      </div>
                    )}

                    <div className="text-sm font-bold text-stone-100 font-bengali mt-0.5">
                      {item.bangla}
                    </div>

                    <div className="text-[10px] text-stone-400 font-sans tracking-wide">
                      {item.english}
                    </div>
                  </div>

                  {/* Bottom Action on Back */}
                  <div className="w-full pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] font-bengali">
                    <span className="text-stone-400 hover:text-stone-200 flex items-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      সামনে
                    </span>
                    <button
                      id={`btn-open-modal-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCard(item);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      title="পূর্ণ বিবরণ ও বিস্তারিত দেখুন"
                    >
                      <span>বিস্তারিত</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

