// Cosmos DS · Kit IA · AUI connected: Sources.
// Referente: assistant-ui «Sources» (elements/sources.aui.tsx y sources.tsx).
// Las fuentes del mensaje: cada enlace es una ficha con el favicon del dominio y su título (o el dominio), que abre en
// una pestaña nueva; si el favicon no carga queda la inicial del dominio. Los documentos son una insignia con ícono de
// archivo, sin enlace. `AuiSourceCards` es el diseño estático: «Fuentes N» que despliega tarjetas de dos en dos.
import * as React from 'react';
import type { SourceMessagePartComponent } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip, { type ChipProps } from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, type Theme } from '@mui/material/styles';
import type { SxProps, SystemStyleObject } from '@mui/system';
import { ChevronDown, FileText } from 'lucide-react';
import { COLLAPSE_EASE, REDUCED_MOTION } from '../lib/shimmerText';
import { fieldInteractiveSx } from '../lib/thread';

export type AuiSourceVariant = 'outline' | 'secondary' | 'muted' | 'ghost' | 'info' | 'warning' | 'success' | 'destructive';
export type AuiSourceSize = 'sm' | 'default' | 'lg';

/** Medidas de assistant-ui: ícono de 12px, título de hasta 150px; fichas de 20, 24 y 32px de alto. */
const ICON = 1.5;
const TITLE_MAX = 150;
const HEIGHT: Record<AuiSourceSize, number> = { sm: 2.5, default: 3, lg: 4 };
const CARDS_MAX_WIDTH = 384;
const CARD_AVATAR = 2;

/** El dominio sin «www.»; si no es una URL, el texto tal cual. */
export function extractDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
export const defaultFaviconUrl = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;

function variantSx(t: Theme, variant: AuiSourceVariant): SystemStyleObject<Theme> {
  const soft = (c: 'info' | 'warning' | 'success' | 'error') => ({
    bgcolor: alpha(t.palette[c].main, t.palette.action.activatedOpacity),
    color: t.palette.mode === 'dark' ? t.palette[c].light : t.palette[c].dark,
    'a&:hover': { bgcolor: alpha(t.palette[c].main, t.palette.action.activatedOpacity + t.palette.action.hoverOpacity) },
  });
  switch (variant) {
    case 'secondary': return { bgcolor: 'action.selected', color: 'text.primary', 'a&:hover': { bgcolor: 'action.focus' } };
    case 'muted': return { bgcolor: 'action.hover', color: 'text.secondary', 'a&:hover': { bgcolor: 'action.selected', color: 'text.primary' } };
    case 'ghost': return { bgcolor: 'transparent', color: 'text.secondary', 'a&:hover': { bgcolor: 'action.hover', color: 'text.primary' } };
    case 'info': return soft('info');
    case 'warning': return soft('warning');
    case 'success': return soft('success');
    case 'destructive': return soft('error');
    default: return { bgcolor: 'transparent', color: 'text.secondary', border: 1, borderColor: 'divider', 'a&:hover': { bgcolor: 'action.hover', color: 'text.primary' } };
  }
}

export interface AuiSourceIconProps {
  url: string;
  /** Default: el servicio de favicons de DuckDuckGo. */
  faviconUrl?: (domain: string) => string;
}

/** El favicon del dominio; si falla, la inicial. */
export function AuiSourceIcon({ url, faviconUrl = defaultFaviconUrl }: AuiSourceIconProps) {
  const domain = extractDomain(url);
  const src = faviconUrl(domain);
  const [errorSrc, setErrorSrc] = React.useState<string>();
  if (errorSrc === src) {
    return (
      <Box
        component="span"
        data-slot="aui-source-icon-fallback"
        sx={(t) => ({
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: t.spacing(ICON), height: t.spacing(ICON),
          borderRadius: 0.5, bgcolor: 'action.selected', fontSize: t.typography.overline.fontSize, fontWeight: t.typography.fontWeightMedium, lineHeight: 1,
        })}
      >
        {domain.charAt(0).toUpperCase() || '?'}
      </Box>
    );
  }
  return (
    <Box
      component="img"
      data-slot="aui-source-icon"
      src={src}
      alt=""
      onError={() => setErrorSrc(src)}
      // Una imagen que falla antes de hidratar no dispara onError.
      ref={(el: HTMLImageElement | null) => { if (el?.complete && el.naturalWidth === 0) setErrorSrc(src); }}
      sx={(t) => ({ width: t.spacing(ICON), height: t.spacing(ICON), flexShrink: 0, borderRadius: 0.5 })}
    />
  );
}

