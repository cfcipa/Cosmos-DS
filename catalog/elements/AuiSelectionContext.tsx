import * as React from 'react';
import { useAui, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AuiSelectionContextProvider, AuiThread } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';
import { facturasModel, facturasSelection } from '../ui/sinco/facturas';

type Count = '0' | '1' | '3';
const PLACEHOLDER = 'Pregunta por lo que seleccionaste…';
const ASK = 'Resume lo seleccionado';

function Send() {
  const aui = useAui() as unknown as { composer: () => { setText: (t: string) => void; send: () => void } };
  const running = useAuiState((s) => s.thread.isRunning);
  const text = useAuiState((s) => s.composer.text);
  return (
    <Button
      variant="contained"
      disabled={running}
      onClick={() => { const c = aui.composer(); if (!text.trim()) c.setText(ASK); c.send(); }}
    >
      Send
    </Button>
  );
}

export function AuiSelectionContextDoc() {
  const [n, setN] = React.useState<Count>('3');
  const selection = React.useMemo(() => facturasSelection(Number(n)), [n]);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime model={facturasModel} followups="none">
        <AuiSelectionContextProvider selection={selection}>
          <ElementPage
            demoHeight={440}
            demo={<ThreadFrame><AuiThread autoFocus={false} placeholder={PLACEHOLDER} empty={null} /></ThreadFrame>}
            properties={
              <>
                <PropRow label="selection"><PropToggle<Count> label="selection" value={n} onChange={setN} options={[['0', 'none'], ['1', '1'], ['3', '3']]} /></PropRow>
                <PropRow label="Try it"><Send /></PropRow>
              </>
            }
          />
        </AuiSelectionContextProvider>
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiSelectionContextCard() {
  const selection = React.useMemo(() => facturasSelection(3), []);
  return (
    <AuiDemoRuntime model={facturasModel} followups="none">
      <AuiSelectionContextProvider selection={selection}>
        <ThreadFrame card><AuiThread autoFocus={false} placeholder={PLACEHOLDER} empty={null} /></ThreadFrame>
      </AuiSelectionContextProvider>
    </AuiDemoRuntime>
  );
}
