import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Pause, Play } from 'lucide-react';
import { Loader } from '../../src/ai/loader';
import type { LoaderAnimation } from '../../src/ai/loader';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { DocSection, Code, Token, PropsTable } from '../ui/DocParts';

const DEFAULTS = { animation: 'wave' as LoaderAnimation, label: 'Pensando' };
const ANATOMY = `<div role="status" aria-label={label}>
  <svg>          {/* isotipo Sinco · primary.main */}
    <path />     {/* mitad superior */}
    <path />     {/* mitad inferior */}
  </svg>
  <span />       {/* label · text.secondary, con brillo */}
</div>`;

/** Página del Loader: demo → uso → anatomía → tema → props. */
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

  // Solo lo que cambiaste respecto a los valores por defecto: se copia tal cual al producto.
  const attrs = [
    animation !== DEFAULTS.animation ? 'animation="' + animation + '"' : '',
    label !== DEFAULTS.label ? 'label="' + label + '"' : '',
  ].filter(Boolean);
  const snippet = "import { Loader } from '@sinco/cosmos-ds';\n\n<Loader" + (attrs.length ? ' ' + attrs.join(' ') : '') + ' />';

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

      <DocSection title="Uso">
        <Code>{snippet}</Code>
      </DocSection>

      <DocSection title="Anatomía">
        <Code>{ANATOMY}</Code>
      </DocSection>

      <DocSection title="Tema">
        <Box><Token path="primary.main" /><Token path="text.secondary" /><Token path="text.disabled" /></Box>
      </DocSection>

      <DocSection title="Props">
        <PropsTable rows={[
          { name: 'animation', type: "'wave' | 'pulse'", default: "'wave'", description: 'Cómo se anima el símbolo.' },
          { name: 'label', type: 'string', default: "'Pensando'", description: 'Texto bajo el símbolo y etiqueta accesible.' },
          { name: 'size', type: 'number', default: '44', description: 'Tamaño del símbolo en px.' },
          { name: 'tick', type: 'number', description: 'Controla la animación paso a paso. Solo pruebas.' },
        ]} />
      </DocSection>
    </>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function LoaderCard() {
  return <Loader />;
}
