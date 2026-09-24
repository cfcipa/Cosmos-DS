// Cosmos DS · Kit IA · AUI connected: Model selector.
// Referente: assistant-ui «Model selector» (elements/model-selector.tsx y model-selector.aui.tsx).
// El modelo y su esfuerzo de razonamiento, elegidos desde el composer. El disparador muestra el modelo (y el esfuerzo,
// si el modelo lo admite); el menú lista los modelos con descripción, marca el elegido, deja los no disponibles
// desactivados y, abajo, el esfuerzo: Bajo / Medio / Alto u otros niveles propios. Se maneja con teclado: ↑ ↓ desde el
// disparador lo abren, ↑ ↓ Inicio Fin recorren, Enter elige, Esc cierra; ← → cambian el esfuerzo. Con `searchable`
// hay un buscador por nombre, id y palabras clave. El esfuerzo elegido se conserva al cambiar de modelo y solo aplica
// si el modelo lo admite. Conectado (`AuiModelSelector`), registra `modelName` y `reasoningEffort` en el modelContext.
import * as React from 'react';
import { useAui } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import InputBase from '@mui/material/InputBase';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import type { SxProps, SystemStyleObject } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import { Check, ChevronDown, Search } from 'lucide-react';

export type AuiModelEffortOption = { id: string; name: string };
export const DEFAULT_EFFORT_OPTIONS: readonly AuiModelEffortOption[] = [
  { id: 'low', name: 'Bajo' },
  { id: 'medium', name: 'Medio' },
  { id: 'high', name: 'Alto' },
];
export type AuiModelOption = {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Términos extra para el buscador, además del id y el nombre. */
  keywords?: readonly string[];
  /** Niveles de esfuerzo: `true` para Bajo / Medio / Alto, o una lista propia. Sin él, el modelo no razona configurable. */
  efforts?: boolean | readonly AuiModelEffortOption[];
};
export type AuiModelSelectorVariant = 'outline' | 'ghost' | 'muted';
export type AuiModelSelectorSize = 'sm' | 'default' | 'lg';

/** Medidas de assistant-ui: menú de 288px; disparador de 32, 36 y 40px; íconos de 14px; separación de 6px. */
const MENU_WIDTH = 36;
const TRIGGER_HEIGHT: Record<AuiModelSelectorSize, number> = { sm: 4, default: 4.5, lg: 5 };
const TRIGGER_PX: Record<AuiModelSelectorSize, number> = { sm: 1.25, default: 1.5, lg: 2 };
const ICON = 14;
const CHEVRON = 16;
const MENU_OFFSET = 6;
/** Alto máximo de la lista antes de desplazarse (max-h-[300px] de cmdk). */
const LIST_MAX_HEIGHT = 300;
const OPTION = '[role="option"]:not([aria-disabled="true"])';

const effortsOf = (m: AuiModelOption | undefined) => (!m?.efforts ? undefined : m.efforts === true ? DEFAULT_EFFORT_OPTIONS : m.efforts);
const resolveEffort = (efforts: readonly AuiModelEffortOption[] | undefined, effort: string | undefined) => (effort !== undefined && efforts?.some((e) => e.id === effort) ? effort : undefined);
/** El esfuerzo que aplica al modelo, o undefined si no lo admite. */
export function resolveModelEffort(models: readonly AuiModelOption[], modelId: string | undefined, effort: string | undefined) {
  return resolveEffort(effortsOf(models.find((m) => m.id === modelId)), effort);
}
const matches = (m: AuiModelOption, q: string) => !q || [m.id, m.name, ...(m.keywords ?? [])].join(' ').toLowerCase().includes(q);

function useControllable<T>(prop: T | undefined, initial: T | undefined, onChange?: (v: T) => void) {
  const [own, setOwn] = React.useState(initial);
  const controlled = prop !== undefined;
  const ref = React.useRef(onChange);
  React.useEffect(() => { ref.current = onChange; });
  const set = React.useCallback((v: T) => { if (!controlled) setOwn(v); ref.current?.(v); }, [controlled]);
  return [controlled ? prop : own, set] as const;
}

