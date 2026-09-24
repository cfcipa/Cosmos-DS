import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { MapAnswer } from '../../src/ai/map-answer';
import type { MapPin } from '../../src/ai/map-answer';
import { DemoBubble } from '../ui/DemoBubble';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Map».
const USER_MESSAGE = '¿Qué ruta hago hoy para recoger las facturas?';
const PINS: MapPin[] = [
  { id: 'of', label: 'Oficina central · Chapinero', detail: 'salida', x: 22, y: 68 },
  { id: 'on', label: 'Obra Torres del Norte', detail: '18 min', x: 48, y: 44 },
  { id: 'bf', label: 'Bodega Fontibón', detail: '35 min', x: 74, y: 26 },
];
const INTRO = 'Sal de la oficina y pasa por la obra antes que por la bodega; así recoges las tres facturas en 35 minutos.';
const EMPTY = 'No encontré obras con facturas pendientes para hoy.';
const OUTRO = 'En la obra, Nubia Rojas te entrega la factura FV-0932 del anticipo CE-4492.';
const COPIED_MS = 1500;

type Flag = 'true' | 'false';
type PinsMode = 'full' | 'empty';

export function MapAnswerDoc() {
  const [active, setActive] = React.useState('on');
  const [route, setRoute] = React.useState<Flag>('true');
  const [interactive, setInteractive] = React.useState<Flag>('true');
  const [mode, setMode] = React.useState<PinsMode>('full');
  const [copied, setCopied] = React.useState(false);
  const [log, setLog] = React.useState('');
  const timer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const pins = mode === 'empty' ? [] : PINS;
  const select = (id: string) => { setActive(id); setLog(`onSelect("${id}")`); };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={
          <Box sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <DemoBubble>{USER_MESSAGE}</DemoBubble>
              <Stack spacing={1.5}>
                <Typography variant="body1">{pins.length ? INTRO : EMPTY}</Typography>
                <MapAnswer pins={pins} activeId={active} route={route === 'true'} onSelect={interactive === 'true' ? select : undefined} />
                {pins.length ? <Typography variant="body1">{OUTRO}</Typography> : null}
                <Stack direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
                  <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
                    <IconButton
                      aria-label="Copiar"
                      sx={copied ? { color: 'success.main' } : undefined}
                      onClick={() => {
                        navigator.clipboard?.writeText(INTRO).catch(() => undefined);
                        setCopied(true);
                        window.clearTimeout(timer.current);
                        timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
                      }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Regenerar">
                    <IconButton aria-label="Regenerar" onClick={() => { setMode('full'); setActive(PINS[0].id); setLog('new result → activeId resets to pins[0]'); }}>
                      <RefreshCw size={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="route">
              <PropToggle<Flag> label="route" value={route} onChange={setRoute} options={[['true', 'true'], ['false', 'false']]} />
            </PropRow>
            <PropRow label="onSelect">
              <PropToggle<Flag> label="onSelect" value={interactive} onChange={(v) => { setInteractive(v); setLog(''); }} options={[['true', 'setActiveId'], ['false', 'undefined']]} />
              <Typography variant="body3" color="text.secondary" noWrap>
                {interactive === 'true' ? log || 'marker and row both call it' : 'no handler → static map content'}
              </Typography>
            </PropRow>
            <PropRow label="pins">
              <PropToggle<PinsMode> label="pins" value={mode} onChange={(v) => { setMode(v); setActive(v === 'empty' ? '' : PINS[0].id); }} options={[['full', '3 pins'], ['empty', 'empty []']]} />
              <Typography variant="body3" color="text.secondary" noWrap sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{`activeId="${active}"`}</Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function MapAnswerCard() {
  return <Box sx={{ width: '100%' }}><MapAnswer pins={PINS} activeId="on" /></Box>;
}
