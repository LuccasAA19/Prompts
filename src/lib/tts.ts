import { KokoroTTS } from 'kokoro-js';
import type { TTSVoice } from '../types/db';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

let ttsInstance: KokoroTTS | null = null;
let loadingPromise: Promise<KokoroTTS> | null = null;

export async function loadTTS(
  onProgress?: (progress: { status: string; progress?: number }) => void
): Promise<KokoroTTS> {
  if (ttsInstance) return ttsInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = KokoroTTS.from_pretrained(MODEL_ID, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: onProgress as Parameters<typeof KokoroTTS.from_pretrained>[1] extends { progress_callback?: infer C } ? C : never,
  });

  ttsInstance = await loadingPromise;
  loadingPromise = null;
  return ttsInstance;
}

export function getTTSInstance(): KokoroTTS | null {
  return ttsInstance;
}

export function isModelLoaded(): boolean {
  return ttsInstance !== null;
}

export function getAvailableVoices(tts: KokoroTTS): TTSVoice[] {
  const voices = tts.voices;
  return Object.entries(voices).map(([id, info]) => ({
    id,
    name: info.name,
    language: info.language,
    gender: info.gender,
  }));
}

export async function generateAudioForText(
  tts: KokoroTTS,
  text: string,
  voice: string = 'af_heart',
  speed: number = 1
): Promise<Float32Array> {
  const audio = await tts.generate(text, { voice: voice as 'af_heart', speed });
  // RawAudio has audio_data property with Float32Array
  return audio.audio as unknown as Float32Array;
}

export function createAudioFromFloat32(samples: Float32Array, sampleRate: number = 24000): AudioBuffer {
  const audioCtx = new AudioContext({ sampleRate });
  const buffer = audioCtx.createBuffer(1, samples.length, sampleRate);
  buffer.copyToChannel(samples, 0);
  return buffer;
}

const CHUNK_SIZE = 500; // characters per chunk

export function splitTextIntoChunks(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}
