// Cosmos DS · Catálogo: Playground.
// Referente: el playground de assistant-ui (assistant-ui.com/playground): los controles a la izquierda, la barra con
// Desktop / Tablet / Mobile (y el ancho que se arrastra), Nuevo chat y Code, y la vista previa en vivo. Aquí la vista
// previa es la plantilla «Obligaciones · Composer flotante» del lienzo y los controles son de comportamiento: el
// estilo es el del tema Cosmos, en claro u oscuro.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Check, Code, Copy, Monitor, Plus, RotateCcw, Smartphone, Tablet, X } from 'lucide-react';
import { CosmosProvider } from '../../src/CosmosProvider';
import type { AuiAssistantSurface } from '../../src/ai/aui';
import { CONTEXT_WINDOW, DEFAULT_PLAYGROUND, playgroundCode, type MapSide, type PlaygroundConfig, type Quotes, type Timing, type Tuck, type Waiting } from './config';
import { STARTERS } from '../ui/sinco/obligaciones';
import { SincoAssistant, type SincoAssistantProps, type SincoControls } from '../ui/sinco/SincoAssistant';
import { DEFAULT_EFFORT, DEFAULT_MODEL, MODELS } from '../elements/AuiModelSelector';

/** Medidas del referente: columna de controles de 320px, barra de 48px, tablet 768px, móvil 375px, mínimo 320px. */
const CONTROLS_WIDTH = 40;
const TOOLBAR = 6;
const VIEWPORTS = {
  desktop: { width: '100%' as const, label: 'Desktop', icon: Monitor },
  tablet: { width: 768, label: 'Tablet', icon: Tablet },
  mobile: { width: 375, label: 'Mobile', icon: Smartphone },
};
type Viewport = keyof typeof VIEWPORTS;
const MIN_WIDTH = 320;
/** El asa de cada lado: 16px de ancho con una línea de 48px. */
const HANDLE = { width: 2, line: 6 };
const ICON = 14;
const COPIED_MS = 1600;
const TUCK = { '4000': 4000, '8000': 8000, never: Number.POSITIVE_INFINITY } as const;

/** La configuración del playground como props de la plantilla. */
function templateProps(c: PlaygroundConfig): SincoAssistantProps {
  const t = c.thread;
  return {
    surface: c.assistant.surface,
    pill: c.assistant.pill,
    preview: c.assistant.preview ? { autoTuck: TUCK[c.assistant.autoTuck] } : false,
    agents: c.assistant.agents,
    starters: c.empty.starters ? STARTERS.slice(0, c.empty.startersCount) : null,
    disclaimer: c.empty.disclaimer,
    selection: c.context.selection,
    askAi: c.context.askAi,
    followups: t.followups,
    thread: {
      waiting: t.waiting,
      quotes: t.quotes === 'off' ? false : t.quotes === 'actions' ? 'actions' : true,
      messageTiming: t.timing === 'off' ? false : t.timing === 'footer' ? { design: 'footer' } : true,
      conversationMap: t.conversationMap === 'off' ? undefined : t.conversationMap,
      modelContextWindow: t.contextWindow ? CONTEXT_WINDOW : undefined,
      modelSelector: t.modelSelector ? { models: MODELS, defaultValue: DEFAULT_MODEL, defaultEffort: DEFAULT_EFFORT } : undefined,
      mentions: t.mentions,
    },
  };
}

type Updater = (c: PlaygroundConfig) => PlaygroundConfig;

// ——— Controles ———
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ py: 2, '& + &': { borderTop: 1, borderColor: 'divider' } }}>
      <Typography variant="overline" component="h3" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 2 }}>{title}</Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

function Row({ label, children, disabled }: { label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ minHeight: 32, opacity: disabled ? 0.5 : 1 }}>
      <Typography variant="body2" color="text.primary">{label}</Typography>
      {children}
    </Stack>
  );
}

