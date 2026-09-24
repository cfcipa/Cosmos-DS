// Cosmos DS · Kit IA · Messages: Timestamps (DaySeparator).
// Tablero aprobado «Timestamps»: cronología en un hilo largo, los días marcados y la hora al pasar el cursor.
// Como en assistant-ui: un separador cada vez que cambia el día; la hora aparece al pasar el cursor o con el foco.
// El separador es un Divider de MUI con texto.
import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface DatedMessage {
  id: string;
  /** Etiqueta del día: «Ayer», «Hoy», «12 de septiembre». */
  day: string;
  time: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface DaySeparatorProps {
  messages: readonly DatedMessage[];
  /** 'hover' (por defecto): la hora aparece al pasar el cursor o con el foco. 'always': siempre visible. */
  showTimes?: 'hover' | 'always';
  className?: string;
}

export function DaySeparator({ messages, showTimes = 'hover', className }: DaySeparatorProps) {
  const alwaysShowTimes = showTimes === 'always';

  return (
    <Stack spacing={1} className={className} data-slot="day-separator">
      {messages.map((message, index) => {
        const startsNewDay = index === 0 || messages[index - 1].day !== message.day;
        const isUser = message.role === 'user';
        return (
          <React.Fragment key={message.id}>
            {startsNewDay ? (
              <Divider role="separator" aria-label={message.day} sx={{ my: 0.5 }}>
                <Typography variant="overline" color="text.secondary">{message.day}</Typography>
              </Divider>
            ) : null}
            <Stack
              direction={isUser ? 'row-reverse' : 'row'}
              alignItems="center"
              spacing={1}
              tabIndex={0}
              sx={(t) => ({
                borderRadius: 1,
                outline: 'none',
                '& time': { opacity: alwaysShowTimes ? 1 : 0, transition: 'opacity .15s' },
                '&:hover time, &:focus-visible time': { opacity: 1 },
                '&:focus-visible': { outline: `2px solid ${t.palette.ai.focusRing}`, outlineOffset: 2 },
              })}
            >
              <Box
                sx={(t) => ({
                  maxWidth: '80%',
                  ...t.typography.body1,
                  overflowWrap: 'anywhere',
                  ...(isUser ? { px: 1.5, py: 1, borderRadius: 1, bgcolor: 'ai.userBubble', color: 'ai.userBubbleText' } : { color: 'text.primary' }),
                })}
              >
                {message.text}
              </Box>
              <Box
                component="time"
                sx={(t) => ({ flexShrink: 0, ...t.aiKit.code, fontSize: t.typography.caption.fontSize, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' })}
              >
                {message.time}
              </Box>
            </Stack>
          </React.Fragment>
        );
      })}
    </Stack>
  );
}
