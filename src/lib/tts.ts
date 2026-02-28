// Text-to-Speech using the browser's built-in Web Speech API.
// On Android this leverages Google's neural WaveNet voices;
// on iOS it uses Apple's high-quality neural voices.
// No model download needed — works instantly, offline, and for free.

export function isTTSSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
  );
}

/** Load the list of voices available on the device. */
export async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isTTSSupported()) return [];

  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Most browsers fire voiceschanged once the list is ready.
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => resolve(window.speechSynthesis.getVoices()),
      { once: true }
    );
    // Fallback for browsers (e.g. some iOS versions) that never fire the event.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000);
  });
}

/** Score a voice by likely quality (higher = better). */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (name.includes('neural')) score += 100;
  if (name.includes('wavenet')) score += 80;
  if (name.includes('enhanced') || name.includes('premium')) score += 60;
  if (name.includes('natural')) score += 40;
  if (name.includes('compact')) score -= 20; // Lower-quality variant
  return score;
}

/**
 * Return the best available voice for a given BCP-47 language tag.
 * Falls back to prefix match (e.g., 'pt-BR' → 'pt').
 */
export function getBestVoiceForLang(
  voices: SpeechSynthesisVoice[],
  lang: string
): SpeechSynthesisVoice | null {
  const langLower = lang.toLowerCase();
  let matches = voices.filter((v) => v.lang.toLowerCase() === langLower);

  if (matches.length === 0) {
    const prefix = langLower.split('-')[0];
    matches = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  }

  if (matches.length === 0) return null;
  return matches.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

/**
 * Split text into sentence-sized chunks so each Web Speech utterance
 * is short. This avoids the Chrome Android ~15-second speech bug and
 * produces natural pauses at sentence boundaries.
 */
export function splitIntoSentences(text: string): string[] {
  const chunks: string[] = [];
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    current += ch;

    const isEndPunct =
      ch === '.' || ch === '!' || ch === '?' || ch === '…';
    const nextChar = text[i + 1];
    const afterSpace =
      nextChar === undefined || nextChar === ' ' || nextChar === '\n';

    if (isEndPunct && afterSpace && current.trim().length > 0) {
      chunks.push(current.trim());
      current = '';
    } else if (ch === '\n' && current.trim().length > 30) {
      // Long paragraph break also counts as a chunk boundary.
      chunks.push(current.trim());
      current = '';
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks.filter((s) => s.length > 0);
}
