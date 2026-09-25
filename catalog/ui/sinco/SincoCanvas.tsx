// La plantilla «Obligaciones con canvas»: el asistente lateral y, cuando se le pide un informe («redacta», «informe»,
// «borrador»), el hilo se hace a un lado y el documento ocupa la pantalla (Canvas split del kit) mientras se escribe
// línea a línea. «Agrega» o «incluye» suma una sección como nueva versión. Cerrar el canvas devuelve la pantalla.
// Con `launcher`, es «Un hilo en todas las superficies»: cerrado el lateral, el mismo hilo vive en la burbuja del
// Assistant modal, que puede moverse al panel lateral; el runtime es uno, así que la conversación no se pierde.
import * as React from 'react';
import Box from '@mui/material/Box';
import type { ChatModelAdapter } from '@assistant-ui/react';
import { PanelRight } from 'lucide-react';
import { AuiAssistantModal, AuiAssistantSidebar, AuiIconButton, AuiSelectionContextProvider, AuiThread } from '../../../src/ai/aui';
import { CanvasSplitBody, CanvasSplitDocument, CanvasSplitHeader, CanvasSplitLine } from '../../../src/ai/canvas-split';
import { AuiDemoRuntime } from '../AuiDemoRuntime';
import { lastUserText, streamText, wait } from '../demoStream';
import { ObligacionesPage, SincoAppBar } from './ObligacionesPage';
import { AssistantToggle } from './SincoSidebar';
import { DICTATED, WELCOME_SUGGESTIONS, makeObligacionesFollowups, makeObligacionesModel, money, nObl, obligacionesSelection, useObligaciones, type Estado, type Obligacion, type ObligacionesState } from './obligaciones';

/** Medidas del tablero: la aplicación al 64 % (40–80) con el asistente; con el canvas, el hilo mide 400px. */
const DEFAULT_SIZE = 64;
const MIN_SIZE = 40;
const MAX_SIZE = 80;
const THREAD_WIDTH = 50;
/** El ritmo del documento: la herramienta arranca a los 500 ms y escribe una línea cada 160 ms. */
const DOC_START_MS = 500;
const DOC_LINE_MS = 160;

const DOC_TITLE = 'Obligaciones pendientes · semana 39';
const DOC_SOURCE = 'Obligaciones · Compras';
const ASKS_DOC = /inform|redact|borrador/;
const ASKS_MORE = /agrega|añade|incluye/;

export type DocLine = { text: string; heading?: boolean; bullet?: boolean };
export type CanvasDoc = { title: string; version: number; lines: DocLine[]; shown: number; writing: boolean };

/** Las líneas del informe con lo que hay en la tabla; la versión 2 suma las confirmadas pendientes de causar. */
export function docLines(rows: readonly Obligacion[], second: boolean): DocLine[] {
  const pend = rows.filter((r) => r.est === 'pendiente');
  const blocked = pend.filter((r) => r.bloqueo);
  const total = pend.reduce((a, r) => a + r.total, 0);
  const lines: DocLine[] = [
    { text: 'Resumen', heading: true },
    { text: `En Compras hay ${nObl(pend.length)} pendientes por ${money(total)} en total. ${blocked.length} las radicaste tú, así que las debe confirmar otra persona.` },
    { text: 'Documentos soporte por vencer', heading: true },
    ...pend.filter((r) => r.soporte).map((r) => ({ text: `${r.ob} · ${r.prov} · ${r.soporte?.txt}`, bullet: true })),
    { text: 'Pendientes por proveedor', heading: true },
    ...pend.map((r) => ({ text: `${r.prov} · ${r.ob} · ${money(r.total)} ${r.cur}`, bullet: true })),
    { text: 'Siguiente paso', heading: true },
    { text: `Confirmar hoy FCT-246801 de Consultoría Avanzada, cuyo soporte vence hoy, y asignar las ${nObl(blocked.length)} bloqueadas a otra persona.` },
  ];
  if (second) {
    lines.push({ text: 'Confirmadas pendientes de causar', heading: true });
    rows.filter((r) => r.est === 'confirmada').forEach((r) => lines.push({ text: `${r.prov} · ${r.ob} · ${money(r.total)} ${r.cur}`, bullet: true }));
  }
  return lines;
}

/** Lo que el modelo necesita de la pantalla: las filas y el documento (para escribirlo y para versionarlo). */
type CanvasBridge = React.MutableRefObject<{ host: ObligacionesState; doc: CanvasDoc | null; setDoc: (doc: CanvasDoc | null) => void } | null>;

/** Sobre el modelo de Obligaciones: si piden un informe, redacta el documento con la herramienta `redactar_documento`. */
export function makeCanvasModel(inner: ChatModelAdapter, bridge: CanvasBridge): ChatModelAdapter {
  return {
    async *run(options) {
      const b = bridge.current;
      const text = lastUserText(options.messages).toLowerCase();
      const more = Boolean(b?.doc) && ASKS_MORE.test(text);
      if (!b || (!ASKS_DOC.test(text) && !more)) {
        const out = inner.run(options);
        if (Symbol.asyncIterator in out) yield* out; else yield await out;
        return;
      }
      const version = more && b.doc ? b.doc.version + 1 : 1;
      const args = { titulo: DOC_TITLE, version, fuente: DOC_SOURCE };
      const call = { type: 'tool-call' as const, toolCallId: `redactar-${version}-${Date.now()}`, toolName: 'redactar_documento', args, argsText: JSON.stringify(args, null, 2) };
      yield { content: [call] };
      await wait(DOC_START_MS);
      const lines = docLines(b.host.rows, version > 1);
      const keep = version > 1 && b.doc ? b.doc.lines.length : 0;
      const doc: CanvasDoc = { title: DOC_TITLE, version, lines, shown: keep, writing: true };
      b.setDoc(doc);
      for (let shown = keep + 1; shown <= lines.length; shown++) {
        if (options.abortSignal.aborted) { b.setDoc({ ...doc, shown, writing: false }); return; }
        await wait(DOC_LINE_MS);
        b.setDoc({ ...doc, shown });
      }
      b.setDoc({ ...doc, shown: lines.length, writing: false });
      const done = [{ ...call, result: { titulo: DOC_TITLE, version, lineas: lines.length } }];
      yield { content: done };
      const answer = version > 1
        ? `Agregué la sección de confirmadas pendientes de causar. Quedó como versión ${version} del documento.`
        : 'Te dejé el borrador a la derecha: resumen, soportes por vencer, pendientes por proveedor y el siguiente paso. Puedes pedirme cambios aquí.';
      yield* streamText(options.abortSignal, answer, done);
    },
  };
}

