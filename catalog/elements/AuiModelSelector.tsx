import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Feather, Gauge, Gem, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import {
  AuiModelSelectorContent, AuiModelSelectorEffort, AuiModelSelectorEmpty, AuiModelSelectorGroup, AuiModelSelectorItem, AuiModelSelectorList,
  AuiModelSelectorRoot, AuiModelSelectorSearch, resolveModelEffort, AuiModelSelectorSeparator, AuiModelSelectorTrigger, AuiThread,
  type AuiModelOption, type AuiModelSelectorSize, type AuiModelSelectorVariant,
} from '../../src/ai/aui';
import { AuiDemoRuntime, type DemoAnswerContext, type DemoThread } from '../ui/AuiDemoRuntime';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';
import { ThreadFrame } from '../ui/ThreadFrame';

const ICON = 16;
const icon = (Icon: LucideIcon) => <Icon size={ICON} />;

type Model = AuiModelOption & { group: 'OpenAI' | 'Anthropic' };
const MODELS: Model[] = [
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', description: 'Rápido y eficiente', icon: icon(Zap), group: 'OpenAI', keywords: ['openai'] },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', description: 'Rendimiento equilibrado', icon: icon(Gauge), group: 'OpenAI', keywords: ['openai'] },
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', description: 'El más capaz', icon: icon(Sparkles), group: 'OpenAI', keywords: ['openai'], efforts: true },
  { id: 'claude-fable-5', name: 'Claude Fable 5', description: 'Análisis y conciliaciones', icon: icon(Feather), group: 'Anthropic', keywords: ['anthropic'], efforts: [{ id: 'low', name: 'Bajo' }, { id: 'high', name: 'Alto' }, { id: 'max', name: 'Máx' }] },
  { id: 'claude-opus-5', name: 'Claude Opus 5', description: 'No disponible en tu plan', icon: icon(Gem), group: 'Anthropic', keywords: ['anthropic'], disabled: true },
];
const GROUPS = ['OpenAI', 'Anthropic'] as const;
const DEFAULT_MODEL = 'gpt-5.6-sol';
const DEFAULT_EFFORT = 'medium';

const ASK = '¿Cuánto suman los anticipos pendientes de Nubia Rojas?';
const ANS: Record<string, string> = {
  'gpt-5.6-luna': 'Nubia Rojas tiene 2 anticipos sin legalizar por $1.850.000. CE-4492 vence el 30 de septiembre.',
  'gpt-5.6-terra': 'Hay 2 anticipos pendientes de Nubia Rojas, por $1.850.000 en total. El primero en vencer es CE-4492 (30 de septiembre).',
  'gpt-5.6-sol': 'Revisé los comprobantes de egreso: CE-4492 ($1.200.000) vence el 30 de septiembre y CE-4510 ($650.000) el 15 de octubre. Ninguno tiene factura asociada todavía.',
  'claude-fable-5': 'CE-4492 y CE-4510 suman $1.850.000. Crucé ambos con la conciliación bancaria de agosto: los dos giros salieron de la cuenta 1110 y siguen sin legalizar.',
};
const THREADS: DemoThread[] = [{ id: 'modelos', title: 'Anticipos de Nubia Rojas', messages: [{ role: 'user', content: ASK }, { role: 'assistant', content: ANS[DEFAULT_MODEL] }] }];
const answer = ({ modelName }: DemoAnswerContext) => ANS[modelName ?? DEFAULT_MODEL] ?? ANS[DEFAULT_MODEL];

type Layout = 'grouped' | 'flat' | 'search';

/** El menú compuesto: por grupos (con separador), plano o con buscador. */
function Menu({ layout }: { layout: Layout }) {
  return (
    <>
      {layout === 'search' && <AuiModelSelectorSearch />}
      <AuiModelSelectorList>
        <AuiModelSelectorEmpty />
        {layout === 'grouped'
          ? GROUPS.map((g, i) => (
            <React.Fragment key={g}>
              {i > 0 && <AuiModelSelectorSeparator />}
              <AuiModelSelectorGroup heading={g}>{MODELS.filter((m) => m.group === g).map((m) => <AuiModelSelectorItem key={m.id} model={m} />)}</AuiModelSelectorGroup>
            </React.Fragment>
          ))
          : MODELS.map((m) => <AuiModelSelectorItem key={m.id} model={m} />)}
      </AuiModelSelectorList>
      <AuiModelSelectorEffort />
    </>
  );
}

export function AuiModelSelectorDoc() {
  const [variant, setVariant] = React.useState<AuiModelSelectorVariant>('ghost');
  const [size, setSize] = React.useState<AuiModelSelectorSize>('sm');
  const [layout, setLayout] = React.useState<Layout>('grouped');
  const [value, setValue] = React.useState(DEFAULT_MODEL);
  const [effort, setEffort] = React.useState(DEFAULT_EFFORT);
  const selector = React.useMemo(() => ({
    models: MODELS, value, onValueChange: setValue, effort, onEffortChange: setEffort, variant, size, searchable: layout === 'search',
    children: <Menu layout={layout} />,
  }), [value, effort, variant, size, layout]);
  return (
    <Box sx={{ maxWidth: 640 }}>
      <AuiDemoRuntime threads={THREADS} startIn="modelos" answer={answer} followups="none">
        <ElementPage
          demoHeight={460}
          demo={<ThreadFrame><AuiThread autoFocus={false} modelSelector={selector} /></ThreadFrame>}
          properties={
            <>
              <PropRow label="variant"><PropToggle<AuiModelSelectorVariant> label="variant" value={variant} onChange={setVariant} options={[['outline', 'outline'], ['ghost', 'ghost'], ['muted', 'muted']]} /></PropRow>
              <PropRow label="size"><PropToggle<AuiModelSelectorSize> label="size" value={size} onChange={setSize} options={[['sm', 'sm'], ['default', 'default'], ['lg', 'lg']]} /></PropRow>
              <PropRow label="layout"><PropToggle<Layout> label="layout" value={layout} onChange={setLayout} options={[['grouped', 'grouped'], ['flat', 'flat'], ['search', 'with search']]} /></PropRow>
              <PropRow label="modelContext">
                <Typography variant="body3" color="text.secondary" sx={(t) => ({ ...t.aiKit.code })}>{JSON.stringify({ modelName: value, reasoningEffort: resolveModelEffort(MODELS, value, effort) })}</Typography>
              </PropRow>
            </>
          }
        />
      </AuiDemoRuntime>
    </Box>
  );
}

export function AuiModelSelectorCard() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <AuiModelSelectorRoot models={MODELS} defaultValue={DEFAULT_MODEL} defaultEffort={DEFAULT_EFFORT}>
        <AuiModelSelectorTrigger variant="outline" size="sm" />
        <AuiModelSelectorContent><Menu layout="grouped" /></AuiModelSelectorContent>
      </AuiModelSelectorRoot>
    </Box>
  );
}
