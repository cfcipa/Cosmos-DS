// Cosmos DS · Kit IA · AUI connected: File.
// Referente: assistant-ui «File» (elements/file.tsx).
// Una parte de archivo del mensaje: el ícono según el tipo (imagen, PDF o texto, JSON, audio, video, genérico), el
// nombre recortado, el tamaño cuando el archivo viene en línea (base64 o data URI) y el botón de descarga. Una URL
// http(s) o blob se abre en una pestaña nueva; una referencia por id no se descarga ni muestra tamaño.
import * as React from 'react';
import type { FileMessagePartComponent } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import type { SxProps, SystemStyleObject } from '@mui/system';
import { Braces, Check, Download, File as FileIconBase, FileText, Image as ImageIcon, Music, Video } from 'lucide-react';
import { AuiIconButton } from './AuiIconButton';

export type AuiFileVariant = 'outline' | 'ghost' | 'muted';
export type AuiFileSize = 'sm' | 'default' | 'lg';
export type AuiFileDataKind = 'data-uri' | 'url' | 'base64' | 'id';

/** Medidas de assistant-ui: ícono de 20px; relleno de 10/6, 12/8 y 16/12px según el tamaño. */
const ICON_SIZE = 20;
const PADDING: Record<AuiFileSize, [number, number]> = { sm: [1.25, 0.75], default: [1.5, 1], lg: [2, 1.5] };
const TYPE: Record<AuiFileSize, 'caption' | 'body2' | 'body1'> = { sm: 'caption', default: 'body2', lg: 'body1' };
const KB = 1024;
const MB = KB * KB;
/** Cuánto se ve la marca de descargado. */
const DONE_MS = 1600;

