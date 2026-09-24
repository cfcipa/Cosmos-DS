// Cosmos DS · Kit IA · AUI connected: Markdown text.
// Referente: assistant-ui «Markdown text» (elements/markdown-text.tsx), sobre @assistant-ui/react-markdown y remark-gfm.
// El texto de una parte del mensaje con formato: títulos, listas, citas, tablas, código en línea y bloques de código con
// su lenguaje y botón de copiar. Mientras la parte corre, un punto late al final del último bloque. El análisis se difiere
// para no frenar la escritura ni el desplazamiento mientras llega la respuesta.
import * as React from 'react';
import { MarkdownTextPrimitive, type CodeHeaderProps, unstable_memoizeMarkdownComponents as memoizeMarkdownComponents } from '@assistant-ui/react-markdown';
import remarkGfm from 'remark-gfm';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes, styled } from '@mui/material/styles';
import { Check, Copy } from 'lucide-react';
import { REDUCED_MOTION } from '../lib/shimmerText';
import { AuiIconButton } from './AuiIconButton';

/** `leading-relaxed` de assistant-ui para prosa. */
export const PROSE_LINE_HEIGHT = 1.625;
/** Tiempo que el botón de copiar muestra la marca de copiado (useCopyToClipboard de assistant-ui). */
export const COPIED_MS = 3000;
/** Código en línea: 0,85em del texto que lo rodea. */
const INLINE_CODE_SCALE = '0.85em';

const pulse = keyframes`50% { opacity: .5; }`;

/** Selectores del punto de streaming (styles/dot.css de react-markdown): el último bloque, o el último ítem de una lista. */
const RUNNING_DOT = [
  '&[data-status="running"]:empty::after',
  '&[data-status="running"] > :not(ol):not(ul):not(pre):last-child::after',
  '&[data-status="running"] > pre:last-child code::after',
  '&[data-status="running"] > :is(ol, ul):last-child > li:last-child:not(:has(* > li))::after',
].join(', ');

const MdRoot = styled('div')(({ theme: t }) => {
  // Márgenes de assistant-ui (my-3; títulos con más aire arriba), sin margen arriba en el primer bloque ni abajo en el
  // último. El margen superior va en el bloque que sigue a otro (`* + x`), así no hace falta :first-child.
  const block = { marginTop: 0, marginBottom: t.spacing(1.5), '&:last-child': { marginBottom: 0 } };
  const heading = (variant: 'h5' | 'h6' | 'subtitle1' | 'subtitle2', weight: number | string | undefined, bottom: number) => ({
    ...t.typography[variant], fontWeight: weight, marginTop: 0, marginBottom: t.spacing(bottom), '&:last-child': { marginBottom: 0 },
  });
  const BLOCKS = ':is(p, blockquote, ul, ol, hr, [data-slot="aui-md-table"], [data-slot="aui-code-header"])';
  return {
    ...t.typography.body1,
    lineHeight: PROSE_LINE_HEIGHT,
    color: t.palette.text.primary,
    overflowWrap: 'anywhere',
    '& h1': heading('h5', t.typography.fontWeightMedium, 1),
    '& h2': heading('h6', t.typography.fontWeightMedium, 1),
    '& h3': heading('subtitle1', t.typography.h6.fontWeight, 0.75),
    '& h4': heading('subtitle1', t.typography.fontWeightMedium, 0.5),
    '& h5': heading('subtitle2', t.typography.h6.fontWeight, 0.5),
    '& h6': heading('subtitle2', t.typography.fontWeightMedium, 0.5),
    '& p': block,
    '& a': { color: t.palette.primary.main, textDecoration: 'underline', textUnderlineOffset: 2, '&:hover': { color: t.palette.primary.dark } },
    '& blockquote': { ...block, marginInline: 0, paddingInlineStart: t.spacing(2), borderInlineStart: `2px solid ${t.palette.divider}`, color: t.palette.text.secondary },
    '& ul, & ol': { ...block, paddingInlineStart: t.spacing(2.5), '& > li': { marginTop: t.spacing(0.5) }, '& ::marker': { color: t.palette.text.secondary } },
    '& ul': { listStyleType: 'disc' },
    '& ol': { listStyleType: 'decimal' },
    '& li': { lineHeight: PROSE_LINE_HEIGHT },
    '& hr': { ...block, border: 0, borderTop: `1px solid ${t.palette.divider}` },
    '& strong': { fontWeight: t.typography.h6.fontWeight },
    '& sup > a': { ...t.typography.body3, textDecoration: 'none' },
    '& [data-slot="aui-md-table"]': { ...block, overflowX: 'auto' },
    '& table': { width: '100%', borderCollapse: 'separate', borderSpacing: 0, ...t.typography.body2 },
    '& th, & td': { padding: t.spacing(0.75, 1.5), textAlign: 'start', '&[align=center]': { textAlign: 'center' }, '&[align=right]': { textAlign: 'right' } },
    '& th': {
      backgroundColor: t.palette.action.hover, fontWeight: t.typography.fontWeightMedium,
      '&:first-of-type': { borderStartStartRadius: t.shape.borderRadius }, '&:last-of-type': { borderStartEndRadius: t.shape.borderRadius },
    },
    '& td': { borderBottom: `1px solid ${t.palette.divider}`, borderInlineStart: `1px solid ${t.palette.divider}`, '&:last-child': { borderInlineEnd: `1px solid ${t.palette.divider}` } },
    '& tr:last-child > td:first-of-type': { borderEndStartRadius: t.shape.borderRadius },
    '& tr:last-child > td:last-of-type': { borderEndEndRadius: t.shape.borderRadius },
    [`& * + ${BLOCKS}`]: { marginTop: t.spacing(1.5) },
    '& * + :is(h1, h2)': { marginTop: t.spacing(2.5) },
    '& * + h3': { marginTop: t.spacing(2) },
    '& * + h4': { marginTop: t.spacing(1.75) },
    '& * + :is(h5, h6)': { marginTop: t.spacing(1.5) },
    '& :not(pre) > code': {
      fontFamily: t.aiKit.code.fontFamily, fontSize: INLINE_CODE_SCALE, padding: t.spacing(0.25, 0.75),
      borderRadius: t.shape.borderRadius, backgroundColor: t.palette.action.hover,
    },
    '& pre': {
      ...t.aiKit.code, margin: 0, overflowX: 'auto', padding: t.spacing(1.75),
      backgroundColor: t.palette.action.hover, border: `1px solid ${t.palette.divider}`, borderTop: 0,
      borderRadius: `0 0 ${t.shape.borderRadius}px ${t.shape.borderRadius}px`,
    },
    [RUNNING_DOT]: {
      content: '"\\25cf"', marginInline: t.spacing(0.5), animation: `${pulse} 2s cubic-bezier(.4, 0, .6, 1) infinite`,
      [REDUCED_MOTION]: { animation: 'none' },
    },
  };
});

