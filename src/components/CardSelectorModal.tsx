import React, { useState, useMemo } from 'react';
import { X, Search, Shuffle, HelpCircle, Image as ImageIcon, BookOpen, Check } from 'lucide-react';
import { VocabularyItem, CardDirection } from '../types';
import { vocabularyItems } from '../data/vocabulary';
import { chapters } from '../data/chapters';
import { ItemIllustration } from './illustrations';

interface CardSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (cardId: string, mode: CardDirection) => void;
}

export const CardSelectorModal: React.FC<CardSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<CardDirection>('photo');
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);

  const filteredItems = useMemo(() => {
    return vocabularyItems.filter((item) => {
      const matchChapter = selectedChapterId === 'all' || item.chapterId === selectedChapterId;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.arabicClean.toLowerCase().includes(query) ||
        item.arabic.toLowerCase().includes(query) ||
        item.bangla.toLowerCase().includes(query) ||
        (item.banglaTranslit && item.banglaTranslit.toLowerCase().includes(query)) ||
        item.english.toLowerCase().includes(query);

      return matchChapter && matchSearch;
    });
  }, [searchQuery, selectedChapterId]);

  if (!isOpen) return null;

  const handlePickRandom = () => {
    const list = filteredItems.length > 0 ? filteredItems : vocabularyItems;
    const random = list[Math.floor(Math.random() * list.length)];
    setSelectedItem(random);
  };

  const handleConfirm = () => {
    if (!selectedItem) return;
    onSelectCard(selectedItem.id, selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-bengali">
                টেবিলে রাখার জন্য কার্ড নির্বাচন করুন
              </h2>
              <p className="text-xs text-stone-500 font-bengali">
                বন্ধুদের অনুশীলনের জন্য যেকোনো শব্দ বা ছবির কার্ড বেছে নিন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Mode Selection */}
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-50/50 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-emerald-900 font-bengali flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            প্রশ্নটির শুরুর দিক (Facing side):
          </span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-200/80 shadow-xs overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedMode('photo')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold font-bengali transition flex items-center gap-1 shrink-0 ${
                selectedMode === 'photo'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>ছবি</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode('ar_to_bn')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold font-bengali transition shrink-0 ${
                selectedMode === 'ar_to_bn'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              আরবী শব্দ
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode('bn_to_ar')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold font-bengali transition shrink-0 ${
                selectedMode === 'bn_to_ar'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              বাংলা অর্থ
            </button>
          </div>
        </div>

        {/* Search & Chapter Filters */}
        <div className="p-3 sm:p-4 border-b border-stone-200 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আরবী বা বাংলায় খুঁজুন..."
              className="w-full pl-9 pr-4 py-2.5 text-base sm:text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bengali"
            />
          </div>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-bengali focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">সকল অধ্যায় ({vocabularyItems.length})</option>
            {chapters.map((chap) => (
              <option key={chap.id} value={chap.id}>
                {chap.titleBn}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePickRandom}
            className="px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold font-bengali flex items-center justify-center gap-1.5 transition border border-amber-200 shrink-0 min-h-[40px]"
            title="র‍্যান্ডম কার্ড নির্বাচন করুন"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>র‍্যান্ডম নির্বাচন</span>
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[380px] grid grid-cols-2 sm:grid-cols-3 gap-2.5 scrollbar-thin scrollbar-thumb-stone-300">
          {filteredItems.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col items-center text-center relative ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/40'
                    : 'border-stone-200 hover:border-emerald-300 bg-white hover:bg-stone-50/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                {item.hasIllustration && (
                  <div className="w-14 h-14 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center p-1.5 mb-1.5">
                    <ItemIllustration name={item.illustrationKey || 'pen'} className="w-full h-full" />
                  </div>
                )}
                <div className="font-arabic text-xl font-bold text-emerald-950 dir-rtl leading-tight">
                  {item.arabic}
                </div>
                <div className="text-xs font-semibold font-bengali text-stone-800 mt-1">
                  {item.bangla}
                </div>
                {item.banglaTranslit && (
                  <div className="text-[10px] text-stone-400 font-bengali">
                    {item.banglaTranslit}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with Selected Item Action */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-bengali text-stone-600 text-center sm:text-left">
            {selectedItem ? (
              <span>
                নির্বাচিত কার্ড: <strong className="text-emerald-900">{selectedItem.bangla}</strong> (
                <span className="font-arabic font-bold">{selectedItem.arabic}</span>)
              </span>
            ) : (
              <span className="text-stone-400">টেবিলে রাখার জন্য যেকোনো একটি কার্ডে চাপুন</span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-semibold font-bengali text-stone-700 transition"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={handleConfirm}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm font-bengali shadow-sm transition flex items-center justify-center gap-1.5 ${
                selectedItem
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>কার্ডটি টেবিলে রাখুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
