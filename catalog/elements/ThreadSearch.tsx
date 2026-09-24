import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ThreadSearch, type SearchableThread } from '../../src/ai/thread-search';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Thread search».
const THREADS: SearchableThread[] = [
  { id: 't1', title: 'Cierre de septiembre', group: 'Hoy', preview: 'Faltan 2 movimientos sin pareja en la cuenta 1110', pinned: true },
  { id: 't2', title: 'Política de anticipos', group: 'Anteriores', preview: 'Versión 3 con plazo de 15 días', pinned: true },
  { id: 't3', title: 'Anticipos pendientes de septiembre', group: 'Hoy', preview: 'Hay 3 anticipos por $3.930.000' },
  { id: 't4', title: 'Cambio de centro de costo', group: 'Hoy', preview: 'CE-4471 pasó a CC-305 Obra Sur' },
  { id: 't5', title: 'Retención en la fuente', group: 'Ayer', preview: 'Base gravable antes de IVA por la tarifa del concepto' },
  { id: 't6', title: 'Conciliación bancaria de agosto', group: 'Anteriores', preview: 'Concilié 42 movimientos' },
];

export function ThreadSearchDoc() {
  const [query, setQuery] = React.useState('');
  const [activeId, setActiveId] = React.useState('t1');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><ThreadSearch threads={THREADS} query={query} activeId={activeId} onQueryChange={setQuery} onSelect={setActiveId} sx={{ maxHeight: 352 }} /></Box>}
        properties={
          <>
            <PropRow label="activeId"><Typography variant="body3" color="text.secondary" sx={(t) => t.aiKit.code}>{`"${activeId}"`}</Typography></PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" onClick={() => setQuery('anticipo')}>“anticipo”</Button>
              <Button variant="outlined" onClick={() => setQuery('zzz')}>“zzz”</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export function ThreadSearchCard() {
  const [query, setQuery] = React.useState('');
  const [activeId, setActiveId] = React.useState('t1');
  return <ThreadSearch threads={THREADS} query={query} activeId={activeId} onQueryChange={setQuery} onSelect={setActiveId} sx={{ maxHeight: 212 }} />;
}
