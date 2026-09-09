import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  RotateCw,
  Lock,
  Unlock,
  Volume2,
  Sparkles,
  BookOpen,
  LogOut,
  Shuffle,
  Send,
  MessageCircle,
  HelpCircle,
  Share2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { CardSelectorModal } from './CardSelectorModal';
import { UsernameModal } from './UsernameModal';
import { ItemIllustration } from './illustrations';
import { speakArabic, speakBangla } from '../utils/audio';
import { vocabularyItems } from '../data/vocabulary';
import { CardDirection } from '../types';

export const CollaborativeRoom: React.FC = () => {
  const {
    connectionStatus,
    isFallbackMode,
    roomState,
    errorMessage,
    showError,
    username,
    setUsernameState,
    avatarColor,
    setAvatarColorState,
    clientId,
    activeCardItem,
    isMyCard,
    canFlip,
    canPutCard,
    createRoom,
    joinRoom,
    putCard,
    refreshCard,
    syncRoom,
    flipCard,
    clearCard,
    sendMessage,
    leaveRoom,
  } = useRoomSocket();

  const [inputCode, setInputCode] = useState('');
  const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | { type: 'join'; code: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cardShake, setCardShake] = useState(false);
  const [isRefreshingCard, setIsRefreshingCard] = useState(false);
  const [isSyncingRoom, setIsSyncingRoom] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleRefreshNewCard = () => {
    setIsRefreshingCard(true);
    refreshCard();
    setTimeout(() => setIsRefreshingCard(false), 500);
  };

  const handleSyncRoom = async () => {
    setIsSyncingRoom(true);
    await syncRoom();
    setSyncToast('রুমের তথ্য সফলভাবে সিঙ্ক হয়েছে!');
    setTimeout(() => {
      setIsSyncingRoom(false);
      setSyncToast(null);
    }, 2000);
  };

  // Check URL query param for ?room=CODE
  useEffect(() => {
    if (typeof window !== 'undefined' && !roomState) {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        const cleanParam = roomParam.trim().toUpperCase();
        setInputCode(cleanParam);
        if (!username) {
          setPendingAction({ type: 'join', code: cleanParam });
          setIsUsernameModalOpen(true);
        } else {
          joinRoom(cleanParam);
        }
      }
    }
  }, [joinRoom, roomState, username]);

  const handleCopyCode = () => {
    if (!roomState) return;
    navigator.clipboard.writeText(roomState.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!roomState) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomState.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput, 'chat');
    setChatInput('');
  };

  const handleQuickReaction = (emojiText: string) => {
    sendMessage(emojiText, 'reaction');
  };

  const handleCardClick = () => {
    if (!roomState?.activeCard) return;

    if (canFlip) {
      flipCard();
    } else if (!roomState.activeCard.isFlipped) {
      // Not allowed to flip!
      setCardShake(true);
      setTimeout(() => setCardShake(false), 500);
      showError(
        `🔒 শুধুমাত্র ${roomState.activeCard.putByUsername} যিনি কার্ডটি রেখেছেন তিনিই এটি উল্টাতে পারবেন!`
      );
    }
  };

  const handlePutRandom = (mode: CardDirection = 'photo') => {
    if (!canPutCard) {
      showError('বর্তমান কার্ডটি উল্টানোর পূর্বে নতুন কার্ড রাখা যাবে না!');
      return;
    }
    const random = vocabularyItems[Math.floor(Math.random() * vocabularyItems.length)];
    putCard(random.id, mode);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Transient Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-900/90 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-rose-700/80 animate-in fade-in slide-in-from-bottom-3">
          <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          <span className="font-bengali">{errorMessage}</span>
        </div>
      )}

      {/* Username Setup Modal */}
      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => {
          setIsUsernameModalOpen(false);
          setPendingAction(null);
        }}
        initialUsername={username}
        initialColor={avatarColor}
        onSave={(name, color) => {
          setUsernameState(name);
          setAvatarColorState(color);
          setIsUsernameModalOpen(false);
          if (pendingAction === 'create') {
            createRoom(name, color);
            setPendingAction(null);
          } else if (pendingAction && typeof pendingAction === 'object' && pendingAction.type === 'join') {
            joinRoom(pendingAction.code, name, color);
            setPendingAction(null);
          }
        }}
      />

      {/* Card Selector Modal */}
      <CardSelectorModal
        isOpen={isCardSelectorOpen}
        onClose={() => setIsCardSelectorOpen(false)}
        onSelectCard={(cardId, mode) => {
          putCard(cardId, mode);
        }}
      />

      {/* ================= VIEW 1: LOBBY (NOT IN A ROOM) ================= */}
      {!roomState ? (
        <div className="space-y-6">
          {/* User Profile Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: avatarColor }}
              >
                {username ? username.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-bengali">আপনার প্রোফাইল নাম:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    সক্রিয়
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-bengali">
                  {username || 'নাম সেট করা নেই'}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsUsernameModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold font-bengali transition border border-stone-200"
            >
              {username ? 'নাম ও অ্যাভাটার পরিবর্তন' : 'নাম নির্ধারণ করুন'}
            </button>
          </div>

          {/* Lobby Welcome Hero */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold font-bengali border border-emerald-500/30">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                লাইভ দ্বৈত ও গ্রুপ প্র্যাকটিস
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-bengali tracking-tight">
                রুম তৈরি করে বন্ধুদের সাথে আরবী শিখুন
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/80 font-bengali leading-relaxed">
                কোনো অ্যাকাউন্টের প্রয়োজন নেই। একজন কার্ড টেবিলে রাখবেন, অন্যরা উত্তর বলবে, এবং
                শুধুমাত্র যিনি কার্ডটি রেখেছেন তিনিই এটি উল্টে সঠিক উত্তর উন্মোচন করবেন!
              </p>
            </div>
          </div>

          {/* Actions: Create Room vs Join Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Create Room Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 font-bengali">
                  নতুন প্র্যাকটিস রুম তৈরি করুন
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 font-bengali leading-relaxed">
                  একটি নতুন রুম খুলুন এবং আপনার রুমের কোডটি বন্ধু বা সহপাঠীদের পাঠিয়ে দিন। সবাই একসাথে
                  একই টেবিলে যুক্ত হবে।
                </p>
              </div>

              <button
                onClick={() => {
                  if (!username) {
                    setPendingAction('create');
                    setIsUsernameModalOpen(true);
                  } else {
                    createRoom();
                  }
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold font-bengali shadow-md transition flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.99]"
              >
                <Plus className="w-5 h-5" />
                <span>নতুন রুম খুলুন (Create Room)</span>
              </button>
            </div>

            {/* Join Room Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col justify-between space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-bengali">
                  কোড দিয়ে রুমে যোগ দিন
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 font-bengali leading-relaxed">
                  আপনার সহপাঠী বা শিক্ষকের দেওয়া ৬ অক্ষরের রুম কোডটি নিচে লিখে সরাসরি রুমে প্রবেশ করুন।
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col xs:flex-row gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="যেমন: AR8K29"
                    maxLength={10}
                    className="flex-1 px-3 sm:px-4 py-3 text-center tracking-widest text-base sm:text-lg font-mono font-bold rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-800 uppercase min-h-[46px]"
                  />
                  <button
                    onClick={() => {
                      const codeToJoin = inputCode.trim();
                      if (!codeToJoin) {
                        showError('দয়া করে রুম কোড লিখুন');
                        return;
                      }
                      if (!username) {
                        setPendingAction({ type: 'join', code: codeToJoin });
                        setIsUsernameModalOpen(true);
                      } else {
                        joinRoom(codeToJoin);
                      }
                    }}
                    disabled={!inputCode.trim()}
                    className={`px-5 py-3 rounded-2xl font-semibold font-bengali shadow-sm transition flex items-center justify-center gap-2 min-h-[46px] active:scale-95 ${
                      inputCode.trim()
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>যোগ দিন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* How it Works Rules */}
          <div className="bg-stone-100/70 rounded-3xl p-4 sm:p-6 border border-stone-200">
            <h4 className="text-sm font-bold text-stone-800 font-bengali mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700" />
              রুম অনুশীলনের নিয়মাবলী ও বৈশিষ্ট্য
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs font-bengali text-stone-600">
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  ১
                </span>
                <div className="font-semibold text-stone-800">যেকোনো ব্যক্তি কার্ড রাখতে পারবেন</div>
                <div>টেবিল খালি থাকলে রুমে থাকা যেকোনো অংশগ্রহণকারী কার্ড নির্বাচন করে টেবিলে রাখতে পারবেন।</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  ২
                </span>
                <div className="font-semibold text-stone-800">শুধুমাত্র প্রদানকারী কার্ড উল্টাবেন</div>
                <div>অন্যেরা কার্ড উল্টাতে পারবেন না। কার্ড প্রদানকারী যাচাই করে কার্ড উল্টে উত্তর উন্মোচন করবেন।</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                  ৩
                </span>
                <div className="font-semibold text-stone-800">একবারে একটি কার্ড পর্ব</div>
                <div>একটি কার্ড উল্টানো না হওয়া পর্যন্ত টেবিলে অন্য কোনো কার্ড রাখা যাবে না। উল্টানোর পরই পরবর্তী রাউন্ড শুরু হবে।</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VIEW 2: ACTIVE LIVE ROOM ================= */
        <div className="space-y-4 sm:space-y-5">
          {/* Top Bar: Room Header, Code, and Participants */}
          <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            {/* Room Info & Code */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-stone-500 font-bengali">রুম কোড:</span>
                <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-mono text-sm sm:text-base font-bold tracking-wider">
                  <span>{roomState.code}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-emerald-100 rounded-md transition text-emerald-700"
                    title="রুম কোড কপি করুন"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold font-bengali transition flex items-center gap-1.5 border border-stone-200 min-h-[36px]"
                title="বন্ধুদের আমন্ত্রণ জানাতে লিংক কপি করুন"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'আমন্ত্রণ লিংক'}</span>
              </button>

              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bengali font-medium border"
                style={{
                  backgroundColor: isFallbackMode ? '#ecfdf5' : '#ecfdf5',
                  color: isFallbackMode ? '#047857' : '#047857',
                  borderColor: isFallbackMode ? '#a7f3d0' : '#a7f3d0',
                }}
                title={isFallbackMode ? 'ক্লাউড রিয়েল-টাইম রিলে সক্রিয় (Vercel / ক্রস-ডিভাইস)' : 'লাইভ ক্লাউড সার্ভার সংযুক্ত'}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span>{isFallbackMode ? 'ক্লাউড লাইভ সিঙ্ক (Vercel)' : 'লাইভ সার্ভার'}</span>
              </span>

              <div className="text-xs text-stone-400 font-bengali hidden sm:block">
                মোট সম্পন্ন: <span className="font-bold text-emerald-700">{roomState.historyCount}</span> টি কার্ড
              </div>
            </div>

            {/* Participants Chips & Leave Button */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center -space-x-2 mr-1">
                  {roomState.participants.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      title={`${p.username}${p.isHost ? ' (হোস্ট)' : ''}`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-xs cursor-default"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {roomState.participants.length > 5 && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-stone-200 text-stone-700 text-[10px] font-bold ring-2 ring-white">
                      +{roomState.participants.length - 5}
                    </div>
                  )}
                </div>

                <span className="text-xs text-stone-600 font-bengali font-semibold">
                  {roomState.participants.length} জন
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSyncRoom}
                  disabled={isSyncingRoom}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold font-bengali transition flex items-center gap-1.5 border border-stone-200 min-h-[36px] active:scale-95"
                  title="রুমের অবস্থা সিঙ্ক করুন"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isSyncingRoom ? 'animate-spin text-emerald-600' : ''}`} />
                  <span className="hidden xs:inline">{isSyncingRoom ? 'সিঙ্ক হচ্ছে...' : 'সিঙ্ক'}</span>
                </button>

                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold font-bengali flex items-center gap-1.5 transition border min-h-[36px] ${
                    isChatOpen
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">বার্তা</span>
                </button>

                <button
                  onClick={leaveRoom}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold font-bengali transition flex items-center gap-1 border border-rose-200 min-h-[36px]"
                  title="রুম ছেড়ে যান"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>প্রস্থান</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sync Success Toast */}
          {syncToast && (
            <div className="px-4 py-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bengali font-semibold flex items-center justify-center gap-2 shadow-xs transition animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{syncToast}</span>
            </div>
          )}

          {/* Quick Reaction Bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-stone-100/80 rounded-2xl border border-stone-200 overflow-x-auto scrollbar-none touch-pan-x">
            <span className="text-xs font-semibold text-stone-500 font-bengali whitespace-nowrap shrink-0">
              প্রতিক্রিয়া:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { label: 'সঠিক উত্তর!', emoji: '🎯' },
                { label: 'মাশাআল্লাহ!', emoji: '👏' },
                { label: 'আবার ভাবুন', emoji: '🤔' },
                { label: 'আমি জানি!', emoji: '🙋‍♂️' },
                { label: 'দারুণ!', emoji: '🌟' },
              ].map((rec) => (
                <button
                  key={rec.label}
                  type="button"
                  onClick={() => handleQuickReaction(`${rec.emoji} ${rec.label}`)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 text-xs font-bengali border border-stone-200 hover:border-emerald-300 shadow-2xs transition flex items-center gap-1 active:scale-95 whitespace-nowrap min-h-[34px]"
                >
                  <span>{rec.emoji}</span>
                  <span>{rec.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ================= CENTRAL STUDY STAGE ================= */}
          <div className="bg-stone-900 rounded-3xl p-3.5 sm:p-6 md:p-8 border border-stone-800 shadow-2xl relative min-h-[500px] sm:min-h-[560px] flex flex-col items-center justify-between">
            {/* Top Stage Notice */}
            <div className="w-full flex items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5 sm:pb-3 mb-3 sm:mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                {roomState.activeCard ? (
                  !roomState.activeCard.isFlipped ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] sm:text-xs font-semibold font-bengali border border-amber-500/30">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      প্রশ্ন পর্ব চলছে
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs font-semibold font-bengali border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      উত্তর উন্মোচিত হয়েছে
                    </span>
                  )
                ) : (
                  <span className="text-xs text-stone-400 font-bengali">টেবিল প্রস্তুত রয়েছে</span>
                )}
              </div>

              {/* Action buttons & Card Author on Stage Top Bar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshNewCard}
                  disabled={isRefreshingCard}
                  className="px-2.5 sm:px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] sm:text-xs font-semibold font-bengali border border-stone-700 hover:border-stone-600 transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                  title="টেবিলে নতুন কার্ড এনে রিফ্রেশ করুন"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshingCard ? 'animate-spin' : ''}`} />
                  <span>নতুন কার্ড রিফ্রেশ</span>
                </button>

                {roomState.activeCard && (
                  <div className="text-[11px] sm:text-xs text-stone-300 font-bengali flex items-center gap-1.5">
                    <span className="hidden xs:inline">কার্ড প্রদানকারী:</span>
                    <span className="font-bold text-amber-300 bg-stone-800 px-2 sm:px-2.5 py-0.5 rounded-lg border border-stone-700">
                      {roomState.activeCard.putByUsername} {isMyCard ? '(আপনি)' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* STAGE MAIN CONTENT: CARD OR EMPTY STATE */}
            {!roomState.activeCard || !activeCardItem ? (
              /* EMPTY STAGE */
              <div className="my-auto flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-3 sm:space-y-4 max-w-md w-full">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-stone-800/90 border border-stone-700 flex items-center justify-center text-emerald-400 shadow-inner">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-lg sm:text-2xl font-bold text-white font-bengali">
                    টেবিলটি খালি রয়েছে
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 font-bengali leading-relaxed">
                    অনুশীলন শুরু করার জন্য যেকোনো ব্যক্তি একটি কার্ড নির্বাচন করে টেবিলে রাখুন।
                  </p>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 pt-2 w-full">
                  <button
                    onClick={() => setIsCardSelectorOpen(true)}
                    className="flex-1 py-3 px-4 sm:px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold font-bengali shadow-lg transition flex items-center justify-center gap-2 min-h-[44px] active:scale-95 text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>কার্ড নির্বাচন করুন</span>
                  </button>
                  <button
                    onClick={() => handlePutRandom('photo')}
                    className="py-3 px-4 sm:px-5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold font-bengali border border-stone-700 transition flex items-center justify-center gap-2 min-h-[44px] active:scale-95 text-xs sm:text-sm"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>র‍্যান্ডম কার্ড</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE CARD ON TABLE */
              <div className="w-full max-w-xl sm:max-w-2xl my-auto perspective-1000 select-none">
                {/* Instruction banner above card */}
                <div className="mb-2.5 sm:mb-3 text-center">
                  {!roomState.activeCard.isFlipped ? (
                    isMyCard ? (
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bengali animate-pulse">
                        <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                        <span>আপনি কার্ডটি রেখেছেন! উত্তর দেখতে কার্ডে চাপুন</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bengali">
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                        <span>
                          কার্ডটি শুধুমাত্র <strong>{roomState.activeCard.putByUsername}</strong> উল্টাতে পারবেন
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bengali">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                      <span>কার্ডটি সম্পন্ন হয়েছে! এখন যেকেউ পরবর্তী কার্ড রাখতে পারেন</span>
                    </div>
                  )}
                </div>

                {/* THE 3D FLIP CARD CONTAINER */}
                <div
                  key={`table-card-${roomState.activeCard.cardId}-${roomState.activeCard.putAt}`}
                  id={`room-card-${activeCardItem.id}`}
                  onClick={handleCardClick}
                  className={`relative w-full min-h-[460px] h-[500px] sm:h-[580px] rounded-2xl sm:rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl border ${
                    canFlip
                      ? 'cursor-pointer hover:scale-[1.01]'
                      : !roomState.activeCard.isFlipped
                      ? 'cursor-not-allowed'
                      : 'cursor-default'
                  } ${roomState.activeCard.isFlipped ? 'rotate-y-180' : ''} ${
                    cardShake ? 'animate-shake' : ''
                  }`}
                >
                  {/* FRONT OF THE CARD (QUESTION SIDE) */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col justify-between backface-hidden bg-white text-stone-900 border border-stone-300 shadow-xl">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-bengali border border-stone-200">
                        {activeCardItem.lesson || 'পাঠ'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isMyCard ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold font-bengali flex items-center gap-1">
                            <Unlock className="w-3 h-3 text-emerald-700" />
                            আপনার কার্ড
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold font-bengali flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-700" />
                            লকড ({roomState.activeCard.putByUsername})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="my-auto flex flex-col items-center justify-center text-center px-2 sm:px-4 py-2">
                      {roomState.activeCard.mode === 'photo' && (
                        <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                          <div className="w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 rounded-2xl sm:rounded-3xl bg-amber-50/70 border border-amber-200/90 flex items-center justify-center p-3 sm:p-5 shadow-sm">
                            <ItemIllustration
                              name={activeCardItem.illustrationKey || 'pen'}
                              className="w-full h-full drop-shadow-md"
                            />
                          </div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold font-bengali border border-emerald-200 mt-1 sm:mt-2">
                            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            ছবিটি দেখে আরবী ও বাংলা নাম বলুন
                          </span>
                        </div>
                      )}

                      {roomState.activeCard.mode === 'bn_to_ar' && (
                        <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                          <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold px-3 py-1 bg-stone-100 rounded-full font-bengali">
                            বাংলা অর্থ দেখে বলুন
                          </span>
                          <h3 className="text-2xl sm:text-4xl font-bold text-stone-900 font-bengali px-2">
                            {activeCardItem.bangla}
                          </h3>
                          {activeCardItem.hasIllustration && (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 opacity-30 mt-1 sm:mt-2">
                              <ItemIllustration
                                name={activeCardItem.illustrationKey || 'pen'}
                                className="w-full h-full"
                              />
                            </div>
                          )}
                          <p className="text-xs text-stone-400 font-bengali mt-1 sm:mt-2">
                            এর সঠিক আরবী শব্দটি মনে করুন
                          </p>
                        </div>
                      )}

                      {roomState.activeCard.mode === 'ar_to_bn' && (
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <span className="text-xs uppercase tracking-wider text-amber-700 font-semibold px-3 py-1 bg-amber-50 rounded-full font-bengali">
                            الكلمة العربية
                          </span>
                          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-emerald-950 font-arabic dir-rtl leading-relaxed my-1 sm:my-2 px-2">
                            {activeCardItem.arabic}
                          </h2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakArabic(activeCardItem.arabicClean);
                            }}
                            className="p-2 sm:p-2.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                            title="আরবী উচ্চারণ শুনুন"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-stone-400 mt-1 sm:mt-2 font-bengali">
                            বাংলা অর্থ মনে করুন
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Hint */}
                    <div className="text-center pt-2.5 sm:pt-3 border-t border-stone-200 text-xs font-bengali text-stone-400">
                      {isMyCard ? (
                        <span className="text-emerald-700 font-semibold">
                          কার্ডটিতে চাপ দিয়ে উত্তর প্রকাশ করুন
                        </span>
                      ) : (
                        <span>প্রদানকারী উল্টালে উত্তর দেখতে পাবেন</span>
                      )}
                    </div>
                  </div>

                  {/* BACK OF THE CARD (RESULT & DETAILS) */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between rotate-y-180 backface-hidden bg-gradient-to-b from-stone-900 to-stone-950 text-stone-100 border border-stone-800 shadow-2xl">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800 shrink-0">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bengali border border-emerald-500/30">
                        সঠিক উত্তর ও বাক্য প্রয়োগ
                      </span>
                      <span className="text-xs text-stone-400 font-bengali">
                        এসো আরবী শিখি
                      </span>
                    </div>

                    {/* Scrollable Rich Details */}
                    <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 space-y-2.5 sm:space-y-3 scrollbar-thin scrollbar-thumb-stone-700">
                      {/* Identity */}
                      <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-1">
                        {activeCardItem.hasIllustration && (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-stone-800 p-1 sm:p-1.5 border border-stone-700 flex items-center justify-center shrink-0">
                            <ItemIllustration
                              name={activeCardItem.illustrationKey || 'pen'}
                              className="w-full h-full drop-shadow-sm"
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-amber-300 font-arabic dir-rtl leading-relaxed">
                              {activeCardItem.arabic}
                            </h2>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakArabic(activeCardItem.arabicClean);
                              }}
                              className="p-1.5 sm:p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition shadow shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center"
                              title="আরবী উচ্চারণ শুনুন"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          {activeCardItem.banglaTranslit && (
                            <div className="text-[11px] sm:text-xs text-stone-400 font-bengali">
                              উচ্চারণ: <span className="text-stone-200">{activeCardItem.banglaTranslit}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bangla Meaning */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <h3 className="text-xl sm:text-3xl font-bold text-white font-bengali">
                            {activeCardItem.bangla}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakBangla(activeCardItem.bangla);
                            }}
                            className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="বাংলা শুনুন"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-stone-400 font-sans tracking-wide mt-0.5">
                          {activeCardItem.english}
                        </p>
                      </div>

                      {/* Large Example Sentence */}
                      {activeCardItem.exampleSentenceAr && (
                        <div className="w-full bg-stone-800/90 rounded-2xl p-3 sm:p-4 border border-emerald-500/40 text-right shadow-md">
                          <div className="flex items-center justify-between border-b border-stone-700/60 pb-1.5 mb-1.5 sm:mb-2">
                            <span className="text-xs font-bold text-emerald-400 font-bengali flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              উদাহরণ বাক্য:
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakArabic(activeCardItem.exampleSentenceAr || '');
                              }}
                              className="p-1 sm:p-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white transition flex items-center gap-1 text-[11px] font-bengali px-2 min-h-[30px]"
                              title="বাক্যটি শুনুন"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>শুনুন</span>
                            </button>
                          </div>
                          <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-amber-200 font-arabic dir-rtl leading-relaxed py-1">
                            {activeCardItem.exampleSentenceAr}
                          </div>
                          {activeCardItem.exampleSentenceBn && (
                            <div className="text-xs sm:text-sm text-emerald-100 font-bengali text-left mt-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
                              অর্থ: {activeCardItem.exampleSentenceBn}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Words & Phrases underneath from the book */}
                      {activeCardItem.bookPhrases && activeCardItem.bookPhrases.length > 0 && (
                        <div className="w-full bg-stone-900 rounded-2xl p-3 sm:p-3.5 border border-amber-500/30 text-left">
                          <div className="text-xs font-bold text-amber-400 font-bengali mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            বইয়ের নিচের শব্দ ও বাক্যসমূহ:
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            {activeCardItem.bookPhrases.map((phrase, pIdx) => (
                              <div
                                key={pIdx}
                                className="bg-stone-800/80 rounded-xl p-2 sm:p-2.5 border border-stone-700/60 flex items-center justify-between gap-2"
                              >
                                <div className="flex-1 text-right">
                                  <div className="text-base sm:text-xl font-bold text-amber-200 font-arabic dir-rtl">
                                    {phrase.arabic}
                                  </div>
                                  <div className="text-xs text-stone-200 font-bengali text-left mt-0.5">
                                    {phrase.bangla}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakArabic(phrase.arabic);
                                  }}
                                  className="p-1.5 rounded-full bg-emerald-800/70 hover:bg-emerald-600 text-white transition shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                                  title="শুনুন"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status */}
                    <div className="text-center pt-2 border-t border-stone-800 text-xs font-bengali text-stone-400 shrink-0">
                      রাউন্ড সম্পন্ন হয়েছে
                    </div>
                  </div>
                </div>

                {/* STAGE ACTION CONTROLS */}
                <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full">
                  {/* Flip or Refresh Action Controls */}
                  {!roomState.activeCard.isFlipped ? (
                    <div className="flex flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                      {canFlip ? (
                        <button
                          onClick={flipCard}
                          className="flex-1 sm:flex-initial min-h-[46px] py-2.5 px-6 sm:px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-bengali shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 text-sm sm:text-base animate-pulse active:scale-95"
                        >
                          <RotateCw className="w-5 h-5" />
                          <span>কার্ডটি উল্টান (Flip Card)</span>
                        </button>
                      ) : (
                        <div className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-400 font-bengali text-xs flex items-center justify-center gap-2 min-h-[46px]">
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            শুধুমাত্র <strong>{roomState.activeCard.putByUsername}</strong> কার্ডটি উল্টাতে পারবেন
                          </span>
                        </div>
                      )}

                      <button
                        onClick={handleRefreshNewCard}
                        disabled={isRefreshingCard}
                        className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold font-bengali border border-stone-700 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm min-h-[46px] active:scale-95"
                        title="টেবিলে সরাসরি নতুন কার্ড এনে রিফ্রেশ করুন"
                      >
                        <RotateCw className={`w-4 h-4 text-emerald-400 ${isRefreshingCard ? 'animate-spin' : ''}`} />
                        <span>নতুন কার্ড রিফ্রেশ</span>
                      </button>
                    </div>
                  ) : (
                    /* When Flipped: Next Card Actions for ANYONE in the room */
                    <div className="flex flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => setIsCardSelectorOpen(true)}
                        className="flex-1 sm:flex-initial py-2.5 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold font-bengali shadow transition flex items-center justify-center gap-1.5 text-xs sm:text-sm min-h-[42px] active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>পরবর্তী কার্ড রাখুন</span>
                      </button>
                      <button
                        onClick={handleRefreshNewCard}
                        disabled={isRefreshingCard}
                        className="flex-1 sm:flex-initial py-2.5 px-3.5 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold font-bengali shadow transition flex items-center justify-center gap-1.5 text-xs sm:text-sm min-h-[42px] active:scale-95"
                        title="তাৎক্ষণিকভাবে নতুন র‍্যান্ডম কার্ড দিয়ে টেবিল রিফ্রেশ করুন"
                      >
                        <RotateCw className={`w-4 h-4 ${isRefreshingCard ? 'animate-spin' : ''}`} />
                        <span>রিফ্রেশ (নতুন কার্ড)</span>
                      </button>
                      <button
                        onClick={() => handlePutRandom('photo')}
                        className="flex-1 sm:flex-initial py-2.5 px-3.5 sm:px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold font-bengali shadow transition flex items-center justify-center gap-1.5 text-xs sm:text-sm min-h-[42px] active:scale-95"
                      >
                        <Shuffle className="w-4 h-4" />
                        <span>র‍্যান্ডম কার্ড</span>
                      </button>
                      <button
                        onClick={clearCard}
                        className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold font-bengali border border-stone-700 transition text-xs sm:text-sm min-h-[42px] active:scale-95"
                      >
                        টেবিল পরিষ্কার করুন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Room Rules Reminder */}
            <div className="w-full text-center text-[11px] text-stone-500 font-bengali pt-3 border-t border-stone-800/60 mt-4">
              {roomState.activeCard && !roomState.activeCard.isFlipped
                ? 'নিয়ম: বর্তমান কার্ডটি উল্টানোর পূর্বে টেবিলে নতুন কোনো কার্ড রাখা যাবে না।'
                : 'টেবিল উন্মুক্ত: এখন যেকোনো ব্যক্তি পরবর্তী কার্ড নির্বাচন করে টেবিলে রাখতে পারেন।'}
            </div>
          </div>

          {/* ================= COLLAPSIBLE LIVE CHAT / FEED ================= */}
          {isChatOpen && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold text-stone-800 font-bengali flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  রুম লাইভ চ্যাট ও কার্যকলাপ
                </span>
                <span className="text-[11px] text-stone-400 font-bengali">
                  রুম কোড: {roomState.code}
                </span>
              </div>

              {/* Message List */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-stone-300">
                {roomState.messages.map((m) => {
                  const isSelf = m.senderId === clientId;
                  if (m.type === 'system') {
                    return (
                      <div
                        key={m.id}
                        className="text-center text-[11px] text-stone-500 font-bengali py-1 bg-stone-50 rounded-lg border border-stone-100"
                      >
                        {m.text}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-stone-400 font-bengali mb-0.5">
                        <span className="font-semibold text-stone-600">{m.senderName}</span>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-2xl text-xs font-bengali max-w-xs ${
                          isSelf
                            ? 'bg-emerald-700 text-white rounded-tr-xs'
                            : 'bg-stone-100 text-stone-800 rounded-tl-xs border border-stone-200'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="বার্তা লিখুন..."
                  maxLength={150}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bengali"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold font-bengali text-xs transition flex items-center gap-1 disabled:bg-stone-200 disabled:text-stone-400"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>পাঠান</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
