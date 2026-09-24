import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CommandPalette } from '../../src/ai/command-palette';
import type { PaletteCommand } from '../../src/ai/command-palette';
import { ElementPage } from '../ui/Playground';

// Contenido del tablero «Command palette».
const COMMANDS: PaletteCommand[] = [
  { id: 'new', label: 'Nuevo hilo', group: 'Hilos', keys: ['⌘', 'N'] },
  { id: 'search', label: 'Buscar hilos', group: 'Hilos', keys: ['⌘', 'K'] },
  { id: 'model', label: 'Cambiar de modelo', group: 'Sesión', keys: ['⌘', 'M'] },
  { id: 'export', label: 'Exportar el hilo', group: 'Hilo activo', keys: ['⌘', 'E'] },
  { id: 'stop', label: 'Detener la respuesta', group: 'Hilo activo', keys: ['Esc'] },
];

function PaletteDemo({ autoFocus = true }: { autoFocus?: boolean }) {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState('new');
  const [log, setLog] = React.useState('');
  const run = (id: string) => { const command = COMMANDS.find((c) => c.id === id); setOpen(false); setLog(`onRun("${id}") · ${command?.label ?? ''}`); };
  return (
    <Stack spacing={1.25} sx={{ width: '100%' }}>
      {open ? (
        <CommandPalette commands={COMMANDS} query={query} activeId={active} onQueryChange={setQuery} onActiveChange={setActive} onRun={run} onClose={() => { setOpen(false); setLog('Paleta cerrada'); }} autoFocus={autoFocus} />
      ) : (
        <Button variant="contained" sx={{ alignSelf: 'center' }} onClick={() => { setOpen(true); setQuery(''); setLog(''); }}>Abrir paleta · ⌘K</Button>
      )}
      <Typography variant="body3" color="text.secondary" role="status" sx={(t) => ({ minHeight: t.typography.body3.lineHeight, textAlign: 'center' })}>{log}</Typography>
    </Stack>
  );
}

export function CommandPaletteDoc() {
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box sx={{ width: '100%', maxWidth: 440 }}><PaletteDemo /></Box></Box>}
      />
    </Box>
  );
}

export function CommandPaletteCard() {
  return <PaletteDemo autoFocus={false} />;
}
