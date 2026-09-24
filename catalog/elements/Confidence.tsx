import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ConfidenceMarker } from '../../src/ai/confidence-marker';
import type { ConfidenceClaim } from '../../src/ai/confidence-marker';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Confidence».
const CLAIMS: ConfidenceClaim[] = [
  { id: 'c1', confidence: 'grounded', text: 'Hay 3 anticipos pendientes por $3.930.000.', basis: 'consultar_anticipos · 22 sep 2026' },
  { id: 'c2', confidence: 'inferred', text: 'CE-4492 es el que vence primero.', basis: 'comparé las fechas de vencimiento de los tres' },
  { id: 'c3', confidence: 'uncertain', text: 'Nubia Rojas probablemente lo legalice esta semana.', basis: 'sin fuente: estimado por su historial de pagos' },
];

type ColorMode = 'color' | 'grayscale';

export function ConfidenceDoc() {
  const [hoveredId, setHoveredId] = React.useState('');
  const [colorMode, setColorMode] = React.useState<ColorMode>('color');

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={260}
        demo={
          <Box sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box', filter: colorMode === 'grayscale' ? 'grayscale(1)' : 'none' }}>
            <Box sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
              <ConfidenceMarker claims={CLAIMS} hoveredId={hoveredId} onHover={setHoveredId} />
            </Box>
          </Box>
        }
        properties={
          <>
            <PropRow label="hoveredId">
              <Typography variant="body2" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{hoveredId ? `"${hoveredId}"` : '""'}</Typography>
            </PropRow>
            <PropRow label="Try it">
              <PropToggle<ColorMode> label="Color" value={colorMode} onChange={setColorMode} options={[['color', 'color'], ['grayscale', 'grayscale']]} />
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function ConfidenceCard() {
  return <ConfidenceMarker claims={CLAIMS} hoveredId="c1" showLegend={false} />;
}
