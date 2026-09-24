// Cosmos DS — tema MUI (paquete «Azul», fuente ThemeCOSMOS.json) + kit de IA.
export { CosmosProvider, createCosmosTheme } from './CosmosProvider';
export type { CosmosProviderProps } from './CosmosProvider';
export { createBrandTheme } from './theme/utils/createBrandTheme';
export type { BrandType } from './theme/utils/createBrandTheme';
export { resolveToken, resolveTokenAsString } from './theme/utils/resolveToken';
export { withAiKit, aiPaletteFrom } from './ai/theme/aiPalette';
export type { AiPalette } from './ai/theme/aiPalette';

// Kit IA — en el orden del catálogo de assistant-ui
// Reasoning
export * from './ai/loader';
export * from './ai/thinking-indicator';
export * from './ai/streaming-text';
export * from './ai/typing-indicator';
export * from './ai/reasoning-effort';
export * from './ai/guardrail-notice';
// Messages
export * from './ai/message-pair';
export * from './ai/message-branches';
export * from './ai/message-actions';
export * from './ai/error-state';
export * from './ai/message-queue';
export * from './ai/edit-message';
export * from './ai/feedback-dialog';
export * from './ai/stopped-run';
export * from './ai/day-separator';
export * from './ai/speaker-identity';
export * from './ai/regenerate-menu';
export * from './ai/confidence-marker';
export * from './ai/web-search';
export * from './ai/inline-citation';
export * from './ai/image-generation';
export * from './ai/retrieval-chunks';
export * from './ai/document-reference';
export * from './ai/memory-chips';
export * from './ai/research-report';
export * from './ai/map-answer';
export * from './ai/composer';
export * from './ai/draft-restore';
export * from './ai/context-breakdown';
export * from './ai/prompt-library';
export * from './ai/command-palette';
export * from './ai/voice-conversation';
export * from './ai/read-aloud';
export * from './ai/chat-panel';
export * from './ai/empty-state';
export * from './ai/scroll-anchor';
export * from './ai/canvas-split';
export * from './ai/connection-state';
export * from './ai/shared-conversation';
// 3 · Tool use
export * from './ai/tool-call';
