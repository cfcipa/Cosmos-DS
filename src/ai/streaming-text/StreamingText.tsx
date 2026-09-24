// Cosmos DS · Kit IA · Reasoning: Streaming text.
// Tablero aprobado «Streaming text»: las palabras llegan suave; las más nuevas entran en azul y se asientan en tinta.
import * as React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

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
const REDUCED = '@media (prefers-reduced-motion: reduce)';

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
        const fresh = streaming && i >= n - 2;
        const color = fresh ? 'primary.main' : 'text.primary';
        const tr = { transition: 'color 700ms ease-out', [REDUCED]: { transition: 'none' } };
        return w.mono ? (
          <span key={i}>
            <Box component="code" sx={(t) => ({ px: '4px', py: '1px', borderRadius: 1, bgcolor: 'ai.surfaceMuted', ...t.aiKit.code, fontSize: 13, fontWeight: 500, color, ...tr })}>{w.word}</Box>{' '}
          </span>
        ) : (
          <Box key={i} component="span" sx={{ color, ...tr }}>{w.word + ' '}</Box>
        );
      })}
      {streaming && n > 0 ? (
        <Box component="span" aria-hidden="true" sx={{ display: 'inline-block', width: 2, height: 18, ml: '1px', verticalAlign: '-3px', bgcolor: 'primary.main',
          animation: `${blink} 1s steps(2) infinite`, [REDUCED]: { animation: 'none' } }} />
      ) : null}
    </Box>
  );
}
