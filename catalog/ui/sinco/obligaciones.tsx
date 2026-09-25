// Los datos y el estado de la pantalla anfitriona de los tableros Sinco (Obligaciones por pagar · Compras), y el
// modelo de ejemplo que la conoce: resume, filtra y confirma o causa con aprobación. La pantalla es ObligacionesPage.
import * as React from 'react';
import type { ChatModelAdapter, SuggestionAdapter } from '@assistant-ui/react';
import { keyframes } from '@mui/material/styles';
import { CircleCheck, Filter, Receipt, ShieldCheck } from 'lucide-react';
import type { AuiAssistantAgent, AuiSelection, AuiStarter } from '../../../src/ai/aui';
import type { DemoThread } from '../AuiDemoRuntime';
import { FIRST_TOKEN_MS, lastUserText, streamText, wait, type DemoPart } from '../demoStream';

export type Estado = 'borrador' | 'pendiente' | 'rechazada' | 'confirmada' | 'causada' | 'pagada' | 'descartado';
/** Medio de pago: tarjeta (marca y últimos dígitos), transferencia, efectivo, billetera u otro. */
export type MedioPago = { t: string; brand?: string; icon?: 'transfer' | 'cash' | 'other'; d?: string; mask?: boolean };
/** Saldo por pagar: pago por extracto, abonos, sin abonos o no aplica. */
export type Saldo = { tipo: 'extracto' | 'abonos' | 'sin' | 'na'; valor?: number; n?: number };
export type Obligacion = {
  id: number; prov: string; nit: string; ob: string; total: number; cur: string; est: Estado; bloqueo?: boolean; soporte?: { dias: number; txt: string };
  mp?: MedioPago; fc?: string; fr?: string; saldo?: Saldo; motivo?: string;
};

export const CHIP: Record<Estado, { label: string; color: 'primary' | 'warning' | 'error' | 'info' | 'secondary' | 'success' | 'grey' }> = {
  borrador: { label: 'Borrador', color: 'primary' }, pendiente: { label: 'Pendiente', color: 'warning' }, rechazada: { label: 'Rechazada', color: 'error' },
  confirmada: { label: 'Confirmada', color: 'info' }, causada: { label: 'Causada', color: 'secondary' }, pagada: { label: 'Pagada', color: 'success' }, descartado: { label: 'Descartado', color: 'grey' },
};

const tc = (brand: string, last: string): MedioPago => ({ t: 'T. Crédito', brand, d: `**** ${last}`, mask: true });
const MP = {
  visa: tc('VISA', '5444'), master: tc('MC', '5444'), amex: tc('AMEX', '5444'), diners: tc('DINERS', '5444'),
  transfer: { t: 'Transferencia', icon: 'transfer', d: 'ref. #######' }, efectivo: { t: 'Efectivo', icon: 'cash' }, otro: { t: 'Otro', icon: 'other' },
  paypal: { t: 'Paypal', brand: 'PP', d: '@ Juanabanana' }, nequi: { t: 'Nequi', brand: 'NEQUI', d: '# 312 8475635' }, breb: { t: 'Bre-b', brand: 'BRE-B', d: '@ Aguacate123' },
} satisfies Record<string, MedioPago>;
const NIT = 'Nit 8682548294-1';
const FECHAS = ['21/09/2026', '22/09/2026', '23/09/2026', '24/09/2026', '25/09/2026', '27/09/2026'];

