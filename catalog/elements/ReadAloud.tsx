import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { ReadAloud } from '../../src/ai/read-aloud';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Read aloud».
const TEXT = 'Hay tres anticipos pendientes por tres millones novecientos treinta mil pesos. El próximo en vencer es el de Nubia Rojas, el treinta de septiembre.';
const WORDS = TEXT.split(' ');
const RATES = [1, 1.25, 1.5, 2];
/** Lo que dura cada palabra a 1× (tablero). */
const WORD_MS = 330;
const clock = (ms: number) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

type Status = 'idle' | 'running' | 'paused' | 'ended';

function useReading() {
  const [index, setIndex] = React.useState(0);
  const [status, setStatus] = React.useState<Status>('idle');
  const [rate, setRate] = React.useState(1);
  const timer = React.useRef<number>();
  React.useEffect(() => () => window.clearInterval(timer.current), []);

  const run = (atRate: number, from: number) => {
    window.clearInterval(timer.current);
    const startAt = from >= WORDS.length ? 0 : from;
    setIndex(startAt); setStatus('running');
    let i = startAt;
    timer.current = window.setInterval(() => {
      i += 1;
      if (i >= WORDS.length) { window.clearInterval(timer.current); setIndex(WORDS.length); setStatus('ended'); } else setIndex(i);
    }, WORD_MS / atRate);
  };
  const toggle = () => {
    if (status === 'running') { window.clearInterval(timer.current); setStatus('paused'); } else run(rate, index);
  };
  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (status === 'running') run(next, index);
  };
  const reset = () => { window.clearInterval(timer.current); setIndex(0); setStatus('idle'); };
  const done = Math.min(index, WORDS.length);
  return { index: done, status, rate, toggle, cycleRate, reset, elapsed: clock((done * WORD_MS) / rate), duration: clock((WORDS.length * WORD_MS) / rate) };
}

function ReadingDemo({ reading }: { reading: ReturnType<typeof useReading> }) {
  return (
    <ReadAloud
      words={WORDS}
      spokenIndex={reading.index}
      playing={reading.status === 'running'}
      rate={reading.rate}
      elapsed={reading.elapsed}
      duration={reading.duration}
      onToggle={reading.toggle}
      onRateChange={reading.cycleRate}
    />
  );
}

export function ReadAloudDoc() {
  const reading = useReading();
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={420}
        demo={<Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box sx={{ width: '100%', maxWidth: 440 }}><ReadingDemo reading={reading} /></Box></Box>}
        properties={
          <>
            <PropRow label="status"><Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{reading.status}</Typography></PropRow>
            <PropRow label="spokenIndex"><Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{reading.index}</Typography></PropRow>
            <PropRow label="Try it"><Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={reading.reset}>From the start</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function ReadAloudCard() {
  const reading = useReading();
  return <Box sx={{ width: '100%' }}><ReadingDemo reading={reading} /></Box>;
}
