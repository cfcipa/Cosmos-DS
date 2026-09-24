// Cosmos DS · Kit IA · Thread: Conversation search.
// Referente: assistant-ui «Conversation search» (elements/conversation-search.tsx): busca dentro de un hilo largo.
// Barra con contador «n/total» y, solo con `onStep`, anterior y siguiente; debajo la coincidencia activa con su
// contexto; a la derecha una marca por coincidencia a lo largo de la conversación, la activa más intensa.
// Enter va a la siguiente y Shift + Enter a la anterior; el padre da la vuelta al llegar al final.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes, type SxProps, type Theme } from '@mui/material/styles';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { paletteScale } from '../lib/paletteScale';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { fieldSx } from '../lib/thread';

export interface SearchHit {
  id: string;
  before: string;
  match: string;
  after: string;
  /** Dónde cae en la conversación, de 0 a 100. */
  position: number;
}

export interface ConversationSearchProps {
  query: string;
  hits: readonly SearchHit[];
  activeIndex: number;
  onQueryChange?: (query: string) => void;
  onStep?: (delta: number) => void;
  /** Default 'Buscar en la conversación'. */
  placeholder?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas de assistant-ui: max-w-sm, botones de 24px, íconos de 14px, riel de 6px con marcas de 4px. */
const MAX_WIDTH = 384;
const BUTTON = 3;
const ICON_SIZE = 14;
const RAIL = 0.75;
const MARK = 0.5;
const fadein = keyframes`from { opacity: 0; } to { opacity: 1; }`;

export function ConversationSearch({ query, hits, activeIndex, onQueryChange, onStep, placeholder = 'Buscar en la conversación', className, sx }: ConversationSearchProps) {
  const index = hits.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), hits.length - 1);
  const active = index === -1 ? undefined : hits[index];

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (hits.length) onStep?.(event.shiftKey ? -1 : 1);
  };
  const step = (t: Theme) => ({ width: t.spacing(BUTTON), height: t.spacing(BUTTON), flexShrink: 0 });

  return (
    <Stack direction="row" spacing={1} data-slot="conversation-search" className={className} sx={[{ width: '100%', maxWidth: MAX_WIDTH }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
        <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, pl: 1.5, pr: 0.75 }}>
          <Box component="span" aria-hidden="true" sx={{ display: 'flex', flexShrink: 0, color: 'text.disabled' }}><Search size={ICON_SIZE} /></Box>
          <InputBase
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            inputProps={{ 'aria-label': placeholder }}
            sx={(t) => ({ flexGrow: 1, minWidth: 0, ...t.typography.body2, '& input': { p: 0 } })}
          />
          <Typography role="status" variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            {hits.length === 0 ? '0' : `${index + 1}/${hits.length}`}
          </Typography>
          {onStep ? (
            <>
              <IconButton aria-label="Coincidencia anterior" onClick={() => onStep(-1)} disabled={!hits.length} sx={step}><ChevronUp size={ICON_SIZE} /></IconButton>
              <IconButton aria-label="Coincidencia siguiente" onClick={() => onStep(1)} disabled={!hits.length} sx={step}><ChevronDown size={ICON_SIZE} /></IconButton>
            </>
          ) : null}
        </Paper>
        {active ? (
          <Typography
            key={active.id}
            variant="body3"
            component="div"
            data-slot="conversation-search-preview"
            sx={(t) => ({ ...fieldSx(), borderRadius: 1, px: 1.5, py: 1, animation: `${fadein} ${t.transitions.duration.shorter}ms`, [REDUCED_MOTION]: { animation: 'none' } })}
          >
            <Box component="span" sx={{ color: 'text.secondary' }}>{active.before}</Box>
            <Box component="mark" sx={(t) => ({ bgcolor: paletteScale(t, 'warning', 100), color: 'text.primary', borderRadius: 0.5, px: 0.25 })}>{active.match}</Box>
            <Box component="span" sx={{ color: 'text.secondary' }}>{active.after}</Box>
          </Typography>
        ) : null}
      </Stack>
      <Box aria-hidden="true" data-slot="conversation-search-rail" sx={(t) => ({ ...fieldSx(), position: 'relative', width: t.spacing(RAIL), flexShrink: 0, borderRadius: 1 })}>
        {hits.map((hit, i) => (
          <Box
            key={hit.id}
            sx={(t) => ({
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${hit.position}%`,
              height: t.spacing(MARK),
              borderRadius: 1,
              bgcolor: i === index ? 'warning.main' : alpha(t.palette.warning.main, 0.35),
              transition: t.transitions.create('background-color', { duration: t.transitions.duration.shorter }),
            })}
          />
        ))}
      </Box>
    </Stack>
  );
}
