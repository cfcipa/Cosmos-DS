import * as React from 'react';
import Box from '@mui/material/Box';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SincoCanvas } from '../ui/sinco/SincoCanvas';
import type { Estado } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';
import { CanvasSplitCard } from './CanvasSplit';

type Filter = Estado | 'todas';

export function TplCanvasDoc() {
  const [filter, setFilter] = React.useState<Filter>('pendiente');
  const [mode, setMode] = React.useState<'side' | 'canvas'>('side');
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoCanvas key={filter} filter={filter} selected={filter === 'pendiente' ? [1, 7] : undefined} onModeChange={setMode} />}
        properties={
          <>
            <PropRow label="mode"><PropToggle<'side' | 'canvas'> label="mode" value={mode} onChange={() => undefined} options={[['side', 'side'], ['canvas', 'canvas']]} /></PropRow>
            <PropRow label="filter"><PropToggle<Filter> label="filter" value={filter} onChange={setFilter} options={[['pendiente', 'pendientes'], ['todas', 'todas']]} /></PropRow>
            <PropRow label="Try it"><Box sx={{ typography: 'body2', color: 'text.secondary' }}>Pide «Redacta el informe de pendientes»; luego «Agrega las confirmadas».</Box></PropRow>
          </>
        }
      />
    </Box>
  );
}

export const TplCanvasCard = CanvasSplitCard;
