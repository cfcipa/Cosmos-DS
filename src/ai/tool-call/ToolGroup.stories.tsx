import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { Play, Copy, RefreshCw, ChevronRight, Check, X, Loader } from 'lucide-react';
import { ToolCall, ToolGroup } from './ToolCall';
import type { ToolCallStatus, ToolGroupProps } from './types';
import { ElementPage, PropRow, PropToggle } from '../../storybook/ElementPage';
import { DemoViewport, DemoUser, DemoAssistantText } from '../../storybook/Conversation';

// Contenido del tablero aprobado «Tool group» (lienzo Asistente Cosmos · AUI connected).
const CALLS = [
  { name: 'consultar_anticipos', target: 'estado = pendiente', args: '{ "estado": "pendiente" }', result: '[\n  { "id": "CE-4492", "tercero": "NIT 52.318.004" },\n  { "id": "CE-4480" }, { "id": "CE-4471" }\n]', seq: 1200, par: 820 },
  { name: 'consultar_vencimientos', target: 'CE-4471, CE-4480, CE-4492', args: '{ "anticipos": ["CE-4471", "CE-4480", "CE-4492"] }', result: '{ "CE-4492": "2026-09-30", "CE-4480": "2026-10-08", "CE-4471": "2026-10-15" }', seq: 1600, par: 1900, error: 'Tiempo de espera agotado al consultar el ERP.' },
  { name: 'buscar_tercero', target: 'NIT 52.318.004', args: '{ "documento": "52.318.004" }', result: '{ "nombre": "Nubia Rojas", "area": "Gastos de viaje" }', seq: 900, par: 1300 },
];
const AFTER_OK = 'Vence primero CE-4492, de Nubia Rojas, el 30 de septiembre, por $1.250.000.';
const AFTER_FAIL = 'CE-4492 es de Nubia Rojas, pero no pude confirmar las fechas de vencimiento: el ERP no respondió.';
const plural = (n: number) => (n === 1 ? '1 llamada a herramienta' : n + ' llamadas a herramientas');
type Design = 'runtime' | 'static';
type Variant = NonNullable<ToolGroupProps['variant']>;

function ToolGroupPage() {
  const [design, setDesign] = React.useState<Design>('runtime');
  const [variant, setVariant] = React.useState<Variant>('ghost');
  const [fail, setFail] = React.useState(false);
  const [el, setEl] = React.useState(0);
  const [gOpen, setGOpen] = React.useState(false);
  const [open, setOpen] = React.useState([false, false, false]);
  const tos = React.useRef<number[]>([]);
  const vp = React.useRef<HTMLDivElement>(null);
  const rt = design === 'runtime';
  const end = rt ? CALLS.reduce((a, c) => a + c.seq, 0) : Math.max(...CALLS.map((c) => c.par));
  const follow = () => { window.setTimeout(() => { if (vp.current) vp.current.scrollTop = vp.current.scrollHeight; }, 220); };

  const run = React.useCallback(() => {
    tos.current.forEach(clearTimeout); tos.current = [];
    const marks = new Set<number>(); let acc = 0;
    CALLS.forEach((c) => { const st = rt ? acc : 0; const d = rt ? c.seq : c.par; marks.add(st); marks.add(st + d); for (let k = 1000; k < d; k += 1000) marks.add(st + k); acc += c.seq; });
    marks.add(end + 300);
    setEl(0);
    [...marks].sort((a, b) => a - b).forEach((t) => tos.current.push(window.setTimeout(() => { setEl(t); if (t >= end) follow(); }, t)));
  }, [rt, end]);
  React.useEffect(() => { run(); return () => tos.current.forEach(clearTimeout); }, [run]);

  let start = 0;
  const calls = CALLS.map((c, i) => {
    const dur = rt ? c.seq : c.par; const st0 = rt ? start : 0; start += c.seq;
    const t = el - st0;
    if (t < 0) return null;
    const status: ToolCallStatus = t < dur ? 'running' : fail && i === 1 ? 'error' : 'complete';
    return { c, i, status, ms: status === 'running' ? (rt ? Math.floor(t / 1000) * 1000 : undefined) : dur, dur };
  }).filter((x): x is NonNullable<typeof x> => !!x);
  const running = calls.filter((x) => x.status === 'running').length;
  const failed = calls.filter((x) => x.status === 'error').length;
  const finished = el >= end + 300;
  const n = CALLS.length;
  const allOpen = gOpen && open.every(Boolean);

  const code = rt
    ? '<ToolGroupRoot variant="' + variant + '"' + (gOpen ? ' open={true} onOpenChange={setOpen}' : '') + '>\n  <ToolGroupTrigger count={' + calls.length + '} active={' + (running > 0) + '} />\n  <ToolGroupContent>{children}</ToolGroupContent>\n</ToolGroupRoot>\n// children: ' + calls.length + ' × <ToolFallback {...part} />'
    : '<ToolGroup\n  label="' + plural(n) + '"\n  tools={tools} // ' + (n - running - failed) + ' done · ' + running + ' running · ' + failed + ' failed\n  open={' + gOpen + '}\n  onOpenChange={setOpen}\n/>';

  return (
    <ElementPage
      section="AUI connected"
      title="Tool group"
      description="Un contenedor plegable para las llamadas a herramientas consecutivas de un mismo turno."
      demo={
        <DemoViewport ref={vp}>
          <DemoUser>¿Qué anticipo vence primero y quién lo tiene?</DemoUser>
          <Stack spacing={0.5}>
            <Box sx={{ px: 1, mt: 0.5, mb: 2 }}>
              {rt ? (
                <ToolGroup count={calls.length} active={running > 0} variant={variant} open={gOpen} onOpenChange={(o) => { setGOpen(o); if (o) follow(); }} label={plural}>
                  {calls.map((x) => (
                    <ToolCall key={x.c.name} toolName={x.c.name} status={x.status} args={x.c.args}
                      result={x.status === 'complete' ? x.c.result : undefined} error={x.status === 'error' ? x.c.error : undefined}
                      durationMs={x.ms} open={open[x.i]}
                      onOpenChange={(o) => { const v = open.slice(); v[x.i] = o; setOpen(v); if (o) follow(); }} />
                  ))}
                </ToolGroup>
              ) : (
                <StaticGroup open={gOpen} onToggle={() => { setGOpen(!gOpen); if (!gOpen) follow(); }} calls={calls} running={running} failed={failed} />
              )}
            </Box>
            {finished ? (
              <>
                <DemoAssistantText>{failed ? AFTER_FAIL : AFTER_OK}</DemoAssistantText>
                <Stack direction="row" sx={{ pt: 0.75, ml: 0.5, minHeight: 30 }}>
                  <IconButton size="small" aria-label="Copiar" title="Copiar"><Copy size={16} /></IconButton>
                  <IconButton size="small" aria-label="Regenerar" title="Regenerar" onClick={run}><RefreshCw size={16} /></IconButton>
                </Stack>
              </>
            ) : null}
          </Stack>
        </DemoViewport>
      }
      properties={
        <>
          <PropRow label="design">
            <PropToggle<Design> label="design" value={design} onChange={(v) => { setDesign(v); setGOpen(false); setOpen([false, false, false]); }}
              options={[['runtime', 'ToolGroupRoot (runtime)'], ['static', 'ToolGroup (static)']]} />
          </PropRow>
          <PropRow label="variant">
            {rt ? <PropToggle<Variant> label="variant" value={variant} onChange={setVariant} options={[['outline', 'outline'], ['ghost', 'ghost'], ['muted', 'muted']]} />
              : <Typography variant="caption" color="text.secondary">The static ToolGroup has one paper design; no variant prop.</Typography>}
          </PropRow>
          <PropRow label="result">
            <PropToggle<'ok' | 'fail'> label="result" value={fail ? 'fail' : 'ok'} onChange={(v) => setFail(v === 'fail')} options={[['ok', 'all succeed'], ['fail', 'one fails']]} />
          </PropRow>
          <PropRow label="Try it">
            <Button variant="contained" startIcon={<Play size={18} />} onClick={run}>Run the group</Button>
            <Button variant="outlined" onClick={() => { const v = !allOpen; setGOpen(v); setOpen([v, v, v]); if (v) follow(); }}>{allOpen ? 'Collapse all' : 'Expand all'}</Button>
          </PropRow>
        </>
      }
      code={code}
    />
  );
}

