// Cosmos DS · Kit IA · Composer: Command palette.
// Tablero «Command palette»: todo lo que la aplicación puede hacer, a una tecla, agrupado por dónde actúa.
// Como en assistant-ui: el foco se queda en la búsqueda (combobox) y la opción activa se mueve con ↑ ↓ o con el cursor
// (aria-activedescendant); Enter ejecuta y Esc cierra. Los comandos se agrupan en el orden en que llegan, cada grupo con
// su título fijo al hacer scroll. Paper elevation 24 (el de un diálogo) con InputBase, List y ListSubheader.
import * as React from 'react';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Search } from 'lucide-react';

export interface PaletteCommand {
  id: string;
  label: string;
  /** Dónde actúa: «Hilos», «Sesión», «Hilo activo». */
  group: string;
  /** Teclas del atajo: ['⌘', 'K']. */
  keys?: readonly string[];
}

export interface CommandPaletteProps {
  commands: readonly PaletteCommand[];
  query: string;
  activeId: string;
  onQueryChange?: (query: string) => void;
  onActiveChange?: (id: string) => void;
  onRun?: (id: string) => void;
  onClose?: () => void;
  /** Enfoca la búsqueda al montar. Default true. */
  autoFocus?: boolean;
  className?: string;
}

/** Alto máximo de la lista en el tablero. */
const LIST_MAX_HEIGHT = 212;

export function CommandPalette({ commands, query, activeId, onQueryChange, onActiveChange, onRun, onClose, autoFocus = true, className }: CommandPaletteProps) {
  const listId = React.useId();
  const optionId = (id: string) => `${listId}-${id}`;
  const matches = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  const groups: Array<{ name: string; items: PaletteCommand[] }> = [];
  matches.forEach((command) => {
    const group = groups.find((g) => g.name === command.group);
    if (group) group.items.push(command); else groups.push({ name: command.group, items: [command] });
  });
  const ordered = groups.flatMap((g) => g.items);
  const active = ordered.find((command) => command.id === activeId) ?? ordered[0];
  const index = active ? ordered.indexOf(active) : -1;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose?.(); return; }
    if (!ordered.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); onActiveChange?.(ordered[(index + 1) % ordered.length].id); }
    if (event.key === 'ArrowUp') { event.preventDefault(); onActiveChange?.(ordered[(index - 1 + ordered.length) % ordered.length].id); }
    if (event.key === 'Enter' && active) { event.preventDefault(); onRun?.(active.id); }
  };

  return (
    <Paper elevation={24} role="dialog" aria-label="Paleta de comandos" className={className} data-slot="command-palette" sx={{ overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={(t) => ({ height: t.spacing(6), px: 2, borderBottom: 1, borderColor: 'divider', color: 'action.active' })}>
        <Search size={16} aria-hidden="true" />
        <InputBase
          fullWidth
          autoFocus={autoFocus}
          value={query}
          placeholder="Escribe un comando…"
          onChange={(event) => onQueryChange?.(event.target.value)}
          onKeyDown={onKeyDown}
          inputProps={{
            role: 'combobox',
            'aria-label': 'Buscar comandos',
            'aria-expanded': ordered.length > 0,
            'aria-controls': listId,
            'aria-autocomplete': 'list',
            'aria-activedescendant': active ? optionId(active.id) : undefined,
          }}
          sx={{ typography: 'body1' }}
        />
        <Typography variant="body2" color="text.secondary" component="kbd" sx={{ fontFamily: 'inherit' }}>Esc</Typography>
      </Stack>
      <List id={listId} role="listbox" aria-label="Comandos" disablePadding sx={{ maxHeight: LIST_MAX_HEIGHT, overflowY: 'auto', pb: 1 }}>
        {groups.map((group) => (
          <li key={group.name} role="group" aria-label={group.name}>
            <List disablePadding component="ul">
              {/* Mismo fondo que el Paper elevado (en oscuro lleva la capa de elevación), para que el título fijo no se vea como una franja. */}
              <ListSubheader aria-hidden="true" sx={{ bgcolor: 'inherit', backgroundImage: 'inherit' }}>{group.name}</ListSubheader>
              {group.items.map((command) => (
                <ListItemButton
                  key={command.id}
                  id={optionId(command.id)}
                  role="option"
                  aria-selected={command.id === active?.id}
                  selected={command.id === active?.id}
                  tabIndex={-1}
                  onMouseMove={() => { if (command.id !== activeId) onActiveChange?.(command.id); }}
                  onClick={() => onRun?.(command.id)}
                >
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>{command.label}</Typography>
                  {command.keys?.length ? (
                    <Stack direction="row" spacing={0.25} sx={{ ml: 2 }}>
                      {command.keys.map((key) => <Typography key={key} variant="body2" color="text.secondary" component="kbd" sx={{ fontFamily: 'inherit' }}>{key}</Typography>)}
                    </Stack>
                  ) : null}
                </ListItemButton>
              ))}
            </List>
          </li>
        ))}
        {ordered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 1.75, pb: 0.75 }}>{`Ningún comando coincide con «${query}».`}</Typography>
        ) : null}
      </List>
    </Paper>
  );
}
