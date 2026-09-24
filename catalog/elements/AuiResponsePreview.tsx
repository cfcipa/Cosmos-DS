import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AuiAssistantProvider, AuiComposerPill, AuiResponsePreview } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SincoAssistantDemo, approvalPreviewText, type SincoControls } from '../ui/sinco/SincoAssistantDemo';
import { SINCO_THREADS } from '../ui/sinco/obligaciones';
import { SINCO_DEMO_HEIGHT, SINCO_PAGE_WIDTH } from './AuiAssistantPanel';

type Kind = 'answer' | 'approval';
type Peek = 'card' | 'tab';
const PREVIOUS = SINCO_THREADS.slice(1);
const ASK = 'Resume las obligaciones pendientes de Compras';
const CONFIRM = 'Confirma las seleccionadas';
/** Las dos pendientes que el tablero deja seleccionadas para pedir la aprobación. */
const SELECTED = [9, 16];
/** El tablero pregunta 0,7 s después de montar. */
const ASK_DELAY_MS = 700;

export function AuiResponsePreviewDoc() {
  const [kind, setKind] = React.useState<Kind>('answer');
  const [peek, setPeek] = React.useState<Peek>('card');
  const [pose, setPose] = React.useState(0);
  const controls = React.useRef<SincoControls | null>(null);
  const approval = kind === 'approval';
  // Con aprobación, la pregunta se hace al montar: la respuesta llega con el asistente cerrado.
  const [asked, setAsked] = React.useState(-1);
  React.useEffect(() => {
    if (!approval || asked === pose) return undefined;
    const id = window.setTimeout(() => { controls.current?.ask(CONFIRM); setAsked(pose); }, ASK_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [approval, pose, asked]);
  const repose = () => setPose((p) => p + 1);
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={
          <SincoAssistantDemo
            resetKey={`${kind}-${peek}-${pose}`}
            threads={approval ? PREVIOUS : SINCO_THREADS}
            startIn={approval ? undefined : 'resumen'}
            filter={approval ? 'pendiente' : 'todas'}
            selected={approval ? SELECTED : undefined}
            preview={{ defaultPeek: peek }}
            controlsRef={controls}
          />
        }
        properties={
          <>
            <PropRow label="peek"><PropToggle<Peek> label="peek" value={peek} onChange={(p) => { setPeek(p); repose(); }} options={[['card', 'card'], ['tab', 'tab']]} /></PropRow>
            <PropRow label="kind"><PropToggle<Kind> label="kind" value={kind} onChange={(k) => { setKind(k); repose(); }} options={[['answer', 'answer'], ['approval', 'awaiting approval']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" onClick={() => (approval ? repose() : controls.current?.ask(ASK))}>Replay</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiResponsePreviewCard() {
  return (
    <AuiDemoRuntime threads={SINCO_THREADS} startIn="resumen" followups="none">
      <AuiAssistantProvider surface="closed">
        <Box sx={{ position: 'relative', height: 212, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <Box sx={{ position: 'relative' }}>
            <AuiResponsePreview defaultPeek="card" autoTuck={Number.POSITIVE_INFINITY} approvalText={approvalPreviewText} />
            <AuiComposerPill />
          </Box>
        </Box>
      </AuiAssistantProvider>
    </AuiDemoRuntime>
  );
}
