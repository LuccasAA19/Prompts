# memory.md — Contexto da sessão

## Sobre o usuário
- Está acessando o Claude Code **pelo celular** (Claude Code mobile)
- Testando capacidades do Claude Code no ambiente mobile
- Trabalha com o projeto NeuroNotes+ (bloco de notas para pesquisador médico)

## Sobre este projeto
- **Nome**: NeuroNotes+
- **Status**: MVP funcional
- **Stack**: React 19 + TypeScript 5.8 + Vite 7 + Tailwind CSS 4 + Dexie 4
- **Propósito**: Notas inteligentes local-first para pesquisador médico

## Limitações identificadas nesta sessão
- Claude Code neste ambiente **não consegue acessar YouTube** (HTTP 403 e rede bloqueada)
- `curl` também está bloqueado para domínios externos (allowlist restritiva)
- WebFetch funciona para alguns sites, mas não para YouTube/Google

## O que já foi feito
- [x] CLAUDE.md criado com documentação completa do projeto
- [x] memory.md criado (este arquivo)

## Próximos passos sugeridos
- Integrar IA real (Claude API) no lugar das funções simuladas em `src/lib/ai.ts`
- Testar editor no mobile (Editor.tsx) — branch `claude/test-mobile-editor-HKlLP`
- Expandir cobertura de testes além de `ai.test.ts`

## Preferências observadas
- Comunicação em português
- Respostas diretas e sem enrolação
- Interesse em capacidades reais vs limitações do ambiente
