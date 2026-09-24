import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { StreamingText, streamingWords } from '../../src/ai/streaming-text';
import type { StreamingSegment } from '../../src/ai/streaming-text';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Streaming text».
const SEGMENTS: StreamingSegment[] = [
  { text: 'Hay 3 anticipos pendientes de legalizar por un total de $3.930.000. El de mayor valor es el anticipo' },
  { text: 'CE-4471', mono: true },
  { text: 'de Ferretería El Roble, cargado al centro de costo' },
  { text: 'CC-210', mono: true },
  { text: 'Obra Norte. Si quieres, preparo un recordatorio para cada responsable.' },
];
const TOTAL = streamingWords(SEGMENTS).length;
type Speed = 'slow' | 'normal' | 'fast';
const SPEED: Record<Speed, number> = { slow: 220, normal: 110, fast: 50 };

/** Reproduce el texto palabra a palabra; `loop` lo repite (tarjeta). */
function usePlayback(speed: Speed, loop = false) {
  const [count, setCount] = React.useState(0);
  const [streaming, setStreaming] = React.useState(true);
  const timer = React.useRef<number>();
  const play = React.useCallback((from?: number) => {
    window.clearInterval(timer.current);
    if (from !== undefined) { setCount(from); setStreaming(true); }
    timer.current = window.setInterval(() => {
      setCount((c) => {
        const n = c + 1;
        if (n >= TOTAL) {
          if (loop) return 0;
          window.clearInterval(timer.current); setStreaming(false); return TOTAL;
        }
        return n;
      });
    }, SPEED[speed]);
  }, [speed, loop]);
  const stop = () => window.clearInterval(timer.current);
  React.useEffect(() => () => window.clearInterval(timer.current), []);
  return { count, setCount, streaming, setStreaming, play, stop };
}

export function StreamingTextDoc() {
  const [speed, setSpeed] = React.useState<Speed>('normal');
  const pb = usePlayback(speed);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) { first.current = false; pb.play(0); return; }
    if (pb.streaming && pb.count < TOTAL) pb.play(); // nueva velocidad sin reiniciar
  }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={280}
        demo={
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <IconButton size="small" aria-label="Reproducir de nuevo" title="Reproducir de nuevo" onClick={() => pb.play(0)} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <RotateCcw size={16} />
            </IconButton>
            <Box sx={{ width: '100%', maxWidth: 400, minHeight: 136 }}>
              <StreamingText segments={SEGMENTS} count={pb.count} streaming={pb.streaming} />
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="Speed">
              <PropToggle<Speed> label="Speed" value={speed} onChange={setSpeed} options={[['slow', 'slow'], ['normal', 'normal'], ['fast', 'fast']]} />
            </PropRow>
            <PropRow label="streaming">
              <PropToggle<'true' | 'false'> label="streaming" value={String(pb.streaming) as 'true' | 'false'} onChange={(v) => { pb.stop(); pb.setStreaming(v === 'true'); }} options={[['true', 'true'], ['false', 'false']]} />
            </PropRow>
            <PropRow label="count">
              <Slider size="small" min={0} max={TOTAL} step={1} value={pb.count} aria-label="Visible words"
                onChange={(_e, v) => { pb.stop(); pb.setCount(v as number); }} sx={{ width: 240 }} />
              <Typography variant="caption" color="text.secondary" sx={(t) => ({ ...t.aiKit.code, fontSize: 12, fontVariantNumeric: 'tabular-nums' })}>{pb.count} / {TOTAL}</Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements: el texto llegando en bucle. */
export function StreamingTextCard() {
  const pb = usePlayback('normal', true);
  React.useEffect(() => { pb.play(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Box sx={{ minHeight: 120 }}><StreamingText segments={SEGMENTS} count={pb.count} streaming /></Box>;
}
