// Cosmos DS · Kit IA · AUI connected: Composer trigger popover.
// Referente: assistant-ui «Composer trigger popover» (elements/composer-trigger-popover.aui.tsx).
// Un selector que se abre al escribir un carácter en el composer (@ para mencionar, / para comandos): primero las
// categorías y, al entrar en una o al escribir, sus elementos con descripción. ↑ ↓ recorren, Enter o Tab eligen, Esc
// cierra y Retroceso con la búsqueda vacía vuelve a las categorías. Con `directive` inserta una mención en el texto
// (que Directive text muestra como ficha); con `action` ejecuta algo y puede quitar el /comando. Va dentro de
// `ComposerPrimitive.Unstable_TriggerPopoverRoot` (en AuiThread: `triggers`).
import * as React from 'react';
import {
  ComposerPrimitive, unstable_defaultDirectiveFormatter, unstable_useTriggerPopoverScopeContext,
  type Unstable_DirectiveFormatter, type Unstable_TriggerItem,
} from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled, type Theme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

type IconComponent = React.FC<{ className?: string }>;

/** Medidas de assistant-ui: 256px de ancho, 8px sobre el composer; íconos de 16px (14px en los elementos). */
const WIDTH = 32;
const ICON = 16;
const ITEM_ICON = 14;
/** La descripción se alinea con el texto del elemento: ícono de 14px más 8px de separación. */
const DESCRIPTION_INDENT = `${ITEM_ICON + 8}px`;

type DirectiveBehavior = { formatter?: Unstable_DirectiveFormatter; onInserted?: (item: Unstable_TriggerItem) => void };
type ActionBehavior = { formatter?: Unstable_DirectiveFormatter; onExecute: (item: Unstable_TriggerItem) => void; removeOnExecute?: boolean };

export type AuiComposerTriggerPopoverProps = Omit<React.ComponentProps<typeof ComposerPrimitive.Unstable_TriggerPopover>, 'children'> & {
  /** Íconos por clave: los elementos usan `metadata.icon`; las categorías, su `id`. */
  iconMap?: Record<string, IconComponent>;
  fallbackIcon?: IconComponent;
  /** Default 'Volver'. */
  backLabel?: string;
  /** Default 'No hay elementos disponibles'. */
  emptyCategoriesLabel?: string;
  /** Default 'Ningún elemento coincide'. */
  emptyItemsLabel?: string;
  /** Default 'Cargando…'. */
  loadingLabel?: string;
} & ({ directive: DirectiveBehavior; action?: never } | { action: ActionBehavior; directive?: never });

const rowSx = (t: Theme) => ({
  ...t.typography.body2, display: 'flex', alignItems: 'center', width: '100%', gap: t.spacing(1), padding: t.spacing(1, 1.5), border: 0, background: 'transparent',
  color: t.palette.text.primary, textAlign: 'start' as const, cursor: 'pointer', outline: 'none',
  transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
  '&:hover, &:focus-visible, &[data-highlighted]': { backgroundColor: t.palette.action.hover },
});
const CategoryItem = styled(ComposerPrimitive.Unstable_TriggerPopoverCategoryItem)(({ theme: t }) => ({ ...rowSx(t), justifyContent: 'space-between' }));
const Item = styled(ComposerPrimitive.Unstable_TriggerPopoverItem)(({ theme: t }) => ({ ...rowSx(t), flexDirection: 'column', alignItems: 'flex-start', gap: t.spacing(0.25) }));
const Back = styled(ComposerPrimitive.Unstable_TriggerPopoverBack)(({ theme: t }) => ({
  ...rowSx(t), ...t.typography.overline, lineHeight: t.typography.caption.lineHeight, gap: t.spacing(0.75), color: t.palette.text.secondary,
  borderBottom: `1px solid ${t.palette.divider}`,
}));
const PopoverRoot = styled(ComposerPrimitive.Unstable_TriggerPopover)(({ theme: t }) => ({
  position: 'absolute', left: 0, bottom: '100%', zIndex: t.zIndex.modal, marginBottom: t.spacing(1), width: t.spacing(WIDTH),
}));

const iconFor = (key: string | undefined, map: Record<string, IconComponent> | undefined, fallback: IconComponent) => (key && map?.[key]) || fallback;

