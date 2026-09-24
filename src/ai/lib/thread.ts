// Cosmos DS · Kit IA · Thread: piezas compartidas por los tableros del paquete Thread.
import { keyframes, type Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import { REDUCED_MOTION } from './shimmerText';

/** Entrada de los mensajes y del estado vacío en los tableros: sube 6px y aparece en 350 ms. */
const RISE_MS = 350;
const RISE_OFFSET = 6;
const rise = keyframes`from { opacity: 0; transform: translateY(${RISE_OFFSET}px); } to { opacity: 1; transform: none; }`;

export function riseSx(t: Theme, delayMs = 0): SystemStyleObject<Theme> {
  return {
    animation: `${rise} ${RISE_MS}ms ${t.transitions.easing.easeOut} both`,
    animationDelay: `${delayMs}ms`,
    [REDUCED_MOTION]: { animation: 'none' },
  };
}

/** La burbuja del usuario (la misma de Message pair). */
export function userBubbleSx(): SystemStyleObject<Theme> {
  return { alignSelf: 'flex-end', maxWidth: '78%', px: 2, py: 1.5, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText' };
}

/** El cursor del texto que se escribe en vivo. */
export const caretBlink = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0; }`;
