// Cosmos DS · Kit IA · Thread: Mobile composer.
// Tablero «Mobile composer»: una hoja inferior atenta al teclado, acciones rápidas encima y objetivos del tamaño del pulgar.
// Como en assistant-ui: con el teclado abierto se esconden las acciones y aparece «Retorno para enviar»; cerrado se ve
// el indicador de inicio. El micrófono solo con el campo vacío. Enter envía (no durante IME ni corriendo); enviar se
// vuelve detener mientras `running`. Cada control se desactiva si no llega su callback.
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { ArrowUp, Mic, Paperclip, Square } from 'lucide-react';

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

const ICON_SIZE = 20;
const ATTACH_SIZE = 22;
const STOP_SIZE = 14;
/** El indicador de inicio del tablero: 96 × 4. */
const HOME_INDICATOR_WIDTH = 12;

export function MobileComposer({
  value, keyboardOpen, running, actions,
  onAction, onAttach, onValueChange, onSend, onStop, onFocus, onBlur, placeholder = 'Mensaje', className, sx,
}: MobileComposerProps) {
  const empty = value.trim() === '';
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!running && !empty && onSend) onSend();
  };

  return (
    <Stack
      spacing={1}
      data-slot="mobile-composer"
      className={className}
      sx={[{ p: 1, pb: 0.75, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {!keyboardOpen ? (
        <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto' }}>
          {actions.map((action) => (
            <Chip key={action} variant="outlined" clickable label={action} onClick={() => onAction?.(action)} disabled={!onAction} sx={{ flexShrink: 0 }} />
          ))}
        </Stack>
      ) : null}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="large" aria-label="Agregar un adjunto" onClick={onAttach} disabled={!onAttach} sx={{ flexShrink: 0 }}>
          <Paperclip size={ATTACH_SIZE} />
        </IconButton>
        <OutlinedInput
          fullWidth
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          inputProps={{ 'aria-label': placeholder, enterKeyHint: 'send' }}
          endAdornment={value === '' ? <InputAdornment position="end" sx={{ color: 'action.active' }}><Mic size={ICON_SIZE} aria-hidden="true" /></InputAdornment> : undefined}
        />
        {onSend || onStop ? (
          <IconButton
            size="large"
            aria-label={running ? 'Detener' : 'Enviar'}
            onClick={running ? onStop : onSend}
            // Enviar y detener no le quitan el foco al campo: el teclado no se cierra a mitad del toque.
            onMouseDown={(event) => event.preventDefault()}
            disabled={running ? !onStop : !onSend || empty}
            sx={{
              flexShrink: 0,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
            }}
          >
            {/* Mismo cuadro para los dos glifos: el botón no cambia de tamaño al pasar a detener. */}
            <Box component="span" aria-hidden="true" sx={{ width: ICON_SIZE, height: ICON_SIZE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {running ? <Square size={STOP_SIZE} fill="currentColor" /> : <ArrowUp size={ICON_SIZE} strokeWidth={2.25} />}
            </Box>
          </IconButton>
        ) : null}
      </Stack>
      {keyboardOpen ? (
        <Typography variant="body3" color="text.secondary" aria-hidden="true" sx={{ textAlign: 'center' }}>Retorno para enviar</Typography>
      ) : (
        <Box aria-hidden="true" sx={(t) => ({ alignSelf: 'center', width: t.spacing(HOME_INDICATOR_WIDTH), height: t.spacing(0.5), borderRadius: 0.5, bgcolor: 'action.disabled' })} />
      )}
    </Stack>
  );
}
