// Cosmos DS · Kit IA · AUI connected: Attachment.
// Referente: assistant-ui «Attachment» (elements/attachment.aui.tsx): mosaicos de 56px para cada adjunto, en el
// composer (con quitar) y en el mensaje del usuario; una imagen sola en el mensaje crece a 96px. Una imagen muestra su
// miniatura y abre una vista previa; los demás muestran el ícono de documento y no abren nada. Subiendo: velo con
// spinner; con error: velo con alerta y borde de error. El nombre (y el error) van en el tooltip.
import * as React from 'react';
import { AttachmentPrimitive, ComposerPrimitive, MessagePrimitive, useAui, useAuiState } from '@assistant-ui/react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha, keyframes } from '@mui/material/styles';
import { CircleAlert, FileText, Plus, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { visuallyHidden } from '@mui/utils';
import { AuiIconButton } from './AuiIconButton';

/** Medidas de assistant-ui: mosaico de 56px (96px si es la única imagen del mensaje), quitar de 20px. */
const TILE = 7;
const TILE_SOLO = 12;
const REMOVE = 2.5;
const FILE_ICON = 24;
const STATUS_ICON = 16;
const REMOVE_ICON = 12;
/** Un mosaico nuevo del composer entra al 95% y aparece. */
const tileIn = keyframes`from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: none; }`;
const TYPE_LABEL: Record<string, string> = { image: 'Imagen adjunta', document: 'Documento adjunto', file: 'Archivo adjunto' };

/** La URL de la miniatura: el archivo local mientras se compone, o la imagen ya enviada. */
function useAttachmentSrc() {
  const file = useAuiState((s) => (s.attachment.type === 'image' ? (s.attachment as { file?: File }).file : undefined));
  const content = useAuiState((s) => {
    if (s.attachment.type !== 'image') return undefined;
    const part = s.attachment.content?.find((c) => c.type === 'image') as { image?: string } | undefined;
    return part?.image;
  });
  const [src, setSrc] = React.useState<string>();
  React.useEffect(() => {
    if (!file) { setSrc(content); return undefined; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file, content]);
  return src;
}

function AttachmentTile() {
  const aui = useAui();
  const isComposer = aui.attachment.source !== 'message';
  const isImage = useAuiState((s) => s.attachment.type === 'image');
  const name = useAuiState((s) => s.attachment.name);
  const typeLabel = useAuiState((s) => TYPE_LABEL[s.attachment.type] ?? 'Adjunto');
  const uploadState = useAuiState((s) =>
    s.attachment.status.type === 'incomplete' && s.attachment.status.reason === 'error'
      ? 'error'
      : s.attachment.status.type === 'running' || (s.optional.message?.submission !== undefined && s.attachment.status.type !== 'complete')
        ? 'uploading'
        : undefined,
  );
  const errorMessage = useAuiState((s) =>
    s.attachment.status.type === 'incomplete' && s.attachment.status.reason === 'error' ? (s.attachment.status.message ?? 'No se pudo subir el archivo.') : undefined,
  );
  const src = useAttachmentSrc();
  const [preview, setPreview] = React.useState(false);
  const titleId = React.useId();
  const isError = uploadState === 'error';
  const isUploading = uploadState === 'uploading';

  const veil = (node: React.ReactNode) => (
    <Box aria-hidden="true" sx={(t) => ({ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(t.palette.background.paper, 0.65), backdropFilter: 'blur(2px)' })}>{node}</Box>
  );

  return (
    <Box
      component={AttachmentPrimitive.Root}
      data-slot="aui-attachment"
      data-image={isImage && !isComposer ? '' : undefined}
      sx={(t) => ({ position: 'relative', display: 'inline-flex', ...(isComposer ? { animation: `${tileIn} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`, [REDUCED_MOTION]: { animation: 'none' } } : null) })}
    >
      <Tooltip title={<>{name}{errorMessage ? <Box component="span" sx={{ display: 'block' }}>{errorMessage}</Box> : null}</>} placement="top">
        <ButtonBase
          aria-label={`${typeLabel}${isError ? ', falló la subida' : isUploading ? ', subiendo' : ''}`}
          onClick={src ? () => setPreview(true) : undefined}
          sx={(t) => ({
            position: 'relative',
            width: t.spacing(TILE),
            height: t.spacing(TILE),
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            cursor: src ? 'zoom-in' : 'default',
            outline: `1px solid ${isError ? t.palette.error.main : t.palette.divider}`,
            outlineOffset: '-1px',
            transition: t.transitions.create('transform', { duration: t.transitions.duration.shortest }),
            '&::after': { content: '""', position: 'absolute', inset: 0, pointerEvents: 'none', transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }) },
            '&:hover::after': { bgcolor: 'action.hover' },
            '&:active': { transform: 'scale(.96)' },
            '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
            [REDUCED_MOTION]: { transition: 'none' },
          })}
        >
          <Avatar variant="square" src={src} alt={name} sx={{ width: '100%', height: '100%', bgcolor: 'transparent', color: 'text.secondary' }}>
            <FileText size={FILE_ICON} strokeWidth={1.5} />
          </Avatar>
          {isUploading ? veil(<CircularProgress size={STATUS_ICON} color="inherit" sx={{ color: 'text.secondary' }} />) : null}
          {isError ? veil(<Box component="span" sx={{ display: 'flex', color: 'error.main' }}><CircleAlert size={STATUS_ICON} /></Box>) : null}
        </ButtonBase>
      </Tooltip>
      {isComposer ? (
        <AttachmentPrimitive.Remove asChild>
          <AuiIconButton
            tooltip="Quitar archivo"
            side="top"
            size={REMOVE}
            sx={(t) => ({ position: 'absolute', top: t.spacing(0.5), right: t.spacing(0.5), p: 0, bgcolor: alpha(t.palette.common.black, 0.5), color: 'common.white', '& svg': { width: REMOVE_ICON, height: REMOVE_ICON }, '&:hover': { bgcolor: alpha(t.palette.common.black, 0.7) } })}
          >
            <X strokeWidth={2.5} />
          </AuiIconButton>
        </AttachmentPrimitive.Remove>
      ) : null}
      {src ? (
        <Dialog open={preview} onClose={() => setPreview(false)} maxWidth="md" aria-labelledby={titleId} PaperProps={{ sx: { p: 1, position: 'relative' } }}>
          <DialogTitle id={titleId} sx={visuallyHidden}>Vista previa de la imagen adjunta</DialogTitle>
          <Box component="img" src={src} alt={name} sx={{ display: 'block', maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 1 }} />
          <AuiIconButton
            tooltip="Cerrar"
            onClick={() => setPreview(false)}
            sx={(t) => ({ position: 'absolute', top: t.spacing(2), right: t.spacing(2), bgcolor: alpha(t.palette.common.black, 0.5), color: 'common.white', '&:hover': { bgcolor: alpha(t.palette.common.black, 0.7) } })}
          >
            <X />
          </AuiIconButton>
        </Dialog>
      ) : null}
    </Box>
  );
}

