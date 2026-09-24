// Cosmos DS · Kit IA · Thread: Launcher.
// Tablero «Launcher»: la entrada flotante y el panel en el que se abre.
// Como en assistant-ui (LauncherBubble): el botón alterna el panel y muestra los no leídos solo cerrado; los prompts
// son botones con `onPick` y texto sin él; «Iniciar una conversación» aparece con `onStart`. Sin `onToggle` queda
// el globo estático. Abre con fundido y escala; al cerrar se desmonta sin animación.
import * as React from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Grow from '@mui/material/Grow';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { ChevronRight, MoonStar, X } from 'lucide-react';

export interface LauncherProps {
  open: boolean;
  unread: number;
  greeting: string;
  /** Default 'Suele responder en un minuto'. */
  status?: string;
  prompts: readonly string[];
  onToggle?: () => void;
  onPick?: (prompt: string) => void;
  onStart?: () => void;
  /** Default 'Iniciar una conversación'. */
  startLabel?: string;
  className?: string;
}

/** Medidas y tiempos del tablero. */
const PANEL_WIDTH = 300;
const ICON_SIZE = 24;
const CHEVRON_SIZE = 20;
const OPEN_MS = 180;

const bubbleSx = (t: Theme) => ({
  background: `linear-gradient(135deg, ${t.palette.ai.markStart} 0%, ${t.palette.ai.markEnd} 100%)`,
  color: t.palette.primary.contrastText,
});

export function Launcher({ open, unread, greeting, status = 'Suele responder en un minuto', prompts, onToggle, onPick, onStart, startLabel = 'Iniciar una conversación', className }: LauncherProps) {
  const icon = open ? <X size={ICON_SIZE} /> : <MoonStar size={ICON_SIZE} />;
  return (
    <Stack data-slot="launcher" alignItems="flex-end" spacing={1.5} className={className}>
      <Grow in={open} unmountOnExit timeout={{ enter: OPEN_MS, exit: 0 }} style={{ transformOrigin: 'bottom right' }}>
        <Paper elevation={8} role="dialog" aria-label="Asistente" sx={{ width: PANEL_WIDTH, boxSizing: 'border-box', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack spacing={0.25}>
            <Typography variant="h5" component="h2" sx={{ m: 0 }}>{greeting}</Typography>
            <Typography variant="body2" color="text.secondary">{status}</Typography>
          </Stack>
          <List disablePadding sx={{ mx: -2 }}>
            {prompts.map((prompt, i) => {
              const divider = i > 0 ? { borderTop: 1, borderColor: 'divider' } : {};
              return onPick ? (
                <ListItemButton key={prompt} onClick={() => onPick(prompt)} sx={{ ...divider, pl: 2, pr: 1 }}>
                  <ListItemText primary={prompt} primaryTypographyProps={{ variant: 'body1' }} sx={{ my: 0 }} />
                  <Box component="span" sx={{ display: 'flex', color: 'action.active' }}><ChevronRight size={CHEVRON_SIZE} aria-hidden="true" /></Box>
                </ListItemButton>
              ) : (
                <ListItem key={prompt} sx={{ ...divider, px: 2 }}>
                  <ListItemText primary={prompt} primaryTypographyProps={{ variant: 'body1', color: 'text.secondary' }} sx={{ my: 0 }} />
                </ListItem>
              );
            })}
          </List>
          {onStart ? <Button variant="contained" fullWidth onClick={onStart}>{startLabel}</Button> : null}
        </Paper>
      </Grow>
      {onToggle ? (
        <Badge color="error" badgeContent={unread} invisible={open || unread <= 0} overlap="circular" slotProps={{ badge: { 'aria-label': `${unread} sin leer` } as React.HTMLAttributes<HTMLSpanElement> }}>
          <Fab
            color="primary"
            aria-expanded={open}
            aria-label={open ? 'Cerrar el asistente' : 'Abrir el asistente'}
            onClick={onToggle}
            sx={(t) => ({ ...bubbleSx(t), '&:hover': { ...bubbleSx(t), filter: 'brightness(0.92)' } })}
          >
            {icon}
          </Fab>
        </Badge>
      ) : !open ? (
        <Box aria-hidden="true" sx={(t) => ({ ...bubbleSx(t), width: t.spacing(7), height: t.spacing(7), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
          {icon}
        </Box>
      ) : null}
    </Stack>
  );
}
