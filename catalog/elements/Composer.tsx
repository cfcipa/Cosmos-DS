import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FileText, Paperclip } from 'lucide-react';
import { Composer, ComposerContext, ComposerModelPicker, ComposerVoice, ComposerVoiceButton } from '../../src/ai/composer';
import type { ComposerModel, ComposerSubmitMode } from '../../src/ai/composer';
import { ComposerStage, useFakeRun } from '../ui/ComposerStage';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { useTimers } from '../ui/useTimers';

// Contenido del tablero «Composer».
const FILES = ['extracto_agosto.pdf', 'soportes_CE-4471.xlsx'];
const MODELS: ComposerModel[] = [{ name: 'Sonnet 5', meta: 'Equilibrado' }, { name: 'Opus 5', meta: 'Más capaz' }, { name: 'Haiku 4.5', meta: 'Más rápido' }];
const INTENTS = ['Pregunta por los anticipos que vencen este mes…', 'Concilia el extracto bancario de agosto…', 'Genera el informe de cartera por cliente…', 'Encuentra las facturas sin legalizar…'];
const DICTATED = 'Muéstrame los anticipos de Nubia Rojas';
const USAGE = { system: 12, tools: 8, messages: 54, total: 200 };
const DICTATION_MS = 1800;

type Flag = 'on' | 'off';

/** El composer completo del tablero; `small` es la tarjeta de Elements. */
function ComposerDemo({ submitMode = 'enter', compact = false, disabled = false, onLog }: { submitMode?: ComposerSubmitMode; compact?: boolean; disabled?: boolean; onLog?: (log: string) => void }) {
  const [text, setText] = React.useState('');
  const [files, setFiles] = React.useState<string[]>([]);
  const [added, setAdded] = React.useState(0);
  const [model, setModel] = React.useState('Sonnet 5');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [dictating, setDictating] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const { after, clear } = useTimers();
  const run = useFakeRun(() => { setText(''); setFiles([]); });
  React.useEffect(() => { onLog?.(run.log); }, [run.log]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDictation = () => {
    clear();
    if (dictating) { setDictating(false); run.setLog('Dictado detenido'); return; }
    setDictating(true); setElapsed(0); run.setLog('Escuchando…');
    for (let ms = 100; ms <= DICTATION_MS; ms += 100) after(ms, () => setElapsed(ms));
    after(DICTATION_MS, () => { setDictating(false); setText((t) => (t ? `${t} ` : '') + DICTATED); run.setLog('Dictado listo'); });
  };

  return (
    <Composer
      value={text}
      onValueChange={setText}
      onSubmit={() => run.send(text || files.join(', '))}
      canSubmit={text.trim().length > 0 || files.length > 0}
      submitMode={submitMode}
      running={run.running}
      onCancel={run.cancel}
      disabled={disabled}
      compact={compact}
      placeholder={INTENTS}
      onFilesDrop={(dropped) => setFiles((current) => [...current, ...dropped.map((f) => f.name)])}
      attachments={files.length ? files.map((name, i) => (
        <Chip key={`${name}-${i}`} icon={<FileText size={18} />} label={name} onDelete={() => setFiles((current) => current.filter((_f, j) => j !== i))} />
      )) : undefined}
      voice={dictating ? <ComposerVoice recording elapsedMs={elapsed} /> : undefined}
      onKeyDown={(event) => { if (event.key === 'Escape' && menuOpen) setMenuOpen(false); }}
      toolbarStart={
        <>
          <Tooltip title="Agregar adjunto">
            <span><IconButton aria-label="Agregar adjunto" disabled={disabled || run.running} onClick={() => { setFiles((c) => [...c, FILES[added % FILES.length]]); setAdded((k) => k + 1); }}><Paperclip size={18} /></IconButton></span>
          </Tooltip>
          <ComposerModelPicker models={MODELS} model={model} onModelChange={(name) => { setModel(name); run.setLog(`Modelo: ${name}`); }} open={menuOpen && !disabled} onOpenChange={setMenuOpen} disabled={disabled || run.running} />
        </>
      }
      toolbarEnd={
        <>
          <ComposerContext usage={USAGE} />
          <ComposerVoiceButton active={dictating} onClick={toggleDictation} disabled={disabled || run.running} />
        </>
      }
    />
  );
}

export function ComposerDoc() {
  const [compact, setCompact] = React.useState<Flag>('off');
  const [mode, setMode] = React.useState<ComposerSubmitMode>('enter');
  const [state, setState] = React.useState<Flag>('on');
  const [log, setLog] = React.useState('');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log={log}><ComposerDemo submitMode={mode} compact={compact === 'on'} disabled={state === 'off'} onLog={setLog} /></ComposerStage>}
        properties={
          <>
            <PropRow label="compact"><PropToggle<Flag> label="compact" value={compact} onChange={setCompact} options={[['off', 'false'], ['on', 'true']]} /></PropRow>
            <PropRow label="submitMode"><PropToggle<ComposerSubmitMode> label="submitMode" value={mode} onChange={setMode} options={[['enter', 'enter'], ['ctrlEnter', 'ctrlEnter'], ['none', 'none']]} /></PropRow>
            <PropRow label="state"><PropToggle<Flag> label="Composer state" value={state} onChange={setState} options={[['on', 'enabled'], ['off', 'disabled']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: la misma demo, en pequeño y funcionando. */
export function ComposerCard() {
  return <Box sx={{ width: '100%' }}><ComposerDemo /></Box>;
}
