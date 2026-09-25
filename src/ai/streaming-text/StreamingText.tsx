// Cosmos DS · Kit IA · Reasoning: Streaming text.
// Tablero aprobado «Streaming text»: las palabras llegan suave; las más nuevas entran en azul y se asientan en tinta.
import * as React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { REDUCED_MOTION as REDUCED } from '../lib/shimmerText';

export interface StreamingSegment {
  text: string;
  /** Código o identificador (CE-4471, CC-210): se muestra en monoespaciada sobre gris. */
  mono?: boolean;
}

export interface StreamingTextProps {
  segments: StreamingSegment[];
  /** Palabras visibles. Sin él, se muestran todas. */
  count?: number;
  /** Mientras llega: las 2 palabras más nuevas en azul y el cursor parpadeando. Default false. */
  streaming?: boolean;
  className?: string;
}

const blink = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0; }`;
/** El parpadeo del cursor (también el punto de Message pair). */
export const STREAMING_BLINK = `${blink} 1s steps(2) infinite`;
/** Lo que tarda una palabra nueva en pasar de azul a tinta (tablero y referencia; igual que en Message pair). */
export const STREAMING_SETTLE_MS = 700;
/** Cuántas palabras, las más nuevas, llegan en azul. */
export const STREAMING_FRESH_WORDS = 2;
/** El cursor del tablero: 18px de alto y 3px bajo la línea en su texto de 15px (1,2em y 0,2em). */
const CARET_HEIGHT = '1.2em';
const CARET_DROP = '-0.2em';

/** El color de una palabra: las nuevas en azul, que se asientan en la tinta del texto. */
export const streamingWordSx = (t: Theme, fresh: boolean) => ({
  color: fresh ? t.palette.primary.main : 'inherit',
  transition: t.transitions.create('color', { duration: STREAMING_SETTLE_MS, easing: t.transitions.easing.easeOut }),
  [REDUCED]: { transition: 'none' },
});

/** El cursor que parpadea al final del texto que llega (o que quedó a medias). */
export const streamingCaretSx = (t: Theme) => ({
  display: 'inline-block', width: t.spacing(0.25), height: CARET_HEIGHT, marginLeft: '1px', verticalAlign: CARET_DROP,
  backgroundColor: t.palette.primary.main, animation: STREAMING_BLINK, [REDUCED]: { animation: 'none' },
});

/** Palabras en orden, con la marca mono de su segmento. */
export function streamingWords(segments: StreamingSegment[]) {
  const out: Array<{ word: string; mono: boolean }> = [];
  segments.forEach((sg) => sg.text.split(' ').filter(Boolean).forEach((w) => out.push({ word: w, mono: !!sg.mono })));
  return out;
}

export function StreamingText({ segments, count, streaming = false, className }: StreamingTextProps) {
  const words = React.useMemo(() => streamingWords(segments), [segments]);
  const n = Math.max(0, Math.min(words.length, count ?? words.length));
  return (
    <Box component="p" data-slot="streaming-text" className={className} sx={{ m: 0, fontSize: 15, lineHeight: '24px', color: 'text.primary' }}>
      {words.slice(0, n).map((w, i) => {
        const fresh = streaming && i >= n - STREAMING_FRESH_WORDS;
        return w.mono ? (
          <span key={i}>
            <Box component="code" sx={(t) => ({ px: '4px', py: '1px', borderRadius: 1, bgcolor: 'ai.surfaceMuted', ...t.aiKit.code, fontSize: 13, fontWeight: t.typography.fontWeightMedium, ...streamingWordSx(t, fresh) })}>{w.word}</Box>{' '}
          </span>
        ) : (
          <Box key={i} component="span" sx={(t) => streamingWordSx(t, fresh)}>{w.word + ' '}</Box>
        );
      })}
      {streaming && n > 0 ? (
        <Box component="span" aria-hidden="true" sx={streamingCaretSx} />
      ) : null}
    </Box>
  );
}
