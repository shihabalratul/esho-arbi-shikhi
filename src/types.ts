export type StudyMode = 'flashcards' | 'photo_gallery' | 'quiz' | 'glossary' | 'sentences' | 'room';

export type CardDirection = 'photo' | 'bn_to_ar' | 'ar_to_bn';

export interface SentenceWordUsage {
  wordAr: string;
  wordBn: string;
  meaning?: string;
}

export interface SentenceItem {
  id: string;
  arabic: string; // full Tashkeel
  arabicClean: string; // without Tashkeel for search
  bangla: string; // Bengali translation
  banglaTranslit?: string; // Bengali transliteration/pronunciation
  english?: string;
  source: 'book' | 'derived'; // 'book' = কিতাবের মূল বাক্য, 'derived' = কিতাবের শব্দ দিয়ে নতুন বাক্য
  category: string; // e.g. মৌলিক ইশারা, সিফাত-মাওসূফ, যমীর ও পরিচয়, ইজাফত, ইত্যাদি
  chapterId?: string;
  lessonName?: string;
  grammarNote?: string; // ব্যাকরণগত গঠন বা বিশ্লেষণ
  bookWordsUsed?: SentenceWordUsage[]; // শব্দকোষ থেকে ব্যবহৃত শব্দসমূহ
}

export interface RoomParticipant {
  id: string;
  username: string;
  avatarColor: string;
  isHost: boolean;
  joinedAt: number;
}

export type ItemType = 'word' | 'sentence' | 'passage';

export interface PassageSentence {
  arabic: string;
  bangla: string;
  translit?: string;
}

export interface PlacedCard {
  cardId: string;
  putByUserId: string;
  putByUsername: string;
  putAt: number;
  isFlipped: boolean;
  flippedAt?: number;
  mode: CardDirection;
  revealedSentenceIndices?: number[];
}

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'chat' | 'reaction' | 'system';
  timestamp: number;
}

export interface RoomState {
  code: string;
  createdAt: number;
  participants: RoomParticipant[];
  activeCard: PlacedCard | null;
  historyCount: number;
  messages: RoomMessage[];
  version?: number;
  lastUpdatedAt?: number;
  lastSenderId?: string;
}

export interface Chapter {
  id: string;
  unitNumber: number; // 1, 2, 3
  lessonNumber: number; // 1, 2, 3, 4
  titleBn: string;
  titleAr: string;
  unitBn: string;
  unitAr: string;
  descriptionBn: string;
  iconName: string;
}

export interface BookUnit {
  id: string;
  number: number;
  titleBn: string;
  titleAr: string;
  descriptionBn: string;
}

export interface BookPhrase {
  arabic: string;
  bangla: string;
  translit?: string;
}

export interface VocabularyItem {
  id: string;
  arabic: string; // with full Tashkeel
  arabicClean: string; // without tashkeel for easy search
  bangla: string;
  banglaTranslit?: string;
  english: string;
  chapterId: string;
  lesson?: string; // e.g. "প্রথম পাঠ", "দ্বিতীয় পাঠ"
  category: 'object' | 'person' | 'adjective' | 'verb' | 'nature' | 'food' | 'animal' | 'anatomy' | 'islamic' | 'phrase' | 'sentence' | 'passage';
  itemType?: ItemType; // 'word' | 'sentence' | 'passage' (defaults to 'word')
  passageTitle?: string;
  passageSentences?: PassageSentence[]; // For passages: individual sentences with meanings
  gender?: 'masculine' | 'feminine';
  hasIllustration: boolean;
  illustrationKey?: string;
  exampleSentenceAr?: string;
  exampleSentenceBn?: string;
  bookPhrases?: BookPhrase[]; // Sentences/words underneath in the book (هَذَا / هَذِهِ, etc.)
  pluralAr?: string;
  notes?: string;
}

export interface QuizQuestion {
  item: VocabularyItem;
  direction: 'bn_to_ar' | 'ar_to_bn';
  prompt: string;
  correctAnswer: string;
  options: string[];
}