export function AuiSourceTitle({ children }: { children: React.ReactNode }) {
  return <Box component="span" data-slot="aui-source-title" sx={{ maxWidth: TITLE_MAX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</Box>;
}

export interface AuiSourceProps extends Omit<ChipProps<'a'>, 'variant' | 'size' | 'label' | 'color' | 'children'> {
  href: string;
  variant?: AuiSourceVariant;
  size?: AuiSourceSize;
  children: React.ReactNode;
}

/** La ficha enlazada de una fuente. */
export function AuiSource({ href, variant = 'outline', size = 'default', children, sx, ...rest }: AuiSourceProps) {
  return (
    <Chip
      component="a"
      clickable
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="aui-source"
      label={<Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>{children}</Box>}
      {...rest}
      sx={[
        (t) => ({
          ...t.typography[size === 'lg' ? 'body2' : 'caption'], fontWeight: t.typography.fontWeightMedium, height: t.spacing(HEIGHT[size]),
          border: 0, borderRadius: 1, mr: 0.5, mb: 0.5, maxWidth: '100%',
          '& .MuiChip-label': { px: size === 'sm' ? 0.75 : size === 'lg' ? 1.25 : 1 },
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
          ...variantSx(t, variant),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

export interface AuiSourcesOptions {
  variant?: AuiSourceVariant;
  size?: AuiSourceSize;
  faviconUrl?: (domain: string) => string;
}
const SourcesOptions = React.createContext<AuiSourcesOptions>({});
/** Cambia variante, tamaño o favicon de las fuentes que van dentro (p. ej. en todo un hilo). */
export function AuiSourcesProvider({ children, variant, size, faviconUrl }: AuiSourcesOptions & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ variant, size, faviconUrl }), [variant, size, faviconUrl]);
  return <SourcesOptions.Provider value={value}>{children}</SourcesOptions.Provider>;
}

/** Una parte `source` del mensaje. Úsala como `Source` de `MessagePrimitive.Parts`. */
export const AuiSources: SourceMessagePartComponent = React.memo(function AuiSources(part) {
  const { variant, size, faviconUrl } = React.useContext(SourcesOptions);
  if (part.sourceType === 'url' && part.url) {
    const title = part.title || extractDomain(part.url);
    return (
      <AuiSource href={part.url} variant={variant} size={size} aria-label={`${title} (se abre en una pestaña nueva)`}>
        <AuiSourceIcon url={part.url} faviconUrl={faviconUrl} />
        <AuiSourceTitle>{title}</AuiSourceTitle>
      </AuiSource>
    );
  }
  if (part.sourceType === 'document') {
    return (
      <Chip
        size="small"
        data-slot="aui-source"
        icon={<Box component={FileText} sx={(t) => ({ width: t.spacing(ICON), height: t.spacing(ICON) })} />}
        label={<AuiSourceTitle>{part.title}</AuiSourceTitle>}
        sx={(t) => ({ ...t.typography.caption, fontWeight: t.typography.fontWeightMedium, borderRadius: 1, mr: 0.5, mb: 0.5, bgcolor: 'action.selected', '& .MuiChip-icon': { color: 'text.secondary', ml: 1 } })}
      />
    );
  }
  return null;
});

// ——— Tarjetas estáticas ———

export interface AuiSourceCard {
  domain: string;
  title: string;
}

export interface AuiSourceCardsProps {
  sources: readonly AuiSourceCard[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sx?: SxProps<Theme>;
}

export function AuiSourceCards({ sources, open, onOpenChange, sx }: AuiSourceCardsProps) {
  const mono = (t: Theme) => ({ fontFamily: t.aiKit.code.fontFamily, fontVariantNumeric: 'tabular-nums' });
  return (
    <Box data-slot="aui-source-cards" sx={[{ width: '100%', maxWidth: CARDS_MAX_WIDTH }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <ButtonBase
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        sx={(t) => ({
          ...t.typography.caption, ...fieldInteractiveSx(t), gap: 0.75, px: 1.75, py: 1, borderRadius: 1, color: 'text.secondary',
          '&:hover': { bgcolor: 'action.selected', color: 'text.primary' },
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
        })}
      >
        <span>Fuentes</span>
        <Box component="span" sx={(t) => ({ ...mono(t), color: 'text.disabled' })}>{sources.length}</Box>
        <Box
          component={ChevronDown}
          sx={(t) => ({
            width: t.spacing(ICON), height: t.spacing(ICON), opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none',
            transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter, easing: COLLAPSE_EASE }), [REDUCED_MOTION]: { transition: 'none' },
          })}
        />
      </ButtonBase>
      <Collapse in={open} easing={COLLAPSE_EASE}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, pt: 1.25 }}>
          {sources.map((s) => (
            <Paper
              key={s.domain}
              variant="outlined"
              sx={(t) => ({
                display: 'flex', flexDirection: 'column', gap: 0.75, p: 1.5,
                transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter }), '&:hover': { transform: 'translateY(-1px)' },
                [REDUCED_MOTION]: { transition: 'none' },
              })}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                <Box
                  component="span"
                  sx={(t) => ({
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: t.spacing(CARD_AVATAR), height: t.spacing(CARD_AVATAR),
                    borderRadius: 0.5, bgcolor: 'action.hover', color: 'text.secondary', fontSize: t.typography.overline.fontSize, fontWeight: t.typography.fontWeightMedium,
                  })}
                >
                  {s.domain.charAt(0).toUpperCase()}
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap sx={mono}>{s.domain}</Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.title}</Typography>
            </Paper>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
