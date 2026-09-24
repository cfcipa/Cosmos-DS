// El streaming de los modelos de ejemplo del catálogo: 4 caracteres cada 30 ms, tras ~320 ms hasta el primer token
// (el ritmo de los tableros). Lo comparten el runtime de la demo, sus guiones y los modelos de cada tablero.
import type { ChatModelAdapter, ChatModelRunOptions, ChatModelRunResult, ThreadMessage } from '@assistant-ui/react';

export type DemoPart = NonNullable<ChatModelRunResult['content']>[number];

export const STREAM_STEP = 4;
export const STREAM_TICK_MS = 30;
export const FIRST_TOKEN_MS = 320;

export const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Escribe `text` de a `STREAM_STEP` caracteres, entre `head` y `tail`. */
export async function* streamText(signal: AbortSignal, text: string, head: DemoPart[] = [], tail: DemoPart[] = []): AsyncGenerator<ChatModelRunResult> {
  for (let n = STREAM_STEP; n < text.length + STREAM_STEP; n += STREAM_STEP) {
    if (signal.aborted) return;
    await wait(STREAM_TICK_MS);
    yield { content: [...head, { type: 'text', text: text.slice(0, n) }, ...tail] };
  }
}

/** El texto del último mensaje del usuario. */
export function lastUserText(messages: readonly ThreadMessage[]) {
  const u = [...messages].reverse().find((m) => m.role === 'user');
  return u ? u.content.map((p) => (p.type === 'text' ? p.text : '')).join(' ') : '';
}

/** Un modelo que solo responde texto, calculado de lo que recibe (el contexto, la pregunta). */
export function textModel(answer: (options: ChatModelRunOptions) => string): ChatModelAdapter {
  return {
    async *run(options) {
      await wait(FIRST_TOKEN_MS);
      yield* streamText(options.abortSignal, answer(options));
    },
  };
}
