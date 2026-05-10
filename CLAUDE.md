# CLAUDE.md — NeuroNotes+

## Projeto
**NeuroNotes+** é um bloco de notas inteligente, local-first e focado em privacidade para pesquisadores médicos. MVP com React + TypeScript + Vite + Tailwind CSS. Dados persistidos localmente via IndexedDB (Dexie).

## Comandos essenciais

```bash
npm run dev      # Servidor de desenvolvimento (http://localhost:5173)
npm run build    # Build de produção (TypeScript + Vite)
npm run test     # Testes unitários (Vitest)
npm run lint     # Linting (ESLint)
```

## Arquitetura

```
src/
├── App.tsx               # Componente raiz, orquestra o layout principal
├── components/
│   ├── Editor.tsx        # Editor Markdown com autosave (1s debounce)
│   ├── Insights.tsx      # Painel de IA: classificação, resumo, tags
│   ├── Sidebar.tsx       # Lista de notas + busca + filtro por categoria
│   ├── PdfImport.tsx     # Importação de PDFs
│   ├── PdfLibrary.tsx    # Biblioteca de PDFs salvos
│   ├── PdfReader.tsx     # Visualizador de PDF com TTS
│   ├── PdfSidebar.tsx    # Sidebar específica para PDFs
│   └── VoicePlayer.tsx   # Player de áudio para TTS
├── db/
│   └── dexie.ts          # Schema do IndexedDB (notas, flashcards, PDFs)
├── hooks/
│   ├── useDebounce.ts    # Debounce genérico
│   └── useTTS.ts         # Hook para Text-to-Speech (kokoro-js)
├── lib/
│   ├── ai.ts             # Pipeline de IA simulada (classify, summarize, tag, flashcards)
│   ├── ai.test.ts        # Testes unitários da lib de IA
│   ├── export.ts         # Export para .md e .csv
│   ├── pdf.ts            # Processamento de PDF (pdfjs-dist)
│   └── tts.ts            # Integração com kokoro-js (TTS local)
├── types/
│   └── db.ts             # Tipos TypeScript para entidades do DB
└── test/
    └── setup.ts          # Configuração do Vitest
```

## Decisões de design
- **IA simulada**: `src/lib/ai.ts` usa funções determinísticas locais — sem chamadas de API. Isso garante funcionamento offline e desacopla UI do modelo real.
- **Local-first**: Zero dados saem do dispositivo. IndexedDB via Dexie é a única persistência.
- **TTS local**: `kokoro-js` roda no browser, sem servidor externo.
- **Categorias fixas**: `clinico | estudo | startup | pessoal | outro`

## Dependências principais
| Pacote | Uso |
|---|---|
| `dexie` + `dexie-react-hooks` | IndexedDB ORM |
| `kokoro-js` | TTS local no browser |
| `pdfjs-dist` | Leitura/parsing de PDF |
| `react-markdown` + `remark-gfm` | Renderização Markdown |
| `papaparse` | Export CSV de flashcards |
| `lucide-react` | Ícones |

## Testes
- Framework: **Vitest**
- Testes existentes: `src/lib/ai.test.ts` (cobre classify, summarize, tag)
- Rodar um teste específico: `npm run test -- ai`

## Branch de desenvolvimento
- Branch ativa: `claude/test-mobile-editor-HKlLP`
- Nunca fazer push direto para `main` sem revisão.
