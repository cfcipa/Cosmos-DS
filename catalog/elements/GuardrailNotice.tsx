import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GuardrailNotice } from '../../src/ai/guardrail-notice';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Guardrail notice».
const POLICY = 'Política de datos personales';
const EXPLANATION = 'Esto pide exportar los datos personales de toda la nómina, y tu rol no tiene ese permiso.';
const ALTERNATIVES = ['Exporta solo los campos que no son sensibles', 'Pide el permiso a tu administrador'];

type Toggle = 'on' | 'off';

export function GuardrailNoticeDoc() {
  const [withAlternatives, setWithAlternatives] = React.useState<Toggle>('on');
  const [withPick, setWithPick] = React.useState<Toggle>('on');
  const [sentMessages, setSentMessages] = React.useState<string[]>([]);
  const conversationRef = React.useRef<HTMLDivElement>(null);
  const canPick = withPick === 'on';

  // Cada alternativa enviada aparece abajo: se desplaza la conversación para mostrarla.
  React.useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
  }, [sentMessages]);

  const sendAlternative = (alternative: string) => setSentMessages((current) => [...current, alternative]);

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={280}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack ref={conversationRef} spacing={1.5} sx={{ width: '100%', maxWidth: 440, maxHeight: 232, overflowY: 'auto' }}>
              <GuardrailNotice
                policy={POLICY}
                explanation={EXPLANATION}
                alternatives={withAlternatives === 'on' ? ALTERNATIVES : []}
                onPick={canPick ? sendAlternative : undefined}
              />
              {sentMessages.map((message, index) => (
                <Box
                  key={index}
                  sx={(t) => ({
                    alignSelf: 'flex-end',
                    maxWidth: 320,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: 'ai.userBubble',
                    color: 'ai.userBubbleText',
                    ...t.typography.body1,
                  })}
                >
                  {message}
                </Box>
              ))}
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
              <Button variant="outlined" onClick={() => setSentMessages([])}>Reset</Button>
              <Typography variant="caption" color="text.secondary">
                {canPick ? 'Picking an alternative sends it as a new message.' : 'Without onPick the buttons show but do nothing.'}
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
