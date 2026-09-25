// Cosmos DS · Kit IA · AUI connected: Thread.
// Referente: assistant-ui «Thread» (elements/thread.aui.tsx), conectado al runtime de @assistant-ui/react.
// Un contenedor de chat completo: bienvenida con el composer centrado y sugerencias debajo; al enviar, el composer se
// acopla abajo y el hilo sigue la respuesta. El usuario edita en su lugar (Cancelar / Actualizar); cada respuesta
// tiene copiar, regenerar y «Más» (exportar como Markdown), ocultos mientras corre y siempre visibles en la última;
// con varias versiones aparece «n / m». Ir al final se desactiva cuando ya estás abajo. Enviar pasa a detener.
// Las respuestas llevan formato (Markdown) y su razonamiento en un visor plegable. Opcionales: el tiempo del mensaje en
// la barra de acciones (`messageTiming`), el uso del contexto en el composer (`modelContextWindow`) y el mapa de la
// conversación junto al hilo (`conversationMap`).
// Lo visual es el del kit: mientras no hay nada que mostrar, el «Loader» (o el «Typing indicator»); el texto llega como
// «Streaming text»; las acciones son «Message actions», las versiones el stepper de «Message branches», el mensaje del
// usuario se edita con «Edit message», el error es «Error state» y una respuesta detenida lleva «Stopped run».
import * as React from 'react';
import {
  ActionBarPrimitive,
  AuiIf,
  type AssistantState,
  ComposerPrimitive,
  groupPartByType,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  type FileMessagePartComponent,
  type ImageMessagePartComponent,
  type ToolCallMessagePartComponent,
  useAui,
  useAuiState,
} from '@assistant-ui/react';
import {
  useActionBarCopy, useActionBarEdit, useActionBarFeedbackNegative, useActionBarFeedbackPositive, useActionBarReload,
  useBranchPickerNext, useBranchPickerPrevious, useEditComposerCancel, useEditComposerSend, useMessageError,
} from '@assistant-ui/core/react';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import { keyframes, styled } from '@mui/material/styles';
import { ArrowDown, ArrowUp, Download, Mic, Square } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { riseSx } from '../lib/thread';
import { EditMessage } from '../edit-message';
import { ErrorState } from '../error-state';
import { Loader } from '../loader';
import { MessageActions } from '../message-actions';
import { MessageBranchesStepper } from '../message-branches';
import { STOPPED_RUN_REASONS, StoppedRunActions } from '../stopped-run';
import { TypingIndicator } from '../typing-indicator';
import { AuiIconButton } from './AuiIconButton';
import { AuiComposerAddAttachment, AuiComposerAttachments, AuiUserMessageAttachments } from './Attachment';
import { AuiFollowupSuggestions } from './FollowupSuggestions';
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
import { AuiSelectionContextChip, AuiSelectionContextMessageChip } from './SelectionContext';

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
  /** Lo que muestra el chat vacío sobre el composer (p. ej. `AuiStarterSuggestions`), en lugar de la bienvenida y sus
   * sugerencias. El composer queda abajo. */
  empty?: React.ReactNode;
  /** Una línea al comienzo del hilo cuando ya hay mensajes (p. ej. que las respuestas se generan con IA). */
  disclaimer?: string;
  /** Lo que se ve mientras la respuesta aún no trae nada: el «Loader» de Sinco (default) o el «Typing indicator». */
  waiting?: AuiThreadWaiting;
}

export type AuiThreadWaiting = 'loader' | 'typing';

type PlaceholderPreview = { preview: string | null; setPreview: (text: string | null) => void };
const PlaceholderPreviewContext = React.createContext<PlaceholderPreview>({ preview: null, setPreview: () => undefined });
/** Anticipa un texto en el placeholder del composer (las sugerencias de inicio al pasar por encima). */
export function useAuiComposerPlaceholderPreview() {
  return React.useContext(PlaceholderPreviewContext);
}

