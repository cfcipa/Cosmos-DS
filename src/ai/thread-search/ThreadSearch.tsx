// Cosmos DS · Kit IA · Thread: Thread search.
// Tablero «Thread search»: un historial al que de verdad puedes volver, fijados primero y luego agrupados por fecha.
// Como en assistant-ui: el filtro busca en título y vista previa; ↑ ↓ recorren fijados y luego grupos, dando la vuelta,
// e ignoran la composición IME. El campo es un combobox que apunta a la opción activa (aria-activedescendant).
import * as React from 'react';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Pin, Search } from 'lucide-react';

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
  /** Default 'Fijados'. */
  pinnedLabel?: string;
  /** Default 'Ningún hilo coincide.' */
  emptyLabel?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas del tablero. */
const MAX_WIDTH = 400;
const LIST_MAX_HEIGHT = 300;
const ICON_SIZE = 20;
const PIN_SIZE = 16;

export function ThreadSearch({
  threads, query, activeId, onQueryChange, onSelect,
  placeholder = 'Buscar hilos', pinnedLabel = 'Fijados', emptyLabel = 'Ningún hilo coincide.', className, sx,
}: ThreadSearchProps) {
  const baseId = React.useId();
  const optionId = (id: string) => `${baseId}-${id}`;
  const listId = `${baseId}-list`;
  const q = query.toLowerCase();
  const matches = threads.filter((t) => `${t.title} ${t.preview}`.toLowerCase().includes(q));
  const pinned = matches.filter((t) => t.pinned);
  const groups = [...new Set(matches.filter((t) => !t.pinned).map((t) => t.group))];
  const ordered = [...pinned, ...groups.flatMap((g) => matches.filter((t) => !t.pinned && t.group === g))];
  const current = ordered.find((t) => t.id === activeId);

  const listRef = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => {
    if (!current) return;
    listRef.current?.querySelector(`[id="${optionId(current.id)}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (delta: number) => {
    if (ordered.length === 0 || !onSelect) return;
    const at = ordered.findIndex((t) => t.id === activeId);
    // El activo puede quedar fuera del filtro: se arranca del borde que indica la tecla.
    const from = at === -1 ? (delta > 0 ? -1 : 0) : at;
    const next = ordered[(from + delta + ordered.length) % ordered.length];
    if (next) onSelect(next.id);
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
  };

  const row = (t: SearchableThread) => (
    <ListItemButton
      key={t.id}
      id={optionId(t.id)}
      role="option"
      aria-selected={t.id === current?.id}
      selected={t.id === current?.id}
      onClick={onSelect ? () => onSelect(t.id) : undefined}
      disableRipple={!onSelect}
      sx={{ px: 2, py: 0.75 }}
    >
      <ListItemText
        primary={t.title}
        secondary={t.preview}
        primaryTypographyProps={{ variant: 'body1' }}
        secondaryTypographyProps={{ variant: 'body2', noWrap: true }}
        sx={{ my: 0 }}
      />
    </ListItemButton>
  );
  const subheader = (label: string, pin = false) => (
    <ListSubheader role="presentation" sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'inherit', backgroundImage: 'inherit' }}>
      {pin ? <Pin size={PIN_SIZE} aria-hidden="true" /> : null}{label}
    </ListSubheader>
  );

  return (
    <Paper
      variant="outlined"
      data-slot="thread-search"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <OutlinedInput
          size="small"
          fullWidth
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          startAdornment={<InputAdornment position="start"><Search size={ICON_SIZE} /></InputAdornment>}
          inputProps={{
            role: 'combobox',
            'aria-label': placeholder,
            'aria-expanded': true,
            'aria-controls': listId,
            'aria-activedescendant': current ? optionId(current.id) : undefined,
            'aria-autocomplete': 'list',
          }}
        />
      </Box>
      <List ref={listRef} id={listId} role="listbox" aria-label="Hilos" disablePadding sx={{ maxHeight: LIST_MAX_HEIGHT, overflowY: 'auto', pb: 1, bgcolor: 'inherit', backgroundImage: 'inherit' }}>
        {pinned.length > 0 ? <>{subheader(pinnedLabel, true)}{pinned.map(row)}</> : null}
        {groups.map((g) => (
          <React.Fragment key={g}>
            {subheader(g)}
            {matches.filter((t) => !t.pinned && t.group === g).map(row)}
          </React.Fragment>
        ))}
        {matches.length === 0 ? <Typography variant="body2" color="text.secondary" role="status" sx={{ px: 2, pt: 1.75, pb: 0.75 }}>{emptyLabel}</Typography> : null}
      </List>
    </Paper>
  );
}
