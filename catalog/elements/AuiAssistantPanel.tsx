import * as React from 'react';
import Box from '@mui/material/Box';
import { AuiAssistantPanel, AuiAssistantProvider, AuiStarterSuggestions, type AuiAssistantSurface } from '../../src/ai/aui';
import { AuiDemoRuntime } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { SincoAssistantDemo } from '../ui/sinco/SincoAssistantDemo';
import { AGENTS, SINCO_THREADS, STARTERS } from '../ui/sinco/obligaciones';

/** Las demos con la pantalla anfitriona necesitan el ancho del lateral (400px) junto a la tabla. */
export const SINCO_PAGE_WIDTH = 1040;
export const SINCO_DEMO_HEIGHT = 600;
const PREVIOUS = SINCO_THREADS.slice(1);
type Open = Exclude<AuiAssistantSurface, 'closed'>;

export function AuiAssistantPanelDoc() {
  const [surface, setSurface] = React.useState<AuiAssistantSurface>('float');
  const [has, setHas] = React.useState<'false' | 'true'>('true');
  return (
    <Box sx={{ maxWidth: SINCO_PAGE_WIDTH }}>
      <ElementPage
        demoHeight={SINCO_DEMO_HEIGHT}
        demo={<SincoAssistantDemo resetKey={has} surface={surface} onSurfaceChange={setSurface} threads={has === 'true' ? SINCO_THREADS : PREVIOUS} startIn={has === 'true' ? 'resumen' : undefined} />}
        properties={
          <>
            <PropRow label="surface"><PropToggle<Open> label="surface" value={surface as Open} onChange={setSurface} options={[['float', 'float'], ['side', 'side'], ['full', 'full']]} /></PropRow>
            <PropRow label="hasMessages"><PropToggle label="hasMessages" value={has} onChange={setHas} options={[['false', 'false'], ['true', 'true']]} /></PropRow>
          </>
        }
      />
    </Box>
  );
}

/** La tarjeta: el panel lateral a 400 × 340, reducido al alto de la tarjeta. */
const CARD_PANEL = { width: 400, height: 340, scale: 212 / 340 };

export function AuiAssistantPanelCard() {
  return (
    <AuiDemoRuntime threads={PREVIOUS} followups="none">
      <AuiAssistantProvider surface="side">
        <Box sx={{ height: 212, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <Box sx={{ flexShrink: 0, display: 'flex', width: CARD_PANEL.width, height: CARD_PANEL.height, transform: `scale(${CARD_PANEL.scale})`, transformOrigin: 'top center', border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', '& [data-slot="aui-assistant-panel"]': { flex: 1, borderLeft: 0 } }}>
            <AuiAssistantPanel autoFocus={false} agents={AGENTS} empty={<AuiStarterSuggestions starters={STARTERS.slice(0, 2)} />} />
          </Box>
        </Box>
      </AuiAssistantProvider>
    </AuiDemoRuntime>
  );
}