/** Medidas de assistant-ui: columna de 44rem, composer con 8px de relleno, botones de 28px, íconos de 16px. */
const THREAD_MAX_WIDTH = 704;
const SEND = 3.5;
const ICON_SIZE = 16;
const STOP_SIZE = 14;
/** Espacio que reserva la barra de acciones bajo cada respuesta (min-h-7.5). */
const ACTION_BAR = 3.75;
/** Tiempo que «Copiar» muestra la marca (useCopyToClipboard de assistant-ui). */
const COPIED_MS = 3000;
/** Con el mapa de la conversación, el hilo deja libre su riel (24px más 12px a cada lado). */
const MAP_GUTTER = 6;

const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: .35; }`;

const ComponentsContext = React.createContext<AuiThreadComponents>({});
type ThreadOptions = { welcome: string; placeholder: string; timing?: AuiThreadTiming; modelContextWindow?: number; triggers?: React.ReactNode; directives?: boolean | AuiDirectiveTextOptions; modelSelector?: AuiModelSelectorProps; waiting?: AuiThreadWaiting };
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
  empty, disclaimer, waiting = 'loader',
}: AuiThreadProps) {
  const isNew = useAuiState(isNewChatView);
  const hasEmpty = empty !== undefined;
  // Con `empty`, el chat vacío no centra el composer: lo deja abajo con lo que se muestre encima.
  const isEmpty = isNew && !hasEmpty;
  const [preview, setPreview] = React.useState<string | null>(null);
  const previewValue = React.useMemo(() => ({ preview, setPreview }), [preview]);
  const timingDesign = messageTiming === true ? 'badge' : messageTiming ? messageTiming.design ?? 'badge' : undefined;
  const timingSide = typeof messageTiming === 'object' ? messageTiming.side : undefined;
  const labels = React.useMemo(
    () => ({ welcome, placeholder, timing: timingDesign ? { design: timingDesign, side: timingSide } : undefined, modelContextWindow, triggers, directives, modelSelector, waiting }),
    [welcome, placeholder, timingDesign, timingSide, modelContextWindow, triggers, directives, modelSelector, waiting],
  );
  const mapSide = conversationMap === true ? 'left' : conversationMap || undefined;
  const Welcome = components.Welcome ?? ThreadWelcome;
  return (
    <ComponentsContext.Provider value={components}>
      <LabelsContext.Provider value={labels}>
        <PlaceholderPreviewContext.Provider value={previewValue}>
          <Root data-slot="aui-thread">
            <Viewport turnAnchor="top" data-slot="aui-thread-viewport">
              {mapSide ? <AuiConversationMapRail side={mapSide} /> : null}
              <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: THREAD_MAX_WIDTH, boxSizing: 'border-box', px: 2, pt: 2, ...(mapSide ? { [mapSide === 'left' ? 'pl' : 'pr']: MAP_GUTTER } : null), justifyContent: isEmpty ? 'center' : undefined }}>
                {disclaimer ? (
                  <AuiIf condition={(s) => s.thread.messages.length > 0}>
                    <Typography variant="caption" component="p" color="text.secondary" align="center" sx={{ m: 0, mb: 2 }}>{disclaimer}</Typography>
                  </AuiIf>
                ) : null}
                {hasEmpty ? null : <AuiIf condition={isNewChatView}><Welcome /></AuiIf>}
                <AuiIf condition={isHistoryLoadingView}><HistorySkeleton /></AuiIf>
                <Stack spacing={3} data-slot="aui-message-group" sx={{ mb: 7, '&:empty': { display: 'none' } }}>
                  <ThreadPrimitive.Messages>{() => <ThreadMessage />}</ThreadPrimitive.Messages>
                </Stack>
                <ViewportFooter data-docked={!isEmpty}>
                  <ScrollToBottom />
                  <AuiFollowupSuggestions send={followupSend} />
                  {hasEmpty ? <AuiIf condition={isNewChatView}>{empty}</AuiIf> : null}
                  <Composer autoFocus={autoFocus} />
                  {hasEmpty ? null : <AuiIf condition={(s) => isNewChatView(s) && s.composer.isEmpty}><WelcomeSuggestions /></AuiIf>}
                </ViewportFooter>
              </Box>
              {quotes ? <AuiSelectionToolbar actions={quotes === 'actions' ? AUI_QUOTE_ACTIONS : undefined} /> : null}
            </Viewport>
          </Root>
        </PlaceholderPreviewContext.Provider>
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
  // El anticipo se ve en una línea (`maxRows`): si el composer creciera con él, lo de encima se movería bajo el puntero.
  '&[data-preview="true"]': { whiteSpace: 'nowrap', overflow: 'hidden' },
  '&[data-preview="true"]::placeholder': { color: t.palette.text.disabled, textOverflow: 'ellipsis' },
}));

const roundFilled = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': { bgcolor: 'primary.dark' },
  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
} as const;

function Composer({ autoFocus }: { autoFocus: boolean }) {
  const { placeholder, modelContextWindow, triggers, modelSelector } = React.useContext(LabelsContext);
  const { preview } = React.useContext(PlaceholderPreviewContext);
  const isSending = useAuiState((s) => s.composer.submission !== undefined && !(s.thread.isRunning && s.thread.capabilities.cancel));
  return (
    <ComposerPrimitive.Unstable_TriggerPopoverRoot>
      <Box component={ComposerPrimitive.Root} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }} data-slot="aui-composer">
        {triggers}
        <ComposerPrimitive.AttachmentDropzone asChild>
          <ComposerShell variant="outlined">
            <AuiSelectionContextChip />
            <AuiComposerAttachments />
            <AuiComposerQuotePreview />
            <ComposerInput placeholder={preview ?? placeholder} data-preview={preview !== null} maxRows={preview !== null ? 1 : undefined} rows={1} autoFocus={autoFocus} enterKeyHint="send" aria-label="Mensaje" />
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

/** El error de la respuesta, con «Reintentar» (vuelve a generarla). */
function MessageError() {
  const error = useMessageError();
  const { reload } = useActionBarReload();
  if (error === undefined) return null;
  return <Box sx={{ mt: 1 }}><ErrorState detail={String(error)} retrying={false} onRetry={reload} /></Box>;
}

/** Una respuesta detenida (por ti o por longitud): el motivo y «Continuar» (vuelve a generarla). */
function MessageStopped() {
  const reason = useAuiState((s) => (s.message.status?.type === 'incomplete' ? s.message.status.reason : undefined));
  const { reload, disabled } = useActionBarReload();
  const label = reason === 'cancelled' ? STOPPED_RUN_REASONS.user : reason === 'length' ? STOPPED_RUN_REASONS.length : undefined;
  if (!label) return null;
  return <Box sx={{ mt: 1.5 }}><StoppedRunActions reason={label} onContinue={disabled ? undefined : reload} /></Box>;
}

/** Mientras la respuesta aún no trae nada. */
function WaitingIndicator() {
  const { waiting } = React.useContext(LabelsContext);
  return waiting === 'typing' ? <TypingIndicator /> : <Box sx={{ display: 'flex' }}><Loader /></Box>;
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
                return <WaitingIndicator />;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <MessageError />
        <MessageStopped />
        {timing?.design === 'footer' ? <AuiMessageTimingFooter sx={{ mt: 1.5 }} /> : null}
      </Box>
      <Stack direction="row" alignItems="center" sx={(t) => ({ ml: 1, minHeight: t.spacing(ACTION_BAR), pt: 0.75 })}>
        <BranchPicker />
        <AssistantActionBar />
      </Stack>
    </Box>
  );
}

const ActionBarRoot = styled(ActionBarPrimitive.Root)(({ theme: t }) => ({ display: 'flex', alignItems: 'center', gap: t.spacing(0.5) }));

const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

/** Las acciones de la respuesta: «Message actions» del kit, con «Más» → Exportar como Markdown. */
function AssistantActionBar() {
  const { timing } = React.useContext(LabelsContext);
  const copy = useActionBarCopy({ copiedDuration: COPIED_MS, copyToClipboard });
  const { reload } = useActionBarReload();
  const positive = useActionBarFeedbackPositive();
  const negative = useActionBarFeedbackNegative();
  const feedback = useAuiState((s) => s.thread.capabilities.feedback);
  const [more, setMore] = React.useState<HTMLElement | null>(null);
  const close = () => setMore(null);
  return (
    <ActionBarRoot hideWhenRunning autohide="not-last">
      <MessageActions
        copied={copy.isCopied}
        reaction={positive.isSubmitted ? 'up' : negative.isSubmitted ? 'down' : null}
        regenerating={false}
        reactions={feedback}
        onCopy={copy.copy}
        onReactionChange={(r) => { if (r === 'up') positive.submit(); else if (r === 'down') negative.submit(); }}
        onRegenerate={reload}
        onMore={setMore}
        moreOpen={more !== null}
      />
      <Menu anchorEl={more} open={more !== null} onClose={close}>
        <ActionBarPrimitive.ExportMarkdown asChild>
          <MenuItem onClick={close}><ListItemIcon><Download size={ICON_SIZE} /></ListItemIcon>Exportar como Markdown</MenuItem>
        </ActionBarPrimitive.ExportMarkdown>
      </Menu>
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

/** El texto del mensaje, para la etiqueta de la burbuja y la edición. */
const messageText = (s: AssistantState) => s.message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('\n');

function UserMessage() {
  const { edit, disabled } = useActionBarEdit();
  const text = useAuiState(messageText);
  return (
    <Box
      component={MessagePrimitive.Root}
      data-slot="aui-user-message"
      data-role="user"
      sx={(t) => ({ display: 'grid', gridTemplateColumns: 'minmax(72px, 1fr) auto', alignContent: 'start', rowGap: 1, px: 1, '& > *': { gridColumnStart: 2 }, ...riseSx(t) })}
    >
      <AuiUserMessageAttachments />
      <Box sx={{ justifySelf: 'end', '&:empty': { display: 'none' } }}><AuiSelectionContextMessageChip /></Box>
      <Box sx={{ gridColumnStart: 2, minWidth: 0, overflowWrap: 'anywhere', '& [data-slot="edit-message"] > *': { maxWidth: 'none' } }}>
        <EditMessage value={text} editing={false} discardedReplies={0} onStartEdit={disabled ? undefined : edit}>
          <MessagePrimitive.Quote>{(quote) => <AuiQuoteBlock {...quote} />}</MessagePrimitive.Quote>
          <UserParts />
        </EditMessage>
      </Box>
      <BranchPicker user sx={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }} />
    </Box>
  );
}

/** La edición en su lugar: «Edit message» del kit, con cuántas respuestas descarta. */
function EditComposer() {
  const aui = useAui();
  const value = useAuiState((s) => s.composer.text);
  const discarded = useAuiState((s) => s.thread.messages.slice(s.message.index + 1).filter((m) => m.role === 'assistant').length);
  const { send } = useEditComposerSend();
  const { cancel } = useEditComposerCancel();
  return (
    <Box component={MessagePrimitive.Root} data-slot="aui-edit-composer" sx={{ px: 1 }}>
      <EditMessage value={value} editing discardedReplies={discarded} onValueChange={(v) => aui.composer().setText(v)} onSave={send} onCancel={cancel} />
    </Box>
  );
}

/** Las versiones del mensaje: el stepper de «Message branches» del kit. */
function BranchPicker({ user = false, sx }: { user?: boolean; sx?: React.ComponentProps<typeof Box>['sx'] }) {
  const number = useAuiState((s) => s.message.branchNumber);
  const count = useAuiState((s) => s.message.branchCount);
  const previous = useBranchPickerPrevious();
  const next = useBranchPickerNext();
  if (count <= 1) return null;
  return (
    <Box sx={[{ display: 'flex', mr: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <MessageBranchesStepper
        index={number - 1}
        count={count}
        onPrevious={previous.previous}
        onNext={next.next}
        previousDisabled={previous.disabled}
        nextDisabled={next.disabled}
        previousLabel={user ? 'Ver el mensaje anterior' : undefined}
        nextLabel={user ? 'Ver el mensaje siguiente' : undefined}
      />
    </Box>
  );
}
