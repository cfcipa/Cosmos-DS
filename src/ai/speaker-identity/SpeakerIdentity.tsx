// Cosmos DS · Kit IA · Messages: Speaker identity.
// Tablero aprobado «Speaker identity»: quién habla, cuando un hilo tiene más voces que la persona y un modelo.
// Como en assistant-ui: cada turno lleva un avatar según el tipo (persona, agente, subagente, herramienta),
// el nombre y un detalle opcional. El avatar es un Avatar de MUI.
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { Bot, User, Wrench } from 'lucide-react';
import { primaryTint } from '../lib/primaryTint';

export type SpeakerKind = 'user' | 'agent' | 'subagent' | 'tool';

export interface SpeakerTurn {
  id: string;
  kind: SpeakerKind;
  name: string;
  /** Modelo, duración: «Cosmos · 4,2 s». */
  detail?: string;
  text: string;
}

export interface SpeakerIdentityProps {
  turns: readonly SpeakerTurn[];
  className?: string;
}

/** Etiqueta del tipo de voz, delante del detalle. */
const KIND_LABEL: Record<SpeakerKind, string> = { user: 'tú', agent: 'agente', subagent: 'subagente', tool: 'herramienta' };
const ICON_SIZE = 16;

/** Persona y subagente usan los colores de Avatar que define el tema; el agente va en primary y la herramienta, apagada. */
const avatarColors = (kind: SpeakerKind) => (t: Theme) => {
  if (kind === 'agent') return { bgcolor: primaryTint(t), color: t.palette.primary.main };
  if (kind === 'tool') return { bgcolor: t.palette.ai.surfaceMuted, color: t.palette.action.active };
  return null;
};

export function SpeakerIdentity({ turns, className }: SpeakerIdentityProps) {
  return (
    <Stack component="ol" spacing={1.75} className={className} data-slot="speaker-identity" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {turns.map((turn) => {
        const isTool = turn.kind === 'tool';
        const kindText = turn.detail ? `${KIND_LABEL[turn.kind]} · ${turn.detail}` : KIND_LABEL[turn.kind];
        return (
          <Stack key={turn.id} component="li" direction="row" alignItems="flex-start" spacing={1.5}>
            <Avatar
              variant={turn.kind === 'subagent' ? 'circular' : 'rounded'}
              aria-hidden="true"
              sx={(t) => ({ width: t.spacing(3.5), height: t.spacing(3.5), ...avatarColors(turn.kind)(t) })}
            >
              {turn.kind === 'user' ? <User size={ICON_SIZE} /> : isTool ? <Wrench size={ICON_SIZE} /> : <Bot size={ICON_SIZE} />}
            </Avatar>
            <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="subtitle2" sx={isTool ? (t) => ({ fontFamily: t.aiKit.code.fontFamily }) : undefined}>{turn.name}</Typography>
                <Typography variant="body3" color="text.secondary">{kindText}</Typography>
              </Stack>
              <Typography
                variant="body1"
                color={isTool ? 'text.secondary' : 'text.primary'}
                sx={isTool ? (t) => ({ fontFamily: t.aiKit.code.fontFamily }) : undefined}
              >
                {turn.text}
              </Typography>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
