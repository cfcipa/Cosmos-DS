// Cosmos DS · Kit IA · Composer: Attachments.
// Tablero «Attachments»: los archivos esperan dentro del composer, con el progreso de cada uno, antes de enviar el mensaje.
// Como en assistant-ui (ComposerAttachmentChip): subiendo muestra el porcentaje y una barra; listo, se puede quitar (con
// onRemove) o muestra un check; con error, el motivo en rojo. Paper outlined + LinearProgress de MUI.
import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Check, FileArchive, FileImage, FileText, X } from 'lucide-react';
import { primaryTint } from '../lib/primaryTint';

export interface ComposerAttachment {
  name: string;
  /** Tamaño («412 KB») o el motivo del error. Mientras sube se muestra el porcentaje. */
  meta: string;
  state: 'uploading' | 'done' | 'error';
  /** 0–100 mientras sube. */
  progress?: number;
  kind?: 'image' | 'text' | 'archive';
}

const ICONS = { image: FileImage, text: FileText, archive: FileArchive } as const;
/** Ancho máximo del nombre en el tablero. */
const NAME_MAX_WIDTH = 150;

/** El tipo de archivo por su extensión. */
export function attachmentKind(name: string): NonNullable<ComposerAttachment['kind']> {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
  return 'text';
}

export function ComposerAttachmentChip({ attachment, onRemove }: { attachment: ComposerAttachment; onRemove?: (name: string) => void }) {
  const Icon = ICONS[attachment.kind ?? 'text'];
  const uploading = attachment.state === 'uploading';
  const failed = attachment.state === 'error';
  const progress = Math.max(0, Math.min(100, attachment.progress ?? 0));

  return (
    <Paper
      variant="outlined"
      data-slot="composer-attachment"
      data-state={attachment.state}
      sx={(t) => ({
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 0,
        py: 1,
        pl: 1.5,
        pr: 0.5,
        ...(failed ? { borderColor: alpha(t.palette.error.main, 0.5) } : null),
      })}
    >
      <Stack aria-hidden="true" alignItems="center" justifyContent="center" sx={(t) => ({ width: t.spacing(4), height: t.spacing(4), flexShrink: 0, mr: 1.5, borderRadius: 1, bgcolor: primaryTint(t), color: 'primary.main' })}>
        <Icon size={18} />
      </Stack>
      <Stack sx={{ minWidth: 0, mr: 0.5 }}>
        <Typography variant="body1" noWrap sx={{ maxWidth: NAME_MAX_WIDTH }}>{attachment.name}</Typography>
        <Typography variant="body2" color={failed ? 'error.main' : 'text.secondary'} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {uploading ? `${progress}%` : attachment.meta}
        </Typography>
      </Stack>
      {uploading ? (
        <Box aria-hidden="true" sx={{ display: 'inline-flex', px: 0.75, color: 'primary.main' }}><CircularProgress size={16} thickness={4.4} color="inherit" disableShrink /></Box>
      ) : onRemove ? (
        <IconButton aria-label={`Quitar ${attachment.name}`} onClick={() => onRemove(attachment.name)}><X size={16} /></IconButton>
      ) : attachment.state === 'done' ? (
        <Box role="img" aria-label="Listo" sx={{ display: 'inline-flex', px: 0.75, color: 'ai.toolStatus.complete' }}><Check size={18} /></Box>
      ) : null}
      {uploading ? (
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label={`Subiendo ${attachment.name}`}
          sx={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
        />
      ) : null}
    </Paper>
  );
}
