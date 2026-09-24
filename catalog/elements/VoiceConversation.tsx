import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { VoiceConversation } from '../../src/ai/voice-conversation';
import type { VoiceMode, VoiceTurn } from '../../src/ai/voice-conversation';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Voice conversation».
const SCRIPT: Array<[VoiceTurn['role'], string]> = [
  ['user', '¿Cuánto suman los anticipos pendientes?'],
  ['assistant', 'Suman tres millones novecientos treinta mil pesos, en tres anticipos.'],
  ['user', '¿Cuál vence primero?'],
  ['assistant', 'El de Nubia Rojas, CE cuarenta y cuatro noventa y dos, el treinta de septiembre.'],
];
/** Tiempos del tablero. */
const CONNECT_MS = 1200;
const WORD_MS = 260;
const THINK_MS = 900;
const NEXT_MS = 700;
const AMP_MS = 90;

/** La llamada simulada del tablero: turnos que se dicen palabra a palabra, con la amplitud de la voz. */
function useCall() {
  const [mode, setMode] = React.useState<VoiceMode>('connecting');
  const [turns, setTurns] = React.useState<VoiceTurn[]>([]);
  const [interim, setInterim] = React.useState('');
  const [step, setStep] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [ended, setEnded] = React.useState(false);
  const [amp, setAmp] = React.useState(0);
  const timers = React.useRef<number[]>([]);
  const words = React.useRef<number>();
  const mutedRef = React.useRef(false);
  mutedRef.current = muted;
  const modeRef = React.useRef(mode);
  modeRef.current = mode;

  const clear = () => { window.clearInterval(words.current); timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  const turn = React.useCallback((i: number) => {
    if (i >= SCRIPT.length) { setMode('listening'); setInterim(''); return; }
    const [role, line] = SCRIPT[i];
    if (role === 'user' && mutedRef.current) { setMode('listening'); later(() => turn(i), 800); return; }
    setMode(role === 'user' ? 'listening' : 'speaking'); setStep(i); setInterim('');
    const list = line.split(' ');
    let k = 0;
    window.clearInterval(words.current);
    words.current = window.setInterval(() => {
      k += 1;
      setInterim(list.slice(0, k).join(' '));
      if (k >= list.length) {
        window.clearInterval(words.current);
        setTurns((current) => [...current, { id: `t${i}`, role, text: line }]);
        setInterim('');
        if (role === 'user') { setMode('thinking'); later(() => turn(i + 1), THINK_MS); } else later(() => turn(i + 1), NEXT_MS);
      }
    }, WORD_MS);
  }, []);

  const start = React.useCallback(() => {
    clear();
    setMode('connecting'); setTurns([]); setInterim(''); setStep(0); setEnded(false); setMuted(false);
    later(() => turn(0), CONNECT_MS);
  }, [turn]);

  React.useEffect(() => {
    start();
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      const m = modeRef.current;
      let a = 0;
      if (m === 'listening' && !mutedRef.current) a = 0.2 + 0.6 * Math.abs(Math.sin(tick * 0.6));
      if (m === 'speaking') a = 0.3 + 0.6 * Math.abs(Math.sin(tick * 0.9) * Math.cos(tick * 0.3));
      setAmp(a);
    }, AMP_MS);
    return () => { window.clearInterval(id); clear(); };
  }, [start]);

  const interrupt = () => {
    if (mode !== 'speaking') return;
    clear();
    const line = SCRIPT[step][1];
    setTurns((current) => [...current, { id: `t${step}-cut`, role: 'assistant', text: `${interim || line.split(' ')[0]} —` }]);
    setInterim(''); setMode('listening');
    later(() => turn(step + 1), THINK_MS);
  };

  const transcript: VoiceTurn[] = interim ? [...turns, { id: 'interim', role: SCRIPT[step][0], text: interim, interim: true }] : turns;
  return {
    mode, amp, transcript, muted, ended,
    toggleMute: () => setMuted((m) => !m),
    interrupt,
    end: () => { clear(); setEnded(true); setInterim(''); },
    restart: start,
  };
}

function CallDemo({ onMode }: { onMode?: (mode: string) => void }) {
  const call = useCall();
  React.useEffect(() => { onMode?.(call.ended ? 'terminada' : call.mode); }, [call.mode, call.ended]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <VoiceConversation
      mode={call.mode}
      amplitude={call.amp}
      transcript={call.transcript}
      muted={call.muted}
      ended={call.ended}
      onToggleMute={call.toggleMute}
      onInterrupt={call.interrupt}
      onEnd={call.end}
      onRestart={call.restart}
    />
  );
}

export function VoiceConversationDoc() {
  const [mode, setMode] = React.useState('connecting');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={420}
        demo={<Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}><Box sx={{ width: '100%', maxWidth: 420, height: '100%' }}><CallDemo onMode={setMode} /></Box></Box>}
        properties={
          <PropRow label="mode">
            <Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{mode}</Typography>
          </PropRow>
        }
      />
    </Box>
  );
}

export function VoiceConversationCard() {
  return <Box sx={{ width: '100%', height: 220 }}><CallDemo /></Box>;
}