function Toggle({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Row label={label} disabled={disabled}>
      <Switch size="small" checked={value} disabled={disabled} onChange={(e) => onChange(e.target.checked)} inputProps={{ 'aria-label': label }} />
    </Row>
  );
}

function Choice<T extends string>({ label, value, options, onChange, disabled }: { label: string; value: T; options: Array<[T, string]>; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <Row label={label} disabled={disabled}>
      <Select size="small" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as T)} inputProps={{ 'aria-label': label }} sx={(t) => ({ ...t.typography.body2, minWidth: t.spacing(17), '& .MuiSelect-select': { py: 0.5 } })}>
        {options.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
      </Select>
    </Row>
  );
}

function Controls({ config: c, update }: { config: PlaygroundConfig; update: (u: Updater) => void }) {
  const set = <K extends keyof PlaygroundConfig>(key: K, patch: Partial<PlaygroundConfig[K]>) => update((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...patch } }));
  return (
    <Box>
      <Section title="Asistente">
        <Choice<AuiAssistantSurface> label="Superficie" value={c.assistant.surface} onChange={(surface) => set('assistant', { surface })} options={[['closed', 'Cerrado'], ['float', 'Flotante'], ['side', 'Lateral'], ['full', 'Pantalla completa']]} />
        <Toggle label="Composer flotante" value={c.assistant.pill} onChange={(pill) => set('assistant', { pill })} />
        <Toggle label="Vista previa" value={c.assistant.preview} disabled={!c.assistant.pill} onChange={(preview) => set('assistant', { preview })} />
        <Choice<Tuck> label="Se recoge a los" value={c.assistant.autoTuck} disabled={!c.assistant.pill || !c.assistant.preview} onChange={(autoTuck) => set('assistant', { autoTuck })} options={[['4000', '4 s'], ['8000', '8 s'], ['never', 'Nunca']]} />
        <Toggle label="Asistentes" value={c.assistant.agents} onChange={(agents) => set('assistant', { agents })} />
      </Section>
      <Section title="Chat vacío">
        <Toggle label="Inicios" value={c.empty.starters} onChange={(starters) => set('empty', { starters })} />
        <Choice<'2' | '4'> label="Cantidad" value={String(c.empty.startersCount) as '2' | '4'} disabled={!c.empty.starters} onChange={(v) => set('empty', { startersCount: Number(v) as 2 | 4 })} options={[['2', '2'], ['4', '4']]} />
        <Toggle label="Aviso de IA" value={c.empty.disclaimer} onChange={(disclaimer) => set('empty', { disclaimer })} />
      </Section>
      <Section title="Contexto">
        <Toggle label="Selección como contexto" value={c.context.selection} onChange={(selection) => set('context', { selection })} />
        <Toggle label="Preguntar a la IA" value={c.context.askAi} onChange={(askAi) => set('context', { askAi })} />
      </Section>
      <Section title="Hilo">
        <Choice<Waiting> label="Espera" value={c.thread.waiting} onChange={(waiting) => set('thread', { waiting })} options={[['loader', 'Loader'], ['typing', 'Typing']]} />
        <Toggle label="Seguimientos" value={c.thread.followups} onChange={(followups) => set('thread', { followups })} />
        <Choice<Quotes> label="Citar" value={c.thread.quotes} onChange={(quotes) => set('thread', { quotes })} options={[['off', 'No'], ['quote', 'Citar'], ['actions', 'Con acciones']]} />
        <Choice<Timing> label="Tiempo del mensaje" value={c.thread.timing} onChange={(timing) => set('thread', { timing })} options={[['off', 'No'], ['badge', 'Insignia'], ['footer', 'Pie']]} />
        <Choice<MapSide> label="Mapa de la conversación" value={c.thread.conversationMap} onChange={(conversationMap) => set('thread', { conversationMap })} options={[['off', 'No'], ['left', 'Izquierda'], ['right', 'Derecha']]} />
      </Section>
      <Section title="Composer">
        <Toggle label="Uso del contexto" value={c.thread.contextWindow} onChange={(contextWindow) => set('thread', { contextWindow })} />
        <Toggle label="Selector de modelo" value={c.thread.modelSelector} onChange={(modelSelector) => set('thread', { modelSelector })} />
        <Toggle label="Menciones @ y comandos /" value={c.thread.mentions} onChange={(mentions) => set('thread', { mentions })} />
      </Section>
      <Section title="Tema">
        <Row label="Modo">
          <ToggleButtonGroup size="small" exclusive color="primary" value={c.theme} onChange={(_e, theme) => { if (theme) update((prev) => ({ ...prev, theme })); }} aria-label="Modo">
            <ToggleButton value="light" sx={{ textTransform: 'none', py: 0.25 }}>Claro</ToggleButton>
            <ToggleButton value="dark" sx={{ textTransform: 'none', py: 0.25 }}>Oscuro</ToggleButton>
          </ToggleButtonGroup>
        </Row>
      </Section>
    </Box>
  );
}

