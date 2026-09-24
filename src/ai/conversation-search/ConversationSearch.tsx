// Cosmos DS · Kit IA · Thread: Conversation search.
// Tablero «Conversation search»: busca dentro de un hilo largo, con cada coincidencia marcada a lo largo de la barra.
// Como en assistant-ui: el contador «n/total», anterior y siguiente (solo con `onStep`), la coincidencia activa con su
// contexto y una marca por coincidencia en la barra lateral, la activa en primary. Enter va a la siguiente y
// Shift + Enter a la anterior; el padre da la vuelta al llegar al final. `children` es la conversación junto a la barra.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { paletteScale } from '../lib/paletteScale';

export interface SearchHit {
  id: string;
  /** Quién lo dijo: «Tú», «Asistente». */
  who?: string;
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
  children?: React.ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas del tablero. */
const MAX_WIDTH = 448;
const ICON_SIZE = 20;
const PREVIEW_MIN_HEIGHT = 64;

export function ConversationSearch({ query, hits, activeIndex, onQueryChange, onStep, placeholder = 'Buscar en la conversación', children, className, sx }: ConversationSearchProps) {
  const index = hits.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), hits.length - 1);
  const active = index === -1 ? undefined : hits[index];
  const noHits = hits.length === 0;

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!noHits) onStep?.(event.shiftKey ? -1 : 1);
  };

  return (
    <Stack
      direction="row"
      spacing={1.5}
      data-slot="conversation-search"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack spacing={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
        <OutlinedInput
          size="small"
          fullWidth
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          inputProps={{ 'aria-label': placeholder }}
          startAdornment={<InputAdornment position="start"><Search size={ICON_SIZE} /></InputAdornment>}
          endAdornment={
            <InputAdornment position="end" sx={{ gap: 0.5 }}>
              <Typography role="status" variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', mr: 0.5 }}>
                {noHits ? '0' : `${index + 1}/${hits.length}`}
              </Typography>
              {onStep ? (
                <>
                  <IconButton aria-label="Coincidencia anterior" disabled={noHits} onClick={() => onStep(-1)}><ChevronUp size={ICON_SIZE} /></IconButton>
                  <IconButton aria-label="Coincidencia siguiente" disabled={noHits} onClick={() => onStep(1)} edge="end"><ChevronDown size={ICON_SIZE} /></IconButton>
                </>
              ) : null}
            </InputAdornment>
          }
        />
        <Box sx={{ minHeight: PREVIEW_MIN_HEIGHT }}>
          {active ? (
            <Paper variant="outlined" data-slot="conversation-search-preview" sx={{ px: 2, py: 1 }}>
              {active.who ? <Typography variant="body3" color="text.secondary" component="span" sx={{ display: 'block', mb: 0.25 }}>{active.who}</Typography> : null}
              <Typography variant="body1" component="span">
                …{active.before}
                <Box component="mark" sx={(t) => ({ bgcolor: paletteScale(t, 'warning', 100), color: 'inherit', borderRadius: 0.5, px: '1px' })}>{active.match}</Box>
                {active.after}…
              </Typography>
            </Paper>
          ) : null}
        </Box>
        {children}
      </Stack>
      <Box aria-hidden="true" data-slot="conversation-search-rail" sx={{ position: 'relative', width: (t) => t.spacing(1), flexShrink: 0, borderRadius: 1, bgcolor: 'action.hover' }}>
        {hits.map((hit, i) => (
          <Box
            key={hit.id}
            sx={(t) => ({
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${Math.max(0, hit.position - 1)}%`,
              height: t.spacing(0.5),
              borderRadius: 0.5,
              bgcolor: i === index ? 'primary.main' : alpha(t.palette.primary.main, 0.3),
              transition: t.transitions.create('background-color', { duration: t.transitions.duration.shorter }),
            })}
          />
        ))}
      </Box>
    </Stack>
  );
}
