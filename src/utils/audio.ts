// Speech synthesis helper for Arabic and Bengali

export const speakArabic = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  // Strip diacritics / tashkeel if voice needs cleaner input, but modern Arabic TTS handles tashkeel well
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.85; // Slightly slower for language learners
  
  // Try to pick an Arabic voice if available
  const voices = window.speechSynthesis.getVoices();
  const arVoice = voices.find(v => v.lang.startsWith('ar'));
  if (arVoice) {
    utterance.voice = arVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const speakBangla = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'bn-BD';
  utterance.rate = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const bnVoice = voices.find(v => v.lang.startsWith('bn'));
  if (bnVoice) {
    utterance.voice = bnVoice;
  }

  window.speechSynthesis.speak(utterance);
};
