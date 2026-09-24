/**
 * Roles de IA del kit (palette.ai), derivados del tema de marca ya creado.
 * El kit no trae colores propios: cada rol apunta a un valor del tema (Cosmos hoy,
 * cualquier marca creada con createBrandTheme mañana). Los comentarios «gap» marcan
 * roles que la marca no define y cómo se llenan.
 */
import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export interface AiPalette {
  /** Inicio / fin del degradado de la insignia IA. gap: se usan primary.500 → secondary.600. */
  markStart: string;
  markEnd: string;
  /** Ícono sobre la insignia. gap: primary.contrastText. */
  markIcon: string;
  /** Burbuja del usuario. gap: primary.100 (tinte aprobado en los tableros). */
  userBubble: string;
  userBubbleText: string;
  /** Superficie gris para payloads (args / resultado de herramientas). */
  surfaceMuted: string;
  /** Duraciones y metadatos. */
  metaText: string;
  iconDisabled: string;
  /** Anillo de foco de teclado, 2px. */
  focusRing: string;
  /** Estados de una llamada a herramienta. */
  toolStatus: { running: string; complete: string; error: string; requiresAction: string; cancelled: string };
}

/** Tipografía propia del kit: código en payloads. */
export interface AiTypography {
  code: { fontFamily: string; fontSize: string; lineHeight: string; fontWeight: number };
}

declare module '@mui/material/styles' {
  interface Palette { ai: AiPalette }
  interface PaletteOptions { ai?: AiPalette }
  interface Theme { aiKit: AiTypography }
  interface ThemeOptions { aiKit?: AiTypography }
}

const pick = (scale: Record<string | number, string | undefined>, key: number, fallback: string) => scale[key] || fallback;

export function aiPaletteFrom(t: Theme): AiPalette {
  const p = t.palette;
  const primary = p.primary as unknown as Record<string | number, string>;
  const secondary = p.secondary as unknown as Record<string | number, string>;
  return {
    markStart: pick(primary, 500, p.primary.main),
    markEnd: pick(secondary, 600, p.secondary.main),
    markIcon: p.primary.contrastText,
    userBubble: p.mode === 'dark' ? p.action.selected : pick(primary, 100, p.action.selected),
    userBubbleText: p.text.primary,
    surfaceMuted: p.mode === 'dark' ? p.action.hover : p.grey[100],
    metaText: p.text.secondary,
    iconDisabled: p.text.disabled,
    focusRing: p.primary.main,
    toolStatus: {
      running: p.text.secondary,
      complete: p.mode === 'dark' ? p.success.main : p.success.dark,
      error: p.error.main,
      requiresAction: p.warning.main,
      cancelled: p.text.disabled,
    },
  };
}

/**
 * Añade la capa del kit de IA a un tema de marca: palette.ai y aiKit.code.
 * No toca los overrides de componentes de la marca (botones, inputs… siguen siendo los de Cosmos).
 */
export function withAiKit(brandTheme: Theme): Theme {
  return createTheme(brandTheme, {
    palette: { ai: aiPaletteFrom(brandTheme) },
    aiKit: {
      code: {
        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '0.8125rem',
        lineHeight: '1.25rem',
        fontWeight: brandTheme.typography.fontWeightRegular,
      },
    },
  });
}
