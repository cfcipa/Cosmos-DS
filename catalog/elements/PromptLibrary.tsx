import * as React from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { PromptLibrary } from '../../src/ai/prompt-library';
import type { SavedPrompt } from '../../src/ai/prompt-library';
import { ElementPage } from '../ui/Playground';

// Contenido del tablero «Prompt library».
const PROMPTS: SavedPrompt[] = [
  { id: 'p1', name: 'Conciliar un extracto', body: 'Concilia el extracto de {mes} con la cuenta {cuenta}. Lista los movimientos sin pareja y propón el ajuste de cada uno.', variables: ['mes', 'cuenta'] },
  { id: 'p2', name: 'Resumen de anticipos', body: 'Resume los anticipos pendientes de {mes}: responsable, valor y fecha de vencimiento, ordenados por vencimiento.', variables: ['mes'] },
  { id: 'p3', name: 'Carta de cobro', body: 'Redacta una carta de cobro cordial para {tercero} por las facturas vencidas, con el detalle en una tabla.', variables: ['tercero'] },
  { id: 'p4', name: 'Explicar un comprobante', body: 'Explica este comprobante contable línea por línea, en lenguaje sencillo.', variables: [] },
];

function LibraryDemo({ withComposer = true }: { withComposer?: boolean }) {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState('p1');
  const [composer, setComposer] = React.useState('');
  const insert = (id: string) => { const prompt = PROMPTS.find((p) => p.id === id); if (prompt) setComposer(prompt.body); };
  return (
    <Stack spacing={1.25} sx={{ width: '100%' }}>
      <PromptLibrary prompts={PROMPTS} query={query} selectedId={selected} onQueryChange={setQuery} onSelect={setSelected} onInsert={insert} />
      {withComposer ? (
        <OutlinedInput multiline minRows={2} fullWidth value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Aquí llega el prompt insertado…" inputProps={{ 'aria-label': 'Mensaje' }} />
      ) : null}
    </Stack>
  );
}

export function PromptLibraryDoc() {
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box sx={{ width: '100%', maxWidth: 480 }}><LibraryDemo /></Box></Box>}
      />
    </Box>
  );
}

export function PromptLibraryCard() {
  return <LibraryDemo withComposer={false} />;
}
