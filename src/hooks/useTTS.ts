import { useState, useRef, useCallback, useEffect } from 'react';
import {
  loadVoices,
  getBestVoiceForLang,
  splitIntoSentences,
  isTTSSupported,
} from '../lib/tts';

export type TTSStatus = 'idle' | 'loading-voices' | 'playing' | 'paused';

interface UseTTSReturn {
  status: TTSStatus;
  currentChunk: number;
  totalChunks: number;
  voices: SpeechSynthesisVoice[];
  voice: string;
  speed: number;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  setVoice: (voiceURI: string) => void;
  setSpeed: (speed: number) => void;
}

export function useTTS(): UseTTSReturn {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoiceState] = useState('');
  const [speed, setSpeedState] = useState(1);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  // Refs hold mutable state that callbacks need without causing stale closures.
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const voiceRef = useRef('');
  const speedRef = useRef(1);

  // "Latest callback" ref pattern — updated on every render so callbacks
  // always call the most recent version of speakChunk.
  const speakChunkRef = useRef<(index: number) => void>(() => {});

  // Keep voice/speed refs in sync with state.
  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Load voices once on mount.
  useEffect(() => {
    if (!isTTSSupported()) return;

    setStatus('loading-voices');
    loadVoices().then((loaded) => {
      setVoices(loaded);
      // Auto-select best Portuguese voice, then English, then whatever is first.
      const best =
        getBestVoiceForLang(loaded, 'pt-BR') ??
        getBestVoiceForLang(loaded, 'pt') ??
        getBestVoiceForLang(loaded, 'en-US') ??
        loaded[0] ??
        null;
      if (best) {
        setVoiceState(best.voiceURI);
        voiceRef.current = best.voiceURI;
      }
      setStatus('idle');
    });

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Speak a single chunk by index; chain to the next when done.
  // Defined as an inline function so it always closes over the latest refs.
  const speakChunkImpl = (index: number): void => {
    if (!isPlayingRef.current) return;

    if (index >= chunksRef.current.length) {
      // Finished all chunks.
      isPlayingRef.current = false;
      setStatus('idle');
      setCurrentChunk(0);
      chunkIndexRef.current = 0;
      return;
    }

    chunkIndexRef.current = index;
    setCurrentChunk(index);

    const text = chunksRef.current[index];
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply the currently selected voice.
    const allVoices = window.speechSynthesis.getVoices();
    const selectedVoice = allVoices.find((v) => v.voiceURI === voiceRef.current);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.rate = speedRef.current;

    utterance.onend = () => {
      speakChunkRef.current(index + 1);
    };

    utterance.onerror = (e) => {
      // 'interrupted' / 'canceled' means the user paused/stopped — not an error.
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('TTS error on chunk', index, ':', e.error);
      speakChunkRef.current(index + 1);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Keep the ref pointing to the latest implementation.
  speakChunkRef.current = speakChunkImpl;

  const play = useCallback((text: string) => {
    window.speechSynthesis.cancel();

    const sentences = splitIntoSentences(text);
    chunksRef.current = sentences;
    chunkIndexRef.current = 0;
    isPlayingRef.current = true;

    setTotalChunks(sentences.length);
    setCurrentChunk(0);
    setStatus('playing');

    speakChunkRef.current(0);
  }, []);

  // Pause: cancel current speech but remember position.
  const pause = useCallback(() => {
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
    setStatus('paused');
  }, []);

  // Resume from the saved chunk index.
  const resume = useCallback(() => {
    isPlayingRef.current = true;
    setStatus('playing');
    speakChunkRef.current(chunkIndexRef.current);
  }, []);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
    chunksRef.current = [];
    chunkIndexRef.current = 0;
    setCurrentChunk(0);
    setTotalChunks(0);
    setStatus('idle');
  }, []);

  // Jump forward/backward by 5 sentences.
  const skipForward = useCallback(() => {
    const next = Math.min(
      chunkIndexRef.current + 5,
      Math.max(0, chunksRef.current.length - 1)
    );
    window.speechSynthesis.cancel();
    chunkIndexRef.current = next;
    setCurrentChunk(next);
    if (isPlayingRef.current) {
      speakChunkRef.current(next);
    }
  }, []);

  const skipBackward = useCallback(() => {
    const prev = Math.max(chunkIndexRef.current - 5, 0);
    window.speechSynthesis.cancel();
    chunkIndexRef.current = prev;
    setCurrentChunk(prev);
    if (isPlayingRef.current) {
      speakChunkRef.current(prev);
    }
  }, []);

  const setVoice = useCallback((voiceURI: string) => {
    setVoiceState(voiceURI);
    voiceRef.current = voiceURI;
    if (isPlayingRef.current) {
      // Restart current chunk with the new voice.
      const idx = chunkIndexRef.current;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        if (isPlayingRef.current) speakChunkRef.current(idx);
      }, 50);
    }
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    speedRef.current = newSpeed;
    if (isPlayingRef.current) {
      // Restart current chunk at the new rate.
      const idx = chunkIndexRef.current;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        if (isPlayingRef.current) speakChunkRef.current(idx);
      }, 50);
    }
  }, []);

  return {
    status,
    currentChunk,
    totalChunks,
    voices,
    voice,
    speed,
    play,
    pause,
    resume,
    stop,
    skipForward,
    skipBackward,
    setVoice,
    setSpeed,
  };
}
