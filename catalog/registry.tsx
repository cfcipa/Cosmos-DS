import * as React from 'react';
import { LoaderDoc, LoaderCard } from './elements/Loader';
import { ThinkingIndicatorDoc, ThinkingIndicatorCard } from './elements/ThinkingIndicator';
import { StreamingTextDoc, StreamingTextCard } from './elements/StreamingText';
import { TypingIndicatorDoc, TypingIndicatorCard } from './elements/TypingIndicator';
import { ReasoningEffortDoc, ReasoningEffortCard } from './elements/ReasoningEffort';
import { GuardrailNoticeDoc, GuardrailNoticeCard } from './elements/GuardrailNotice';
import { MessagePairDoc, MessagePairCard } from './elements/MessagePair';
import { MessageBranchesDoc, MessageBranchesCard } from './elements/MessageBranches';
import { MessageActionsDoc, MessageActionsCard } from './elements/MessageActions';
import { ErrorStateDoc, ErrorStateCard } from './elements/ErrorState';
import { MessageQueueDoc, MessageQueueCard } from './elements/MessageQueue';
import { EditMessageDoc, EditMessageCard } from './elements/EditMessage';
import { FeedbackDialogDoc, FeedbackDialogCard } from './elements/FeedbackDialog';
import { StoppedRunDoc, StoppedRunCard } from './elements/StoppedRun';
import { TimestampsDoc, TimestampsCard } from './elements/Timestamps';
import { SpeakerIdentityDoc, SpeakerIdentityCard } from './elements/SpeakerIdentity';
import { RegenerateMenuDoc, RegenerateMenuCard } from './elements/RegenerateMenu';
import { ConfidenceDoc, ConfidenceCard } from './elements/Confidence';
import { WebSearchDoc, WebSearchCard } from './elements/WebSearch';
import { InlineCitationDoc, InlineCitationCard } from './elements/InlineCitation';
import { ImageGenerationDoc, ImageGenerationCard } from './elements/ImageGeneration';
import { RetrievalChunksDoc, RetrievalChunksCard } from './elements/RetrievalChunks';
import { DocumentReferenceDoc, DocumentReferenceCard } from './elements/DocumentReference';
import { MemoryChipsDoc, MemoryChipsCard } from './elements/MemoryChips';
import { ResearchReportDoc, ResearchReportCard } from './elements/ResearchReport';
import { MapAnswerDoc, MapAnswerCard } from './elements/MapAnswer';
import { ComposerDoc, ComposerCard } from './elements/Composer';
import { SlashCommandsDoc, SlashCommandsCard } from './elements/SlashCommands';
import { MentionsDoc, MentionsCard } from './elements/Mentions';
import { AttachmentsDoc, AttachmentsCard } from './elements/Attachments';
import { ModelPickerDoc, ModelPickerCard } from './elements/ModelPicker';
import { DictationDoc, DictationCard } from './elements/Dictation';
import { ComposerContextDoc, ComposerContextCard } from './elements/ComposerContext';
import { DraftRestoreDoc, DraftRestoreCard } from './elements/DraftRestore';
import { ContextBreakdownDoc, ContextBreakdownCard } from './elements/ContextBreakdown';
import { PromptLibraryDoc, PromptLibraryCard } from './elements/PromptLibrary';
import { CommandPaletteDoc, CommandPaletteCard } from './elements/CommandPalette';
import { VoiceConversationDoc, VoiceConversationCard } from './elements/VoiceConversation';
import { ReadAloudDoc, ReadAloudCard } from './elements/ReadAloud';
import { ChatPanelDoc, ChatPanelCard } from './elements/ChatPanel';
import { EmptyStateDoc, EmptyStateCard } from './elements/EmptyState';
import { ScrollAnchorDoc, ScrollAnchorCard } from './elements/ScrollAnchor';
import { CanvasSplitDoc, CanvasSplitCard } from './elements/CanvasSplit';
import { ConnectionStateDoc, ConnectionStateCard } from './elements/ConnectionState';
import { SharedConversationDoc, SharedConversationCard } from './elements/SharedConversation';
import { ConversationSearchDoc, ConversationSearchCard } from './elements/ConversationSearch';
import { ThreadSearchDoc, ThreadSearchCard } from './elements/ThreadSearch';
import { LauncherDoc, LauncherCard } from './elements/Launcher';
import { SettingsPanelDoc, SettingsPanelCard } from './elements/SettingsPanel';
import { OnboardingDoc, OnboardingCard } from './elements/Onboarding';
import { MobileComposerDoc, MobileComposerCard } from './elements/MobileComposer';
import { ToolApprovalDoc, ToolApprovalCard } from './elements/ToolApproval';
import { AuiThreadDoc, AuiThreadCard } from './elements/AuiThread';
import { AuiAssistantModalDoc, AuiAssistantModalCard } from './elements/AuiAssistantModal';
import { AuiAssistantSidebarDoc, AuiAssistantSidebarCard } from './elements/AuiAssistantSidebar';
import { AuiThreadListDoc, AuiThreadListCard } from './elements/AuiThreadList';
import { AuiThreadListSidebarDoc, AuiThreadListSidebarCard } from './elements/AuiThreadListSidebar';
import { AuiReasoningDoc, AuiReasoningCard } from './elements/AuiReasoning';
import { AuiMessageTimingDoc, AuiMessageTimingCard } from './elements/AuiMessageTiming';
import { AuiConversationMapDoc, AuiConversationMapCard } from './elements/AuiConversationMap';
import { AuiContextDisplayDoc, AuiContextDisplayCard } from './elements/AuiContextDisplay';
import { AuiMcpConfigDoc, AuiMcpConfigCard } from './elements/AuiMcpConfig';
import { AuiAttachmentDoc, AuiAttachmentCard } from './elements/AuiAttachment';
import { AuiFollowupsDoc, AuiFollowupsCard } from './elements/AuiFollowups';
import { AuiToolFallbackDoc, AuiToolFallbackCard } from './elements/AuiToolFallback';
import { AuiToolGroupDoc, AuiToolGroupPreview } from './elements/AuiToolGroup';
import { AuiQuoteDoc, AuiQuoteCard } from './elements/AuiQuote';
import { AuiSourcesDoc, AuiSourcesCard } from './elements/AuiSources';
import { AuiImageDoc, AuiImageCard } from './elements/AuiImage';
import { AuiFileCard, AuiFileDoc } from './elements/AuiFile';
import { AuiModelSelectorCard, AuiModelSelectorDoc } from './elements/AuiModelSelector';
import { AuiTriggerPopoverCard, AuiTriggerPopoverDoc } from './elements/AuiTriggerPopover';
import { AuiDirectiveTextCard, AuiDirectiveTextDoc } from './elements/AuiDirectiveText';
import { AuiAssistantPanelCard, AuiAssistantPanelDoc } from './elements/AuiAssistantPanel';
import { AuiComposerPillCard, AuiComposerPillDoc } from './elements/AuiComposerPill';
import { AuiStarterSuggestionsCard, AuiStarterSuggestionsDoc } from './elements/AuiStarterSuggestions';
import { AuiSelectionContextCard, AuiSelectionContextDoc } from './elements/AuiSelectionContext';
import { AuiAskAiActionCard, AuiAskAiActionDoc } from './elements/AuiAskAiAction';
import { AuiInlinePromptCard, AuiInlinePromptDoc } from './elements/AuiInlinePrompt';
import { TplComposerCard, TplComposerDoc } from './elements/TplComposer';
import { TplChatPanelCard, TplChatPanelDoc } from './elements/TplChatPanel';
import { AuiResponsePreviewCard, AuiResponsePreviewDoc } from './elements/AuiResponsePreview';
import { AuiOrbDoc, AuiOrbCard } from './elements/AuiOrb';

