import * as React from 'react';
import type { ToolCallMessagePartStatus } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Play } from 'lucide-react';
import { AuiToolFallback, AuiToolGroupCard, toolCallsLabel, type AuiGroupedTool, type AuiToolGroupVariant } from '../../src/ai/aui';
import { ToolGroup } from '../../src/ai/tool-call';
import { riseSx, userBubbleSx } from '../../src/ai/lib/thread';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

const ASK = '¿Qué anticipo vence primero y quién lo tiene?';
/** Las llamadas del tablero: en el hilo van una tras otra (seq); en el resumen corren a la vez (par). */
const CALLS = [
  { name: 'consultar_anticipos', target: 'estado = pendiente', args: '{ "estado": "pendiente" }', result: '[\n  { "id": "CE-4492", "tercero": "NIT 52.318.004" },\n  { "id": "CE-4480" }, { "id": "CE-4471" }\n]', seq: 1200, par: 820 },
  { name: 'consultar_vencimientos', target: 'CE-4471, CE-4480, CE-4492', args: '{ "anticipos": ["CE-4471", "CE-4480", "CE-4492"] }', result: '{ "CE-4492": "2026-09-30", "CE-4480": "2026-10-08", "CE-4471": "2026-10-15" }', seq: 1600, par: 1900, error: 'Tiempo de espera agotado al consultar el ERP.' },
  { name: 'buscar_tercero', target: 'NIT 52.318.004', args: '{ "documento": "52.318.004" }', result: '{ "nombre": "Nubia Rojas", "area": "Gastos de viaje" }', seq: 900, par: 1300 },
];
const AFTER_OK = 'Vence primero CE-4492, de Nubia Rojas, el 30 de septiembre, por $1.250.000.';
const AFTER_FAIL = 'CE-4492 es de Nubia Rojas, pero no pude confirmar las fechas de vencimiento: el ERP no respondió.';
const FRAME_MS = 100;
type Design = 'runtime' | 'static';

function useClock(run: number) {
  const [el, setEl] = React.useState(0);
  React.useEffect(() => {
    const t0 = Date.now();
    setEl(0);
    const id = window.setInterval(() => setEl(Date.now() - t0), FRAME_MS);
    return () => window.clearInterval(id);
  }, [run]);
  return el;
}

function RuntimeDesign({ variant, fail, el, open, setOpen }: { variant: AuiToolGroupVariant; fail: boolean; el: number; open: boolean; setOpen: (o: boolean) => void }) {
  let start = 0;
  const calls = CALLS.flatMap((c, i) => {
    const t = el - start;
    start += c.seq;
    if (t < 0) return [];
    const running = t < c.seq;
    const fails = fail && i === 1;
    const status: ToolCallMessagePartStatus = running ? { type: 'running' } : fails ? { type: 'incomplete', reason: 'error', error: c.error } : { type: 'complete' };
    return [{ c, i, status, ms: running ? t : c.seq, result: !running && !fails ? c.result : undefined }];
  });
  const total = CALLS.reduce((a, c) => a + c.seq, 0);
  const active = calls.some((x) => x.status.type === 'running');
  return (
    <>
      <ToolGroup variant={variant} count={calls.length} active={active} open={open} onOpenChange={setOpen}>
        {calls.map((x) => (
          <Box key={x.c.name}>
            <AuiToolFallback type="tool-call" toolCallId={x.c.name} toolName={x.c.name} args={{}} argsText={x.c.args} status={x.status} result={x.result} elapsedMs={x.ms} />
          </Box>
        ))}
      </ToolGroup>
      {el >= total && <Typography variant="body1" sx={(t) => ({ mt: 1.5, ...riseSx(t) })}>{fail ? AFTER_FAIL : AFTER_OK}</Typography>}
    </>
  );
}

function StaticDesign({ fail, el, open, setOpen }: { fail: boolean; el: number; open: boolean; setOpen: (o: boolean) => void }) {
  const tools: AuiGroupedTool[] = CALLS.map((c, i) => ({
    id: c.name, name: c.name, target: c.target,
    state: el < c.par ? 'running' : fail && i === 1 ? 'failed' : 'done',
    durationMs: el < c.par ? undefined : c.par,
  }));
  const done = tools.every((t) => t.state !== 'running');
  return (
    <>
      <AuiToolGroupCard label={toolCallsLabel(CALLS.length)} tools={tools} open={open} onOpenChange={setOpen} />
      {done && <Typography variant="body1" sx={(t) => ({ mt: 1.5, ...riseSx(t) })}>{fail ? AFTER_FAIL : AFTER_OK}</Typography>}
    </>
  );
}

export function AuiToolGroupDoc() {
  const [design, setDesign] = React.useState<Design>('runtime');
  const [variant, setVariant] = React.useState<AuiToolGroupVariant>('ghost');
  const [fail, setFail] = React.useState<'ok' | 'fail'>('ok');
  const [run, setRun] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const el = useClock(run);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime>
        <ElementPage
          demoHeight={460}
          demo={
            <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
              <Typography variant="body1" sx={userBubbleSx()}>{ASK}</Typography>
              <Box sx={{ px: 1 }}>
                {design === 'runtime'
                  ? <RuntimeDesign variant={variant} fail={fail === 'fail'} el={el} open={open} setOpen={setOpen} />
                  : <StaticDesign fail={fail === 'fail'} el={el} open={open} setOpen={setOpen} />}
              </Box>
            </Stack>
          }
          properties={
            <>
              <PropRow label="design"><PropToggle<Design> label="design" value={design} onChange={(d) => { setDesign(d); setOpen(false); setRun((r) => r + 1); }} options={[['runtime', 'ToolGroupRoot (runtime)'], ['static', 'ToolGroup (static)']]} /></PropRow>
              {design === 'runtime' && <PropRow label="variant"><PropToggle<AuiToolGroupVariant> label="variant" value={variant} onChange={setVariant} options={[['outline', 'outline'], ['ghost', 'ghost'], ['muted', 'muted']]} /></PropRow>}
              <PropRow label="result"><PropToggle label="result" value={fail} onChange={setFail} options={[['ok', 'all succeed'], ['fail', 'one fails']]} /></PropRow>
              <PropRow label="Try it">
                <Button variant="outlined" startIcon={<Play size={16} />} onClick={() => setRun((r) => r + 1)}>Run the group</Button>
                <Button variant="outlined" onClick={() => setOpen((o) => !o)}>{open ? 'Collapse' : 'Expand'}</Button>
              </PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

/** La tarjeta repite el grupo cada pocos segundos. */
const CARD_LOOP = 6000;
export function AuiToolGroupPreview() {
  const [run, setRun] = React.useState(0);
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => { const id = window.setInterval(() => setRun((r) => r + 1), CARD_LOOP); return () => window.clearInterval(id); }, []);
  const el = useClock(run);
  return (
    <AuiDemoRuntime>
      <Box sx={{ maxHeight: 212, overflow: 'hidden' }}><RuntimeDesign variant="outline" fail={false} el={el} open={open} setOpen={setOpen} /></Box>
    </AuiDemoRuntime>
  );
}
