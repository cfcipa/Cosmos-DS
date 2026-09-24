// Las facturas de los tableros «Selection as context» y «Ask AI on selection», y el modelo que responde con lo que
// llega seleccionado en su contexto.
import type { ChatModelAdapter } from '@assistant-ui/react';
import type { AuiSelection } from '../../../src/ai/aui';

export const FACTURAS = [
  { id: 'FV-0932', prov: 'Ferretería El Roble', total: '$ 4.250.000' },
  { id: 'FV-0935', prov: 'Transportes Andinos', total: '$ 3.180.000' },
  { id: 'FV-0941', prov: 'Suministros Andes', total: '$ 5.050.000' },
] as const;

export function facturasSelection(n: number): AuiSelection | null {
  if (!n) return null;
  const rows = FACTURAS.slice(0, n);
  return {
    key: rows.map((r) => r.id).join(','),
    label: n === 1 ? '1 fila seleccionada' : `${n} filas seleccionadas`,
    title: rows.map((r) => r.id).join(', '),
    instruction: `Filas seleccionadas en la pantalla: <seleccion>${rows.map((r) => r.id).join(',')}</seleccion>`,
  };
}

function answer(system: string | undefined) {
  const ids = system?.match(/<seleccion>(.*?)<\/seleccion>/)?.[1].split(',') ?? [];
  if (!ids.length) return 'No recibí filas seleccionadas como contexto. Selecciona las facturas en la pantalla o dime cuáles reviso.';
  if (ids.length === 1) return 'La fila seleccionada es FV-0932, de Ferretería El Roble, por $ 4.250.000. Está pendiente y vence el 30 de septiembre.';
  return `Las ${ids.length} filas seleccionadas son facturas pendientes por $ 12.480.000: FV-0932 de Ferretería El Roble ($ 4.250.000), FV-0935 de Transportes Andinos ($ 3.180.000) y FV-0941 de Suministros Andes ($ 5.050.000). FV-0932 vence primero, el 30 de septiembre.`;
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const STEP = 4;
const TICK_MS = 30;
const FIRST_TOKEN_MS = 320;

export const facturasModel: ChatModelAdapter = {
  async *run({ abortSignal, context }) {
    await wait(FIRST_TOKEN_MS);
    const text = answer(context?.system);
    for (let n = STEP; n < text.length + STEP; n += STEP) {
      if (abortSignal.aborted) return;
      await wait(TICK_MS);
      yield { content: [{ type: 'text', text: text.slice(0, n) }] };
    }
  },
};
