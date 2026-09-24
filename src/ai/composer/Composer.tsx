// Cosmos DS · Kit IA · Composer: Composer.
// Tablero «Composer»: la entrada unificada; adjuntos, comandos, menciones, modelos, voz y contexto en una sola superficie.
// Como en assistant-ui (ComposerPrimitive): Enter envía según submitMode ('enter', 'ctrlEnter' o 'none'; nunca mientras se
// compone con IME), mientras corre una respuesta el botón de enviar pasa a detener, y sin texto no se puede enviar.
// El marco es un OutlinedInput multilínea de MUI: el borde, el hover, el foco y el disabled salen del tema; los adjuntos y
// la barra de herramientas son sus adornos, a lo ancho. Los menús flotan sobre el marco (Popper, sin robar el foco).
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import { ArrowUp, Square } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export type ComposerSubmitMode = 'enter' | 'ctrlEnter' | 'none';

export interface ComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Envía el mensaje. */
  onSubmit?: () => void;
  /** Default 'enter' (Enter envía, Shift+Enter hace salto de línea). */
  submitMode?: ComposerSubmitMode;
  /** Default: hay texto. Pásalo si hay adjuntos sin texto o si una subida bloquea el envío. */
  canSubmit?: boolean;
  /** Una respuesta está corriendo: el botón pasa a detener. */
  running?: boolean;
  onCancel?: () => void;
  disabled?: boolean;
  /** Uno fijo, o varios que rotan mientras el composer está vacío. */
  placeholder?: string | readonly string[];
  /** Cada cuánto rota el placeholder. Default 4800 ms (tablero). */
  placeholderInterval?: number;
  /** Default 2. */
  minRows?: number;
  /** Default 6. */
  maxRows?: number;
  /** Una sola fila con enviar al lado, mientras el texto quepa en una línea y no haya adjuntos. */
  compact?: boolean;
  /** Fila de adjuntos sobre el texto. */
  attachments?: React.ReactNode;
  /** Archivos soltados sobre el composer. Sin él, no acepta arrastrar. */
  onFilesDrop?: (files: File[]) => void;
  /** Default 'Suelta los archivos para adjuntarlos'. */
  dropLabel?: string;
  /** Menú que flota sobre el composer (comandos, menciones). */
  menu?: React.ReactNode;
  /** Botones a la izquierda y a la derecha (antes de enviar) de la barra inferior. */
  toolbarStart?: React.ReactNode;
  toolbarEnd?: React.ReactNode;
  /** Reemplaza el texto (por ejemplo, la onda del dictado). */
  voice?: React.ReactNode;
  /** Se llama antes que el envío; si hace preventDefault, el composer no envía (los menús lo usan). */
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Atributos del textarea (combobox, aria-activedescendant…). */
  inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement> & Record<string, unknown>;
  inputRef?: React.Ref<HTMLTextAreaElement>;
  /** Default 'Mensaje'. */
  label?: string;
  className?: string;
}

const PLACEHOLDER_MS = 4800;
/** El modo compacto se mantiene mientras el texto sea corto (tablero: menos de 48 caracteres, sin saltos de línea). */
const COMPACT_MAX_CHARS = 48;
const ICON_SIZE = 18;
/** Placeholder que entra (el tablero alterna dos animaciones iguales para poder reiniciarla). */
const phInA = keyframes`from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; }`;
const phInB = keyframes`from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; }`;

/** Enviar / detener: IconButton en primary (el botón relleno del tablero). */
export function ComposerSend({ running, disabled, onCancel, sendLabel = 'Enviar mensaje', stopLabel = 'Detener la respuesta' }: {
  running?: boolean; disabled?: boolean; onCancel?: () => void; sendLabel?: string; stopLabel?: string;
}) {
  return (
    <Tooltip title={running ? stopLabel : sendLabel}>
      <span>
        <IconButton
          type={running ? 'button' : 'submit'}
          aria-label={running ? stopLabel : sendLabel}
          disabled={running ? false : disabled}
          onClick={running ? onCancel : undefined}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
          }}
        >
          {/* Mismo cuadro para las dos glifos: el botón no cambia de tamaño al pasar a detener. */}
          <Box component="span" aria-hidden="true" sx={{ width: ICON_SIZE, height: ICON_SIZE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {running ? <Square size={ICON_SIZE - 6} fill="currentColor" /> : <ArrowUp size={ICON_SIZE} strokeWidth={2.25} />}
          </Box>
        </IconButton>
      </span>
    </Tooltip>
  );
}

