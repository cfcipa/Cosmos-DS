// Cosmos DS · Kit IA · Thread: Launcher.
// Referente: assistant-ui «Launcher bubble» (elements/launcher-bubble.tsx): la entrada flotante y el panel en que se abre.
// El panel solo existe abierto: entra con fundido, escala y un leve ascenso, y al cerrar se desmonta sin animación.
// El botón es botón solo con `onToggle` (sin él, un globo estático cuando está cerrado); los prompts son botones con
// `onPick` y texto sin él; «Iniciar una conversación» aparece con `onStart`. Los no leídos se ven solo cerrado.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes, type Theme } from '@mui/material/styles';
import { MessageCircle, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { fieldInteractiveSx, fieldSx } from '../lib/thread';

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

/** Medidas de assistant-ui: columna de 19rem, globo de 48px, ícono de 20px, contador de 16px. */
const MAX_WIDTH = 304;
const BUBBLE = 6;
const ICON_SIZE = 20;
const BADGE = 2;

const panelIn = keyframes`from { opacity: 0; transform: translateY(8px) scale(.95); } to { opacity: 1; transform: none; }`;

/** Los dos íconos en la misma celda: el que sale gira 90° y se desvanece. */
function swapSx(t: Theme, shown: boolean, turn: number) {
  return {
    gridArea: '1 / 1',
    display: 'flex',
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : `rotate(${turn}deg)`,
    transition: t.transitions.create(['opacity', 'transform'], { duration: t.transitions.duration.shorter }),
    [REDUCED_MOTION]: { transition: 'none' },
  };
}

export function Launcher({ open, unread, greeting, status = 'Suele responder en un minuto', prompts, onToggle, onPick, onStart, startLabel = 'Iniciar una conversación', className }: LauncherProps) {
  const bubble = (
    <>
      <Box component="span" sx={{ display: 'grid' }}>
        <Box component="span" sx={(t) => swapSx(t, !open, 90)}><MessageCircle size={ICON_SIZE} /></Box>
        <Box component="span" sx={(t) => swapSx(t, open, -90)}><X size={ICON_SIZE} /></Box>
      </Box>
      {unread > 0 && !open ? (
        <Typography
          component="span"
          variant="caption"
          aria-label={`${unread} sin leer`}
          sx={(t) => ({
            position: 'absolute',
            top: t.spacing(-0.25),
            right: t.spacing(-0.25),
            minWidth: t.spacing(BADGE),
            height: t.spacing(BADGE),
            px: 0.25,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: t.spacing(1),
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: t.shadows[1],
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          })}
        >
          {unread}
        </Typography>
      ) : null}
    </>
  );

  return (
    <Stack data-slot="launcher" alignItems="flex-end" spacing={1.25} className={className} sx={{ width: '100%', maxWidth: MAX_WIDTH }}>
      {open ? (
        <Paper
          variant="outlined"
          role="dialog"
          aria-label="Asistente"
          sx={(t) => ({
            width: '100%',
            boxSizing: 'border-box',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            transformOrigin: 'bottom right',
            animation: `${panelIn} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`,
            [REDUCED_MOTION]: { animation: 'none' },
          })}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" component="h2" sx={{ m: 0 }}>{greeting}</Typography>
            <Typography variant="caption" color="text.disabled">{status}</Typography>
          </Stack>
          <Stack spacing={0.75}>
            {prompts.map((prompt) => (onPick ? (
              <ButtonBase
                key={prompt}
                onClick={() => onPick(prompt)}
                sx={(t) => ({ ...fieldInteractiveSx(t), ...t.typography.body2, justifyContent: 'flex-start', textAlign: 'start', borderRadius: 1, px: 1.5, py: 1, color: 'text.secondary', '&.Mui-focusVisible': { bgcolor: 'action.focus' } })}
              >
                {prompt}
              </ButtonBase>
            ) : (
              <Typography key={prompt} variant="body2" color="text.secondary" sx={{ ...fieldSx(), borderRadius: 1, px: 1.5, py: 1 }}>{prompt}</Typography>
            )))}
          </Stack>
          {onStart ? <Button variant="contained" fullWidth onClick={onStart}>{startLabel}</Button> : null}
        </Paper>
      ) : null}
      {onToggle ? (
        <Fab
          color="primary"
          aria-expanded={open}
          aria-label={open ? 'Cerrar el asistente' : 'Abrir el asistente'}
          onClick={onToggle}
          sx={(t) => ({ width: t.spacing(BUBBLE), height: t.spacing(BUBBLE), minHeight: 0, flexShrink: 0, position: 'relative', overflow: 'visible' })}
        >
          {bubble}
        </Fab>
      ) : !open ? (
        <Box aria-hidden="true" sx={(t) => ({ position: 'relative', width: t.spacing(BUBBLE), height: t.spacing(BUBBLE), flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' })}>
          {bubble}
        </Box>
      ) : null}
    </Stack>
  );
}
