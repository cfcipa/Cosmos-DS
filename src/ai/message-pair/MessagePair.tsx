// Cosmos DS · Kit IA · Messages: Message pair.
// Tablero aprobado «Message pair»: una burbuja del usuario y una respuesta que llega en vivo,
// con acciones que aparecen al pasar el cursor. Colores y tipografía salen del tema.
// Como en assistant-ui: las acciones se ocultan hasta pasar el cursor o llegar con Tab (autohide «always»),
// y la respuesta reserva su alto para que las acciones no salten mientras llega.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { STREAMING_BLINK, STREAMING_FRESH_WORDS, streamingWordSx } from '../streaming-text/StreamingText';

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

const ICON_SIZE = 16;
/** Cuánto se queda el check después de copiar. */
const COPIED_MS = 3000;
/** Líneas que reserva la respuesta mientras llega (min-h de la referencia). */
const RESERVED_LINES = 3;

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
    <Stack spacing={2} className={className} data-slot="message-pair" sx={{ width: '100%' }}>
      <Typography
        variant="body1"
        component="div"
        sx={{
          alignSelf: 'flex-end',
          maxWidth: '85%',
          color: 'ai.userBubbleText',
          ...(isBubble ? { px: 2, py: 1.5, borderRadius: 1, bgcolor: 'ai.userBubble' } : { textAlign: 'right' }),
        }}
      >
        {userMessage}
      </Typography>

      <Stack
        spacing={1}
        sx={(t) => ({
          '& [data-slot="message-pair-actions"]': { opacity: 0, transition: t.transitions.create('opacity', { duration: t.transitions.duration.shortest }) },
          '&:hover [data-slot="message-pair-actions"], &:focus-within [data-slot="message-pair-actions"]': { opacity: 1 },
          [REDUCED_MOTION]: { '& [data-slot="message-pair-actions"]': { transition: 'none' } },
        })}
      >
        <Typography
          variant="body1"
          sx={(t) => ({ minHeight: `calc(${t.typography.body1.lineHeight} * ${RESERVED_LINES})` })}
        >
          {words.slice(0, visibleCount).map((word, index) => {
            const isFresh = streaming && index >= visibleCount - STREAMING_FRESH_WORDS;
            return (
              <Box key={index} component="span" sx={(t) => streamingWordSx(t, isFresh)}>
                {`${word} `}
              </Box>
            );
          })}
          {streaming ? (
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-block',
                width: (t) => t.spacing(0.75),
                height: (t) => t.spacing(0.75),
                borderRadius: '50%',
                bgcolor: 'primary.main',
                verticalAlign: 'middle',
                animation: STREAMING_BLINK,
                [REDUCED_MOTION]: { animation: 'none' },
              }}
            />
          ) : null}
        </Typography>

        <Stack data-slot="message-pair-actions" direction="row" spacing={0.25} sx={{ ml: -0.75 }}>
          <Tooltip title={isCopied ? 'Copiado' : 'Copiar'}>
            <span>
              <IconButton
                aria-label={isCopied ? 'Copiado' : 'Copiar respuesta'}
                disabled={visibleCount === 0}
                onClick={copyResponse}
                sx={isCopied ? { color: 'success.main' } : undefined}
              >
                {isCopied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Regenerar">
            <span>
              <IconButton aria-label="Regenerar respuesta" disabled={streaming} onClick={onRegenerate}>
                <RefreshCw size={ICON_SIZE} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
}
