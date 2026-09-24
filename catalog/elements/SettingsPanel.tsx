import * as React from 'react';
import Box from '@mui/material/Box';
import { SettingsPanel, type SettingToggle } from '../../src/ai/settings-panel';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero «Settings panel».
const MODELS = ['Opus 5', 'Sonnet 5', 'Haiku 4.5'];
const TOGGLES: SettingToggle[] = [
  { key: 'erp', label: 'Consultar el ERP', detail: 'Lee movimientos, terceros y documentos.', on: true },
  { key: 'write', label: 'Proponer cambios', detail: 'Prepara cambios que tú apruebas antes de aplicarse.', on: true },
  { key: 'web', label: 'Buscar en la web', detail: 'Normas y tarifas vigentes, con fuente.', on: false },
];

function SettingsDemo({ readOnly = false, maxHeight }: { readOnly?: boolean; maxHeight: number }) {
  const [model, setModel] = React.useState('Sonnet 5');
  const [prompt, setPrompt] = React.useState('Eres el asistente de Sinco. Responde en español, con cifras exactas, y propón antes de cambiar cualquier dato.');
  const [temp, setTemp] = React.useState(0.7);
  const [toggles, setToggles] = React.useState(TOGGLES);
  return (
    <SettingsPanel
      model={model}
      models={MODELS}
      systemPrompt={prompt}
      temperature={temp}
      toggles={toggles}
      onModelChange={readOnly ? undefined : setModel}
      onSystemPromptChange={readOnly ? undefined : setPrompt}
      onTemperatureChange={readOnly ? undefined : setTemp}
      onToggle={readOnly ? undefined : (key) => setToggles((ts) => ts.map((t) => (t.key === key ? { ...t, on: !t.on } : t)))}
      sx={{ maxHeight, overflowY: 'auto' }}
    />
  );
}

export function SettingsPanelDoc() {
  const [cb, setCb] = React.useState<'on' | 'off'>('on');
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><SettingsDemo readOnly={cb === 'off'} maxHeight={352} /></Box>}
        properties={<PropRow label="Callbacks"><PropToggle<'on' | 'off'> label="Callbacks" value={cb} onChange={setCb} options={[['on', 'connected'], ['off', 'no callbacks (read-only)']]} /></PropRow>}
      />
    </Box>
  );
}

export function SettingsPanelCard() {
  return <SettingsDemo maxHeight={212} />;
}
