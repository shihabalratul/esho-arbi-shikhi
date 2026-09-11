import { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  X,
  Layers,
  GraduationCap,
  Bookmark,
} from 'lucide-react';
import { SentenceItem } from '../types';
import { sentencesData } from '../data/sentencesData';
import { speakArabic, speakBangla } from '../utils/audio';

interface SentenceSectionProps {
  onPutCardInRoom?: (sentence: SentenceItem) => void;
}

export function SentenceSection({ onPutCardInRoom: _onPutCardInRoom }: SentenceSectionProps) {
  // Tabs: 'all' | 'book' | 'derived'
  const [activeTab, setActiveTab] = useState<'all' | 'book' | 'derived'>('book');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hideAllMeanings, setHideAllMeanings] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bookmarks for sentences stored in localStorage
  const [bookmarkedSentenceIds, setBookmarkedSentenceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('esho_arabi_sentence_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSentenceBookmark = (id: string) => {
    setBookmarkedSentenceIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('esho_arabi_sentence_bookmarks', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Counts
  const countBook = useMemo(
    () => sentencesData.filter((s) => s.source === 'book').length,
    []
  );
  const countDerived = useMemo(
    () => sentencesData.filter((s) => s.source === 'derived').length,
    []
  );

  // Extract categories for the current tab
  const availableCategories = useMemo(() => {
    const list = activeTab === 'all'
      ? sentencesData
      : sentencesData.filter((s) => s.source === activeTab);
    const set = new Set<string>();
    list.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [activeTab]);

  // Filter sentences
  const filteredSentences = useMemo(() => {
    return sentencesData.filter((item) => {
      // Tab filter
      if (activeTab !== 'all' && item.source !== activeTab) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAr = item.arabic.includes(q) || item.arabicClean.includes(q);
        const matchesBn = item.bangla.toLowerCase().includes(q);
        const matchesTranslit = item.banglaTranslit?.toLowerCase().includes(q);
        const matchesNote = item.grammarNote?.toLowerCase().includes(q);
        const matchesLesson = item.lessonName?.toLowerCase().includes(q);
        const matchesBookWords = item.bookWordsUsed?.some(
          (w) => w.wordAr.includes(q) || w.wordBn.toLowerCase().includes(q)
        );

        if (!matchesAr && !matchesBn && !matchesTranslit && !matchesNote && !matchesLesson && !matchesBookWords) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, selectedCategory, searchQuery]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (sentence: SentenceItem) => {
    navigator.clipboard.writeText(`${sentence.arabic}\n${sentence.bangla}`);
    setCopiedId(sentence.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* SECTION HEADER */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-900 text-xs font-bold font-bengali">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>বাক্য ও বাক্যগঠন বিভাগ (جُمَلٌ وَتَرَاكِيبُ)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-bengali tracking-tight">
              আরবী বাক্য ও প্রয়োগ অনুশীলন
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-bengali max-w-2xl leading-relaxed">
              "এসো আরবী শিখি" কিতাবের মূল বাক্য এবং কিতাবের শব্দভাণ্ডার দিয়ে গঠিত নতুন বাস্তবিক বাক্যসমূহ। প্রতিটি বাক্যের উচ্চারণ, ব্যাকরণগত বিশ্লেষণ ও শব্দভিত্তিক রূপরেখা।
            </p>
          </div>

          {/* Quick Practice Mode Action */}
          <div className="flex items-center gap-2 sm:self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setHideAllMeanings(!hideAllMeanings);
                setRevealedIds(new Set());
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold font-bengali flex items-center gap-2 transition border ${
                hideAllMeanings
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              {hideAllMeanings ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>অনুবাদ প্রকাশ করুন</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>পরীক্ষা মোড (অর্থ লুকান)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PRIMARY DIVISION TABS */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-stone-100/90 rounded-2xl border border-stone-200/70">
            {/* TAB 1: কিতাবের মূল বাক্য */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('book');
                setSelectedCategory('all');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali transition ${
                activeTab === 'book'
                  ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300/60'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>কিতাবের মূল বাক্য</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                {countBook}
              </span>
            </button>

            {/* TAB 2: নতুন অনুশীলনী বাক্য */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('derived');
                setSelectedCategory('all');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali transition ${
                activeTab === 'derived'
                  ? 'bg-white text-amber-950 shadow-xs border border-amber-300/60'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>নতুন অনুশীলনী বাক্য</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                {countDerived}
              </span>
            </button>

            {/* TAB 3: সকল বাক্য */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSelectedCategory('all');
              }}
              className={`hidden md:flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold font-bengali transition ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-300'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>সকল বাক্য</span>
              <span className="text-[11px] font-bold text-stone-400">
                ({countBook + countDerived})
              </span>
            </button>
          </div>

          {/* Division Explanation Badge */}
          <div className="text-xs font-bengali text-stone-500 text-left sm:text-right">
            {activeTab === 'book' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                "এসো আরবী শিখি" পাঠ্যবই থেকে সংকলিত বিশুদ্ধ বাক্য
              </span>
            )}
            {activeTab === 'derived' && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                বইয়ের শব্দসমূহ দিয়ে গঠিত বাস্তবমুখী নতুন বাক্য
              </span>
            )}
            {activeTab === 'all' && (
              <span className="text-stone-500">
                সকল ধরণের মূল ও অনুশীলনী বাক্য একসাথে দেখানো হচ্ছে
              </span>
            )}
          </div>
        </div>

        {/* SEARCH & CATEGORY BAR */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বাক্য খুঁজুন (আরবী / বাংলা / পাঠের নাম / শব্দ)..."
              className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-200">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bengali whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-stone-800 text-white font-bold shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              সকল বিভাগ
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bengali whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? activeTab === 'derived'
                      ? 'bg-amber-700 text-white font-bold shadow-xs'
                      : 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SENTENCE CARDS LIST */}
      <div className="space-y-4">
        {filteredSentences.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold font-bengali text-stone-700">
              কোনো বাক্য খুঁজে পাওয়া যায়নি
            </h3>
            <p className="text-xs font-bengali text-stone-400 mt-1">
              অনুসন্ধান শব্দ পরিবর্তন করুন অথবা অন্য বিভাগে দেখুন।
            </p>
          </div>
        ) : (
          filteredSentences.map((sentence, index) => {
            const isBookmarked = bookmarkedSentenceIds.includes(sentence.id);
            const isRevealed =
              !hideAllMeanings || revealedIds.has(sentence.id);

            return (
              <div
                key={sentence.id}
                id={`sentence-card-${sentence.id}`}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                  sentence.source === 'book'
                    ? 'border-emerald-200/90 hover:border-emerald-300'
                    : 'border-amber-200/90 hover:border-amber-300'
                }`}
              >
                {/* CARD TOP INFO BAR */}
                <div
                  className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-bengali ${
                    sentence.source === 'book'
                      ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                      : 'bg-amber-50/50 border-amber-100 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Source Badge */}
                    {sentence.source === 'book' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-700 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        <BookOpen className="w-3 h-3" />
                        কিতাবের মূল বাক্য
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        নতুন অনুশীলনী বাক্য
                      </span>
                    )}

                    {/* Lesson / Source Detail */}
                    {sentence.lessonName && (
                      <span className="text-stone-600 font-medium">
                        {sentence.lessonName}
                      </span>
                    )}

                    {/* Grammar Note Badge */}
                    {sentence.grammarNote && (
                      <span className="hidden sm:inline-block bg-white/90 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-md text-[11px]">
                        {sentence.grammarNote}
                      </span>
                    )}
                  </div>

                  {/* Actions (Bookmark, Copy, Number) */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[11px] text-stone-400 font-mono mr-1">
                      #{index + 1}
                    </span>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(sentence)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                      title="বাক্যটি কপি করুন"
                    >
                      {copiedId === sentence.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={() => toggleSentenceBookmark(sentence.id)}
                      className={`p-1.5 rounded-lg transition min-w-[32px] min-h-[32px] flex items-center justify-center ${
                        isBookmarked
                          ? 'text-amber-600 bg-amber-100/80 hover:bg-amber-200'
                          : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                      }`}
                      title={isBookmarked ? 'বুকমার্ক থেকে মুছুন' : 'বুকমার্ক করুন'}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          isBookmarked ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* ARABIC TEXT DISPLAY */}
                  <div className="flex items-start justify-between gap-4 flex-row-reverse">
                    <div className="flex-1 text-right">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-arabic text-emerald-950 dir-rtl leading-relaxed">
                        {sentence.arabic}
                      </h3>
                      {sentence.banglaTranslit && (
                        <p className="text-xs text-stone-400 font-bengali text-right mt-1">
                          উচ্চারণ: {sentence.banglaTranslit}
                        </p>
                      )}
                    </div>

                    {/* Arabic Speech Audio Button */}
                    <button
                      type="button"
                      onClick={() => speakArabic(sentence.arabicClean)}
                      className="p-2.5 sm:p-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition shrink-0 min-w-[42px] min-h-[42px] flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
                      title="আরবী উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* BANGLA MEANING & REVEAL SECTION */}
                  <div className="pt-2 border-t border-stone-100">
                    {isRevealed ? (
                      <div className="flex items-start justify-between gap-3 animate-in fade-in duration-150 bg-stone-50/70 p-3 sm:p-4 rounded-2xl border border-stone-200/80">
                        <div className="space-y-1 text-left flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-bengali">
                            বাংলা অর্থ
                          </span>
                          <p className="text-base sm:text-lg font-bold font-bengali text-stone-900 mt-1">
                            {sentence.bangla}
                          </p>
                          {sentence.english && (
                            <p className="text-xs text-stone-400 font-sans italic">
                              {sentence.english}
                            </p>
                          )}
                        </div>

                        {/* Speech for Bangla & Hide Button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => speakBangla(sentence.bangla)}
                            className="p-1.5 rounded-xl bg-stone-200/70 hover:bg-stone-300 text-stone-700 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="বাংলা শুনুন"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          {hideAllMeanings && (
                            <button
                              type="button"
                              onClick={() => toggleReveal(sentence.id)}
                              className="px-2.5 py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bengali font-semibold transition"
                            >
                              লুকান
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bengali text-stone-500 italic">
                          বাংলা অর্থটি অনুশীলনের জন্য গোপন রয়েছে।
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(sentence.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bengali font-bold transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>অর্থ দেখুন</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FOR DERIVED SENTENCES: WORDS USED FROM THE BOOK */}
                  {sentence.bookWordsUsed && sentence.bookWordsUsed.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-100/90 bg-amber-50/40 rounded-2xl p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold font-bengali text-amber-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          এই বাক্যে ব্যবহৃত কিতাবের শব্দসমূহ:
                        </span>
                        <span className="text-[11px] text-amber-700 font-bengali">
                          {sentence.bookWordsUsed.length}টি শব্দ
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {sentence.bookWordsUsed.map((w, wIdx) => (
                          <span
                            key={wIdx}
                            className="inline-flex items-center gap-1 bg-white border border-amber-200/90 px-2.5 py-1 rounded-xl text-xs shadow-2xs"
                          >
                            <span className="font-arabic font-bold text-emerald-900 dir-rtl text-sm">
                              {w.wordAr}
                            </span>
                            <span className="text-stone-300">|</span>
                            <span className="font-bengali text-stone-700 text-[11px]">
                              {w.wordBn}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Grammar note if present */}
                  {sentence.grammarNote && (
                    <div className="sm:hidden text-[11px] font-bengali text-stone-500 bg-stone-50 p-2 rounded-xl">
                      <strong>ব্যাকরণ কাঠামো:</strong> {sentence.grammarNote}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
