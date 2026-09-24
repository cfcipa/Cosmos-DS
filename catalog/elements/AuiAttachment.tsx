import * as React from 'react';
import { useAui, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme, type Theme } from '@mui/material/styles';
import { AuiThread } from '../../src/ai/aui';
import type { CompleteAttachment } from '@assistant-ui/react';
import { AuiDemoRuntime, failNextUpload, type DemoThread } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

/** La imagen del composer entra un poco después del PDF, para verla subiendo. */
const STAGE_DELAY = 1200;

type Composer = { addAttachment: (file: File) => Promise<void> };
const composerOf = (aui: ReturnType<typeof useAui>) => (aui as unknown as { composer: () => Composer }).composer();

/** Una imagen de ejemplo dibujada con los colores del tema: barras de los anticipos. */
function drawChart(t: Theme): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.fillStyle = t.palette.background.paper;
  ctx.fillRect(0, 0, 192, 192);
  [0.45, 0.8, 0.6, 0.95].forEach((h, i) => {
    ctx.fillStyle = i === 3 ? t.palette.primary.main : t.palette.primary.light;
    ctx.fillRect(24 + i * 40, 168 - h * 136, 28, h * 136);
  });
  return canvas;
}
const pdf = (name: string) => new File(['%PDF-1.4 ejemplo'], name, { type: 'application/pdf' });
const png = (canvas: HTMLCanvasElement, name: string) => new Promise<File>((resolve) => canvas.toBlob((b) => resolve(new File([b ?? new Blob()], name, { type: 'image/png' })), 'image/png'));

function useDemoThreads(t: Theme) {
  return React.useMemo(() => {
    const image = drawChart(t).toDataURL('image/png');
    const chart: CompleteAttachment = { id: 'grafico', type: 'image', name: 'grafico_anticipos.png', contentType: 'image/png', status: { type: 'complete' as const }, content: [{ type: 'image' as const, image }] };
    const policy: CompleteAttachment = { id: 'politica', type: 'document', name: 'politica_anticipos.pdf', contentType: 'application/pdf', status: { type: 'complete' as const }, content: [{ type: 'text' as const, text: '[politica_anticipos.pdf]' }] };
    const make = (id: string, attachments: CompleteAttachment[]): DemoThread => ({
      id, title: 'Política de anticipos',
      messages: [
        { role: 'user', content: '¿Esto cuadra con la política de anticipos?', attachments },
        { role: 'assistant', content: 'Sí: los tres anticipos están dentro del tope por viaje. CE-4492 es el único que vence este mes.' },
      ],
    });
    return { single: [make('adjunto-imagen', [chart])], mixed: [make('adjunto-mixto', [chart, policy])] };
  }, [t]);
}

/** Deja en el composer del hilo abierto un PDF ya subido y una imagen subiendo, como en el tablero. */
function StageFiles({ threadId }: { threadId: string }) {
  const aui = useAui();
  const theme = useTheme();
  const pdfDone = React.useRef(false);
  const imageDone = React.useRef(false);
  const inThread = useAuiState((s) => (s.threadListItem as { remoteId?: string }).remoteId === threadId && !s.thread.isLoading);
  React.useEffect(() => {
    if (!inThread) return undefined;
    const composer = composerOf(aui);
    if (!pdfDone.current) {
      pdfDone.current = true;
      composer.addAttachment(pdf('extracto_agosto.pdf')).catch(() => undefined);
    }
    let alive = true;
    const id = window.setTimeout(() => {
      if (imageDone.current) return;
      imageDone.current = true;
      void png(drawChart(theme), 'soporte_CE-4492.png').then((f) => (alive ? composer.addAttachment(f) : undefined)).catch(() => undefined);
    }, STAGE_DELAY);
    return () => { alive = false; window.clearTimeout(id); };
  }, [aui, theme, inThread]);
  return null;
}

function Actions() {
  const aui = useAui();
  const theme = useTheme();
  const [k, setK] = React.useState(3);
  const add = async (fail: boolean) => {
    const image = k % 2 === 1;
    setK(k + 1);
    if (fail) failNextUpload();
    const file = image ? await png(drawChart(theme), `soporte_${k}.png`) : pdf(`factura_FV-09${k}.pdf`);
    void composerOf(aui).addAttachment(file);
  };
  return (
    <>
      <Button variant="outlined" onClick={() => void add(false)}>Upload another</Button>
      <Button variant="outlined" color="error" onClick={() => void add(true)}>Force an error</Button>
    </>
  );
}

type MessageOpt = 'single' | 'mixed';

export function AuiAttachmentDoc() {
  const theme = useTheme();
  const threads = useDemoThreads(theme);
  const [message, setMessage] = React.useState<MessageOpt>('mixed');
  const list = threads[message];
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime key={message} slowUploads threads={list} startIn={list[0].id}>
        <StageFiles threadId={list[0].id} />
        <ElementPage
          demoHeight={440}
          demo={<Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}><Box sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}><AuiThread autoFocus={false} /></Box></Box>}
          properties={
            <>
              <PropRow label="message"><PropToggle<MessageOpt> label="message" value={message} onChange={setMessage} options={[['single', 'single image'], ['mixed', 'image + file']]} /></PropRow>
              <PropRow label="Try it"><Actions /></PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiAttachmentCard() {
  const theme = useTheme();
  const threads = useDemoThreads(theme);
  return (
    <AuiDemoRuntime slowUploads threads={threads.mixed} startIn={threads.mixed[0].id}>
      <StageFiles threadId={threads.mixed[0].id} />
      <Box sx={{ height: 212, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <AuiThread autoFocus={false} />
      </Box>
    </AuiDemoRuntime>
  );
}
