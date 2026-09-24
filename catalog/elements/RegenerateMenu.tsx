import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RegenerateMenu } from '../../src/ai/regenerate-menu';
import type { RegenerateOption } from '../../src/ai/regenerate-menu';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Regenerate with».
const OPTIONS: RegenerateOption[] = [
  { id: 'opus', label: 'Opus 5', detail: 'más lento' },
  { id: 'sonnet', label: 'Sonnet 5', detail: 'equilibrado' },
  { id: 'haiku', label: 'Haiku 4.5', detail: 'el más rápido' },
];
const REPLIES: Record<string, string> = {
  opus: 'Hay 3 anticipos pendientes por $3.930.000. CE-4492 vence primero, el 30 de septiembre; conviene legalizarlo antes del cierre.',
  sonnet: 'Quedan 3 anticipos pendientes, $3.930.000 en total. El próximo en vencer es CE-4492, el 30 de septiembre.',
  haiku: '3 anticipos, $3.930.000. Vence primero CE-4492 (30 sep).',
};
const BUSY_MS = 1200;

type PickMode = 'connected' | 'none';

export function RegenerateMenuDoc() {
  const [open, setOpen] = React.useState(true);
  const [current, setCurrent] = React.useState('sonnet');
  const [busy, setBusy] = React.useState(false);
  const [pickMode, setPickMode] = React.useState<PickMode>('connected');
  const timer = React.useRef<number>();
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const regenerate = (id: string) => {
    setBusy(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setCurrent(id); setBusy(false); }, BUSY_MS);
  };
  const label = OPTIONS.find((option) => option.id === current)?.label;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={340}
        demo={
          <Box sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <Typography variant="body1" sx={{ opacity: busy ? 0.5 : 1, transition: (t) => t.transitions.create('opacity') }}>{REPLIES[current]}</Typography>
              <Typography variant="body3" color="text.secondary">Respondió {label}</Typography>
              <RegenerateMenu
                options={OPTIONS}
                open={open}
                currentId={current}
                regenerating={busy}
                onOpenChange={setOpen}
                onRegenerate={() => regenerate(current)}
                onPick={pickMode === 'connected' ? (id) => { setOpen(false); regenerate(id); } : undefined}
              />
            </Stack>
          </Box>
        }
        properties={
          <PropRow label="onPick">
            <PropToggle<PickMode> label="onPick" value={pickMode} onChange={setPickMode} options={[['connected', 'connected'], ['none', 'no callback']]} />
          </PropRow>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function RegenerateMenuCard() {
  return <RegenerateMenu options={OPTIONS} open currentId="sonnet" />;
}
