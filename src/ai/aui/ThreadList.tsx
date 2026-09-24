// Cosmos DS · Kit IA · AUI connected: Thread list.
// Referente: assistant-ui «Thread list» (elements/thread-list.aui.tsx), conectado al runtime.
// «Nuevo hilo», búsqueda por título (solo cuando hay hilos) y los hilos agrupados por última actividad: Hoy, Ayer,
// Anteriores. El activo queda resaltado; el que está corriendo muestra un spinner. «Más» (visible al pasar, al enfocar
// o en el activo) abre Renombrar en su lugar (Enter guarda, Esc cancela), Archivar y Eliminar.
import * as React from 'react';
import {
  AuiIf,
  ThreadListItemMorePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAui,
  useAuiState,
} from '@assistant-ui/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import OutlinedInput from '@mui/material/OutlinedInput';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { Archive, MoreHorizontal, Pencil, Plus, Search, Trash } from 'lucide-react';
import { AuiIconButton } from './AuiIconButton';
import { auiMenuContent, auiMenuItem } from './menu';

/** Medidas del tablero (assistant-ui con la densidad de Cosmos): filas de 36px, «Más» de 28px, íconos de 16px. */
const ROW = 4.5;
const MORE = 3.5;
const ICON_SIZE = 16;
const SMALL_ICON = 14;
const DAY_IN_MS = 86_400_000;
export const AUI_NEW_CHAT = 'Nuevo chat';

export function AuiThreadList() {
  const [search, setSearch] = React.useState('');
  const hasThreads = useAuiState((s) => s.threads.threadIds.length > 0);
  return (
    <AuiThreadListRoot>
      <AuiThreadListNew />
      {hasThreads ? <AuiThreadListSearch value={search} onValueChange={setSearch} /> : null}
      <AuiThreadListItems searchQuery={hasThreads ? search : ''} />
    </AuiThreadListRoot>
  );
}

export function AuiThreadListSearch({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  return (
    <Box sx={{ px: 0.25, py: 0.5 }}>
      <OutlinedInput
        size="small"
        fullWidth
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="Buscar hilos"
        inputProps={{ 'aria-label': 'Buscar hilos' }}
        startAdornment={<InputAdornment position="start" sx={{ color: 'text.secondary' }}><Search size={ICON_SIZE} /></InputAdornment>}
        sx={(t) => ({ ...t.typography.body1 })}
      />
    </Box>
  );
}

const ListRoot = styled(ThreadListPrimitive.Root)(({ theme: t }) => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(0.25) }));
export function AuiThreadListRoot({ children }: { children: React.ReactNode }) {
  return <ListRoot data-slot="aui-thread-list">{children}</ListRoot>;
}

export function AuiThreadListItems({ searchQuery = '' }: { searchQuery?: string }) {
  return (
    <Stack spacing={0.25} data-slot="aui-thread-list-items">
      <AuiIf condition={(s) => s.threads.isLoading}><ListSkeleton /></AuiIf>
      <AuiIf condition={(s) => !s.threads.isLoading}><ItemGroups searchQuery={searchQuery} /></AuiIf>
    </Stack>
  );
}

const groupLabel = (date: Date | undefined, startOfToday: number) => {
  if (!date || date.getTime() >= startOfToday) return 'Hoy';
  if (date.getTime() >= startOfToday - DAY_IN_MS) return 'Ayer';
  return 'Anteriores';
};

export type AuiThreadListGroup = { label: string; indices: number[] };

/** Filtra por título y agrupa por última actividad. `groups` es null si ningún hilo trae fecha (orden del runtime). */
export function useAuiThreadListGroups(searchQuery = '') {
  const threadIds = useAuiState((s) => s.threads.threadIds);
  const threadItems = useAuiState((s) => s.threads.threadItems);
  const query = searchQuery.trim().toLowerCase();
  return React.useMemo(() => {
    const byId = new Map(threadItems.map((item) => [item.id, item]));
    const dates = threadIds.map((id) => byId.get(id)?.lastMessageAt);
    const filteredIndices = threadIds
      .map((id, index) => ({ id, index }))
      .filter(({ id }) => !query || (byId.get(id)?.title || AUI_NEW_CHAT).toLowerCase().includes(query))
      .map(({ index }) => index);
    if (!filteredIndices.some((index) => dates[index])) return { threadIds, filteredIndices, groups: null };
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const time = (index: number) => dates[index]?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const groups: AuiThreadListGroup[] = [];
    for (const index of [...filteredIndices].sort((a, b) => time(b) - time(a))) {
      const label = groupLabel(dates[index], startOfToday);
      const last = groups[groups.length - 1];
      if (last?.label === label) last.indices.push(index);
      else groups.push({ label, indices: [index] });
    }
    return { threadIds, filteredIndices, groups };
  }, [threadIds, threadItems, query]);
}

