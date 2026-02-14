import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  ChevronDown,
  Volume2,
  Loader2,
} from 'lucide-react';
import { useTTS } from '../hooks/useTTS';

interface VoicePlayerProps {
  text: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VOICE_OPTIONS = [
  { id: 'af_heart', label: 'Heart (F)', lang: 'EN-US' },
  { id: 'af_bella', label: 'Bella (F)', lang: 'EN-US' },
  { id: 'af_nicole', label: 'Nicole (F)', lang: 'EN-US' },
  { id: 'af_sarah', label: 'Sarah (F)', lang: 'EN-US' },
  { id: 'am_michael', label: 'Michael (M)', lang: 'EN-US' },
  { id: 'am_fenrir', label: 'Fenrir (M)', lang: 'EN-US' },
  { id: 'am_puck', label: 'Puck (M)', lang: 'EN-US' },
  { id: 'bf_emma', label: 'Emma (F)', lang: 'EN-GB' },
  { id: 'bm_george', label: 'George (M)', lang: 'EN-GB' },
  { id: 'pf_dora', label: 'Dora (F)', lang: 'PT' },
  { id: 'pm_alex', label: 'Alex (M)', lang: 'PT' },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ text }) => {
  const tts = useTTS();
  const [showSettings, setShowSettings] = useState(false);

  const handlePlayPause = () => {
    if (tts.status === 'idle') {
      tts.play(text);
    } else if (tts.status === 'playing') {
      tts.pause();
    } else if (tts.status === 'paused') {
      tts.resume();
    }
  };

  const isLoading = tts.status === 'loading-model' || tts.status === 'generating';
  const isActive = tts.status === 'playing' || tts.status === 'paused';
  const progressPercent = tts.duration > 0 ? (tts.currentTime / tts.duration) * 100 : 0;

  return (
    <div className="border-t bg-gray-50 shrink-0">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 cursor-pointer" title={formatTime(tts.currentTime)}>
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="px-6 py-3 flex items-center gap-4">
        {/* Rewind 10s */}
        <button
          onClick={() => tts.seekBackward(10)}
          disabled={!isActive}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Retroceder 10s"
        >
          <RotateCcw size={20} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading || !text}
          className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={tts.status === 'playing' ? 'Pausar' : 'Reproduzir'}
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : tts.status === 'playing' ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-0.5" />
          )}
        </button>

        {/* Forward 10s */}
        <button
          onClick={() => tts.seekForward(10)}
          disabled={!isActive}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Avançar 10s"
        >
          <RotateCw size={20} />
        </button>

        {/* Stop */}
        <button
          onClick={tts.stop}
          disabled={!isActive}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Parar"
        >
          <Square size={18} />
        </button>

        {/* Time display */}
        <span className="text-sm text-gray-500 font-mono min-w-[90px]">
          {formatTime(tts.currentTime)} / {formatTime(tts.duration)}
        </span>

        {/* Loading indicator */}
        {tts.status === 'loading-model' && (
          <span className="text-xs text-blue-600">
            Carregando modelo... {tts.modelProgress}%
          </span>
        )}
        {tts.status === 'generating' && (
          <span className="text-xs text-blue-600">
            Gerando áudio...
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Speed selector */}
        <select
          value={tts.speed}
          onChange={(e) => tts.setSpeed(parseFloat(e.target.value))}
          className="text-sm bg-white border rounded px-2 py-1"
          title="Velocidade"
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>

        {/* Voice settings toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
        >
          <Volume2 size={16} />
          <span className="hidden sm:inline">
            {VOICE_OPTIONS.find((v) => v.id === tts.voice)?.label ?? 'Voz'}
          </span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Voice selection panel */}
      {showSettings && (
        <div className="px-6 pb-3 border-t pt-3">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Selecionar voz</p>
          <div className="flex flex-wrap gap-2">
            {VOICE_OPTIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => { tts.setVoice(v.id); setShowSettings(false); }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  tts.voice === v.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {v.label} <span className="text-xs opacity-70">({v.lang})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicePlayer;
