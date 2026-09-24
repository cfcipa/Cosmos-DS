import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Slash, Sparkles, User, Wrench } from 'lucide-react';
import { AuiDirectiveSegments } from '../../src/ai/aui';
import { userBubbleSx } from '../../src/ai/lib/thread';
import { ElementPage, PropRow, PropToggle } from '../ui/Playground';

const EX1 = 'Pídele a :user[Nubia Rojas]{name=nubia} que legalice CE-4492 y usa :tool[Consultar anticipos]{name=consultar_anticipos} para confirmar el valor. Copia a :user[Carolina Díaz]{name=cdiaz}.';
const EX2 = 'Pídele a Nubia Rojas que legalice CE-4492 antes del 30 de septiembre.';
const ANS = 'Listo. Usé :command[resumir]{name=resumir} y le dejé la tarea a :user[Nubia Rojas]{name=nubia}: CE-4492 por $1.200.000 vence el 30 de septiembre.';
const MENTION = ' :user[Nicolás Pardo]{name=npardo}';
const ICONS: Record<string, React.FC<{ className?: string }>> = { user: User, tool: Wrench, command: Slash };
type IconMap = 'none' | 'icons';

export function AuiDirectiveTextDoc() {
  const [text, setText] = React.useState(EX1);
  const [iconMap, setIconMap] = React.useState<IconMap>('icons');
  const options = iconMap === 'icons' ? { iconMap: ICONS, fallbackIcon: Sparkles } : {};
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={360}
        demo={
          <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', p: 3, boxSizing: 'border-box' }}>
            <Typography variant="body1" component="div" sx={userBubbleSx()}><AuiDirectiveSegments text={text} {...options} /></Typography>
            <Typography variant="body1" component="div" sx={{ px: 1 }}><AuiDirectiveSegments text={ANS} {...options} /></Typography>
          </Stack>
        }
        properties={
          <>
            <PropRow label="text"><TextField value={text} onChange={(e) => setText(e.target.value)} multiline minRows={2} fullWidth size="small" inputProps={{ 'aria-label': 'text' }} /></PropRow>
            <PropRow label="iconMap"><PropToggle<IconMap> label="iconMap" value={iconMap} onChange={setIconMap} options={[['none', 'none'], ['icons', '{ user, tool, command }']]} /></PropRow>
            <PropRow label="Try it">
              <Button variant="outlined" onClick={() => setText(EX1)}>With directives</Button>
              <Button variant="outlined" onClick={() => setText(EX2)}>Plain text</Button>
              <Button variant="outlined" onClick={() => setText((t) => t + MENTION)}>Insert a mention</Button>
            </PropRow>
          </>
        }
      />
    </Box>
  );
}

export function AuiDirectiveTextCard() {
  return <Typography variant="body2" component="div" sx={userBubbleSx()}><AuiDirectiveSegments text={EX1} iconMap={ICONS} /></Typography>;
}
