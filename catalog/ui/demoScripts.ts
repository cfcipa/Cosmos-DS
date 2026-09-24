// Guiones del modelo de ejemplo para las demos AUI connected: una herramienta que pide aprobación, un grupo de
// herramientas, una respuesta con fuentes y una con imagen. Cada guion devuelve fragmentos como un ChatModelAdapter.
import type { ChatModelRunResult, ThreadMessage } from '@assistant-ui/react';
import { streamText, wait, type DemoPart } from './demoStream';

export type DemoScript = 'answer' | 'approval' | 'tools' | 'sources' | 'image';

type ScriptContext = { abortSignal: AbortSignal; message: () => ThreadMessage | undefined; failTools?: boolean };
type Part = DemoPart;

/** Escribe `text` de a 4 caracteres, después de `head`. */
const stream = (ctx: ScriptContext, head: Part[], text: string, tail: Part[] = []) => streamText(ctx.abortSignal, text, head, tail);

// ——— Aprobación (tablero «Tool fallback») ———
export const APPROVAL_TOOL = 'enviar_recordatorios';
const APPROVAL_ARGS = { destinatarios: ['Nubia Rojas', 'Transportes Andinos', 'Ferretería El Roble'], plantilla: 'recordatorio_legalizacion' };
const APPROVAL_RESULT = { enviados: 3, anticipos: ['CE-4492', 'CE-4480', 'CE-4471'] };
const APPROVAL_RUN_MS = 1800;
const APPROVAL_AFTER = {
  sent: 'Listo: envié 3 recordatorios. El más urgente es CE-4492, de Nubia Rojas, que vence el 30 de septiembre.',
  denied: 'Entendido, no envié los recordatorios.',
};

async function* approval(ctx: ScriptContext): AsyncGenerator<ChatModelRunResult> {
  const current = ctx.message();
  const call = current?.content.find((p) => p.type === 'tool-call' && p.toolName === APPROVAL_TOOL);
  if (call && call.type === 'tool-call' && call.result !== undefined) {
    // La persona respondió: se sigue según lo que decidió.
    const denied = call.isError || (typeof call.result === 'string' && /rechaz/i.test(call.result));
    yield* stream(ctx, [], denied ? APPROVAL_AFTER.denied : APPROVAL_AFTER.sent);
    return;
  }
  const intro = 'Busco los responsables y preparo el envío.';
  yield* stream(ctx, [], intro);
  const startedAt = Date.now();
  const tool = (completedAt?: number): Part => ({
    type: 'tool-call', toolCallId: 'recordatorios-1', toolName: APPROVAL_TOOL, args: APPROVAL_ARGS, argsText: JSON.stringify(APPROVAL_ARGS, null, 2),
    timing: { startedAt, ...(completedAt ? { completedAt } : {}) },
  } as Part);
  yield { content: [{ type: 'text', text: intro }, tool()] };
  await wait(APPROVAL_RUN_MS);
  if (ctx.abortSignal.aborted) return;
  yield { content: [{ type: 'text', text: intro }, tool(Date.now())], status: { type: 'requires-action', reason: 'tool-calls' } };
}
/** El resultado del envío, para las demos estáticas. */
export const APPROVAL_OK_RESULT = APPROVAL_RESULT;

// ——— Grupo de herramientas (tablero «Tool group») ———
const CALLS = [
  { name: 'consultar_anticipos', args: { estado: 'pendiente' }, result: [{ id: 'CE-4492', tercero: 'NIT 52.318.004' }, { id: 'CE-4480' }, { id: 'CE-4471' }], ms: 1200 },
  { name: 'consultar_vencimientos', args: { anticipos: ['CE-4471', 'CE-4480', 'CE-4492'] }, result: { 'CE-4492': '2026-09-30', 'CE-4480': '2026-10-08', 'CE-4471': '2026-10-15' }, ms: 1600, error: 'Tiempo de espera agotado al consultar el ERP.' },
  { name: 'buscar_tercero', args: { documento: '52.318.004' }, result: { nombre: 'Nubia Rojas', area: 'Gastos de viaje' }, ms: 900 },
];
const TOOLS_OK = 'Vence primero **CE-4492**, de Nubia Rojas, el 30 de septiembre, por $1.250.000.';
const TOOLS_FAIL = 'CE-4492 es de Nubia Rojas, pero no pude confirmar las fechas de vencimiento: el ERP no respondió.';

