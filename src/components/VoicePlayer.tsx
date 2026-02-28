import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  ChevronDown,
  Volume2,
} from 'lucide-react';
import { useTTS } from '../hooks/useTTS';

interface VoicePlayerProps {
  text: string;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

const VoicePlayer: React.FC<VoicePlayerProps> = ({ text }) => {
  const tts = useTTS();
  const [showSettings, setShowSettings] = useState(false);

  // Keep a stable ref to stop() so the text-change effect never goes stale.
  const stopRef = useRef(tts.stop);
  stopRef.current = tts.stop;

  // Stop playback whenever the page changes (text prop changes).
  useEffect(() => {
    stopRef.current();
  }, [text]);

  const handlePlayPause = () => {
    if (tts.status === 'idle') {
      if (!text.trim()) return;
      tts.play(text);
    } else if (tts.status === 'playing') {
      tts.pause();
    } else if (tts.status === 'paused') {
      tts.resume();
    }
  };

  const progressPercent =
    tts.totalChunks > 0 ? (tts.currentChunk / tts.totalChunks) * 100 : 0;

  const isActive = tts.status === 'playing' || tts.status === 'paused';
  const isLoadingVoices = tts.status === 'loading-voices';

  // Group voices: Portuguese first, English second, others last.
  const groupedVoices = useMemo(() => {
    const pt = tts.voices.filter((v) => v.lang.startsWith('pt'));
    const en = tts.voices.filter((v) => v.lang.startsWith('en'));
    const other = tts.voices.filter(
      (v) => !v.lang.startsWith('pt') && !v.lang.startsWith('en')
    );
    return { pt, en, other };
  }, [tts.voices]);

  const selectedVoiceName =
    tts.voices.find((v) => v.voiceURI === tts.voice)?.name ?? 'Voz';

  return (
    <div className="border-t bg-gray-50 shrink-0">
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main controls */}
      <div className="px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
        {/* Skip back 5 sentences */}
        <button
          onClick={tts.skipBackward}
          disabled={!isActive}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Voltar 5 frases"
        >
          <SkipBack size={20} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          disabled={isLoadingVoices || !text.trim()}
          className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-none"
          style={{ minWidth: 48, minHeight: 48 }}
          title={tts.status === 'playing' ? 'Pausar' : 'Reproduzir'}
        >
          {tts.status === 'playing' ? (
            <Pause size={22} />
          ) : (
            <Play size={22} className="ml-0.5" />
          )}
        </button>

        {/* Skip forward 5 sentences */}
        <button
          onClick={tts.skipForward}
          disabled={!isActive}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Avançar 5 frases"
        >
          <SkipForward size={20} />
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

        {/* Status / progress info */}
        <div className="flex-1 min-w-0">
          {isLoadingVoices && (
            <span className="text-xs text-blue-600">Carregando vozes…</span>
          )}
          {isActive && (
            <span className="text-xs text-gray-500 font-mono">
              {tts.currentChunk + 1}/{tts.totalChunks}
            </span>
          )}
        </div>

        {/* Speed selector */}
        <select
          value={tts.speed}
          onChange={(e) => tts.setSpeed(parseFloat(e.target.value))}
          className="text-sm bg-white border rounded px-1.5 py-1 flex-none"
          title="Velocidade"
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>

        {/* Voice settings toggle */}
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-200 flex-none"
          title="Selecionar voz"
        >
          <Volume2 size={16} />
          <span className="hidden sm:inline max-w-[100px] truncate text-xs">
            {selectedVoiceName}
          </span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Voice selection panel */}
      {showSettings && (
        <div className="px-4 sm:px-6 pb-4 border-t pt-3 max-h-52 overflow-y-auto">
          {tts.voices.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Nenhuma voz disponível no dispositivo.
            </p>
          ) : (
            <div className="space-y-3">
              <VoiceGroup
                label="Português"
                voices={groupedVoices.pt}
                selected={tts.voice}
                onSelect={(uri) => {
                  tts.setVoice(uri);
                  setShowSettings(false);
                }}
              />
              <VoiceGroup
                label="Inglês"
                voices={groupedVoices.en}
                selected={tts.voice}
                onSelect={(uri) => {
                  tts.setVoice(uri);
                  setShowSettings(false);
                }}
              />
              <VoiceGroup
                label="Outros"
                voices={groupedVoices.other}
                selected={tts.voice}
                onSelect={(uri) => {
                  tts.setVoice(uri);
                  setShowSettings(false);
                }}
                showLang
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface VoiceGroupProps {
  label: string;
  voices: SpeechSynthesisVoice[];
  selected: string;
  onSelect: (uri: string) => void;
  showLang?: boolean;
}

function VoiceGroup({ label, voices, selected, onSelect, showLang }: VoiceGroupProps) {
  if (voices.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {voices.map((v) => (
          <button
            key={v.voiceURI}
            onClick={() => onSelect(v.voiceURI)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              selected === v.voiceURI
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {v.name}
            {showLang && (
              <span className="opacity-60 ml-1">({v.lang})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VoicePlayer;
