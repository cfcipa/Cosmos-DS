import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GuardrailNotice } from '../../src/ai/guardrail-notice';
import { TypingIndicator } from '../../src/ai/typing-indicator';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Guardrail notice».
const POLICY = 'Política de datos personales';
const EXPLANATION = 'Esto pide exportar los datos personales de toda la nómina, y tu rol no tiene ese permiso.';
const ALTERNATIVES = ['Exporta solo los campos que no son sensibles', 'Pide el permiso a tu administrador'];
// Demo: la solicitud que provoca la negativa y la respuesta a cada alternativa.
const USER_REQUEST = 'Exporta los datos personales de toda la nómina.';
const REPLIES: Record<string, string> = {
  [ALTERNATIVES[0]]: 'Listo: preparé la exportación de la nómina sin cédulas, cuentas bancarias ni direcciones.',
  [ALTERNATIVES[1]]: 'Envié la solicitud de permiso a tu administrador. Te aviso cuando la apruebe.',
};
/** Cuánto tarda la nueva ejecución en responder. */
const RUN_MS = 1400;

type Toggle = 'on' | 'off';
type Turn = { role: 'user' | 'assistant'; text: string };

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </Box>
  );
}

export function GuardrailNoticeDoc() {
  const [withAlternatives, setWithAlternatives] = React.useState<Toggle>('on');
  const [withPick, setWithPick] = React.useState<Toggle>('on');
  // Lo que pasa después de la negativa: la alternativa elegida y la respuesta de la nueva ejecución.
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const runTimer = React.useRef<number>();
  const conversationRef = React.useRef<HTMLDivElement>(null);
  const canPick = withPick === 'on';

  React.useEffect(() => () => window.clearTimeout(runTimer.current), []);
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [turns, isRunning]);

  /** Como `aui.thread.append(alternative)`: la alternativa entra como mensaje del usuario y arranca otra ejecución. */
  const appendAlternative = (alternative: string) => {
    if (isRunning) return;
    setTurns((current) => [...current, { role: 'user', text: alternative }]);
    setIsRunning(true);
    runTimer.current = window.setTimeout(() => {
      setTurns((current) => [...current, { role: 'assistant', text: REPLIES[alternative] }]);
      setIsRunning(false);
    }, RUN_MS);
  };

  const resetDemo = () => {
    window.clearTimeout(runTimer.current);
    setTurns([]);
    setIsRunning(false);
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={
          <Box ref={conversationRef} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={2} sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
              <UserBubble>{USER_REQUEST}</UserBubble>
              <GuardrailNotice
                policy={POLICY}
                explanation={EXPLANATION}
                alternatives={withAlternatives === 'on' ? ALTERNATIVES : []}
                onPick={canPick ? appendAlternative : undefined}
              />
              {turns.map((turn, index) => (turn.role === 'user'
                ? <UserBubble key={index}>{turn.text}</UserBubble>
                : <Typography key={index} component="p" variant="body1" sx={{ m: 0 }}>{turn.text}</Typography>))}
              {isRunning ? <TypingIndicator /> : null}
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="alternatives">
              <PropToggle<Toggle> label="Alternatives" value={withAlternatives} onChange={setWithAlternatives} options={[['on', '2 options'], ['off', '[] empty']]} />
            </PropRow>
            <PropRow label="onPick">
              <PropToggle<Toggle> label="onPick" value={withPick} onChange={setWithPick} options={[['on', 'connected'], ['off', 'no callback']]} />
            </PropRow>
            <PropRow label="Demo">
              <Button variant="outlined" onClick={resetDemo}>Reset</Button>
              <Typography variant="caption" color="text.secondary">
                {canPick ? 'Picking an alternative sends it as a new message and starts a run.' : 'Without onPick the alternatives are read-only suggestions.'}
              </Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function GuardrailNoticeCard() {
  return <GuardrailNotice policy={POLICY} explanation={EXPLANATION} alternatives={ALTERNATIVES} />;
}
