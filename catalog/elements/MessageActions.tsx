import * as React from 'react';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download } from 'lucide-react';
import { MessageActions } from '../../src/ai/message-actions';
import type { MessageReaction } from '../../src/ai/message-actions';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

// Contenido del tablero aprobado «Message actions».
const RESPONSE = 'Hay 3 anticipos pendientes de legalizar por $3.930.000. El más próximo a vencer es CE-4492, de Nubia Rojas, el 30 de septiembre.';
const REGENERATE_MS = 1600;
const STATUS_MS = 2400;

type CopiedDuration = '1500' | '3000';

export function MessageActionsDoc() {
  const [copied, setCopied] = React.useState(false);
  const [reaction, setReaction] = React.useState<MessageReaction>(null);
  const [regenerating, setRegenerating] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [copiedDuration, setCopiedDuration] = React.useState<CopiedDuration>('3000');
  const [status, setStatus] = React.useState('');
  const timers = React.useRef<Record<'copied' | 'regenerate' | 'status', number | undefined>>({ copied: undefined, regenerate: undefined, status: undefined });

  React.useEffect(() => () => Object.values(timers.current).forEach((id) => window.clearTimeout(id)), []);

  const announce = (message: string) => {
    window.clearTimeout(timers.current.status);
    setStatus(message);
    timers.current.status = window.setTimeout(() => setStatus(''), STATUS_MS);
  };

  const copyResponse = () => {
    navigator.clipboard?.writeText(RESPONSE).catch(() => undefined);
    window.clearTimeout(timers.current.copied);
    setCopied(true);
    timers.current.copied = window.setTimeout(() => setCopied(false), Number(copiedDuration));
  };

  const changeReaction = (next: MessageReaction) => {
    setReaction(next);
    announce(next ? 'Calificación guardada' : 'Calificación retirada');
  };

  const regenerate = () => {
    setMenuAnchor(null);
    setRegenerating(true);
    timers.current.regenerate = window.setTimeout(() => {
      setRegenerating(false);
      announce('Respuesta regenerada');
    }, REGENERATE_MS);
  };

  const exportMarkdown = () => {
    setMenuAnchor(null);
    announce('Copiada como Markdown');
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={320}
        demo={
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <Stack spacing={1} sx={{ width: '100%', maxWidth: 460 }}>
              <Typography component="p" variant="body1" sx={{ m: 0, opacity: regenerating ? 0.38 : 1, transition: 'opacity .2s' }}>
                {RESPONSE}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MessageActions
                  copied={copied}
                  reaction={reaction}
                  regenerating={regenerating}
                  onCopy={copyResponse}
                  onReactionChange={changeReaction}
                  onRegenerate={regenerate}
                  onMore={setMenuAnchor}
                  moreOpen={Boolean(menuAnchor)}
                />
                <Typography role="status" variant="body3" color="text.secondary">{status}</Typography>
              </Stack>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={exportMarkdown}>
                  <ListItemIcon><Download size={18} /></ListItemIcon>
                  Exportar a Markdown
                </MenuItem>
              </Menu>
            </Stack>
          </Box>
        }
        properties={
          <>
            <PropRow label="reaction">
              <Typography variant="caption" color="text.secondary" sx={(t) => ({ ...t.aiKit.code, fontSize: t.typography.body3.fontSize })}>{String(reaction)}</Typography>
            </PropRow>
            <PropRow label="copiedDuration">
              <PropToggle<CopiedDuration> label="Copied duration" value={copiedDuration} onChange={setCopiedDuration} options={[['1500', '1,500 ms'], ['3000', '3,000 ms']]} />
            </PropRow>
            <PropRow label="Try it">
              <Typography variant="caption" color="text.secondary">Press a rating twice to clear it. Regenerate spins while working.</Typography>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

/** Vista previa de la tarjeta en Elements. */
export function MessageActionsCard() {
  return (
    <Stack spacing={1} sx={{ maxWidth: 420 }}>
      <Typography component="p" variant="body1" sx={{ m: 0 }}>{RESPONSE}</Typography>
      <MessageActions copied={false} reaction="up" regenerating={false} onCopy={() => undefined} onReactionChange={() => undefined} onRegenerate={() => undefined} onMore={() => undefined} />
    </Stack>
  );
}
