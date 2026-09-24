import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Pause, Play } from 'lucide-react';
import { Loader } from '../../src/ai/loader';
import type { LoaderAnimation } from '../../src/ai/loader';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { DocSection, Code, Facts, Token, PropsTable } from '../ui/DocParts';

const DEFAULTS = { animation: 'wave' as LoaderAnimation, label: 'Pensando' };

/** Página del Loader: probar → usar en tu producto → cómo está hecho → guía → props. */
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
              <PropRow label="Revisar cuadro a cuadro">
                <Button variant="outlined" startIcon={playing ? <Pause size={14} /> : <Play size={14} />} onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Resume'}</Button>
                <Button variant="outlined" disabled={playing} onClick={() => setTick(tick + 1)}>Step one tick</Button>
                <Typography variant="caption" color="text.secondary">Solo para revisar la animación; no va al producto.</Typography>
              </PropRow>
            </>
          }
        />
      </Box>

      <DocSection title="Usar en tu producto" lead="Se actualiza con lo que pruebes arriba. Cópialo tal cual: el producto no arma nada con MUI, solo usa el componente.">
        <Code>{snippet}</Code>
      </DocSection>

      <DocSection title="Cómo está hecho" lead="Para quien lo va a ajustar. Un cambio aquí llega a todos los productos.">
        <Facts rows={[
          ['Archivo', <Box component="code" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.primary' }}>src/ai/loader/Loader.tsx</Box>],
          ['Piezas de MUI', <>
            <b>Box</b> para el contenedor y el SVG, y <b>keyframes</b> del sistema de estilos de MUI para el brillo del texto. No usa CircularProgress:
            el símbolo es el isotipo de Sinco, en dos mitades que se animan por separado.
          </>],
          ['Valores del tema', <><Token path="primary.main" /><Token path="text.secondary" /><Token path="text.disabled" /><br />
            Símbolo en <b>primary.main</b>; texto en <b>text.secondary</b> con el brillo hacia <b>text.disabled</b>. Salen de ThemeCOSMOS.json: si Figma cambia el primary, el Loader cambia solo.</>],
          ['Medidas', 'Símbolo de 44 px, 16 px entre símbolo y texto, texto de 13/18 px en peso 500.'],
          ['Animación', 'Cada tick dura 120 ms. wave: cada 4 ticks se alterna la mitad encendida (opacidad 1 ↔ 0,2). pulse: las dos mitades respiran juntas (opacidad 0,35–1) y el símbolo escala entre 0,92 y 1. Transiciones de 360 ms ease-in-out.'],
        ]} />
      </DocSection>

      <DocSection title="Guía">
        <Facts rows={[
          ['Cuándo usarlo', 'Mientras el modelo todavía no tiene nada que mostrar: entre que el usuario envía y llega lo primero.'],
          ['Cuándo no', <>Si ya sabes qué está haciendo el asistente («Consultando anticipos»), usa <b>Thinking indicator</b>.
            Cuando empieza a llegar texto, <b>Streaming text</b>. Para tres puntos donde aparecerá la respuesta, <b>Typing indicator</b>. Para cargas normales de la aplicación, el progreso de MUI.</>],
          ['wave o pulse', <><b>wave</b> es la opción por defecto del tablero. <b>pulse</b> es la alternativa. <Box component="span" sx={{ color: 'warning.main' }}>Pendiente: definir cuándo usar cada una.</Box></>],
          ['Texto', 'El del tablero es «Pensando». El lector de pantalla lo anuncia (role="status").'],
          ['Accesibilidad', 'Con «reducir movimiento» activo en el sistema, el símbolo queda fijo y el texto sin brillo.'],
        ]} />
      </DocSection>

      <DocSection title="Props">
        <PropsTable rows={[
          { name: 'animation', type: "'wave' | 'pulse'", default: "'wave'", description: 'Cómo se anima el símbolo.' },
          { name: 'label', type: 'string', default: "'Pensando'", description: 'Texto bajo el símbolo; también es lo que anuncia el lector de pantalla.' },
          { name: 'size', type: 'number', default: '44', description: 'Tamaño del símbolo en px.' },
          { name: 'tick', type: 'number', description: 'Solo para pruebas: controla la animación paso a paso. En el producto no se usa.' },
        ]} />
      </DocSection>
    </>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function LoaderCard() {
  return <Loader />;
}
