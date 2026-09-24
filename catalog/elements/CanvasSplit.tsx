import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FilePlus2 } from 'lucide-react';
import { CanvasSplit, CanvasSplitBody, CanvasSplitDocument, CanvasSplitHeader, CanvasSplitLine, CanvasSplitMessage, CanvasSplitThread } from '../../src/ai/canvas-split';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Canvas». Historia de assistant-ui: una línea nueva cada 900 ms hasta guardar.
const DOC: Array<[string, boolean]> = [
  ['Política de legalización de anticipos', true],
  ['1. Alcance', true],
  ['Aplica a todo anticipo entregado a empleados para viajes, compras menores o gastos de obra.', false],
  ['2. Plazo', true],
  ['El anticipo se legaliza dentro de los 15 días siguientes a su uso, con los soportes de cada gasto.', false],
  ['3. Diferencias', true],
  ['Si sobra dinero, el empleado lo devuelve; si falta, Tesorería causa la cuenta por pagar.', false],
];
const LINE_MS = 900;

function useWriter() {
  const [lines, setLines] = React.useState(0);
  const [version, setVersion] = React.useState(3);
  const [held, setHeld] = React.useState(false);
  const timer = React.useRef<number>();
  const write = React.useCallback(() => {
    window.clearInterval(timer.current);
    setLines(0); setHeld(false);
    timer.current = window.setInterval(() => setLines((n) => {
      if (n + 1 >= DOC.length) window.clearInterval(timer.current);
      return Math.min(DOC.length, n + 1);
    }), LINE_MS);
  }, []);
  React.useEffect(() => { write(); return () => window.clearInterval(timer.current); }, [write]);
  const hold = (v: boolean) => { window.clearInterval(timer.current); setHeld(!v); if (v) write(); };
  const writing = !held && lines < DOC.length;
  return { lines, writing, version, setVersion, write, hold };
}

function CanvasDemo({ w, withCopy = true, withClose = true, open, setOpen, height, compact = false }: {
  w: ReturnType<typeof useWriter>; withCopy?: boolean; withClose?: boolean; open: boolean; setOpen: (o: boolean) => void; height?: number; compact?: boolean;
}) {
  const copy = () => { navigator.clipboard?.writeText(DOC.map(([t]) => t).join('\n')).catch(() => undefined); };
  return (
    <CanvasSplit sx={height ? { height } : undefined}>
      <CanvasSplitThread sx={compact && open ? { width: (t) => t.spacing(17) } : undefined}>
        <CanvasSplitMessage speaker="user">Redacta la política de legalización de anticipos</CanvasSplitMessage>
        {!compact ? <CanvasSplitMessage speaker="assistant">{w.writing ? 'Lo abrí en el canvas. Escribiendo ahora.' : `Listo: versión ${w.version} con alcance, plazo y diferencias.`}</CanvasSplitMessage> : null}
      </CanvasSplitThread>
      {open ? (
        <CanvasSplitDocument>
          <CanvasSplitHeader title="Política de anticipos" version={w.version} saved={!w.writing && w.lines >= DOC.length} onCopy={withCopy ? copy : undefined} onClose={withClose ? () => setOpen(false) : undefined} />
          <CanvasSplitBody writing={w.writing}>
            {DOC.slice(0, w.lines).map(([text, heading]) => <CanvasSplitLine key={text} heading={heading}>{text}</CanvasSplitLine>)}
          </CanvasSplitBody>
        </CanvasSplitDocument>
      ) : null}
    </CanvasSplit>
  );
}

export function CanvasSplitDoc() {
  const w = useWriter();
  const [open, setOpen] = React.useState(true);
  const [withCopy, setWithCopy] = React.useState<'on' | 'off'>('on');
  const [withClose, setWithClose] = React.useState<'on' | 'off'>('on');
  const another = () => { w.setVersion((v) => v + 1); setOpen(true); w.write(); };
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><CanvasDemo w={w} open={open} setOpen={setOpen} withCopy={withCopy === 'on'} withClose={withClose === 'on'} /></Box>}
        properties={
          <>
            <PropRow label="writing"><PropToggle<'true' | 'false'> label="writing" value={w.writing ? 'true' : 'false'} onChange={(v) => w.hold(v === 'true')} options={[['true', 'true'], ['false', 'false']]} /></PropRow>
            <PropRow label="onCopy"><PropToggle<'on' | 'off'> label="onCopy" value={withCopy} onChange={setWithCopy} options={[['on', 'connected'], ['off', 'undefined']]} /></PropRow>
            <PropRow label="onClose"><PropToggle<'on' | 'off'> label="onClose" value={withClose} onChange={setWithClose} options={[['on', 'connected'], ['off', 'undefined']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" startIcon={<FilePlus2 size={16} />} onClick={another}>Write another version</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function CanvasSplitCard() {
  const w = useWriter();
  const [open, setOpen] = React.useState(true);
  const { writing, write } = w;
  React.useEffect(() => {
    if (writing && open) return undefined;
    const id = window.setTimeout(() => { setOpen(true); write(); }, open ? 3500 : 1500);
    return () => window.clearTimeout(id);
  }, [writing, open, write]);
  return <CanvasDemo w={w} open={open} setOpen={setOpen} height={212} compact />;
}
