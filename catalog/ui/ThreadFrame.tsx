import * as React from 'react';
import Box from '@mui/material/Box';

/** El marco de las demos con hilo: en la página, con el margen del tablero; en la tarjeta, de 212px. */
export function ThreadFrame({ card = false, children }: { card?: boolean; children: React.ReactNode }) {
  const frame = <Box sx={{ height: card ? 212 : '100%', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>{children}</Box>;
  return card ? frame : <Box sx={{ height: '100%', p: 2.5, boxSizing: 'border-box' }}>{frame}</Box>;
}
