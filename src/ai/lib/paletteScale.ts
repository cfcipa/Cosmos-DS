import type { Theme } from '@mui/material/styles';

/** Un tono de la escala de una paleta del tema (primary[900], primary[300]…), con respaldo si la marca no lo define. */
export function paletteScale(t: Theme, color: 'primary' | 'secondary' | 'grey', shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, fallback?: string): string {
  const scale = t.palette[color] as unknown as Record<number, string | undefined>;
  return scale[shade] ?? fallback ?? (color === 'grey' ? t.palette.text.secondary : t.palette[color].main);
}
