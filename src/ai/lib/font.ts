/** Solo las métricas tipográficas de una variante (seguras para sx / overrides). */
export const font = (s: { fontFamily?: unknown; fontSize?: unknown; lineHeight?: unknown; fontWeight?: unknown; letterSpacing?: unknown }) =>
  ({ fontFamily: s.fontFamily, fontSize: s.fontSize, lineHeight: s.lineHeight, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing }) as {
    fontFamily?: string; fontSize?: string | number; lineHeight?: string | number; fontWeight?: number | string; letterSpacing?: string | number;
  };
