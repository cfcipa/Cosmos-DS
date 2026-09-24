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
// 3 · Tool use
export * from './ai/tool-call';
