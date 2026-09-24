import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Play } from 'lucide-react';
import { TypingIndicator } from '../../src/ai/typing-indicator';
import type { TypingIndicatorVariant } from '../../src/ai/typing-indicator';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

type Mount = 'runtime' | 'standalone';

// Contenido del tablero aprobado «Typing indicator».
export function TypingIndicatorDoc() {
  const [variant, setVariant] = React.useState<TypingIndicatorVariant>('bare');
  const [mount, setMount] = React.useState<Mount>('runtime');
  const [phase, setPhase] = React.useState<'waiting' | 'answer'>('waiting');
  const to = React.useRef<number>();
  const simulate = React.useCallback(() => {
    window.clearTimeout(to.current); setPhase('waiting');
    to.current = window.setTimeout(() => setPhase('answer'), 2400);
  }, []);
  React.useEffect(() => { simulate(); return () => window.clearTimeout(to.current); }, [simulate]);
  const show = mount === 'standalone' || phase === 'waiting';

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={280}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 440 }}>
              <Box sx={(t) => ({ alignSelf: 'flex-end', maxWidth: 320, px: 2, py: 1.5, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText', ...t.typography.body1 })}>
                ¿Cuál anticipo vence primero?
              </Box>
              <Box sx={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>
                {show ? <TypingIndicator variant={variant} />
                  : <Typography component="p" variant="body1" sx={{ m: 0 }}>CE-4492, de Nubia Rojas. Vence el 30 de septiembre.</Typography>}
              </Box>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="variant">
              <PropToggle<TypingIndicatorVariant> label="Variant" value={variant} onChange={setVariant} options={[['bare', 'bare'], ['bubble', 'bubble']]} />
            </PropRow>
            <PropRow label="Mount">
              <PropToggle<Mount> label="Mount" value={mount} onChange={setMount} options={[['runtime', 'with run'], ['standalone', 'always mounted']]} />
            </PropRow>
            <PropRow label="Simulation">
              <Button variant="contained" startIcon={<Play size={14} />} onClick={simulate}>Simulate response</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function TypingIndicatorCard() {
  return <TypingIndicator variant="bubble" />;
}
