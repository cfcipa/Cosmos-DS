import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Undo2 } from 'lucide-react';
import { Composer } from '../../src/ai/composer';
import { DraftRestore } from '../../src/ai/draft-restore';
import { ComposerStage, useFakeRun } from '../ui/ComposerStage';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Draft restore».
const DRAFT = 'Pregúntale a Nubia si ya tiene los soportes del viaje a Medellín para legalizar CE-4492 antes del cierre';
type SavedAt = 'hace 2 minutos' | 'ayer, 16:04';

function DraftDemo({ savedAt = 'hace 2 minutos', comeBackKey = 0, onLog }: { savedAt?: SavedAt; comeBackKey?: number; onLog?: (log: string) => void }) {
  const [hasDraft, setHasDraft] = React.useState(true);
  const [text, setText] = React.useState('');
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const run = useFakeRun(() => setText(''));
  React.useEffect(() => { onLog?.(run.log); }, [run.log]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { if (comeBackKey) { setHasDraft(true); setText(''); run.setLog(''); } }, [comeBackKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const restore = () => {
    setHasDraft(false); setText(DRAFT); run.setLog('aui.composer.setText(draft)');
    window.setTimeout(() => { const el = inputRef.current; if (el) { el.focus(); el.setSelectionRange(DRAFT.length, DRAFT.length); } }, 50);
  };
  return (
    <>
      {hasDraft ? <DraftRestore draft={DRAFT} savedAt={savedAt} onRestore={restore} onDiscard={() => { setHasDraft(false); run.setLog('Borrador descartado'); }} /> : null}
      <Composer value={text} onValueChange={setText} onSubmit={() => run.send(text)} running={run.running} onCancel={run.cancel} placeholder="Escribe un mensaje…" inputRef={inputRef} />
    </>
  );
}

export function DraftRestoreDoc() {
  const [savedAt, setSavedAt] = React.useState<SavedAt>('hace 2 minutos');
  const [comeBack, setComeBack] = React.useState(0);
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log={log}><DraftDemo savedAt={savedAt} comeBackKey={comeBack} onLog={setLog} /></ComposerStage>}
        properties={
          <>
            <PropRow label="savedAt"><PropToggle<SavedAt> label="Saved" value={savedAt} onChange={setSavedAt} options={[['hace 2 minutos', '2 minutes ago'], ['ayer, 16:04', 'yesterday, 16:04']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" startIcon={<Undo2 size={16} />} onClick={() => setComeBack((k) => k + 1)}>Back to the thread</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function DraftRestoreCard() {
  const [key, setKey] = React.useState(0);
  return <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}><DraftDemo key={key} onLog={(log) => { if (log === 'Borrador descartado') window.setTimeout(() => setKey((k) => k + 1), 1500); }} /></Box>;
}
