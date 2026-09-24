// Cosmos DS · Kit IA · Thread: Chat panel.
// Tablero «Chat panel»: toda la familia trabajando junta, un mensaje, una pausa y una respuesta que llega en vivo.
// Como en assistant-ui: piezas componibles (panel, mensajes, burbujas, escribiendo y composer); los mensajes entran
// con un leve ascenso y la lista se queda abajo a medida que llegan. El composer es el Composer compacto del kit.
import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Composer, type ComposerProps } from '../composer';
import { TypingIndicator } from '../typing-indicator';
import { riseSx, userBubbleSx } from '../lib/thread';

interface SlotProps { children?: React.ReactNode; className?: string; sx?: SxProps<Theme> }

/** Medidas del tablero: 448 × 300. */
const PANEL_MAX_WIDTH = 448;
const PANEL_HEIGHT = 300;

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

/** La lista de mensajes: se desplaza sola al final cada vez que cambia su contenido. */
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
      sx={[{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  );
}

export function ChatPanelUserMessage({ children, className }: SlotProps) {
  return (
    <Typography variant="body1" component="div" data-slot="chat-panel-user-message" className={className} sx={(t) => ({ ...userBubbleSx(), ...riseSx(t) })}>
      {children}
    </Typography>
  );
}

export function ChatPanelAssistantMessage({ children, className }: SlotProps) {
  return (
    <Typography variant="body1" component="div" data-slot="chat-panel-assistant-message" className={className} sx={(t) => riseSx(t)}>
      {children}
    </Typography>
  );
}

export function ChatPanelTyping({ label }: { label?: string }) {
  return <Box data-slot="chat-panel-typing" sx={{ alignSelf: 'flex-start', display: 'flex' }}><TypingIndicator label={label} /></Box>;
}

/** El Composer del kit en modo compacto, pegado al pie del panel. */
export function ChatPanelComposer(props: Omit<ComposerProps, 'compact'>) {
  return (
    <Box data-slot="chat-panel-composer" sx={{ flexShrink: 0, px: 1.5, pb: 1.5 }}>
      <Composer compact {...props} />
    </Box>
  );
}
