import { useState, useRef, useCallback, useEffect } from 'react';
import { loadTTS, generateAudioForText, splitTextIntoChunks } from '../lib/tts';
import type { KokoroTTS } from 'kokoro-js';

export type TTSStatus = 'idle' | 'loading-model' | 'generating' | 'playing' | 'paused';

interface UseTTSOptions {
  voice?: string;
  speed?: number;
}

interface UseTTSReturn {
  status: TTSStatus;
  currentTime: number;
  duration: number;
  modelProgress: number;
  play: (text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekForward: (seconds: number) => void;
  seekBackward: (seconds: number) => void;
  setVoice: (voiceId: string) => void;
  setSpeed: (speed: number) => void;
  voice: string;
  speed: number;
}

export function useTTS(options?: UseTTSOptions): UseTTSReturn {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [modelProgress, setModelProgress] = useState(0);
  const [voice, setVoice] = useState(options?.voice ?? 'af_heart');
  const [speed, setSpeed] = useState(options?.speed ?? 1);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const ttsRef = useRef<KokoroTTS | null>(null);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [cleanup]);

  const updateTime = useCallback(() => {
    if (audioContextRef.current && status === 'playing') {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseOffsetRef.current;
      setCurrentTime(Math.min(elapsed, duration));
      if (elapsed < duration) {
        animFrameRef.current = requestAnimationFrame(updateTime);
      } else {
        setStatus('idle');
        setCurrentTime(0);
        pauseOffsetRef.current = 0;
      }
    }
  }, [status, duration]);

  useEffect(() => {
    if (status === 'playing') {
      animFrameRef.current = requestAnimationFrame(updateTime);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status, updateTime]);

  const playBuffer = useCallback((buffer: AudioBuffer, offset: number = 0) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;

    cleanup();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      const elapsed = ctx.currentTime - startTimeRef.current + pauseOffsetRef.current;
      if (elapsed >= duration - 0.1) {
        setStatus('idle');
        setCurrentTime(0);
        pauseOffsetRef.current = 0;
      }
    };

    startTimeRef.current = ctx.currentTime;
    pauseOffsetRef.current = offset;
    source.start(0, offset);
    sourceNodeRef.current = source;
    setStatus('playing');
  }, [cleanup, duration]);

  const play = useCallback(async (text: string) => {
    try {
      // Load model if needed
      if (!ttsRef.current) {
        setStatus('loading-model');
        ttsRef.current = await loadTTS((progress) => {
          if (progress.progress !== undefined) {
            setModelProgress(Math.round(progress.progress));
          }
        });
        setModelProgress(100);
      }

      setStatus('generating');
      const chunks = splitTextIntoChunks(text);
      const allSamples: Float32Array[] = [];

      for (const chunk of chunks) {
        if (chunk.trim().length === 0) continue;
        const samples = await generateAudioForText(ttsRef.current, chunk, voice, speed);
        allSamples.push(samples);
      }

      // Concatenate all samples
      const totalLength = allSamples.reduce((sum, s) => sum + s.length, 0);
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const samples of allSamples) {
        combined.set(samples, offset);
        offset += samples.length;
      }

      // Create audio buffer
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const buffer = audioContextRef.current.createBuffer(1, combined.length, 24000);
      buffer.copyToChannel(combined, 0);
      audioBufferRef.current = buffer;

      const dur = combined.length / 24000;
      setDuration(dur);
      pauseOffsetRef.current = 0;

      // Need to play after duration is set
      const ctx = audioContextRef.current;
      cleanup();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        const elapsed = ctx.currentTime - startTimeRef.current;
        if (elapsed >= dur - 0.1) {
          setStatus('idle');
          setCurrentTime(0);
          pauseOffsetRef.current = 0;
        }
      };
      startTimeRef.current = ctx.currentTime;
      source.start(0, 0);
      sourceNodeRef.current = source;
      setStatus('playing');
    } catch (err) {
      console.error('TTS error:', err);
      setStatus('idle');
    }
  }, [voice, speed, cleanup]);

  const pause = useCallback(() => {
    if (status !== 'playing' || !audioContextRef.current) return;
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseOffsetRef.current;
    pauseOffsetRef.current = elapsed;
    cleanup();
    setStatus('paused');
  }, [status, cleanup]);

  const resume = useCallback(() => {
    if (status !== 'paused' || !audioBufferRef.current) return;
    playBuffer(audioBufferRef.current, pauseOffsetRef.current);
  }, [status, playBuffer]);

  const stop = useCallback(() => {
    cleanup();
    pauseOffsetRef.current = 0;
    setCurrentTime(0);
    setStatus('idle');
  }, [cleanup]);

  const seekForward = useCallback((seconds: number) => {
    if (!audioBufferRef.current || (status !== 'playing' && status !== 'paused')) return;
    let newOffset: number;
    if (status === 'playing' && audioContextRef.current) {
      newOffset = audioContextRef.current.currentTime - startTimeRef.current + pauseOffsetRef.current + seconds;
    } else {
      newOffset = pauseOffsetRef.current + seconds;
    }
    newOffset = Math.min(newOffset, duration);
    newOffset = Math.max(newOffset, 0);

    if (status === 'playing') {
      playBuffer(audioBufferRef.current, newOffset);
    } else {
      pauseOffsetRef.current = newOffset;
      setCurrentTime(newOffset);
    }
  }, [status, duration, playBuffer]);

  const seekBackward = useCallback((seconds: number) => {
    seekForward(-seconds);
  }, [seekForward]);

  return {
    status,
    currentTime,
    duration,
    modelProgress,
    play,
    pause,
    resume,
    stop,
    seekForward,
    seekBackward,
    setVoice,
    setSpeed,
    voice,
    speed,
  };
}
