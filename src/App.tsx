import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Image as ImageIcon,
  ArrowLeftRight,
  HelpCircle,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Layers,
  Shuffle,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Volume2,
  X,
  Users,
} from 'lucide-react';
import { chapters, bookUnits } from './data/chapters';
import { vocabularyItems } from './data/vocabulary';
import { VocabularyItem, StudyMode, CardDirection } from './types';
import { Flashcard } from './components/Flashcard';
import { Quiz } from './components/Quiz';
import { PhotoCardGrid } from './components/PhotoCardGrid';
import { VocabularyTable } from './components/VocabularyTable';
import { CollaborativeRoom } from './components/CollaborativeRoom';
import { ItemIllustration } from './components/illustrations';
import { speakArabic, speakBangla } from './utils/audio';

export default function App() {
  // Navigation & Filter States
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number | 'all'>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [studyMode, setStudyMode] = useState<StudyMode>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('room')) {
      return 'room';
    }
    return 'flashcards';
  });
  const [cardDirection, setCardDirection] = useState<CardDirection>('photo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyPhotoItems, setOnlyPhotoItems] = useState<boolean>(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [onlyMastered, setOnlyMastered] = useState<boolean>(false);
  const [isMobileChapterPickerOpen, setIsMobileChapterPickerOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  // Lessons available under currently selected unit
  const availableLessons = useMemo(() => {
    if (selectedUnitNumber === 'all') return chapters;
    return chapters.filter((c) => c.unitNumber === selectedUnitNumber);
  }, [selectedUnitNumber]);

  // Defined study modes for responsive navigation
  const studyModesList = useMemo(
    () => [
      {
        id: 'flashcards' as StudyMode,
        direction: 'photo' as CardDirection,
        key: 'photo',
        label: 'ছবিযুক্ত ফ্ল্যাশ কার্ড',
        shortLabel: 'ছবি কার্ড',
        icon: ImageIcon,
      },
      {
        id: 'flashcards' as StudyMode,
        direction: 'bn_to_ar' as CardDirection,
        key: 'bn_to_ar',
        label: 'বাংলা ➔ আরবী',
        shortLabel: 'বাংলা ➔ আরবী',
        icon: ArrowLeftRight,
      },
      {
        id: 'flashcards' as StudyMode,
        direction: 'ar_to_bn' as CardDirection,
        key: 'ar_to_bn',
        label: 'আরবী ➔ বাংলা',
        shortLabel: 'আরবী ➔ বাংলা',
        icon: ArrowLeftRight,
      },
      {
        id: 'photo_gallery' as StudyMode,
        key: 'photo_gallery',
        label: 'ছবি গ্যালারি',
        shortLabel: 'গ্যালারি',
        icon: Sparkles,
        badge: `${vocabularyItems.filter((i) => i.hasIllustration).length}`,
      },
      {
        id: 'quiz' as StudyMode,
        key: 'quiz',
        label: 'অনুশীলন কুইজ',
        shortLabel: 'কুইজ',
        icon: HelpCircle,
      },
      {
        id: 'glossary' as StudyMode,
        key: 'glossary',
        label: 'শব্দকোষ তালিকা',
        shortLabel: 'শব্দকোষ',
        icon: List,
      },
      {
        id: 'room' as StudyMode,
        key: 'room',
        label: 'লাইভ রুম (দ্বৈত অনুশীলন)',
        shortLabel: 'লাইভ রুম',
        icon: Users,
        isLive: true,
      },
    ],
    []
  );

  const isModeActive = useCallback(
    (mode: StudyMode, direction?: CardDirection) => {
      if (mode === 'flashcards') {
        return studyMode === 'flashcards' && cardDirection === direction;
      }
      return studyMode === mode;
    },
    [studyMode, cardDirection]
  );

  const handleSelectMode = useCallback((mode: StudyMode, direction?: CardDirection) => {
    setStudyMode(mode);
    if (direction) {
      setCardDirection(direction);
    }
  }, []);

  const activeModeObj = useMemo(() => {
    return (
      studyModesList.find((m) => isModeActive(m.id, m.direction)) || studyModesList[0]
    );
  }, [studyModesList, isModeActive]);

  // Card browser state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [selectedModalItem, setSelectedModalItem] = useState<VocabularyItem | null>(null);

  // Local Storage Persistence for Bookmarks and Mastered items
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('esho_arabi_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('esho_arabi_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('esho_arabi_bookmarks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('esho_arabi_mastered', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filtered Vocabulary items
  const filteredItems = useMemo(() => {
    return vocabularyItems.filter((item) => {
      // Book Unit filter
      if (selectedUnitNumber !== 'all') {
        const itemChapter = chapters.find((c) => c.id === item.chapterId);
        if (itemChapter && itemChapter.unitNumber !== selectedUnitNumber) {
          return false;
        }
      }
      // Chapter/Lesson filter
      if (selectedChapterId !== 'all' && item.chapterId !== selectedChapterId) {
        return false;
      }
      // Photo-only filter
      if (onlyPhotoItems && !item.hasIllustration) {
        return false;
      }
      // Bookmark filter
      if (onlyBookmarked && !bookmarks.includes(item.id)) {
        return false;
      }
      // Mastered filter
      if (onlyMastered && !masteredIds.includes(item.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesBn = item.bangla.toLowerCase().includes(query);
        const matchesAr = item.arabic.includes(query) || item.arabicClean.includes(query);
        const matchesEn = item.english.toLowerCase().includes(query);
        const matchesTranslit = item.banglaTranslit?.toLowerCase().includes(query);
        if (!matchesBn && !matchesAr && !matchesEn && !matchesTranslit) {
          return false;
        }
      }
      return true;
    });
  }, [selectedUnitNumber, selectedChapterId, onlyPhotoItems, onlyBookmarked, onlyMastered, searchQuery, bookmarks, masteredIds]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredItems.length && filteredItems.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredItems.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (filteredItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  }, [filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (filteredItems.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  }, [filteredItems.length]);

  const handleShuffle = () => {
    if (filteredItems.length === 0) return;
    const randomIdx = Math.floor(Math.random() * filteredItems.length);
    setCurrentIndex(randomIdx);
  };

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isAutoPlaying || filteredItems.length === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, filteredItems.length, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in the search input
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Trigger card flip
        const cardElem = document.getElementById(`flashcard-${filteredItems[currentIndex]?.id}`);
        if (cardElem) cardElem.click();
      } else if (e.key.toLowerCase() === 's' && filteredItems[currentIndex]) {
        speakArabic(filteredItems[currentIndex].arabicClean);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, filteredItems, currentIndex]);

  const currentItem = filteredItems[currentIndex];

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold font-bengali text-emerald-950 leading-tight truncate">
                  এসো আরবী শিখি
                </h1>
                <span className="text-emerald-700 font-arabic text-sm sm:text-base font-normal dir-rtl hidden sm:inline">
                  (الطريق إلى العربية)
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 font-bengali truncate hidden xs:block">
                ছবিসহ ফ্ল্যাশ কার্ড • বাংলা ➔ আরবী • লাইভ রুম অনুশীলন
              </p>
            </div>
          </div>

          {/* Header Actions (Bookmarks, Mastered Filter Badges) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bookmarks Filter */}
            <button
              id="btn-filter-bookmarks"
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border transition text-xs font-bengali ${
                onlyBookmarked
                  ? 'bg-amber-100/90 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
              title="প্রিয় সংরক্ষিত শব্দসমূহ"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
              <span className="hidden sm:inline">প্রিয়</span>
              <span className="text-[11px] px-1 rounded-md bg-amber-200/60 font-bold">{bookmarks.length}</span>
            </button>

            {/* Mastered Filter */}
            <button
              id="btn-filter-mastered"
              onClick={() => setOnlyMastered(!onlyMastered)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border transition text-xs font-bengali ${
                onlyMastered
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
              title="মুখস্থ সম্পন্ন শব্দসমূহ"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">মুখস্থ</span>
              <span className="text-[11px] px-1 rounded-md bg-emerald-200/60 font-bold">{masteredIds.length}</span>
            </button>
          </div>
        </div>

        {/* Primary Mode Tabs (Desktop Only: clean horizontal flex) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-3 sm:px-6 items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2 border-t border-stone-100 touch-pan-x">
          {studyModesList.map((item) => {
            const Icon = item.icon;
            const active = isModeActive(item.id, item.direction);
            return (
              <button
                key={item.key}
                id={`tab-mode-${item.key}`}
                onClick={() => handleSelectMode(item.id, item.direction)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bengali font-semibold whitespace-nowrap transition shrink-0 min-h-[38px] ${
                  active
                    ? item.isLive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-emerald-800 text-white shadow-xs'
                    : item.isLive
                    ? 'text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.isLive ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                ) : item.badge ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      {/* Book Chapter & Lesson Selection Hierarchy (Shown in study modes) */}
      {studyMode !== 'room' && (
        <>
          <nav aria-label="অধ্যায় ও পাঠ ফিল্টার" className="bg-stone-100/90 border-b border-stone-200/90 px-3 sm:px-6 py-2 sm:py-2.5">
            <div className="max-w-7xl mx-auto space-y-2">
              {/* Mobile Compact Single-Line Chapter Selector & Search (< md) */}
              <div className="md:hidden space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    id="btn-open-chapter-picker"
                    onClick={() => setIsMobileChapterPickerOpen(true)}
                    className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bengali text-stone-800 shadow-2xs min-h-[40px] active:bg-stone-50"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-emerald-950 truncate">
                        {selectedUnitNumber === 'all'
                          ? 'বই সমগ্র'
                          : bookUnits.find((u) => u.number === selectedUnitNumber)?.titleBn}
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600 truncate">
                        {selectedChapterId === 'all'
                          ? 'সকল পাঠ'
                          : chapters.find((c) => c.id === selectedChapterId)?.titleBn}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0 ml-1" />
                  </button>

                  <button
                    id="btn-mobile-toggle-search"
                    onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                    className={`p-2 rounded-xl border text-stone-600 transition min-w-[40px] min-h-[40px] flex items-center justify-center ${
                      isMobileSearchOpen || searchQuery
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white border-stone-300'
                    }`}
                    aria-label="শব্দ অনুসন্ধান"
                    title="শব্দ অনুসন্ধান করুন"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Collapsible Mobile Search Input */}
                {(isMobileSearchOpen || searchQuery) && (
                  <div className="relative animate-in slide-in-from-top-1 duration-150">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-vocab-search-mobile"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="শব্দ খুঁজুন (বাংলা / আরবী / ইংরেজি)..."
                      className="w-full pl-9 pr-8 py-2 bg-white border border-emerald-400 rounded-xl text-xs font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Tier 1: 3 Book Units (আল-ওয়াহদাতু ১, ২, ৩) (Visible >= md) */}
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-semibold text-stone-500 font-bengali whitespace-nowrap flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  বইয়ের মূল অধ্যায়:
                </span>
                <button
                  id="unit-filter-all"
                  onClick={() => {
                    setSelectedUnitNumber('all');
                    setSelectedChapterId('all');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bengali whitespace-nowrap transition ${
                    selectedUnitNumber === 'all'
                      ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  বই সমগ্র ({vocabularyItems.length})
                </button>
                {bookUnits.map((u) => {
                  const unitItemCount = vocabularyItems.filter((i) => {
                    const ch = chapters.find((c) => c.id === i.chapterId);
                    return ch?.unitNumber === u.number;
                  }).length;
                  return (
                    <button
                      key={u.id}
                      id={`unit-filter-${u.number}`}
                      onClick={() => {
                        setSelectedUnitNumber(u.number);
                        setSelectedChapterId('all');
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bengali whitespace-nowrap transition flex items-center gap-1.5 ${
                        selectedUnitNumber === u.number
                          ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                          : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                      title={u.descriptionBn}
                    >
                      <span className="font-medium">{u.titleBn}</span>
                      <span className="opacity-75 font-arabic text-[11px] dir-rtl">({u.titleAr})</span>
                      <span className="opacity-80">[{unitItemCount}]</span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop Tier 2: Lessons under currently selected Unit (Visible >= md) */}
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pt-1 border-t border-stone-200/60 scrollbar-none">
                <span className="text-[11px] font-semibold text-stone-400 font-bengali whitespace-nowrap">
                  পাঠসমূহ:
                </span>
                <button
                  id="chapter-filter-all"
                  onClick={() => setSelectedChapterId('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bengali whitespace-nowrap transition ${
                    selectedChapterId === 'all'
                      ? 'bg-stone-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {selectedUnitNumber === 'all' ? 'সকল পাঠ' : 'এই অধ্যায়ের সকল পাঠ'}
                </button>
                {availableLessons.map((ch) => {
                  const count = vocabularyItems.filter((i) => i.chapterId === ch.id).length;
                  return (
                    <button
                      key={ch.id}
                      id={`chapter-filter-${ch.id}`}
                      onClick={() => {
                        setSelectedChapterId(ch.id);
                        if (selectedUnitNumber !== ch.unitNumber) {
                          setSelectedUnitNumber(ch.unitNumber);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bengali whitespace-nowrap transition ${
                        selectedChapterId === ch.id
                          ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                          : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                      title={ch.descriptionBn}
                    >
                      <span>{ch.titleBn}</span>
                      <span className="ml-1 opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Desktop Search & Filter Bar (Visible >= md) */}
          <div className="hidden md:flex max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-vocab-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শব্দ খুঁজুন (বাংলা / আরবী / ইংরেজি)..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-stone-600 font-bengali cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={onlyPhotoItems}
                  onChange={(e) => setOnlyPhotoItems(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>কেবল ছবিযুক্ত শব্দ</span>
              </label>

              <span className="text-xs text-stone-500 font-bengali">
                পাওয়া গেছে: <strong className="text-emerald-800">{filteredItems.length}</strong> টি শব্দ
              </span>
            </div>
          </div>
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 flex-1 pb-24 md:pb-16">
        {/* 1. FLASHCARD MODE */}
        {studyMode === 'flashcards' && (
          <div className="flex flex-col items-center">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-sm max-w-md w-full my-6">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-stone-700 font-bengali">
                  কোনো শব্দ খুঁজে পাওয়া যায়নি
                </h3>
                <p className="text-xs text-stone-400 font-bengali mt-1">
                  ফিল্টার পরিবর্তন করুন অথবা অন্য অধ্যায় বেছে নিন।
                </p>
              </div>
            ) : currentItem ? (
              <div className="w-full max-w-xl sm:max-w-2xl flex flex-col items-center gap-3 sm:gap-4">
                {/* Direction Switcher & Card Count */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 font-bengali px-1">
                  <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl w-full sm:w-auto">
                    <button
                      id="btn-dir-photo"
                      onClick={() => setCardDirection('photo')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bengali font-semibold transition ${
                        cardDirection === 'photo'
                          ? 'bg-white text-emerald-950 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      ছবি কার্ড
                    </button>
                    <button
                      id="btn-dir-bn-to-ar"
                      onClick={() => setCardDirection('bn_to_ar')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bengali font-semibold transition ${
                        cardDirection === 'bn_to_ar'
                          ? 'bg-white text-emerald-950 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      বাংলা ➔ আরবী
                    </button>
                    <button
                      id="btn-dir-ar-to-bn"
                      onClick={() => setCardDirection('ar_to_bn')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bengali font-semibold transition ${
                        cardDirection === 'ar_to_bn'
                          ? 'bg-white text-emerald-950 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      আরবী ➔ বাংলা
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto px-1">
                    <label className="md:hidden flex items-center gap-1 text-[11px] cursor-pointer text-stone-600 select-none">
                      <input
                        type="checkbox"
                        checked={onlyPhotoItems}
                        onChange={(e) => setOnlyPhotoItems(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>কেবল ছবিযুক্ত</span>
                    </label>
                    <span className="font-semibold text-emerald-800 shrink-0">
                      কার্ড {currentIndex + 1} / {filteredItems.length}
                    </span>
                  </div>
                </div>

                {/* The Flashcard */}
                <Flashcard
                  item={currentItem}
                  direction={cardDirection}
                  isBookmarked={bookmarks.includes(currentItem.id)}
                  isMastered={masteredIds.includes(currentItem.id)}
                  onToggleBookmark={toggleBookmark}
                  onToggleMastered={toggleMastered}
                />

                {/* Flashcard Navigation Controls */}
                <div className="w-full flex items-center justify-between gap-2 sm:gap-3 mt-1 sm:mt-2">
                  <button
                    id="btn-card-prev"
                    onClick={handlePrev}
                    className="p-2.5 sm:p-3 min-h-[44px] min-w-[44px] rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 shadow-sm transition flex items-center justify-center gap-1 font-bengali text-xs sm:text-sm font-medium active:scale-95"
                    title="আগের কার্ড (বাম তীর)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden xs:inline">পূর্ববর্তী</span>
                  </button>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      id="btn-card-shuffle"
                      onClick={handleShuffle}
                      className="p-2.5 sm:p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 shadow-sm transition active:scale-95"
                      title="এলোমেলো কার্ড আনুন"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>

                    <button
                      id="btn-card-autoplay"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] rounded-xl border text-xs font-bengali font-semibold transition active:scale-95 ${
                        isAutoPlaying
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                      title="স্বয়ংক্রিয়ভাবে কার্ড পরিবর্তন করুন"
                    >
                      {isAutoPlaying ? 'অটো-প্লে থামান' : 'অটো-প্লে'}
                    </button>
                  </div>

                  <button
                    id="btn-card-next"
                    onClick={handleNext}
                    className="p-2.5 sm:p-3 min-h-[44px] min-w-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition flex items-center justify-center gap-1 font-bengali text-xs sm:text-sm font-medium active:scale-95"
                    title="পরের কার্ড (ডান তীর)"
                  >
                    <span className="hidden xs:inline">পরবর্তী</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Helpful Keyboard Shortcuts Hint */}
                <div className="hidden sm:block text-[11px] text-stone-400 font-bengali text-center mt-2">
                  কীবোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">Space</kbd> উল্টাতে,{' '}
                  <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">←</kbd> /{' '}
                  <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">→</kbd> পরিবর্তন করতে,{' '}
                  <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-stone-700 font-mono">S</kbd> আরবী উচ্চারণ শুনতে
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 2. PHOTO GALLERY MODE */}
        {studyMode === 'photo_gallery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-bengali text-stone-800">
                  চিত্রযুক্ত শিক্ষা সামগ্রী ও বস্তুসমূহ
                </h3>
                <p className="text-xs text-stone-500 font-bengali">
                  বইটিতে উল্লেখিত ছবিযুক্ত সামগ্রীগুলোর চিত্র প্রদর্শনী
                </p>
              </div>
            </div>
            <PhotoCardGrid
              items={filteredItems}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
              onSelectCard={(item) => setSelectedModalItem(item)}
            />
          </div>
        )}

        {/* 3. INTERACTIVE QUIZ MODE */}
        {studyMode === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                id="btn-quiz-dir-bn-ar"
                onClick={() => setCardDirection('bn_to_ar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bengali font-semibold transition ${
                  cardDirection === 'bn_to_ar'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-stone-700 border border-stone-200'
                }`}
              >
                বাংলা ➔ আরবী কুইজ
              </button>
              <button
                id="btn-quiz-dir-ar-bn"
                onClick={() => setCardDirection('ar_to_bn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bengali font-semibold transition ${
                  cardDirection === 'ar_to_bn'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-stone-700 border border-stone-200'
                }`}
              >
                আরবী ➔ বাংলা কুইজ
              </button>
            </div>
            <Quiz
              items={filteredItems}
              direction={cardDirection === 'ar_to_bn' ? 'ar_to_bn' : 'bn_to_ar'}
            />
          </div>
        )}

        {/* 4. GLOSSARY TABLE MODE */}
        {studyMode === 'glossary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-bengali text-stone-800">
                  সম্পূর্ণ আরবী-বাংলা শব্দকোষ ও বাক্যসূচি
                </h3>
                <p className="text-xs text-stone-500 font-bengali">
                  সকল পাঠের শব্দার্থ, উচ্চারণ ও উদাহরণ বাক্য
                </p>
              </div>
            </div>
            <VocabularyTable
              items={filteredItems}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
              onSelectItem={(item) => setSelectedModalItem(item)}
            />
          </div>
        )}

        {/* 5. COLLABORATIVE LIVE ROOM MODE */}
        {studyMode === 'room' && (
          <CollaborativeRoom />
        )}
      </main>

      {/* DETAIL MODAL (When clicked from gallery or table) */}
      {selectedModalItem && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedModalItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-stone-200 flex flex-col items-center text-center relative scrollbar-thin scrollbar-thumb-stone-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="btn-close-modal"
              onClick={() => setSelectedModalItem(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedModalItem.hasIllustration && (
              <div className="w-32 h-32 my-2 p-3 bg-amber-50/70 rounded-3xl border border-amber-100/90 flex items-center justify-center shadow-inner">
                <ItemIllustration name={selectedModalItem.illustrationKey || 'pen'} className="w-full h-full drop-shadow-md" />
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <h2 className="text-4xl sm:text-5xl font-bold font-arabic text-emerald-950 dir-rtl leading-relaxed">
                {selectedModalItem.arabic}
              </h2>
              <button
                onClick={() => speakArabic(selectedModalItem.arabicClean)}
                className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                title="আরবী উচ্চারণ শুনুন"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {selectedModalItem.banglaTranslit && (
              <div className="text-xs sm:text-sm text-stone-500 font-bengali mt-1">
                উচ্চারণ: <span className="font-semibold text-stone-700">{selectedModalItem.banglaTranslit}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2.5">
              <h3 className="text-2xl sm:text-3xl font-bold font-bengali text-stone-900">
                {selectedModalItem.bangla}
              </h3>
              <button
                onClick={() => speakBangla(selectedModalItem.bangla)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 transition"
                title="বাংলা শুনুন"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400 mt-0.5 font-sans">
              {selectedModalItem.english}
            </p>

            {/* LARGER EXAMPLE SENTENCE */}
            {selectedModalItem.exampleSentenceAr && (
              <div className="w-full bg-stone-50/90 rounded-2xl p-4 sm:p-5 mt-4 border border-emerald-200/80 text-right shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200/70 pb-1.5 mb-2">
                  <span className="text-xs sm:text-sm font-bold text-emerald-800 font-bengali flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    উদাহরণ বাক্য (বই থেকে):
                  </span>
                  <button
                    onClick={() => speakArabic(selectedModalItem.exampleSentenceAr || '')}
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition flex items-center gap-1 px-2.5 text-xs font-bengali"
                    title="উদাহরণ বাক্যটি শুনুন"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>শুনুন</span>
                  </button>
                </div>
                {/* Large Arabic text */}
                <div className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-950 dir-rtl leading-loose py-1">
                  {selectedModalItem.exampleSentenceAr}
                </div>
                {selectedModalItem.exampleSentenceBn && (
                  <div className="text-sm sm:text-base text-stone-700 font-bengali text-left mt-1.5 font-medium leading-relaxed bg-white/70 px-3 py-1.5 rounded-lg border border-stone-200/60">
                    অর্থ: {selectedModalItem.exampleSentenceBn}
                  </div>
                )}
              </div>
            )}

            {/* WORDS UNDERNEATH FROM THE BOOK */}
            {selectedModalItem.bookPhrases && selectedModalItem.bookPhrases.length > 0 && (
              <div className="w-full bg-amber-50/40 rounded-2xl p-4 mt-3 border border-amber-200/80 text-left shadow-xs">
                <div className="text-xs sm:text-sm font-bold text-amber-900 font-bengali mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    বইয়ের নিচের শব্দ ও বাক্যসমূহ (এসো আরবী শিখি)
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">মূল পাঠ</span>
                </div>
                <div className="space-y-2">
                  {selectedModalItem.bookPhrases.map((phrase, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-white rounded-xl p-3 border border-amber-200/60 flex items-center justify-between gap-3 shadow-2xs hover:border-amber-400 transition"
                    >
                      <div className="flex-1 text-right">
                        <div className="text-xl sm:text-2xl font-bold text-emerald-950 font-arabic dir-rtl leading-snug">
                          {phrase.arabic}
                        </div>
                        <div className="text-xs sm:text-sm text-stone-700 font-bengali text-left mt-0.5 font-medium">
                          {phrase.bangla}
                        </div>
                        {phrase.translit && (
                          <div className="text-[11px] text-stone-500 font-bengali text-left">
                            উচ্চারণ: {phrase.translit}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => speakArabic(phrase.arabic)}
                        className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition shrink-0"
                        title="এই বাক্যটি শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between w-full mt-5 pt-3 border-t border-stone-100 text-xs">
              <button
                onClick={() => toggleBookmark(selectedModalItem.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bengali transition ${
                  bookmarks.includes(selectedModalItem.id)
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {bookmarks.includes(selectedModalItem.id) ? (
                  <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                <span>{bookmarks.includes(selectedModalItem.id) ? 'প্রিয় তালিকাভুক্ত' : 'প্রিয় তালিকায় যুক্ত করুন'}</span>
              </button>

              <button
                onClick={() => toggleMastered(selectedModalItem.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bengali transition ${
                  masteredIds.includes(selectedModalItem.id)
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${masteredIds.includes(selectedModalItem.id) ? 'text-emerald-600' : 'text-stone-400'}`} />
                <span>{masteredIds.includes(selectedModalItem.id) ? 'মুখস্থ হয়েছে' : 'মুখস্থ সম্পন্ন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500 font-bengali mb-16 md:mb-0">
        <p>
          "এসো আরবী শিখি" (الطريق إلى العربية) — হযরত মাওলানা আবু তাহের মেসবাহ দামাত বারাকাতুহুম
        </p>
      </footer>

      {/* Single Mobile Bottom Navigation Bar (Fixed bottom for mobile screens < md) */}
      <nav
        aria-label="মোবাইল প্রধান নেভিগেশন"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-1 py-1 flex items-center justify-around"
      >
        {[
          { id: 'flashcards' as StudyMode, label: 'ফ্ল্যাশ কার্ড', icon: BookOpen },
          { id: 'photo_gallery' as StudyMode, label: 'গ্যালারি', icon: Sparkles },
          { id: 'quiz' as StudyMode, label: 'কুইজ', icon: HelpCircle },
          { id: 'glossary' as StudyMode, label: 'শব্দকোষ', icon: List },
          { id: 'room' as StudyMode, label: 'লাইভ রুম', icon: Users, isLive: true },
        ].map((item) => {
          const Icon = item.icon;
          const active = studyMode === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => {
                setStudyMode(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl min-w-[56px] min-h-[44px] transition relative ${
                active
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg relative ${active ? 'bg-emerald-100 text-emerald-800' : ''}`}>
                <Icon className="w-5 h-5" />
                {item.isLive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] font-bengali mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Chapter & Lesson Picker Bottom-Sheet Modal */}
      {isMobileChapterPickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsMobileChapterPickerOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
              <h3 className="text-base font-bold font-bengali text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                অধ্যায় ও পাঠ নির্বাচন
              </h3>
              <button
                onClick={() => setIsMobileChapterPickerOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full transition"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 font-bengali flex-1">
              {/* Unit Selection */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  মূল অধ্যায় (আল-ওয়াহদাতু):
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedUnitNumber('all');
                      setSelectedChapterId('all');
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition flex items-center justify-between ${
                      selectedUnitNumber === 'all'
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>বই সমগ্র (সকল অধ্যায়)</span>
                    <span className="text-[11px] opacity-80">{vocabularyItems.length}টি শব্দ</span>
                  </button>
                  {bookUnits.map((u) => {
                    const count = vocabularyItems.filter((i) => {
                      const ch = chapters.find((c) => c.id === i.chapterId);
                      return ch?.unitNumber === u.number;
                    }).length;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUnitNumber(u.number);
                          setSelectedChapterId('all');
                        }}
                        className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition flex items-center justify-between ${
                          selectedUnitNumber === u.number
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div>
                          <span>{u.titleBn}</span>
                          <span className="font-arabic ml-1.5 opacity-80 dir-rtl">({u.titleAr})</span>
                        </div>
                        <span className="text-[11px] opacity-80">{count}টি শব্দ</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lesson Selection */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  নির্দিষ্ট পাঠ (আদ-দারসু):
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedChapterId('all')}
                    className={`p-2 rounded-xl text-left text-xs font-semibold border transition col-span-2 ${
                      selectedChapterId === 'all'
                        ? 'bg-emerald-700 text-white border-emerald-800'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {selectedUnitNumber === 'all' ? 'সকল পাঠ' : 'এই অধ্যায়ের সকল পাঠ'}
                  </button>
                  {availableLessons.map((ch) => {
                    const count = vocabularyItems.filter((i) => i.chapterId === ch.id).length;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setSelectedChapterId(ch.id);
                          if (selectedUnitNumber !== ch.unitNumber) {
                            setSelectedUnitNumber(ch.unitNumber);
                          }
                        }}
                        className={`p-2 rounded-xl text-left text-xs font-medium border transition ${
                          selectedChapterId === ch.id
                            ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="truncate">{ch.titleBn}</div>
                        <div className="text-[10px] opacity-75">{count}টি শব্দ</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 shrink-0">
              <button
                onClick={() => setIsMobileChapterPickerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold font-bengali shadow-sm transition"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
