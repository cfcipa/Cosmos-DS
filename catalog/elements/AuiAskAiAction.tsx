import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AuiAskAiAction, AuiAssistantProvider, AuiSelectionContextProvider, AuiThread, useAuiAssistant } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { facturasModel, facturasSelection } from '../ui/sinco/facturas';

type Count = '1' | '3';
/** Las filas de fondo: dos barras por fila, del largo del tablero. */
const SKELETON = [[132, 84], [108, 96], [148, 72]] as const;
const ROW_HEIGHT = 5;
const PANEL_HEIGHT = 43;

/** La barra de selección de la tabla (MUI EnhancedTableToolbar) con la acción. */
function SelectionBar({ n }: { n: number }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      role="toolbar"
      aria-label="Selección"
      sx={(t) => ({ display: 'inline-flex', bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity), borderRadius: 1, py: 0.5, pr: 0.5, pl: 1.5 })}
    >
      <Typography variant="subtitle1" color="primary" sx={{ whiteSpace: 'nowrap' }}>{n === 1 ? '1 seleccionada' : `${n} seleccionadas`}</Typography>
      <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
      <AuiAskAiAction />
    </Stack>
  );
}

function ComposerPanel() {
  const assistant = useAuiAssistant();
  if (assistant?.surface === 'closed') return null;
  return (
    <Paper
      elevation={8}
      data-slot="composer-panel"
      sx={(t) => ({ position: 'absolute', left: t.spacing(2), right: t.spacing(2), bottom: t.spacing(2), height: t.spacing(PANEL_HEIGHT), overflow: 'hidden', border: 1, borderColor: 'divider', zIndex: 2 })}
    >
      <AuiThread placeholder="Pregunta por lo que seleccionaste…" empty={null} />
    </Paper>
  );
}

function Stage({ n }: { n: number }) {
  const selection = React.useMemo(() => facturasSelection(n), [n]);
  return (
    <AuiDemoRuntime model={facturasModel} followups="none">
      <AuiAssistantProvider>
        <AuiSelectionContextProvider selection={selection}>
          <Box sx={{ position: 'relative', height: '100%', p: 2, boxSizing: 'border-box' }}>
            <Box sx={(t) => ({ height: t.spacing(4.75) })}>{n ? <SelectionBar n={n} /> : null}</Box>
            <Box aria-hidden="true" sx={{ mt: 2 }}>
              {SKELETON.map(([a, b], i) => (
                <Stack key={a} direction="row" alignItems="center" spacing={2} sx={(t) => ({ height: t.spacing(ROW_HEIGHT), px: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: i < n ? alpha(t.palette.primary.main, t.palette.action.selectedOpacity) : undefined })}>
                  <Checkbox size="small" checked={i < n} tabIndex={-1} sx={{ p: 0 }} />
                  <Skeleton variant="rounded" animation={false} width={a} height={8} />
                  <Skeleton variant="rounded" animation={false} width={b} height={8} />
                  <Skeleton variant="rounded" animation={false} width={56} height={8} sx={{ ml: 'auto !important' }} />
                </Stack>
              ))}
            </Box>
            <ComposerPanel />
          </Box>
        </AuiSelectionContextProvider>
      </AuiAssistantProvider>
    </AuiDemoRuntime>
  );
}

export function AuiAskAiActionDoc() {
  const [n, setN] = React.useState<Count | '0'>('3');
  const [pose, setPose] = React.useState(0);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={440}
        demo={<Stage key={pose} n={Number(n)} />}
        properties={
          <>
            <PropRow label="selection"><PropToggle<Count> label="selection" value={n as Count} onChange={(v) => { setN(v); setPose((p) => p + 1); }} options={[['1', '1'], ['3', '3']]} /></PropRow>
            <PropRow label="Try it"><Button variant="outlined" disabled={n === '0'} onClick={() => setN('0')}>Clear</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiAskAiActionCard() {
  return <Box sx={{ display: 'flex', justifyContent: 'center' }}><SelectionBar n={3} /></Box>;
}