type Ctx = {
  models: readonly AuiModelOption[];
  value: string | undefined;
  setValue: (v: string) => void;
  selectedModel: AuiModelOption | undefined;
  efforts: readonly AuiModelEffortOption[] | undefined;
  effort: string | undefined;
  setEffort: (e: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  anchor: React.MutableRefObject<HTMLElement | null>;
  query: string;
  setQuery: (q: string) => void;
  highlight: string | undefined;
  setHighlight: (id: string | undefined) => void;
  listId: string;
};
const ModelSelectorContext = React.createContext<Ctx | null>(null);
export function useModelSelectorContext() {
  const ctx = React.useContext(ModelSelectorContext);
  if (!ctx) throw new Error('AuiModelSelector.* va dentro de AuiModelSelectorRoot');
  return ctx;
}
/** Los niveles del modelo elegido y el activo, para armar otro control de esfuerzo dentro del menú. */
export function useModelSelectorEfforts() {
  const { efforts, effort, setEffort } = useModelSelectorContext();
  return { efforts, effort, setEffort };
}

export interface AuiModelSelectorRootProps {
  models: readonly AuiModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  effort?: string;
  defaultEffort?: string;
  onEffortChange?: (effort: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AuiModelSelectorRoot({ models, value: valueProp, defaultValue, onValueChange, effort: effortProp, defaultEffort, onEffortChange, open: openProp, defaultOpen, onOpenChange, children }: AuiModelSelectorRootProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue ?? models[0]?.id, onValueChange);
  const [effort, setEffort] = useControllable(effortProp, defaultEffort, onEffortChange);
  const [open, setOpenRaw] = useControllable(openProp, defaultOpen ?? false, onOpenChange);
  const [query, setQuery] = React.useState('');
  const [highlight, setHighlight] = React.useState<string>();
  const anchor = React.useRef<HTMLElement | null>(null);
  const listId = React.useId();
  const selectedModel = models.find((m) => m.id === value);
  const efforts = effortsOf(selectedModel);
  const active = resolveEffort(efforts, effort);
  const setOpen = React.useCallback((o: boolean) => {
    // Al abrir, la lista empieza sin filtro y con el modelo elegido resaltado.
    if (o) { setQuery(''); setHighlight(value); }
    setOpenRaw(o);
  }, [setOpenRaw, value]);
  const ctx = React.useMemo<Ctx>(() => ({
    models, value, setValue, selectedModel, efforts, effort: active, setEffort, open: open ?? false, setOpen, anchor, query, setQuery, highlight, setHighlight, listId,
  }), [models, value, setValue, selectedModel, efforts, active, setEffort, open, setOpen, query, highlight, listId]);
  return <ModelSelectorContext.Provider value={ctx}>{children}</ModelSelectorContext.Provider>;
}

const triggerVariantSx = (variant: AuiModelSelectorVariant): SystemStyleObject<Theme> => {
  if (variant === 'ghost') return { '&:hover': { bgcolor: 'action.hover' } };
  if (variant === 'muted') return { bgcolor: 'action.selected', '&:hover': { bgcolor: 'action.focus' } };
  return { border: 1, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } };
};

export interface AuiModelSelectorTriggerProps {
  variant?: AuiModelSelectorVariant;
  size?: AuiModelSelectorSize;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

export function AuiModelSelectorTrigger({ variant = 'outline', size = 'default', sx, children }: AuiModelSelectorTriggerProps) {
  const { open, setOpen, anchor, listId, selectedModel, efforts, effort } = useModelSelectorContext();
  const effortName = effort !== undefined ? efforts?.find((e) => e.id === effort)?.name : undefined;
  return (
    <ButtonBase
      ref={(el: HTMLButtonElement | null) => { anchor.current = el; }}
      data-slot="aui-model-selector-trigger"
      data-variant={variant}
      data-size={size}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? listId : undefined}
      aria-label={selectedModel ? `Modelo: ${selectedModel.name}${effortName ? `, razonamiento ${effortName}` : ''}` : 'Seleccionar modelo'}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => { if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) { e.preventDefault(); setOpen(true); } }}
      sx={[
        (t) => ({
          ...t.typography[size === 'sm' ? 'caption' : 'body2'], display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
          width: 'fit-content', maxWidth: '100%', height: t.spacing(TRIGGER_HEIGHT[size]), px: TRIGGER_PX[size], borderRadius: 1, whiteSpace: 'nowrap', overflow: 'hidden',
          transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
          ...triggerVariantSx(variant),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children ?? <AuiModelSelectorValue />}
      <Box component={ChevronDown} sx={{ width: CHEVRON, height: CHEVRON, flexShrink: 0, opacity: 0.5 }} />
    </ButtonBase>
  );
}

function ModelIcon({ children }: { children: React.ReactNode }) {
  return <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: ICON, height: ICON, '& svg': { width: ICON, height: ICON } }}>{children}</Box>;
}

