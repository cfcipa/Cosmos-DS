// La pantalla anfitriona de los tableros Sinco: Obligaciones por pagar · Compras, con su tabla, filtros por estado y
// barra de selección, y el modelo de ejemplo que la conoce (resume, filtra y confirma o causa con aprobación).
import * as React from 'react';
import type { ChatModelAdapter, ChatModelRunResult, SuggestionAdapter, ThreadMessage } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { alpha, keyframes, type Theme } from '@mui/material/styles';
import { Check, CircleCheck, Filter, Receipt, ShieldCheck } from 'lucide-react';
import { AuiAskAiAction, type AuiAssistantAgent, type AuiSelection, type AuiStarter } from '../../../src/ai/aui';
import type { DemoThread } from '../AuiDemoRuntime';

export type Estado = 'borrador' | 'pendiente' | 'rechazada' | 'confirmada' | 'causada' | 'pagada' | 'descartado';
/** Medio de pago: tarjeta (marca y últimos dígitos), transferencia, efectivo, billetera u otro. */
export type MedioPago = { t: string; brand?: string; icon?: 'transfer' | 'cash' | 'other'; d?: string; mask?: boolean };
/** Saldo por pagar: pago por extracto, abonos, sin abonos o no aplica. */
export type Saldo = { tipo: 'extracto' | 'abonos' | 'sin' | 'na'; valor?: number; n?: number };
export type Obligacion = {
  id: number; prov: string; nit: string; ob: string; total: number; cur: string; est: Estado; bloqueo?: boolean; soporte?: { dias: number; txt: string };
  mp?: MedioPago; fc?: string; fr?: string; saldo?: Saldo; motivo?: string;
};

export const ESTADOS_COMPACTOS: Array<{ k: Estado | 'todas'; label: string }> = [
  { k: 'todas', label: 'Todas' }, { k: 'pendiente', label: 'Pendientes' }, { k: 'confirmada', label: 'Confirmadas' }, { k: 'causada', label: 'Causadas' }, { k: 'pagada', label: 'Pagadas' },
];
export const CHIP: Record<Estado, { label: string; color: 'primary' | 'warning' | 'error' | 'info' | 'secondary' | 'success' | 'grey' }> = {
  borrador: { label: 'Borrador', color: 'primary' }, pendiente: { label: 'Pendiente', color: 'warning' }, rechazada: { label: 'Rechazada', color: 'error' },
  confirmada: { label: 'Confirmada', color: 'info' }, causada: { label: 'Causada', color: 'secondary' }, pagada: { label: 'Pagada', color: 'success' }, descartado: { label: 'Descartado', color: 'grey' },
};

/** Las obligaciones del tablero (Obligaciones por pagar · Compras). */
export const ROWS: readonly Obligacion[] = [
  { id: 1, prov: 'Soluciones Integrales S.A.', nit: 'Nit 8682548294-1', ob: 'FAC-123456', total: 1345678, cur: 'COP', est: 'pendiente' },
  { id: 3, prov: 'Innovación Empresarial S.A.', nit: 'Nit 8682548294-1', ob: 'FAC-864209753', total: 3567890, cur: 'COP', est: 'rechazada' },
  { id: 4, prov: 'Proveedores Unidos S.A.', nit: 'Nit 8682548294-1', ob: 'INVOICE-1357902468', total: 6890123, cur: 'COP', est: 'causada' },
  { id: 5, prov: 'Uber transporte', nit: 'Nit 8682548294-1', ob: 'INVOICE-987654321', total: 78901, cur: 'COP', est: 'pagada' },
  { id: 6, prov: 'Logística y Servicios S.A.S.', nit: 'Nit 8682548294-1', ob: 'FAC-654321', total: 13567890, cur: 'COP', est: 'confirmada' },
  { id: 7, prov: 'Consultoría Avanzada S.A.S.', nit: 'Nit 8682548294-1', ob: 'FCT-246801', total: 25, cur: 'USD', est: 'pendiente', soporte: { dias: 0, txt: 'vence hoy' } },
  { id: 9, prov: 'Tecnología y Servicios S.A.S.', nit: 'Nit 8682548294-1', ob: 'INVOICE-9876543210', total: 8012345, cur: 'COP', est: 'pendiente' },
  { id: 10, prov: 'Distribuciones del Pacífico S.A.', nit: 'Nit 8682548294-1', ob: 'FAC-258963', total: 9123456, cur: 'COP', est: 'confirmada' },
  { id: 11, prov: 'Express Soluciones S.A.', nit: 'Nit 8682548294-1', ob: 'INVOICE-2468013579', total: 12456789, cur: 'COP', est: 'pendiente', bloqueo: true },
  { id: 13, prov: 'Soluciones Integrales S.A.', nit: 'Nit 8682548294-1', ob: 'FCT-246801', total: 1345678, cur: 'COP', est: 'pendiente', soporte: { dias: 3, txt: 'vence en 3 días' } },
  { id: 16, prov: 'Express Soluciones S.A.', nit: 'Nit 8682548294-1', ob: 'FCT-123456', total: 12456789, cur: 'COP', est: 'pendiente' },
  { id: 19, prov: 'Bre-b Servicios S.A.S.', nit: 'Nit 8682548294-1', ob: 'FAC-778899', total: 452300, cur: 'COP', est: 'confirmada' },
  { id: 24, prov: 'Tecnología y Servicios S.A.S.', nit: 'Nit 8682548294-1', ob: 'FCT-246802', total: 540000, cur: 'COP', est: 'pendiente', soporte: { dias: 6, txt: 'vence en 6 días' } },
];
const VENCEN = [7, 13, 24];
export const BLOQUEO = 'Tú radicaste esta obligación; la confirmación la hace otra persona.';

