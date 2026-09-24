import * as React from 'react';
import { useAui, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { AuiQuoteBlock, AuiThread } from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { AuiDemoRuntime, type DemoThread } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';

const ANSWER = 'Hay 3 anticipos pendientes por $3.930.000. El próximo en vencer es CE-4492, de Nubia Rojas, el 30 de septiembre, por gastos de viaje a Medellín. Los otros dos, CE-4471 y CE-4480, vencen en octubre y ya tienen soportes cargados.';
/** El pasaje que el tablero selecciona al abrir. */
const SAMPLE = 'CE-4492, de Nubia Rojas, el 30 de septiembre';
const THREADS: DemoThread[] = [{ id: 'citas', title: 'Anticipos pendientes', messages: [{ role: 'user', content: '¿Qué anticipos siguen pendientes?' }, { role: 'assistant', content: ANSWER }] }];
type Actions = 'one' | 'three';

/** Selecciona el pasaje de ejemplo en la respuesta, como si la persona lo hubiera marcado. */
function selectSample(root: HTMLElement | null) {
  const message = root?.querySelector('[data-slot="aui-assistant-message"]');
  if (!message) return;
  const walker = document.createTreeWalker(message, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const i = node.nodeValue?.indexOf(SAMPLE) ?? -1;
    if (i < 0) continue;
    const range = document.createRange();
    range.setStart(node, i);
    range.setEnd(node, i + SAMPLE.length);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    // La barra escucha selectionchange y mouseup.
    document.dispatchEvent(new Event('selectionchange'));
    message.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    return;
  }
}

function QuoteState() {
  const quote = useAuiState((s) => s.composer.quote);
  return <Typography variant="body3" color="text.secondary" sx={(t) => ({ ...t.aiKit.code, overflowWrap: 'anywhere' })}>{quote ? JSON.stringify({ text: quote.text }) : 'undefined'}</Typography>;
}

function Reset() {
  const aui = useAui() as unknown as { composer: () => { setQuote: (q: undefined) => void } };
  return <Button variant="outlined" onClick={() => aui.composer().setQuote(undefined)}>setQuote(undefined)</Button>;
}

export function AuiQuoteDoc() {
  const [actions, setActions] = React.useState<Actions>('three');
  const frame = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const id = window.setTimeout(() => selectSample(frame.current), 1200);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime threads={THREADS} startIn="citas">
        <ElementPage
          demoHeight={440}
          demo={<Box ref={frame} sx={{ height: '100%' }}><ThreadFrame><AuiThread autoFocus={false} quotes={actions === 'three' ? 'actions' : true} /></ThreadFrame></Box>}
          properties={
            <>
              <PropRow label="actions"><PropToggle<Actions> label="actions" value={actions} onChange={setActions} options={[['one', 'Citar'], ['three', 'Citar · Explicar · Reescribir']]} /></PropRow>
              <PropRow label="Try it"><Button variant="outlined" onClick={() => selectSample(frame.current)}>Select a passage</Button><Reset /></PropRow>
              <PropRow label="composer.quote"><QuoteState /></PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiQuoteCard() {
  return (
    <Stack spacing={1.5}>
      <Box sx={(t) => ({ ...userBubbleSx(), alignSelf: 'flex-end', ...t.typography.body1 })}>
        <AuiQuoteBlock text={SAMPLE} messageId="m2" />
        ¿Cuándo se giró?
      </Box>
      <Typography variant="body1">CE-4492 se giró el 2 de septiembre por $1.450.000. Falta cargar la factura del hotel para legalizarlo antes del 30 de septiembre.</Typography>
    </Stack>
  );
}
