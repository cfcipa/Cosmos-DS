// Cosmos DS · Kit IA · Voice: Voice orb.
// Tablero «Orb»: una esfera de degradado radial, desenfocada, que gira despacio y crece con el volumen; en reposo es
// pequeña y tenue, conectando late, en silencio se atenúa. Los colores salen del tema (default = grises, o una paleta:
// primary, secondary, success). Es el centro de «Voice conversation» y del orbe conectado (`AuiVoiceOrb`).
import * as React from 'react';
import Box from '@mui/material/Box';
import { keyframes, type SxProps, type Theme } from '@mui/material/styles';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type VoiceOrbState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'muted';
export type VoiceOrbVariant = 'default' | 'primary' | 'secondary' | 'success';

/** Medidas del tablero: la caja de 150px; la esfera se recoge a 30px del borde en reposo y a 12px en llamada; el
 * reflejo va a 22px. Desenfoque de 2px en reposo y de 4 a 10px según el volumen; crece hasta un 18 %. */
const ORB_BOX = 150;
/** Los márgenes, como parte de la caja, para que el orbe pueda ir de otro tamaño (`size`). */
const INSET_IDLE = `${(30 / ORB_BOX) * 100}%`;
const INSET_LIVE = `${(12 / ORB_BOX) * 100}%`;
const INSET_GLOW = `${(22 / ORB_BOX) * 100}%`;
const BLUR_IDLE = 2;
const BLUR_LIVE = 4;
const BLUR_VOLUME = 6;
const SCALE_VOLUME = 0.18;
const OPACITY_IDLE = 0.35;
const OPACITY_MUTED = 0.5;
const GLOW_OPACITY = 0.6;

const spin = keyframes`to { transform: rotate(360deg); }`;
const breathe = keyframes`0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); }`;

/** Tres tonos por variante: claro, medio y oscuro, del tema. */
function variantColors(t: Theme, variant: VoiceOrbVariant): [string, string, string] {
  if (variant === 'default') return [t.palette.grey[300], t.palette.grey[500], t.palette.grey[700]];
  const p = t.palette[variant];
  return [p.light, p.main, p.dark];
}

export interface VoiceOrbProps {
  state?: VoiceOrbState;
  /** Volumen de 0 a 1. */
  volume?: number;
  variant?: VoiceOrbVariant;
  /** El lado de la caja, en px. Default 150 (tablero). */
  size?: number;
  className?: string;
  sx?: SxProps<Theme>;
}

/** El orbe sin runtime: estado y volumen por props. */
export const VoiceOrb = React.memo(function VoiceOrb({ state = 'idle', volume = 0, variant = 'default', size = ORB_BOX, className, sx }: VoiceOrbProps) {
  const idle = state === 'idle';
  const v = Math.min(1, Math.max(0, volume));
  return (
    <Box
      aria-hidden="true"
      data-slot="aui-voice-orb"
      data-state={state}
      className={className}
      sx={[{ position: 'relative', width: size, height: size, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        component="span"
        sx={(t) => {
          const [c1, c2, c3] = variantColors(t, variant);
          return {
            position: 'absolute', inset: idle ? INSET_IDLE : INSET_LIVE, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${c1} 0%, ${c2} 45%, ${c3} 100%)`,
            filter: `blur(${idle ? BLUR_IDLE : BLUR_LIVE + v * BLUR_VOLUME}px)`,
            opacity: idle ? OPACITY_IDLE : state === 'muted' ? OPACITY_MUTED : 1,
            transform: `scale(${1 + v * SCALE_VOLUME})`,
            transition: `transform ${t.transitions.duration.shortest}ms ease-out, inset ${t.transitions.duration.standard}ms, opacity ${t.transitions.duration.standard}ms`,
            animation: state === 'connecting' ? `${breathe} 1.2s ease-in-out infinite` : `${spin} 8s linear infinite`,
            [REDUCED_MOTION]: { animation: 'none', transition: 'none' },
          };
        }}
      />
      <Box
        component="span"
        sx={(t) => {
          const [, c2] = variantColors(t, variant);
          return {
            position: 'absolute', inset: INSET_GLOW, borderRadius: '50%',
            background: `radial-gradient(circle at 60% 70%, ${c2} 0%, transparent 70%)`,
            opacity: GLOW_OPACITY, mixBlendMode: 'multiply',
            animation: idle ? 'none' : `${spin} 5s linear infinite reverse`,
            [REDUCED_MOTION]: { animation: 'none' },
          };
        }}
      />
    </Box>
  );
});

