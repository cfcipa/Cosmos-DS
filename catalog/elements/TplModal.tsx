import * as React from 'react';
import Box from '@mui/material/Box';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SincoModal } from '../ui/sinco/SincoModal';
import type { Estado } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';
import { AuiAssistantModalCard } from './AuiAssistantModal';

type Filter = Estado | 'todas';
type Flag = 'true' | 'false';

export function TplModalDoc() {
  const [filter, setFilter] = React.useState<Filter>('pendiente');
  const [open, setOpen] = React.useState<Flag>('true');
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoModal key={`${filter}-${open}`} filter={filter} selected={filter === 'pendiente' ? [1, 7] : undefined} defaultOpen={open === 'true'} />}
        properties={
          <>
            <PropRow label="defaultOpen"><PropToggle<Flag> label="defaultOpen" value={open} onChange={setOpen} options={[['true', 'true'], ['false', 'false']]} /></PropRow>
            <PropRow label="filter"><PropToggle<Filter> label="filter" value={filter} onChange={setFilter} options={[['pendiente', 'pendientes'], ['todas', 'todas']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export const TplModalCard = AuiAssistantModalCard;
