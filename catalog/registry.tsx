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
];

export const findElement = (slug: string) => {
  for (const s of SECTIONS) for (const e of s.elements) if (e.slug === slug) return { section: s, element: e };
  return null;
};
