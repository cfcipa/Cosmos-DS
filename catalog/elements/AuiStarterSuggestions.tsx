import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AuiStarterSuggestions, AuiThread } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';
import { SincoAssistantDemo } from '../ui/sinco/SincoAssistantDemo';
import { STARTERS, makeObligacionesModel } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';

const CARD_MODEL = makeObligacionesModel({ current: null });

export function AuiStarterSuggestionsDoc() {
  const [count, setCount] = React.useState<'2' | '4'>('4');
  const [reset, setReset] = React.useState(0);
  const starters = React.useMemo(() => STARTERS.slice(0, Number(count)), [count]);
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoAssistantDemo resetKey={reset} defaultSurface="float" starters={starters} />}
        properties={
          <>
            <PropRow label="count"><PropToggle label="count" value={count} onChange={setCount} options={[['2', '2'], ['4', '4']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" onClick={() => setReset((n) => n + 1)}>Reset</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiStarterSuggestionsCard() {
  return (
    <AuiDemoRuntime model={CARD_MODEL} followups="none">
      <ThreadFrame card>
        <AuiThread autoFocus={false} placeholder="¿Por dónde empezamos?" empty={<AuiStarterSuggestions starters={STARTERS.slice(0, 2)} />} />
      </ThreadFrame>
    </AuiDemoRuntime>
  );
}