export function AuiModelSelectorValue({ placeholder = 'Seleccionar modelo', showEffort = true }: { placeholder?: React.ReactNode; showEffort?: boolean }) {
  const { selectedModel, efforts, effort } = useModelSelectorContext();
  if (!selectedModel) return <Box component="span" sx={{ color: 'text.secondary' }} data-slot="aui-model-selector-value">{placeholder}</Box>;
  const effortName = showEffort && effort !== undefined ? efforts?.find((e) => e.id === effort)?.name : undefined;
  return (
    <Box component="span" data-slot="aui-model-selector-value" sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      {selectedModel.icon && <ModelIcon>{selectedModel.icon}</ModelIcon>}
      <Box component="span" sx={{ fontWeight: 'fontWeightMedium', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedModel.name}</Box>
      {effortName && <Box component="span" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis' }}>{effortName}</Box>}
    </Box>
  );
}

export interface AuiModelSelectorContentProps {
  align?: 'start' | 'end';
  searchable?: boolean;
  children?: React.ReactNode;
}

/** El menú. Sin `children`: buscador (si `searchable`), la lista y el esfuerzo. */
export function AuiModelSelectorContent({ align = 'start', searchable = false, children }: AuiModelSelectorContentProps) {
  const { open, setOpen, anchor, models, query, highlight, setHighlight, setValue } = useModelSelectorContext();
  const paper = React.useRef<HTMLDivElement>(null);
  const horizontal = align === 'end' ? 'right' : 'left';
  const visible = models.filter((m) => !m.disabled && matches(m, query.trim().toLowerCase()));
  const move = (to: number) => {
    if (!visible.length) return;
    const id = visible[Math.max(0, Math.min(visible.length - 1, to))].id;
    setHighlight(id);
    paper.current?.querySelector<HTMLElement>(`[data-model-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest' });
  };
  const index = visible.findIndex((m) => m.id === highlight);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).getAttribute('role') === 'radio') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(index < 0 ? 0 : index + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(index < 0 ? 0 : index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); move(0); }
    else if (e.key === 'End') { e.preventDefault(); move(visible.length - 1); }
    else if (e.key === 'Enter' && index >= 0) { e.preventDefault(); setValue(visible[index].id); setOpen(false); }
    else if (e.key === 'Tab') setOpen(false);
  };
  return (
    <Popover
      open={open}
      anchorEl={anchor.current}
      onClose={() => setOpen(false)}
      // El buscador o la lista toman el foco al abrir; el del Paper se lo quitaría.
      disableAutoFocus
      anchorOrigin={{ vertical: 'bottom', horizontal }}
      transformOrigin={{ vertical: 'top', horizontal }}
      slotProps={{
        paper: {
          ref: paper,
          elevation: 8,
          onKeyDown,
          'data-slot': 'aui-model-selector-content',
          sx: (t: Theme) => ({ mt: `${MENU_OFFSET}px`, width: t.spacing(MENU_WIDTH), minWidth: anchor.current?.offsetWidth, overflow: 'hidden' }),
        } as object,
      }}
    >
      {children ?? (
        <>
          {searchable ? <AuiModelSelectorSearch /> : <FocusAnchor />}
          <AuiModelSelectorList />
          <AuiModelSelectorEffort />
        </>
      )}
      {!searchable && children !== undefined && <FocusAnchor />}
    </Popover>
  );
}

/** Sin buscador, el foco va a la lista para que el teclado funcione desde que abre. */
function FocusAnchor() {
  const { listId, highlight } = useModelSelectorContext();
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { ref.current?.focus(); }, []);
  return <Box ref={ref} tabIndex={0} aria-label="Modelo" aria-controls={listId} aria-activedescendant={highlight ? `${listId}-${highlight}` : undefined} sx={visuallyHidden} />;
}

export function AuiModelSelectorSearch({ placeholder = 'Buscar modelos…' }: { placeholder?: string }) {
  const { query, setQuery, models, setHighlight, listId, highlight } = useModelSelectorContext();
  const input = React.useRef<HTMLInputElement>(null);
  // Como FocusAnchor: el foco va al buscador cuando el menú ya está en el documento.
  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => input.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, []);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, borderBottom: 1, borderColor: 'divider' }} data-slot="aui-model-selector-search">
      <Box component={Search} sx={{ width: CHEVRON, height: CHEVRON, flexShrink: 0, color: 'text.secondary' }} />
      <InputBase
        inputRef={input}
        fullWidth
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          const q = e.target.value;
          setQuery(q);
          setHighlight(models.find((m) => !m.disabled && matches(m, q.trim().toLowerCase()))?.id);
        }}
        inputProps={{ 'aria-label': placeholder, role: 'combobox', 'aria-controls': listId, 'aria-activedescendant': highlight ? `${listId}-${highlight}` : undefined }}
        sx={(t) => ({ ...t.typography.body2, height: t.spacing(TRIGGER_HEIGHT.lg) })}
      />
    </Box>
  );
}

export function AuiModelSelectorList({ children }: { children?: React.ReactNode }) {
  const { models, listId } = useModelSelectorContext();
  return (
    <Box
      id={listId}
      role="listbox"
      aria-label="Modelos"
      data-slot="aui-model-selector-list"
      sx={{ maxHeight: LIST_MAX_HEIGHT, overflowY: 'auto', p: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
    >
      {children ?? (
        <>
          <AuiModelSelectorEmpty />
          {models.map((m) => <AuiModelSelectorItem key={m.id} model={m} />)}
        </>
      )}
    </Box>
  );
}

export function AuiModelSelectorEmpty({ children = 'No se encontraron modelos.' }: { children?: React.ReactNode }) {
  const { models, query } = useModelSelectorContext();
  if (models.some((m) => matches(m, query.trim().toLowerCase()))) return null;
  return <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }} data-slot="aui-model-selector-empty">{children}</Typography>;
}

export function AuiModelSelectorGroup({ heading, children }: { heading?: string; children: React.ReactNode }) {
  const { models, query } = useModelSelectorContext();
  const id = React.useId();
  // Un grupo sin modelos que coincidan desaparece con su título.
  const hasMatch = React.Children.toArray(children).some((c) => React.isValidElement<{ model?: AuiModelOption }>(c) && c.props.model && matches(c.props.model, query.trim().toLowerCase()));
  if (!hasMatch && models.length) return null;
  return (
    <Box role="group" aria-labelledby={heading ? id : undefined} data-slot="aui-model-selector-group">
      {heading && <Typography id={id} variant="caption" color="text.secondary" sx={(t) => ({ display: 'block', px: 1, py: 0.75, fontWeight: t.typography.fontWeightMedium })}>{heading}</Typography>}
      {children}
    </Box>
  );
}

export function AuiModelSelectorSeparator() {
  return <Box role="separator" sx={{ height: '1px', bgcolor: 'divider', mx: -0.5, my: 0.5 }} />;
}

export function AuiModelSelectorItem({ model, children }: { model: AuiModelOption; children?: React.ReactNode }) {
  const { value, setValue, setOpen, highlight, setHighlight, listId, query } = useModelSelectorContext();
  if (!matches(model, query.trim().toLowerCase())) return null;
  const selected = value === model.id;
  const highlighted = highlight === model.id && !model.disabled;
  return (
    <Box
      id={`${listId}-${model.id}`}
      role="option"
      aria-selected={selected}
      aria-disabled={model.disabled || undefined}
      data-model-id={model.id}
      data-highlighted={highlighted || undefined}
      data-slot="aui-model-selector-item"
      onMouseMove={() => { if (!model.disabled && highlight !== model.id) setHighlight(model.id); }}
      onClick={() => { if (model.disabled) return; setValue(model.id); setOpen(false); }}
      sx={(t) => ({
        ...t.typography.body2, position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 1, py: 1, pl: 1.5, pr: 4.5, borderRadius: 1,
        cursor: model.disabled ? 'default' : 'pointer', opacity: model.disabled ? t.palette.action.disabledOpacity : 1,
        bgcolor: highlighted ? 'action.hover' : 'transparent',
      })}
    >
      {children ?? (
        <>
          {model.icon && <Box sx={{ mt: '3px' }}><ModelIcon>{model.icon}</ModelIcon></Box>}
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box component="span" sx={{ fontWeight: 'fontWeightMedium', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model.name}</Box>
            {model.description && <Typography component="span" variant="caption" color="text.secondary" noWrap>{model.description}</Typography>}
          </Box>
        </>
      )}
      {selected && <Box component={Check} sx={(t) => ({ position: 'absolute', right: t.spacing(1.5), top: t.spacing(1.25), width: CHEVRON, height: CHEVRON })} />}
    </Box>
  );
}

export function AuiModelSelectorEffort({ label = 'Razonamiento' }: { label?: string }) {
  const { efforts, effort, setEffort } = useModelSelectorEfforts();
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  if (!efforts?.length) return null;
  const current = Math.max(0, efforts.findIndex((e) => e.id === effort));
  const pick = (i: number) => { setEffort(efforts[i].id); refs.current[i]?.focus(); };
  return (
    <Box data-slot="aui-model-selector-effort" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, px: 1.5, py: 1, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Box
        role="radiogroup"
        aria-label={label}
        sx={{ display: 'flex', gap: 0.25 }}
        onKeyDown={(e) => {
          const n = efforts.length;
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); pick((current + (e.key === 'ArrowRight' ? 1 : -1) + n) % n); }
          else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); e.stopPropagation(); pick(e.key === 'Home' ? 0 : n - 1); }
        }}
      >
        {efforts.map((o, i) => {
          const checked = o.id === effort;
          return (
            <ButtonBase
              key={o.id}
              ref={(el: HTMLButtonElement | null) => { refs.current[i] = el; }}
              role="radio"
              aria-checked={checked}
              tabIndex={i === current ? 0 : -1}
              onClick={() => setEffort(o.id)}
              sx={(t) => ({
                ...t.typography.caption, px: 1, py: 0.5, borderRadius: 1, color: checked ? 'text.primary' : 'text.secondary',
                fontWeight: checked ? t.typography.fontWeightMedium : undefined, bgcolor: checked ? 'action.selected' : 'transparent',
                transition: t.transitions.create(['background-color', 'color'], { duration: t.transitions.duration.shortest }),
                '&:hover': { bgcolor: checked ? 'action.selected' : 'action.hover', color: 'text.primary' },
                '&.Mui-focusVisible': { outline: `2px solid ${t.palette.ai.focusRing}` },
              })}
            >
              {o.name}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

/** Registra la selección en el modelContext de assistant-ui (el esfuerzo ya resuelto contra el modelo). */
function ModelContextRegistration() {
  const { value, effort } = useModelSelectorContext();
  const aui = useAui();
  React.useEffect(() => {
    if (value === undefined) return undefined;
    const config = { config: { modelName: value, ...(effort !== undefined ? { reasoningEffort: effort } : {}) } };
    type Registry = { register: (provider: { getModelContext: () => typeof config }) => () => void };
    const scope = (aui as unknown as { modelContext: Registry | (() => Registry) }).modelContext;
    const registry = typeof (scope as Registry).register === 'function' ? (scope as Registry) : (scope as () => Registry)();
    return registry.register({ getModelContext: () => config });
  }, [aui, value, effort]);
  return null;
}

export type AuiModelSelectorProps = Omit<AuiModelSelectorRootProps, 'children'> & {
  variant?: AuiModelSelectorVariant;
  size?: AuiModelSelectorSize;
  searchable?: boolean;
  align?: 'start' | 'end';
  sx?: SxProps<Theme>;
  /** El contenido del menú, para componerlo (p. ej. por grupos). Sin él: buscador, lista y esfuerzo. */
  children?: React.ReactNode;
};

/** El selector completo, conectado al runtime. */
export function AuiModelSelector({ variant, size, searchable, align, sx, children, ...root }: AuiModelSelectorProps) {
  return (
    <AuiModelSelectorRoot {...root}>
      <ModelContextRegistration />
      <AuiModelSelectorTrigger variant={variant} size={size} sx={sx} />
      <AuiModelSelectorContent align={align} searchable={searchable}>{children}</AuiModelSelectorContent>
    </AuiModelSelectorRoot>
  );
}
