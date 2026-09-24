// Cosmos DS · Catálogo: página «Diseño».
// Referente: assistant-ui/design — título, bajada y contenido en texto plano, sin tarjetas ni color de relleno.
// El detalle de cada pieza del kit ya vive en el buscador de la barra lateral y en /elements; acá solo el resumen:
// el tema con sus valores reales (no una descripción) y las 7 secciones con su cuenta.
import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { SECTIONS } from './registry';

const PALETTE_ROLES = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const;
type PaletteRole = (typeof PALETTE_ROLES)[number];

function paletteMain(t: Theme, role: PaletteRole): string {
  return t.palette[role].main;
}

function ColorSwatch({ role }: { role: PaletteRole }) {
  const theme = useTheme();
  return (
    <Stack spacing={0.75} sx={{ width: 108 }}>
      <Box sx={{ height: 56, borderRadius: 1, bgcolor: `${role}.main` }} />
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium', textTransform: 'capitalize' }}>{role}</Typography>
      <Typography variant="body3" color="text.secondary" sx={(t) => ({ fontFamily: t.aiKit.code.fontFamily })}>{paletteMain(theme, role)}</Typography>
    </Stack>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Typography component="h2" variant="h5" sx={{ mb: 3 }}>{children}</Typography>
    </>
  );
}

function ThemeSummary() {
  return (
    <Stack spacing={5}>
      <Box>
        <Typography component="h3" variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'fontWeightMedium' }}>Color</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560 }}>
          Azul primario, cian secundario, y los semánticos de siempre. Claro y oscuro son el mismo árbol de tokens, no dos temas
          distintos — cámbialo con el interruptor de arriba a la derecha.
        </Typography>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {PALETTE_ROLES.map((role) => <ColorSwatch key={role} role={role} />)}
        </Stack>
      </Box>

      <Box>
        <Typography component="h3" variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'fontWeightMedium' }}>Tipografía</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560 }}>
          Inter para títulos y texto corrido; JetBrains Mono donde hay código, cifras o identificadores.
        </Typography>
        <Stack direction="row" spacing={5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>Título</Typography>
            <Typography variant="caption" color="text.secondary">h1–h6 · 16 a 40px</Typography>
          </Box>
          <Box>
            <Typography variant="body1" sx={{ mb: 0.5 }}>El texto de todos los días.</Typography>
            <Typography variant="caption" color="text.secondary">body1–body3 · 12 a 14px</Typography>
          </Box>
          <Box>
            <Typography component="p" sx={(t) => ({ ...t.aiKit.code, mb: 0.5 })}>consultar_anticipos()</Typography>
            <Typography variant="caption" color="text.secondary">JetBrains Mono · 13px</Typography>
          </Box>
        </Stack>
      </Box>

      <Box>
        <Typography component="h3" variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'fontWeightMedium' }}>Espaciado y forma</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
          Una escala de 8px para relleno, huecos y márgenes; las esquinas redondean 4px, del botón más chico al panel más grande.
        </Typography>
      </Box>
    </Stack>
  );
}

/** Qué cubre cada sección, en una frase — el detalle de cada pieza ya vive en el buscador de la barra lateral. */
const SECTION_SUMMARY: Record<string, string> = {
  reasoning: 'Lo que el modelo hace antes de responder: piensa, guarda pasos, a veces se resiste, con razón.',
  messages: 'La burbuja y todo lo que le pasa después: se edita, se cita, se regenera, se marca en el tiempo.',
  knowledge: 'De dónde sale la respuesta: la web, un documento, una memoria, un mapa.',
  composer: 'La entrada: comandos, menciones, adjuntos, el modelo, la voz, el contexto que le va quedando.',
  voice: 'Hablarle al asistente y que te hable de vuelta.',
  thread: 'El hilo completo: de la bienvenida al historial, del teclado al reconectar.',
  'aui-connected': 'Las mismas piezas, ya conectadas al runtime real de @assistant-ui/react.',
};

function SectionRow({ title, count, summary }: { title: string; count: number; summary: string }) {
  return (
    <Stack direction="row" alignItems="baseline" spacing={3} sx={{ py: 1.25, borderTop: 1, borderColor: 'divider' }}>
      <Typography component="span" variant="subtitle1" sx={{ flexShrink: 0, width: 176 }}>{title}</Typography>
      <Typography component="span" variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>{summary}</Typography>
      <Typography component="span" variant="body2" color="text.secondary" sx={(t) => ({ flexShrink: 0, fontFamily: t.aiKit.code.fontFamily })}>{count}</Typography>
    </Stack>
  );
}

function KitSummary() {
  const elementCount = SECTIONS.reduce((n, s) => n + s.elements.length, 0);
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
        {elementCount} piezas en {SECTIONS.length} secciones, en el orden del catálogo de assistant-ui. Cada una es una demo en
        vivo — búscalas por nombre en la barra lateral.
      </Typography>
      <Box>
        {SECTIONS.map((s) => <SectionRow key={s.id} title={s.title} count={s.elements.length} summary={SECTION_SUMMARY[s.id] ?? ''} />)}
      </Box>
    </Stack>
  );
}

export function DesignPage() {
  const elementCount = SECTIONS.reduce((n, s) => n + s.elements.length, 0);
  return (
    <Box sx={{ maxWidth: 880 }}>
      <Typography component="h1" variant="h4" sx={{ mb: 1 }}>Diseño</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
        El tema Cosmos (paquete Azul, sobre MUI Material) y el kit de IA construido con él: {elementCount} piezas, todas con
        demo en vivo.
      </Typography>
      <Divider sx={{ mb: 6 }} />

      <Box sx={{ mb: 8 }}>
        <SectionHeading>Tema</SectionHeading>
        <ThemeSummary />
      </Box>

      <Box>
        <SectionHeading>Kit de IA</SectionHeading>
        <KitSummary />
      </Box>
    </Box>
  );
}
