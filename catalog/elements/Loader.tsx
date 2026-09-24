import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Pause, Play } from 'lucide-react';
import { Loader } from '../../src/ai/loader';
import type { LoaderAnimation } from '../../src/ai/loader';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

const DEFAULTS = { animation: 'wave' as LoaderAnimation, label: 'Pensando' };

/** Página del Loader: demo y propiedades para revisar el diseño. */
export function LoaderDoc() {
  const [animation, setAnimation] = React.useState<LoaderAnimation>(DEFAULTS.animation);
  const [label, setLabel] = React.useState(DEFAULTS.label);
  const [tick, setTick] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  React.useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => setTick((n) => n + 1), 120);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <>
      <Box sx={{ maxWidth: 640 }}>
        <ElementPage
          demoHeight={280}
          demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><Loader animation={animation} label={label} tick={tick} /></Box>}
          properties={
            <>
              <PropRow label="animation">
                <PropToggle<LoaderAnimation> label="Animation" value={animation} onChange={setAnimation} options={[['wave', 'wave'], ['pulse', 'pulse']]} />
              </PropRow>
              <PropRow label="label">
                <TextField size="small" value={label} onChange={(e) => setLabel(e.target.value)} inputProps={{ 'aria-label': 'Label' }} sx={{ width: 240 }} />
              </PropRow>
              <PropRow label="tick">
                <Button variant="outlined" startIcon={playing ? <Pause size={14} /> : <Play size={14} />} onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Resume'}</Button>
                <Button variant="outlined" disabled={playing} onClick={() => setTick(tick + 1)}>Step one tick</Button>
                              </PropRow>
            </>
          }
        />
      </Box>

    </>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function LoaderCard() {
  return <Loader />;
}