export const money = (n: number) => `$\u00a0${n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const nObl = (n: number) => `${n} ${n === 1 ? 'obligación' : 'obligaciones'}`;
const bulkKind = (f: Estado | 'todas'): 'Confirmar' | 'Causar' | null => (f === 'pendiente' ? 'Confirmar' : f === 'confirmada' ? 'Causar' : null);
export const NEXT = { Confirmar: 'confirmada', Causar: 'causada' } as const;

export type ObligacionesState = ReturnType<typeof useObligaciones>;

/** El estado de la pantalla: filas, filtro, selección, resaltado y el aviso con Deshacer. */
export function useObligaciones(initial: { filter?: Estado | 'todas'; selected?: number[]; rows?: readonly Obligacion[] } = {}) {
  const source = initial.rows ?? ROWS;
  const [rows, setRows] = React.useState<Obligacion[]>(() => source.map((r) => ({ ...r })));
  const [filter, setFilterState] = React.useState<Estado | 'todas'>(initial.filter ?? 'todas');
  const [selected, setSelected] = React.useState<ReadonlySet<number>>(() => new Set(initial.selected ?? []));
  const [flash, setFlash] = React.useState<ReadonlySet<number>>(() => new Set());
  const [snack, setSnack] = React.useState<{ text: string; undo?: Map<number, Estado> } | null>(null);
  const flashTimer = React.useRef<number>();
  const doFlash = React.useCallback((ids: number[]) => {
    window.clearTimeout(flashTimer.current);
    setFlash(new Set(ids));
    flashTimer.current = window.setTimeout(() => setFlash(new Set()), 1600);
  }, []);
  React.useEffect(() => () => window.clearTimeout(flashTimer.current), []);
  const setEst = React.useCallback((ids: number[], est: Estado, msg?: string) => {
    setRows((prev) => {
      const undo = new Map<number, Estado>();
      const next = prev.map((r) => { if (!ids.includes(r.id)) return r; undo.set(r.id, r.est); return { ...r, est }; });
      if (msg) setSnack({ text: msg, undo });
      return next;
    });
    setSelected(new Set());
    doFlash(ids);
  }, [doFlash]);
  const undo = React.useCallback(() => {
    const u = snack?.undo;
    if (!u) return;
    setRows((prev) => prev.map((r) => (u.has(r.id) ? { ...r, est: u.get(r.id) as Estado } : r)));
    doFlash([...u.keys()]);
    setSnack({ text: 'Se deshizo el cambio.' });
  }, [snack, doFlash]);
  const setFilter = React.useCallback((f: Estado | 'todas') => { setFilterState(f); setSelected(new Set()); }, []);
  const kind = bulkKind(filter);
  const selRows = kind ? rows.filter((r) => selected.has(r.id) && !r.bloqueo && (filter === 'todas' || r.est === filter)) : [];
  return { rows, filter, setFilter, selected, setSelected, selRows, kind, flash, doFlash, setEst, snack, setSnack, undo, reset: () => { setRows(source.map((r) => ({ ...r }))); setFilterState(initial.filter ?? 'todas'); setSelected(new Set(initial.selected ?? [])); } };
}

/** La selección como contexto del modelo: el resumen en la ficha y el detalle para el modelo. */
export function obligacionesSelection(s: ObligacionesState): AuiSelection | null {
  if (!s.selRows.length) return null;
  const total = s.selRows.reduce((a, r) => a + r.total, 0);
  const data = { accion: s.kind, obligaciones: s.selRows.map((r) => ({ id: r.id, ob: r.ob, prov: r.prov, total: r.total })) };
  return {
    key: s.selRows.map((r) => r.id).sort((a, b) => a - b).join(','),
    label: `${nObl(s.selRows.length)} · ${money(total)}`,
    title: s.selRows.map((r) => r.ob).join(', '),
    instruction: `Obligaciones seleccionadas en la tabla: <seleccion>${JSON.stringify(data)}</seleccion>`,
  };
}

export const flashIn = keyframes`from { background-color: var(--flash); } to { background-color: transparent; }`;

/** La pantalla: pestañas con la barra de selección, filtros por estado y la tabla. */
export function ObligacionesHost({ state: s, askAi = true, compact = false }: { state: ObligacionesState; askAi?: boolean; compact?: boolean }) {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { todas: s.rows.length };
    s.rows.forEach((r) => { c[r.est] = (c[r.est] ?? 0) + 1; });
    return c;
  }, [s.rows]);
  const visible = s.filter === 'todas' ? s.rows : s.rows.filter((r) => r.est === s.filter);
  const selectable = visible.filter((r) => !r.bloqueo);
  const nSel = s.selRows.length;
  const total = s.selRows.reduce((a, r) => a + r.total, 0);
  const toggle = (id: number) => { const n = new Set(s.selected); if (n.has(id)) n.delete(id); else n.add(id); s.setSelected(n); };
  const allOn = nSel > 0 && nSel === selectable.length;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto', bgcolor: 'background.default' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={(t) => ({ flexShrink: 0, height: t.spacing(6), px: 3, bgcolor: 'background.paper', boxShadow: t.shadows[4], position: 'relative', zIndex: 1 })}>
        <Typography variant="subtitle1" component="h2" sx={{ m: 0 }}>Obligaciones por pagar</Typography>
        <Box sx={{ flex: 1 }} />
        {compact ? null : <Typography variant="body2" color="text.secondary">Empresa de insumos S.A.S</Typography>}
      </Stack>
      <Box sx={{ p: compact ? 2 : 3 }}>
        <Paper sx={{ overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" sx={{ borderBottom: 1, borderColor: 'divider', pr: 1, minHeight: 48 }}>
            <Tabs value="compras" aria-label="Tipo de obligación"><Tab value="compras" label="Compras" sx={{ textTransform: 'none' }} /><Tab value="anticipos" label="Anticipos" disabled sx={{ textTransform: 'none' }} /></Tabs>
            <Box sx={{ flex: 1 }} />
            {nSel > 0 ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                role="toolbar"
                aria-label="Selección"
                data-slot="selection-bar"
                sx={(t) => ({ bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity), borderRadius: 1, py: 0.5, pr: 0.5, pl: 1.5, minHeight: t.spacing(4.75) })}
              >
                <Typography variant="subtitle1" color="primary" sx={{ whiteSpace: 'nowrap' }}>{nSel === 1 ? '1 seleccionada' : `${nSel} seleccionadas`}</Typography>
                <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                {compact ? null : <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>Total de {money(total)}</Typography>}
                {askAi ? <AuiAskAiAction /> : null}
                <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                <Button size="small" variant="contained" onClick={() => s.kind && s.setEst(s.selRows.map((r) => r.id), NEXT[s.kind], `${nObl(nSel)} ${s.kind === 'Confirmar' ? 'confirmada' : 'causada'}${nSel === 1 ? '.' : 's.'}`)}>{s.kind}</Button>
              </Stack>
            ) : null}
          </Stack>
          <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ px: 2, py: 1.5 }} role="group" aria-label="Filtrar por estado">
            {ESTADOS_COMPACTOS.map((e) => {
              const on = s.filter === e.k;
              return (
                <Chip
                  key={e.k}
                  variant="outlined"
                  color={on ? 'primary' : 'default'}
                  icon={on ? <Check size={16} /> : undefined}
                  label={<>{e.label} <Box component="span" sx={{ color: on ? 'primary.main' : 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{counts[e.k] ?? 0}</Box></>}
                  onClick={() => s.setFilter(e.k)}
                  aria-pressed={on}
                  sx={(t) => ({ borderRadius: 1, ...(on && { bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity) }) })}
                />
              );
            })}
          </Stack>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Obligaciones">
              <TableHead>
                <TableRow>
                  {s.kind ? <TableCell padding="checkbox"><Checkbox size="small" checked={allOn} indeterminate={nSel > 0 && !allOn} onChange={() => s.setSelected(allOn ? new Set() : new Set(selectable.map((r) => r.id)))} inputProps={{ 'aria-label': 'Seleccionar todo' }} /></TableCell> : null}
                  <TableCell>Proveedor</TableCell>
                  <TableCell>N.º de obligación</TableCell>
                  <TableCell align="right">Total / Moneda</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((r) => {
                  const sel = s.selected.has(r.id) && !!s.kind;
                  const chip = CHIP[r.est];
                  return (
                    <TableRow
                      key={r.id}
                      hover
                      selected={sel}
                      sx={(t) => (s.flash.has(r.id) ? { '--flash': alpha(t.palette.primary.main, t.palette.action.focusOpacity), animation: `${flashIn} 1.6s ease-out` } : {})}
                    >
                      {s.kind ? (
                        <TableCell padding="checkbox">
                          {r.bloqueo
                            ? <Checkbox size="small" disabled title={BLOQUEO} inputProps={{ 'aria-label': 'No puedes confirmar esta obligación' }} />
                            : <Checkbox size="small" checked={sel} onChange={() => toggle(r.id)} inputProps={{ 'aria-label': `Seleccionar ${r.ob}` }} />}
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <Typography variant="body2" color="primary" sx={{ whiteSpace: 'nowrap' }}>{r.prov}</Typography>
                        <Typography variant="caption" color="text.secondary">{r.nit}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{r.ob}</Typography>
                        {r.soporte ? <Typography variant="caption" color={r.soporte.dias <= 1 ? 'error' : r.soporte.dias <= 4 ? 'warning.dark' : 'text.secondary'}>Doc. soporte · {r.soporte.txt}</Typography> : null}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{money(r.total)} <Typography component="span" variant="caption" color="text.secondary">{r.cur}</Typography></TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={chip.label}
                          sx={(t: Theme) => (chip.color === 'grey'
                            ? { borderRadius: 1, bgcolor: t.palette.grey[200], color: 'text.secondary' }
                            : { borderRadius: 1, bgcolor: alpha(t.palette[chip.color].main, t.palette.action.selectedOpacity), color: `${chip.color}.dark` })}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={!!s.snack}
        autoHideDuration={s.snack?.undo ? 6000 : 3200}
        onClose={() => s.setSnack(null)}
        message={s.snack?.text}
        action={s.snack?.undo ? <Button color="inherit" size="small" onClick={s.undo}>Deshacer</Button> : undefined}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ position: 'absolute' }}
      />
    </Box>
  );
}

// ——— El modelo de la pantalla ———
type Part = NonNullable<ChatModelRunResult['content']>[number];
export type ObligacionesBridge = React.MutableRefObject<ObligacionesState | null>;
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const STEP = 4;
const TICK_MS = 30;
const FIRST_TOKEN_MS = 320;
const TOOL_MS = 1200;
const APPLY_MS = 900;
const APPROVAL_TOOLS = /^(confirmar|causar)_obligaciones$/;

async function* stream(signal: AbortSignal, head: Part[], text: string): AsyncGenerator<ChatModelRunResult> {
  for (let n = STEP; n < text.length + STEP; n += STEP) {
    if (signal.aborted) return;
    await wait(TICK_MS);
    yield { content: [...head, { type: 'text', text: text.slice(0, n) }] };
  }
}

type Seleccion = { accion: 'Confirmar' | 'Causar' | null; obligaciones: Array<{ id: number; ob: string; prov: string; total: number }> };
/** La selección llega en las instrucciones del modelo (Selection as context). */
function seleccionDe(system: string | undefined): Seleccion | null {
  const m = system?.match(/<seleccion>(.*?)<\/seleccion>/s);
  if (!m) return null;
  try { return JSON.parse(m[1]) as Seleccion; } catch { return null; }
}
const lastUserText = (messages: readonly ThreadMessage[]) => {
  const u = [...messages].reverse().find((m) => m.role === 'user');
  return u ? u.content.map((p) => (p.type === 'text' ? p.text : '')).join(' ') : '';
};

function resumenPendientes(rows: readonly Obligacion[]) {
  const pend = rows.filter((r) => r.est === 'pendiente');
  const bl = pend.filter((r) => r.bloqueo).length;
  return `En Compras hay ${nObl(pend.length)} pendientes por ${money(pend.reduce((a, r) => a + r.total, 0))}. ${bl} ${bl === 1 ? 'la radicaste' : 'las radicaste'} tú, así que la confirma otra persona. La que vence primero es FCT-246801, de Consultoría Avanzada: su documento soporte vence hoy.`;
}

/** El modelo de la demo: lee la selección del contexto, filtra la tabla y confirma o causa con aprobación. */
export function makeObligacionesModel(bridge: ObligacionesBridge): ChatModelAdapter {
  return {
    async *run({ abortSignal, messages, context, unstable_getMessage }) {
      await wait(FIRST_TOKEN_MS);
      const host = bridge.current;
      const current = unstable_getMessage?.();
      // La persona ya respondió la aprobación: se sigue según lo que decidió.
      const call = current?.content.find((p) => p.type === 'tool-call' && APPROVAL_TOOLS.test(p.toolName));
      if (call && call.type === 'tool-call' && (call.result !== undefined || call.approval?.approved !== undefined)) {
        const args = call.args as { ids: number[]; total: number; accion: 'Confirmar' | 'Causar' };
        const n = args.ids.length;
        const denied = call.approval?.approved === false || call.isError || (typeof call.result === 'string' && /rechaz/i.test(call.result));
        if (denied) {
          yield* stream(abortSignal, [], n === 1 ? 'Entendido, no la cambié. La obligación sigue como estaba.' : `Entendido, no cambié ninguna. Las ${nObl(n)} siguen como estaban.`);
          return;
        }
        await wait(APPLY_MS);
        const est = args.accion === 'Causar' ? 'causada' : 'confirmada';
        host?.setEst(args.ids, est);
        yield* stream(abortSignal, [], `Listo, ${args.accion === 'Causar' ? 'causé' : 'confirmé'} ${nObl(n)} por ${money(args.total)}. Ya aparecen en ${est === 'causada' ? 'Causadas' : 'Confirmadas'}.`);
        return;
      }
      const text = lastUserText(messages).toLowerCase();
      const sel = seleccionDe(context?.system);
      if (/confirm|caus/.test(text) && sel?.obligaciones.length && sel.accion) {
        const total = sel.obligaciones.reduce((a, r) => a + r.total, 0);
        const verbo = sel.accion === 'Causar' ? 'causar' : 'confirmar';
        const args = { ids: sel.obligaciones.map((r) => r.id), obligaciones: sel.obligaciones.map((r) => r.ob), total, accion: sel.accion };
        yield {
          content: [{
            type: 'tool-call', toolCallId: `${verbo}-${Date.now()}`, toolName: `${verbo}_obligaciones`, args, argsText: JSON.stringify({ obligaciones: args.obligaciones, total }, null, 2),
            approval: {
              id: `${verbo}-aprobacion`,
              prompt: `¿${sel.accion === 'Causar' ? 'Causo' : 'Confirmo'} ${nObl(args.ids.length)} por ${money(total)}? El cambio se aplica en la tabla.`,
              options: [{ id: verbo, label: sel.accion, kind: 'allow-once' }, { id: 'cancelar', label: 'Cancelar', kind: 'reject-once' }],
            },
          } as unknown as Part],
          status: { type: 'requires-action', reason: 'tool-calls' },
        };
        return;
      }
      if (/confirm|caus/.test(text)) {
        yield* stream(abortSignal, [], 'Selecciona en la tabla las obligaciones que quieres confirmar (filtro Pendientes) o causar (filtro Confirmadas). Las tomo como contexto y te pido aprobación antes de cambiarlas.');
        return;
      }
      if (/venc|soporte/.test(text)) {
        const startedAt = Date.now();
        const base = { type: 'tool-call', toolCallId: `filtrar-${startedAt}`, toolName: 'filtrar_obligaciones', args: { estado: 'pendiente', soporte: 'por_vencer' }, argsText: JSON.stringify({ estado: 'pendiente', soporte: 'por_vencer' }, null, 2) };
        yield { content: [{ ...base, timing: { startedAt } } as unknown as Part] };
        await wait(TOOL_MS);
        if (abortSignal.aborted) return;
        host?.setFilter('pendiente');
        host?.doFlash(VENCEN);
        const done = { ...base, timing: { startedAt, completedAt: Date.now() }, result: { filtro: 'Pendientes', resaltadas: ['FCT-246801', 'FCT-246801', 'FCT-246802'] } } as unknown as Part;
        yield* stream(abortSignal, [done], 'Tres pendientes tienen documento soporte por vencer: FCT-246801 de Consultoría Avanzada vence hoy; FCT-246801 de Soluciones Integrales, en 3 días; y FCT-246802 de Tecnología y Servicios, en 6. Dejé la tabla en Pendientes y las resalté.');
        return;
      }
      if (sel?.obligaciones.length) {
        const total = sel.obligaciones.reduce((a, r) => a + r.total, 0);
        const nom = sel.obligaciones.slice(0, 3).map((r) => `${r.prov} (${r.ob})`).join(', ');
        const mas = sel.obligaciones.length > 3 ? ` y ${sel.obligaciones.length - 3} más` : '';
        yield* stream(abortSignal, [], `Seleccionaste ${nObl(sel.obligaciones.length)} por ${money(total)}: ${nom}${mas}. Si quieres, las ${sel.accion === 'Causar' ? 'causo' : 'confirmo'} con tu aprobación.`);
        return;
      }
      if (/no puedo|quién/.test(text)) {
        yield* stream(abortSignal, [], 'Express Soluciones S.A. (INVOICE-2468013579) la radicaste tú, así que la confirma otra persona de Cuentas por pagar. Las demás pendientes las puedes confirmar tú.');
        return;
      }
      yield* stream(abortSignal, [], resumenPendientes(host?.rows ?? ROWS));
    },
  };
}

/** Los seguimientos cambian con la selección. */
export function makeObligacionesFollowups(bridge: ObligacionesBridge): SuggestionAdapter {
  return {
    async generate() {
      const s = bridge.current;
      const prompts = s?.selRows.length ? [`${s.kind === 'Causar' ? 'Causa' : 'Confirma'} las seleccionadas`, 'Resume las seleccionadas'] : ['¿Qué documentos soporte vencen?', 'Resume las pendientes'];
      return prompts.map((prompt) => ({ prompt }));
    },
  };
}

const STARTER_ICON = 20;
/** Los inicios del tablero «Starter suggestions». */
export const STARTERS: readonly AuiStarter[] = [
  { title: 'Filtrar soportes por vencer', prompt: '¿Qué documentos soporte vencen pronto? Revisa las obligaciones pendientes y filtra la tabla.', icon: <Filter size={STARTER_ICON} />, color: 'warning' },
  { title: 'Resumir las pendientes', prompt: 'Resume las obligaciones pendientes de Compras: cuántas son, por cuánto y cuál vence primero.', icon: <Receipt size={STARTER_ICON} />, color: 'primary' },
  { title: 'Confirmar las seleccionadas', prompt: 'Confirma las seleccionadas', icon: <CircleCheck size={STARTER_ICON} />, color: 'success' },
  { title: 'Revisar qué no puedo confirmar', prompt: '¿Qué obligaciones pendientes no puedo confirmar yo y quién debe hacerlo?', icon: <ShieldCheck size={STARTER_ICON} />, color: 'info' },
];

export const AGENTS: readonly AuiAssistantAgent[] = [
  { id: 'tesoreria', name: 'Tesorería', color: 'primary' },
  { id: 'cxp', name: 'Cuentas por pagar', color: 'success' },
  { id: 'auditoria', name: 'Auditoría', color: 'error' },
];

const RESUMEN_Q = 'Resume las obligaciones pendientes de Compras';
/** Los chats del tablero «Assistant panel»: el actual y dos anteriores. */
export const SINCO_THREADS: DemoThread[] = [
  { id: 'resumen', title: RESUMEN_Q, ago: 0, messages: [{ role: 'user', content: RESUMEN_Q }, { role: 'assistant', content: resumenPendientes(ROWS) }] },
  { id: 'causar-agosto', title: 'Causar las confirmadas de agosto', ago: 2, messages: [{ role: 'user', content: 'Causar las confirmadas de agosto' }, { role: 'assistant', content: 'Listo, causé 4 obligaciones por $ 30.284.702,00. Ya aparecen en Causadas.' }] },
  { id: 'soportes-semana', title: '¿Qué soportes vencen esta semana?', ago: 5, messages: [{ role: 'user', content: '¿Qué soportes vencen esta semana?' }, { role: 'assistant', content: 'Tres pendientes tienen documento soporte por vencer; la primera es FCT-246801, de Consultoría Avanzada, y vence hoy.' }] },
];
export const DICTATED = '¿Qué documentos soporte vencen esta semana?';
