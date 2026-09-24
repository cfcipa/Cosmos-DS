// Cosmos DS · Kit IA · Thread: Empty state.
// Tablero «Empty state»: un saludo, tres maneras de empezar y el composer al frente.
// Como en assistant-ui: el saludo entra primero, las sugerencias en cascada (120 ms + 70 ms por índice) y el composer
// a los 360 ms. Elegir una sugerencia llena el composer con su prompt; no lo envía.
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { Composer, type ComposerProps } from '../composer';
import { riseSx } from '../lib/thread';

/** Tiempos del tablero. */
const SUGGESTION_DELAY_MS = 120;
const SUGGESTION_STAGGER_MS = 70;
const COMPOSER_DELAY_MS = 360;
const MAX_WIDTH = 480;

interface SlotProps { children?: React.ReactNode; className?: string; sx?: SxProps<Theme> }

export function EmptyState({ children, className, sx }: SlotProps) {
  return (
    <Stack data-slot="empty-state" alignItems="center" spacing={2.5} className={className} sx={[{ width: '100%', maxWidth: MAX_WIDTH }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </Stack>
  );
}

export function EmptyStateGreeting({ children, className }: SlotProps) {
  return (
    <Typography variant="h3" component="h2" data-slot="empty-state-greeting" className={className} sx={(t) => ({ m: 0, textAlign: 'center', ...riseSx(t) })}>
      {children}
    </Typography>
  );
}

export function EmptyStateSuggestions({ children, className }: SlotProps) {
  return (
    <Stack data-slot="empty-state-suggestions" direction="row" useFlexGap className={className} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
      {children}
    </Stack>
  );
}

export interface EmptyStateSuggestionProps {
  label: string;
  onClick?: () => void;
  /** Posición en la lista: define el retraso de su entrada. */
  index?: number;
  className?: string;
}

export function EmptyStateSuggestion({ label, onClick, index = 0, className }: EmptyStateSuggestionProps) {
  return (
    <Chip
      variant="outlined"
      clickable
      label={label}
      onClick={onClick}
      data-slot="empty-state-suggestion"
      className={className}
      sx={(t) => riseSx(t, SUGGESTION_DELAY_MS + index * SUGGESTION_STAGGER_MS)}
    />
  );
}

/** El Composer del kit en modo compacto, entrando al final. */
export function EmptyStateComposer(props: Omit<ComposerProps, 'compact'>) {
  return (
    <Box data-slot="empty-state-composer" sx={(t) => ({ width: '100%', ...riseSx(t, COMPOSER_DELAY_MS) })}>
      <Composer compact {...props} />
    </Box>
  );
}
