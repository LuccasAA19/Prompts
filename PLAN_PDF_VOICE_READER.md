# Plano: Leitor de PDFs com Vozes de IA

## Visao Geral

Adicionar ao NeuroNotes+ a capacidade de importar documentos PDF, extrair seu texto e lê-los em voz alta usando síntese de voz por IA (Text-to-Speech). O recurso será local-first, mantendo a filosofia de privacidade do app.

---

## Arquitetura

```
PDF File
  |
  v
[PDF.js] --> Extração de texto por página
  |
  v
[IndexedDB] --> Armazena PDF metadata + texto extraído
  |
  v
[UI: PDF Viewer] --> Exibe texto, controles de leitura
  |
  v
[Web Speech API / TTS Engine] --> Lê o texto em voz alta
```

---

## Etapas de Implementação

### Etapa 1: Modelo de dados e importação de PDF

**Arquivos a criar/editar:**
- `src/types/db.ts` — Adicionar tipo `PdfDocument`
- `src/db/dexie.ts` — Adicionar tabela `pdfs` ao schema
- `src/lib/pdf.ts` — Lógica de extração de texto com PDF.js

**Detalhes:**
- Novo tipo `PdfDocument`:
  ```typescript
  interface PdfDocument {
    id?: number;
    fileName: string;
    fileSize: number;
    pageCount: number;
    pages: PdfPage[];       // texto extraído por página
    importedAt: Date;
    lastReadPage: number;   // bookmark
    lastReadPosition: number;
  }

  interface PdfPage {
    pageNumber: number;
    text: string;
  }
  ```
- Usar `pdfjs-dist` para extrair texto de cada página
- Armazenar o texto extraído no IndexedDB (não o binário do PDF)

**Dependência a instalar:**
- `pdfjs-dist` — Parser de PDF client-side

---

### Etapa 2: UI de importação e listagem de PDFs

**Arquivos a criar/editar:**
- `src/components/PdfLibrary.tsx` — Componente de biblioteca de PDFs
- `src/components/PdfImport.tsx` — Botão/drag-and-drop para importar PDFs
- `src/App.tsx` — Adicionar rota/tab para a biblioteca de PDFs

**Detalhes:**
- Botão "Importar PDF" com suporte a drag-and-drop
- Lista de PDFs importados com: nome, número de páginas, data de importação
- Opção de deletar PDFs da biblioteca
- Indicador de progresso durante a extração de texto

---

### Etapa 3: Visualizador de PDF com texto

**Arquivos a criar/editar:**
- `src/components/PdfReader.tsx` — Componente principal do leitor
- `src/hooks/usePdfNavigation.ts` — Hook para navegação entre páginas

**Detalhes:**
- Exibir texto extraído página por página
- Navegação: página anterior/próxima, ir para página específica
- Salvar automaticamente a última página lida (bookmark)
- Destacar o parágrafo sendo lido durante a leitura por voz

---

### Etapa 4: Motor de Text-to-Speech (TTS)

**Arquivos a criar/editar:**
- `src/lib/tts.ts` — Abstração do motor TTS
- `src/hooks/useTTS.ts` — Hook React para controlar a leitura

**Detalhes:**
- Usar a **Web Speech API** (`SpeechSynthesis`) como motor principal:
  - Gratuito, offline, sem API key
  - Suporta múltiplas vozes e idiomas
  - Funciona em Chrome, Edge, Firefox, Safari
- Abstração `TTSEngine`:
  ```typescript
  interface TTSEngine {
    speak(text: string, options: TTSOptions): void;
    pause(): void;
    resume(): void;
    stop(): void;
    getVoices(): SpeechSynthesisVoice[];
    onBoundary?: (charIndex: number) => void;  // para highlighting
  }

  interface TTSOptions {
    voice: SpeechSynthesisVoice;
    rate: number;     // 0.5 - 2.0
    pitch: number;    // 0 - 2
    volume: number;   // 0 - 1
  }
  ```
