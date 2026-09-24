// Cosmos DS · Kit IA · AUI connected: Image.
// Referente: assistant-ui «Image» (elements/image.tsx).
// Una parte de imagen del mensaje. Mientras carga se ve un marcador que late; si la imagen no carga, el ícono de imagen
// rota. Un clic (o Enter / Espacio) la amplía a pantalla completa; Esc, un clic o «Cerrar» vuelven, con el foco de
// regreso en la imagen. Mientras se genera, un spinner; si el proveedor la bloquea, el aviso. Debajo, el nombre del
// archivo, y con `AuiImageActions` descargar, copiar y regenerar.
import * as React from 'react';
import type { ImageMessagePart, ImageMessagePartComponent } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes, useTheme, type Theme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import type { SxProps } from '@mui/system';
import { Check, Copy, Download, ImageIcon, ImageOff, Loader2, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';

export type AuiImageVariant = 'outline' | 'ghost' | 'muted';
export type AuiImageSize = 'sm' | 'default' | 'lg' | 'full';

/** Medidas de assistant-ui: 256, 384 y 512px de ancho; marcadores de 128px de alto con íconos de 32px. */
const WIDTH: Record<Exclude<AuiImageSize, 'full'>, number> = { sm: 256, default: 384, lg: 512 };
const MIN_HEIGHT = 16;
const STATE_ICON = 32;
/** La vista ampliada: la imagen hasta el 90% de la pantalla sobre un fondo negro al 80%. */
const ZOOM_MAX = '90vw';
const ZOOM_MAX_H = '90vh';
const ZOOM_BACKDROP = 0.8;
const ZOOM_CLOSE_ICON = 20;
const COPIED_MS = 1500;
/** Tiempo que el enlace de descarga creado a partir de un data URI sigue vivo. */
const REVOKE_MS = 40_000;

const pulse = keyframes`50% { opacity: .5; }`;
const spin = keyframes`to { transform: rotate(360deg); }`;

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
const mimeOf = (image: string) => image.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();

function dataUriToBlob(uri: string): Blob | null {
  const comma = uri.indexOf(',');
  const meta = comma >= 0 ? uri.slice(0, comma) : uri;
  const data = comma >= 0 ? uri.slice(comma + 1) : '';
  const mime = meta.match(/data:([^;]+)/i)?.[1]?.toLowerCase() ?? 'application/octet-stream';
  if (!/;base64/i.test(meta)) {
    try { return new Blob([decodeURIComponent(data)], { type: mime }); } catch { return null; }
  }
  try {
    const bytes = atob(data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch { return null; }
}

function defaultFilename(image: string) {
  const mime = mimeOf(image);
  if (mime) return `imagen.${EXT[mime] ?? 'png'}`;
  try {
    const base = decodeURIComponent(new URL(image, document.baseURI).pathname.split('/').pop() ?? '');
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(base)) return base;
  } catch { /* nombre por defecto */ }
  return 'imagen.png';
}

/** Descarga la imagen con su nombre (o uno por su tipo). */
export function downloadImagePart(part: Pick<ImageMessagePart, 'image' | 'filename'>) {
  const isData = /^data:/i.test(part.image);
  const blob = isData ? dataUriToBlob(part.image) : null;
  if (isData && !blob) return;
  const url = blob ? URL.createObjectURL(blob) : null;
  const a = document.createElement('a');
  a.href = url ?? part.image;
  a.download = part.filename ?? defaultFilename(part.image);
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (url) window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_MS);
}

/** Copia la imagen al portapapeles. */
export async function copyImagePart(part: Pick<ImageMessagePart, 'image'>) {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') throw new Error('El portapapeles no está disponible.');
  const blob = /^data:/i.test(part.image) ? dataUriToBlob(part.image) : await fetch(part.image).then((r) => r.blob());
  if (!blob) return;
  await navigator.clipboard.write([new ClipboardItem({ [mimeOf(part.image) ?? blob.type ?? 'image/png']: blob })]);
}

export interface AuiImageRootProps {
  variant?: AuiImageVariant;
  size?: AuiImageSize;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

export function AuiImageRoot({ variant = 'outline', size = 'default', sx, children }: AuiImageRootProps) {
  return (
    <Box
      data-slot="aui-image"
      data-variant={variant}
      data-size={size}
      sx={[
        { position: 'relative', overflow: 'hidden', borderRadius: 1, width: size === 'full' ? '100%' : undefined, maxWidth: size === 'full' ? undefined : WIDTH[size] },
        variant === 'outline' && { border: 1, borderColor: 'divider' },
        variant === 'muted' && { bgcolor: 'action.hover' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

const stateBoxSx = (t: Theme) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: t.spacing(MIN_HEIGHT), p: 2, bgcolor: 'action.hover' });

export interface AuiImagePreviewProps {
  src: string;
  alt?: string;
  onLoadedChange?: (loaded: boolean) => void;
}

/** La imagen con su marcador mientras carga y el ícono de imagen rota si falla. */
export function AuiImagePreview({ src, alt = 'Contenido de la imagen', onLoadedChange }: AuiImagePreviewProps) {
  const ref = React.useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = React.useState<string>();
  const [errorSrc, setErrorSrc] = React.useState<string>();
  const loaded = loadedSrc === src;
  const error = errorSrc === src;
  React.useEffect(() => {
    const img = ref.current;
    if (!img?.complete) return;
    if (img.naturalWidth > 0) setLoadedSrc(src);
    else setErrorSrc(src);
  }, [src]);
  React.useEffect(() => { onLoadedChange?.(loaded); }, [loaded, onLoadedChange]);
  return (
    <Box data-slot="aui-image-preview" sx={(t) => ({ position: 'relative', minHeight: t.spacing(MIN_HEIGHT) })}>
      {!loaded && !error && (
        <Box data-slot="aui-image-loading" sx={(t) => ({ ...stateBoxSx(t), position: 'absolute', inset: 0 })}>
          <Box component={ImageIcon} sx={{ width: STATE_ICON, height: STATE_ICON, color: 'text.secondary', animation: `${pulse} 2s cubic-bezier(.4, 0, .6, 1) infinite`, [REDUCED_MOTION]: { animation: 'none' } }} />
        </Box>
      )}
      {error ? (
        <Box data-slot="aui-image-error" sx={stateBoxSx}>
          <Box component={ImageOff} sx={{ width: STATE_ICON, height: STATE_ICON, color: 'text.secondary' }} />
        </Box>
      ) : (
        <Box
          component="img"
          ref={ref}
          src={src}
          alt={alt}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setErrorSrc(src)}
          sx={{ display: 'block', width: '100%', height: 'auto', objectFit: 'contain', visibility: loaded ? 'visible' : 'hidden' }}
        />
      )}
    </Box>
  );
}

export function AuiImageFilename({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <Typography variant="caption" color="text.secondary" noWrap component="span" sx={{ display: 'block', px: 1, py: 0.75 }} data-slot="aui-image-filename">{children}</Typography>;
}

export interface AuiImageZoomProps {
  src: string;
  alt?: string;
  /** Sin imagen cargada no se amplía. Default true. */
  enabled?: boolean;
  children: React.ReactNode;
}

/** Amplía la imagen a pantalla completa. */
export function AuiImageZoom({ src, alt = 'Vista previa de la imagen', enabled = true, children }: AuiImageZoomProps) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const show = () => { if (enabled) setOpen(true); };
  return (
    <>
      <ButtonBase
        disableRipple
        aria-label="Ampliar la imagen"
        data-slot="aui-image-zoom-trigger"
        onClick={show}
        sx={(t) => ({
          display: 'block', width: '100%', textAlign: 'inherit', cursor: enabled ? 'zoom-in' : 'default',
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: -2 },
        })}
      >
        {children}
      </ButtonBase>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-label="Imagen ampliada"
        slotProps={{ backdrop: { sx: (t: Theme) => ({ bgcolor: alpha(t.palette.common.black, ZOOM_BACKDROP) }) } }}
        closeAfterTransition
        disableAutoFocus
      >
        <Fade in={open} timeout={theme.transitions.duration.shorter}>
          <Box data-slot="aui-image-zoom" onClick={() => setOpen(false)} sx={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}>
            <Box component="img" src={src} alt={alt} sx={{ maxWidth: ZOOM_MAX, maxHeight: ZOOM_MAX_H, objectFit: 'contain', cursor: 'zoom-out' }} />
            <AuiIconButton
              tooltip="Cerrar la imagen ampliada"
              autoFocus
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              size={4.5}
              sx={(t) => ({ position: 'absolute', top: t.spacing(2), right: t.spacing(2), bgcolor: alpha(t.palette.background.paper, ZOOM_BACKDROP), '&:hover': { bgcolor: 'background.paper', color: 'text.primary' }, '& svg': { width: ZOOM_CLOSE_ICON, height: ZOOM_CLOSE_ICON } })}
            >
              <X />
            </AuiIconButton>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

export function AuiImageGenerating() {
  return (
    <Box data-slot="aui-image-generating" sx={stateBoxSx}>
      <Box component={Loader2} sx={{ width: STATE_ICON, height: STATE_ICON, color: 'text.secondary', animation: `${spin} 1s linear infinite`, [REDUCED_MOTION]: { animation: 'none' } }} />
      <Box component="span" sx={visuallyHidden}>Generando imagen…</Box>
    </Box>
  );
}

export function AuiImageContentFilterError({ reason }: { reason?: string }) {
  return (
    <Stack spacing={1} alignItems="center" justifyContent="center" sx={(t) => ({ ...stateBoxSx(t), flexDirection: 'column', textAlign: 'center' })} data-slot="aui-image-content-filter">
      <Box component={ShieldAlert} sx={{ width: STATE_ICON, height: STATE_ICON, color: 'text.secondary' }} />
      <Typography variant="subtitle2">No se pudo generar la imagen</Typography>
      {reason && <Typography variant="caption" color="text.secondary">{reason}</Typography>}
    </Stack>
  );
}

export interface AuiImageActionsProps {
  part: ImageMessagePart;
  onRegenerate?: () => void | Promise<void>;
}

/** Descargar, copiar y, si se pasa `onRegenerate`, regenerar. */
export function AuiImageActions({ part, onRegenerate }: AuiImageActionsProps) {
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return undefined;
    const id = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <Stack direction="row" spacing={0.5} sx={{ p: 0.5 }} data-slot="aui-image-actions">
      <AuiIconButton tooltip="Descargar imagen" size={3.5} onClick={() => downloadImagePart(part)}><Download /></AuiIconButton>
      <AuiIconButton tooltip={copied ? 'Copiada' : 'Copiar imagen'} size={3.5} onClick={() => { copyImagePart(part).then(() => setCopied(true)).catch(() => undefined); }}>{copied ? <Check /> : <Copy />}</AuiIconButton>
      {onRegenerate && (
        <AuiIconButton
          tooltip="Regenerar imagen"
          size={3.5}
          disabled={regenerating}
          onClick={async () => { setRegenerating(true); try { await onRegenerate(); } catch { /* el host informa el error */ } finally { setRegenerating(false); } }}
        >
          <Box component={RefreshCw} sx={regenerating ? { animation: `${spin} 1s linear infinite`, [REDUCED_MOTION]: { animation: 'none' } } : undefined} />
        </AuiIconButton>
      )}
    </Stack>
  );
}

export type AuiImageProps = React.ComponentProps<ImageMessagePartComponent> & {
  variant?: AuiImageVariant;
  size?: AuiImageSize;
  /** Muestra descargar / copiar (y regenerar con `onRegenerate`) bajo la imagen cargada. */
  actions?: boolean;
  onRegenerate?: () => void | Promise<void>;
};

/** La parte de imagen completa. Úsala como `Image` de `MessagePrimitive.Parts`. */
export const AuiImage = React.memo(function AuiImage(props: AuiImageProps) {
  const { image, filename, status, variant, size, actions = false, onRegenerate } = props as AuiImageProps & { status?: { type: string; reason?: string } };
  const [loaded, setLoaded] = React.useState(false);
  if (status?.type === 'running') {
    return <AuiImageRoot variant={variant} size={size}><AuiImageGenerating /><AuiImageFilename>{filename}</AuiImageFilename></AuiImageRoot>;
  }
  if (status?.type === 'incomplete' && status.reason === 'content-filter') {
    return <AuiImageRoot variant={variant} size={size}><AuiImageContentFilterError reason="La imagen no se muestra porque el proveedor la bloqueó." /></AuiImageRoot>;
  }
  const alt = filename || 'Contenido de la imagen';
  return (
    <AuiImageRoot variant={variant} size={size}>
      <AuiImageZoom src={image} alt={alt} enabled={loaded}>
        <AuiImagePreview src={image} alt={alt} onLoadedChange={setLoaded} />
      </AuiImageZoom>
      <AuiImageFilename>{filename}</AuiImageFilename>
      {actions && loaded && <AuiImageActions part={{ type: 'image', image, filename }} onRegenerate={onRegenerate} />}
    </AuiImageRoot>
  );
}) as unknown as ImageMessagePartComponent & React.FC<AuiImageProps>;