/** Las 25 obligaciones del tablero (Obligaciones por pagar · Compras). */
export const ROWS: readonly Obligacion[] = ([
  { id: 1, prov: 'Soluciones Integrales S.A.', nit: NIT, ob: 'FAC-123456', mp: MP.visa, total: 1345678, cur: 'COP', est: 'pendiente', saldo: { tipo: 'extracto' } },
  { id: 2, prov: 'Servicios Globales Ltda.', nit: 'CC 123456789', ob: 'FAC-135792468', mp: MP.paypal, total: 986, cur: 'USD', est: 'borrador', saldo: { tipo: 'na' } },
  { id: 3, prov: 'Innovación Empresarial S.A.', nit: NIT, ob: 'FAC-864209753', mp: MP.master, total: 3567890, cur: 'COP', est: 'rechazada', motivo: 'Motivo de rechazo · 05/09/2026 · C. Ramírez', saldo: { tipo: 'extracto' } },
  { id: 4, prov: 'Proveedores Unidos S.A.', nit: NIT, ob: 'INVOICE-1357902468', mp: MP.diners, total: 6890123, cur: 'COP', est: 'causada', saldo: { tipo: 'extracto' } },
  { id: 5, prov: 'Uber transporte', nit: NIT, ob: 'INVOICE-987654321', mp: MP.transfer, total: 78901, cur: 'COP', est: 'pagada', saldo: { tipo: 'abonos', valor: 0, n: 3 } },
  { id: 6, prov: 'Logística y Servicios S.A.S.', nit: NIT, ob: 'FAC-654321', mp: MP.master, total: 13567890, cur: 'COP', est: 'confirmada', saldo: { tipo: 'extracto' } },
  { id: 7, prov: 'Consultoría Avanzada S.A.S.', nit: NIT, ob: 'FCT-246801', mp: MP.visa, total: 25, cur: 'USD', est: 'pendiente', soporte: { dias: 0, txt: 'vence hoy' }, saldo: { tipo: 'extracto' } },
  { id: 8, prov: 'Comercializadora Segura S.A.S.', nit: NIT, ob: 'INVOICE-1234567890', mp: MP.master, total: 7901234, cur: 'COP', est: 'causada', saldo: { tipo: 'abonos', valor: 30500, n: 3 } },
  { id: 9, prov: 'Tecnología y Servicios S.A.S.', nit: NIT, ob: 'INVOICE-9876543210', mp: MP.efectivo, total: 8012345, cur: 'COP', est: 'pendiente', saldo: { tipo: 'na' } },
  { id: 10, prov: 'Distribuciones del Pacífico S.A.', nit: NIT, ob: 'FAC-258963', mp: MP.nequi, total: 9123456, cur: 'COP', est: 'confirmada', saldo: { tipo: 'sin' } },
  { id: 11, prov: 'Express Soluciones S.A.', nit: NIT, ob: 'INVOICE-2468013579', mp: MP.otro, total: 12456789, cur: 'COP', est: 'pendiente', bloqueo: true, saldo: { tipo: 'na' } },
  { id: 12, prov: 'Suministros Nacionales S.A.S', nit: NIT, ob: 'FAC-456789', mp: MP.master, total: 4567, cur: 'MXN', est: 'descartado', saldo: { tipo: 'na' } },
  { id: 13, prov: 'Soluciones Integrales S.A.', nit: NIT, ob: 'FCT-246801', mp: MP.visa, total: 1345678, cur: 'COP', est: 'pendiente', soporte: { dias: 3, txt: 'vence en 3 días' }, saldo: { tipo: 'extracto' } },
  { id: 14, prov: 'Innovación Empresarial S.A.', nit: NIT, ob: 'FCT-135790', mp: MP.master, total: 3567890, cur: 'COP', est: 'confirmada', saldo: { tipo: 'extracto' } },
  { id: 15, prov: 'Suministros Nacionales S.A.S', nit: NIT, ob: 'FCT-789456', mp: MP.master, total: 4567, cur: 'MXN', est: 'pendiente', bloqueo: true, saldo: { tipo: 'na' } },
  { id: 16, prov: 'Express Soluciones S.A.', nit: NIT, ob: 'FCT-123456', mp: MP.visa, total: 12456789, cur: 'COP', est: 'pendiente', saldo: { tipo: 'na' } },
  { id: 17, prov: 'Consultoría Avanzada S.A.S.', nit: NIT, ob: 'FCT-321654', mp: MP.visa, total: 25850, cur: 'COP', est: 'causada', saldo: { tipo: 'extracto' } },
  { id: 18, prov: 'Logística y Servicios S.A.S.', nit: NIT, ob: 'FAC-654322', mp: MP.master, total: 13567890, cur: 'COP', est: 'pagada', saldo: { tipo: 'extracto' } },
  { id: 19, prov: 'Bre-b Servicios S.A.S.', nit: NIT, ob: 'FAC-778899', mp: MP.breb, total: 452300, cur: 'COP', est: 'confirmada', saldo: { tipo: 'sin' } },
  { id: 20, prov: 'Comercializadora Segura S.A.S.', nit: NIT, ob: 'FCT-987654', mp: MP.amex, total: 8012345, cur: 'COP', est: 'confirmada', saldo: { tipo: 'extracto' } },
  { id: 21, prov: 'Soluciones Integrales S.A.', nit: NIT, ob: 'FAC-123457', mp: MP.transfer, total: 30500, cur: 'COP', est: 'causada', saldo: { tipo: 'sin', valor: 30500 } },
  { id: 22, prov: 'Servicios Globales Ltda.', nit: 'CC 123456789', ob: 'FAC-135792469', mp: MP.paypal, total: 1986, cur: 'USD', est: 'descartado', saldo: { tipo: 'na' } },
  { id: 23, prov: 'Proveedores Unidos S.A.', nit: NIT, ob: 'INVOICE-1357902469', mp: MP.diners, total: 6890123, cur: 'COP', est: 'pagada', saldo: { tipo: 'extracto' } },
  { id: 24, prov: 'Tecnología y Servicios S.A.S.', nit: NIT, ob: 'FCT-246802', mp: MP.visa, total: 540000, cur: 'COP', est: 'pendiente', soporte: { dias: 6, txt: 'vence en 6 días' }, saldo: { tipo: 'extracto' } },
  { id: 25, prov: 'Distribuciones del Pacífico S.A.', nit: NIT, ob: 'FAC-258964', mp: MP.nequi, total: 2230000, cur: 'COP', est: 'pagada', saldo: { tipo: 'abonos', valor: 0, n: 2 } },
] as Obligacion[]).map((r, i) => ({ ...r, fc: FECHAS[i % FECHAS.length], fr: '27/09/2026' }));

