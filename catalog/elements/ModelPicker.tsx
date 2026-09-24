import * as React from 'react';
import Box from '@mui/material/Box';
import { Composer, ComposerModelPicker } from '../../src/ai/composer';
import type { ComposerModel } from '../../src/ai/composer';
import { ComposerStage, useFakeRun } from '../ui/ComposerStage';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Models».
const MODELS: ComposerModel[] = [{ name: 'Opus 5', meta: '1M ctx' }, { name: 'Sonnet 5', meta: '1M ctx' }, { name: 'Haiku 4.5', meta: '200k ctx' }];

type Flag = 'on' | 'off';

function ModelsDemo({ defaultOpen = true, onLog }: { defaultOpen?: boolean; onLog?: (log: string) => void }) {
  const [text, setText] = React.useState('');
  const [model, setModel] = React.useState('Sonnet 5');
  const [open, setOpen] = React.useState(defaultOpen);
  const run = useFakeRun(() => setText(''));
  React.useEffect(() => { onLog?.(run.log); }, [run.log]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);
  return (
    <Composer
      value={text}
      onValueChange={setText}
      onSubmit={() => run.send(text)}
      running={run.running}
      onCancel={run.cancel}
      placeholder="Escribe un mensaje…"
      onKeyDown={(event) => { if (event.key === 'Escape' && open) setOpen(false); }}
      toolbarStart={<ComposerModelPicker models={MODELS} model={model} onModelChange={(name) => { setModel(name); run.setLog(`onModelChange("${name}")`); }} open={open} onOpenChange={setOpen} />}
    />
  );
}

export function ModelPickerDoc() {
  const [def, setDef] = React.useState<Flag>('on');
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log={log}><ModelsDemo defaultOpen={def === 'on'} onLog={setLog} /></ComposerStage>}
        properties={
          <PropRow label="defaultModelMenuOpen"><PropToggle<Flag> label="Menu open on mount" value={def} onChange={setDef} options={[['on', 'true'], ['off', 'false']]} /></PropRow>
        }
      />
    </Box>
  );
}

export function ModelPickerCard() {
  return <Box sx={{ width: '100%', pt: 16 }}><ModelsDemo /></Box>;
}