/** Diseño «static» del tablero: una hoja con resumen y filas por llamada. */
function StaticGroup({ open, onToggle, calls, running, failed }: {
  open: boolean; onToggle: () => void; running: number; failed: number;
  calls: Array<{ c: (typeof CALLS)[number]; i: number; status: ToolCallStatus; dur: number }>;
}) {
  const n = CALLS.length;
  const sum = running > 0 ? (n - running) + '/' + n : failed > 0 ? failed + ' falló' : n + ' listas';
  const Ic = ({ st, size }: { st: 'running' | 'failed' | 'done'; size: number }) => (
    <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, color: st === 'running' ? 'text.secondary' : st === 'failed' ? 'error.main' : 'success.main',
      '& svg': st === 'running' ? { animation: 'cds-spin .6s linear infinite', '@keyframes cds-spin': { to: { transform: 'rotate(360deg)' } } } : {} }}>
      {st === 'running' ? <Loader size={size} /> : st === 'failed' ? <X size={size} /> : <Check size={size} />}
    </Box>
  );
  const total: 'running' | 'failed' | 'done' = running ? 'running' : failed ? 'failed' : 'done';
  return (
    <Box sx={{ width: '100%', maxWidth: 384, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <ButtonBase onClick={onToggle} aria-expanded={open} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, px: 1.75, py: 1.25, justifyContent: 'flex-start', textAlign: 'left', '&:hover': { bgcolor: 'action.hover' } }}>
        <Box component="span" sx={{ display: 'inline-flex', color: 'text.disabled', transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'none' }}><ChevronRight size={12} /></Box>
        <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plural(n)}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{sum}</Typography>
        <Ic st={total} size={14} />
      </ButtonBase>
      <Collapse in={open}>
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          {CALLS.map((c, i) => {
            const x = calls.find((y) => y.i === i);
            const st = !x || x.status === 'running' ? 'running' : x.status === 'error' ? 'failed' : 'done';
            return (
              <Stack key={c.name} direction="row" alignItems="center" spacing={1.25} sx={{ px: 1.75, py: 1 }}>
                <Box sx={{ width: 14, display: 'flex', justifyContent: 'center' }}><Ic st={st} size={12} /></Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{c.name}</Typography>
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.target}</Typography>
                {st !== 'running' && x ? <Typography variant="caption" color="text.disabled" sx={{ fontVariantNumeric: 'tabular-nums' }}>{x.dur} ms</Typography> : null}
              </Stack>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
}

const meta: Meta = {
  title: 'Elementos/AUI connected/Tool group',
  parameters: { layout: 'fullscreen', demoWidth: 600, controls: { disable: true } },
};
export default meta;
export const Tablero: StoryObj = { name: 'Tool group', render: () => <ToolGroupPage /> };
