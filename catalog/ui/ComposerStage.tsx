import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/** Escenario de las demos del composer (tablero): el composer abajo, con la línea de estado debajo. */
export function ComposerStage({ children, log, maxWidth = 480, align = 'end' }: { children: React.ReactNode; log?: string; maxWidth?: number; align?: 'end' | 'center' }) {
  return (
    <Box sx={{ height: '100%', p: 3, boxSizing: 'border-box', display: 'flex', alignItems: align === 'end' ? 'flex-end' : 'center', justifyContent: 'center' }}>
      <Stack spacing={1.5} sx={{ width: '100%', maxWidth }}>
        {children}
        {log !== undefined ? (
          <Typography variant="body3" color="text.secondary" role="status" sx={(t) => ({ minHeight: t.typography.body3.lineHeight })}>{log}</Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

/** Enviar en las demos: la respuesta «corre» 1,8 s (tablero) y se puede detener. */
export function useFakeRun(onSent?: () => void) {
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState('');
  const timer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  const send = (text: string) => {
    const trimmed = text.trim();
    setRunning(true);
    setLog(`Enviado: «${trimmed.slice(0, 48)}»`);
    onSent?.();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRunning(false), 1800);
  };
  const cancel = () => { window.clearTimeout(timer.current); setRunning(false); setLog('Respuesta detenida'); };
  return { running, log, setLog, send, cancel };
}
