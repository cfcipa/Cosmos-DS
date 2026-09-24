// Cosmos DS · Kit IA · Thread: Canvas.
// Referente: assistant-ui «Canvas split» (elements/canvas-split.tsx): el hilo se hace a un lado y el documento ocupa
// el espacio, todavía escribiéndose. Encabezado de una línea: ícono, título, versión, «editando/guardado», copiar y
// cerrar (desactivados sin su callback; Copiar confirma con un check 1,5 s). Cada línea entra con un leve ascenso y,
// mientras `writing`, un cursor late bajo la última. Sin documento al lado, el hilo ocupa todo el ancho.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, type SxProps, type Theme } from '@mui/material/styles';
import { Check, Copy, FileText, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { riseSx, userBubbleSx } from '../lib/thread';

interface SlotProps { children?: React.ReactNode; className?: string; sx?: SxProps<Theme> }

/** Medidas de assistant-ui: alto 320, hilo de 15rem, botones de 28px, íconos de 14px. */
const HEIGHT = 320;
const THREAD_WIDTH = 240;
const BUTTON = 3.5;
const ICON_SIZE = 14;
const STATUS_ICON = 12;
const COPIED_MS = 1500;

const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: .5; }`;

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
        gap: 1.5,
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
      variant="body2"
      component="div"
      data-slot="canvas-split-message"
      data-speaker={speaker}
      className={className}
      color={speaker === 'user' ? undefined : 'text.secondary'}
      sx={(t) => ({ ...(speaker === 'user' ? { ...userBubbleSx(), py: 1 } : {}), ...riseSx(t) })}
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
  const button = (t: Theme) => ({ width: t.spacing(BUTTON), height: t.spacing(BUTTON), flexShrink: 0 });

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      data-slot="canvas-split-header"
      className={className}
      sx={{ flexShrink: 0, px: 1.75, py: 1.25, borderBottom: 1, borderColor: 'divider' }}
    >
      <Box component="span" sx={{ display: 'flex', color: 'text.disabled' }}><FileText size={ICON_SIZE} aria-hidden="true" /></Box>
      <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>{title}</Typography>
      <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>{`v${version}`}</Typography>
      <Typography
        role="status"
        variant="caption"
        sx={(t) => ({ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: saved ? 'success.main' : 'text.disabled', transition: t.transitions.create('color', { duration: t.transitions.duration.standard }) })}
      >
        {saved ? <><Check size={STATUS_ICON} aria-hidden="true" />guardado</> : 'editando'}
      </Typography>
      <IconButton aria-label={copied ? 'Copiado' : `Copiar ${title}`} onClick={copy} disabled={!onCopy} sx={button}>
        {copied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
      </IconButton>
      <IconButton aria-label="Cerrar el canvas" onClick={onClose} disabled={!onClose} sx={button}>
        <X size={ICON_SIZE} />
      </IconButton>
    </Stack>
  );
}

export function CanvasSplitBody({ writing = false, children, className }: SlotProps & { writing?: boolean }) {
  return (
    <Stack spacing={0.75} aria-busy={writing} data-slot="canvas-split-body" className={className} sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
      {children}
      {writing ? (
        <Box
          component="span"
          aria-hidden="true"
          sx={(t) => ({ width: '2px', height: t.typography.body2.lineHeight, flexShrink: 0, borderRadius: 1, bgcolor: 'text.secondary', animation: `${pulse} 2s ${t.transitions.easing.easeInOut} infinite`, [REDUCED_MOTION]: { animation: 'none' } })}
        />
      ) : null}
    </Stack>
  );
}

export function CanvasSplitLine({ heading = false, children, className }: SlotProps & { heading?: boolean }) {
  return (
    <Typography
      variant="body2"
      data-slot="canvas-split-line"
      className={className}
      sx={(t) => ({ m: 0, fontWeight: heading ? t.typography.fontWeightMedium : undefined, color: heading ? 'text.primary' : 'text.secondary', ...riseSx(t) })}
    >
      {children}
    </Typography>
  );
}