/** Los adjuntos de un mensaje enviado, alineados a la derecha sobre la burbuja. */
export function AuiUserMessageAttachments() {
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="flex-end"
      sx={(t) => ({
        gridColumn: '1 / -1', gridRow: 1, '&:empty': { display: 'none' },
        // Una imagen sola en el mensaje se ve a 96px.
        '& > [data-image]:only-child > .MuiButtonBase-root': { width: t.spacing(TILE_SOLO), height: t.spacing(TILE_SOLO) },
      })}
    >
      <MessagePrimitive.Attachments>{() => <AttachmentTile />}</MessagePrimitive.Attachments>
    </Stack>
  );
}

/** Los adjuntos del composer, en una fila que se desplaza. */
export function AuiComposerAttachments() {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', overflowX: 'auto', '&:empty': { display: 'none' } }}>
      <ComposerPrimitive.Attachments>{() => <AttachmentTile />}</ComposerPrimitive.Attachments>
    </Stack>
  );
}

/** Adjuntar: abre el selector y agrega cada archivo con el adaptador del runtime. */
export function AuiComposerAddAttachment() {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <AuiIconButton tooltip="Agregar adjunto" size={3.5}>
        <Plus />
      </AuiIconButton>
    </ComposerPrimitive.AddAttachment>
  );
}

export { AttachmentTile as AuiAttachment };
