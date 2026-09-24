import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Mic } from 'lucide-react';
import { Composer, ComposerVoice, ComposerVoiceButton } from '../../src/ai/composer';
import { ComposerStage, useFakeRun } from '../ui/ComposerStage';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Dictation».
const PHRASE = 'Muéstrame los anticipos de Nubia que vencen este mes';
/** Tiempos del tablero: graba hasta 5 s y transcribe en 1,2 s. */
const MAX_MS = 5000;
const SETTLE_MS = 1200;
const TICK_MS = 100;

type Phase = 'idle' | 'recording' | 'settling';

function useDictation(onText: (append: string) => void) {
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [elapsed, setElapsed] = React.useState(0);
  const [log, setLog] = React.useState('');
  const clock = React.useRef<number>();
  const settle = React.useRef<number>();
  React.useEffect(() => () => { window.clearInterval(clock.current); window.clearTimeout(settle.current); }, []);
  const stop = () => {
    window.clearInterval(clock.current);
    setPhase('settling');
    settle.current = window.setTimeout(() => { setPhase('idle'); onText(PHRASE); setLog('Transcripción en el texto del composer'); }, SETTLE_MS);
  };
  const start = () => {
    if (phase !== 'idle') return;
    setPhase('recording'); setElapsed(0);
    const t0 = Date.now();
    clock.current = window.setInterval(() => { const ms = Date.now() - t0; setElapsed(ms); if (ms >= MAX_MS) stop(); }, TICK_MS);
  };
  return { phase, elapsed, log, start, stop };
}

function DictationDemo({ onPhase, onLog, startRef }: { onPhase?: (phase: Phase) => void; onLog?: (log: string) => void; startRef?: React.MutableRefObject<(() => void) | undefined> }) {
  const [text, setText] = React.useState('');
  const run = useFakeRun(() => setText(''));
  const dictation = useDictation((phrase) => setText((t) => (t ? `${t} ` : '') + phrase));
  if (startRef) startRef.current = dictation.start;
  React.useEffect(() => { onPhase?.(dictation.phase); }, [dictation.phase]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { onLog?.(run.log); }, [run.log]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { onLog?.(dictation.log); }, [dictation.log]); // eslint-disable-line react-hooks/exhaustive-deps
  const voice = dictation.phase === 'idle' ? undefined : <ComposerVoice recording={dictation.phase === 'recording'} elapsedMs={dictation.elapsed} />;
  return (
    <Composer
      value={text}
      onValueChange={setText}
      onSubmit={() => run.send(text)}
      canSubmit={dictation.phase === 'idle' && text.trim().length > 0}
      running={run.running}
      onCancel={run.cancel}
      placeholder="Escribe o dicta un mensaje…"
      voice={voice}
      toolbarEnd={
        dictation.phase === 'settling' || run.running ? null : (
          <ComposerVoiceButton active={dictation.phase === 'recording'} onClick={dictation.phase === 'recording' ? dictation.stop : dictation.start} />
        )
      }
    />
  );
}

export function DictationDoc() {
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [log, setLog] = React.useState('');
  const startRef = React.useRef<() => void>();
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={<ComposerStage log={log}><DictationDemo onPhase={setPhase} onLog={setLog} startRef={startRef} /></ComposerStage>}
        properties={
          <>
            <PropRow label="recording">
              <Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>
                {`${phase === 'recording'}${phase === 'settling' ? ' · transcribing' : ''}`}
              </Typography>
            </PropRow>
            <PropRow label="Try it">
              <Button variant="contained" startIcon={<Mic size={16} />} onClick={() => startRef.current?.()}>Start dictation</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export function DictationCard() {
  return <Box sx={{ width: '100%' }}><DictationDemo /></Box>;
}
