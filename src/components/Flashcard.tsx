import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Bookmark, BookmarkCheck, RotateCw, CheckCircle2, RefreshCw, HelpCircle, BookOpen, Sparkles } from 'lucide-react';
import { VocabularyItem, CardDirection } from '../types';
import { ItemIllustration } from './illustrations';
import { speakArabic, speakBangla } from '../utils/audio';

interface FlashcardProps {
  item: VocabularyItem;
  direction: CardDirection;
  isBookmarked: boolean;
  isMastered: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleMastered: (id: string) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  item,
  direction,
  isBookmarked,
  isMastered,
  onToggleBookmark,
  onToggleMastered,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const backScrollRef = useRef<HTMLDivElement>(null);

  // Reset flip state and scroll when card changes or flips
  useEffect(() => {
    setIsFlipped(false);
    if (backScrollRef.current) {
      backScrollRef.current.scrollTop = 0;
    }
  }, [item.id, direction]);

  useEffect(() => {
    if (backScrollRef.current) {
      backScrollRef.current.scrollTop = 0;
    }
  }, [isFlipped]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto perspective-1000 select-none">
      <div
        id={`flashcard-${item.id}`}
        onClick={handleFlip}
        className={`relative w-full min-h-[470px] h-[520px] sm:h-[600px] cursor-pointer rounded-2xl sm:rounded-3xl transition-transform duration-500 transform-style-3d shadow-xl border border-stone-200/80 bg-white ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT OF THE CARD */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between backface-hidden bg-gradient-to-b from-white to-stone-50/80 transition-all ${
            isFlipped ? 'pointer-events-none z-0' : 'pointer-events-auto z-10'
          }`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 font-bengali">
                {item.lesson || 'পাঠ'}
              </span>
              {direction === 'photo' ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bengali">
                  ছবি কার্ড
                </span>
              ) : item.gender ? (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  item.gender === 'feminine' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                } font-bengali`}>
                  {item.gender === 'feminine' ? 'স্ত্রীবাচক' : 'পুরুষবাচক'}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                id={`btn-bookmark-front-${item.id}`}
                onClick={() => onToggleBookmark(item.id)}
                className={`p-2 sm:p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-colors ${
                  isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                }`}
                title={isBookmarked ? 'প্রিয় তালিকা থেকে সরান' : 'প্রিয় তালিকায় রাখুন'}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-amber-400" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Card Body - Varies by Direction */}
          <div className="my-auto flex flex-col items-center justify-center text-center px-2 sm:px-4 py-2">
            {direction === 'photo' && (
              <div className="flex flex-col items-center gap-2.5 sm:gap-4 py-1 sm:py-2">
                <div className="w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 rounded-2xl sm:rounded-3xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-center p-3 sm:p-5 shadow-sm hover:scale-[1.02] transition-transform">
                  <ItemIllustration name={item.illustrationKey || 'pen'} className="w-full h-full drop-shadow-md" />
                </div>
                <div className="flex flex-col items-center gap-1.5 mt-1 sm:mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold font-bengali border border-emerald-200 text-center">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ছবিটি দেখে এর আরবী ও বাংলা নাম মনে করুন
                  </span>
                  <p className="text-[11px] sm:text-xs text-stone-400 font-bengali mt-0.5 sm:mt-1">
                    কার্ডটি উল্টে আরবী নাম, বড় উদাহরণ বাক্য ও বইয়ের নিচের বাক্যসমূহ দেখুন
                  </p>
                </div>
              </div>
            )}

            {direction === 'bn_to_ar' && (
              <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                <span className="text-xs uppercase tracking-wider text-emerald-700 font-semibold px-3 py-1 bg-emerald-50 rounded-full font-bengali">
                  বাংলা অর্থ
                </span>
                <h3 className="text-2xl sm:text-4xl font-bold text-stone-800 font-bengali leading-tight px-2">
                  {item.bangla}
                </h3>
                {item.hasIllustration && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 opacity-40 mt-1 sm:mt-2">
                    <ItemIllustration name={item.illustrationKey || 'pen'} className="w-full h-full" />
                  </div>
                )}
                <p className="text-xs sm:text-sm text-stone-400 mt-1 sm:mt-2 font-bengali">
                  আরবী শব্দ ও বাক্য প্রয়োগ দেখতে উল্টাতে চাপুন
                </p>
              </div>
            )}

            {direction === 'ar_to_bn' && (
              <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                <span className="text-xs uppercase tracking-wider text-amber-700 font-semibold px-3 py-1 bg-amber-50 rounded-full font-bengali">
                  الكلمة العربية
                </span>
                <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-emerald-950 font-arabic dir-rtl leading-relaxed my-1 sm:my-2 px-2">
                  {item.arabic}
                </h2>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    id={`btn-speech-ar-front-${item.id}`}
                    onClick={() => speakArabic(item.arabicClean)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-medium hover:bg-emerald-700 transition shadow-sm min-h-[40px]"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>উচ্চারণ শুনুন</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 font-bengali">
                  বাংলা অর্থ ও বাক্য প্রয়োগ দেখতে কার্ডে চাপুন
                </p>
              </div>
            )}
          </div>

          {/* Bottom Flip Hint */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-stone-100 text-xs text-stone-400">
            <span className="font-bengali">ক্লিক করে উল্টান</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium font-bengali">
              <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
              ফ্লিপ করুন
            </span>
          </div>
        </div>

        {/* BACK OF THE CARD */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between rotate-y-180 backface-hidden bg-gradient-to-b from-stone-900 to-stone-950 text-stone-100 border border-stone-800 shadow-2xl transition-all ${
            isFlipped ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'
          }`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-800/80 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bengali border border-emerald-500/30">
                ফলাফল ও বিশ্লেষণ
              </span>
              {item.gender && (
                <span className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  item.gender === 'feminine' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                } font-bengali`}>
                  {item.gender === 'feminine' ? 'স্ত্রীবাচক' : 'পুরুষবাচক'}
                </span>
              )}
            </div>
            <button
              id={`btn-bookmark-back-${item.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.id);
              }}
              className={`p-2 rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors ${
                isBookmarked ? 'text-amber-400 bg-amber-950/40' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-amber-400" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>

          {/* Main Content - Scrollable for complete reading */}
          <div
            ref={backScrollRef}
            className={`flex-1 px-1 sm:px-2 py-2 space-y-3 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent overscroll-contain ${
              isFlipped ? 'overflow-y-auto pointer-events-auto' : 'overflow-hidden pointer-events-none'
            }`}
          >
            {/* Top Identity Header */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-1">
              {item.hasIllustration && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-stone-800 p-1 sm:p-1.5 border border-stone-700 flex items-center justify-center shrink-0 shadow-inner">
                  <ItemIllustration name={item.illustrationKey || 'pen'} className="w-full h-full drop-shadow-sm" />
                </div>
              )}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-amber-300 font-arabic dir-rtl leading-relaxed">
                    {item.arabic}
                  </h2>
                  <button
                    id={`btn-speech-ar-back-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakArabic(item.arabicClean);
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition shadow shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="আরবী উচ্চারণ শুনুন"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {item.banglaTranslit && (
                  <div className="text-[11px] sm:text-xs text-stone-400 font-bengali">
                    উচ্চারণ: <span className="text-stone-200 font-medium">{item.banglaTranslit}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bangla & English Meaning */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xl sm:text-3xl font-bold text-white font-bengali">
                  {item.bangla}
                </h3>
                <button
                  id={`btn-speech-bn-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakBangla(item.bangla);
                  }}
                  className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                  title="বাংলা শুনুন"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-stone-400 font-sans tracking-wide mt-0.5">
                {item.english}
              </p>
            </div>

            {/* LARGER EXAMPLE SENTENCE */}
            {item.exampleSentenceAr && (
              <div className="w-full bg-gradient-to-br from-stone-800/90 to-stone-900/90 rounded-2xl p-3.5 sm:p-5 border border-emerald-500/40 shadow-lg text-right">
                <div className="flex items-center justify-between border-b border-stone-700/60 pb-1.5 sm:pb-2 mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 font-bengali flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    উদাহরণ বাক্য (এসো আরবী শিখি)
                  </span>
                  <button
                    id={`btn-speech-example-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakArabic(item.exampleSentenceAr || '');
                    }}
                    className="p-1 sm:p-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white transition flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 text-[11px] font-bengali shadow min-h-[32px]"
                    title="উদাহরণ বাক্যটি শুনুন"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">বাক্য</span> শুনুন
                  </button>
                </div>

                {/* Significantly Larger Arabic Sentence */}
                <div className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-200 font-arabic dir-rtl leading-loose tracking-wide py-1">
                  {item.exampleSentenceAr}
                </div>

                {/* Clear Bangla Translation */}
                {item.exampleSentenceBn && (
                  <div className="text-xs sm:text-base text-emerald-100 font-bengali text-left mt-1.5 sm:mt-2 font-medium leading-relaxed bg-emerald-950/40 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-800/40">
                    অর্থ: {item.exampleSentenceBn}
                  </div>
                )}
              </div>
            )}

            {/* PASSAGE SENTENCES BREAKDOWN */}
            {item.passageSentences && item.passageSentences.length > 0 && (
              <div className="w-full bg-stone-900/95 rounded-2xl p-3 sm:p-4 border border-amber-500/30 text-left shadow-md">
                <div className="text-xs sm:text-sm font-bold text-amber-400 font-bengali mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                    অনুচ্ছেদের বাক্যসমূহ ও পূর্ণাঙ্গ অনুবাদ
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400 font-normal">
                    {item.passageSentences.length}টি বাক্য
                  </span>
                </div>
                <div className="space-y-2">
                  {item.passageSentences.map((sent, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-stone-800/80 hover:bg-stone-800 rounded-xl p-2.5 sm:p-3 border border-stone-700/60 flex items-center justify-between gap-2.5 sm:gap-3 transition"
                    >
                      <div className="flex-1 text-right">
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold text-amber-200 font-arabic dir-rtl leading-snug">
                          {sent.arabic}
                        </div>
                        <div className="text-xs sm:text-sm text-emerald-200 font-bengali text-left mt-1">
                          {sent.bangla}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakArabic(sent.arabic);
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-emerald-800/70 hover:bg-emerald-600 text-white transition shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center"
                        title="এই বাক্যটি শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WORDS & PHRASES UNDERNEATH FROM THE BOOK */}
            {item.bookPhrases && item.bookPhrases.length > 0 && (
              <div className="w-full bg-stone-900/95 rounded-2xl p-3 sm:p-4 border border-amber-500/30 text-left shadow-md">
                <div className="text-xs sm:text-sm font-bold text-amber-400 font-bengali mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                    বইয়ের নিচের শব্দ ও বাক্যসমূহ (প্রয়োগবিধি)
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400 font-normal hidden xs:inline">বইয়ের হুবহু বাক্য</span>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {item.bookPhrases.map((phrase, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-stone-800/80 hover:bg-stone-800 rounded-xl p-2.5 sm:p-3 border border-stone-700/60 flex items-center justify-between gap-2.5 sm:gap-3 transition"
                    >
                      <div className="flex-1 text-right">
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold text-amber-200 font-arabic dir-rtl leading-snug">
                          {phrase.arabic}
                        </div>
                        <div className="text-xs sm:text-sm text-stone-200 font-bengali text-left mt-0.5 sm:mt-1">
                          {phrase.bangla}
                        </div>
                        {phrase.translit && (
                          <div className="text-[10px] sm:text-[11px] text-stone-400 font-bengali text-left mt-0.5">
                            উচ্চারণ: {phrase.translit}
                          </div>
                        )}
                      </div>
                      <button
                        id={`btn-speech-phrase-${item.id}-${pIdx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakArabic(phrase.arabic);
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-emerald-800/70 hover:bg-emerald-600 text-white transition shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center"
                        title="এই বাক্যটি শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-stone-800 text-xs shrink-0 gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              id={`btn-mastered-${item.id}`}
              onClick={() => onToggleMastered(item.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl font-bengali font-medium transition min-h-[38px] text-[11px] sm:text-xs ${
                isMastered
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              {isMastered ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <RefreshCw className="w-4 h-4 shrink-0" />}
              <span>{isMastered ? 'মুখস্থ হয়েছে' : 'মুখস্থ সম্পন্ন মার্ক করুন'}</span>
            </button>

            <button 
              type="button"
              className="text-stone-400 hover:text-stone-200 font-bengali flex items-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-stone-800 min-h-[38px]" 
              onClick={handleFlip}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>সামনে ফিরুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
