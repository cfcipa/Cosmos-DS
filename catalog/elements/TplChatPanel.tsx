import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ObligacionDrawer, SincoChatPanel } from '../ui/sinco/SincoChatPanel';
import { ROWS, type Estado } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';

type Filter = Estado | 'todas';
/** La obligación que abre «Open detail»: la del soporte que vence hoy. */
const DEMO_ROW = 7;

export function TplChatPanelDoc() {
  const [filter, setFilter] = React.useState<Filter>('todas');
  const [key, setKey] = React.useState(0);
  const [start, setStart] = React.useState<number | null>(null);
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoChatPanel key={`${key}-${filter}`} filter={filter} defaultDetail={start} />}
        properties={
          <>
            <PropRow label="filter"><PropToggle<Filter> label="filter" value={filter} onChange={(f) => { setFilter(f); setStart(null); }} options={[['todas', 'todas'], ['pendiente', 'pendientes'], ['confirmada', 'confirmadas']]} /></PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" onClick={() => { setStart(DEMO_ROW); setKey((k) => k + 1); }}>Open detail</Button>
              <Button variant="outlined" onClick={() => { setStart(null); setKey((k) => k + 1); }}>Reset</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** La tarjeta: el cajón solo, con la obligación del soporte que vence hoy. */
export function TplChatPanelCard() {
  const record = ROWS.find((r) => r.id === DEMO_ROW) ?? null;
  return (
    <Box sx={{ position: 'relative', height: 260, overflow: 'hidden', '& .MuiDrawer-paper': { width: '100%' } }}>
      <ObligacionDrawer record={record} open onClose={() => undefined} />
    </Box>
  );
}