export function Composer({
  value,
  onValueChange,
  onSubmit,
  submitMode = 'enter',
  canSubmit,
  running = false,
  onCancel,
  disabled = false,
  placeholder,
  placeholderInterval = PLACEHOLDER_MS,
  minRows = 2,
  maxRows = 6,
  compact = false,
  attachments,
  onFilesDrop,
  dropLabel = 'Suelta los archivos para adjuntarlos',
  menu,
  toolbarStart,
  toolbarEnd,
  voice,
  onKeyDown,
  inputProps,
  inputRef,
  label = 'Mensaje',
  className,
}: ComposerProps) {
  const [frame, setFrame] = React.useState<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const placeholders = typeof placeholder === 'string' ? [placeholder] : placeholder ?? [];
  const [phIndex, setPhIndex] = React.useState(0);
  const isEmpty = value.length === 0;

  React.useEffect(() => {
    if (placeholders.length < 2 || !isEmpty) return undefined;
    const id = window.setInterval(() => setPhIndex((i) => (i + 1) % placeholders.length), placeholderInterval);
    return () => window.clearInterval(id);
  }, [placeholders.length, isEmpty, placeholderInterval]);

  const sendable = (canSubmit ?? value.trim().length > 0) && !running && !disabled;
  const submit = () => { if (sendable) onSubmit?.(); };
  const isCompact = compact && !attachments && !voice && !value.includes('\n') && value.length < COMPACT_MAX_CHARS;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    const wants = (submitMode === 'enter' && !event.shiftKey) || (submitMode === 'ctrlEnter' && (event.ctrlKey || event.metaKey));
    if (wants) { event.preventDefault(); submit(); }
  };

  const dropHandlers = onFilesDrop
    ? {
        onDragOver: (event: React.DragEvent) => { event.preventDefault(); if (!dragging) setDragging(true); },
        onDragLeave: (event: React.DragEvent) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); },
        onDrop: (event: React.DragEvent) => { event.preventDefault(); setDragging(false); onFilesDrop(Array.from(event.dataTransfer.files ?? [])); },
      }
    : null;

  const send = <ComposerSend running={running} disabled={!sendable} onCancel={onCancel} />;

  return (
    <Box
      component="form"
      ref={setFrame}
      className={className}
      data-slot="composer"
      onSubmit={(event: React.FormEvent) => { event.preventDefault(); submit(); }}
      sx={{ position: 'relative', width: '100%' }}
      {...dropHandlers}
    >
      <Popper open={Boolean(menu) && Boolean(frame)} anchorEl={frame} placement="top-start" disablePortal sx={{ zIndex: 'modal' }} modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}>
        {menu}
      </Popper>

      <OutlinedInput
        fullWidth
        multiline
        minRows={isCompact ? 1 : minRows}
        maxRows={maxRows}
        value={value}
        disabled={disabled}
        placeholder={placeholders[phIndex] ?? ''}
        inputRef={inputRef}
        inputProps={{ 'aria-label': label, ...inputProps }}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        startAdornment={
          attachments || voice ? (
            <InputAdornment position="start" sx={{ width: '100%', height: 'auto', maxHeight: 'none', m: 0, display: 'block' }}>
              {attachments ? <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>{attachments}</Stack> : null}
              {voice}
            </InputAdornment>
          ) : undefined
        }
        endAdornment={
          <InputAdornment position="end" sx={isCompact ? { height: 'auto', maxHeight: 'none', m: 0 } : { width: '100%', height: 'auto', maxHeight: 'none', m: 0 }}>
            {isCompact ? send : (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%' }}>
                {toolbarStart}
                <Box sx={{ flexGrow: 1 }} />
                {toolbarEnd}
                {send}
              </Stack>
            )}
          </InputAdornment>
        }
        sx={(t) => ({
          flexWrap: isCompact ? 'nowrap' : 'wrap',
          alignItems: isCompact ? 'center' : 'flex-end',
          gap: 1,
          pt: isCompact ? 1 : 2,
          pb: 1,
          px: 1.75,
          '& .MuiInputBase-input': {
            // Siempre a todo el ancho; en compacto encoge lo justo para dejar sitio a enviar (flex-shrink), sin depender de flex-grow.
            width: '100%',
            minWidth: 0,
            // En compacto el texto (y el placeholder) va en una sola línea; el alto automático también la mide así.
            ...(isCompact ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : null),
            p: 0,
            ...(voice ? { display: 'none' } : null),
            '&::placeholder': {
              opacity: 1,
              color: 'text.secondary',
              animation: placeholders.length > 1 ? `${phIndex % 2 ? phInA : phInB} 1.2s cubic-bezier(.45, 0, .55, 1) both` : 'none',
            },
            [REDUCED_MOTION]: { '&::placeholder': { animation: 'none' } },
          },
          ...(dragging ? {
            bgcolor: alpha(t.palette.primary.main, t.palette.action.hoverOpacity),
            '& .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline': { borderStyle: 'dashed', borderColor: 'primary.main' },
          } : null),
        })}
      />

      {dragging ? (
        <Stack
          aria-hidden="true"
          alignItems="center"
          justifyContent="center"
          sx={(t) => ({ position: 'absolute', inset: 0, zIndex: 1, borderRadius: 1, pointerEvents: 'none', bgcolor: alpha(t.palette.background.paper, 0.94) })}
        >
          <Typography variant="subtitle1" color="primary.main">{dropLabel}</Typography>
        </Stack>
      ) : null}
    </Box>
  );
}
