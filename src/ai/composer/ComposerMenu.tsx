// Cosmos DS · Kit IA · Composer: menús del composer (Slash commands, Mentions, Models).
// Como en assistant-ui (ComposerMenu / ComposerMenuItem): el menú flota sobre el composer sin robar el foco; el texto sigue
// teniendo el foco y la opción activa se anuncia con aria-activedescendant. El clic en una opción no le quita el foco al texto.
// Paper elevation 8 con una lista de MenuItem de MUI (role «option»).
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import type { MenuItemProps } from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { Check } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import type { ComposerCommand, ComposerPerson } from './matches';

const pop = keyframes`from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; }`;

export interface ComposerMenuProps {
  id?: string;
  /** Nombre accesible de la lista. */
  label: string;
  /** Ancho del tablero, en px. Default 288. */
  width?: number;
  /** Título sobre las opciones (ListSubheader). */
  subheader?: string;
  /** 'listbox' (comandos, menciones) o 'menu' (modelos). Default 'listbox'. */
  role?: 'listbox' | 'menu';
  children: React.ReactNode;
}

export function ComposerMenu({ id, label, width = 288, subheader, role = 'listbox', children }: ComposerMenuProps) {
  return (
    <Paper
      elevation={8}
      data-slot="composer-menu"
      sx={(t) => ({
        width,
        maxWidth: '100%',
        py: subheader ? 0 : 1,
        pb: 1,
        transformOrigin: 'bottom left',
        animation: `${pop} ${t.transitions.duration.shortest}ms ${t.transitions.easing.easeOut}`,
        [REDUCED_MOTION]: { animation: 'none' },
      })}
    >
      <Box component="ul" id={id} role={role} aria-label={label} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {subheader ? <ListSubheader component="li" role="presentation" disableSticky sx={{ bgcolor: 'inherit', backgroundImage: 'inherit' }}>{subheader}</ListSubheader> : null}
        {children}
      </Box>
    </Paper>
  );
}

export interface ComposerMenuItemProps extends Omit<MenuItemProps, 'role'> {
  /** Opción resaltada con el teclado (aria-selected). */
  active?: boolean;
  role?: 'option' | 'menuitemradio';
}

/** Una opción: MenuItem de MUI; el mousedown no le quita el foco al texto. */
export function ComposerMenuItem({ active = false, role = 'option', sx, onMouseDown, ...props }: ComposerMenuItemProps) {
  return (
    <MenuItem
      role={role}
      aria-selected={role === 'option' ? active : undefined}
      tabIndex={-1}
      onMouseDown={(event) => { event.preventDefault(); onMouseDown?.(event); }}
      sx={[{ minHeight: (t) => t.spacing(4.5), ...(active ? { bgcolor: 'action.focus' } : null) }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    />
  );
}

/** Slash commands: ícono, «/nombre», descripción y ↵ en la opción activa. */
export function ComposerCommandItem({ command, active, ...props }: Omit<ComposerMenuItemProps, 'children'> & { command: ComposerCommand; active: boolean }) {
  const Icon = command.icon;
  return (
    <ComposerMenuItem active={active} {...props}>
      <ListItemIcon aria-hidden="true"><Icon size={20} /></ListItemIcon>
      <Typography variant="body1" sx={{ fontWeight: 'fontWeightMedium', whiteSpace: 'nowrap' }}>/{command.name}</Typography>
      <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: '1 1 auto', minWidth: 0, ml: 1.5 }}>{command.description}</Typography>
      {active ? <Typography variant="body2" color="text.secondary" aria-hidden="true" sx={{ ml: 2 }}>↵</Typography> : null}
    </ComposerMenuItem>
  );
}

/** Mentions: avatar (agente en primary, persona con el Avatar del tema), nombre y tipo. */
export function ComposerPersonItem({ person, active, ...props }: Omit<ComposerMenuItemProps, 'children'> & { person: ComposerPerson; active: boolean }) {
  const isAgent = person.role === 'agent';
  return (
    <ComposerMenuItem active={active} {...props}>
      <ListItemIcon aria-hidden="true">
        <Avatar sx={(t) => ({ width: t.spacing(3), height: t.spacing(3), ...t.typography.body3, ...(isAgent ? { bgcolor: 'primary.main', color: 'primary.contrastText' } : null) })}>
          {person.name.charAt(0)}
        </Avatar>
      </ListItemIcon>
      <Typography variant="body1" noWrap sx={{ flex: '1 1 auto', minWidth: 0 }}>{person.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>{isAgent ? 'agente' : 'persona'}</Typography>
    </ComposerMenuItem>
  );
}

export interface ComposerModel {
  name: string;
  /** «1M ctx», «200k ctx». */
  meta: string;
}

/** Models: check en el modelo elegido, nombre y contexto. `selected` usa el resaltado de MUI. */
export function ComposerModelItem({ model, selected, ...props }: Omit<ComposerMenuItemProps, 'children' | 'role'> & { model: ComposerModel; selected: boolean }) {
  return (
    <ComposerMenuItem role="menuitemradio" aria-checked={selected} selected={selected} {...props}>
      <ListItemIcon aria-hidden="true" sx={{ color: 'primary.main' }}>{selected ? <Check size={20} /> : null}</ListItemIcon>
      <Typography variant="body1" sx={{ flexGrow: 1 }}>{model.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>{model.meta}</Typography>
    </ComposerMenuItem>
  );
}
