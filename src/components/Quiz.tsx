import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Award, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { VocabularyItem } from '../types';
import { speakArabic, speakBangla } from '../utils/audio';

interface QuizProps {
  items: VocabularyItem[];
  direction: 'bn_to_ar' | 'ar_to_bn';
  onComplete?: () => void;
}

interface Question {
  item: VocabularyItem;
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export const Quiz: React.FC<QuizProps> = ({ items, direction }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Generate quiz questions
  useEffect(() => {
    if (items.length === 0) return;

    // Shuffle and pick up to 10 questions
    const shuffledItems = [...items].sort(() => 0.5 - Math.random());
    const pool = shuffledItems.slice(0, Math.min(10, shuffledItems.length));

    const generated: Question[] = pool.map((item) => {
      const isBnToAr = direction === 'bn_to_ar';
      const prompt = isBnToAr ? item.bangla : item.arabic;
      const correctAnswer = isBnToAr ? item.arabic : item.bangla;

      // Select 3 random distractors from remaining items
      const distractors = items
        .filter((other) => other.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((d) => (isBnToAr ? d.arabic : d.bangla));

      // Combine and shuffle options
      const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

      return {
        item,
        prompt,
        correctAnswer,
        options,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
  }, [items, direction]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      // Play speech
      if (direction === 'bn_to_ar') {
        speakArabic(currentQ.item.arabicClean);
      } else {
        speakBangla(currentQ.item.bangla);
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-stone-500 font-bengali">
        অনুশীলনের জন্য পর্যাপ্ত শব্দ পাওয়া যায়নি। অনুগ্রহ করে অন্য অধ্যায় নির্বাচন করুন।
      </div>
    );
  }

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-stone-200 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-stone-800 font-bengali mb-1">
          অনুশীলন সম্পন্ন হয়েছে!
        </h3>
        <p className="text-stone-500 text-sm font-bengali mb-6">
          আপনার ফলাফল নিচে দেওয়া হলো:
        </p>

        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 mb-6 flex justify-around">
          <div>
            <div className="text-3xl font-extrabold text-emerald-600">{score}/{questions.length}</div>
            <div className="text-xs text-stone-500 font-bengali mt-1">সঠিক উত্তর</div>
          </div>
          <div className="h-10 w-px bg-stone-300 my-auto" />
          <div>
            <div className="text-3xl font-extrabold text-amber-600">{percentage}%</div>
            <div className="text-xs text-stone-500 font-bengali mt-1">সাফল্যের হার</div>
          </div>
        </div>

        <button
          id="btn-quiz-restart"
          onClick={handleRestart}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bengali font-semibold shadow-md flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>আবার অনুশীলন করুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-stone-200/80 p-6">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-bengali mb-4 pb-3 border-b border-stone-100">
        <div>
          প্রশ্ন <span className="font-bold text-stone-800">{currentIndex + 1}</span> / {questions.length}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            ধারাবাহিক: {streak}
          </span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            স্কোর: {score}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Prompt */}
      <div className="text-center py-6 px-4 bg-stone-50 rounded-xl border border-stone-100 mb-6">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-200/70 text-stone-600 font-bengali">
          {direction === 'bn_to_ar' ? 'বাংলা থেকে আরবী নির্বাচন করুন' : 'আরবী থেকে বাংলা নির্বাচন করুন'}
        </span>
        <div className={`mt-4 ${direction === 'bn_to_ar' ? 'text-2xl sm:text-3xl font-bold font-bengali text-stone-800' : 'text-4xl font-bold font-arabic text-emerald-950 dir-rtl'}`}>
          {currentQ.prompt}
        </div>
        {direction === 'ar_to_bn' && (
          <button
            id="btn-quiz-speech-prompt"
            onClick={() => speakArabic(currentQ.item.arabicClean)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium font-bengali"
          >
            <Volume2 className="w-3.5 h-3.5" />
            উচ্চারণ শুনুন
          </button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          let btnStyle = 'border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-stone-700';

          if (isAnswered) {
            if (opt === currentQ.correctAnswer) {
              btnStyle = 'border-emerald-600 bg-emerald-100 text-emerald-950 font-bold';
            } else if (opt === selectedOption) {
              btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
            } else {
              btnStyle = 'border-stone-200 opacity-50 text-stone-400';
            }
          }

          return (
            <button
              key={idx}
              id={`quiz-opt-${idx}`}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between text-base ${
                direction === 'bn_to_ar' ? 'font-arabic text-xl dir-rtl text-right' : 'font-bengali'
              } ${btnStyle}`}
            >
              <span>{opt}</span>
              {direction === 'bn_to_ar' && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    speakArabic(opt);
                  }}
                  className="p-1 text-stone-400 hover:text-emerald-700 transition"
                >
                  <Volume2 className="w-4 h-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {isAnswered && (
        <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            id="btn-quiz-next"
            onClick={handleNext}
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bengali font-semibold shadow flex items-center gap-1.5 transition"
          >
            <span>{currentIndex + 1 < questions.length ? 'পরবর্তী প্রশ্ন' : 'ফলাফল দেখুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
