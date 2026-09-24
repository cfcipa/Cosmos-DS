import * as React from 'react';
import Box from '@mui/material/Box';

/** Burbuja del usuario para las demos del catálogo (la misma de Message pair). */
export function DemoBubble({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={(t) => ({
        alignSelf: 'flex-end',
        maxWidth: 340,
        px: 2,
        py: 1.5,
        borderRadius: 1,
        bgcolor: 'ai.userBubble',
        color: 'ai.userBubbleText',
        ...t.typography.body1,
      })}
    >
      {children}
    </Box>
  );
}
