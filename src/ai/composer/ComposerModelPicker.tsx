// Cosmos DS · Kit IA · Composer: Models.
// Tablero «Models»: el modelo vive en el riel del composer, a un toque, con su contexto a la vista.
// Como en assistant-ui (ComposerModelTrigger + ComposerModelItem): el disparador muestra el modelo actual; elegir uno cierra
// el menú y deja su nombre en el riel; se cierra con el disparador o con Esc (como en el tablero, no con clic afuera). Button text de MUI + el menú del composer en un Popper.
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import { ChevronDown } from 'lucide-react';
import { ComposerMenu, ComposerModelItem } from './ComposerMenu';
import type { ComposerModel } from './ComposerMenu';

export interface ComposerModelPickerProps {
  models: readonly ComposerModel[];
  model: string;
  onModelChange: (name: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  /** Default 'Modelos'. */
  title?: string;
}

/** Ancho del menú en el tablero. */
const MENU_WIDTH = 260;

export function ComposerModelPicker({ models, model, onModelChange, open, onOpenChange, disabled, title = 'Modelos' }: ComposerModelPickerProps) {
  const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null);
  return (
      <Box sx={{ display: 'inline-flex' }} onKeyDown={(event) => { if (event.key === 'Escape' && open) { event.stopPropagation(); onOpenChange(false); } }}>
        <Button
          ref={setAnchor}
          variant="text"
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Modelo: ${model}`}
          endIcon={<ChevronDown size={14} />}
          onClick={() => onOpenChange(!open)}
        >
          {model}
        </Button>
        <Popper open={open && Boolean(anchor)} anchorEl={anchor} placement="top-start" disablePortal sx={{ zIndex: 'modal' }} modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}>
          <ComposerMenu label={title} subheader={title} role="menu" width={MENU_WIDTH}>
            {models.map((entry) => (
              <ComposerModelItem key={entry.name} model={entry} selected={entry.name === model} onClick={() => { onModelChange(entry.name); onOpenChange(false); }} />
            ))}
          </ComposerMenu>
        </Popper>
      </Box>
  );
}
