// Cosmos DS · Kit IA · AUI connected (Sinco): Selection as context.
// Referente: el tablero «Selection as context» sobre `useAssistantInstructions` de assistant-ui.
// Lo que la persona seleccionó en la pantalla (filas, registros) viaja como instrucción del modelo mientras esté
// seleccionado. En el composer se ve como una ficha con el resumen (el detalle en el tooltip) y se quita con la X: el
// siguiente mensaje sale sin ese contexto hasta que la selección cambie o la persona lo pida de nuevo (Ask AI). Cada
// mensaje enviado con contexto lo muestra encima de su burbuja.
import * as React from 'react';
import { useAssistantInstructions, useAuiEvent, useAuiState } from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { ListFilter } from 'lucide-react';

export type AuiSelection = {
  /** Identidad de la selección (p. ej. los ids ordenados): quitar la ficha vale hasta que cambie. */
  key: string;
  /** El resumen de la ficha: «3 obligaciones · $ 3.930.000,00». */
  label: string;
  /** El detalle del tooltip: los documentos seleccionados. */
  title?: string;
  /** Lo que recibe el modelo. */
  instruction: string;
};

type SelectionContextValue = {
  /** La selección que viaja en el próximo mensaje; null si no hay o se quitó. */
  active: AuiSelection | null;
  /** Quita la ficha: el próximo mensaje sale sin contexto. */
  remove: () => void;
  /** La vuelve a poner (la acción «Preguntar a la IA»). */
  restore: () => void;
  /** El contexto con que salió un mensaje. */
  labelFor: (messageId: string) => string | undefined;
};

const SelectionContext = React.createContext<SelectionContextValue | null>(null);

export function useAuiSelectionContext() {
  return React.useContext(SelectionContext);
}

/** Ícono de la ficha: 16px, como los de Chip small. */
const ICON = 16;
/** Un envío toma el contexto si su mensaje aparece en este lapso (los adjuntos pueden demorar la entrega). */
const SEND_WINDOW_MS = 10_000;
/** Un mensaje que apareció antes que su evento de envío lo espera este lapso. */
const PAIR_WINDOW_MS = 1000;

/** Pasa la selección del anfitrión como contexto del modelo. Va dentro del runtime, alrededor del hilo y del anfitrión. */
export function AuiSelectionContextProvider({ selection, children }: { selection: AuiSelection | null; children: React.ReactNode }) {
  const [removedKey, setRemovedKey] = React.useState<string | null>(null);
  // Una selección distinta vuelve a viajar aunque la anterior se hubiera quitado.
  const key = selection?.key ?? null;
  const [prevKey, setPrevKey] = React.useState(key);
  if (key !== prevKey) { setPrevKey(key); setRemovedKey(null); }
  const active = selection && selection.key !== removedKey ? selection : null;
  useAssistantInstructions({ instruction: active?.instruction ?? '', disabled: !active });

  // El contexto de cada mensaje enviado. El evento de envío y el mensaje nuevo llegan en cualquier orden: el que llega
  // segundo empareja con el primero si están cerca.
  const [labels, setLabels] = React.useState<ReadonlyMap<string, string>>(() => new Map());
  const pending = React.useRef<{ label: string | null; at: number } | null>(null);
  const fresh = React.useRef<{ id: string; at: number } | null>(null);
  const seen = React.useRef<Set<string> | null>(null);
  const activeRef = React.useRef(active);
  activeRef.current = active;
  const label = React.useCallback((id: string, text: string | null) => {
    if (text) setLabels((prev) => new Map(prev).set(id, text));
  }, []);
  useAuiEvent('composer.send', () => {
    const text = activeRef.current?.label ?? null;
    const f = fresh.current;
    if (f && Date.now() - f.at < PAIR_WINDOW_MS) { fresh.current = null; label(f.id, text); return; }
    pending.current = { label: text, at: Date.now() };
  });
  const userIds = useAuiState((s) => s.thread.messages.filter((m) => m.role === 'user').map((m) => m.id).join('\n'));
  React.useEffect(() => {
    const ids = userIds ? userIds.split('\n') : [];
    if (!seen.current) { seen.current = new Set(ids); return; }
    const added = ids.filter((id) => !seen.current?.has(id));
    added.forEach((id) => seen.current?.add(id));
    const id = added[added.length - 1];
    if (!id) return;
    const p = pending.current;
    if (p && Date.now() - p.at < SEND_WINDOW_MS) { pending.current = null; label(id, p.label); return; }
    fresh.current = { id, at: Date.now() };
  }, [userIds, label]);

  const value = React.useMemo<SelectionContextValue>(() => ({
    active,
    remove: () => setRemovedKey(selection?.key ?? null),
    restore: () => setRemovedKey(null),
    labelFor: (id) => labels.get(id),
  }), [active, selection?.key, labels]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

function ContextChip({ label, title, onDelete }: { label: string; title?: string; onDelete?: () => void }) {
  const chip = (
    <Chip
      size="small"
      variant="outlined"
      icon={<ListFilter size={ICON} />}
      label={label}
      onDelete={onDelete}
      aria-label={onDelete ? `Contexto: ${label}. Suprimir para quitarlo` : `Contexto: ${label}`}
      data-slot="aui-selection-context"
      sx={{ alignSelf: 'flex-start', maxWidth: '100%', bgcolor: 'background.paper', fontVariantNumeric: 'tabular-nums' }}
    />
  );
  return title ? <Tooltip title={title}>{chip}</Tooltip> : chip;
}

/** La ficha del composer. Sin selección activa no pinta nada. */
export function AuiSelectionContextChip() {
  const ctx = useAuiSelectionContext();
  if (!ctx?.active) return null;
  return (
    <Box data-slot="aui-composer-context" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 0.5 }}>
      <ContextChip label={ctx.active.label} title={ctx.active.title} onDelete={ctx.remove} />
    </Box>
  );
}

/** La ficha sobre un mensaje enviado con contexto (dentro de `MessagePrimitive.Root`). */
export function AuiSelectionContextMessageChip() {
  const ctx = useAuiSelectionContext();
  const id = useAuiState((s) => s.message.id);
  const label = ctx?.labelFor(id);
  if (!label) return null;
  return <ContextChip label={label} />;
}
