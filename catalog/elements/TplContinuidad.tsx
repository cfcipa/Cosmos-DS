import * as React from 'react';
import Box from '@mui/material/Box';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SincoCanvas } from '../ui/sinco/SincoCanvas';
import type { Estado } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';
import { AuiAssistantModalCard } from './AuiAssistantModal';

type Filter = Estado | 'todas';

export function TplContinuidadDoc() {
  const [filter, setFilter] = React.useState<Filter>('pendiente');
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoCanvas key={filter} filter={filter} selected={filter === 'pendiente' ? [1, 7] : undefined} defaultOpen={false} launcher />}
        properties={
          <>
            <PropRow label="filter"><PropToggle<Filter> label="filter" value={filter} onChange={setFilter} options={[['pendiente', 'pendientes'], ['todas', 'todas']]} /></PropRow>
            <PropRow label="Try it"><Box sx={{ typography: 'body2', color: 'text.secondary' }}>Pregunta en la burbuja, muévela al panel lateral y pide «Redacta el informe»: el hilo es el mismo en las tres superficies.</Box></PropRow>
          </>
        }
      />
    </Box>
  );
}

export const TplContinuidadCard = AuiAssistantModalCard;
