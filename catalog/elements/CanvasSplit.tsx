import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FilePlus2 } from 'lucide-react';
import { CanvasSplit, CanvasSplitBody, CanvasSplitDocument, CanvasSplitHeader, CanvasSplitLine, CanvasSplitMessage, CanvasSplitThread } from '../../src/ai/canvas-split';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Canvas».
const DOC: Array<[string, boolean]> = [
  ['Política de legalización de anticipos', true],
  ['1. Alcance', true],
  ['Aplica a todo anticipo entregado a empleados para viajes, compras menores o gastos de obra.', false],
  ['2. Plazo', true],
  ['El anticipo se legaliza dentro de los 15 días siguientes a su uso, con los soportes de cada gasto.', false],
  ['3. Diferencias', true],
  ['Si sobra dinero, el empleado lo devuelve; si falta, Tesorería causa la cuenta por pagar.', false],
];
const TOTAL = DOC.reduce((a, [t]) => a + t.length, 0);
/** El documento se escribe 6 caracteres cada 30 ms (tablero). */
const STEP = 6;
const TICK_MS = 30;

function useWriter() {
  const [chars, setChars] = React.useState(0);
  const [writing, setWriting] = React.useState(true);
  const [version, setVersion] = React.useState(3);
  const timer = React.useRef<number>();
  const write = React.useCallback(() => {
    window.clearInterval(timer.current);
    setChars(0); setWriting(true);
    timer.current = window.setInterval(() => {
      setChars((c) => {
        const next = c + STEP;
        if (next >= TOTAL) { window.clearInterval(timer.current); setWriting(false); return TOTAL; }
        return next;
      });
    }, TICK_MS);
  }, []);
  React.useEffect(() => { write(); return () => window.clearInterval(timer.current); }, [write]);
  const stop = () => { window.clearInterval(timer.current); };
  return { chars, writing, setWriting, version, setVersion, write, stop };
}

function CanvasDemo({ w, withCopy = true, withClose = true, open, setOpen, height, compact = false }: {
  w: ReturnType<typeof useWriter>; withCopy?: boolean; withClose?: boolean; open: boolean; setOpen: (o: boolean) => void; height?: number; compact?: boolean;
}) {
  let left = w.chars;
  const lines: Array<[string, boolean]> = [];
  for (const [text, heading] of DOC) { if (left <= 0) break; lines.push([text.slice(0, left), heading]); left -= text.length; }
  const saved = !w.writing && w.chars >= TOTAL;
  const copy = () => { navigator.clipboard?.writeText(DOC.map(([t]) => t).join('\n')).catch(() => undefined); };
  return (
    <CanvasSplit sx={height ? { height } : undefined}>
      <CanvasSplitThread sx={compact && open ? { width: (t) => t.spacing(17) } : undefined}>
        <CanvasSplitMessage speaker="user">Redacta la política de legalización de anticipos</CanvasSplitMessage>
        {!compact ? (
          <CanvasSplitMessage speaker="assistant">
            {w.writing ? `Escribiendo la versión ${w.version} en el documento…` : `Listo: versión ${w.version} con alcance, plazo y diferencias.`}
          </CanvasSplitMessage>
        ) : null}
      </CanvasSplitThread>
      {open ? (
        <CanvasSplitDocument>
          <CanvasSplitHeader title="Política de anticipos" version={w.version} saved={saved} onCopy={withCopy ? copy : undefined} onClose={withClose ? () => setOpen(false) : undefined} />
          <CanvasSplitBody writing={w.writing}>
            {lines.map(([text, heading], i) => <CanvasSplitLine key={i} heading={heading}>{text}</CanvasSplitLine>)}
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
            <PropRow label="writing"><PropToggle<'true' | 'false'> label="writing" value={String(w.writing) as 'true' | 'false'} onChange={(v) => { w.stop(); w.setWriting(v === 'true'); }} options={[['true', 'true'], ['false', 'false']]} /></PropRow>
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
