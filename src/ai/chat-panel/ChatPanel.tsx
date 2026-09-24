// Cosmos DS · Kit IA · Thread: Chat panel.
// Referente: assistant-ui «Chat panel» (elements/chat-panel.tsx): toda la familia trabajando junta en un panel pequeño.
// Mensajes anclados abajo, burbuja del usuario, respuesta en texto secundario, puntos de «escribiendo» y un composer
// de una línea con enviar. Los mensajes entran con un leve ascenso; la lista se queda al final cuando llega algo.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { ArrowUp } from 'lucide-react';
import { TypingIndicator } from '../typing-indicator';
import { fieldSx, riseSx, userBubbleSx } from '../lib/thread';

interface SlotProps { children?: React.ReactNode; className?: string; sx?: SxProps<Theme> }

/** Medidas de assistant-ui: max-w-md × 270, enviar de 28px con ícono de 14px. */
const PANEL_MAX_WIDTH = 448;
const PANEL_HEIGHT = 270;
const SEND = 3.5;
const SEND_ICON = 14;

export function ChatPanel({ children, className, sx }: SlotProps) {
  return (
    <Paper
      variant="outlined"
      data-slot="chat-panel"
      className={className}
      sx={[{ width: '100%', maxWidth: PANEL_MAX_WIDTH, height: PANEL_HEIGHT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Paper>
  );
}

/** La lista: anclada abajo (el primer hijo empuja con margen automático) y siempre en el último mensaje. */
export function ChatPanelMessages({ children, className, sx }: SlotProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  });
  return (
    <Box
      ref={viewportRef}
      data-slot="chat-panel-messages"
      className={className}
      sx={[{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25, '& > :first-of-type': { mt: 'auto' } }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  );
}

export function ChatPanelUserMessage({ children, className }: SlotProps) {
  return (
    <Typography variant="body2" component="div" data-slot="chat-panel-user-message" className={className} sx={(t) => ({ ...userBubbleSx(), flexShrink: 0, ...riseSx(t) })}>
      {children}
    </Typography>
  );
}

export function ChatPanelAssistantMessage({ children, className }: SlotProps) {
  return (
    <Typography variant="body2" color="text.secondary" component="div" data-slot="chat-panel-assistant-message" className={className} sx={{ alignSelf: 'flex-start', maxWidth: '85%', flexShrink: 0 }}>
      {children}
    </Typography>
  );
}

export function ChatPanelTyping({ label }: { label?: string }) {
  return <Box data-slot="chat-panel-typing" sx={(t) => ({ alignSelf: 'flex-start', display: 'flex', px: 0.5, flexShrink: 0, ...riseSx(t) })}><TypingIndicator label={label} /></Box>;
}

export interface ChatPanelComposerProps {
  placeholder: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Sin él, enviar queda desactivado. */
  onSend?: () => void;
  /** Además de `onSend`: enviar se desactiva mientras sea false. Default: hay texto. */
  canSend?: boolean;
}

/** El composer de una línea: campo relleno con enviar a la derecha; Enter envía (ignora IME). */
export function ChatPanelComposer({ placeholder, value, onValueChange, onSend, canSend }: ChatPanelComposerProps) {
  const sendable = Boolean(onSend) && (canSend ?? (value === undefined || value.trim() !== ''));
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (sendable) onSend?.();
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      data-slot="chat-panel-composer"
      sx={(t) => ({ ...fieldSx(), flexShrink: 0, mx: 1.5, mb: 1.5, height: t.spacing(5), borderRadius: 1, pl: 2, pr: 0.75 })}
    >
      <InputBase
        value={value ?? ''}
        onChange={(event) => onValueChange?.(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={!onValueChange}
        inputProps={{ 'aria-label': placeholder }}
        sx={(t) => ({ flexGrow: 1, minWidth: 0, ...t.typography.body2, '& input': { p: 0 } })}
      />
      <IconButton
        aria-label="Enviar"
        onClick={onSend}
        disabled={!sendable}
        sx={(t) => ({
          width: t.spacing(SEND),
          height: t.spacing(SEND),
          flexShrink: 0,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.dark' },
          '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
        })}
      >
        <ArrowUp size={SEND_ICON} />
      </IconButton>
    </Stack>
  );
}