// ——— Barra ———
function ToolButton({ on, icon: Icon, children, ...rest }: { on?: boolean; icon: React.ElementType; children?: React.ReactNode } & React.ComponentProps<typeof ButtonBase>) {
  return (
    <ButtonBase
      {...rest}
      aria-pressed={on}
      sx={(t) => ({
        ...t.typography.caption, fontWeight: t.typography.fontWeightMedium, gap: 0.75, px: 1.25, py: 0.5, borderRadius: 1,
        color: on ? 'text.primary' : 'text.secondary', bgcolor: on ? 'action.selected' : 'transparent',
        transition: t.transitions.create(['background-color', 'color'], { duration: t.transitions.duration.shortest }),
        '&:hover': { color: 'text.primary' }, '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
      })}
    >
      <Icon size={ICON} />
      {children}
    </ButtonBase>
  );
}

function CodeView({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return undefined;
    const id = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }} data-slot="playground-code">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>ObligacionesComposerFlotante.tsx</Typography>
        <Button size="small" startIcon={copied ? <Check size={ICON} /> : <Copy size={ICON} />} onClick={() => { void navigator.clipboard?.writeText(code).catch(() => undefined); setCopied(true); }}>{copied ? 'Copiado' : 'Copiar'}</Button>
        <Tooltip title="Cerrar"><IconButton size="small" aria-label="Cerrar el código" onClick={onClose}><X size={ICON + 2} /></IconButton></Tooltip>
      </Stack>
      <Box component="pre" sx={(t) => ({ m: 0, flex: 1, overflow: 'auto', p: 2, ...t.aiKit.code, color: 'text.primary', bgcolor: t.palette.ai.surfaceMuted })}>{code}</Box>
    </Box>
  );
}

/** Arrastrar un borde cambia el ancho a los dos lados a la vez (el marco está centrado). */
function useResize(width: number | '100%', setWidth: (w: number) => void, container: React.RefObject<HTMLDivElement>) {
  return (side: 'left' | 'right') => (e: React.PointerEvent) => {
    e.preventDefault();
    const start = e.clientX;
    const from = width === '100%' ? container.current?.offsetWidth ?? 0 : width;
    const move = (ev: PointerEvent) => {
      const delta = side === 'right' ? ev.clientX - start : start - ev.clientX;
      setWidth(Math.max(MIN_WIDTH, Math.round(from + delta * 2)));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); document.body.style.cursor = ''; };
    document.body.style.cursor = 'ew-resize';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
}

