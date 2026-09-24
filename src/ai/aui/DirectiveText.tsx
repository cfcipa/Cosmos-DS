// Cosmos DS · Kit IA · AUI connected: Directive text.
// Referente: assistant-ui «Directive text» (elements/directive-text.tsx y directive-text.aui.tsx).
// Un renderizador de texto que convierte las directivas de mención (`:user[Nubia Rojas]{name=nubia}`) en fichas en
// línea con su tipo para lectores de pantalla y, si se da `iconMap`, su ícono. Un texto sin directivas se muestra tal
// cual, sin envoltorio. Las menciones que inserta el Trigger popover se ven así en el mensaje enviado.
import * as React from 'react';
import { unstable_defaultDirectiveFormatter, type TextMessagePartComponent, type Unstable_DirectiveFormatter } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

type IconComponent = React.FC<{ className?: string }>;
export type AuiDirectiveSegment =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'mention'; readonly type: string; readonly label: string; readonly id: string };
export type AuiDirectiveFormatter = { parse(text: string): readonly AuiDirectiveSegment[] };
export type AuiDirectiveTextOptions = {
  /** Ícono por tipo de directiva (`user`, `tool`, `command`…). */
  iconMap?: Record<string, IconComponent>;
  /** Ícono para los tipos que no están en `iconMap`. */
  fallbackIcon?: IconComponent;
};

/** Ícono de la ficha: 14px (size-3.5 de assistant-ui). */
const CHIP_ICON = 14;

/** Las fichas de un texto con directivas. */
export function AuiDirectiveSegments({ text, formatter = unstable_defaultDirectiveFormatter, iconMap, fallbackIcon }: AuiDirectiveTextOptions & { text: string; formatter?: AuiDirectiveFormatter | Unstable_DirectiveFormatter }) {
  const segments = (formatter as AuiDirectiveFormatter).parse(text);
  if (segments.length === 1 && segments[0].kind === 'text') return <>{text}</>;
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.kind === 'text') return <Box key={i} component="span" sx={{ whiteSpace: 'pre-wrap' }}>{seg.text}</Box>;
        const Icon = iconMap?.[seg.type] ?? fallbackIcon;
        return (
          <Chip
            key={i}
            size="small"
            component="span"
            data-slot="aui-directive-chip"
            data-directive-type={seg.type}
            data-directive-id={seg.id}
            aria-label={`${seg.type}: ${seg.label}`}
            icon={Icon ? <Box component={Icon} sx={{ width: CHIP_ICON, height: CHIP_ICON }} /> : undefined}
            label={seg.label}
            sx={(t) => ({
              ...t.typography.body2, height: 'auto', verticalAlign: 'baseline', borderRadius: 1, bgcolor: 'action.selected', color: 'text.primary',
              '& .MuiChip-label': { px: 0.75, py: 0.25 }, '& .MuiChip-icon': { ml: 0.75, mr: -0.25, color: 'text.secondary' },
            })}
          />
        );
      })}
    </>
  );
}

/** Crea un `Text` para `MessagePrimitive.Parts` que convierte las directivas en fichas. */
export function createAuiDirectiveText(formatter: Unstable_DirectiveFormatter = unstable_defaultDirectiveFormatter, options: AuiDirectiveTextOptions = {}): TextMessagePartComponent {
  const Component: TextMessagePartComponent = function AuiDirectiveTextPart({ text }) {
    return <AuiDirectiveSegments text={text} formatter={formatter} {...options} />;
  };
  Component.displayName = 'AuiDirectiveText';
  return Component;
}

/** `Text` con las directivas como fichas, sin íconos. */
export const AuiDirectiveText: TextMessagePartComponent = React.memo(createAuiDirectiveText());

