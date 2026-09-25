import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SincoAssistant, type SincoControls } from '../ui/sinco/SincoAssistant';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';
import { AuiComposerPillCard } from './AuiComposerPill';
import type { AuiAssistantSurface } from '../../src/ai/aui';

const ASK = 'Resume las obligaciones pendientes de Compras';

export function TplComposerDoc() {
  const [surface, setSurface] = React.useState<AuiAssistantSurface>('closed');
  const controls = React.useRef<SincoControls | null>(null);
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoAssistant surface={surface} onSurfaceChange={setSurface} controlsRef={controls} />}
        properties={
          <>
            <PropRow label="surface"><PropToggle<AuiAssistantSurface> label="surface" value={surface} onChange={setSurface} options={[['closed', 'closed'], ['float', 'float'], ['side', 'side'], ['full', 'full']]} /></PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" onClick={() => controls.current?.ask(ASK)}>Ask while closed</Button>
              <Button variant="outlined" onClick={() => controls.current?.newChat()}>New chat</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export const TplComposerCard = AuiComposerPillCard;
