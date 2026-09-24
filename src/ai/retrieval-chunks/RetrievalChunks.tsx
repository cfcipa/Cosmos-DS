// Cosmos DS · Kit IA · Knowledge: Retrieval chunks.
// Tablero «Retrieval chunks»: los pasajes en los que se apoya una respuesta, con su puntaje, antes de que llegue la respuesta.
// Como en assistant-ui: la consulta en un chip, «Recuperando» mientras corre y luego cuántos pasajes superan el umbral;
// los pasajes se revelan por conteo (visibleCount) en un alto reservado. Un puntaje ≥ 0,80 se lee en verde y la barra
// es el puntaje × 100 (LinearProgress de MUI con rol «meter»). Va dentro del contenido de la herramienta (ToolCall).
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { Database } from 'lucide-react';
import { REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';

export interface RetrievalChunk {
  id: string;
  source: string;
  /** Dónde está el pasaje: «§ 2 · p. 3», «cap. 4». */
  locator: string;
  /** Relevancia de 0 a 1. */
  score: number;
  text: string;
}

export interface RetrievalChunksProps {
  query: string;
  chunks: readonly RetrievalChunk[];
  /** Cuántos pasajes se ven (se revelan uno a uno). */
  visibleCount: number;
  /** status.type === 'running'. */
  searching: boolean;
  /** Desde qué puntaje se lee en verde. Default 0,8. */
  highScore?: number;
  /** Default 'Recuperando'. */
  searchingLabel?: string;
  /** Default «N pasajes sobre el umbral». */
  countLabel?: (count: number) => string;
  className?: string;
}

/** Alto reservado de la lista (min-h de la referencia), en la escala de spacing. */
const LIST_MIN_HEIGHT = 14;

const rise = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;
const enter = (t: Theme) => ({ animation: `${rise} ${t.transitions.duration.standard}ms ${t.transitions.easing.easeOut} both`, [REDUCED_MOTION]: { animation: 'none' } });
const decimal = (n: number) => n.toFixed(2).replace('.', ',');
const defaultCountLabel = (count: number) => `${count} ${count === 1 ? 'pasaje' : 'pasajes'} sobre el umbral`;

export function RetrievalChunks({
  query,
  chunks,
  visibleCount,
  searching,
  highScore = 0.8,
  searchingLabel = 'Recuperando',
  countLabel = defaultCountLabel,
  className,
}: RetrievalChunksProps) {
  const shown = chunks.slice(0, Math.max(0, Math.min(chunks.length, visibleCount)));

  return (
    <Stack spacing={1.25} className={className} data-slot="retrieval-chunks" sx={{ width: '100%' }}>
      <Chip variant="outlined" icon={<Database size={16} />} label={query} title={query} sx={{ alignSelf: 'flex-start', maxWidth: '100%' }} />

      <Typography variant="body3" color="text.secondary" role="status">
        {searching ? (
          <Box component="span" sx={(t) => ({ display: 'inline-block', ...shimmerTextSx(t) })}>{searchingLabel}</Box>
        ) : (
          <Box component="span" sx={(t) => ({ display: 'inline-block', ...enter(t) })}>{countLabel(chunks.length)}</Box>
        )}
      </Typography>

      <Stack spacing={0.75} sx={(t) => ({ minHeight: t.spacing(LIST_MIN_HEIGHT) })}>
        {shown.map((chunk) => {
          const score = Math.max(0, Math.min(1, chunk.score));
          const isHigh = score >= highScore;
          return (
            <Paper key={chunk.id} variant="outlined" sx={(t) => ({ px: 1.75, py: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75, ...enter(t) })}>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="subtitle2" noWrap title={chunk.source} sx={{ flexGrow: 1, minWidth: 0 }}>{chunk.source}</Typography>
                <Typography variant="body3" color="text.secondary" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{chunk.locator}</Typography>
                <Typography
                  variant="body3"
                  sx={{ flexShrink: 0, fontWeight: 'fontWeightMedium', fontVariantNumeric: 'tabular-nums', color: isHigh ? 'ai.toolStatus.complete' : 'text.secondary' }}
                >
                  {decimal(score)}
                </Typography>
              </Stack>
              <Typography
                variant="body3"
                color="text.secondary"
                sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {chunk.text}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.round(score * 100)}
                role="meter"
                aria-label={`Relevancia de ${chunk.source}`}
                aria-valuetext={`${decimal(score)} de 1,00`}
                sx={{ borderRadius: 1, [REDUCED_MOTION]: { '& .MuiLinearProgress-bar': { transition: 'none' } } }}
              />
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}
