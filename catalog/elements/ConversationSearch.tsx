import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ConversationSearch, type SearchHit } from '../../src/ai/conversation-search';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Conversation search».
const LINES: Array<[string, string]> = [
  ['Tú', 'Resume el estado del cierre de agosto.'],
  ['Asistente', 'Bancos conciliados salvo 2 movimientos; el cierre depende de ellos.'],
  ['Tú', '¿Y los anticipos?'],
  ['Asistente', 'Hay 1 anticipo pendiente, CE-4410, de 11 entregados.'],
  ['Tú', '¿Quién tiene ese anticipo?'],
  ['Asistente', 'El anticipo CE-4410 es de Nicolás Pardo, por gastos de obra.'],
  ['Tú', 'Recuérdale que lo legalice antes del cierre.'],
  ['Asistente', 'Listo. También marqué el cierre como pendiente de ese anticipo.'],
];
/** Contexto a cada lado de la coincidencia (tablero). */
const CONTEXT = 28;

function findHits(query: string): Array<SearchHit & { line: number }> {
  const q = query.trim().toLowerCase();
  const hits: Array<SearchHit & { line: number }> = [];
  if (!q) return hits;
  LINES.forEach(([, text], line) => {
    const low = text.toLowerCase();
    let from = 0;
    for (let k = low.indexOf(q, from); k >= 0; k = low.indexOf(q, from)) {
      hits.push({ id: `${line}-${k}`, line, before: text.slice(Math.max(0, k - CONTEXT), k), match: text.slice(k, k + q.length), after: text.slice(k + q.length, k + q.length + CONTEXT), position: ((line + 0.5) / LINES.length) * 100 });
      from = k + q.length;
    }
  });
  return hits;
}

function SearchDemo({ withStep = true, initial = 'anticipo', queryRef }: { withStep?: boolean; initial?: string; queryRef?: React.MutableRefObject<((q: string) => void) | null> }) {
  const [query, setQuery] = React.useState(initial);
  const [active, setActive] = React.useState(0);
  const hits = React.useMemo(() => findHits(query), [query]);
  const n = hits.length;
  const act = n ? ((active % n) + n) % n : -1;
  const change = (q: string) => { setQuery(q); setActive(0); };
  if (queryRef) queryRef.current = change;
  return (
    <ConversationSearch query={query} hits={hits} activeIndex={act} onQueryChange={change} onStep={withStep ? (d) => setActive(act + d) : undefined} />
  );
}

export function ConversationSearchDoc() {
  const [withStep, setWithStep] = React.useState<'on' | 'off'>('on');
  const setQuery = React.useRef<((q: string) => void) | null>(null);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><SearchDemo withStep={withStep === 'on'} queryRef={setQuery} /></Box>}
        properties={
          <>
            <PropRow label="onStep"><PropToggle<'on' | 'off'> label="onStep" value={withStep} onChange={setWithStep} options={[['on', 'connected'], ['off', 'undefined']]} /></PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" onClick={() => setQuery.current?.('anticipo')}>“anticipo”</Button>
              <Button variant="outlined" onClick={() => setQuery.current?.('cierre')}>“cierre”</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export function ConversationSearchCard() {
  return <SearchDemo initial="cierre" />;
}
