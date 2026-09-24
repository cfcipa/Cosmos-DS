// Cosmos DS · Kit IA · Thread: Thread search.
// Referente: assistant-ui «Thread search» (elements/thread-search.tsx): un historial al que de verdad puedes volver.
// El filtro busca en título y vista previa; fijados primero y luego los grupos por fecha, en el orden en que llegan.
// ↑ ↓ recorren ese orden dando la vuelta (si el activo quedó fuera del filtro, arrancan del borde que indica la tecla)
// e ignoran la composición IME. Las filas son botones solo con `onSelect`.
import * as React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Pin, Search } from 'lucide-react';
import { fieldSx } from '../lib/thread';

export interface SearchableThread {
  id: string;
  title: string;
  /** Grupo por fecha, ya nombrado: «Hoy», «Ayer», «Anteriores». */
  group: string;
  preview: string;
  pinned?: boolean;
}

export interface ThreadSearchProps {
  threads: readonly SearchableThread[];
  query: string;
  activeId: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (id: string) => void;
  /** Default 'Buscar hilos'. */
  placeholder?: string;
  /** Default 'fijados'. */
  pinnedLabel?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas de assistant-ui: max-w-sm, ícono de búsqueda de 14px, chincheta de 10px. */
const MAX_WIDTH = 384;
const ICON_SIZE = 14;
const PIN_SIZE = 10;

export function ThreadSearch({ threads, query, activeId, onQueryChange, onSelect, placeholder = 'Buscar hilos', pinnedLabel = 'fijados', className, sx }: ThreadSearchProps) {
  const q = query.toLowerCase();
  const matches = threads.filter((t) => `${t.title} ${t.preview}`.toLowerCase().includes(q));
  const pinned = matches.filter((t) => t.pinned);
  const groups = [...new Set(matches.filter((t) => !t.pinned).map((t) => t.group))];
  const ordered = [...pinned, ...groups.flatMap((g) => matches.filter((t) => !t.pinned && t.group === g))];

  const rowsRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    rowsRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const move = (delta: number) => {
    if (ordered.length === 0 || !onSelect) return;
    const at = ordered.findIndex((t) => t.id === activeId);
    const from = at === -1 ? (delta > 0 ? -1 : 0) : at;
    const next = ordered[(from + delta + ordered.length) % ordered.length];
    if (next) onSelect(next.id);
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
  };

  const row = (thread: SearchableThread) => {
    const isActive = thread.id === activeId;
    const content = (
      <>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ width: '100%', minWidth: 0 }}>
          {thread.pinned ? <Box component="span" aria-hidden="true" sx={{ display: 'flex', flexShrink: 0, color: 'text.disabled' }}><Pin size={PIN_SIZE} /></Box> : null}
          <Typography variant="body2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>{thread.title}</Typography>
        </Stack>
        <Typography variant="body3" color="text.disabled" noWrap sx={{ width: '100%' }}>{thread.preview}</Typography>
      </>
    );
    const rowSx = (t: Theme) => ({
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: 0.25,
      textAlign: 'start' as const,
      borderRadius: 1,
      px: 1,
      py: 0.5,
      bgcolor: isActive ? 'action.selected' : 'transparent',
      transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
      ...(onSelect && !isActive ? { '&:hover': { bgcolor: 'action.hover' } } : {}),
      '&.Mui-focusVisible': { bgcolor: 'action.focus' },
    });
    return onSelect ? (
      <ButtonBase key={thread.id} data-active={isActive} aria-current={isActive || undefined} onClick={() => onSelect(thread.id)} sx={rowSx}>{content}</ButtonBase>
    ) : (
      <Box key={thread.id} data-active={isActive} sx={rowSx}>{content}</Box>
    );
  };
  const label = (text: string) => <Typography variant="caption" color="text.disabled" sx={{ px: 1, pb: 0.5 }}>{text}</Typography>;

  return (
    <Paper
      variant="outlined"
      data-slot="thread-search"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH, boxSizing: 'border-box', p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ ...fieldSx(), flexShrink: 0, borderRadius: 1, px: 1.25, py: 0.75 }}>
        <Box component="span" aria-hidden="true" sx={{ display: 'flex', flexShrink: 0, color: 'text.disabled' }}><Search size={ICON_SIZE} /></Box>
        <InputBase
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          inputProps={{ 'aria-label': placeholder }}
          sx={(t) => ({ flexGrow: 1, minWidth: 0, ...t.typography.body2, '& input': { p: 0 } })}
        />
      </Stack>
      <Stack ref={rowsRef} spacing={0.75} sx={{ minHeight: 0, overflowY: 'auto' }}>
        {pinned.length > 0 ? <Stack>{label(pinnedLabel)}{pinned.map(row)}</Stack> : null}
        {groups.map((g) => (
          <Stack key={g}>{label(g)}{matches.filter((t) => !t.pinned && t.group === g).map(row)}</Stack>
        ))}
        {matches.length === 0 ? <Typography variant="body3" color="text.disabled" role="status" sx={{ px: 1, py: 2, textAlign: 'center' }}>{`Ningún hilo coincide con «${query}»`}</Typography> : null}
      </Stack>
    </Paper>
  );
}