function ItemGroups({ searchQuery = '' }: { searchQuery?: string }) {
  const { threadIds, filteredIndices, groups } = useAuiThreadListGroups(searchQuery);
  if (searchQuery.trim() && filteredIndices.length === 0) {
    return <Typography variant="body1" color="text.secondary" role="status" sx={{ px: 1.5, py: 2 }}>No se encontraron hilos</Typography>;
  }
  const item = (index: number) => <ThreadListPrimitive.ItemByIndex key={threadIds[index]} index={index} components={{ ThreadListItem: AuiThreadListItem }} />;
  if (!groups) return <>{filteredIndices.map(item)}</>;
  return (
    <>
      {groups.map((group) => (
        <React.Fragment key={group.label}>
          <Typography variant="caption" color="text.secondary" sx={(t) => ({ px: 1.5, pt: 1.5, pb: 0.5, fontWeight: t.typography.fontWeightMedium })}>{group.label}</Typography>
          {group.indices.map(item)}
        </React.Fragment>
      ))}
    </>
  );
}

export function AuiThreadListNew({ label = 'Nuevo hilo' }: { label?: string }) {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        color="inherit"
        startIcon={<Plus size={ICON_SIZE} />}
        data-slot="aui-thread-list-new"
        sx={(t) => ({ ...t.typography.body1, height: t.spacing(ROW), justifyContent: 'flex-start', px: 1.5, textTransform: 'none', '&:hover': { bgcolor: 'action.hover' }, '&[data-active]': { bgcolor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity), color: 'primary.main' } })}
      >
        {label}
      </Button>
    </ThreadListPrimitive.New>
  );
}

function ListSkeleton() {
  return (
    <Stack spacing={0.25}>
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} role="status" aria-label="Cargando hilos" sx={(t) => ({ height: t.spacing(ROW), display: 'flex', alignItems: 'center', px: 1.25 })}>
          <Skeleton width="100%" />
        </Box>
      ))}
    </Stack>
  );
}

const ItemRoot = styled(ThreadListItemPrimitive.Root)(({ theme: t }) => ({
  position: 'relative', display: 'flex', alignItems: 'center', height: t.spacing(ROW), borderRadius: t.shape.borderRadius,
  transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
  '&:hover, &:has(:focus-visible), &:has([data-state="open"])': { backgroundColor: t.palette.action.hover },
  '&[data-active]': { backgroundColor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity), '& [data-slot="aui-thread-list-item-trigger"]': { color: t.palette.primary.main } },
  '&[data-active]:hover': { backgroundColor: alpha(t.palette.primary.main, t.palette.action.selectedOpacity + t.palette.action.hoverOpacity) },
  '& [data-slot="aui-thread-list-item-more"]': { opacity: 0 },
  '&:hover [data-slot="aui-thread-list-item-more"], &[data-active] [data-slot="aui-thread-list-item-more"], &:has(:focus-visible) [data-slot="aui-thread-list-item-more"], & [data-slot="aui-thread-list-item-more"][data-state="open"]': { opacity: 1 },
  '&:hover [data-slot="aui-thread-list-item-trigger"], &[data-active] [data-slot="aui-thread-list-item-trigger"], &:has(:focus-visible) [data-slot="aui-thread-list-item-trigger"]': { paddingInlineEnd: t.spacing(5) },
}));
const ItemTrigger = styled(ThreadListItemPrimitive.Trigger)(({ theme: t }) => ({
  ...t.typography.body1, display: 'flex', alignItems: 'center', gap: t.spacing(0.75), flex: 1, minWidth: 0, height: '100%', padding: t.spacing(0, 1.5),
  border: 0, borderRadius: t.shape.borderRadius, background: 'transparent', color: t.palette.text.primary, textAlign: 'start', cursor: 'pointer', outline: 'none',
  '&:focus-visible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: -2 },
}));

