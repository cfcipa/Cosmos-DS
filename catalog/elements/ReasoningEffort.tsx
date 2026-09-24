import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Play } from 'lucide-react';
import { ReasoningEffort } from '../../src/ai/reasoning-effort';
import type { ReasoningEffortLevel } from '../../src/ai/reasoning-effort';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero aprobado «Reasoning effort».
const LEVELS: ReasoningEffortLevel[] = [
  { key: 'bajo', label: 'Bajo', budget: 2000 },
  { key: 'medio', label: 'Medio', budget: 8000 },
  { key: 'alto', label: 'Alto', budget: 24000 },
];
const INITIAL_SPENT = 3100;
const MAX_SPENT = 30000;
const SPENT_STEP = 100;
/** La simulación sube en 24 pasos de 100 ms hasta un gasto entre el 40 % y el 130 % del presupuesto. */
const SIMULATION_STEPS = 24;
const SIMULATION_TICK_MS = 100;

const formatTokens = (tokens: number) => Math.round(tokens).toLocaleString('es-CO');

export function ReasoningEffortDoc() {
  const [selectedKey, setSelectedKey] = React.useState('medio');
  const [spent, setSpent] = React.useState(INITIAL_SPENT);
  const [isRunning, setIsRunning] = React.useState(false);
  const simulationTimer = React.useRef<number>();
  const simulationTarget = React.useRef(0);

  const stopSimulation = () => window.clearInterval(simulationTimer.current);
  React.useEffect(() => stopSimulation, []);

  // La simulación termina cuando el gasto llega a la meta.
  React.useEffect(() => {
    if (isRunning && spent >= simulationTarget.current) {
      stopSimulation();
      setIsRunning(false);
    }
  }, [isRunning, spent]);

  const simulateRun = () => {
    stopSimulation();
    const budget = LEVELS.find((level) => level.key === selectedKey)?.budget ?? 0;
    const target = Math.round(budget * (0.4 + Math.random() * 0.9));
    const increment = Math.ceil(target / SIMULATION_STEPS);
    simulationTarget.current = target;
    setSpent(0);
    setIsRunning(true);
    simulationTimer.current = window.setInterval(() => {
      setSpent((current) => Math.min(target, current + increment));
    }, SIMULATION_TICK_MS);
  };

  const resetRun = () => {
    stopSimulation();
    setSpent(0);
    setIsRunning(false);
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={280}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <ReasoningEffort levels={LEVELS} selectedKey={selectedKey} onSelect={setSelectedKey} spent={spent} />
          </Box>
        }
        properties={
          <>
            <PropRow label="Simulation">
              <Button variant="contained" startIcon={<Play size={14} />} disabled={isRunning} onClick={simulateRun}>Simulate run</Button>
              <Button variant="outlined" onClick={resetRun}>Reset</Button>
            </PropRow>
            <PropRow label="spent">
              <Slider
                size="small"
                min={0}
                max={MAX_SPENT}
                step={SPENT_STEP}
                value={spent}
                aria-label="Tokens spent"
                onChange={(_event, value) => { stopSimulation(); setIsRunning(false); setSpent(value as number); }}
                sx={{ width: 240 }}
              />
              <Typography variant="caption" color="text.secondary" sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.body3.fontSize, fontVariantNumeric: 'tabular-nums' })}>
                {formatTokens(spent)}
              </Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function ReasoningEffortCard() {
  return <ReasoningEffort levels={LEVELS} defaultSelectedKey="medio" spent={INITIAL_SPENT} />;
}
