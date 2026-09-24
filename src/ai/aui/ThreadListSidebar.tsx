// Cosmos DS · Kit IA · AUI connected: Thread list sidebar.
// Referente: assistant-ui «Thread list sidebar» (elements/threadlist-sidebar.aui.tsx, sobre el Sidebar de shadcn):
// la lista de hilos en una barra lateral junto a la conversación. Encabezado con la marca, la lista en medio y el pie
// (la cuenta). `collapsible`: 'offcanvas' la oculta del todo, 'icon' la reduce a un riel de íconos, 'none' la fija.
// `variant`: 'sidebar' (con borde), 'floating' (tarjeta separada) o 'inset' (la conversación es la tarjeta).
// `side` la pone a la izquierda o a la derecha. El riel del borde y el botón del encabezado la alternan.
import * as React from 'react';
import { ThreadListPrimitive, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PanelLeft, Plus } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';
import { AUI_NEW_CHAT, AuiThreadList } from './ThreadList';

export interface AuiThreadListSidebarProps {
  /** La conversación (normalmente `<AuiThread />`). */
  children: React.ReactNode;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  /** Abierta: controlada / no controlada. Default true. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** El encabezado de la barra: la marca de la aplicación. */
  brand?: { name: string; icon: React.ReactNode; href?: string };
  /** El pie de la barra: la cuenta. */
  account?: { name: string; detail?: string; initials: string };
}

/** Medidas del tablero: barra de 232px, riel de íconos de 48px, filas de marca de 48px, íconos de 32px. */
const WIDTH = 29;
const RAIL = 6;
const MENU_ROW = 6;
const MARK = 4;
const HEADER = 6;
const TOGGLE = 4.25;
const TOGGLE_ICON = 20;
const RAIL_HIT = 2;

function Mark({ children, round = false }: { children: React.ReactNode; round?: boolean }) {
  return (
    <Box component="span" sx={(t) => ({ width: t.spacing(MARK), height: t.spacing(MARK), flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: round ? '50%' : 1, ...(round ? { bgcolor: 'ai.userBubble', color: 'primary.main', ...t.typography.body2, fontWeight: t.typography.fontWeightMedium } : { bgcolor: 'primary.main', color: 'primary.contrastText' }) })}>
      {children}
    </Box>
  );
}

const menuRowSx = { width: '100%', justifyContent: 'flex-start', gap: 1, p: 1, borderRadius: 1, textAlign: 'left', color: 'text.primary', textDecoration: 'none', '&:hover': { bgcolor: 'action.hover' } } as const;

export function AuiThreadListSidebar({
  children, side = 'left', variant = 'sidebar', collapsible = 'offcanvas', open: openProp, defaultOpen = true, onOpenChange,
  brand = { name: 'Sinco', icon: null }, account,
}: AuiThreadListSidebarProps) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = collapsible === 'none' ? true : (openProp ?? openState);
  const setOpen = (v: boolean) => { if (openProp === undefined) setOpenState(v); onOpenChange?.(v); };
  const title = useAuiState((s) => s.threadListItem.title);
  const floating = variant === 'floating';
  const inset = variant === 'inset';
  const border = side === 'left' ? 'borderRight' : 'borderLeft';

  const full = (
    <Box
      component="aside"
      data-slot="aui-thread-list-sidebar"
      data-variant={variant}
      sx={(t) => ({
        position: 'relative', width: t.spacing(WIDTH), flexShrink: 0, display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
        bgcolor: inset ? 'transparent' : 'background.paper',
        ...(floating ? { m: 1, borderRadius: 1, boxShadow: t.shadows[1] } : inset ? {} : { [border]: 1, borderColor: 'divider' }),
      })}
    >
      <Box sx={{ mb: 1, p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <ButtonBase component={brand.href ? 'a' : 'div'} {...(brand.href ? { href: brand.href, target: '_blank', rel: 'noopener noreferrer' } : {})} sx={(t) => ({ ...menuRowSx, height: t.spacing(MENU_ROW) })}>
          <Mark>{brand.icon}</Mark>
          <Typography variant="subtitle1" component="span">{brand.name}</Typography>
        </ButtonBase>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1 }}>
        <AuiThreadList />
      </Box>
      {account ? (
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <ButtonBase sx={(t) => ({ ...menuRowSx, height: t.spacing(MENU_ROW) })}>
            <Mark round>{account.initials}</Mark>
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" component="span" noWrap>{account.name}</Typography>
              {account.detail ? <Typography variant="body2" color="text.secondary" noWrap>{account.detail}</Typography> : null}
            </Stack>
          </ButtonBase>
        </Box>
      ) : null}
      {collapsible !== 'none' ? (
        <ButtonBase
          tabIndex={-1}
          aria-label="Alternar la barra lateral"
          onClick={() => setOpen(!open)}
          sx={(t) => ({
            position: 'absolute', top: 0, bottom: 0, [side === 'left' ? 'right' : 'left']: t.spacing(-1), zIndex: 1, width: t.spacing(RAIL_HIT), cursor: 'ew-resize',
            '&::after': { content: '""', position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', transform: 'translateX(-50%)', bgcolor: 'transparent', transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }) },
            '&:hover::after': { bgcolor: 'divider' },
            [REDUCED_MOTION]: { '&::after': { transition: 'none' } },
          })}
        />
      ) : null}
    </Box>
  );

  const iconRail = (
    <Stack component="aside" alignItems="center" spacing={1} sx={(t) => ({ width: t.spacing(RAIL), flexShrink: 0, py: 1, [border]: 1, borderColor: 'divider', bgcolor: 'background.paper' })}>
      <Mark>{brand.icon}</Mark>
      <ThreadListPrimitive.New asChild>
        <AuiIconButton tooltip="Nuevo hilo" side={side === 'left' ? 'right' : 'left'} size={TOGGLE} sx={{ '& svg': { width: TOGGLE_ICON, height: TOGGLE_ICON } }}><Plus /></AuiIconButton>
      </ThreadListPrimitive.New>
      <Box sx={{ flex: 1 }} />
      {account ? <Mark round>{account.initials}</Mark> : null}
    </Stack>
  );

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: side === 'left' ? 'row' : 'row-reverse', width: '100%', height: '100%', overflow: 'hidden', bgcolor: floating || inset ? 'background.default' : 'background.paper' }}>
      {open ? full : collapsible === 'icon' ? iconRail : null}
      <Paper
        component="main"
        elevation={inset ? 1 : 0}
        square={!inset}
        sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', m: inset ? 1 : 0, bgcolor: 'background.paper' }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={(t) => ({ height: t.spacing(HEADER), flexShrink: 0, px: 1, borderBottom: 1, borderColor: 'divider' })}>
          {collapsible !== 'none' ? (
            <>
              <AuiIconButton tooltip="Alternar la barra lateral" aria-expanded={open} size={TOGGLE} onClick={() => setOpen(!open)} sx={{ '& svg': { width: TOGGLE_ICON, height: TOGGLE_ICON } }}><PanelLeft /></AuiIconButton>
              <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
            </>
          ) : null}
          <Typography variant="subtitle1" component="h2" noWrap sx={{ m: 0, minWidth: 0 }}>{title || AUI_NEW_CHAT}</Typography>
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
      </Paper>
    </Box>
  );
}
