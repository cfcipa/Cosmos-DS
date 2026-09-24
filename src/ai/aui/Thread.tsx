// Cosmos DS · Kit IA · AUI connected: Thread.
// Referente: assistant-ui «Thread» (elements/thread.aui.tsx), conectado al runtime de @assistant-ui/react.
// Un contenedor de chat completo: bienvenida con el composer centrado y sugerencias debajo; al enviar, el composer se
// acopla abajo y el hilo sigue la respuesta. El usuario edita en su lugar (Cancelar / Actualizar); cada respuesta
// tiene copiar, regenerar y «Más» (exportar como Markdown), ocultos mientras corre y siempre visibles en la última;
// con varias versiones aparece «n / m». Ir al final se desactiva cuando ya estás abajo. Enviar pasa a detener.
// Las respuestas llevan formato (Markdown) y su razonamiento en un visor plegable. Opcionales: el tiempo del mensaje en
// la barra de acciones (`messageTiming`), el uso del contexto en el composer (`modelContextWindow`) y el mapa de la
// conversación junto al hilo (`conversationMap`).
import * as React from 'react';
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  type AssistantState,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  groupPartByType,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  type FileMessagePartComponent,
  type ImageMessagePartComponent,
  type ToolCallMessagePartComponent,
  useAuiState,
} from '@assistant-ui/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import { keyframes, styled } from '@mui/material/styles';
import {
  ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Copy, Download, Mic,
  MoreHorizontal, Pencil, RefreshCw, Square, ThumbsDown, ThumbsUp,
} from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { riseSx } from '../lib/thread';
import { AuiIconButton } from './AuiIconButton';
import { AuiComposerAddAttachment, AuiComposerAttachments, AuiUserMessageAttachments } from './Attachment';
import { AuiFollowupSuggestions } from './FollowupSuggestions';
import { auiMenuContent, auiMenuItem } from './menu';
import { AuiContextDisplayRing } from './ContextDisplay';
import { AuiConversationMapRail } from './ConversationMap';
import { AuiMarkdownText } from './MarkdownText';
import { AuiMessageTiming, AuiMessageTimingFooter } from './MessageTiming';
import { AuiReasoningGroup } from './Reasoning';
import { AuiToolFallback } from './ToolFallback';
import { AuiToolGroupContent, AuiToolGroupRoot, AuiToolGroupTrigger } from './ToolGroup';
import { AuiComposerQuotePreview, AuiQuoteBlock, AuiSelectionToolbar, AUI_QUOTE_ACTIONS } from './Quote';
import { AuiSources } from './Sources';
import { AuiImage } from './Image';
import { AuiFile } from './File';
import { AuiModelSelector, type AuiModelSelectorProps } from './ModelSelector';
import { createAuiDirectiveText, type AuiDirectiveTextOptions } from './DirectiveText';

export type AuiThreadTiming = { design?: 'badge' | 'footer'; side?: 'top' | 'right' | 'bottom' | 'left' };

export type AuiThreadComponents = {
  AssistantMessage?: React.ComponentType;
  Welcome?: React.ComponentType;
  ToolFallback?: ToolCallMessagePartComponent;
};

export interface AuiThreadProps {
  components?: AuiThreadComponents;
  /** Enfoca el composer al montar, al empezar una ejecución y al cambiar de hilo. Default true. */
  autoFocus?: boolean;
  /** Default '¿En qué te ayudo hoy?'. */
  welcome?: string;
  /** Default 'Escribe un mensaje…'. */
  placeholder?: string;
  /** Tiempos de cada respuesta: la insignia en la barra de acciones (`true` o `{ design: 'badge', side }`) o el pie
   * de estadísticas bajo el texto (`{ design: 'footer' }`). */
  messageTiming?: boolean | AuiThreadTiming;
  /** Ventana de contexto del modelo, en tokens: muestra el anillo de uso en el composer. */
  modelContextWindow?: number;
  /** Muestra el mapa de la conversación a un lado del hilo. `true` = izquierda. */
  conversationMap?: boolean | 'left' | 'right';
  /** Barra para citar el texto seleccionado de un mensaje. `true` = solo «Citar»; `'actions'` suma Explicar y Reescribir. */
  quotes?: boolean | 'actions';
  /** Las sugerencias de seguimiento se envían al tocarlas (default) o solo llenan el composer. */
  followupSend?: boolean;
  /** Selectores de carácter del composer (`AuiComposerTriggerPopover` para @ y /). */
  triggers?: React.ReactNode;
  /** Muestra las menciones de los mensajes del usuario como fichas (`true`, o con íconos por tipo). */
  directives?: boolean | AuiDirectiveTextOptions;
  /** El selector de modelo en el composer. */
  modelSelector?: AuiModelSelectorProps;
}

