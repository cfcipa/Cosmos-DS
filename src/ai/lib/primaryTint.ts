import type { Theme } from '@mui/material/styles';

/** El tinte claro del primary (primary[100]) en modo claro; la superficie seleccionada en oscuro. */
export function primaryTint(t: Theme): string {
  const primaryScale = t.palette.primary as unknown as Record<number, string | undefined>;
  return t.palette.mode === 'dark' ? t.palette.action.selected : primaryScale[100] ?? t.palette.action.selected;
}