- Dividir texto longo em chunks para evitar cortes do browser
- Callback `onBoundary` para sincronizar destaque visual com a leitura

---

### Etapa 5: Controles do Player de Voz

**Arquivos a criar/editar:**
- `src/components/VoicePlayer.tsx` — Barra de controles do player
- `src/components/VoiceSettings.tsx` — Painel de configurações de voz

**Detalhes:**
- Controles:
  - Play / Pause / Stop
  - Velocidade (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
  - Volume
  - Pular para próximo/anterior parágrafo
- Configurações de voz:
  - Seletor de voz (listar vozes disponíveis no browser)
  - Controle de pitch (tom)
  - Preview da voz selecionada
- Barra de progresso mostrando posição atual no texto
- Persistir preferências do usuário no IndexedDB

---

### Etapa 6: Integração com o app existente

**Arquivos a editar:**
- `src/App.tsx` — Adicionar navegação entre Notas e PDFs
- `src/components/Sidebar.tsx` — Adicionar seção para PDFs
- `src/index.css` — Estilos adicionais se necessário

**Detalhes:**
- Tabs ou navegação no sidebar: "Notas" | "PDFs"
- Ao selecionar um PDF, abrir o PdfReader no painel central
- O painel Insights pode mostrar informações do PDF (páginas, bookmark)
- Manter a experiência visual consistente com Tailwind

---

### Etapa 7: Testes

**Arquivos a criar:**
- `src/lib/pdf.test.ts` — Testes da extração de texto
- `src/lib/tts.test.ts` — Testes do motor TTS
- `src/hooks/useTTS.test.ts` — Testes do hook TTS

**Detalhes:**
- Testar extração de texto de PDFs mock
- Testar controles TTS (play, pause, stop, rate change)
- Testar navegação entre páginas
- Testar persistência de bookmarks

---

## Dependências Novas

| Pacote | Propósito | Tamanho |
|--------|-----------|---------|
| `pdfjs-dist` | Extrair texto de PDFs client-side | ~400KB |

> A Web Speech API é nativa do browser — sem dependências extras para TTS.

---

## Estrutura de Arquivos Final (novos arquivos)

```
src/
├── components/
│   ├── PdfLibrary.tsx        # Lista de PDFs importados
│   ├── PdfImport.tsx         # Importação de PDFs
│   ├── PdfReader.tsx         # Visualizador de texto do PDF
│   ├── VoicePlayer.tsx       # Controles do player TTS
│   └── VoiceSettings.tsx     # Configurações de voz
├── hooks/
│   ├── usePdfNavigation.ts   # Navegação entre páginas
│   └── useTTS.ts             # Controle do Text-to-Speech
├── lib/
│   ├── pdf.ts                # Extração de texto com PDF.js
│   ├── pdf.test.ts           # Testes de extração
│   ├── tts.ts                # Motor TTS abstrato
│   └── tts.test.ts           # Testes do TTS
└── types/
    └── db.ts                 # + PdfDocument, PdfPage types
```

---

## Ordem de Execução Recomendada

1. **Etapa 1** — Modelo de dados + extração de PDF (base de tudo)
2. **Etapa 4** — Motor TTS (pode ser desenvolvido em paralelo com 2-3)
3. **Etapa 2** — UI de importação e listagem
4. **Etapa 3** — Visualizador de PDF
5. **Etapa 5** — Controles do player de voz
6. **Etapa 6** — Integração final
7. **Etapa 7** — Testes

---

## Considerações

- **Privacidade**: Todo processamento é local. Nenhum dado sai do browser.
- **Offline**: Funciona 100% offline (Web Speech API + PDF.js são client-side).
- **Limitação**: Qualidade das vozes depende do sistema operacional do usuário. Chrome no Windows/Mac tem vozes melhores que Linux.
- **Futuro**: Possível integração com APIs de TTS na nuvem (ElevenLabs, Google Cloud TTS) para vozes mais naturais, como upgrade opcional.