function ResizeHandle({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <Box
      role="separator"
      aria-orientation="vertical"
      aria-label="Cambiar el ancho"
      onPointerDown={onPointerDown}
      sx={(t) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', width: t.spacing(HANDLE.width), flexShrink: 0, cursor: 'ew-resize', touchAction: 'none', '&:hover > span': { bgcolor: 'text.disabled' } })}
    >
      <Box component="span" sx={(t) => ({ width: '1px', height: t.spacing(HANDLE.line), bgcolor: 'divider' })} />
    </Box>
  );
}

export function PlaygroundPage() {
  const [config, setConfig] = React.useState<PlaygroundConfig>(DEFAULT_PLAYGROUND);
  const [viewport, setViewport] = React.useState<Viewport>('desktop');
  const [width, setWidth] = React.useState<number | '100%'>('100%');
  const [showCode, setShowCode] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);
  const controls = React.useRef<SincoControls | null>(null);
  const container = React.useRef<HTMLDivElement>(null);
  const startResize = useResize(width, (w) => setWidth(w), container);
  const onSurfaceChange = React.useCallback((surface: AuiAssistantSurface) => setConfig((c) => ({ ...c, assistant: { ...c.assistant, surface } })), []);
  const pickViewport = (v: Viewport) => { setViewport(v); setWidth(VIEWPORTS[v].width); };
  const framed = width !== '100%';
  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0 }} data-slot="playground">
      <Box component="aside" aria-label="Personalizar" sx={(t) => ({ display: { xs: 'none', md: 'block' }, width: t.spacing(CONTROLS_WIDTH), flexShrink: 0, overflowY: 'auto', px: 2, borderRight: 1, borderColor: 'divider' })}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 2 }}>
          <Box>
            <Typography variant="subtitle2" component="h2">Obligaciones · Composer flotante</Typography>
            <Typography variant="caption" color="text.secondary">Plantilla</Typography>
          </Box>
          <Tooltip title="Restablecer"><IconButton size="small" aria-label="Restablecer" onClick={() => { setConfig(DEFAULT_PLAYGROUND); setResetKey((k) => k + 1); }}><RotateCcw size={ICON + 2} /></IconButton></Tooltip>
        </Stack>
        <Controls config={config} update={(u) => setConfig(u)} />
      </Box>
      <Box ref={container} sx={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={(t) => ({ height: t.spacing(TOOLBAR), flexShrink: 0, px: 2, borderBottom: 1, borderColor: 'divider' })}>
          <Stack direction="row" alignItems="center" spacing={0.25}>
            {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => (
              <ToolButton key={v} on={viewport === v} icon={VIEWPORTS[v].icon} onClick={() => pickViewport(v)}>{VIEWPORTS[v].label}</ToolButton>
            ))}
            <Typography variant="caption" color="text.disabled" sx={(t) => ({ ...t.aiKit.code, ml: 1, fontVariantNumeric: 'tabular-nums' })}>{framed ? `${width}px` : '100%'}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.25}>
            <ToolButton icon={Plus} onClick={() => controls.current?.newChat()}>Nuevo chat</ToolButton>
            <ToolButton icon={showCode ? X : Code} on={showCode} onClick={() => setShowCode((v) => !v)}>{showCode ? 'Cerrar' : 'Code'}</ToolButton>
          </Stack>
        </Stack>
        <Box sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', ...(framed && { bgcolor: 'action.hover', p: 2 }) }}>
          <Stack direction="row" alignItems="stretch" justifyContent="center" sx={{ height: '100%' }}>
            {framed ? <ResizeHandle onPointerDown={startResize('left')} /> : null}
            <Box
              data-slot="playground-preview"
              sx={{ position: 'relative', height: '100%', width, maxWidth: '100%', overflow: 'hidden', isolation: 'isolate', ...(framed && { border: 1, borderColor: 'divider', borderRadius: 2.5 }) }}
            >
              <CosmosProvider mode={config.theme} baseline={false}>
                <SincoAssistant resetKey={resetKey} {...templateProps(config)} onSurfaceChange={onSurfaceChange} controlsRef={controls} />
              </CosmosProvider>
            </Box>
            {framed ? <ResizeHandle onPointerDown={startResize('right')} /> : null}
          </Stack>
          {showCode ? <CodeView code={playgroundCode(config)} onClose={() => setShowCode(false)} /> : null}
        </Box>
      </Box>
    </Box>
  );
}
