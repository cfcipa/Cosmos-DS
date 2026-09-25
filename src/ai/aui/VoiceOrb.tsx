// Cosmos DS · Kit IA · AUI connected: Orb.
// Referente: assistant-ui «Orb» (elements/voice.tsx y voice.aui.tsx) sobre el «Voice orb» del kit: `AuiVoiceOrb` lee el
// estado y el volumen de la sesión de voz del runtime, y `AuiVoiceControl` conecta, silencia y cuelga.
import * as React from 'react';
import { AuiIf, useAuiState, useVoiceControls, useVoiceState, useVoiceVolume } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, type SxProps, type Theme } from '@mui/material/styles';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { VoiceOrb, type VoiceOrbProps, type VoiceOrbState } from '../voice-orb';
import { AuiIconButton } from './AuiIconButton';

export { VoiceOrb, type VoiceOrbProps, type VoiceOrbState, type VoiceOrbVariant } from '../voice-orb';

type VoiceState = ReturnType<typeof useVoiceState>;
export function deriveVoiceOrbState(voice: VoiceState): VoiceOrbState {
  if (!voice) return 'idle';
  if (voice.status.type === 'starting') return 'connecting';
  if (voice.status.type === 'ended') return 'idle';
  if (voice.isMuted) return 'muted';
  if (voice.mode === 'speaking') return 'speaking';
  return 'listening';
}

/** El orbe conectado: lee el estado y el volumen de la sesión de voz del runtime. */
export function AuiVoiceOrb({ state, ...rest }: VoiceOrbProps) {
  const voice = useVoiceState();
  const volume = useVoiceVolume();
  return <VoiceOrb state={state ?? deriveVoiceOrbState(voice)} volume={volume} {...rest} />;
}

const STATE_LABEL: Record<VoiceOrbState, string> = {
  idle: 'Sin conexión',
  connecting: 'Conectando…',
  listening: 'Escuchando',
  speaking: 'Hablando',
  muted: 'Micrófono en silencio',
};
const DOT = 1.25;
/** Controles de la llamada del tablero: botones de 34px con íconos de 20px; conectar con ícono de 16px. */
const CALL_BUTTON = 4.25;
const CALL_ICON = 20;
const CONNECT_ICON = 16;
const dotPulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: .4; }`;

export function AuiVoiceStatusDot() {
  const state = deriveVoiceOrbState(useVoiceState());
  const color = { idle: 'text.secondary', connecting: 'warning.main', listening: 'success.main', speaking: 'success.main', muted: 'error.main' }[state];
  return (
    <Box
      component="span"
      aria-hidden="true"
      data-state={state}
      sx={(t) => ({
        width: t.spacing(DOT), height: t.spacing(DOT), flexShrink: 0, borderRadius: '50%', bgcolor: color,
        transition: t.transitions.create('background-color', { duration: t.transitions.duration.standard }),
        animation: state === 'connecting' ? `${dotPulse} 1s ease-in-out infinite` : 'none',
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    />
  );
}

/** Alto mínimo de la barra de la llamada del tablero (44px), y sus márgenes: 14px a la izquierda, 6px a la derecha. */
const CONTROL_MIN_HEIGHT = 5.5;

/** La barra de la llamada (en su marco): punto de estado y conectar, o «Conectando…», o silenciar y colgar. */
export function AuiVoiceControl({ sx }: { sx?: SxProps<Theme> }) {
  const state = deriveVoiceOrbState(useVoiceState());
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      data-slot="aui-voice-control"
      sx={[(t) => ({ display: 'inline-flex', minHeight: t.spacing(CONTROL_MIN_HEIGHT), boxSizing: 'border-box', pl: 1.75, pr: 0.75, py: 0.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <AuiVoiceStatusDot />
      <Typography role="status" variant="body1" sx={{ whiteSpace: 'nowrap', mr: 0.5 }}>{STATE_LABEL[state]}</Typography>
      <AuiIf condition={(s) => s.thread.voice == null || s.thread.voice.status.type === 'ended'}><ConnectButton /></AuiIf>
      <AuiIf condition={(s) => s.thread.voice?.status.type === 'running'}>
        <MuteButton />
        <DisconnectButton />
      </AuiIf>
    </Stack>
  );
}

function ConnectButton() {
  const { connect } = useVoiceControls();
  const runOwnsThread = useAuiState((s) => s.thread.isRunning || s.thread.messages[s.thread.messages.length - 1]?.status?.type === 'requires-action');
  return <Button variant="contained" size="small" startIcon={<Phone size={CONNECT_ICON} />} disabled={runOwnsThread} onClick={() => connect()}>Conectar</Button>;
}

function MuteButton() {
  const voice = useVoiceState();
  const { mute, unmute } = useVoiceControls();
  const muted = voice?.isMuted ?? false;
  return (
    <AuiIconButton tooltip={muted ? 'Activar micrófono' : 'Silenciar'} aria-pressed={muted} size={CALL_BUTTON} onClick={() => (muted ? unmute() : mute())} sx={{ '& svg': { width: CALL_ICON, height: CALL_ICON } }}>
      {muted ? <MicOff /> : <Mic />}
    </AuiIconButton>
  );
}

function DisconnectButton() {
  const { disconnect } = useVoiceControls();
  return (
    <AuiIconButton tooltip="Desconectar" size={CALL_BUTTON} onClick={() => disconnect()} sx={{ color: 'error.main', '& svg': { width: CALL_ICON, height: CALL_ICON } }}>
      <PhoneOff />
    </AuiIconButton>
  );
}
