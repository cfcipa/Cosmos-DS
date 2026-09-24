import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ThumbsDown } from 'lucide-react';
import { FeedbackDialog } from '../../src/ai/feedback-dialog';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Feedback dialog».
const RESPONSE = 'La retención en la fuente se calcula sobre el valor total de la factura, IVA incluido.';
const REASONS = ['No es correcto', 'No siguió las instrucciones', 'Demasiado largo', 'Inseguro'];
const AUTO_RESET_MS = 2600;

type AfterSubmit = 'reset' | 'keep';

export function FeedbackDialogDoc() {
  const [open, setOpen] = React.useState(true);
  const [selected, setSelected] = React.useState<string[]>(['No es correcto']);
  const [note, setNote] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [afterSubmit, setAfterSubmit] = React.useState<AfterSubmit>('reset');
  const resetTimer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const toggleReason = (reason: string) => setSelected((current) => (current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]));
  const submit = () => {
    setSent(true);
    if (afterSubmit !== 'reset') return;
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => { setSent(false); setOpen(false); setSelected([]); setNote(''); }, AUTO_RESET_MS);
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1} sx={{ width: '100%', maxWidth: 440 }}>
              <Typography component="p" variant="body1" sx={{ m: 0 }}>{RESPONSE}</Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: -0.75 }}>
                <IconButton
                  aria-label="Respuesta no útil: contar por qué"
                  aria-pressed={open}
                  aria-expanded={open}
                  onClick={() => { setOpen(!open); setSent(false); }}
                  sx={open || sent ? { color: 'primary.main' } : undefined}
                >
                  <ThumbsDown size={16} />
                </IconButton>
                <Typography variant="body3" color="text.secondary">Reportar un problema</Typography>
              </Stack>
              {open || sent ? (
                <FeedbackDialog reasons={REASONS} selected={selected} note={note} sent={sent} onToggleReason={toggleReason} onNoteChange={setNote} onSubmit={submit} />
              ) : null}
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="After submit">
              <PropToggle<AfterSubmit> label="Auto reset" value={afterSubmit} onChange={setAfterSubmit} options={[['reset', 'reset after 2.6 s'], ['keep', 'keep confirmation']]} />
            </PropRow>
            <PropRow label="selected">
              <Typography variant="caption" color="text.secondary" sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.body3.fontSize })}>{JSON.stringify(selected)}</Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function FeedbackDialogCard() {
  return <Box sx={{ width: '100%' }}><FeedbackDialog reasons={REASONS} selected={['No es correcto']} note="" sent={false} /></Box>;
}