export interface ElementEntry {
  slug: string;
  title: string;
  description: string;
  /** Vista previa en la tarjeta de Elements. */
  Card: React.ComponentType;
  /** Página del elemento: probar, usar en tu producto, cómo está hecho, guía y props. */
  Doc: React.ComponentType;
}
export interface Section { id: string; title: string; elements: ElementEntry[] }

/** Secciones en el orden del catálogo Elements de assistant-ui.  */
export const SECTIONS: Section[] = [
  {
    id: 'reasoning', title: 'Reasoning', elements: [
      { slug: 'loader', title: 'Loader', description: 'El símbolo de Sinco marca el tiempo mientras el modelo todavía no tiene nada que mostrar.', Card: LoaderCard, Doc: LoaderDoc },
      { slug: 'thinking-indicator', title: 'Thinking indicator', description: 'Una línea viva que nombra lo que el asistente hace ahora mismo, con el tiempo transcurrido.', Card: ThinkingIndicatorCard, Doc: ThinkingIndicatorDoc },
      { slug: 'streaming-text', title: 'Streaming text', description: 'Las palabras llegan suave: las más nuevas entran en azul y se asientan en tinta.', Card: StreamingTextCard, Doc: StreamingTextDoc },
      { slug: 'typing-indicator', title: 'Typing indicator', description: 'Tres puntos que se leen como presencia, no como ruido, justo donde aparecerá la respuesta.', Card: TypingIndicatorCard, Doc: TypingIndicatorDoc },
      { slug: 'reasoning-effort', title: 'Reasoning effort', description: 'Cuánto pensar, y cuánto de ese presupuesto gastó de verdad la ejecución.', Card: ReasoningEffortCard, Doc: ReasoningEffortDoc },
      { slug: 'guardrail-notice', title: 'Guardrail notice', description: 'Una negativa con forma propia, que ofrece lo más cercano que sí puede hacer.', Card: GuardrailNoticeCard, Doc: GuardrailNoticeDoc },
    ],
  },
  {
    id: 'messages', title: 'Messages', elements: [
      { slug: 'message-pair', title: 'Message pair', description: 'Una burbuja del usuario y una respuesta que llega en vivo, con acciones que aparecen al pasar el cursor.', Card: MessagePairCard, Doc: MessagePairDoc },
      { slug: 'message-branches', title: 'Message branches', description: 'Recorre las versiones regeneradas de una misma respuesta sin perder tu lugar.', Card: MessageBranchesCard, Doc: MessageBranchesDoc },
      { slug: 'message-actions', title: 'Message actions', description: 'Copiar, calificar y regenerar. Cada acción se confirma con un cambio de estado pequeño.', Card: MessageActionsCard, Doc: MessageActionsDoc },
      { slug: 'error-state', title: 'Error state', description: 'Un aviso discreto con camino para reintentar, no un modal en tu cara.', Card: ErrorStateCard, Doc: ErrorStateDoc },
      { slug: 'message-queue', title: 'Message queue', description: 'Lo que escribes mientras una ejecución corre queda en fila, y puedes cancelarlo hasta que termine.', Card: MessageQueueCard, Doc: MessageQueueDoc },
      { slug: 'edit-message', title: 'Edit a sent message', description: 'Reescribe un turno en su lugar, sabiendo de antemano cuántas respuestas descarta la edición.', Card: EditMessageCard, Doc: EditMessageDoc },
      { slug: 'feedback-dialog', title: 'Feedback dialog', description: 'Un pulgar abajo que pregunta por qué, para que la señal llegue con su razón.', Card: FeedbackDialogCard, Doc: FeedbackDialogDoc },
      { slug: 'stopped-run', title: 'Stopped run', description: 'Pulsaste detener. La respuesta a medias se queda, y seguir está a un toque.', Card: StoppedRunCard, Doc: StoppedRunDoc },
      { slug: 'timestamps', title: 'Timestamps', description: 'Cronología en un hilo largo: los días marcados y la hora al pasar el cursor.', Card: TimestampsCard, Doc: TimestampsDoc },
      { slug: 'speaker-identity', title: 'Speaker identity', description: 'Quién habla, cuando un hilo tiene más voces que la persona y un modelo.', Card: SpeakerIdentityCard, Doc: SpeakerIdentityDoc },
      { slug: 'regenerate-with', title: 'Regenerate with', description: 'Bifurca el mismo turno hacia otro modelo en lugar de volver a tirar los mismos dados.', Card: RegenerateMenuCard, Doc: RegenerateMenuDoc },
      { slug: 'confidence', title: 'Confidence', description: 'Qué afirmaciones vienen de una fuente, cuáles se infirieron y cuáles son suposiciones.', Card: ConfidenceCard, Doc: ConfidenceDoc },
    ],
  },
  {
    id: 'knowledge', title: 'Knowledge', elements: [
      { slug: 'web-search', title: 'Web search', description: 'Una búsqueda y sus resultados llegando uno a uno mientras el asistente lee.', Card: WebSearchCard, Doc: WebSearchDoc },
      { slug: 'inline-citation', title: 'Inline citation', description: 'Referencias numeradas dentro de la frase, cada una con una vista previa de su fuente.', Card: InlineCitationCard, Doc: InlineCitationDoc },
      { slug: 'image-generation', title: 'Image generation', description: 'Una rejilla de puntos sostiene el marco mientras la imagen se aclara desde el desenfoque.', Card: ImageGenerationCard, Doc: ImageGenerationDoc },
      { slug: 'retrieval-chunks', title: 'Retrieval chunks', description: 'Los pasajes en los que se apoya una respuesta, con su puntaje, antes de que llegue la respuesta.', Card: RetrievalChunksCard, Doc: RetrievalChunksDoc },
      { slug: 'document-reference', title: 'Document reference', description: 'Un documento en el que se apoya la respuesta, con el pasaje citado y la página a la que saltar.', Card: DocumentReferenceCard, Doc: DocumentReferenceDoc },
      { slug: 'memory', title: 'Memory', description: 'Lo que ahora recuerda de ti, escrito durante el turno y que puedes quitar.', Card: MemoryChipsCard, Doc: MemoryChipsDoc },
      { slug: 'research-report', title: 'Research report', description: 'Un esquema que se llena sección por sección, cada una con las fuentes que la respaldan.', Card: ResearchReportCard, Doc: ResearchReportDoc },
      { slug: 'map', title: 'Map', description: 'Una respuesta de ubicación: pines, una ruta entre ellos y la lista de donde salen.', Card: MapAnswerCard, Doc: MapAnswerDoc },
    ],
  },
  {
    id: 'composer', title: 'Composer', elements: [
      { slug: 'composer', title: 'Composer', description: 'La entrada unificada: adjuntos, comandos, menciones, modelos, voz y contexto en una sola superficie.', Card: ComposerCard, Doc: ComposerDoc },
      { slug: 'slash-commands', title: 'Slash commands', description: 'Escribe una barra y el menú de comandos flota sobre la entrada, filtrando mientras sigues escribiendo.', Card: SlashCommandsCard, Doc: SlashCommandsDoc },
      { slug: 'mentions', title: 'Mentions', description: 'Escribe @ para traer personas y agentes a la conversación, filtrando mientras escribes.', Card: MentionsCard, Doc: MentionsDoc },
      { slug: 'attachments', title: 'Attachments', description: 'Los archivos esperan dentro del composer, con el progreso de cada uno, antes de enviar el mensaje.', Card: AttachmentsCard, Doc: AttachmentsDoc },
      { slug: 'models', title: 'Models', description: 'El modelo vive en el riel del composer, a un toque, con su contexto a la vista.', Card: ModelPickerCard, Doc: ModelPickerDoc },
      { slug: 'dictation', title: 'Dictation', description: 'El micrófono convierte la entrada en una onda en vivo y luego deja la transcripción como texto.', Card: DictationCard, Doc: DictationDoc },
      { slug: 'context', title: 'Context', description: 'Un anillo en el riel se llena a medida que crece la conversación y avisa cerca del límite.', Card: ComposerContextCard, Doc: ComposerContextDoc },
      { slug: 'draft-restore', title: 'Draft restore', description: 'Vuelves a un hilo y la frase que nunca enviaste sigue esperando.', Card: DraftRestoreCard, Doc: DraftRestoreDoc },
      { slug: 'context-breakdown', title: 'Context breakdown', description: 'A dónde se fue la ventana: prompt, herramientas, archivos, conversación y lo que queda.', Card: ContextBreakdownCard, Doc: ContextBreakdownDoc },
      { slug: 'prompt-library', title: 'Prompt library', description: 'Los prompts que guardaste, con búsqueda, y sus variables a la vista antes de insertar uno.', Card: PromptLibraryCard, Doc: PromptLibraryDoc },
      { slug: 'command-palette', title: 'Command palette', description: 'Todo lo que la aplicación puede hacer, a una tecla, agrupado por dónde actúa.', Card: CommandPaletteCard, Doc: CommandPaletteDoc },
    ],
  },
  {
    id: 'voice', title: 'Voice', elements: [
      { slug: 'voice-conversation', title: 'Voice conversation', description: 'Una llamada en vivo: el orbe sigue tu voz, el rótulo nombra el turno y la transcripción lo acompaña.', Card: VoiceConversationCard, Doc: VoiceConversationDoc },
      { slug: 'read-aloud', title: 'Read aloud', description: 'Una respuesta leída en voz alta, con la palabra que suena iluminada y la velocidad a tu alcance.', Card: ReadAloudCard, Doc: ReadAloudDoc },
    ],
  },
  {
    id: 'thread', title: 'Thread', elements: [
      { slug: 'chat-panel', title: 'Chat panel', description: 'Toda la familia trabajando junta: un mensaje, una pausa y una respuesta que llega en vivo.', Card: ChatPanelCard, Doc: ChatPanelDoc },
      { slug: 'empty-state', title: 'Empty state', description: 'Un saludo, tres maneras de empezar y el composer al frente.', Card: EmptyStateCard, Doc: EmptyStateDoc },
      { slug: 'scroll-anchor', title: 'Scroll anchor', description: 'El streaming nunca te roba la posición; un botón ofrece el camino de vuelta.', Card: ScrollAnchorCard, Doc: ScrollAnchorDoc },
      { slug: 'canvas', title: 'Canvas', description: 'El hilo se hace a un lado y el documento ocupa el espacio, todavía escribiéndose mientras lo lees.', Card: CanvasSplitCard, Doc: CanvasSplitDoc },
      { slug: 'connection-state', title: 'Connection state', description: 'Se cae la conexión, la ejecución sigue en el servidor y el stream se retoma.', Card: ConnectionStateCard, Doc: ConnectionStateDoc },
      { slug: 'shared-conversation', title: 'Shared conversation', description: 'Una transcripción de solo lectura que alguien te envió, con una forma de seguirla tú.', Card: SharedConversationCard, Doc: SharedConversationDoc },
      { slug: 'conversation-search', title: 'Conversation search', description: 'Busca dentro de un hilo largo, con cada coincidencia marcada a lo largo de la barra.', Card: ConversationSearchCard, Doc: ConversationSearchDoc },
      { slug: 'thread-search', title: 'Thread search', description: 'Un historial al que de verdad puedes volver: fijados primero y luego agrupados por fecha.', Card: ThreadSearchCard, Doc: ThreadSearchDoc },
      { slug: 'launcher', title: 'Launcher', description: 'La entrada flotante y el panel en el que se abre.', Card: LauncherCard, Doc: LauncherDoc },
      { slug: 'settings-panel', title: 'Settings panel', description: 'Modelo, instrucciones del sistema, temperatura y lo que el asistente tiene permitido hacer.', Card: SettingsPanelCard, Doc: SettingsPanelDoc },
      { slug: 'onboarding', title: 'Onboarding', description: 'Primera vez: tres pasos que enseñan para qué sirve de verdad este asistente.', Card: OnboardingCard, Doc: OnboardingDoc },
      { slug: 'mobile-composer', title: 'Mobile composer', description: 'Una hoja inferior: atenta al teclado, acciones rápidas encima y objetivos del tamaño del pulgar.', Card: MobileComposerCard, Doc: MobileComposerDoc },
    ],
  },
  {
    id: 'aui-connected', title: 'AUI connected', elements: [
      { slug: 'aui-thread', title: 'Thread', description: 'Un contenedor de chat completo con mensajes, composer, desplazamiento automático y accesibilidad incluida.', Card: AuiThreadCard, Doc: AuiThreadDoc },
      { slug: 'aui-assistant-modal', title: 'Assistant modal', description: 'Una burbuja de chat flotante para widgets de soporte, mesas de ayuda y asistentes incrustados.', Card: AuiAssistantModalCard, Doc: AuiAssistantModalDoc },
      { slug: 'aui-assistant-sidebar', title: 'Assistant sidebar', description: 'Un panel lateral redimensionable para experiencias de copiloto y ayuda en contexto.', Card: AuiAssistantSidebarCard, Doc: AuiAssistantSidebarDoc },
      { slug: 'aui-thread-list', title: 'Thread list', description: 'Cambio de conversación respaldado por el runtime, con búsqueda, selección activa y acciones por hilo.', Card: AuiThreadListCard, Doc: AuiThreadListDoc },
      { slug: 'aui-thread-list-sidebar', title: 'Thread list sidebar', description: 'Una estructura de barra lateral completa que pone la lista de hilos junto a la conversación activa.', Card: AuiThreadListSidebarCard, Doc: AuiThreadListSidebarDoc },
      { slug: 'aui-orb', title: 'Orb', description: 'El orbe de voz en tiempo real, con controles de conexión, silencio y estado de habla.', Card: AuiOrbCard, Doc: AuiOrbDoc },
      { slug: 'aui-reasoning', title: 'Reasoning', description: 'Un visor plegable del razonamiento del asistente que sigue la parte activa del mensaje.', Card: AuiReasoningCard, Doc: AuiReasoningDoc },
      { slug: 'aui-message-timing', title: 'Message timing', description: 'Estadísticas del streaming del mensaje actual: primer token, tiempo total y velocidad.', Card: AuiMessageTimingCard, Doc: AuiMessageTimingDoc },
      { slug: 'aui-conversation-map', title: 'Conversation map', description: 'Un riel de todo el hilo: una marca por turno, la que lees resaltada, las visibles más marcadas, vista previa y salto con un clic.', Card: AuiConversationMapCard, Doc: AuiConversationMapDoc },
      { slug: 'aui-context-display', title: 'Context display', description: 'El uso del contexto del modelo como anillo, barra o texto, con una vista detallada al pasar el cursor.', Card: AuiContextDisplayCard, Doc: AuiContextDisplayDoc },
      { slug: 'aui-mcp-config', title: 'MCP config dialog', description: 'Un diálogo para conectores y servidores MCP propios, con autenticación y estado de conexión.', Card: AuiMcpConfigCard, Doc: AuiMcpConfigDoc },
      { slug: 'aui-attachment', title: 'Attachment', description: 'Adjuntos del runtime para el composer y los mensajes, con vista previa, progreso y opción de quitarlos.', Card: AuiAttachmentCard, Doc: AuiAttachmentDoc },
      { slug: 'aui-followups', title: 'Follow-up suggestions', description: 'Fichas de prompt que se llenan con las sugerencias de seguimiento que genera el runtime.', Card: AuiFollowupsCard, Doc: AuiFollowupsDoc },
      { slug: 'aui-tool-fallback', title: 'Tool fallback', description: 'El renderizador por defecto para llamadas a herramientas que no tienen una interfaz dedicada.', Card: AuiToolFallbackCard, Doc: AuiToolFallbackDoc },
      { slug: 'aui-tool-group', title: 'Tool group', description: 'Un contenedor plegable para las llamadas a herramientas consecutivas de un mismo turno.', Card: AuiToolGroupPreview, Doc: AuiToolGroupDoc },
      { slug: 'aui-quote', title: 'Quote', description: 'Selecciona texto de un mensaje, cítalo desde una barra flotante y llévalo al composer.', Card: AuiQuoteCard, Doc: AuiQuoteDoc },
      { slug: 'aui-sources', title: 'Sources', description: 'Fuentes del runtime: enlaces con favicon e insignias para documentos.', Card: AuiSourcesCard, Doc: AuiSourcesDoc },
      { slug: 'aui-image', title: 'Image', description: 'Partes de imagen del mensaje con vista previa, estados de carga, acciones y vista a pantalla completa.', Card: AuiImageCard, Doc: AuiImageDoc },
      { slug: 'aui-file', title: 'File', description: 'Partes de archivo del mensaje con ícono según el tipo, nombre, tamaño y descarga.', Card: AuiFileCard, Doc: AuiFileDoc },
      { slug: 'aui-model-selector', title: 'Model selector', description: 'El modelo y su esfuerzo de razonamiento, elegidos desde el composer.', Card: AuiModelSelectorCard, Doc: AuiModelSelectorDoc },
      { slug: 'aui-trigger-popover', title: 'Composer trigger popover', description: 'Un selector que se abre con un carácter, para menciones, comandos y acciones anidadas del composer.', Card: AuiTriggerPopoverCard, Doc: AuiTriggerPopoverDoc },
      { slug: 'aui-directive-text', title: 'Directive text', description: 'Un renderizador de mensajes que convierte las directivas de mención en fichas en línea.', Card: AuiDirectiveTextCard, Doc: AuiDirectiveTextDoc },
      { slug: 'aui-composer-pill', title: 'Floating composer', description: 'Un composer compacto que flota sobre la pantalla y se abre en el panel del asistente sin perder el chat.', Card: AuiComposerPillCard, Doc: AuiComposerPillDoc },
      { slug: 'aui-starter-suggestions', title: 'Starter suggestions', description: 'Inicios para el chat vacío que anticipan el prompt completo en el composer antes de enviarlo.', Card: AuiStarterSuggestionsCard, Doc: AuiStarterSuggestionsDoc },
      { slug: 'aui-selection-context', title: 'Selection as context', description: 'Las filas seleccionadas en la pantalla viajan como contexto del modelo, visibles y removibles en el composer.', Card: AuiSelectionContextCard, Doc: AuiSelectionContextDoc },
      { slug: 'aui-ask-ai-action', title: 'Ask AI on selection', description: 'Una acción en la barra de selección que abre el asistente con las filas elegidas ya como contexto.', Card: AuiAskAiActionCard, Doc: AuiAskAiActionDoc },
      { slug: 'aui-inline-prompt', title: 'Inline prompt', description: 'Un disparador de IA sobre el elemento que abre ahí mismo un composer pequeño con acciones sugeridas y responde en el mismo lugar.', Card: AuiInlinePromptCard, Doc: AuiInlinePromptDoc },
      { slug: 'aui-assistant-panel', title: 'Assistant panel', description: 'El panel del asistente en tres superficies, flotante, lateral y pantalla completa, con cambio de chat y de asistente.', Card: AuiAssistantPanelCard, Doc: AuiAssistantPanelDoc },
      { slug: 'aui-response-preview', title: 'Response preview', description: 'La última respuesta asoma sobre el composer mientras el chat está cerrado y se recoge sola en una pestaña.', Card: AuiResponsePreviewCard, Doc: AuiResponsePreviewDoc },
      { slug: 'tool-approval', title: 'Tool approval', description: 'Una herramienta que pide la aprobación de la persona antes de cambiar datos y sigue según su respuesta.', Card: ToolApprovalCard, Doc: ToolApprovalDoc },
    ],
  },
  {
    id: 'templates', title: 'Templates', elements: [
      { slug: 'tpl-composer', title: 'Obligaciones · Composer flotante', description: 'La pantalla con la píldora del asistente: se abre en el panel, la selección viaja como contexto y la respuesta asoma sobre la píldora.', Card: TplComposerCard, Doc: TplComposerDoc },
      { slug: 'tpl-chat-panel', title: 'Obligaciones con chat panel', description: 'El detalle de una obligación en un cajón, con un chat panel que responde solo sobre ese registro.', Card: TplChatPanelCard, Doc: TplChatPanelDoc },
    ],
  },
];

export const findElement = (slug: string) => {
  for (const s of SECTIONS) for (const e of s.elements) if (e.slug === slug) return { section: s, element: e };
  return null;
};