function Categories({ iconMap, fallbackIcon, emptyLabel }: { iconMap?: Record<string, IconComponent>; fallbackIcon: IconComponent; emptyLabel: string }) {
  return (
    <ComposerPrimitive.Unstable_TriggerPopoverCategories>
      {(categories) => (
        <Box data-slot="aui-trigger-popover-categories" sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
          {categories.map((cat) => {
            const Icon = iconFor(cat.id, iconMap, fallbackIcon);
            return (
              <CategoryItem key={cat.id} categoryId={cat.id}>
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component={Icon} sx={{ width: ICON, height: ICON, color: 'text.secondary' }} />
                  {cat.label}
                </Box>
                <Box component={ChevronRight} sx={{ width: ICON, height: ICON, color: 'text.secondary' }} />
              </CategoryItem>
            );
          })}
          {categories.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1 }}>{emptyLabel}</Typography>}
        </Box>
      )}
    </ComposerPrimitive.Unstable_TriggerPopoverCategories>
  );
}

function Items({ iconMap, fallbackIcon, backLabel, emptyLabel, loadingLabel }: { iconMap?: Record<string, IconComponent>; fallbackIcon: IconComponent; backLabel: string; emptyLabel: string; loadingLabel: string }) {
  const { isLoading } = unstable_useTriggerPopoverScopeContext();
  return (
    <ComposerPrimitive.Unstable_TriggerPopoverItems>
      {(items) => (
        <Box data-slot="aui-trigger-popover-items" sx={{ display: 'flex', flexDirection: 'column' }}>
          <Back><Box component={ChevronLeft} sx={{ width: ITEM_ICON, height: ITEM_ICON }} />{backLabel}</Back>
          <Box sx={{ py: 0.5 }}>
            {items.map((item, index) => {
              const Icon = iconFor(typeof item.metadata?.icon === 'string' ? item.metadata.icon : undefined, iconMap, fallbackIcon);
              return (
                <Item key={item.id} item={item} index={index}>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'fontWeightMedium' }}>
                    <Box component={Icon} sx={{ width: ITEM_ICON, height: ITEM_ICON, color: 'primary.main' }} />
                    {item.label}
                  </Box>
                  {item.description && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: DESCRIPTION_INDENT }}>{item.description}</Typography>}
                </Item>
              );
            })}
            {items.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1 }}>{isLoading ? loadingLabel : emptyLabel}</Typography>}
          </Box>
        </Box>
      )}
    </ComposerPrimitive.Unstable_TriggerPopoverItems>
  );
}

/** El selector del carácter. Pasa exactamente uno de `directive` (inserta una mención) o `action` (ejecuta). */
export const AuiComposerTriggerPopover = React.memo(function AuiComposerTriggerPopover({
  iconMap, fallbackIcon = Sparkles, backLabel = 'Volver', emptyCategoriesLabel = 'No hay elementos disponibles', emptyItemsLabel = 'Ningún elemento coincide',
  loadingLabel = 'Cargando…', directive, action, ...props
}: AuiComposerTriggerPopoverProps) {
  return (
    <PopoverRoot data-slot="aui-trigger-popover" {...props}>
      <Paper elevation={8} sx={{ overflow: 'hidden' }}>
        {directive ? (
          <ComposerPrimitive.Unstable_TriggerPopover.Directive formatter={directive.formatter ?? unstable_defaultDirectiveFormatter} onInserted={directive.onInserted} />
        ) : action ? (
          <ComposerPrimitive.Unstable_TriggerPopover.Action formatter={action.formatter ?? unstable_defaultDirectiveFormatter} onExecute={action.onExecute} removeOnExecute={action.removeOnExecute} />
        ) : null}
        <Categories iconMap={iconMap} fallbackIcon={fallbackIcon} emptyLabel={emptyCategoriesLabel} />
        <Items iconMap={iconMap} fallbackIcon={fallbackIcon} backLabel={backLabel} emptyLabel={emptyItemsLabel} loadingLabel={loadingLabel} />
      </Paper>
    </PopoverRoot>
  );
}) as React.FC<AuiComposerTriggerPopoverProps>;