const VENCEN = [7, 13, 24];
export const BLOQUEO = 'Tú radicaste esta obligación; la confirmación la hace otra persona.';

export const money = (n: number) => `$\u00a0${n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const nObl = (n: number) => `${n} ${n === 1 ? 'obligación' : 'obligaciones'}`;
const bulkKind = (f: Estado | 'todas'): 'Confirmar' | 'Causar' | null => (f === 'pendiente' ? 'Confirmar' : f === 'confirmada' ? 'Causar' : null);
export const NEXT = { Confirmar: 'confirmada', Causar: 'causada' } as const;

export type ObligacionesState = ReturnType<typeof useObligaciones>;

/** El estado de la pantalla: filas, filtro, selección, resaltado y el aviso con Deshacer. */
export function useObligaciones(initial: { filter?: Estado | 'todas'; selected?: number[] } = {}) {
  const [rows, setRows] = React.useState<Obligacion[]>(() => ROWS.map((r) => ({ ...r })));
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
  return { rows, filter, setFilter, selected, setSelected, selRows, kind, flash, doFlash, setEst, snack, setSnack, undo, reset: () => { setRows(ROWS.map((r) => ({ ...r }))); setFilterState(initial.filter ?? 'todas'); setSelected(new Set(initial.selected ?? [])); } };
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

// ——— El modelo de la pantalla ———
type Part = DemoPart;
export type ObligacionesBridge = React.MutableRefObject<ObligacionesState | null>;
const TOOL_MS = 1200;
const APPLY_MS = 900;
const APPROVAL_TOOLS = /^(confirmar|causar)_obligaciones$/;

const stream = (signal: AbortSignal, head: Part[], text: string) => streamText(signal, text, head);

type Seleccion = { accion: 'Confirmar' | 'Causar' | null; obligaciones: Array<{ id: number; ob: string; prov: string; total: number }> };
/** La selección llega en las instrucciones del modelo (Selection as context). */
function seleccionDe(system: string | undefined): Seleccion | null {
  const m = system?.match(/<seleccion>(.*?)<\/seleccion>/s);
  if (!m) return null;
  try { return JSON.parse(m[1]) as Seleccion; } catch { return null; }
}

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
/** Las mismas preguntas como sugerencias del chat vacío del hilo (título y resto). */
export const WELCOME_SUGGESTIONS = [
  { title: '¿Qué documentos soporte', label: 'vencen pronto?', prompt: '¿Qué documentos soporte vencen pronto? Revisa las obligaciones pendientes y filtra la tabla.' },
  { title: 'Resume', label: 'las obligaciones pendientes', prompt: 'Resume las obligaciones pendientes de Compras: cuántas son, por cuánto y cuál vence primero.' },
  { title: 'Confirma', label: 'las seleccionadas', prompt: 'Confirma las seleccionadas' },
] as const;

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
