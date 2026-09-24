// Cosmos DS · Kit IA · Thread: piezas compartidas por los elementos del paquete Thread.
// Superficies como en assistant-ui (surfaces.tsx): `paper` = Paper outlined, `field` = relleno neutro,
// `ink` = el botón relleno (primary en Cosmos), `mono` = la meta en caption.
import { keyframes, type Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import { REDUCED_MOTION } from './shimmerText';

/** Entrada de assistant-ui (fade-in + slide-in-from-bottom): sube 6px y aparece en 300 ms. */
const RISE_OFFSET = 6;
const rise = keyframes`from { opacity: 0; transform: translateY(${RISE_OFFSET}px); } to { opacity: 1; transform: none; }`;

export function riseSx(t: Theme, delayMs = 0): SystemStyleObject<Theme> {
  return {
    animation: `${rise} ${t.transitions.duration.standard}ms ${t.transitions.easing.easeOut} both`,
    animationDelay: `${delayMs}ms`,
    [REDUCED_MOTION]: { animation: 'none' },
  };
}

/** `field` de assistant-ui: la superficie rellena neutra (campos, burbujas, prompts). */
export function fieldSx(): SystemStyleObject<Theme> {
  return { bgcolor: 'action.hover' };
}

/** `field` interactivo: se oscurece un paso al pasar el cursor. */
export function fieldInteractiveSx(t: Theme): SystemStyleObject<Theme> {
  return {
    bgcolor: 'action.hover',
    transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
    '&:hover': { bgcolor: 'action.selected' },
    [REDUCED_MOTION]: { transition: 'none' },
  };
}

/** La burbuja del usuario (el color del kit, las medidas compactas de assistant-ui). */
export function userBubbleSx(): SystemStyleObject<Theme> {
  return { alignSelf: 'flex-end', maxWidth: '85%', px: 1.5, py: 0.75, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText' };
}

/** El cursor del texto que se escribe en vivo. */
export const caretBlink = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0; }`;
