// Cosmos DS · Kit IA · Messages: Regenerate with.
// Tablero aprobado «Regenerate with»: bifurca el mismo turno hacia otro modelo en lugar de volver a tirar los mismos dados.
// Como en assistant-ui: la lista se abre y se cierra solo con el disparador (no con clic afuera ni Esc),
// marca el modelo actual y, sin onPick, las opciones se muestran pero no se eligen.
// Botón dividido = ButtonGroup de MUI. La lista flota bajo el botón (Popper + Paper + MenuList): Popper no se cierra
// con clic afuera ni con Esc, que es lo que pide la referencia.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { keyframes } from '@mui/material/styles';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';

export interface RegenerateOption {
  id: string;
  label: string;
  /** «más lento», «equilibrado». En la opción actual se muestra «actual». */
  detail: string;
}

export interface RegenerateMenuProps {
  options: readonly RegenerateOption[];
  open: boolean;
  currentId: string;
  /** Regenerando: el ícono gira y el botón se desactiva. */
  regenerating?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Regenera con el mismo modelo. */
  onRegenerate?: () => void;
  /** Regenera con otro modelo. Sin él, las opciones se muestran pero no se pueden elegir. */
  onPick?: (id: string) => void;
  className?: string;
}

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadein = keyframes`from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: none; }`;
/** Ancho de la lista en el tablero. */
const MENU_WIDTH = 260;

export function RegenerateMenu({
  options,
  open,
  currentId,
  regenerating = false,
  onOpenChange,
  onRegenerate,
  onPick,
  className,
}: RegenerateMenuProps) {
  const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);

  return (
    <Box className={className} data-slot="regenerate-menu" sx={{ alignSelf: 'flex-start' }}>
      <ButtonGroup ref={setAnchor} variant="outlined" aria-label="Regenerar">
        <Button
          disabled={regenerating}
          onClick={onRegenerate}
          startIcon={
            <Box component="span" sx={{ display: 'inline-flex', ...(regenerating ? { animation: `${spin} 1s linear infinite`, [REDUCED_MOTION]: { animation: 'none' } } : null) }}>
              <RefreshCw size={16} />
            </Box>
          }
        >
          Regenerar
        </Button>
        {onOpenChange ? (
          <Button aria-label="Regenerar con otro modelo" aria-haspopup="menu" aria-expanded={open} onClick={() => onOpenChange(!open)}>
            <ChevronDown size={16} />
          </Button>
        ) : null}
      </ButtonGroup>

      <Popper open={open && Boolean(anchor)} anchorEl={anchor} placement="bottom-start" disablePortal sx={{ zIndex: "modal" }}>
        <Paper
          elevation={8}
          sx={(t) => ({
            mt: 0.5,
            width: MENU_WIDTH,
            animation: `${fadein} ${t.transitions.duration.shorter}ms ${t.transitions.easing.easeOut}`,
            [REDUCED_MOTION]: { animation: 'none' },
          })}
        >
          <MenuList aria-label="Regenerar con">
            {options.map((option) => {
              const isCurrent = option.id === currentId;
              return (
                <MenuItem
                  key={option.id}
                  role="menuitemradio"
                  aria-checked={isCurrent}
                  disabled={!onPick}
                  onClick={() => onPick?.(option.id)}
                  sx={{ '&.Mui-disabled': { opacity: 1 } }}
                >
                  <ListItemText
                    primary={option.label}
                    primaryTypographyProps={isCurrent ? { fontWeight: 'fontWeightMedium' } : undefined}
                    secondary={isCurrent ? 'actual' : option.detail}
                    secondaryTypographyProps={isCurrent ? { color: 'primary.main' } : undefined}
                  />
                </MenuItem>
              );
            })}
          </MenuList>
        </Paper>
      </Popper>
    </Box>
  );
}
