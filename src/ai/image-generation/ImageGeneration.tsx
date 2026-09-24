// Cosmos DS · Kit IA · Knowledge: Image generation.
// Tablero «Image generation»: una rejilla de puntos sostiene el marco mientras la imagen se aclara desde el desenfoque.
// Como en assistant-ui: el marco cuadrado existe desde el principio (no hay salto de layout); mientras genera,
// 8 × 8 puntos laten con 90 ms de desfase por fila + columna y la línea dice «Generando»; al terminar, la imagen
// aparece desde el desenfoque en 1 s, se ve el prompt y Regenerar vuelve a estar disponible.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { RefreshCw } from 'lucide-react';
import { REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';

export interface ImageGenerationProps {
  prompt: string;
  /** status.type === 'running'. */
  generating: boolean;
  /** La imagen generada. Sin ella, el marco muestra el degradado de muestra del tablero. */
  src?: string;
  /** Texto alternativo de la imagen. Default: el prompt. */
  alt?: string;
  /** Default '1024 × 1024'. */
  sizeLabel?: string;
  /** Sin él, no se muestra Regenerar. */
  onRegenerate?: () => void;
  /** Default 'Generando'. */
  generatingLabel?: string;
  className?: string;
}

/** Ancho del marco en el tablero (w-52 de la referencia), en la escala de spacing. */
const FRAME_WIDTH = 26;
const GRID = 8;
const DOT_STAGGER_MS = 90;
const REVEAL_MS = 1000;
const DOTS = Array.from({ length: GRID * GRID }, (_, i) => (Math.floor(i / GRID) + (i % GRID)) * DOT_STAGGER_MS);

const pulse = keyframes`50% { opacity: .5; }`;

/** Degradado de muestra (el del tablero), con los colores del tema. */
const sampleArt = (t: Theme) => {
  const primary = t.palette.primary as unknown as Record<number, string | undefined>;
  return [
    `radial-gradient(120% 90% at 20% 100%, ${t.palette.primary.main} 0%, transparent 55%)`,
    `radial-gradient(110% 80% at 85% 90%, ${alpha(t.palette.secondary.main, 0.8)} 0%, transparent 60%)`,
    `radial-gradient(130% 100% at 60% 0%, ${primary[100] ?? t.palette.primary.light} 0%, ${alpha(primary[300] ?? t.palette.primary.light, 0.9)} 45%, transparent 75%)`,
    `linear-gradient(to top, ${primary[900] ?? t.palette.primary.dark}, ${primary[200] ?? t.palette.primary.light})`,
  ].join(', ');
};

export function ImageGeneration({
  prompt,
  generating,
  src,
  alt,
  sizeLabel = '1024 × 1024',
  onRegenerate,
  generatingLabel = 'Generando',
  className,
}: ImageGenerationProps) {
  const reveal = (t: Theme) => ({
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    opacity: generating ? 0 : 1,
    filter: generating ? `blur(${t.spacing(3)})` : 'none',
    transition: t.transitions.create(['opacity', 'filter'], { duration: REVEAL_MS, easing: t.transitions.easing.easeOut }),
    [REDUCED_MOTION]: { transition: 'none' },
  });

  return (
    <Stack spacing={1} className={className} data-slot="image-generation" data-generating={generating} sx={(t) => ({ width: t.spacing(FRAME_WIDTH) })}>
      <Paper variant="outlined" sx={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden' }}>
        <Box
          aria-hidden="true"
          sx={{ position: 'absolute', inset: 0, p: 3, display: 'grid', gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))`, placeItems: 'center' }}
        >
          {DOTS.map((delay, i) => (
            <Box
              key={i}
              component="span"
              sx={(t) => ({
                width: t.spacing(0.5),
                height: t.spacing(0.5),
                borderRadius: '50%',
                bgcolor: 'divider',
                opacity: generating ? 1 : 0,
                transition: t.transitions.create('opacity', { duration: REVEAL_MS / 2 }),
                ...(generating ? { animation: `${pulse} 2s cubic-bezier(.4, 0, .6, 1) ${delay}ms infinite` } : null),
                [REDUCED_MOTION]: { animation: 'none' },
              })}
            />
          ))}
        </Box>
        {src ? (
          <Box component="img" src={src} alt={alt ?? prompt} sx={reveal} />
        ) : (
          <Box aria-hidden="true" sx={(t) => ({ ...reveal(t), background: sampleArt(t) })} />
        )}
        <Typography
          variant="caption"
          component="span"
          sx={(t) => ({
            position: 'absolute',
            top: t.spacing(1.25),
            right: t.spacing(1.25),
            fontVariantNumeric: 'tabular-nums',
            color: generating ? 'text.disabled' : alpha(t.palette.common.white, 0.7),
            transition: t.transitions.create('color', { duration: REVEAL_MS / 2 }),
          })}
        >
          {sizeLabel}
        </Typography>
      </Paper>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="caption" color="text.secondary" noWrap title={prompt} sx={{ flexGrow: 1, minWidth: 0 }}>
          {generating ? <Box component="span" role="status" sx={(t) => ({ display: 'inline-block', ...shimmerTextSx(t) })}>{generatingLabel}</Box> : prompt}
        </Typography>
        {onRegenerate ? (
          <IconButton
            aria-label="Regenerar imagen"
            title="Regenerar imagen"
            disabled={generating}
            onClick={onRegenerate}
            sx={(t) => ({
              transition: t.transitions.create('opacity', { duration: t.transitions.duration.shortest }),
              '&.Mui-disabled': { opacity: 0 },
            })}
          >
            <RefreshCw size={14} />
          </IconButton>
        ) : null}
      </Stack>
    </Stack>
  );
}
