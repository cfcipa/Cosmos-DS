import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AuiComposerPill } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SINCO_PREVIOUS_THREADS, SincoAssistant, type SincoControls } from '../ui/sinco/SincoAssistant';
import { DICTATED, SINCO_THREADS } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';

const ASK = 'Resume las obligaciones pendientes de Compras';

export function AuiComposerPillDoc() {
  const [has, setHas] = React.useState<'false' | 'true'>('false');
  const controls = React.useRef<SincoControls | null>(null);
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoAssistant resetKey={has} preview={false} threads={has === 'true' ? SINCO_THREADS : SINCO_PREVIOUS_THREADS} startIn={has === 'true' ? 'resumen' : undefined} controlsRef={controls} />}
        properties={
          <>
            <PropRow label="hasMessages"><PropToggle label="hasMessages" value={has} onChange={setHas} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" onClick={() => controls.current?.open()}>Open</Button>
              <Button variant="outlined" onClick={() => controls.current?.ask(ASK)}>Ask while closed</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiComposerPillCard() {
  return (
    <AuiDemoRuntime dictation={DICTATED} followups="none">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 212 }}>
        <Box sx={{ width: '100%' }}><AuiComposerPill /></Box>
      </Box>
    </AuiDemoRuntime>
  );
}
