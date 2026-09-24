// Cosmos DS · Kit IA · AUI connected (Sinco): Ask AI on selection.
// Referente: el tablero «Ask AI on selection».
// Una acción de la barra de selección de una tabla («n seleccionadas»): abre el asistente con las filas elegidas ya como
// contexto (la ficha vuelve aunque se hubiera quitado) y deja el foco en el composer. Sin selección, la barra y la
// acción no están.
import * as React from 'react';
import Button from '@mui/material/Button';
import { MoonStar } from 'lucide-react';
import { useAuiAssistant } from './AssistantPanel';
import { useAuiSelectionContext } from './SelectionContext';

export interface AuiAskAiActionProps {
  /** Default 'Preguntar a la IA'. */
  label?: string;
  /** Además de abrir el asistente (o en lugar de él, fuera de `AuiAssistantProvider`). */
  onClick?: () => void;
}

/** Ícono de 14px, como en el tablero. */
const ICON = 14;

export function AuiAskAiAction({ label = 'Preguntar a la IA', onClick }: AuiAskAiActionProps) {
  const assistant = useAuiAssistant();
  const selection = useAuiSelectionContext();
  return (
    <Button
      size="small"
      startIcon={<MoonStar size={ICON} />}
      data-slot="aui-ask-ai-action"
      title="Preguntar a la IA sobre la selección"
      onClick={() => {
        selection?.restore();
        assistant?.open();
        onClick?.();
      }}
      sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
    >
      {label}
    </Button>
  );
}