/** Medidas de assistant-ui: columna de 44rem, composer con 8px de relleno, botones de 28px, íconos de 16px. */
const THREAD_MAX_WIDTH = 704;
const SEND = 3.5;
const ICON_SIZE = 16;
const STOP_SIZE = 14;
/** Espacio que reserva la barra de acciones bajo cada respuesta (min-h-7.5). */
const ACTION_BAR = 3.75;
/** Con el mapa de la conversación, el hilo deja libre su riel (24px más 12px a cada lado). */
const MAP_GUTTER = 6;

const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: .35; }`;

const ComponentsContext = React.createContext<AuiThreadComponents>({});
type ThreadOptions = { welcome: string; placeholder: string; timing?: AuiThreadTiming; modelContextWindow?: number; triggers?: React.ReactNode; directives?: boolean | AuiDirectiveTextOptions; modelSelector?: AuiModelSelectorProps };
const LabelsContext = React.createContext<ThreadOptions>({ welcome: '¿En qué te ayudo hoy?', placeholder: 'Escribe un mensaje…' });

// Al arrancar, el hilo de carga cuenta como chat nuevo (composer centrado); cambiar a un hilo que aún trae su
// historial muestra el esqueleto, no la bienvenida.
const isNewChatView = (s: AssistantState) => s.thread.messages.length === 0 && (!s.thread.isLoading || s.threads.isLoading);
const isHistoryLoadingView = (s: AssistantState) => s.thread.messages.length === 0 && s.thread.isLoading && !s.thread.isDisabled && !s.threads.isLoading;

const messageGroupBy = groupPartByType({
  reasoning: ['group-chainOfThought', 'group-reasoning'],
  'tool-call': ['group-chainOfThought', 'group-tool'],
  'standalone-tool-call': [],
});

const Root = styled(ThreadPrimitive.Root)(({ theme: t }) => ({ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: t.palette.background.paper }));
const Viewport = styled(ThreadPrimitive.Viewport)({ position: 'relative', display: 'flex', flex: 1, flexDirection: 'column', overflowX: 'auto', overflowY: 'scroll', scrollBehavior: 'smooth' });
const ViewportFooter = styled(ThreadPrimitive.ViewportFooter)(({ theme: t }) => ({
  display: 'flex', flexDirection: 'column', gap: t.spacing(2), paddingBottom: t.spacing(2), backgroundColor: t.palette.background.paper,
  '&[data-docked="true"]': { position: 'sticky', bottom: 0, marginTop: 'auto' },
  [t.breakpoints.up('md')]: { paddingBottom: t.spacing(3) },
}));

export function AuiThread({
  components = {}, autoFocus = true, welcome = '¿En qué te ayudo hoy?', placeholder = 'Escribe un mensaje…', messageTiming = false, modelContextWindow, conversationMap, quotes = false, followupSend = true, triggers, directives, modelSelector,
}: AuiThreadProps) {
  const isEmpty = useAuiState(isNewChatView);
  const timingDesign = messageTiming === true ? 'badge' : messageTiming ? messageTiming.design ?? 'badge' : undefined;
  const timingSide = typeof messageTiming === 'object' ? messageTiming.side : undefined;
  const labels = React.useMemo(
    () => ({ welcome, placeholder, timing: timingDesign ? { design: timingDesign, side: timingSide } : undefined, modelContextWindow, triggers, directives, modelSelector }),
    [welcome, placeholder, timingDesign, timingSide, modelContextWindow, triggers, directives, modelSelector],
  );
  const mapSide = conversationMap === true ? 'left' : conversationMap || undefined;
  const Welcome = components.Welcome ?? ThreadWelcome;
  return (
    <ComponentsContext.Provider value={components}>
      <LabelsContext.Provider value={labels}>
        <Root data-slot="aui-thread">
          <Viewport turnAnchor="top" data-slot="aui-thread-viewport">
            {mapSide ? <AuiConversationMapRail side={mapSide} /> : null}
            <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: THREAD_MAX_WIDTH, boxSizing: 'border-box', px: 2, pt: 2, ...(mapSide ? { [mapSide === 'left' ? 'pl' : 'pr']: MAP_GUTTER } : null), justifyContent: isEmpty ? 'center' : undefined }}>
              <AuiIf condition={isNewChatView}><Welcome /></AuiIf>
              <AuiIf condition={isHistoryLoadingView}><HistorySkeleton /></AuiIf>
              <Stack spacing={3} data-slot="aui-message-group" sx={{ mb: 7, '&:empty': { display: 'none' } }}>
                <ThreadPrimitive.Messages>{() => <ThreadMessage />}</ThreadPrimitive.Messages>
              </Stack>
              <ViewportFooter data-docked={!isEmpty}>
                <ScrollToBottom />
                <AuiFollowupSuggestions send={followupSend} />
                <Composer autoFocus={autoFocus} />
                <AuiIf condition={(s) => isNewChatView(s) && s.composer.isEmpty}><WelcomeSuggestions /></AuiIf>
              </ViewportFooter>
            </Box>
            {quotes ? <AuiSelectionToolbar actions={quotes === 'actions' ? AUI_QUOTE_ACTIONS : undefined} /> : null}
          </Viewport>
        </Root>
      </LabelsContext.Provider>
    </ComponentsContext.Provider>
  );
}

function HistorySkeleton() {
  return (
    <Stack spacing={3} role="status" sx={(t) => riseSx(t, 150)}>
      <Box component="span" sx={visuallyHidden}>Cargando la conversación</Box>
      <Skeleton variant="rounded" sx={{ ml: 'auto', width: '40%', height: (t) => t.spacing(4.5) }} />
      <Stack spacing={1}><Skeleton width="92%" /><Skeleton width="80%" /><Skeleton width="60%" /></Stack>
      <Skeleton variant="rounded" sx={{ ml: 'auto', width: '33%', height: (t) => t.spacing(4.5) }} />
      <Stack spacing={1}><Skeleton width="83%" /><Skeleton width="66%" /></Stack>
    </Stack>
  );
}

function ThreadWelcome() {
  const { welcome } = React.useContext(LabelsContext);
  return (
    <Box sx={{ mb: 3, px: 1 }}>
      <Typography variant="h4" component="p" sx={(t) => ({ m: 0, ...riseSx(t) })}>{welcome}</Typography>
    </Box>
  );
}

const SuggestionButton = styled('button')(({ theme: t }) => ({
  ...t.typography.body2,
  display: 'flex', alignItems: 'baseline', gap: t.spacing(1.25), width: '100%', padding: t.spacing(1), border: 0,
  borderRadius: t.shape.borderRadius, background: 'transparent', color: t.palette.text.primary, textAlign: 'start', cursor: 'pointer',
  transition: t.transitions.create('background-color', { duration: t.transitions.duration.shortest }),
  '&:hover': { backgroundColor: t.palette.action.hover },
  '&:hover [data-slot="aui-suggestion-caret"]': { color: t.palette.text.primary },
  '&:focus-visible': { outline: `2px solid ${t.palette.ai.focusRing}` },
  [REDUCED_MOTION]: { transition: 'none' },
}));

function WelcomeSuggestions() {
  return (
    <Stack sx={{ width: '100%' }}>
      <ThreadPrimitive.Suggestions>
        {() => (
          <Box sx={(t) => riseSx(t)}>
            <SuggestionPrimitive.Trigger send asChild>
              <SuggestionButton type="button">
                <Box component="span" aria-hidden="true" data-slot="aui-suggestion-caret" sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.body3.fontSize, color: 'text.disabled' })}>{'>'}</Box>
                <Box component="span" sx={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <SuggestionPrimitive.Title />{' '}
                  <Box component={SuggestionPrimitive.Description} sx={{ color: 'text.secondary', '&:empty': { display: 'none' } }} />
                </Box>
              </SuggestionButton>
            </SuggestionPrimitive.Trigger>
          </Box>
        )}
      </ThreadPrimitive.Suggestions>
    </Stack>
  );
}

function ScrollToBottom() {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <AuiIconButton
        tooltip="Ir al final"
        size={4.5}
        sx={(t) => ({ position: 'absolute', top: t.spacing(-6), alignSelf: 'center', zIndex: 1, border: 1, borderColor: 'divider', bgcolor: 'background.paper', boxShadow: t.shadows[1], '&:hover': { bgcolor: 'background.paper' }, '&.Mui-disabled': { visibility: 'hidden' } })}
      >
        <ArrowDown />
      </AuiIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
}

/** El marco del composer: el mismo borde del Composer del kit, con el foco en primary. */
const ComposerShell = styled(Paper)(({ theme: t }) => ({
  display: 'flex', flexDirection: 'column', gap: t.spacing(1), width: '100%', boxSizing: 'border-box', padding: t.spacing(1),
  cursor: 'text', transition: t.transitions.create('border-color', { duration: t.transitions.duration.shortest }),
  '&:focus-within': { borderColor: t.palette.primary.main, boxShadow: `0 0 0 1px ${t.palette.primary.main}` },
  '&[data-dragging="true"]': { borderStyle: 'dashed', borderColor: t.palette.primary.main, backgroundColor: t.palette.action.hover },
}));

const ComposerInput = styled(ComposerPrimitive.Input)(({ theme: t }) => ({
  ...t.typography.body1,
  width: '100%', minHeight: t.spacing(5), maxHeight: t.spacing(24), boxSizing: 'border-box', resize: 'none', border: 0, outline: 'none',
  padding: t.spacing(0.5, 1.25), background: 'transparent', color: t.palette.text.primary, caretColor: t.palette.primary.main,
  '&::placeholder': { color: t.palette.text.secondary, opacity: 1 },
}));

const roundFilled = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': { bgcolor: 'primary.dark' },
  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
} as const;

function Composer({ autoFocus }: { autoFocus: boolean }) {
  const { placeholder, modelContextWindow, triggers, modelSelector } = React.useContext(LabelsContext);
  const isSending = useAuiState((s) => s.composer.submission !== undefined && !(s.thread.isRunning && s.thread.capabilities.cancel));
  return (
    <ComposerPrimitive.Unstable_TriggerPopoverRoot>
      <Box component={ComposerPrimitive.Root} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }} data-slot="aui-composer">
        {triggers}
        <ComposerPrimitive.AttachmentDropzone asChild>
          <ComposerShell variant="outlined">
            <AuiComposerAttachments />
            <AuiComposerQuotePreview />
            <ComposerInput placeholder={placeholder} rows={1} autoFocus={autoFocus} enterKeyHint="send" aria-label="Mensaje" />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <AuiComposerAddAttachment />
                {modelSelector ? <AuiModelSelector size="sm" variant="ghost" {...modelSelector} /> : null}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {modelContextWindow ? <AuiContextDisplayRing modelContextWindow={modelContextWindow} /> : null}
                <AuiIf condition={(s) => s.thread.capabilities.dictation}>
                  <AuiIf condition={(s) => s.composer.dictation == null}>
                    <ComposerPrimitive.Dictate asChild>
                      <AuiIconButton tooltip="Dictar" size={SEND}><Mic /></AuiIconButton>
                    </ComposerPrimitive.Dictate>
                  </AuiIf>
                  <AuiIf condition={(s) => s.composer.dictation != null}>
                    <ComposerPrimitive.StopDictation asChild>
                      <AuiIconButton tooltip="Detener el dictado" size={SEND} sx={{ color: 'error.main' }}>
                        <Box component="span" sx={{ display: 'flex', animation: `${pulse} 1.2s infinite`, [REDUCED_MOTION]: { animation: 'none' } }}><Square size={STOP_SIZE} fill="currentColor" /></Box>
                      </AuiIconButton>
                    </ComposerPrimitive.StopDictation>
                  </AuiIf>
                </AuiIf>
                <AuiIf condition={(s) => !s.composer.canCancel || (s.thread.voice !== undefined && s.composer.submission === undefined)}>
                  <ComposerPrimitive.Send asChild>
                    <AuiIconButton tooltip="Enviar mensaje" size={SEND} sx={{ ...roundFilled, '& svg': { width: ICON_SIZE, height: ICON_SIZE } }}><ArrowUp /></AuiIconButton>
                  </ComposerPrimitive.Send>
                </AuiIf>
                <AuiIf condition={(s) => s.composer.canCancel && (s.thread.voice === undefined || s.composer.submission !== undefined)}>
                  <ComposerPrimitive.Cancel asChild>
                    <AuiIconButton tooltip={isSending ? 'Cancelar el envío' : 'Detener la respuesta'} size={SEND} sx={{ ...roundFilled, '& svg': { width: STOP_SIZE, height: STOP_SIZE } }}><Square fill="currentColor" /></AuiIconButton>
                  </ComposerPrimitive.Cancel>
                </AuiIf>
              </Stack>
            </Stack>
          </ComposerShell>
        </ComposerPrimitive.AttachmentDropzone>
      </Box>
    </ComposerPrimitive.Unstable_TriggerPopoverRoot>
  );
}

function ThreadMessage() {
  const { AssistantMessage: Assistant = AssistantMessage } = React.useContext(ComponentsContext);
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);
  if (isEditing) return <EditComposer />;
  if (role === 'user') return <UserMessage />;
  return <Assistant />;
}

function MessageError() {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root>
        <Alert severity="error" sx={{ mt: 1 }}><ErrorPrimitive.Message /></Alert>
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
}

/** El texto de la respuesta, con formato. */
function TextPart() {
  return <Box sx={{ '& + &': { mt: 1.5 } }}><AuiMarkdownText /></Box>;
}

const DefaultToolFallback: ToolCallMessagePartComponent = (part) => <AuiToolFallback {...part} />;

/** El grupo de herramientas del hilo (ghost). Se abre solo cuando una llamada espera a la persona, como la llamada misma. */
function ToolGroupPart({ count, status, children }: { count: number; status: string; children: React.ReactNode }) {
  const waiting = status === 'requires-action';
  const [open, setOpen] = React.useState(waiting);
  const [prev, setPrev] = React.useState(waiting);
  if (waiting !== prev) {
    setPrev(waiting);
    if (waiting) setOpen(true);
  }
  return (
    <AuiToolGroupRoot variant="ghost" open={open} onOpenChange={setOpen}>
      <AuiToolGroupTrigger count={count} active={status === 'running'} />
      <AuiToolGroupContent>{children}</AuiToolGroupContent>
    </AuiToolGroupRoot>
  );
}

function AssistantMessage() {
  const { ToolFallback = DefaultToolFallback } = React.useContext(ComponentsContext);
  const { timing } = React.useContext(LabelsContext);
  return (
    <Box
      component={MessagePrimitive.Root}
      data-slot="aui-assistant-message"
      data-role="assistant"
      sx={(t) => ({ position: 'relative', mb: -ACTION_BAR, pb: ACTION_BAR, ...riseSx(t) })}
    >
      <Box sx={{ px: 1, color: 'text.primary', overflowWrap: 'anywhere' }}>
        <MessagePrimitive.GroupedParts groupBy={messageGroupBy}>
          {({ part, children }) => {
            switch (part.type) {
              case 'group-chainOfThought':
                return <div data-slot="aui-chain-of-thought">{children}</div>;
              case 'group-tool':
                return <ToolGroupPart count={part.indices.length} status={part.status.type}>{children}</ToolGroupPart>;
              case 'group-reasoning':
                return <AuiReasoningGroup streaming={part.status.type === 'running'}>{children}</AuiReasoningGroup>;
              case 'text':
                return <TextPart />;
              case 'reasoning':
                return <AuiMarkdownText />;
              case 'tool-call':
                return part.toolUI ?? <ToolFallback {...part} />;
              case 'data':
                return part.dataRendererUI;
              case 'image':
                return <Box sx={{ py: 0.5 }} data-slot="aui-assistant-image"><AuiImage {...part} /></Box>;
              case 'source':
                return <AuiSources {...part} />;
              case 'file':
                return <Box sx={{ py: 0.5 }} data-slot="aui-assistant-file"><AuiFile {...part} /></Box>;
              case 'indicator':
                return (
                  <Box component="span" role="status" aria-label="El asistente está trabajando" sx={{ color: 'primary.main', animation: `${pulse} 1.2s ease-in-out infinite`, [REDUCED_MOTION]: { animation: 'none' } }}>●</Box>
                );
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <MessageError />
        {timing?.design === 'footer' ? <AuiMessageTimingFooter sx={{ mt: 1.5 }} /> : null}
      </Box>
      <Stack direction="row" alignItems="center" sx={(t) => ({ ml: 1, minHeight: t.spacing(ACTION_BAR), pt: 0.75 })}>
        <BranchPicker />
        <AssistantActionBar />
      </Stack>
    </Box>
  );
}

const ActionBarRoot = styled(ActionBarPrimitive.Root)(({ theme: t }) => ({ display: 'flex', gap: t.spacing(0.5), marginLeft: t.spacing(-0.5), color: t.palette.text.secondary }));
const MoreContent = styled(ActionBarMorePrimitive.Content)(({ theme }) => auiMenuContent(theme));
const MoreItem = styled(ActionBarMorePrimitive.Item)(({ theme }) => auiMenuItem(theme));

function CopyIcon() {
  return (
    <>
      <AuiIf condition={(s) => s.message.isCopied}><Check /></AuiIf>
      <AuiIf condition={(s) => !s.message.isCopied}><Copy /></AuiIf>
    </>
  );
}

function AssistantActionBar() {
  const { timing } = React.useContext(LabelsContext);
  return (
    <ActionBarRoot hideWhenRunning autohide="not-last">
      <ActionBarPrimitive.Copy asChild>
        <AuiIconButton tooltip="Copiar"><CopyIcon /></AuiIconButton>
      </ActionBarPrimitive.Copy>
      <AuiIf condition={(s) => s.thread.capabilities.feedback}>
        <ActionBarPrimitive.FeedbackPositive asChild>
          <AuiIconButton tooltip="Útil" sx={{ '&[data-submitted="true"]': { bgcolor: 'action.selected', color: 'text.primary' } }}><ThumbsUp /></AuiIconButton>
        </ActionBarPrimitive.FeedbackPositive>
        <ActionBarPrimitive.FeedbackNegative asChild>
          <AuiIconButton tooltip="No útil" sx={{ '&[data-submitted="true"]': { bgcolor: 'action.selected', color: 'text.primary' } }}><ThumbsDown /></AuiIconButton>
        </ActionBarPrimitive.FeedbackNegative>
      </AuiIf>
      <ActionBarPrimitive.Reload asChild>
        <AuiIconButton tooltip="Regenerar"><RefreshCw /></AuiIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <AuiIconButton tooltip="Más" sx={{ '&[data-state="open"]': { bgcolor: 'action.selected' } }}><MoreHorizontal /></AuiIconButton>
        </ActionBarMorePrimitive.Trigger>
        <MoreContent side="bottom" align="start" sideOffset={6}>
          <ActionBarPrimitive.ExportMarkdown asChild>
            <MoreItem><Download size={ICON_SIZE} />Exportar como Markdown</MoreItem>
          </ActionBarPrimitive.ExportMarkdown>
        </MoreContent>
      </ActionBarMorePrimitive.Root>
      {timing?.design === 'badge' ? <AuiMessageTiming side={timing.side} /> : null}
    </ActionBarRoot>
  );
}

const UserImagePart: ImageMessagePartComponent = (part) => <Box sx={{ py: 0.5 }}><AuiImage {...part} /></Box>;

const UserFilePart: FileMessagePartComponent = (part) => <Box sx={{ py: 0.5 }}><AuiFile {...part} /></Box>;

/** Las partes del mensaje del usuario; con `directives`, las menciones como fichas. */
function UserParts() {
  const { directives } = React.useContext(LabelsContext);
  const Text = React.useMemo(() => (directives ? createAuiDirectiveText(undefined, directives === true ? {} : directives) : undefined), [directives]);
  return <MessagePrimitive.Parts components={{ Image: UserImagePart, File: UserFilePart, ...(Text ? { Text } : {}) }} />;
}

function UserMessage() {
  return (
    <Box
      component={MessagePrimitive.Root}
      data-slot="aui-user-message"
      data-role="user"
      sx={(t) => ({ display: 'grid', gridTemplateColumns: 'minmax(72px, 1fr) auto', alignContent: 'start', rowGap: 1, px: 1, '& > *': { gridColumnStart: 2 }, ...riseSx(t) })}
    >
      <AuiUserMessageAttachments />
      <Box sx={{ position: 'relative', gridColumnStart: 2, minWidth: 0, '&:hover [data-slot="aui-user-actions"], &:focus-within [data-slot="aui-user-actions"]': { opacity: 1 } }}>
        <Typography variant="body1" component="div" sx={{ px: 2, py: 1, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText', overflowWrap: 'anywhere', '&:empty': { display: 'none' } }}>
          <MessagePrimitive.Quote>{(quote) => <AuiQuoteBlock {...quote} />}</MessagePrimitive.Quote>
          <UserParts />
        </Typography>
        <Box sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translate(-100%, -50%)', pr: 1 }}>
          <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" data-slot="aui-user-actions">
            <ActionBarPrimitive.Edit asChild>
              <AuiIconButton tooltip="Editar"><Pencil /></AuiIconButton>
            </ActionBarPrimitive.Edit>
          </ActionBarPrimitive.Root>
        </Box>
      </Box>
      <BranchPicker sx={{ gridColumn: '1 / -1', justifyContent: 'flex-end', mr: -0.5 }} />
    </Box>
  );
}

const EditInput = styled(ComposerPrimitive.Input)(({ theme: t }) => ({
  ...t.typography.body1, width: '100%', minHeight: t.spacing(7), boxSizing: 'border-box', resize: 'none', border: 0, outline: 'none',
  padding: t.spacing(1.5, 2, 0.5), background: 'transparent', color: t.palette.text.primary,
}));

function EditComposer() {
  return (
    <Box component={MessagePrimitive.Root} data-slot="aui-edit-composer" sx={{ display: 'flex', flexDirection: 'column', px: 1 }}>
      <Box component={ComposerPrimitive.Root} sx={{ ml: 'auto', width: '100%', maxWidth: '85%' }}>
        <ComposerShell variant="outlined" sx={{ p: 0 }}>
          <EditInput autoFocus aria-label="Editar mensaje" />
          <Stack direction="row" spacing={0.75} sx={{ alignSelf: 'flex-end', mx: 1.25, mb: 1.25 }}>
            <ComposerPrimitive.Cancel asChild><Button color="inherit">Cancelar</Button></ComposerPrimitive.Cancel>
            <ComposerPrimitive.Send asChild><Button variant="contained">Actualizar</Button></ComposerPrimitive.Send>
          </Stack>
        </ComposerShell>
      </Box>
    </Box>
  );
}

const BranchRoot = styled(BranchPickerPrimitive.Root)(({ theme: t }) => ({
  ...t.typography.body3, display: 'inline-flex', alignItems: 'center', marginLeft: t.spacing(-1), marginRight: t.spacing(1), color: t.palette.text.secondary,
}));

function BranchPicker({ sx }: { sx?: React.ComponentProps<typeof Box>['sx'] }) {
  return (
    <Box component={BranchRoot} hideWhenSingleBranch sx={sx}>
      <BranchPickerPrimitive.Previous asChild><AuiIconButton tooltip="Anterior"><ChevronLeft /></AuiIconButton></BranchPickerPrimitive.Previous>
      <Box component="span" sx={(t) => ({ fontWeight: t.typography.fontWeightMedium, fontVariantNumeric: 'tabular-nums' })}>
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </Box>
      <BranchPickerPrimitive.Next asChild><AuiIconButton tooltip="Siguiente"><ChevronRight /></AuiIconButton></BranchPickerPrimitive.Next>
    </Box>
  );
}
