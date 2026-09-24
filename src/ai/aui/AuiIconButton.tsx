// Cosmos DS · Kit IA · AUI connected: botón de ícono con tooltip.
// Referente: assistant-ui «Tooltip icon button» (elements/tooltip-icon-button.tsx): un botón de ícono fantasma de 24px
// con su nombre en un tooltip y en texto para lectores de pantalla. Reenvía la ref y las props, así las primitivas de
// assistant-ui (`asChild`/`render`) le inyectan su onClick, disabled y aria-*.
import * as React from 'react';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';

/** Medidas de assistant-ui: botón de 24px con ícono de 16px (size-6 p-1). */
export const AUI_ICON_BUTTON = 3;
export const AUI_ICON = 16;

export interface AuiIconButtonProps extends Omit<IconButtonProps, 'size'> {
  tooltip: string;
  side?: TooltipProps['placement'];
  /** Lado del botón en unidades de espaciado. Default 3 (24px). */
  size?: number;
  /** Para usarlo como enlace (`component="a"` con `href`, `download`, `target`…). */
  component?: React.ElementType;
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
}

export const AuiIconButton = React.forwardRef<HTMLButtonElement, AuiIconButtonProps>(function AuiIconButton(
  { tooltip, side = 'bottom', size = AUI_ICON_BUTTON, sx, children, ...rest },
  ref,
) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const setRef = React.useCallback((node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);
  // Un botón desactivado no dispara eventos, así que el tooltip escucha en un envoltorio. Es `display: contents`
  // (no ocupa caja: el botón se posiciona como si no existiera) y siempre está, para que el árbol no cambie de forma al
  // activarse o desactivarse; el tooltip se ancla al botón.
  return (
    <Tooltip title={tooltip} placement={side} disableInteractive PopperProps={{ anchorEl: () => buttonRef.current as HTMLElement }}>
      <span style={{ display: 'contents' }}>
        <IconButton
          ref={setRef}
          aria-label={rest['aria-label'] ?? tooltip}
          {...rest}
          sx={[
            (t) => ({ width: t.spacing(size), height: t.spacing(size), p: 0.5, color: 'text.secondary', '& svg': { width: AUI_ICON, height: AUI_ICON } }),
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
});
