// Cosmos DS · Kit IA · Thread: Canvas.
// Tablero «Canvas»: el hilo se hace a un lado y el documento ocupa el espacio, todavía escribiéndose mientras lo lees.
// Como en assistant-ui: piezas componibles (hilo, documento, encabezado y cuerpo). El encabezado muestra la versión y si
// ya se guardó; Copiar confirma con un check 1,5 s y Cerrar quita el documento: el hilo recupera todo el ancho.
// Mientras `writing`, el cuerpo avisa aria-busy y el cursor parpadea al final de la última línea.
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, type SxProps, type Theme } from '@mui/material/styles';
import { Check, CircleCheck, Copy, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { caretBlink, userBubbleSx } from '../lib/thread';

interface SlotProps { children?: React.ReactNode; className?: string; sx?: SxProps<Theme> }

/** Medidas del tablero. */
const HEIGHT = 340;
const THREAD_WIDTH = 200;
const HEADER_HEIGHT = 60;
const COPIED_MS = 1500;
const ICON_SIZE = 20;
const STATUS_ICON_SIZE = 16;
const STATUS_SPINNER_SIZE = 14;

const fadein = keyframes`from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; }`;

export function CanvasSplit({ children, className, sx }: SlotProps) {
  return (
    <Paper
      variant="outlined"
      data-slot="canvas-split"
      className={className}
      sx={[{ width: '100%', height: HEIGHT, display: 'flex', overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Paper>
  );
}

/** El hilo, a la izquierda. Sin documento al lado ocupa todo el ancho. */
export function CanvasSplitThread({ children, className, sx }: SlotProps) {
  return (
    <Box
      data-slot="canvas-split-thread"
      className={className}
      sx={[(t) => ({
        width: THREAD_WIDTH,
        flexShrink: 0,
        boxSizing: 'border-box',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'auto',
        transition: t.transitions.create('width', { duration: t.transitions.duration.shorter }),
        '&:only-child': { width: '100%', borderRight: 0 },
        [REDUCED_MOTION]: { transition: 'none' },
      }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  );
}

export function CanvasSplitMessage({ speaker, children, className }: SlotProps & { speaker: 'user' | 'assistant' }) {
  return (
    <Typography
      variant="body1"
      component="div"
      data-slot="canvas-split-message"
      data-speaker={speaker}
      className={className}
      sx={speaker === 'user' ? { ...userBubbleSx(), maxWidth: '100%' } : undefined}
    >
      {children}
    </Typography>
  );
}

export function CanvasSplitDocument({ children, className }: SlotProps) {
  return (
    <Box data-slot="canvas-split-document" className={className} sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {children}
    </Box>
  );
}

export interface CanvasSplitHeaderProps {
  title: string;
  version: number;
  saved: boolean;
  onCopy?: () => void;
  onClose?: () => void;
  className?: string;
}

export function CanvasSplitHeader({ title, version, saved, onCopy, onClose, className }: CanvasSplitHeaderProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = () => {
    onCopy?.();
    window.clearTimeout(timer.current);
    setCopied(true);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      data-slot="canvas-split-header"
      className={className}
      sx={{ height: HEADER_HEIGHT, flexShrink: 0, boxSizing: 'border-box', pl: 2, pr: 1, borderBottom: 1, borderColor: 'divider' }}
    >
      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>{title}</Typography>
        <Stack role="status" direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.25, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Chip size="small" label={`v${version}`} />
          {saved ? (
            <Typography variant="body3" sx={(t) => ({ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: t.typography.fontWeightMedium, color: 'success.main', animation: `${fadein} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`, [REDUCED_MOTION]: { animation: 'none' } })}>
              <CircleCheck size={STATUS_ICON_SIZE} aria-hidden="true" />Guardado
            </Typography>
          ) : (
            <Typography variant="body3" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <CircularProgress size={STATUS_SPINNER_SIZE} aria-hidden="true" />Guardando…
            </Typography>
          )}
        </Stack>
      </Stack>
      <IconButton aria-label={copied ? 'Copiado' : 'Copiar el documento'} onClick={copy} disabled={!onCopy}>
        {copied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
      </IconButton>
      <IconButton aria-label="Cerrar el documento" onClick={onClose} disabled={!onClose}>
        <X size={ICON_SIZE} />
      </IconButton>
    </Stack>
  );
}

export function CanvasSplitBody({ writing = false, children, className }: SlotProps & { writing?: boolean }) {
  return (
    <Stack
      spacing={1}
      aria-busy={writing}
      data-slot="canvas-split-body"
      className={className}
      sx={(t) => ({
        flexGrow: 1,
        overflowY: 'auto',
        p: 2,
        ...(writing ? {
          '& > [data-slot="canvas-split-line"]:last-of-type::after': {
            content: '""',
            display: 'inline-block',
            width: '2px',
            height: t.spacing(2),
            ml: 0.25,
            verticalAlign: 'text-bottom',
            bgcolor: 'primary.main',
            animation: `${caretBlink} 1s steps(2) infinite`,
            [REDUCED_MOTION]: { animation: 'none' },
          },
        } : null),
      })}
    >
      {children}
    </Stack>
  );
}

export function CanvasSplitLine({ heading = false, children, className }: SlotProps & { heading?: boolean }) {
  return (
    <Typography
      variant="body1"
      data-slot="canvas-split-line"
      className={className}
      sx={(t) => ({ m: 0, fontWeight: heading ? t.typography.fontWeightMedium : undefined, color: heading ? 'text.primary' : 'text.secondary' })}
    >
      {children}
    </Typography>
  );
}
