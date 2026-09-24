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
// 3 · Tool use
export * from './ai/tool-call';
