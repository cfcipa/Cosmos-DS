// Cosmos DS · Kit IA · Thread: Shared conversation.
// Referente: assistant-ui «Shared conversation» (elements/shared-conversation.tsx): una transcripción de solo lectura
// que alguien te envió. Arriba el título y quién la compartió; en medio los turnos sin controles de edición; abajo
// «solo lectura» y «Continuar en tu propio chat», que importa los mensajes a un hilo tuyo.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Link } from 'lucide-react';
import { userBubbleSx } from '../lib/thread';

export interface SharedTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface SharedConversationProps {
  title: string;
  sharedBy: string;
  /** Ya formateado: «hace 3 días». */
  sharedAt: string;
  turns: readonly SharedTurn[];
  onContinue?: () => void;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas de assistant-ui: max-w-sm, ícono de 14px. */
const MAX_WIDTH = 384;
const ICON_SIZE = 14;

export function SharedConversation({ title, sharedBy, sharedAt, turns, onContinue, className, sx }: SharedConversationProps) {
  return (
    <Paper
      variant="outlined"
      data-slot="shared-conversation"
      className={className}
      sx={[{ width: '100%', maxWidth: MAX_WIDTH, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexShrink: 0, px: 2, pt: 1.75, pb: 1.5 }}>
        <Box component="span" aria-hidden="true" sx={{ display: 'flex', flexShrink: 0, color: 'text.disabled' }}><Link size={ICON_SIZE} /></Box>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>{title}</Typography>
          <Typography variant="caption" color="text.disabled" noWrap>{`compartido por ${sharedBy} · ${sharedAt}`}</Typography>
        </Stack>
      </Stack>
      <Stack spacing={1.25} sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 1.75, borderTop: 1, borderColor: 'divider' }}>
        {turns.map((turn) => (
          <Typography
            key={turn.id}
            variant="body2"
            component="div"
            color={turn.role === 'user' ? undefined : 'text.secondary'}
            sx={turn.role === 'user' ? { ...userBubbleSx(), py: 1, flexShrink: 0 } : { flexShrink: 0 }}
          >
            {turn.text}
          </Typography>
        ))}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled">solo lectura</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={onContinue} disabled={!onContinue}>Continuar en tu propio chat</Button>
      </Stack>
    </Paper>
  );
}
