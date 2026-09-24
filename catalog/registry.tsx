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
import { ToolApprovalDoc, ToolApprovalCard } from './elements/ToolApproval';

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
    id: 'aui-connected', title: 'AUI connected', elements: [
      { slug: 'tool-approval', title: 'Tool approval', description: 'Una herramienta que pide la aprobación de la persona antes de cambiar datos y sigue según su respuesta.', Card: ToolApprovalCard, Doc: ToolApprovalDoc },
    ],
  },
];

export const findElement = (slug: string) => {
  for (const s of SECTIONS) for (const e of s.elements) if (e.slug === slug) return { section: s, element: e };
  return null;
};
