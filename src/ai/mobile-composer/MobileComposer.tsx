// Cosmos DS · Kit IA · Thread: Mobile composer.
// Referente: assistant-ui «Mobile composer» (elements/mobile-composer.tsx): la hoja inferior del teléfono.
// Fila de acciones rápidas que se va cuando sube el teclado, adjuntar, un campo de una línea y enviar, que se vuelve
// detener durante la ejecución. Abajo, el agarre de la hoja o «Retorno para enviar», nunca los dos.
// Enter envía solo con texto y sin ejecución (ignora la composición IME). Adjuntar y las acciones se desactivan juntas
// según llegue o no su callback; ninguna reacciona a `running` por sí sola.
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { ArrowUp, Mic, Plus, Square } from 'lucide-react';
import { fieldSx, riseSx } from '../lib/thread';

export interface MobileComposerProps {
  value: string;
  keyboardOpen: boolean;
  running: boolean;
  actions: readonly string[];
  onAction?: (action: string) => void;
  onAttach?: () => void;
  onValueChange?: (value: string) => void;
  onSend?: () => void;
  onStop?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Default 'Mensaje'. */
  placeholder?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

/** Medidas de assistant-ui: hoja de 19rem, objetivos de 36px, íconos de 16px, agarre de 112 × 4. */
const MAX_WIDTH = 304;
const TARGET = 4.5;
const ICON_SIZE = 16;
const STOP_SIZE = 12;
const GRABBER_WIDTH = 14;
/** 16px en el campo: por debajo, Safari en iOS hace zoom al enfocar. */
const INPUT_FONT_PX = 16;

export function MobileComposer({
  value, keyboardOpen, running, actions,
  onAction, onAttach, onValueChange, onSend, onStop, onFocus, onBlur, placeholder = 'Mensaje', className, sx,
}: MobileComposerProps) {
  const empty = value === '';
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!running && !empty && onSend) onSend();
  };
  const circle = (t: Theme) => ({ width: t.spacing(TARGET), height: t.spacing(TARGET), flexShrink: 0 });

  return (
    <Stack
      spacing={1.25}
      data-slot="mobile-composer"
      className={className}
      sx={[
        (t) => ({
          width: '100%',
          maxWidth: MAX_WIDTH,
          boxSizing: 'border-box',
          px: 1.5,
          pt: 1.5,
          pb: keyboardOpen ? 1.5 : 3,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          borderRadius: `${t.shape.borderRadius * 2}px ${t.shape.borderRadius * 2}px 0 0`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {!keyboardOpen ? (
        <Stack direction="row" spacing={0.75} sx={(t) => ({ mx: -1.5, px: 1.5, pb: 0.25, overflowX: 'auto', ...riseSx(t) })}>
          {actions.map((action) => (
            <Chip
              key={action}
              size="small"
              label={action}
              onClick={() => onAction?.(action)}
              disabled={!onAction}
              sx={{ flexShrink: 0, bgcolor: 'action.hover', color: 'text.secondary' }}
            />
          ))}
        </Stack>
      ) : null}

      <Stack direction="row" alignItems="flex-end" spacing={1}>
        <IconButton aria-label="Agregar un adjunto" onClick={onAttach} disabled={!onAttach} sx={(t) => ({ ...circle(t), ...fieldSx() })}>
          <Plus size={ICON_SIZE} />
        </IconButton>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ ...fieldSx(), flexGrow: 1, minWidth: 0, borderRadius: 1, px: 1.5, py: 1 }}>
          <InputBase
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            inputProps={{ 'aria-label': placeholder, enterKeyHint: 'send' }}
            sx={(t) => ({ flexGrow: 1, minWidth: 0, ...t.typography.body1, fontSize: t.typography.pxToRem(INPUT_FONT_PX), '& input': { p: 0 } })}
          />
          {empty ? <Box component="span" sx={{ display: 'flex', color: 'text.disabled' }}><Mic size={ICON_SIZE} aria-hidden="true" /></Box> : null}
        </Stack>
        {onSend || onStop ? (
          <IconButton
            aria-label={running ? 'Detener' : 'Enviar'}
            onClick={running ? onStop : onSend}
            // Enviar y detener no le quitan el foco al campo: el teclado no se cierra a mitad del toque.
            onMouseDown={(event) => event.preventDefault()}
            disabled={running ? !onStop : !onSend || empty}
            sx={(t) => ({
              ...circle(t),
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
            })}
          >
            {running ? <Square size={STOP_SIZE} fill="currentColor" /> : <ArrowUp size={ICON_SIZE} />}
          </IconButton>
        ) : null}
      </Stack>

      {keyboardOpen ? (
        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>Retorno para enviar</Typography>
      ) : (
        <Box aria-hidden="true" sx={(t) => ({ alignSelf: 'center', width: t.spacing(GRABBER_WIDTH), height: t.spacing(0.5), borderRadius: 0.5, bgcolor: 'action.disabled' })} />
      )}
    </Stack>
  );
}
