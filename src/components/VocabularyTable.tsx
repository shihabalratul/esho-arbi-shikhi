import React from 'react';
import { Volume2, Bookmark, BookmarkCheck } from 'lucide-react';
import { VocabularyItem } from '../types';
import { ItemIllustration } from './illustrations';
import { speakArabic, speakBangla } from '../utils/audio';

interface VocabularyTableProps {
  items: VocabularyItem[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onSelectItem: (item: VocabularyItem) => void;
}

export const VocabularyTable: React.FC<VocabularyTableProps> = ({
  items,
  bookmarks,
  onToggleBookmark,
  onSelectItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-stone-500 font-bengali">
        কোনো শব্দ পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200/80 text-xs font-semibold text-stone-600 font-bengali">
              <th className="py-3 px-4 text-center w-12">ছবি</th>
              <th className="py-3 px-4">বাংলা অর্থ</th>
              <th className="py-3 px-4 text-right">আরবী শব্দ (হরকতসহ)</th>
              <th className="py-3 px-4">উচ্চারণ</th>
              <th className="py-3 px-4">উদাহরণ বাক্য</th>
              <th className="py-3 px-4 text-center w-24">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {items.map((item) => {
              const isBookmarked = bookmarks.includes(item.id);
              return (
                <tr
                  key={item.id}
                  id={`glossary-row-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4 text-center">
                    {item.hasIllustration ? (
                      <div className="w-8 h-8 mx-auto flex items-center justify-center bg-stone-100/60 rounded-md p-0.5">
                        <ItemIllustration name={item.illustrationKey || 'pen'} className="w-full h-full" />
                      </div>
                    ) : (
                      <span className="text-xs text-stone-300">•</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-stone-800 font-bengali">
                    <div className="flex items-center gap-1.5">
                      <span>{item.bangla}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakBangla(item.bangla);
                        }}
                        className="p-1 text-stone-300 hover:text-stone-600 transition rounded"
                        title="বাংলা উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.gender && (
                      <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded ${
                        item.gender === 'feminine' ? 'text-rose-600 bg-rose-50' : 'text-sky-600 bg-sky-50'
                      }`}>
                        {item.gender === 'feminine' ? 'স্ত্রীবাচক' : 'পুরুষবাচক'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakArabic(item.arabicClean);
                        }}
                        className="p-1 text-emerald-600 hover:text-emerald-800 transition rounded"
                        title="আরবী উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-2xl font-bold text-emerald-950 font-arabic dir-rtl">
                        {item.arabic}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-stone-500 font-bengali">
                    {item.banglaTranslit || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {item.exampleSentenceAr ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakArabic(item.exampleSentenceAr || '');
                            }}
                            className="p-1 text-emerald-700 hover:text-emerald-900 transition rounded"
                            title="উদাহরণ বাক্যটি শুনুন"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="font-arabic text-xl font-bold text-emerald-950 dir-rtl text-right leading-relaxed">
                            {item.exampleSentenceAr}
                          </div>
                        </div>
                        {item.exampleSentenceBn && (
                          <div className="text-xs text-stone-600 font-bengali font-medium">
                            {item.exampleSentenceBn}
                          </div>
                        )}
                        {item.bookPhrases && item.bookPhrases.length > 0 && (
                          <div className="text-[10px] text-amber-700 font-bengali bg-amber-50 inline-block px-1.5 py-0.5 rounded border border-amber-200/60 mt-0.5">
                            + {item.bookPhrases.length} টি পাঠ্যবাক্য রয়েছে
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`btn-bookmark-table-${item.id}`}
                      onClick={() => onToggleBookmark(item.id)}
                      className={`p-1.5 rounded-full transition ${
                        isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                      }`}
                      title={isBookmarked ? 'প্রিয় তালিকা থেকে সরান' : 'প্রিয় তালিকায় রাখুন'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
