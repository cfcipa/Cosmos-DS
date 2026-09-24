// Cosmos DS · Kit IA · Knowledge: Web search.
// Tablero «Web search»: una búsqueda y sus resultados llegando uno a uno mientras el asistente lee.
// Como en assistant-ui: la consulta en un chip, los resultados que se revelan por conteo (visibleResults) y un alto
// reservado para que la lista no empuje la respuesta mientras llega; `cycle` vuelve a animar al repetir la búsqueda.
// Como en el tablero, va dentro del disparador plegable de la herramienta: «Buscando» mientras corre, «Leí N fuentes» al terminar.
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { Check, ChevronDown, Search } from 'lucide-react';
import { font } from '../lib/font';
import { REDUCED_MOTION, shimmerTextSx } from '../lib/shimmerText';
import { useControllable } from '../lib/useControllable';
import { formatToolDuration } from '../tool-call';

export interface WebSearchResult {
  title: string;
  domain: string;
  /** Se abre en una pestaña nueva. Sin él, la fila no es un enlace. */
  url?: string;
  /** Favicon del sitio. Si no carga, se muestra la inicial del dominio. */
  iconUrl?: string;
}

export interface WebSearchProps {
  query: string;
  results: readonly WebSearchResult[];
  /** Cuántos resultados se ven (se revelan uno a uno). */
  visibleResults: number;
  /** status.type === 'running'. */
  searching: boolean;
  /** Súbelo al repetir la búsqueda: los resultados vuelven a entrar animados. Default 0. */
  cycle?: number;
  /** Tiempo de la búsqueda; formato «1,2s». */
  durationMs?: number;
  /** Contenido desplegado: controlado / no controlado. Default abierto. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Se llama al abrir un resultado; el enlace abre en una pestaña nueva salvo que llames event.preventDefault(). */
  onOpenResult?: (result: WebSearchResult, event: React.MouseEvent) => void;
  /** Default 'Buscando'. */
  searchingLabel?: string;
  /** Default «Leí 1 fuente» / «Leí N fuentes». */
  doneLabel?: (count: number) => string;
  /** Default 'No encontré fuentes'. */
  emptyLabel?: string;
  className?: string;
}

const ICON_SIZE = 16;
/** Filas que reserva la lista (min-h de la referencia: tres resultados). */
const RESERVED_ROWS = 3;
const EASE = 'cubic-bezier(.32, .72, 0, 1)';

const rise = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;
const defaultDoneLabel = (count: number) => `Leí ${count} ${count === 1 ? 'fuente' : 'fuentes'}`;

/** Favicon con la inicial del dominio como respaldo (Avatar de MUI muestra los hijos si la imagen falla). */
export function SourceIcon({ domain, iconUrl, size = 2 }: { domain: string; iconUrl?: string; size?: number }) {
  return (
    <Avatar
      variant="rounded"
      src={iconUrl}
      alt=""
      aria-hidden="true"
      sx={(t) => ({
        width: t.spacing(size),
        height: t.spacing(size),
        borderRadius: 0.5,
        bgcolor: 'action.selected',
        color: 'text.secondary',
        ...font(t.typography.caption),
        fontWeight: t.typography.fontWeightBold,
      })}
    >
      {domain.charAt(0).toUpperCase()}
    </Avatar>
  );
}

export function WebSearch({
  query,
  results,
  visibleResults,
  searching,
  cycle = 0,
  durationMs,
  open,
  defaultOpen = true,
  onOpenChange,
  onOpenResult,
  searchingLabel = 'Buscando',
  doneLabel = defaultDoneLabel,
  emptyLabel = 'No encontré fuentes',
  className,
}: WebSearchProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const panelId = React.useId();
  const shown = results.slice(0, Math.max(0, Math.min(results.length, visibleResults)));
  const statusText = searching ? searchingLabel : results.length === 0 ? emptyLabel : doneLabel(results.length);

  return (
    <Box className={className} data-slot="web-search" sx={{ width: '100%' }}>
      <ButtonBase
        disableRipple
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpen(!isOpen)}
        sx={(t) => ({
          maxWidth: '100%',
          gap: 1,
          py: 0.75,
          borderRadius: 1,
          ...font(t.typography.body1),
          color: 'text.secondary',
          transition: t.transitions.create('color', { duration: t.transitions.duration.shortest }),
          '&:hover': { color: 'text.primary' },
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
        })}
      >
        <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', color: searching ? 'ai.toolStatus.running' : 'ai.toolStatus.complete' }}>
          {searching ? <CircularProgress size={ICON_SIZE - 2} thickness={4.4} disableShrink color="inherit" /> : <Check size={ICON_SIZE} />}
        </Box>
        <Box component="span" role="status" sx={(t) => ({ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...(searching ? shimmerTextSx(t) : null) })}>
          {statusText}
        </Box>
        {durationMs !== undefined ? (
          <Typography variant="caption" component="span" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatToolDuration(durationMs)}
          </Typography>
        ) : null}
        <Box
          component="span"
          aria-hidden="true"
          sx={(t) => ({ display: 'inline-flex', transform: isOpen ? 'none' : 'rotate(-90deg)', transition: t.transitions.create('transform', { duration: t.transitions.duration.shorter, easing: EASE }) })}
        >
          <ChevronDown size={ICON_SIZE} />
        </Box>
      </ButtonBase>

      <Collapse in={isOpen} id={panelId}>
        <Stack spacing={1} sx={{ pl: 3, pt: 0.5, pb: 1 }}>
          <Chip
            size="small"
            variant="outlined"
            icon={<Search size={ICON_SIZE - 2} />}
            label={query}
            title={query}
            sx={{ alignSelf: 'flex-start', maxWidth: '100%' }}
          />
          <List
            dense
            disablePadding
            aria-label="Resultados de la búsqueda"
            sx={(t) => ({ mx: -1, minHeight: `calc((${t.typography.body1.lineHeight} + ${t.spacing(1.5)}) * ${RESERVED_ROWS})` })}
          >
            {shown.map((result) => {
              const content = (
                <>
                  <SourceIcon domain={result.domain} iconUrl={result.iconUrl} />
                  <ListItemText primary={result.title} primaryTypographyProps={{ variant: 'body1', noWrap: true }} sx={{ my: 0, minWidth: 0 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{result.domain}</Typography>
                </>
              );
              const rowSx = (t: Theme) => ({
                gap: 1.25,
                px: 1,
                py: 0.75,
                borderRadius: 1,
                animation: `${rise} ${t.transitions.duration.standard}ms ${t.transitions.easing.easeOut} both`,
                [REDUCED_MOTION]: { animation: 'none' },
              });
              return (
                <ListItem key={`${cycle}-${result.domain}`} disablePadding>
                  {result.url ? (
                    <ListItemButton
                      component="a"
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${result.title}, ${result.domain} (se abre en una pestaña nueva)`}
                      onClick={(event: React.MouseEvent) => onOpenResult?.(result, event)}
                      sx={rowSx}
                    >
                      {content}
                    </ListItemButton>
                  ) : (
                    <Stack direction="row" alignItems="center" sx={(t) => ({ width: '100%', ...rowSx(t) })}>{content}</Stack>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Stack>
      </Collapse>
    </Box>
  );
}