/** El ícono de lucide para el tipo MIME. */
export function getMimeTypeIcon(mimeType: string) {
  const type = mimeType.toLowerCase();
  if (type.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf' || type.startsWith('text/')) return FileText;
  if (type === 'application/json') return Braces;
  if (type.startsWith('audio/')) return Music;
  if (type.startsWith('video/')) return Video;
  return FileIconBase;
}

/** Cómo viene el contenido: en línea (base64 o data URI), por URL o por id. */
export function getFileDataKind(data: string, sourceType?: 'url' | 'id'): AuiFileDataKind {
  if (sourceType === 'url' && /^data:/i.test(data)) return 'data-uri';
  if (sourceType) return sourceType;
  if (/^data:/i.test(data)) return 'data-uri';
  if (/^https?:\/\//i.test(data)) return 'url';
  return 'base64';
}

function base64PayloadSize(payload: string) {
  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
  const invalid = payload.search(/[^A-Za-z\d+/]/);
  if ((invalid !== -1 && invalid !== payload.length - padding) || payload.length % 4 === 1 || (padding > 0 && payload.length % 4 !== 0)) return 0;
  return Math.floor((payload.length * 3) / 4) - padding;
}
export function getBase64Size(base64: string) {
  return base64PayloadSize(/[\t\n\f\r ]/.test(base64) ? base64.replace(/[\t\n\f\r ]/g, '') : base64);
}
export function getDataUrlSize(data: string) {
  const fragment = data.indexOf('#');
  const end = fragment < 0 ? data.length : fragment;
  const comma = data.indexOf(',');
  if (comma < 0 || comma >= end) return 0;
  let payload = data.slice(comma + 1, end);
  if (/;base64$/i.test(data.slice(0, comma))) {
    if (/[%\t\n\f\r ]/.test(payload)) payload = payload.replace(/%([\da-f]{2})/gi, (_m, hex: string) => String.fromCharCode(Number.parseInt(hex, 16))).replace(/[\t\n\f\r ]/g, '');
    return base64PayloadSize(payload);
  }
  // Cada escape por ciento es un byte, también los octetos que no son UTF-8 válido.
  return new TextEncoder().encode(payload.replace(/%[\da-f]{2}/gi, '_')).byteLength;
}

/** «512 B», «182,4 KB», «3,1 MB». */
export function formatFileSize(bytes: number) {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1).replace('.', ',')} KB`;
  return `${(bytes / MB).toFixed(1).replace('.', ',')} MB`;
}

const variantSx = (variant: AuiFileVariant): SystemStyleObject<Theme> => {
  if (variant === 'ghost') return { '&:hover': { bgcolor: 'action.hover' } };
  if (variant === 'muted') return { bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } };
  return { border: 1, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } };
};

export interface AuiFileRootProps {
  variant?: AuiFileVariant;
  size?: AuiFileSize;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

export function AuiFileRoot({ variant = 'outline', size = 'default', sx, children }: AuiFileRootProps) {
  const [px, py] = PADDING[size];
  return (
    <Box
      data-slot="aui-file"
      data-variant={variant}
      data-size={size}
      sx={[
        (t) => ({
          ...t.typography[TYPE[size]], display: 'inline-flex', alignItems: 'center', gap: 1.5, px, py, borderRadius: 1, maxWidth: '100%', boxSizing: 'border-box',
          transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
          ...variantSx(variant),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export function AuiFileIcon({ mimeType }: { mimeType?: string }) {
  const Icon = mimeType ? getMimeTypeIcon(mimeType) : FileIconBase;
  return <Box component={Icon} data-slot="aui-file-icon" sx={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0, color: 'text.secondary' }} />;
}

export function AuiFileName({ children }: { children?: React.ReactNode }) {
  return <Box component="span" data-slot="aui-file-name" sx={{ minWidth: 0, fontWeight: 'fontWeightMedium', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children || 'Archivo sin nombre'}</Box>;
}

export function AuiFileSize({ bytes }: { bytes: number }) {
  return <Typography component="span" variant="caption" color="text.secondary" data-slot="aui-file-size">{formatFileSize(bytes)}</Typography>;
}

export interface AuiFileDownloadProps {
  data: string;
  mimeType: string;
  filename?: string;
  sourceType?: 'url' | 'id';
}

/** Descargar (en línea) o abrir en una pestaña nueva (URL). Por id, nada. */
export function AuiFileDownload({ data, mimeType, filename, sourceType }: AuiFileDownloadProps) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!done) return undefined;
    const id = window.setTimeout(() => setDone(false), DONE_MS);
    return () => window.clearTimeout(id);
  }, [done]);
  if (typeof data !== 'string') return null;
  const kind = getFileDataKind(data, sourceType);
  if (kind === 'id') return null;
  if (kind === 'url' && !/^(https?:\/\/|blob:)/i.test(data)) return null;
  const href = kind === 'base64' ? `data:${mimeType};base64,${data}` : data;
  const name = filename || 'archivo';
  const opens = kind === 'url';
  return (
    <AuiIconButton
      component="a"
      href={href}
      download={name}
      {...(opens ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      tooltip={done ? 'Descargado' : opens ? 'Abrir en una pestaña nueva' : 'Descargar'}
      aria-label={`Descargar ${name}`}
      data-slot="aui-file-download"
      onClick={() => setDone(true)}
      sx={{ flexShrink: 0 }}
    >
      {done ? <Check /> : <Download />}
    </AuiIconButton>
  );
}

export type AuiFileProps = React.ComponentProps<FileMessagePartComponent> & { variant?: AuiFileVariant; size?: AuiFileSize };

/** La parte de archivo completa. Úsala como `File` de `MessagePrimitive.Parts`. */
export const AuiFile = React.memo(function AuiFile({ filename, data, mimeType, sourceType, variant, size }: AuiFileProps) {
  const kind = getFileDataKind(data, sourceType);
  const inline = typeof data === 'string' && (kind === 'base64' || kind === 'data-uri');
  return (
    <AuiFileRoot variant={variant} size={size}>
      <AuiFileIcon mimeType={mimeType} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0, flex: 1 }}>
        <AuiFileName>{filename}</AuiFileName>
        {inline && <AuiFileSize bytes={kind === 'data-uri' ? getDataUrlSize(data) : getBase64Size(data)} />}
      </Box>
      <AuiFileDownload data={data} mimeType={mimeType} filename={filename} sourceType={sourceType} />
    </AuiFileRoot>
  );
}) as unknown as FileMessagePartComponent & React.FC<AuiFileProps>;
