// Cosmos DS · Kit IA · Messages: Message pair.
// Tablero aprobado «Message pair»: una burbuja del usuario y una respuesta que llega en vivo,
// con acciones que aparecen al pasar el cursor. Colores y tipografía salen del tema.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { keyframes } from '@mui/material/styles';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type MessagePairVariant = 'bubble' | 'flat';

export interface MessagePairProps {
  /** El mensaje del usuario. */
  userMessage: string;
  /** La respuesta completa del asistente. */
  response: string;
  /** Palabras visibles de la respuesta. Sin él, se muestran todas. */
  visibleWords?: number;
  /** Mientras llega: las 2 palabras más nuevas en azul, el punto parpadeando y Regenerar desactivado. Default false. */
  streaming?: boolean;
  /** 'bubble' (el mensaje del usuario sobre su burbuja) o 'flat' (solo texto, alineado a la derecha). Default 'bubble'. */
  variant?: MessagePairVariant;
  /** Se llama con el texto visible al copiar. Sin él, se copia al portapapeles. */
  onCopy?: (text: string) => void;
  onRegenerate?: () => void;
  className?: string;
}

/** Medidas y tiempos del tablero. */
const USER_MAX_WIDTH = 340;
const ACTION_SIZE = 32;
const ICON_SIZE = 16;
/** Cuánto se queda el check después de copiar. */
const COPIED_MS = 3000;
const FRESH_WORDS = 2;
const SETTLE_TRANSITION = 'color 700ms ease-out';

const blink = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0; }`;

export function MessagePair({
  userMessage,
  response,
  visibleWords,
  streaming = false,
  variant = 'bubble',
  onCopy,
  onRegenerate,
  className,
}: MessagePairProps) {
  const words = React.useMemo(() => response.split(' ').filter(Boolean), [response]);
  const visibleCount = Math.max(0, Math.min(words.length, visibleWords ?? words.length));
  const visibleText = words.slice(0, visibleCount).join(' ');
  const [isCopied, setIsCopied] = React.useState(false);
  const copiedTimer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  const copyResponse = () => {
    if (onCopy) onCopy(visibleText);
    else navigator.clipboard?.writeText(visibleText).catch(() => undefined);
    window.clearTimeout(copiedTimer.current);
    setIsCopied(true);
    copiedTimer.current = window.setTimeout(() => setIsCopied(false), COPIED_MS);
  };

  const isBubble = variant === 'bubble';

  return (
    <Stack spacing={2} className={className} sx={{ width: '100%' }}>
      <Box
        sx={(t) => ({
          alignSelf: 'flex-end',
          maxWidth: USER_MAX_WIDTH,
          ...t.typography.body1,
          color: 'ai.userBubbleText',
          ...(isBubble ? { px: 2, py: 1.5, borderRadius: 1, bgcolor: 'ai.userBubble' } : { textAlign: 'right' }),
        })}
      >
        {userMessage}
      </Box>

      <Stack
        spacing={1}
        sx={{
          minHeight: 68,
          // Las acciones se ocultan hasta pasar el cursor o llegar con Tab (autohide «always»).
          '& [data-slot="message-actions"]': { opacity: 0, transition: 'opacity .15s' },
          '&:hover [data-slot="message-actions"], &:focus-within [data-slot="message-actions"]': { opacity: 1 },
          [REDUCED_MOTION]: { '& [data-slot="message-actions"]': { transition: 'none' } },
        }}
      >
        <Box component="p" sx={(t) => ({ m: 0, ...t.typography.body1, color: 'text.primary' })}>
          {words.slice(0, visibleCount).map((word, index) => {
            const isFresh = streaming && index >= visibleCount - FRESH_WORDS;
            return (
              <Box
                key={index}
                component="span"
                sx={{ color: isFresh ? 'primary.main' : 'text.primary', transition: SETTLE_TRANSITION, [REDUCED_MOTION]: { transition: 'none' } }}
              >
                {`${word} `}
              </Box>
            );
          })}
          {streaming ? (
            <Box
              component="span"
              aria-hidden="true"
              sx={{ color: 'primary.main', fontSize: 10, verticalAlign: 2, animation: `${blink} 1s steps(2) infinite`, [REDUCED_MOTION]: { animation: 'none' } }}
            >
              ●
            </Box>
          ) : null}
        </Box>

        <Stack data-slot="message-actions" direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
          <Tooltip title="Copiar">
            <span>
              <IconButton
                aria-label="Copiar respuesta"
                disabled={visibleCount === 0}
                onClick={copyResponse}
                sx={{ width: ACTION_SIZE, height: ACTION_SIZE, ...(isCopied ? { color: 'success.main' } : null) }}
              >
                {isCopied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Regenerar">
            <span>
              <IconButton aria-label="Regenerar respuesta" disabled={streaming} onClick={onRegenerate} sx={{ width: ACTION_SIZE, height: ACTION_SIZE }}>
                <RefreshCw size={ICON_SIZE} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
}
