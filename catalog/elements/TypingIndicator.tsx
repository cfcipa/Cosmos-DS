import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Play } from 'lucide-react';
import { TypingIndicator } from '../../src/ai/typing-indicator';
import type { TypingIndicatorVariant } from '../../src/ai/typing-indicator';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Typing indicator».
const QUESTION = '¿Cuál anticipo vence primero?';
const ANSWER = 'CE-4492, de Nubia Rojas. Vence el 30 de septiembre.';
/** Cuánto espera la simulación antes de mostrar la respuesta. */
const RESPONSE_DELAY_MS = 2400;

type MountMode = 'runtime' | 'standalone';
type Phase = 'waiting' | 'answer';

function Scene({ variant, showIndicator }: { variant: TypingIndicatorVariant; showIndicator: boolean }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 440 }}>
        <Box
          sx={(t) => ({
            alignSelf: 'flex-end',
            maxWidth: 320,
            px: 2,
            py: 1.5,
            borderRadius: 1,
            bgcolor: 'ai.userBubble',
            color: 'ai.userBubbleText',
            ...t.typography.body1,
          })}
        >
          {QUESTION}
        </Box>
        <Box sx={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>
          {showIndicator
            ? <TypingIndicator variant={variant} />
            : <Typography component="p" variant="body1" sx={{ m: 0 }}>{ANSWER}</Typography>}
        </Box>
      </Stack>
    </Box>
  );
}

export function TypingIndicatorDoc() {
  const [variant, setVariant] = React.useState<TypingIndicatorVariant>('bare');
  const [mountMode, setMountMode] = React.useState<MountMode>('runtime');
  const [phase, setPhase] = React.useState<Phase>('waiting');
  const responseTimer = React.useRef<number>();

  const simulateResponse = React.useCallback(() => {
    window.clearTimeout(responseTimer.current);
    setPhase('waiting');
    responseTimer.current = window.setTimeout(() => setPhase('answer'), RESPONSE_DELAY_MS);
  }, []);

  React.useEffect(() => {
    simulateResponse();
    return () => window.clearTimeout(responseTimer.current);
  }, [simulateResponse]);

  // «with run»: solo se monta mientras se espera la respuesta. «always mounted»: siempre visible.
  const showIndicator = mountMode === 'standalone' || phase === 'waiting';

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={280}
        demo={<Scene variant={variant} showIndicator={showIndicator} />}
        properties={
          <>
            <PropRow label="variant">
              <PropToggle<TypingIndicatorVariant>
                label="Variant"
                value={variant}
                onChange={setVariant}
                options={[['bare', 'bare'], ['bubble', 'bubble']]}
              />
            </PropRow>
            <PropRow label="Mount">
              <PropToggle<MountMode>
                label="Mount"
                value={mountMode}
                onChange={setMountMode}
                options={[['runtime', 'with run'], ['standalone', 'always mounted']]}
              />
            </PropRow>
            <PropRow label="Simulation">
              <Button variant="contained" startIcon={<Play size={14} />} onClick={simulateResponse}>Simulate response</Button>
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