/** El documento en el canvas: encabezado del kit, líneas y cursor mientras se escribe. */
export function CanvasDocument({ doc, onClose }: { doc: CanvasDoc; onClose: () => void }) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [doc.shown]);
  const copy = () => { void navigator.clipboard?.writeText(`${doc.title}\n\n${doc.lines.map((l) => `${l.bullet ? '- ' : ''}${l.text}`).join('\n')}`); };
  return (
    <CanvasSplitDocument>
      <CanvasSplitHeader title={doc.title} version={doc.version} saved={!doc.writing} onCopy={doc.writing ? undefined : copy} onClose={onClose} />
      <Box ref={bodyRef} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', '& > *': { flex: 1 } }}>
        <CanvasSplitBody writing={doc.writing}>
          {doc.lines.slice(0, doc.shown).map((l, i) => <CanvasSplitLine key={i} heading={l.heading} bullet={l.bullet}>{l.text}</CanvasSplitLine>)}
        </CanvasSplitBody>
      </Box>
    </CanvasSplitDocument>
  );
}

export interface SincoCanvasProps {
  filter?: Estado | 'todas';
  selected?: number[];
  /** El asistente abierto al inicio. Default true. */
  defaultOpen?: boolean;
  /** Con el lateral cerrado, el hilo sigue en la burbuja del Assistant modal. Default false. */
  launcher?: boolean;
  onModeChange?: (mode: 'side' | 'canvas') => void;
}

export function SincoCanvas({ filter, selected, defaultOpen = true, launcher = false, onModeChange }: SincoCanvasProps) {
  const host = useObligaciones({ filter, selected });
  const [doc, setDocState] = React.useState<CanvasDoc | null>(null);
  const [mode, setModeState] = React.useState<'side' | 'canvas'>('side');
  const [open, setOpen] = React.useState(defaultOpen);
  const [modalOpen, setModalOpen] = React.useState(false);
  const setMode = (m: 'side' | 'canvas') => { setModeState(m); onModeChange?.(m); };
  const bridge = React.useRef<{ host: ObligacionesState; doc: CanvasDoc | null; setDoc: (doc: CanvasDoc | null) => void } | null>(null);
  bridge.current = { host, doc, setDoc: (d) => { setDocState(d); if (d) { setModeState('canvas'); setOpen(true); setModalOpen(false); onModeChange?.('canvas'); } } };
  const hostBridge = React.useRef<ObligacionesState | null>(null);
  hostBridge.current = host;
  const model = React.useMemo(() => makeCanvasModel(makeObligacionesModel(hostBridge), bridge), []);
  const followups = React.useMemo(() => makeObligacionesFollowups(hostBridge), []);
  const page = <Box sx={{ height: '100%', overflow: 'auto' }}><ObligacionesPage state={host} askAi={false} /></Box>;
  const canvas = mode === 'canvas' && doc !== null;
  return (
    <AuiDemoRuntime model={model} suggestions={followups} dictation={DICTATED} welcomeSuggestions={WELCOME_SUGGESTIONS}>
      <AuiSelectionContextProvider selection={obligacionesSelection(host)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', containerType: 'inline-size', bgcolor: 'background.default', color: 'text.primary' }}>
          <SincoAppBar actions={<AssistantToggle open={open || canvas} onToggle={() => { if (canvas) { setMode('side'); setOpen(false); } else { setOpen(!open); setModalOpen(false); } }} />} />
          <Box data-mode={canvas ? 'canvas' : 'side'} sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', bgcolor: 'background.paper', ...(launcher ? { overflow: 'hidden', transform: 'translateZ(0)', containerType: 'size' } : null) }}>
            {canvas ? (
              <>
                {/* Con el documento, el hilo se hace a un lado y la pantalla espera detrás. */}
                <Box sx={(t) => ({ width: t.spacing(THREAD_WIDTH), flexShrink: 0, minWidth: 0, borderRight: 1, borderColor: 'divider' })}><AuiThread /></Box>
                <CanvasDocument doc={doc} onClose={() => setMode('side')} />
              </>
            ) : open ? (
              <AuiAssistantSidebar defaultSize={DEFAULT_SIZE} minSize={MIN_SIZE} maxSize={MAX_SIZE} withHandle>{page}</AuiAssistantSidebar>
            ) : (
              <Box sx={{ flex: 1, minWidth: 0 }}>{page}</Box>
            )}
            {launcher && !open && !canvas ? (
              <AuiAssistantModal
                position="absolute"
                open={modalOpen}
                onOpenChange={setModalOpen}
                threadList={false}
                headerActions={<AuiIconButton tooltip="Mover al panel lateral" onClick={() => { setModalOpen(false); setOpen(true); }}><PanelRight /></AuiIconButton>}
              />
            ) : null}
          </Box>
        </Box>
      </AuiSelectionContextProvider>
    </AuiDemoRuntime>
  );
}
