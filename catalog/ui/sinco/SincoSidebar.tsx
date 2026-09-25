// La plantilla «Obligaciones con asistente lateral»: la pantalla y el hilo lado a lado, en paneles redimensionables
// (Assistant sidebar). El botón del AppBar abre y cierra el asistente; la selección de la tabla viaja como contexto.
import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MoonStar } from 'lucide-react';
import { AuiAssistantSidebar, AuiSelectionContextProvider } from '../../../src/ai/aui';
import { AuiDemoRuntime } from '../AuiDemoRuntime';
import { ObligacionesPage, SincoAppBar } from './ObligacionesPage';
import { DICTATED, WELCOME_SUGGESTIONS, makeObligacionesFollowups, makeObligacionesModel, obligacionesSelection, useObligaciones, type Estado, type ObligacionesState } from './obligaciones';

/** Medidas del tablero: la aplicación arranca al 64 % y va del 40 al 80; el botón del AppBar es de 28px con ícono de 16. */
const DEFAULT_SIZE = 64;
const MIN_SIZE = 40;
const MAX_SIZE = 80;
const TOGGLE = 3.5;
const TOGGLE_ICON = 16;

/** El botón que abre y cierra el asistente: el degradado del kit sobre un círculo. */
export function AssistantToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const label = open ? 'Cerrar el asistente' : 'Abrir el asistente';
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        aria-pressed={open}
        onClick={onToggle}
        sx={(t) => ({
          width: t.spacing(TOGGLE), height: t.spacing(TOGGLE), color: 'primary.contrastText',
          background: `linear-gradient(135deg, ${t.palette.ai.markStart}, ${t.palette.ai.markEnd})`,
          '&:hover': { filter: 'brightness(0.92)' }, '&:active': { transform: 'scale(.96)' },
        })}
      >
        <MoonStar size={TOGGLE_ICON} />
      </IconButton>
    </Tooltip>
  );
}

export interface SincoSidebarProps {
  filter?: Estado | 'todas';
  selected?: number[];
  /** El asistente abierto al inicio. Default true. */
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SincoSidebar({ filter, selected, defaultOpen = true, open: controlled, onOpenChange }: SincoSidebarProps) {
  const host = useObligaciones({ filter, selected });
  const bridge = React.useRef<ObligacionesState | null>(null);
  bridge.current = host;
  const model = React.useMemo(() => makeObligacionesModel(bridge), []);
  const followups = React.useMemo(() => makeObligacionesFollowups(bridge), []);
  const [own, setOwn] = React.useState(defaultOpen);
  const open = controlled ?? own;
  const toggle = () => { setOwn(!open); onOpenChange?.(!open); };
  const page = <Box sx={{ height: '100%', overflow: 'auto' }}><ObligacionesPage state={host} askAi={false} /></Box>;
  return (
    <AuiDemoRuntime model={model} suggestions={followups} dictation={DICTATED} welcomeSuggestions={WELCOME_SUGGESTIONS}>
      <AuiSelectionContextProvider selection={obligacionesSelection(host)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', containerType: 'inline-size', bgcolor: 'background.default', color: 'text.primary' }}>
          <SincoAppBar actions={<AssistantToggle open={open} onToggle={toggle} />} />
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
            {open ? <AuiAssistantSidebar defaultSize={DEFAULT_SIZE} minSize={MIN_SIZE} maxSize={MAX_SIZE} withHandle>{page}</AuiAssistantSidebar> : <Box sx={{ flex: 1, minWidth: 0 }}>{page}</Box>}
          </Box>
        </Box>
      </AuiSelectionContextProvider>
    </AuiDemoRuntime>
  );
}
