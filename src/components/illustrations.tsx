import React from 'react';

interface IllustrationProps {
  name: string;
  className?: string;
}

export const ItemIllustration: React.FC<IllustrationProps> = ({ name, className = 'w-24 h-24' }) => {
  switch (name) {
    case 'pen': // قَلَمٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M72 16 L84 28 L36 76 L20 80 L24 64 Z" fill="#3B82F6" stroke="#1D4ED8" />
          <path d="M64 24 L76 36" stroke="#FFFFFF" />
          <path d="M20 80 L26 74 L30 78 Z" fill="#1E293B" stroke="#0F172A" />
          <circle cx="27" cy="73" r="1.5" fill="#EF4444" />
        </svg>
      );
    case 'book': // كِتَابٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 30 Q50 38 80 30 L80 75 Q50 83 20 75 Z" fill="#059669" stroke="#047857" />
          <path d="M20 30 C35 34 50 34 50 78 C50 34 65 34 80 30" fill="#ECFDF5" stroke="#047857" />
          <line x1="50" y1="34" x2="50" y2="78" stroke="#047857" strokeWidth="2" />
          <line x1="28" y1="45" x2="42" y2="47" stroke="#6EE7B7" strokeWidth="2" />
          <line x1="28" y1="55" x2="42" y2="57" stroke="#6EE7B7" strokeWidth="2" />
          <line x1="58" y1="47" x2="72" y2="45" stroke="#6EE7B7" strokeWidth="2" />
          <line x1="58" y1="57" x2="72" y2="55" stroke="#6EE7B7" strokeWidth="2" />
        </svg>
      );
    case 'house': // بَيْتٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="50,15 15,45 85,45" fill="#DC2626" stroke="#B91C1C" />
          <rect x="22" y="45" width="56" height="42" fill="#FEF3C7" stroke="#D97706" />
          <rect x="42" y="58" width="16" height="29" fill="#B45309" stroke="#78350F" />
          <circle cx="53" cy="72" r="1.5" fill="#FEF3C7" />
          <rect x="28" y="52" width="10" height="12" fill="#60A5FA" stroke="#2563EB" />
          <rect x="62" y="52" width="10" height="12" fill="#60A5FA" stroke="#2563EB" />
        </svg>
      );
    case 'chair': // كُرْسِيٌّ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 20 L30 55 L70 55 L70 20" stroke="#92400E" fill="#D97706" />
          <rect x="25" y="52" width="50" height="10" rx="3" fill="#B45309" stroke="#78350F" />
          <line x1="30" y1="62" x2="26" y2="88" stroke="#78350F" strokeWidth="3" />
          <line x1="70" y1="62" x2="74" y2="88" stroke="#78350F" strokeWidth="3" />
          <line x1="35" y1="62" x2="35" y2="84" stroke="#78350F" strokeWidth="2" />
          <line x1="65" y1="62" x2="65" y2="84" stroke="#78350F" strokeWidth="2" />
        </svg>
      );
    case 'lamp': // مِصْبَاحٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 45 C35 25 65 25 65 45 C65 55 58 60 58 68 L42 68 C42 60 35 55 35 45 Z" fill="#FEF08A" stroke="#CA8A04" />
          <rect x="42" y="68" width="16" height="10" fill="#94A3B8" stroke="#475569" rx="2" />
          <path d="M46 78 L54 78 L50 84 Z" fill="#475569" />
          <line x1="20" y1="35" x2="10" y2="30" stroke="#EAB308" strokeWidth="2.5" />
          <line x1="80" y1="35" x2="90" y2="30" stroke="#EAB308" strokeWidth="2.5" />
          <line x1="50" y1="12" x2="50" y2="3" stroke="#EAB308" strokeWidth="2.5" />
          <line x1="22" y1="52" x2="12" y2="56" stroke="#EAB308" strokeWidth="2.5" />
          <line x1="78" y1="52" x2="88" y2="56" stroke="#EAB308" strokeWidth="2.5" />
        </svg>
      );
    case 'door': // بَابٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="25" y="15" width="50" height="75" rx="3" fill="#D97706" stroke="#78350F" />
          <rect x="30" y="22" width="18" height="28" fill="#FBBF24" stroke="#B45309" />
          <rect x="52" y="22" width="18" height="28" fill="#FBBF24" stroke="#B45309" />
          <rect x="30" y="55" width="18" height="28" fill="#FBBF24" stroke="#B45309" />
          <rect x="52" y="55" width="18" height="28" fill="#FBBF24" stroke="#B45309" />
          <circle cx="67" cy="53" r="2.5" fill="#1E293B" />
        </svg>
      );
    case 'bed': // سَرِيرٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="15" y="45" width="70" height="25" rx="4" fill="#38BDF8" stroke="#0284C7" />
          <path d="M15 30 L15 78 M85 40 L85 78" stroke="#475569" strokeWidth="4" />
          <rect x="20" y="38" width="22" height="15" rx="3" fill="#FFFFFF" stroke="#CBD5E1" />
          <rect x="20" y="53" width="60" height="17" fill="#60A5FA" stroke="#2563EB" />
        </svg>
      );
    case 'wall': // جِدَارٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="15" y="28" width="70" height="50" fill="#EA580C" stroke="#9A3412" rx="2" />
          <line x1="15" y1="40" x2="85" y2="40" stroke="#FFFFFF" />
          <line x1="15" y1="52" x2="85" y2="52" stroke="#FFFFFF" />
          <line x1="15" y1="65" x2="85" y2="65" stroke="#FFFFFF" />
          <line x1="38" y1="28" x2="38" y2="40" stroke="#FFFFFF" />
          <line x1="62" y1="28" x2="62" y2="40" stroke="#FFFFFF" />
          <line x1="26" y1="40" x2="26" y2="52" stroke="#FFFFFF" />
          <line x1="50" y1="40" x2="50" y2="52" stroke="#FFFFFF" />
          <line x1="74" y1="40" x2="74" y2="52" stroke="#FFFFFF" />
          <line x1="38" y1="52" x2="38" y2="65" stroke="#FFFFFF" />
          <line x1="62" y1="52" x2="62" y2="65" stroke="#FFFFFF" />
          <line x1="26" y1="65" x2="26" y2="78" stroke="#FFFFFF" />
          <line x1="50" y1="65" x2="50" y2="78" stroke="#FFFFFF" />
          <line x1="74" y1="65" x2="74" y2="78" stroke="#FFFFFF" />
        </svg>
      );
    case 'mosque': // مَسْجِدٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="25" y="50" width="50" height="38" fill="#ECFDF5" stroke="#059669" />
          <path d="M35 50 C35 30 65 30 65 50 Z" fill="#10B981" stroke="#047857" />
          <path d="M44 88 L44 70 C44 65 56 65 56 70 L56 88 Z" fill="#047857" />
          {/* Minaret Left */}
          <rect x="14" y="28" width="9" height="60" fill="#E2E8F0" stroke="#059669" />
          <path d="M14 28 L18.5 16 L23 28 Z" fill="#059669" />
          {/* Minaret Right */}
          <rect x="77" y="28" width="9" height="60" fill="#E2E8F0" stroke="#059669" />
          <path d="M77 28 L81.5 16 L86 28 Z" fill="#059669" />
          <circle cx="50" cy="24" r="2" fill="#FBBF24" />
        </svg>
      );
    case 'blackboard': // سَبُّورَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="15" y="20" width="70" height="45" rx="3" fill="#1E293B" stroke="#78350F" strokeWidth="4" />
          <line x1="25" y1="65" x2="20" y2="88" stroke="#78350F" strokeWidth="3" />
          <line x1="75" y1="65" x2="80" y2="88" stroke="#78350F" strokeWidth="3" />
          <line x1="22" y1="78" x2="78" y2="78" stroke="#78350F" strokeWidth="2.5" />
          <text x="32" y="45" fill="#E2E8F0" fontSize="11" fontFamily="sans-serif">ا ب ت</text>
        </svg>
      );
    case 'ruler': // مِسْطَرَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="10" y="38" width="80" height="24" rx="2" fill="#FDE047" stroke="#CA8A04" />
          <line x1="18" y1="38" x2="18" y2="48" stroke="#A16207" />
          <line x1="26" y1="38" x2="26" y2="45" stroke="#A16207" />
          <line x1="34" y1="38" x2="34" y2="48" stroke="#A16207" />
          <line x1="42" y1="38" x2="42" y2="45" stroke="#A16207" />
          <line x1="50" y1="38" x2="50" y2="50" stroke="#A16207" strokeWidth="2" />
          <line x1="58" y1="38" x2="58" y2="45" stroke="#A16207" />
          <line x1="66" y1="38" x2="66" y2="48" stroke="#A16207" />
          <line x1="74" y1="38" x2="74" y2="45" stroke="#A16207" />
          <line x1="82" y1="38" x2="82" y2="48" stroke="#A16207" />
        </svg>
      );
    case 'bag': // حَقِيبَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="38" width="60" height="48" rx="6" fill="#854D0E" stroke="#582900" />
          <path d="M38 38 L38 25 C38 20 62 20 62 25 L62 38" stroke="#582900" strokeWidth="3" />
          <path d="M20 52 L50 64 L80 52" stroke="#FEF08A" strokeWidth="2" />
          <circle cx="50" cy="65" r="3" fill="#FBBF24" />
          <line x1="35" y1="60" x2="35" y2="86" stroke="#582900" strokeDasharray="3 3" />
          <line x1="65" y1="60" x2="65" y2="86" stroke="#582900" strokeDasharray="3 3" />
        </svg>
      );
    case 'table': // طَاوِلَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,38 88,38 80,48 20,48" fill="#B45309" stroke="#78350F" />
          <rect x="18" y="48" width="64" height="6" fill="#92400E" />
          <line x1="22" y1="54" x2="16" y2="86" stroke="#78350F" strokeWidth="4" />
          <line x1="32" y1="54" x2="28" y2="80" stroke="#78350F" strokeWidth="3" />
          <line x1="78" y1="54" x2="84" y2="86" stroke="#78350F" strokeWidth="4" />
          <line x1="68" y1="54" x2="72" y2="80" stroke="#78350F" strokeWidth="3" />
        </svg>
      );
    case 'window': // نَافِذَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="22" y="20" width="56" height="60" rx="3" fill="#BFDBFE" stroke="#1E3A8A" strokeWidth="3" />
          <line x1="50" y1="20" x2="50" y2="80" stroke="#1E3A8A" strokeWidth="3" />
          <line x1="22" y1="50" x2="78" y2="50" stroke="#1E3A8A" strokeWidth="3" />
          {/* Curtains */}
          <path d="M22 20 Q35 50 22 80 L22 20 Z" fill="#F43F5E" opacity="0.6" />
          <path d="M78 20 Q65 50 78 80 L78 20 Z" fill="#F43F5E" opacity="0.6" />
        </svg>
      );
    case 'lock': // قُفْلٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 45 L34 30 C34 18 66 18 66 30 L66 45" stroke="#64748B" strokeWidth="4" />
          <rect x="26" y="45" width="48" height="42" rx="8" fill="#F59E0B" stroke="#B45309" />
          <circle cx="50" cy="62" r="4" fill="#78350F" />
          <polygon points="48,64 52,64 53,74 47,74" fill="#78350F" />
        </svg>
      );
    case 'key': // مِفْتَاحٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="50" r="16" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
          <circle cx="32" cy="50" r="7" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="2" />
          <line x1="48" y1="50" x2="85" y2="50" stroke="#CA8A04" strokeWidth="4" />
          <line x1="75" y1="50" x2="75" y2="62" stroke="#CA8A04" strokeWidth="3.5" />
          <line x1="83" y1="50" x2="83" y2="60" stroke="#CA8A04" strokeWidth="3.5" />
        </svg>
      );
    case 'clock': // سَاعَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="34" fill="#FFFFFF" stroke="#475569" strokeWidth="4" />
          <circle cx="50" cy="50" r="2.5" fill="#EF4444" />
          <line x1="50" y1="50" x2="50" y2="28" stroke="#1E293B" strokeWidth="3" />
          <line x1="50" y1="50" x2="68" y2="50" stroke="#1E293B" strokeWidth="2.5" />
          <line x1="50" y1="50" x2="38" y2="62" stroke="#EF4444" strokeWidth="1.5" />
          <circle cx="50" cy="20" r="1.5" fill="#475569" />
          <circle cx="80" cy="50" r="1.5" fill="#475569" />
          <circle cx="50" cy="80" r="1.5" fill="#475569" />
          <circle cx="20" cy="50" r="1.5" fill="#475569" />
        </svg>
      );
    case 'umbrella': // مِظَلَّةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 50 Q50 15 85 50 Q73 45 61 50 Q50 45 38 50 Q26 45 15 50 Z" fill="#0284C7" stroke="#0369A1" />
          <line x1="50" y1="20" x2="50" y2="78" stroke="#475569" strokeWidth="3" />
          <path d="M50 78 C50 86 42 86 42 80" stroke="#475569" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'glasses': // نَظَّارَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="52" r="16" fill="#E0F2FE" stroke="#1E293B" strokeWidth="3" />
          <circle cx="68" cy="52" r="16" fill="#E0F2FE" stroke="#1E293B" strokeWidth="3" />
          <path d="M48 50 Q50 46 52 50" stroke="#1E293B" strokeWidth="3" fill="none" />
          <line x1="16" y1="50" x2="8" y2="40" stroke="#1E293B" strokeWidth="2.5" />
          <line x1="84" y1="50" x2="92" y2="40" stroke="#1E293B" strokeWidth="2.5" />
        </svg>
      );
    case 'car': // سَيَّارَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 62 L22 45 Q32 32 45 32 L65 32 Q78 32 85 45 L92 62 Z" fill="#DC2626" stroke="#991B1B" />
          <rect x="10" y="60" width="80" height="15" rx="3" fill="#EF4444" stroke="#991B1B" />
          <circle cx="30" cy="75" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          <circle cx="70" cy="75" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          <circle cx="30" cy="75" r="3" fill="#E2E8F0" />
          <circle cx="70" cy="75" r="3" fill="#E2E8F0" />
          <path d="M35 40 L60 40 L60 52 L30 52 Z" fill="#93C5FD" stroke="#1D4ED8" />
        </svg>
      );
    case 'bicycle': // دَرَّاجَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="25" cy="65" r="16" stroke="#334155" strokeWidth="3" />
          <circle cx="75" cy="65" r="16" stroke="#334155" strokeWidth="3" />
          <polygon points="25,65 48,65 62,42 42,42" stroke="#0284C7" strokeWidth="3" />
          <line x1="48" y1="65" x2="38" y2="34" stroke="#0284C7" strokeWidth="3" />
          <line x1="32" y1="34" x2="44" y2="34" stroke="#1E293B" strokeWidth="3" />
          <line x1="75" y1="65" x2="62" y2="34" stroke="#0284C7" strokeWidth="3" />
          <line x1="58" y1="34" x2="68" y2="34" stroke="#1E293B" strokeWidth="3" />
        </svg>
      );
    case 'flag': // عَلَمٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="25" y1="12" x2="25" y2="88" stroke="#475569" strokeWidth="4" />
          <path d="M25 18 Q50 26 78 18 L78 50 Q50 58 25 50 Z" fill="#047857" stroke="#064E3B" />
          <circle cx="48" cy="34" r="9" fill="#DC2626" />
        </svg>
      );
    case 'fan': // مِرْوَحَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="50" y1="10" x2="50" y2="45" stroke="#475569" strokeWidth="3" />
          <circle cx="50" cy="50" r="10" fill="#0284C7" stroke="#0369A1" />
          {/* 3 blades */}
          <path d="M50 40 C45 20 55 20 50 40 Z" fill="#38BDF8" />
          <path d="M42 55 C25 65 30 75 42 55 Z" fill="#38BDF8" />
          <path d="M58 55 C75 65 70 75 58 55 Z" fill="#38BDF8" />
        </svg>
      );
    case 'tree': // شَجَرَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="44" y="58" width="12" height="32" fill="#78350F" stroke="#451A03" rx="2" />
          <circle cx="50" cy="40" r="24" fill="#16A34A" stroke="#15803D" />
          <circle cx="36" cy="48" r="16" fill="#22C55E" stroke="#15803D" />
          <circle cx="64" cy="48" r="16" fill="#22C55E" stroke="#15803D" />
          <circle cx="50" cy="28" r="14" fill="#4ADE80" stroke="#15803D" />
        </svg>
      );
    case 'rose': // وَرْدَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 55 Q48 75 52 90" stroke="#15803D" strokeWidth="3" />
          <path d="M50 72 Q35 65 42 80" fill="#22C55E" stroke="#15803D" />
          <circle cx="50" cy="38" r="18" fill="#E11D48" stroke="#9F1239" strokeWidth="2.5" />
          <circle cx="50" cy="38" r="10" fill="#FB7185" stroke="#BE123C" />
          <circle cx="50" cy="38" r="4" fill="#FDA4AF" />
        </svg>
      );
    case 'fish': // سَمَكَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M78 50 C60 30 25 35 15 50 C25 65 60 70 78 50 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
          <polygon points="76,50 92,34 92,66" fill="#0284C7" stroke="#0369A1" />
          <circle cx="30" cy="46" r="2.5" fill="#0F172A" />
          <path d="M45 42 Q52 50 45 58" stroke="#0284C7" />
          <path d="M55 42 Q62 50 55 58" stroke="#0284C7" />
        </svg>
      );
    case 'egg': // بَيْضَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="50" cy="54" rx="26" ry="34" fill="#FFFBEB" stroke="#D97706" />
          <ellipse cx="44" cy="46" rx="6" ry="10" fill="#FEF3C7" opacity="0.6" />
        </svg>
      );
    case 'milk': // لَبَنٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 30 L65 30 L62 85 L38 85 Z" fill="#F8FAFC" stroke="#64748B" />
          <path d="M36 50 Q50 56 64 50 L62 84 L38 84 Z" fill="#E2E8F0" />
          <ellipse cx="50" cy="30" rx="15" ry="4" fill="#FFFFFF" stroke="#64748B" />
        </svg>
      );
    case 'bread': // خُبْزٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="50" cy="55" rx="34" ry="20" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          <path d="M32 50 Q40 45 42 55" stroke="#78350F" strokeWidth="2" />
          <path d="M48 48 Q55 43 57 53" stroke="#78350F" strokeWidth="2" />
          <path d="M62 52 Q68 47 70 56" stroke="#78350F" strokeWidth="2" />
        </svg>
      );
    case 'apple': // تُفَّاحَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 35 C38 20 20 30 20 52 C20 74 38 85 50 82 C62 85 80 74 80 52 C80 30 62 20 50 35 Z" fill="#DC2626" stroke="#991B1B" />
          <path d="M50 35 Q50 18 56 16" stroke="#78350F" strokeWidth="3" />
          <path d="M54 22 Q68 18 64 28 Z" fill="#16A34A" stroke="#15803D" />
        </svg>
      );
    case 'watermelon': // بَطِّيخَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 50 Q50 90 80 50 Z" fill="#15803D" stroke="#166534" strokeWidth="3" />
          <path d="M25 50 Q50 84 75 50 Z" fill="#EF4444" stroke="#DC2626" />
          <circle cx="40" cy="58" r="1.5" fill="#0F172A" />
          <circle cx="50" cy="64" r="1.5" fill="#0F172A" />
          <circle cx="60" cy="58" r="1.5" fill="#0F172A" />
        </svg>
      );
    case 'spoon': // مِلْعَقَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="30" cy="30" rx="14" ry="18" transform="rotate(-45 30 30)" fill="#E2E8F0" stroke="#64748B" />
          <path d="M38 38 L76 76" stroke="#64748B" strokeWidth="4" />
          <circle cx="78" cy="78" r="3" fill="#64748B" />
        </svg>
      );
    case 'cup': // فِنْجَانٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M25 35 L70 35 L64 70 C64 78 31 78 31 70 Z" fill="#F8FAFC" stroke="#0284C7" strokeWidth="3" />
          <path d="M70 42 C82 42 82 62 67 62" stroke="#0284C7" strokeWidth="3" fill="none" />
          <ellipse cx="47.5" cy="80" rx="30" ry="5" fill="#E2E8F0" stroke="#64748B" />
        </svg>
      );
    case 'sword': // سَيْفٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M85 15 Q60 40 28 65 L22 62 L25 72 L35 75 L32 69 Q60 40 85 15 Z" fill="#E2E8F0" stroke="#475569" />
          <line x1="20" y1="62" x2="36" y2="78" stroke="#F59E0B" strokeWidth="4" />
          <line x1="24" y1="74" x2="14" y2="84" stroke="#78350F" strokeWidth="4" />
          <circle cx="12" cy="86" r="3" fill="#F59E0B" />
        </svg>
      );
    case 'arrow': // سَهْمٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="20" y1="80" x2="75" y2="25" stroke="#78350F" strokeWidth="3" />
          <polygon points="75,25 60,25 75,40" fill="#475569" stroke="#1E293B" />
          <path d="M20 80 L14 74 M20 80 L26 86 M25 75 L19 69 M30 70 L24 64" stroke="#EF4444" strokeWidth="2" />
        </svg>
      );
    case 'boat': // زَوْرَقٌ / بَاخِرَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 62 L85 62 L75 78 L25 78 Z" fill="#B45309" stroke="#78350F" />
          <polygon points="50,20 50,58 75,58" fill="#F8FAFC" stroke="#0284C7" />
          <polygon points="46,26 46,58 26,58" fill="#38BDF8" stroke="#0284C7" />
          <line x1="48" y1="18" x2="48" y2="62" stroke="#475569" strokeWidth="3" />
          <path d="M10 84 Q25 80 40 84 Q55 88 70 84 Q85 80 95 84" stroke="#0284C7" strokeWidth="2.5" />
        </svg>
      );
    case 'mountain': // جَبَلٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="50,22 15,80 85,80" fill="#64748B" stroke="#334155" />
          <polygon points="50,22 40,42 48,38 52,44 60,38" fill="#F8FAFC" stroke="#CBD5E1" />
          <polygon points="72,42 55,80 90,80" fill="#94A3B8" stroke="#475569" />
        </svg>
      );
    // --- PEOPLE & FAMILY ---
    case 'boy': // وَلَدٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="38" r="16" fill="#FED7AA" stroke="#EA580C" />
          {/* Cap / Hair */}
          <path d="M34 34 Q50 18 66 34" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
          <circle cx="44" cy="38" r="2" fill="#1E293B" />
          <circle cx="56" cy="38" r="2" fill="#1E293B" />
          <path d="M45 45 Q50 49 55 45" stroke="#EA580C" strokeWidth="2" />
          {/* Shirt */}
          <path d="M30 82 L34 54 Q50 50 66 54 L70 82 Z" fill="#38BDF8" stroke="#0284C7" />
          <polygon points="50,54 44,64 56,64" fill="#FFFFFF" stroke="#0284C7" />
        </svg>
      );
    case 'girl': // بِنْتٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hijab / Scarf */}
          <path d="M28 42 C28 18 72 18 72 42 C72 65 68 82 50 82 C32 82 28 65 28 42 Z" fill="#F472B6" stroke="#DB2777" />
          {/* Face */}
          <ellipse cx="50" cy="42" rx="14" ry="16" fill="#FED7AA" stroke="#EA580C" />
          <circle cx="45" cy="40" r="1.8" fill="#1E293B" />
          <circle cx="55" cy="40" r="1.8" fill="#1E293B" />
          <path d="M46 48 Q50 51 54 48" stroke="#EA580C" strokeWidth="2" />
          {/* Robe */}
          <path d="M26 84 L32 68 Q50 64 68 68 L74 84 Z" fill="#EC4899" stroke="#BE185D" />
        </svg>
      );
    case 'man': // رَجُلٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="38" r="16" fill="#FED7AA" stroke="#D97706" />
          {/* Turban / Kufi */}
          <path d="M34 32 Q50 16 66 32 Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
          {/* Beard */}
          <path d="M38 42 C38 60 62 60 62 42 Z" fill="#334155" stroke="#1E293B" />
          <circle cx="44" cy="36" r="2" fill="#1E293B" />
          <circle cx="56" cy="36" r="2" fill="#1E293B" />
          {/* Thobe */}
          <path d="M26 86 L32 54 Q50 50 68 54 L74 86 Z" fill="#F8FAFC" stroke="#94A3B8" />
        </svg>
      );
    case 'woman': // اِمْرَأَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M26 40 C26 14 74 14 74 40 C74 68 68 86 50 86 C32 86 26 68 26 40 Z" fill="#0D9488" stroke="#0F766E" />
          <ellipse cx="50" cy="40" rx="14" ry="16" fill="#FED7AA" stroke="#D97706" />
          <circle cx="44" cy="38" r="2" fill="#1E293B" />
          <circle cx="56" cy="38" r="2" fill="#1E293B" />
          <path d="M46 47 Q50 50 54 47" stroke="#D97706" strokeWidth="2" />
          <path d="M24 88 L32 70 Q50 66 68 70 L76 88 Z" fill="#047857" stroke="#065F46" />
        </svg>
      );
    case 'student_boy': // تِلْمِيذٌ / طَالِبٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="36" r="15" fill="#FED7AA" stroke="#D97706" />
          <path d="M35 32 Q50 18 65 32" fill="#1E293B" stroke="#0F172A" />
          {/* Glasses */}
          <circle cx="44" cy="36" r="4.5" stroke="#1E293B" strokeWidth="1.8" />
          <circle cx="56" cy="36" r="4.5" stroke="#1E293B" strokeWidth="1.8" />
          <line x1="48.5" y1="36" x2="51.5" y2="36" stroke="#1E293B" strokeWidth="2" />
          <path d="M46 44 Q50 47 54 44" stroke="#D97706" />
          {/* Backpack & Shirt */}
          <path d="M30 84 L35 52 Q50 48 65 52 L70 84 Z" fill="#10B981" stroke="#047857" />
          <line x1="38" y1="52" x2="38" y2="84" stroke="#047857" strokeWidth="3" />
          <line x1="62" y1="52" x2="62" y2="84" stroke="#047857" strokeWidth="3" />
        </svg>
      );
    case 'student_girl': // تِلْمِيذَةٌ / طَالِبَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 38 C30 16 70 16 70 38 C70 64 66 84 50 84 C34 84 30 64 30 38 Z" fill="#8B5CF6" stroke="#6D28D9" />
          <ellipse cx="50" cy="38" rx="13" ry="15" fill="#FED7AA" stroke="#D97706" />
          <circle cx="45" cy="36" r="1.8" fill="#1E293B" />
          <circle cx="55" cy="36" r="1.8" fill="#1E293B" />
          <path d="M46 44 Q50 47 54 44" stroke="#D97706" strokeWidth="2" />
          {/* Book in hand */}
          <rect x="40" y="66" width="20" height="16" rx="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
        </svg>
      );
    case 'teacher': // مُعَلِّمٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="32" r="15" fill="#FED7AA" stroke="#D97706" />
          <path d="M35 28 Q50 14 65 28" fill="#475569" stroke="#1E293B" />
          <circle cx="45" cy="32" r="2" fill="#1E293B" />
          <circle cx="55" cy="32" r="2" fill="#1E293B" />
          <path d="M46 39 Q50 42 54 39" stroke="#D97706" />
          {/* Suit & Pointer */}
          <path d="M28 86 L34 50 Q50 46 66 50 L72 86 Z" fill="#1E3A8A" stroke="#172554" />
          <polygon points="50,50 45,64 55,64" fill="#FFFFFF" stroke="#94A3B8" />
          <line x1="72" y1="58" x2="88" y2="34" stroke="#F59E0B" strokeWidth="3" />
        </svg>
      );
    case 'doctor': // طَبِيبٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="32" r="15" fill="#FED7AA" stroke="#D97706" />
          <circle cx="45" cy="32" r="2" fill="#1E293B" />
          <circle cx="55" cy="32" r="2" fill="#1E293B" />
          <path d="M46 39 Q50 42 54 39" stroke="#D97706" />
          {/* White Doctor Coat */}
          <path d="M28 86 L34 50 Q50 46 66 50 L72 86 Z" fill="#F8FAFC" stroke="#64748B" />
          {/* Stethoscope */}
          <path d="M40 50 Q40 68 50 68 Q60 68 60 50" stroke="#0284C7" strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="71" r="3.5" fill="#94A3B8" stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="50" cy="15" r="3" fill="#EF4444" />
        </svg>
      );
    case 'merchant': // تَاجِرٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="32" r="14" fill="#FED7AA" stroke="#D97706" />
          <path d="M36 28 Q50 16 64 28" fill="#78350F" stroke="#451A03" />
          {/* Shop Scale */}
          <path d="M28 86 L34 50 Q50 46 66 50 L72 86 Z" fill="#D97706" stroke="#92400E" />
          <line x1="20" y1="62" x2="40" y2="62" stroke="#F59E0B" strokeWidth="2.5" />
          <line x1="30" y1="54" x2="30" y2="72" stroke="#F59E0B" strokeWidth="2.5" />
          <polygon points="20,62 16,72 24,72" fill="#FEF3C7" stroke="#F59E0B" />
          <polygon points="40,62 36,72 44,72" fill="#FEF3C7" stroke="#F59E0B" />
        </svg>
      );
    case 'farmer': // فَلَّاحٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Straw Hat */}
          <polygon points="18,34 82,34 68,16 32,16" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.5" />
          <circle cx="50" cy="40" r="13" fill="#FED7AA" stroke="#D97706" />
          <circle cx="45" cy="40" r="1.8" fill="#1E293B" />
          <circle cx="55" cy="40" r="1.8" fill="#1E293B" />
          {/* Overall */}
          <path d="M30 86 L36 56 Q50 52 64 56 L70 86 Z" fill="#15803D" stroke="#166534" />
          {/* Wheat sheaf */}
          <line x1="74" y1="84" x2="84" y2="44" stroke="#EAB308" strokeWidth="3" />
          <circle cx="85" cy="42" r="4" fill="#FDE047" stroke="#CA8A04" />
        </svg>
      );
    case 'child': // طِفْلٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="42" r="18" fill="#FED7AA" stroke="#EA580C" />
          {/* Hair curl */}
          <path d="M50 24 Q53 16 56 22" stroke="#78350F" strokeWidth="3" fill="none" />
          <circle cx="43" cy="42" r="2.5" fill="#1E293B" />
          <circle cx="57" cy="42" r="2.5" fill="#1E293B" />
          <path d="M45 50 Q50 55 55 50" stroke="#EA580C" strokeWidth="2.5" />
          {/* Cheeks */}
          <circle cx="38" cy="46" r="3" fill="#FDA4AF" opacity="0.7" />
          <circle cx="62" cy="46" r="3" fill="#FDA4AF" opacity="0.7" />
          <path d="M35 84 L40 64 Q50 60 60 64 L65 84 Z" fill="#FDE047" stroke="#EAB308" />
        </svg>
      );
    case 'friend': // صَدِيقٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Friend */}
          <circle cx="36" cy="38" r="12" fill="#FED7AA" stroke="#D97706" />
          <path d="M22 84 L26 56 Q36 52 46 56 L50 84 Z" fill="#0284C7" stroke="#0369A1" />
          {/* Right Friend */}
          <circle cx="64" cy="38" r="12" fill="#FED7AA" stroke="#D97706" />
          <path d="M50 84 L54 56 Q64 52 74 56 L78 84 Z" fill="#10B981" stroke="#047857" />
          {/* Hugging arm */}
          <path d="M36 62 Q50 56 64 62" stroke="#D97706" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'father': // أَبٌ / وَالِدٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="44" cy="34" r="14" fill="#FED7AA" stroke="#D97706" />
          <path d="M32 28 Q44 16 56 28" fill="#334155" />
          <path d="M28 86 L32 50 Q44 46 56 50 L60 86 Z" fill="#0F766E" stroke="#115E59" />
          {/* Holding Child Hand */}
          <circle cx="72" cy="54" r="9" fill="#FED7AA" stroke="#D97706" />
          <path d="M64 86 L66 66 Q72 63 78 66 L80 86 Z" fill="#38BDF8" stroke="#0284C7" />
          <path d="M56 64 L65 72" stroke="#D97706" strokeWidth="2.5" />
        </svg>
      );
    case 'mother': // أُمٌّ / وَالِدَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M26 36 C26 14 66 14 66 36 C66 62 60 84 46 84 C32 84 26 62 26 36 Z" fill="#E11D48" stroke="#BE123C" />
          <ellipse cx="46" cy="36" rx="12" ry="14" fill="#FED7AA" stroke="#D97706" />
          <path d="M24 86 L30 66 Q46 62 62 66 L68 86 Z" fill="#BE123C" stroke="#9F1239" />
          {/* Child in arms */}
          <circle cx="70" cy="56" r="9" fill="#FED7AA" stroke="#D97706" />
          <ellipse cx="72" cy="74" rx="10" ry="12" fill="#FDE047" stroke="#CA8A04" />
        </svg>
      );

    // --- PLACES & ENVIRONMENTS ---
    case 'garden': // حَدِيقَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Ground */}
          <rect x="10" y="65" width="80" height="25" rx="4" fill="#86EFAC" stroke="#16A34A" />
          {/* Tree */}
          <rect x="25" y="45" width="8" height="25" fill="#78350F" />
          <circle cx="29" cy="35" r="16" fill="#22C55E" stroke="#15803D" />
          {/* Flowers */}
          <circle cx="55" cy="62" r="5" fill="#F43F5E" />
          <circle cx="55" cy="62" r="2" fill="#FEF08A" />
          <line x1="55" y1="67" x2="55" y2="76" stroke="#16A34A" strokeWidth="2" />
          <circle cx="75" cy="60" r="5" fill="#EAB308" />
          <circle cx="75" cy="60" r="2" fill="#F43F5E" />
          <line x1="75" y1="65" x2="75" y2="76" stroke="#16A34A" strokeWidth="2" />
          {/* Fence */}
          <line x1="42" y1="72" x2="88" y2="72" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );
    case 'street': // شَارِعٌ / طَرِيقٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="35,15 65,15 88,85 12,85" fill="#334155" stroke="#1E293B" />
          {/* Road dashes */}
          <line x1="50" y1="22" x2="50" y2="34" stroke="#FDE047" strokeWidth="3" />
          <line x1="50" y1="44" x2="50" y2="58" stroke="#FDE047" strokeWidth="3.5" />
          <line x1="50" y1="68" x2="50" y2="84" stroke="#FDE047" strokeWidth="4" />
          {/* Sidewalk */}
          <polygon points="65,15 72,15 95,85 88,85" fill="#94A3B8" />
          <polygon points="35,15 28,15 5,85 12,85" fill="#94A3B8" />
        </svg>
      );
    case 'market': // سُوقٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Awning */}
          <polygon points="15,40 85,40 78,25 22,25" fill="#DC2626" stroke="#991B1B" />
          <path d="M15 40 Q22 46 29 40 Q36 46 43 40 Q50 46 57 40 Q64 46 71 40 Q78 46 85 40" fill="#EF4444" stroke="#B91C1C" />
          {/* Stall body */}
          <rect x="22" y="44" width="56" height="38" fill="#FDE68A" stroke="#D97706" />
          {/* Produce boxes */}
          <circle cx="34" cy="60" r="5" fill="#EF4444" />
          <circle cx="44" cy="60" r="5" fill="#EF4444" />
          <circle cx="56" cy="60" r="5" fill="#22C55E" />
          <circle cx="66" cy="60" r="5" fill="#22C55E" />
          <line x1="22" y1="68" x2="78" y2="68" stroke="#D97706" strokeWidth="2" />
        </svg>
      );
    case 'village': // قَرْيَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Green hill */}
          <path d="M5 85 Q50 60 95 85 Z" fill="#86EFAC" stroke="#16A34A" />
          {/* Thatched cottage */}
          <polygon points="25,48 55,48 40,30" fill="#F59E0B" stroke="#B45309" />
          <rect x="28" y="48" width="24" height="24" fill="#FEF3C7" stroke="#D97706" />
          <rect x="36" y="58" width="8" height="14" fill="#78350F" />
          {/* Palm tree */}
          <path d="M72 75 Q70 50 78 40" stroke="#78350F" strokeWidth="3" fill="none" />
          <path d="M78 40 Q66 32 60 40 M78 40 Q84 28 92 34 M78 40 Q88 44 94 52" stroke="#15803D" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'city': // مَدِينَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Buildings */}
          <rect x="12" y="40" width="22" height="46" fill="#64748B" stroke="#334155" />
          <rect x="38" y="20" width="26" height="66" fill="#38BDF8" stroke="#0284C7" />
          <rect x="68" y="34" width="20" height="52" fill="#94A3B8" stroke="#475569" />
          {/* Windows */}
          <rect x="44" y="28" width="4" height="6" fill="#FEF08A" />
          <rect x="54" y="28" width="4" height="6" fill="#FEF08A" />
          <rect x="44" y="40" width="4" height="6" fill="#FEF08A" />
          <rect x="54" y="40" width="4" height="6" fill="#FEF08A" />
          <rect x="18" y="48" width="4" height="6" fill="#FFFFFF" />
          <rect x="74" y="44" width="4" height="6" fill="#FFFFFF" />
        </svg>
      );
    case 'kitchen': // مَطْبَخٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Countertop */}
          <rect x="15" y="52" width="70" height="34" rx="2" fill="#E2E8F0" stroke="#475569" />
          <line x1="15" y1="58" x2="85" y2="58" stroke="#475569" strokeWidth="3" />
          <rect x="22" y="64" width="28" height="18" fill="#F8FAFC" stroke="#64748B" />
          <rect x="54" y="64" width="24" height="18" fill="#F8FAFC" stroke="#64748B" />
          {/* Pot on stove */}
          <ellipse cx="36" cy="46" rx="12" ry="6" fill="#94A3B8" stroke="#475569" />
          <path d="M24 46 L24 52 L48 52 L48 46 Z" fill="#64748B" />
          <path d="M34 38 Q36 34 34 30" stroke="#F59E0B" strokeWidth="2" fill="none" />
        </svg>
      );

    // --- FOODS & DRINKS ---
    case 'grapes': // عِنَبٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Stem & Leaf */}
          <path d="M50 20 Q54 10 60 12" stroke="#78350F" strokeWidth="3" fill="none" />
          <path d="M50 20 Q66 14 62 26 Z" fill="#22C55E" stroke="#15803D" />
          {/* Grapes cluster */}
          <circle cx="42" cy="32" r="7" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
          <circle cx="58" cy="32" r="7" fill="#7C3AED" stroke="#5B21B6" strokeWidth="2" />
          <circle cx="50" cy="42" r="7" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
          <circle cx="36" cy="46" r="7" fill="#7C3AED" stroke="#5B21B6" strokeWidth="2" />
          <circle cx="64" cy="46" r="7" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
          <circle cx="43" cy="58" r="7" fill="#7C3AED" stroke="#5B21B6" strokeWidth="2" />
          <circle cx="57" cy="58" r="7" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
          <circle cx="50" cy="70" r="7" fill="#7C3AED" stroke="#5B21B6" strokeWidth="2" />
          <circle cx="50" cy="80" r="5" fill="#6D28D9" stroke="#4C1D95" strokeWidth="2" />
        </svg>
      );
    case 'dates': // تَمْرٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bowl of dates */}
          <ellipse cx="50" cy="62" rx="34" ry="14" fill="#E2E8F0" stroke="#64748B" />
          <path d="M16 62 Q50 88 84 62 Z" fill="#CBD5E1" stroke="#64748B" />
          {/* 3 Dates */}
          <ellipse cx="40" cy="50" rx="10" ry="16" transform="rotate(-20 40 50)" fill="#78350F" stroke="#451A03" />
          <ellipse cx="58" cy="48" rx="10" ry="16" transform="rotate(20 58 48)" fill="#92400E" stroke="#451A03" />
          <ellipse cx="50" cy="42" rx="9" ry="15" fill="#B45309" stroke="#78350F" />
        </svg>
      );
    case 'water': // مَاءٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Water drop */}
          <path d="M50 18 C50 18 24 54 24 66 C24 80 36 88 50 88 C64 88 76 80 76 66 C76 54 50 18 50 18 Z" fill="#38BDF8" stroke="#0284C7" />
          {/* Highlight */}
          <path d="M38 60 Q34 68 40 76" stroke="#FFFFFF" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'tea': // شَايٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="50" cy="78" rx="32" ry="6" fill="#E2E8F0" stroke="#64748B" />
          <path d="M28 42 L32 72 Q50 78 68 72 L72 42 Z" fill="#F8FAFC" stroke="#0284C7" strokeWidth="3" />
          <ellipse cx="50" cy="42" rx="22" ry="6" fill="#B45309" stroke="#78350F" />
          {/* Handle */}
          <path d="M70 48 Q82 56 68 64" stroke="#0284C7" strokeWidth="3" fill="none" />
          {/* Steam */}
          <path d="M44 32 Q42 22 46 16" stroke="#94A3B8" strokeWidth="2" fill="none" />
          <path d="M54 30 Q56 20 52 14" stroke="#94A3B8" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'meat': // لَحْمٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M25 54 C15 36 40 24 65 35 C82 42 88 64 74 76 C55 88 35 72 25 54 Z" fill="#DC2626" stroke="#991B1B" />
          {/* Bone */}
          <circle cx="48" cy="52" r="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="48" cy="52" r="3" fill="#E2E8F0" />
          {/* Fat ring */}
          <path d="M28 50 C26 40 40 32 60 38" stroke="#FEE2E2" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'honey': // عَسَلٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Honey Jar */}
          <rect x="30" y="24" width="40" height="10" rx="3" fill="#FDE047" stroke="#CA8A04" />
          <path d="M28 34 Q24 50 26 76 Q50 88 74 76 Q76 50 72 34 Z" fill="#F59E0B" stroke="#B45309" />
          {/* Honey Label */}
          <rect x="36" y="48" width="28" height="16" rx="3" fill="#FEF3C7" stroke="#D97706" />
          <text x="42" y="60" fill="#B45309" fontSize="10" fontWeight="bold">عَسَل</text>
        </svg>
      );

    // --- KITCHENWARE & TOOLS ---
    case 'pitcher': // إِبْرِيقٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="50" cy="24" rx="14" ry="4" fill="#F8FAFC" stroke="#0284C7" />
          <path d="M38 24 L34 50 Q30 78 50 82 Q70 78 66 50 L62 24 Z" fill="#38BDF8" stroke="#0284C7" />
          {/* Spout */}
          <path d="M36 34 L18 26 L26 44 Z" fill="#0284C7" stroke="#0369A1" />
          {/* Handle */}
          <path d="M64 34 Q82 50 64 68" stroke="#0284C7" strokeWidth="4" fill="none" />
        </svg>
      );
    case 'plate': // صَحْنٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="50" cy="52" rx="42" ry="24" fill="#F8FAFC" stroke="#64748B" strokeWidth="3" />
          <ellipse cx="50" cy="52" rx="28" ry="15" fill="#E2E8F0" stroke="#0284C7" strokeWidth="2" />
        </svg>
      );
    case 'knife': // سِكِّينٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Shiny Blade */}
          <path d="M22 56 L68 56 Q84 56 80 44 L22 44 Z" fill="#E2E8F0" stroke="#475569" />
          {/* Handle */}
          <rect x="10" y="44" width="18" height="12" rx="3" fill="#78350F" stroke="#451A03" />
          <circle cx="16" cy="50" r="1.5" fill="#FDE047" />
          <circle cx="22" cy="50" r="1.5" fill="#FDE047" />
        </svg>
      );
    case 'pot': // قِدْرٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Lid */}
          <path d="M24 38 Q50 28 76 38 Z" fill="#CBD5E1" stroke="#475569" />
          <circle cx="50" cy="28" r="4" fill="#78350F" stroke="#451A03" />
          {/* Pot body */}
          <rect x="22" y="38" width="56" height="42" rx="6" fill="#64748B" stroke="#334155" />
          {/* Side handles */}
          <path d="M22 46 Q10 46 22 54" stroke="#334155" strokeWidth="3" fill="none" />
          <path d="M78 46 Q90 46 78 54" stroke="#334155" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'stove': // مَوْقِدٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="18" y="44" width="64" height="42" rx="6" fill="#334155" stroke="#0F172A" />
          <circle cx="36" cy="38" r="12" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
          <circle cx="64" cy="38" r="12" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
          {/* Blue Flame */}
          <path d="M36 34 Q38 24 36 20 Q34 26 36 34 Z" fill="#38BDF8" />
          <path d="M64 34 Q66 24 64 20 Q62 26 64 34 Z" fill="#38BDF8" />
          {/* Knobs */}
          <circle cx="36" cy="65" r="4" fill="#E2E8F0" stroke="#0F172A" />
          <circle cx="64" cy="65" r="4" fill="#E2E8F0" stroke="#0F172A" />
        </svg>
      );
    case 'box': // صُنْدُوقٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="18,36 50,22 82,36 50,50" fill="#D97706" stroke="#78350F" />
          <polygon points="18,36 50,50 50,82 18,68" fill="#B45309" stroke="#78350F" />
          <polygon points="82,36 50,50 50,82 82,68" fill="#92400E" stroke="#78350F" />
          <line x1="50" y1="50" x2="50" y2="58" stroke="#FDE047" strokeWidth="3" />
        </svg>
      );

    // --- ANIMALS & BIRDS ---
    case 'cat': // قِطٌّ / هِرٌّ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Head & Ears */}
          <circle cx="50" cy="48" r="22" fill="#F59E0B" stroke="#B45309" />
          <polygon points="30,34 36,12 46,28" fill="#F59E0B" stroke="#B45309" />
          <polygon points="70,34 64,12 54,28" fill="#F59E0B" stroke="#B45309" />
          {/* Eyes & Nose */}
          <ellipse cx="42" cy="46" rx="3.5" ry="5" fill="#10B981" />
          <circle cx="42" cy="46" r="1.5" fill="#0F172A" />
          <ellipse cx="58" cy="46" rx="3.5" ry="5" fill="#10B981" />
          <circle cx="58" cy="46" r="1.5" fill="#0F172A" />
          <polygon points="48,54 52,54 50,57" fill="#F43F5E" />
          {/* Whiskers */}
          <line x1="34" y1="54" x2="18" y2="52" stroke="#451A03" strokeWidth="1.5" />
          <line x1="34" y1="58" x2="18" y2="60" stroke="#451A03" strokeWidth="1.5" />
          <line x1="66" y1="54" x2="82" y2="52" stroke="#451A03" strokeWidth="1.5" />
          <line x1="66" y1="58" x2="82" y2="60" stroke="#451A03" strokeWidth="1.5" />
          <path d="M35 70 Q50 86 65 70 Z" fill="#D97706" stroke="#B45309" />
        </svg>
      );
    case 'dog': // كَلْبٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="46" r="22" fill="#D97706" stroke="#78350F" />
          {/* Floppy ears */}
          <ellipse cx="26" cy="44" rx="7" ry="15" transform="rotate(-15 26 44)" fill="#78350F" stroke="#451A03" />
          <ellipse cx="74" cy="44" rx="7" ry="15" transform="rotate(15 74 44)" fill="#78350F" stroke="#451A03" />
          <circle cx="42" cy="42" r="3" fill="#1E293B" />
          <circle cx="58" cy="42" r="3" fill="#1E293B" />
          <ellipse cx="50" cy="54" rx="6" ry="4" fill="#1E293B" />
          <path d="M46 58 Q50 64 54 58" stroke="#78350F" strokeWidth="2" />
        </svg>
      );
    case 'horse': // فَرَسٌ / حِصَانٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Horse profile */}
          <path d="M30 78 L34 50 Q36 30 52 24 L68 28 L78 48 L62 56 L54 78 Z" fill="#92400E" stroke="#451A03" />
          {/* Mane */}
          <path d="M34 50 Q28 40 34 30 Q28 22 36 18 Q46 14 52 24" fill="#451A03" stroke="#1E0A00" />
          <polygon points="54,20 60,12 62,22" fill="#92400E" stroke="#451A03" />
          <circle cx="64" cy="38" r="2.5" fill="#1E293B" />
          <circle cx="74" cy="48" r="1.5" fill="#1E293B" />
        </svg>
      );
    case 'camel': // جَمَلٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hump & Neck */}
          <path d="M18 78 L26 56 Q38 40 50 42 Q60 26 70 42 Q78 30 84 26 L92 34 L82 48 Q78 65 82 78 Z" fill="#D97706" stroke="#92400E" />
          <circle cx="84" cy="32" r="2" fill="#1E293B" />
        </svg>
      );
    case 'cow': // بَقَرَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="48" r="22" fill="#FFFFFF" stroke="#334155" />
          {/* Horns */}
          <path d="M32 34 Q24 20 30 18" stroke="#D97706" strokeWidth="3" fill="none" />
          <path d="M68 34 Q76 20 70 18" stroke="#D97706" strokeWidth="3" fill="none" />
          {/* Spots */}
          <circle cx="38" cy="42" r="6" fill="#1E293B" />
          <circle cx="62" cy="42" r="3" fill="#1E293B" />
          {/* Snout */}
          <ellipse cx="50" cy="58" rx="14" ry="9" fill="#FDA4AF" stroke="#E11D48" />
          <circle cx="44" cy="58" r="2" fill="#9F1239" />
          <circle cx="56" cy="58" r="2" fill="#9F1239" />
        </svg>
      );
    case 'sheep': // شَاةٌ / خَرُوفٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Fluffy wool */}
          <circle cx="35" cy="50" r="14" fill="#F8FAFC" stroke="#94A3B8" />
          <circle cx="65" cy="50" r="14" fill="#F8FAFC" stroke="#94A3B8" />
          <circle cx="50" cy="36" r="14" fill="#F8FAFC" stroke="#94A3B8" />
          <circle cx="50" cy="62" r="14" fill="#F8FAFC" stroke="#94A3B8" />
          <circle cx="50" cy="50" r="16" fill="#F8FAFC" />
          {/* Face */}
          <ellipse cx="50" cy="48" rx="10" ry="13" fill="#FED7AA" stroke="#D97706" />
          <circle cx="46" cy="46" r="1.5" fill="#1E293B" />
          <circle cx="54" cy="46" r="1.5" fill="#1E293B" />
          <path d="M48 54 Q50 56 52 54" stroke="#D97706" />
        </svg>
      );
    case 'bird': // طَائِرٌ / عُصْفُورٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 62 Q18 36 44 32 Q62 26 72 38 Q78 44 86 44 L76 52 Q68 68 44 68 Z" fill="#38BDF8" stroke="#0284C7" />
          {/* Wing */}
          <path d="M34 52 Q50 42 58 56 Q44 66 34 52 Z" fill="#0284C7" stroke="#0369A1" />
          {/* Eye & Beak */}
          <circle cx="64" cy="40" r="2.5" fill="#0F172A" />
          <polygon points="76,46 88,48 76,52" fill="#F59E0B" stroke="#B45309" />
          {/* Tail */}
          <polygon points="22,62 10,68 14,56" fill="#0284C7" stroke="#0369A1" />
        </svg>
      );
    case 'elephant': // فِيلٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Head & Trunk */}
          <circle cx="46" cy="44" r="22" fill="#94A3B8" stroke="#475569" />
          {/* Big Ear */}
          <ellipse cx="26" cy="44" rx="12" ry="18" fill="#64748B" stroke="#334155" />
          {/* Trunk */}
          <path d="M58 48 Q68 50 68 66 Q68 76 60 76" stroke="#475569" strokeWidth="5" fill="none" />
          <circle cx="52" cy="38" r="2.5" fill="#0F172A" />
          {/* Tusk */}
          <path d="M56 56 Q66 58 66 52" stroke="#FFFFFF" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'lion': // أَسَدٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Mane */}
          <circle cx="50" cy="48" r="28" fill="#B45309" stroke="#78350F" />
          {/* Face */}
          <circle cx="50" cy="48" r="17" fill="#FBBF24" stroke="#D97706" />
          <circle cx="43" cy="45" r="2.5" fill="#1E293B" />
          <circle cx="57" cy="45" r="2.5" fill="#1E293B" />
          <polygon points="47,52 53,52 50,56" fill="#78350F" />
          <path d="M46 58 Q50 62 54 58" stroke="#78350F" strokeWidth="2" />
        </svg>
      );
    case 'monkey': // قِرْدٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="48" r="22" fill="#78350F" stroke="#451A03" />
          {/* Big Ears */}
          <circle cx="26" cy="44" r="8" fill="#FED7AA" stroke="#78350F" strokeWidth="2" />
          <circle cx="74" cy="44" r="8" fill="#FED7AA" stroke="#78350F" strokeWidth="2" />
          {/* Face mask */}
          <ellipse cx="50" cy="52" rx="14" ry="12" fill="#FED7AA" />
          <circle cx="44" cy="44" r="2.5" fill="#0F172A" />
          <circle cx="56" cy="44" r="2.5" fill="#0F172A" />
          <ellipse cx="50" cy="55" rx="5" ry="3" fill="#D97706" />
        </svg>
      );

    // --- NATURE, SKY & ELEMENTS ---
    case 'sun': // شَمْسٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="20" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
          {/* Rays */}
          <line x1="50" y1="15" x2="50" y2="24" stroke="#F59E0B" strokeWidth="3.5" />
          <line x1="50" y1="76" x2="50" y2="85" stroke="#F59E0B" strokeWidth="3.5" />
          <line x1="15" y1="50" x2="24" y2="50" stroke="#F59E0B" strokeWidth="3.5" />
          <line x1="76" y1="50" x2="85" y2="50" stroke="#F59E0B" strokeWidth="3.5" />
          <line x1="25" y1="25" x2="32" y2="32" stroke="#F59E0B" strokeWidth="3" />
          <line x1="68" y1="68" x2="75" y2="75" stroke="#F59E0B" strokeWidth="3" />
          <line x1="25" y1="75" x2="32" y2="68" stroke="#F59E0B" strokeWidth="3" />
          <line x1="68" y1="32" x2="75" y2="25" stroke="#F59E0B" strokeWidth="3" />
        </svg>
      );
    case 'moon': // قَمَرٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M68 20 C42 20 30 42 30 60 C30 76 44 88 64 88 C74 88 82 84 84 80 C62 82 48 66 48 48 C48 34 58 22 68 20 Z" fill="#FEF08A" stroke="#CA8A04" />
          <circle cx="24" cy="30" r="2" fill="#FDE047" />
          <circle cx="28" cy="74" r="1.5" fill="#FDE047" />
        </svg>
      );
    case 'star': // نَجْمٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="50,15 61,38 86,40 66,58 72,83 50,70 28,83 34,58 14,40 39,38" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
        </svg>
      );
    case 'cloud': // سَحَابٌ / غَيْمٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M26 68 L72 68 C80 68 86 62 86 54 C86 46 80 40 73 40 C72 28 62 20 50 20 C40 20 31 26 28 36 C20 38 14 45 14 54 C14 62 19 68 26 68 Z" fill="#E0F2FE" stroke="#0284C7" />
        </svg>
      );
    case 'river': // نَهْرٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 20 Q40 45 30 65 Q25 80 20 90 L80 90 Q85 70 70 50 Q60 35 90 20 Z" fill="#38BDF8" stroke="#0284C7" />
          <path d="M10 20 Q40 45 30 65" stroke="#16A34A" strokeWidth="4" />
          <path d="M90 20 Q60 35 70 50" stroke="#16A34A" strokeWidth="4" />
        </svg>
      );

    // --- BODY PARTS ---
    case 'eye': // عَيْنٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 50 Q50 20 85 50 Q50 80 15 50 Z" fill="#F8FAFC" stroke="#334155" strokeWidth="3" />
          <circle cx="50" cy="50" r="15" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
          <circle cx="50" cy="50" r="7" fill="#0F172A" />
          <circle cx="46" cy="46" r="2.5" fill="#FFFFFF" />
        </svg>
      );
    case 'ear': // أُذُنٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M40 22 C65 22 72 40 68 62 C64 80 50 82 42 78 C34 74 38 64 44 64 C50 64 54 54 52 46 C50 36 44 32 38 34" fill="#FED7AA" stroke="#EA580C" strokeWidth="3" />
        </svg>
      );
    case 'hand': // يَدٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M35 85 L35 55 L35 32 Q35 24 40 24 Q45 24 45 32 L45 50 L48 26 Q48 18 53 18 Q58 18 58 26 L58 50 L61 30 Q61 22 66 22 Q71 22 71 30 L71 52 L73 40 Q73 34 77 34 Q81 34 81 40 L81 64 Q81 85 58 85 Z" fill="#FED7AA" stroke="#EA580C" />
        </svg>
      );
    case 'heart': // قَلْبٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 32 C40 16 18 20 18 42 C18 64 45 78 50 86 C55 78 82 64 82 42 C82 20 60 16 50 32 Z" fill="#EF4444" stroke="#DC2626" strokeWidth="3" />
        </svg>
      );

    // --- CLOTHING & TRANSPORT ---
    case 'shirt': // قَمِيصٌ / ثَوْبٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="32,24 50,34 68,24 88,38 78,52 70,44 70,86 30,86 30,44 22,52 12,38" fill="#38BDF8" stroke="#0284C7" />
          <line x1="50" y1="34" x2="50" y2="86" stroke="#0284C7" strokeWidth="2" />
          <circle cx="50" cy="46" r="1.5" fill="#FFFFFF" />
          <circle cx="50" cy="58" r="1.5" fill="#FFFFFF" />
          <circle cx="50" cy="70" r="1.5" fill="#FFFFFF" />
        </svg>
      );
    case 'shoes': // حِذَاءٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Shoe */}
          <path d="M15 62 L32 44 Q50 44 60 52 L82 56 Q90 62 86 70 L15 70 Z" fill="#78350F" stroke="#451A03" />
          <rect x="12" y="68" width="76" height="6" rx="2" fill="#1E293B" stroke="#0F172A" />
        </svg>
      );
    case 'airplane': // طَائِرَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 15 L56 42 L88 56 L88 64 L56 56 L56 76 L68 84 L68 90 L50 86 L32 90 L32 84 L44 76 L44 56 L12 64 L12 56 L44 42 Z" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2.5" />
          <circle cx="50" cy="25" r="2" fill="#38BDF8" />
        </svg>
      );
    case 'school': // مَدْرَسَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="50,14 18,36 82,36" fill="#DC2626" stroke="#991B1B" />
          <rect x="22" y="36" width="56" height="50" fill="#FEF3C7" stroke="#D97706" />
          {/* Central Clock */}
          <circle cx="50" cy="46" r="7" fill="#FFFFFF" stroke="#047857" strokeWidth="2" />
          <line x1="50" y1="46" x2="50" y2="42" stroke="#047857" strokeWidth="2" />
          <line x1="50" y1="46" x2="53" y2="46" stroke="#047857" strokeWidth="2" />
          {/* Windows */}
          <rect x="28" y="44" width="10" height="12" fill="#60A5FA" stroke="#2563EB" rx="1" />
          <rect x="62" y="44" width="10" height="12" fill="#60A5FA" stroke="#2563EB" rx="1" />
          {/* Main Arched Door */}
          <path d="M42 86 L42 66 Q50 60 58 66 L58 86 Z" fill="#92400E" stroke="#78350F" />
        </svg>
      );
    case 'room': // حُجْرَةٌ / غُرْفَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Room walls perspective */}
          <rect x="15" y="15" width="70" height="70" fill="#F8FAFC" stroke="#94A3B8" />
          <line x1="15" y1="15" x2="28" y2="28" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="85" y1="15" x2="72" y2="28" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="15" y1="85" x2="28" y2="72" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="85" y1="85" x2="72" y2="72" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="28" y="28" width="44" height="44" fill="#EFF6FF" stroke="#93C5FD" />
          {/* Window on back wall */}
          <rect x="42" y="34" width="16" height="18" fill="#BAE6FD" stroke="#0284C7" />
          <line x1="50" y1="34" x2="50" y2="52" stroke="#0284C7" strokeWidth="1.5" />
          <line x1="42" y1="43" x2="58" y2="43" stroke="#0284C7" strokeWidth="1.5" />
          {/* Small rug on floor */}
          <ellipse cx="50" cy="78" rx="22" ry="7" fill="#F43F5E" stroke="#BE123C" strokeWidth="1.5" />
        </svg>
      );
    case 'briefcase': // مِحْفَظَةٌ / حَقِيبَةُ يَدٍ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Handle */}
          <path d="M40 32 L40 22 Q50 18 60 22 L60 32" stroke="#78350F" strokeWidth="3" fill="none" />
          {/* Body */}
          <rect x="18" y="32" width="64" height="48" rx="5" fill="#92400E" stroke="#78350F" />
          {/* Flap */}
          <path d="M18 32 L50 56 L82 32" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          {/* Latches */}
          <rect x="34" y="52" width="6" height="8" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="60" y="52" width="6" height="8" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        </svg>
      );
    case 'pencilcase': // مِقْلَمَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Case body */}
          <rect x="18" y="38" width="64" height="28" rx="8" fill="#8B5CF6" stroke="#6D28D9" />
          {/* Zipper top */}
          <line x1="24" y1="44" x2="76" y2="44" stroke="#EDE9FE" strokeWidth="2" strokeDasharray="3 2" />
          {/* Zipper pull */}
          <rect x="68" y="42" width="6" height="9" rx="1" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          {/* Pencil sticking out */}
          <path d="M26 38 L32 20 L37 22 L31 38" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <polygon points="32,20 34,14 37,22" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
        </svg>
      );
    case 'notebook': // كُرَّاسَةٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Notebook cover */}
          <rect x="25" y="18" width="54" height="66" rx="4" fill="#0284C7" stroke="#0369A1" />
          {/* Spiral binding rings */}
          <line x1="33" y1="18" x2="33" y2="84" stroke="#E0F2FE" strokeWidth="2" />
          <circle cx="29" cy="26" r="2.5" fill="#FFFFFF" stroke="#0369A1" />
          <circle cx="29" cy="38" r="2.5" fill="#FFFFFF" stroke="#0369A1" />
          <circle cx="29" cy="50" r="2.5" fill="#FFFFFF" stroke="#0369A1" />
          <circle cx="29" cy="62" r="2.5" fill="#FFFFFF" stroke="#0369A1" />
          <circle cx="29" cy="74" r="2.5" fill="#FFFFFF" stroke="#0369A1" />
          {/* Cover Label / Lines */}
          <rect x="42" y="30" width="28" height="18" rx="2" fill="#FFFFFF" stroke="#BAE6FD" />
          <line x1="46" y1="36" x2="66" y2="36" stroke="#0284C7" strokeWidth="1.5" />
          <line x1="46" y1="42" x2="62" y2="42" stroke="#0284C7" strokeWidth="1.5" />
        </svg>
      );
    case 'bow': // قَوْسٌ
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Curved wood */}
          <path d="M28 20 Q68 50 28 80" stroke="#78350F" strokeWidth="4" fill="none" />
          {/* String */}
          <line x1="28" y1="20" x2="28" y2="80" stroke="#94A3B8" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="20" width="60" height="60" rx="12" fill="#F1F5F9" stroke="#94A3B8" />
          <circle cx="50" cy="50" r="14" fill="#38BDF8" opacity="0.5" />
          <path d="M40 50 L47 57 L60 44" stroke="#0284C7" strokeWidth="3" />
        </svg>
      );
  }
};
