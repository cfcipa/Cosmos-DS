// Cosmos DS · Kit IA · AUI connected (Sinco): Starter suggestions.
// Referente: el tablero «Starter suggestions», sobre `ThreadPrimitive.Suggestions` de assistant-ui.
// Los inicios del chat vacío, sobre el composer: un título y una lista de acciones con su ícono y color. Al pasar por
// encima (o con el foco) el composer anticipa en su placeholder el prompt completo que se va a enviar; al tocar, se
// envía. Van en el `empty` de AuiThread (o de AuiAssistantPanel), que los oculta cuando el hilo tiene mensajes.
import * as React from 'react';
import { useAui } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import { riseSx } from '../lib/thread';
import { useAuiComposerPlaceholderPreview } from './Thread';

export type AuiStarter = {
  /** Lo que se ve: «Resumir las pendientes». */
  title: string;
  /** Lo que se envía: el prompt completo. */
  prompt: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
};

export interface AuiStarterSuggestionsProps {
  starters: readonly AuiStarter[];
  /** Default '¿En qué te ayudo?'. */
  heading?: string;
}

/** Cada inicio entra 40ms después del anterior. */
const STAGGER_MS = 40;

export function AuiStarterSuggestions({ starters, heading = '¿En qué te ayudo?' }: AuiStarterSuggestionsProps) {
  const aui = useAui() as unknown as { thread: () => { append: (m: { role: 'user'; content: Array<{ type: 'text'; text: string }> }) => void } };
  const { preview, setPreview } = useAuiComposerPlaceholderPreview();
  const leave = (prompt: string) => { if (preview === prompt) setPreview(null); };
  React.useEffect(() => () => setPreview(null), [setPreview]);
  const headingId = React.useId();
  return (
    <Box data-slot="aui-starter-suggestions" sx={{ width: '100%' }}>
      <Typography id={headingId} variant="subtitle2" component="h3" sx={(t) => ({ m: 0, mb: 0.5, ml: 1, ...riseSx(t) })}>{heading}</Typography>
      <MenuList aria-labelledby={headingId} disablePadding autoFocusItem={false}>
        {starters.map((s, i) => (
          <MenuItem
            key={s.title}
            onMouseEnter={() => setPreview(s.prompt)}
            onMouseLeave={() => leave(s.prompt)}
            onFocus={() => setPreview(s.prompt)}
            onBlur={() => leave(s.prompt)}
            onClick={() => { setPreview(null); aui.thread().append({ role: 'user', content: [{ type: 'text', text: s.prompt }] }); }}
            sx={(t) => ({ borderRadius: 1, px: 1, ...riseSx(t, i * STAGGER_MS) })}
          >
            {s.icon ? <ListItemIcon sx={{ color: s.color ? `${s.color}.main` : 'action.active' }}>{s.icon}</ListItemIcon> : null}
            {s.title}
          </MenuItem>
        ))}
      </MenuList>
    </Box>
  );
}