async function* tools(ctx: ScriptContext): AsyncGenerator<ChatModelRunResult> {
  const done: Part[] = [];
  for (const [i, c] of CALLS.entries()) {
    if (ctx.abortSignal.aborted) return;
    const startedAt = Date.now();
    const base = { type: 'tool-call', toolCallId: `grupo-${i}`, toolName: c.name, args: c.args, argsText: JSON.stringify(c.args, null, 2) };
    yield { content: [...done, { ...base, timing: { startedAt } } as unknown as Part] };
    await wait(c.ms);
    const fails = ctx.failTools && c.error;
    done.push({ ...base, timing: { startedAt, completedAt: Date.now() }, ...(fails ? { result: { error: c.error }, isError: true } : { result: c.result }) } as unknown as Part);
  }
  yield* stream(ctx, done, ctx.failTools ? TOOLS_FAIL : TOOLS_OK);
}

// ——— Fuentes (tablero «Sources») ———
export const SOURCES_ANSWER = 'La retención se calcula sobre la base gravable antes de IVA, con la tarifa del concepto, y solo aplica si el pago supera el mínimo del año: 4 UVT para servicios generales.';
export const SOURCE_PARTS: Part[] = [
  { type: 'source', sourceType: 'url', id: 'src-1', url: 'https://www.dian.gov.co/normatividad' },
  { type: 'source', sourceType: 'url', id: 'src-2', url: 'https://www.sinco.com.co/ayuda/retencion', title: 'Configurar conceptos de retención' },
  { type: 'source', sourceType: 'url', id: 'src-3', url: 'https://www.funcionpublica.gov.co/eva/gestornormativo', title: 'Estatuto Tributario, artículo 392' },
  { type: 'source', sourceType: 'document', id: 'doc-1', title: 'Política tributaria 2026.pdf', mediaType: 'application/pdf' },
] as Part[];

async function* sources(ctx: ScriptContext): AsyncGenerator<ChatModelRunResult> {
  yield* stream(ctx, [], SOURCES_ANSWER);
  yield { content: [{ type: 'text', text: SOURCES_ANSWER }, ...SOURCE_PARTS] };
}

// ——— Imagen (tablero «Image») ———
const CHART_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="1280" height="720"><rect width="640" height="360" fill="#f1f5fc"/>'
  + '<g fill="rgba(16,24,64,0.12)"><rect x="64" y="80" width="512" height="1"/><rect x="64" y="160" width="512" height="1"/><rect x="64" y="240" width="512" height="1"/></g>'
  + '<rect x="112" y="96" width="88" height="200" rx="4" fill="#1053b7"/><rect x="276" y="176" width="88" height="120" rx="4" fill="#4c82d9"/><rect x="440" y="222" width="88" height="74" rx="4" fill="#789fde"/>'
  + '<rect x="64" y="296" width="512" height="2" fill="rgba(16,24,64,0.38)"/>'
  + '<g fill="rgba(16,24,64,0.6)"><rect x="120" y="316" width="72" height="10" rx="5"/><rect x="284" y="316" width="72" height="10" rx="5"/><rect x="448" y="316" width="72" height="10" rx="5"/></g></svg>';
/** La gráfica del tablero, como data URI. */
export const CHART_IMAGE = `data:image/svg+xml,${encodeURIComponent(CHART_SVG)}`;
export const CHART_FILENAME = 'anticipos_por_responsable.svg';
const IMAGE_INTRO = 'Estos son los 3 anticipos pendientes, por responsable:';
const GENERATE_MS = 1500;

async function* image(ctx: ScriptContext): AsyncGenerator<ChatModelRunResult> {
  yield* stream(ctx, [], IMAGE_INTRO);
  const part = { type: 'image', image: CHART_IMAGE, filename: CHART_FILENAME } as Part;
  // Mientras la imagen es la última parte del mensaje en curso, se ve «generando».
  yield { content: [{ type: 'text', text: IMAGE_INTRO }, part] };
  await wait(GENERATE_MS);
}

export const SCRIPTS: Record<Exclude<DemoScript, 'answer'>, (ctx: ScriptContext) => AsyncGenerator<ChatModelRunResult>> = { approval, tools, sources, image };
