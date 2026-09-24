import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Paperclip, RotateCcw } from 'lucide-react';
import { Composer, ComposerAttachmentChip, attachmentKind } from '../../src/ai/composer';
import type { ComposerAttachment } from '../../src/ai/composer';
import { ComposerStage, useFakeRun } from '../ui/ComposerStage';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Attachments».
type Item = ComposerAttachment & { id: string };
const start = (): Item[] => [
  { id: 'a1', name: 'extracto_agosto.pdf', kind: 'text', meta: '412 KB', state: 'uploading', progress: 12 },
  { id: 'a2', name: 'soportes_viaje.zip', kind: 'archive', meta: '1,2 MB', state: 'done', progress: 100 },
  { id: 'a3', name: 'factura_0932.png', kind: 'image', meta: 'Supera el límite de 10 MB', state: 'error', progress: 0 },
];
const MORE = [['conciliacion_1110.xlsx', '88 KB'], ['recibo_taxi.jpg', '640 KB'], ['contrato_marco.pdf', '2,4 MB']];
/** La subida simulada del tablero: 7 % cada 160 ms. */
const STEP = 7;
const TICK_MS = 160;

type RemoveMode = 'on' | 'off';

function AttachmentsDemo({ withRemove = true, onLog }: { withRemove?: boolean; onLog?: (log: string) => void }) {
  const [items, setItems] = React.useState<Item[]>(start);
  const [text, setText] = React.useState('');
  const count = React.useRef(0);
  const run = useFakeRun(() => { setText(''); setItems([]); });
  const uploading = items.some((item) => item.state === 'uploading');
  React.useEffect(() => { onLog?.(uploading ? 'Enviar se habilita cuando terminen las subidas.' : run.log); }, [uploading, run.log]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!uploading) return undefined;
    const id = window.setInterval(() => setItems((current) => current.map((item) => {
      if (item.state !== 'uploading') return item;
      const progress = Math.min(100, (item.progress ?? 0) + STEP);
      return { ...item, progress, state: progress >= 100 ? 'done' : 'uploading' };
    })), TICK_MS);
    return () => window.clearInterval(id);
  }, [uploading]);

  const add = (name: string, meta: string) => { setItems((current) => [...current, { id: `n${count.current}`, name, meta, kind: attachmentKind(name), state: 'uploading', progress: 0 }]); count.current += 1; };
  const addNext = () => { const [name, meta] = MORE[count.current % MORE.length]; add(name, meta); };

  return (
    <Composer
      value={text}
      onValueChange={setText}
      onSubmit={() => run.send(text || items.map((i) => i.name).join(', '))}
      canSubmit={!uploading && (text.trim().length > 0 || items.length > 0)}
      running={run.running}
      onCancel={run.cancel}
      minRows={1}
      placeholder="Escribe un mensaje…"
      onFilesDrop={(files) => files.forEach((file) => add(file.name, `${Math.max(1, Math.round(file.size / 1024))} KB`))}
      attachments={items.length ? items.map((item) => (
        <ComposerAttachmentChip key={item.id} attachment={item} onRemove={withRemove ? () => setItems((current) => current.filter((x) => x.id !== item.id)) : undefined} />
      )) : undefined}
      toolbarStart={<Tooltip title="Agregar adjunto"><IconButton aria-label="Agregar adjunto" onClick={addNext}><Paperclip size={18} /></IconButton></Tooltip>}
    />
  );
}

export function AttachmentsDoc() {
  const [withRemove, setWithRemove] = React.useState<RemoveMode>('on');
  const [log, setLog] = React.useState('');
  const [resetKey, setResetKey] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log={log}><AttachmentsDemo key={resetKey} withRemove={withRemove === 'on'} onLog={setLog} /></ComposerStage>}
        properties={
          <>
            <PropRow label="onRemove"><PropToggle<RemoveMode> label="onRemove" value={withRemove} onChange={setWithRemove} options={[['on', 'connected'], ['off', 'no callback']]} /></PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => setResetKey((k) => k + 1)}>Reset</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AttachmentsCard() {
  return <Box sx={{ width: '100%' }}><AttachmentsDemo /></Box>;
}
