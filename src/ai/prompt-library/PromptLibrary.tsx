// Cosmos DS · Kit IA · Composer: Prompt library.
// Tablero «Prompt library»: los prompts que guardaste, con búsqueda, y sus variables a la vista antes de insertar uno.
// Como en assistant-ui: la búsqueda es un combobox que filtra por nombre; ↑ ↓ mueven la selección (aria-activedescendant)
// y Enter inserta; doble clic en un prompt también lo inserta. A la derecha, el prompt elegido con sus variables.
// Paper outlined con InputBase, una List de ListItemButton (selected) y Chips para las variables.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Search } from 'lucide-react';

export interface SavedPrompt {
  id: string;
  name: string;
  body: string;
  variables: readonly string[];
}

export interface PromptLibraryProps {
  prompts: readonly SavedPrompt[];
  query: string;
  selectedId: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (id: string) => void;
  onInsert?: (id: string) => void;
  className?: string;
}

/** Medidas del tablero: la columna de la lista y el alto del panel. */
const LIST_WIDTH = 200;
const PANEL_HEIGHT = 220;

export function PromptLibrary({ prompts, query, selectedId, onQueryChange, onSelect, onInsert, className }: PromptLibraryProps) {
  const listId = React.useId();
  const optionId = (id: string) => `${listId}-${id}`;
  const matches = prompts.filter((prompt) => prompt.name.toLowerCase().includes(query.toLowerCase()));
  const selected = matches.find((prompt) => prompt.id === selectedId);
  const index = selected ? matches.indexOf(selected) : -1;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!matches.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); onSelect?.(matches[index < 0 ? 0 : Math.min(matches.length - 1, index + 1)].id); }
    if (event.key === 'ArrowUp') { event.preventDefault(); onSelect?.(matches[index < 0 ? matches.length - 1 : Math.max(0, index - 1)].id); }
    if (event.key === 'Enter' && selected) { event.preventDefault(); onInsert?.(selected.id); }
  };

  return (
    <Paper
      variant="outlined"
      className={className}
      data-slot="prompt-library"
      sx={(t) => ({ display: 'grid', gridTemplateColumns: `${LIST_WIDTH}px minmax(0, 1fr)`, height: PANEL_HEIGHT, overflow: 'hidden' })}
    >
      <Stack sx={{ borderRight: 1, borderColor: 'divider', minHeight: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={(t) => ({ height: t.spacing(5.5), flexShrink: 0, px: 1.5, borderBottom: 1, borderColor: 'divider', color: 'action.active' })}>
          <Search size={16} aria-hidden="true" />
          <InputBase
            fullWidth
            value={query}
            placeholder="Buscar…"
            onChange={(event) => onQueryChange?.(event.target.value)}
            onKeyDown={onKeyDown}
            inputProps={{
              role: 'combobox',
              'aria-label': 'Buscar prompts',
              'aria-expanded': matches.length > 0,
              'aria-controls': listId,
              'aria-autocomplete': 'list',
              'aria-activedescendant': selected ? optionId(selected.id) : undefined,
            }}
            sx={{ typography: 'body1' }}
          />
        </Stack>
        <List id={listId} role="listbox" aria-label="Prompts guardados" sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {matches.map((prompt) => (
            <ListItemButton
              key={prompt.id}
              id={optionId(prompt.id)}
              role="option"
              aria-selected={prompt.id === selectedId}
              selected={prompt.id === selectedId}
              tabIndex={-1}
              onClick={() => onSelect?.(prompt.id)}
              onDoubleClick={() => onInsert?.(prompt.id)}
            >
              <ListItemText primary={prompt.name} primaryTypographyProps={{ variant: 'body1', noWrap: true }} sx={{ my: 0 }} />
            </ListItemButton>
          ))}
          {matches.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 0.75 }}>{`Ningún prompt coincide con «${query}».`}</Typography>
          ) : null}
        </List>
      </Stack>
      <Stack spacing={1} sx={{ px: 2, py: 1.5, overflowY: 'auto' }}>
        {selected ? (
          <>
            <Typography variant="subtitle1">{selected.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{selected.body}</Typography>
            {selected.variables.length ? (
              <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {selected.variables.map((variable) => <Chip key={variable} size="small" label={`{${variable}}`} />)}
              </Stack>
            ) : null}
            {onInsert ? <Box sx={{ pt: 0.5 }}><Button variant="contained" onClick={() => onInsert(selected.id)}>Insertar</Button></Box> : null}
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}
