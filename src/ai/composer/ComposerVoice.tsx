// Cosmos DS · Kit IA · Composer: Dictation.
// Tablero «Dictation»: el micrófono convierte la entrada en una onda en vivo y luego deja la transcripción como texto.
// Como en assistant-ui (ComposerVoice + ComposerVoiceButton): mientras graba, un punto late, 14 barras siguen la voz y corre
// el reloj; al detener, «Transcribiendo…» y la transcripción queda en el texto del composer.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { Mic, Square } from 'lucide-react';
import { REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';

const BARS = Array.from({ length: 14 }, (_, i) => i);
/** Alto de cada barra (px) según el tiempo: la onda del tablero. */
const barHeight = (bar: number, tick: number) => Math.round(6 + Math.abs(Math.sin(bar * 1.7 + tick * 0.9)) * 20);
const IDLE_BAR = 4;
const pulse = keyframes`0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); }`;

export interface ComposerVoiceProps {
  /** Grabando; en false, transcribiendo. */
  recording: boolean;
  /** Tiempo grabado. */
  elapsedMs: number;
  /** Default 'Transcribiendo…'. */
  transcribingLabel?: string;
}

export function ComposerVoice({ recording, elapsedMs, transcribingLabel = 'Transcribiendo…' }: ComposerVoiceProps) {
  const tick = Math.floor(elapsedMs / 100);
  const seconds = Math.floor(elapsedMs / 1000);
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} role="status" aria-live="polite" data-slot="composer-voice" sx={(t) => ({ height: t.spacing(5.5) })}>
      {recording ? (
        <Box aria-hidden="true" sx={(t) => ({ width: t.spacing(1), height: t.spacing(1), flexShrink: 0, borderRadius: '50%', bgcolor: 'error.main', animation: `${pulse} 1.2s ease-in-out infinite`, [REDUCED_MOTION]: { animation: 'none' } })} />
      ) : null}
      <Stack direction="row" alignItems="center" aria-hidden="true" sx={(t) => ({ flexGrow: 1, height: t.spacing(3.5), gap: '3px' })}>
        {BARS.map((bar) => (
          <Box
            key={bar}
            component="span"
            sx={(t) => ({
              width: '3px',
              height: recording ? barHeight(bar, tick) : IDLE_BAR,
              borderRadius: 0.5,
              bgcolor: recording ? 'primary.main' : 'text.disabled',
              transition: t.transitions.create('height', { duration: 120, easing: t.transitions.easing.easeOut }),
              [REDUCED_MOTION]: { transition: 'none' },
            })}
          />
        ))}
      </Stack>
      {recording ? (
        <>
          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{`0:${String(seconds).padStart(2, '0')}`}</Typography>
          <Box component="span" sx={visuallyHidden}>Grabando</Box>
        </>
      ) : (
        <Typography variant="body2" component="span" sx={(t) => shimmerTextSx(t)}>{transcribingLabel}</Typography>
      )}
    </Stack>
  );
}

/** Micrófono: en reposo, IconButton; grabando, detener en rojo (tablero). */
export function ComposerVoiceButton({ active, onClick, disabled }: { active: boolean; onClick: () => void; disabled?: boolean }) {
  const label = active ? 'Detener el dictado' : 'Dictar';
  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          sx={active ? { bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } } : undefined}
        >
          {/* Mismo cuadro para las dos glifos: el botón no cambia de tamaño al empezar a grabar. */}
          <Box component="span" aria-hidden="true" sx={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {active ? <Square size={12} fill="currentColor" /> : <Mic size={18} />}
          </Box>
        </IconButton>
      </span>
    </Tooltip>
  );
}
