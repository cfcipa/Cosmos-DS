// Cosmos DS · Kit IA · Knowledge: Map.
// Tablero «Map»: una respuesta de ubicación: pines, una ruta entre ellos y la lista de donde salen.
// Como en assistant-ui: los pines se ubican en porcentaje (x/y del área, no latitud/longitud), la ruta punteada los une
// en orden y el pin activo es el mismo que la fila activa (aria-current). Con onSelect pin y fila son botones; sin él,
// el mapa es contenido estático. Paper outlined; la lista es una List de MUI con ListItemButton (selected).
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { primaryTint } from '../lib/primaryTint';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface MapPin {
  id: string;
  label: string;
  /** «salida», «18 min». */
  detail: string;
  /** Posición en % del área del mapa. */
  x: number;
  y: number;
}

export interface MapAnswerProps {
  pins: readonly MapPin[];
  activeId: string;
  /** Une los pines en orden con una ruta punteada. Default true. */
  route?: boolean;
  /** Sin él, pines y filas son solo lectura. */
  onSelect?: (id: string) => void;
  className?: string;
}

/** Medidas del tablero: el área del mapa (su viewBox) y el pin (zona táctil, insignia y activa). */
const MAP_W = 384;
const MAP_H = 160;
const PIN_HIT = 3.5;
const BADGE = 2.5;
const BADGE_ACTIVE = 3.25;
const EASE = 'cubic-bezier(.32, .72, 0, 1)';

/** El fondo del mapa del tablero (agua, parques y calles), con colores del tema. */
function MapArt({ points, showRoute }: { points: string; showRoute: boolean }) {
  return (
    <Box
      component="svg"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      sx={(t: Theme) => ({
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        '& [data-part="water"]': { fill: alpha(t.palette.secondary.main, 0.16) },
        '& [data-part="park"]': { fill: alpha(t.palette.success.main, 0.16) },
        '& [data-part="roads"]': { stroke: t.palette.background.paper },
        '& [data-part="route"]': { stroke: t.palette.primary.main },
      })}
    >
      <path data-part="water" d="M0 132 C60 118 110 150 170 140 C230 130 280 150 384 128 L384 160 L0 160 Z" />
      <rect data-part="park" x="214" y="70" width="70" height="36" rx="3" />
      <rect data-part="park" x="20" y="14" width="48" height="30" rx="3" />
      <g data-part="roads" strokeLinecap="round" fill="none">
        <path d="M0 56 L384 34" strokeWidth="9" />
        <path d="M132 0 L150 160" strokeWidth="9" />
        <path d="M0 98 L384 88" strokeWidth="5" />
        <path d="M52 0 L64 160" strokeWidth="5" />
        <path d="M226 0 L236 160" strokeWidth="5" />
        <path d="M310 0 L300 160" strokeWidth="5" />
        <path d="M0 18 L384 6" strokeWidth="3" />
        <path d="M186 0 L194 160" strokeWidth="3" />
        <path d="M96 0 L104 160" strokeWidth="3" />
        <path d="M348 0 L352 160" strokeWidth="3" />
      </g>
      <polyline
        data-part="route"
        points={points}
        fill="none"
        strokeOpacity={showRoute ? 0.6 : 0}
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </Box>
  );
}

const badgeSx = (active: boolean) => (t: Theme) => ({
  width: t.spacing(active ? BADGE_ACTIVE : BADGE),
  height: t.spacing(active ? BADGE_ACTIVE : BADGE),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: 2,
  borderColor: 'background.paper',
  bgcolor: active ? 'primary.main' : primaryTint(t),
  color: active ? 'primary.contrastText' : 'primary.main',
  ...t.typography.caption,
  fontWeight: t.typography.fontWeightBold,
  fontVariantNumeric: 'tabular-nums',
  boxShadow: active ? t.shadows[2] : t.shadows[1],
  transition: t.transitions.create(['width', 'height', 'background-color', 'color', 'box-shadow'], { duration: t.transitions.duration.shorter, easing: EASE }),
  [REDUCED_MOTION]: { transition: 'none' },
});

export function MapAnswer({ pins, activeId, route = true, onSelect, className }: MapAnswerProps) {
  const points = pins.map((pin) => `${((pin.x / 100) * MAP_W).toFixed(1)},${((pin.y / 100) * MAP_H).toFixed(1)}`).join(' ');

  return (
    <Paper variant="outlined" className={className} data-slot="map-answer" sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={(t) => ({ position: 'relative', height: t.spacing(MAP_H / 8), bgcolor: 'ai.surfaceMuted' })}>
        <MapArt points={points} showRoute={route && pins.length > 1} />
        {pins.map((pin, i) => {
          const isActive = pin.id === activeId;
          const pinSx = (t: Theme) => ({
            position: 'absolute' as const,
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            width: t.spacing(PIN_HIT),
            height: t.spacing(PIN_HIT),
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&.Mui-focusVisible > span': { boxShadow: `0 0 0 2px ${t.palette.background.paper}, 0 0 0 4px ${t.palette.ai.focusRing}` },
          });
          const badge = <Box component="span" sx={badgeSx(isActive)}>{i + 1}</Box>;
          return onSelect ? (
            <ButtonBase key={pin.id} disableRipple aria-label={`${i + 1}. ${pin.label}`} aria-current={isActive || undefined} onClick={() => onSelect(pin.id)} sx={pinSx}>
              {badge}
            </ButtonBase>
          ) : (
            <Box key={pin.id} component="span" role="img" aria-label={`${i + 1}. ${pin.label}`} aria-current={isActive || undefined} sx={pinSx}>{badge}</Box>
          );
        })}
      </Box>

      <List disablePadding aria-label="Lugares">
        {pins.map((pin, i) => {
          const isActive = pin.id === activeId;
          const content = (
            <>
              <ListItemAvatar sx={(t) => ({ minWidth: t.spacing(4.5) })}>
                <Avatar
                  aria-hidden="true"
                  sx={(t) => ({
                    width: t.spacing(3),
                    height: t.spacing(3),
                    ...t.typography.body3,
                    fontWeight: t.typography.fontWeightBold,
                    bgcolor: isActive ? 'primary.main' : primaryTint(t),
                    color: isActive ? 'primary.contrastText' : 'primary.main',
                    transition: t.transitions.create(['background-color', 'color'], { duration: t.transitions.duration.shorter }),
                  })}
                >
                  {i + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={pin.label}
                primaryTypographyProps={{ variant: 'body1', noWrap: true, fontWeight: isActive ? 'fontWeightMedium' : undefined }}
                sx={{ minWidth: 0, my: 0 }}
              />
              <Typography variant="body3" color="text.secondary" sx={{ flexShrink: 0, ml: 1.5, fontVariantNumeric: 'tabular-nums' }}>{pin.detail}</Typography>
            </>
          );
          const rowSx = { minHeight: (t: Theme) => t.spacing(5.5), px: 2, py: 0.5, borderTop: 1, borderColor: 'divider' } as const;
          return (
            <ListItem key={pin.id} disablePadding>
              {onSelect ? (
                <ListItemButton selected={isActive} aria-current={isActive || undefined} onClick={() => onSelect(pin.id)} sx={rowSx}>{content}</ListItemButton>
              ) : (
                <Stack
                  direction="row"
                  alignItems="center"
                  aria-current={isActive || undefined}
                  sx={(t) => ({ ...rowSx, minHeight: t.spacing(5.5), width: '100%', ...(isActive ? { bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity) } : null) })}
                >
                  {content}
                </Stack>
              )}
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
