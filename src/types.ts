export type StudyMode = 'flashcards' | 'photo_gallery' | 'quiz' | 'glossary' | 'room';

export type CardDirection = 'photo' | 'bn_to_ar' | 'ar_to_bn';

export interface RoomParticipant {
  id: string;
  username: string;
  avatarColor: string;
  isHost: boolean;
  joinedAt: number;
}

export interface PlacedCard {
  cardId: string;
  putByUserId: string;
  putByUsername: string;
  putAt: number;
  isFlipped: boolean;
  flippedAt?: number;
  mode: CardDirection;
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
  category: 'object' | 'person' | 'adjective' | 'verb' | 'nature' | 'food' | 'animal' | 'anatomy' | 'islamic' | 'phrase';
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
