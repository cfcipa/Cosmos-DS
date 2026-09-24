import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

/** Conversación de demo como en los tableros: viewport con scroll, columna de 480px. */
export const DemoViewport = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(function DemoViewport({ children }, ref) {
  return (
    <Box ref={ref} sx={{ height: '100%', boxSizing: 'border-box', p: 3, overflowY: 'auto', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>{children}</Stack>
    </Box>
  );
});

/** Burbuja del usuario (a la derecha, 85% máx). Base del futuro UserMessage. */
export function DemoUser({ children }: { children: React.ReactNode }) {
  return (
    <Stack alignItems="flex-end" sx={{ px: 1 }}>
      <Box sx={{ maxWidth: '85%', px: 2, py: 1.5, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText', typography: 'body1', overflowWrap: 'anywhere' }}>{children}</Box>
    </Stack>
  );
}

/** Texto del asistente. Base del futuro AssistantMessage. */
export function DemoAssistantText({ children }: { children: React.ReactNode }) {
  return <Box sx={{ px: 1, typography: 'body1', color: 'text.primary', overflowWrap: 'anywhere' }}>{children}</Box>;
}