function useCopy() {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return undefined;
    const id = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copied]);
  const copy = React.useCallback((text: string) => {
    void navigator.clipboard?.writeText(text).then(() => setCopied(true));
  }, []);
  return { copied, copy };
}

function CodeHeader({ language, code }: CodeHeaderProps) {
  const { copied, copy } = useCopy();
  return (
    <Box
      data-slot="aui-code-header"
      sx={(t) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.75, py: 0.75,
        bgcolor: 'action.selected', border: 1, borderBottom: 0, borderColor: 'divider',
        borderRadius: `${t.shape.borderRadius}px ${t.shape.borderRadius}px 0 0`,
      })}
    >
      <Typography variant="caption" color="text.secondary" sx={(t) => ({ fontWeight: t.typography.fontWeightMedium, textTransform: 'lowercase' })}>{language}</Typography>
      <AuiIconButton tooltip={copied ? 'Copiado' : 'Copiar'} onClick={() => { if (code && !copied) copy(code); }}>
        {copied ? <Check /> : <Copy />}
      </AuiIconButton>
    </Box>
  );
}

const defaultComponents = memoizeMarkdownComponents({
  table: (props) => <div data-slot="aui-md-table"><table {...props} /></div>,
  CodeHeader,
});

export type AuiMarkdownTextProps = {
  /** Reemplaza elementos (h1, a, code…) sin perder los demás. Deben ser estables entre renders. */
  components?: Parameters<typeof memoizeMarkdownComponents>[0];
};

/** El texto de la parte del mensaje, con formato. Úsalo como `Text` de `MessagePrimitive.Parts` o dentro de un part. */
export const AuiMarkdownText = React.memo(function AuiMarkdownText({ components }: AuiMarkdownTextProps) {
  const merged = React.useMemo(() => (components ? { ...defaultComponents, ...memoizeMarkdownComponents(components) } : defaultComponents), [components]);
  return <MarkdownTextPrimitive remarkPlugins={[remarkGfm]} containerComponent={MdRoot} className="aui-md" components={merged} defer />;
});
