import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { RotateCcw } from 'lucide-react';
import { Onboarding, type OnboardingStep } from '../../src/ai/onboarding';
import { ElementPage, PropRow } from '../ui/Playground';

// Contenido del tablero «Onboarding».
const STEPS: OnboardingStep[] = [
  { title: 'Pregunta por tus datos', body: 'El asistente consulta el ERP y responde con cifras exactas, no con aproximaciones.', example: '¿Qué anticipos vencen este mes?' },
  { title: 'Pide que haga algo', body: 'Antes de cambiar un dato te muestra qué va a tocar y espera tu aprobación.', example: 'Cambia el centro de costo de CE-4471 a Obra Sur' },
  { title: 'Revisa de dónde sale', body: 'Cada respuesta abre su explicación: cómo se obtuvo y qué fuentes usó.', example: 'Toca la insignia IA junto a la respuesta' },
];

function useTour() {
  const [index, setIndex] = React.useState(0);
  const [done, setDone] = React.useState<'' | 'next' | 'skip'>('');
  return {
    index, done,
    next: () => { if (index >= STEPS.length - 1) setDone('next'); else setIndex(index + 1); },
    skip: () => setDone('skip'),
    reset: () => { setIndex(0); setDone(''); },
  };
}

function TourDemo({ tour }: { tour: ReturnType<typeof useTour> }) {
  if (tour.done) {
    return (
      <Typography variant="body1" color="text.secondary" role="status">
        {tour.done === 'skip' ? `Tour omitido. onSkip() se llamó en el paso ${tour.index + 1}.` : 'Tour terminado. onNext() en el último paso lo cierra.'}
      </Typography>
    );
  }
  return <Onboarding steps={STEPS} index={tour.index} onNext={tour.next} onSkip={tour.skip} />;
}

export function OnboardingDoc() {
  const tour = useTour();
  return (
    <Box sx={{ maxWidth: 640 }}>
      <ElementPage
        demoHeight={400}
        demo={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><TourDemo tour={tour} /></Box>}
        properties={
          <>
            <PropRow label="index"><Typography variant="body3" color="text.secondary" sx={(t) => t.aiKit.code}>{tour.index}</Typography></PropRow>
            <PropRow label="Demo"><Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={tour.reset}>Replay the tour</Button></PropRow>
          </>
        }
      />
    </Box>
  );
}

export function OnboardingCard() {
  const tour = useTour();
  const { done, reset } = tour;
  React.useEffect(() => { if (!done) return undefined; const id = window.setTimeout(reset, 1800); return () => window.clearTimeout(id); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps
  return <TourDemo tour={tour} />;
}
