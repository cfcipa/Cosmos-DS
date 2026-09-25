// Cosmos DS · Kit IA · Voice: Voice conversation.
// Tablero «Voice conversation»: una llamada en vivo; el orbe sigue tu voz, el rótulo nombra el turno y la transcripción lo acompaña.
// Como en assistant-ui: cuatro modos (conectando, escuchando, pensando, hablando); el centro es el «Voice orb» del kit
// (respira, gira y crece con la voz) y los anillos siguen la amplitud mientras escucha o habla; mientras el asistente habla, tocar el orbe lo interrumpe (solo con onInterrupt). El micrófono se
// silencia y la llamada se termina desde los dos botones; terminada, se puede volver a llamar.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { paletteScale } from '../lib/paletteScale';
import { REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';
import { VoiceOrb, type VoiceOrbState } from '../voice-orb';

export type VoiceMode = 'connecting' | 'listening' | 'thinking' | 'speaking';

export interface VoiceTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Todavía se está diciendo: va en cursiva, en gris y con «…». */
  interim?: boolean;
}

export interface VoiceConversationProps {
  mode: VoiceMode;
  /** Nivel de la voz, de 0 a 1. */
  amplitude: number;
  transcript: readonly VoiceTurn[];
  muted?: boolean;
  /** La llamada terminó: el orbe se apaga y aparece «Llamar de nuevo». */
  ended?: boolean;
  onToggleMute?: () => void;
  onInterrupt?: () => void;
  onEnd?: () => void;
  onRestart?: () => void;
  className?: string;
}

const CAPTION: Record<VoiceMode, string> = { connecting: 'Conectando', listening: 'Escuchando', thinking: 'Pensando', speaking: 'Hablando' };
/** Medidas del tablero, en la escala de spacing: el orbe y sus capas. */
const ORB = 15;
const RING_INSET = 2;
/** El orbe del kit cabe en el anillo interior: el tamaño de la caja menos su margen. */
const CORE_INSET = 2.5;
const ICON_SIZE = 18;
/** Ancho de la columna de quién habla en la transcripción. */
const WHO_WIDTH = 8;

const rise = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;

export function VoiceConversation({ mode, amplitude, transcript, muted = false, ended = false, onToggleMute, onInterrupt, onEnd, onRestart, className }: VoiceConversationProps) {
  const level = Math.max(0, Math.min(1, amplitude));
  const active = (mode === 'listening' || mode === 'speaking') && !ended;
  const canInterrupt = mode === 'speaking' && !ended && Boolean(onInterrupt);
  const waiting = (mode === 'connecting' || mode === 'thinking') && !ended;
  const caption = ended ? 'Llamada terminada' : muted ? 'Micrófono apagado' : CAPTION[mode];
  const orbState: VoiceOrbState = ended ? 'idle' : muted ? 'muted' : mode === 'thinking' ? 'connecting' : mode;
  const transcriptRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { const el = transcriptRef.current; if (el) el.scrollTop = el.scrollHeight; }, [transcript]);

  const ring = (inset: number, opacity: number, grow: number) => (
    <Box
      component="span"
      aria-hidden="true"
      sx={(t) => ({
        position: 'absolute',
        inset: t.spacing(inset),
        borderRadius: '50%',
        border: 2,
        borderColor: mode === 'speaking' ? 'primary.main' : paletteScale(t, 'primary', 400),
        opacity,
        transform: `scale(${active ? 1 + level * grow : 0.92})`,
        transition: t.transitions.create('transform', { duration: 100, easing: t.transitions.easing.easeOut }),
        [REDUCED_MOTION]: { transition: 'none' },
      })}
    />
  );

  return (
    <Stack alignItems="center" spacing={1.5} className={className} data-slot="voice-conversation" sx={{ width: '100%', height: '100%' }}>
      <ButtonBase
        disabled={!canInterrupt}
        onClick={onInterrupt}
        aria-label="Interrumpir al asistente"
        sx={(t) => ({ position: 'relative', width: t.spacing(ORB), height: t.spacing(ORB), flexShrink: 0, borderRadius: '50%', '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 } })}
      >
        {ring(0, 0.35, 0.12)}
        {ring(RING_INSET, 0.6, 0.22)}
        <VoiceOrb
          state={orbState}
          volume={active ? level : 0}
          variant={ended ? 'default' : 'primary'}
          sx={(t) => ({ position: 'absolute', inset: t.spacing(CORE_INSET), width: 'auto', height: 'auto' })}
        />
      </ButtonBase>

      <Typography
        variant="subtitle1"
        role="status"
        aria-live="polite"
        color={muted && !ended ? 'error.main' : 'text.primary'}
        sx={(t) => (waiting && !muted ? shimmerTextSx(t) : {})}
      >
        {caption}
      </Typography>

      <Stack ref={transcriptRef} aria-label="Transcripción" spacing={1} sx={{ width: '100%', flexGrow: 1, minHeight: 0, overflowY: 'auto', py: 0.5 }}>
        {transcript.map((turn) => (
          <Stack
            key={turn.id}
            direction="row"
            spacing={1}
            sx={(t) => ({ animation: `${rise} ${t.transitions.duration.complex}ms ${t.transitions.easing.easeOut} both`, [REDUCED_MOTION]: { animation: 'none' } })}
          >
            <Typography variant="body3" color="text.secondary" sx={(t) => ({ width: t.spacing(WHO_WIDTH), flexShrink: 0 })}>
              {turn.role === 'user' ? 'Tú' : 'Asistente'}
            </Typography>
            <Typography variant="body2" color={turn.interim ? 'text.secondary' : 'text.primary'} sx={turn.interim ? { fontStyle: 'italic' } : undefined}>
              {turn.interim ? `${turn.text}…` : turn.text}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title={muted ? 'Encender el micrófono' : 'Apagar el micrófono'}>
          <span>
            <IconButton
              size="large"
              aria-label="Micrófono"
              aria-pressed={muted}
              disabled={ended || !onToggleMute}
              onClick={onToggleMute}
              sx={(t) => ({
                border: 1,
                borderColor: 'divider',
                ...(muted ? { bgcolor: alpha(t.palette.error.main, t.palette.action.hoverOpacity * 2), color: 'error.main', '&:hover': { bgcolor: alpha(t.palette.error.main, t.palette.action.hoverOpacity * 3) } } : { color: 'text.primary' }),
              })}
            >
              {muted ? <MicOff size={ICON_SIZE} /> : <Mic size={ICON_SIZE} />}
            </IconButton>
          </span>
        </Tooltip>
        {ended ? (
          onRestart ? <Button variant="contained" size="large" onClick={onRestart} sx={{ borderRadius: 6 }}>Llamar de nuevo</Button> : null
        ) : (
          <Tooltip title="Terminar la llamada">
            <span>
              <IconButton
                size="large"
                aria-label="Terminar la llamada"
                disabled={!onEnd}
                onClick={onEnd}
                sx={{ bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } }}
              >
                <PhoneOff size={ICON_SIZE} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
