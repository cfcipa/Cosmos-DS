import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { ArrowUp, Paperclip } from 'lucide-react';

/**
 * Composer mínimo para las demos del catálogo (el del tablero: el texto arriba, adjuntar y enviar debajo).
 * No es el componente Composer del kit; ese llega con su paquete.
 */
export function DemoComposer({ value, onChange, onSend, placeholder }: {
  value: string; onChange: (value: string) => void; onSend: () => void; placeholder?: string;
}) {
  const canSend = value.trim().length > 0;
  return (
    <OutlinedInput
      fullWidth
      multiline
      value={value}
      placeholder={placeholder}
      inputProps={{ 'aria-label': 'Mensaje' }}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (canSend) onSend(); } }}
      endAdornment={
        <InputAdornment position="end" sx={{ width: '100%', height: 'auto', maxHeight: 'none', m: 0, justifyContent: 'space-between' }}>
          <IconButton aria-label="Agregar adjunto" title="Agregar adjunto" edge="start"><Paperclip size={18} /></IconButton>
          <IconButton
            aria-label="Enviar mensaje"
            title="Enviar mensaje"
            disabled={!canSend}
            onClick={onSend}
            sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
          >
            <ArrowUp size={18} />
          </IconButton>
        </InputAdornment>
      }
      sx={{ flexWrap: 'wrap', gap: 1, pt: 2, pb: 1, px: 1.75, '& .MuiInputBase-input': { width: '100%', p: 0 } }}
    />
  );
}