export function AuiThreadListItem() {
  const isRunning = useAuiState((s) => s.threadListItem.isRunning);
  const [renaming, setRenaming] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const restoreFocus = React.useRef(false);
  React.useEffect(() => {
    if (renaming || !restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [renaming]);
  return (
    <ItemRoot data-slot="aui-thread-list-item">
      {renaming ? (
        <Rename onDone={(restore) => { restoreFocus.current = restore; setRenaming(false); }} />
      ) : (
        <ItemTrigger ref={triggerRef} data-slot="aui-thread-list-item-trigger">
          {isRunning ? <CircularProgress aria-hidden="true" size={SMALL_ICON} thickness={5} sx={{ flexShrink: 0, color: 'action.active' }} /> : null}
          <Box component="span" sx={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <ThreadListItemPrimitive.Title fallback={AUI_NEW_CHAT} />
          </Box>
          {isRunning ? <Box component="span" sx={visuallyHidden}>En ejecución</Box> : null}
        </ItemTrigger>
      )}
      <ItemMore onRename={() => setRenaming(true)} />
    </ItemRoot>
  );
}

function Rename({ onDone }: { onDone: (restoreFocus: boolean) => void }) {
  const aui = useAui();
  const title = useAuiState((s) => s.threadListItem.title) ?? '';
  const [value, setValue] = React.useState(title);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const settled = React.useRef(false);
  React.useEffect(() => { inputRef.current?.select(); }, []);
  const commit = (restore: boolean) => {
    if (settled.current) return;
    settled.current = true;
    const next = value.trim();
    if (!next || next === title) { onDone(restore); return; }
    Promise.resolve()
      .then(() => aui.threadListItem.rename(next))
      .then(() => onDone(restore), () => { settled.current = false; if (restore) inputRef.current?.focus(); });
  };
  const cancel = () => { if (settled.current) return; settled.current = true; onDone(true); };
  return (
    <InputBase
      inputRef={inputRef}
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => commit(false)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') { event.preventDefault(); commit(true); }
        else if (event.key === 'Escape') { event.preventDefault(); cancel(); }
      }}
      inputProps={{ 'aria-label': 'Renombrar hilo' }}
      sx={(t) => ({ ...t.typography.body1, flex: 1, minWidth: 0, height: t.spacing(4), mx: 0.25, px: 1.25, border: 1, borderColor: 'primary.main', boxShadow: `0 0 0 1px ${t.palette.primary.main}`, borderRadius: 1, bgcolor: 'background.paper' })}
    />
  );
}

const MoreContent = styled(ThreadListItemMorePrimitive.Content)(({ theme }) => auiMenuContent(theme));
const MoreItem = styled(ThreadListItemMorePrimitive.Item)(({ theme }) => auiMenuItem(theme));

function ItemMore({ onRename }: { onRename: () => void }) {
  return (
    <ThreadListItemMorePrimitive.Root sharedFocusGroup>
      <ThreadListItemMorePrimitive.Trigger asChild>
        <AuiIconButton
          tooltip="Más opciones"
          data-slot="aui-thread-list-item-more"
          size={MORE}
          sx={{ position: 'absolute', right: (t) => t.spacing(0.75), top: '50%', transform: 'translateY(-50%)', '&[data-state="open"]': { bgcolor: 'action.selected' } }}
        >
          <MoreHorizontal />
        </AuiIconButton>
      </ThreadListItemMorePrimitive.Trigger>
      <MoreContent side="right" align="start" sideOffset={6}>
        <MoreItem onSelect={onRename}><Pencil size={ICON_SIZE} />Renombrar</MoreItem>
        <ThreadListItemPrimitive.Archive asChild>
          <MoreItem><Archive size={ICON_SIZE} />Archivar</MoreItem>
        </ThreadListItemPrimitive.Archive>
        <ThreadListItemPrimitive.Delete asChild>
          <MoreItem data-variant="danger"><Trash size={ICON_SIZE} />Eliminar</MoreItem>
        </ThreadListItemPrimitive.Delete>
      </MoreContent>
    </ThreadListItemMorePrimitive.Root>
  );
}
