import * as React from 'react';
import Box from '@mui/material/Box';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SincoSidebar } from '../ui/sinco/SincoSidebar';
import type { Estado } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';
import { AuiAssistantSidebarCard } from './AuiAssistantSidebar';

type Filter = Estado | 'todas';
type Flag = 'true' | 'false';

export function TplSidebarDoc() {
  const [filter, setFilter] = React.useState<Filter>('pendiente');
  const [open, setOpen] = React.useState<Flag>('true');
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoSidebar key={filter} filter={filter} selected={filter === 'pendiente' ? [1, 7] : undefined} open={open === 'true'} onOpenChange={(o) => setOpen(o ? 'true' : 'false')} />}
        properties={
          <>
            <PropRow label="open"><PropToggle<Flag> label="open" value={open} onChange={setOpen} options={[['true', 'true'], ['false', 'false']]} /></PropRow>
            <PropRow label="filter"><PropToggle<Filter> label="filter" value={filter} onChange={setFilter} options={[['pendiente', 'pendientes'], ['todas', 'todas']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

export const TplSidebarCard = AuiAssistantSidebarCard;
