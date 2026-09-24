import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/** Marco de demo como las tarjetas del catálogo de assistant-ui: superficie de mensaje, borde, sin sombra. */
export function DemoFrame({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Stack spacing={2}>
        {title ? <Typography variant="overline" color="text.secondary">{title}</Typography> : null}
        {children}
      </Stack>
    </Paper>
  );
}
