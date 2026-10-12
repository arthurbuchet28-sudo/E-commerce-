import type { QuestionPreparee } from '@/engine/partie';
import { BoutonReponse, type EtatBouton } from '../BoutonReponse';

type Props = {
  courante: QuestionPreparee;
  enQuestion: boolean;
  masques: string[];
  choixJoueur: string | null;
  onChoisir: (c: string) => void;
  /** Reçoit les boutons pour situer les effets (confettis, points volants). */
  boutonsRef: React.RefObject<(HTMLButtonElement | null)[]>;
};

/** QCM, Vrai / Faux, image et audio : une grille de boutons. */
export function ZoneChoix({ courante, enQuestion, masques, choixJoueur, onChoisir, boutonsRef }: Props) {
  const etat = (c: string): EtatBouton => {
    if (masques.includes(c)) return 'masque';
    if (enQuestion) return 'neutre';
    if (c === courante.bonne) return c === choixJoueur ? 'correct' : 'revele';
    if (c === choixJoueur) return 'faux';
    return 'eteint';
  };
  const n = courante.choix.length;
  return (
    <div className={`grid gap-3 ${n > 4 ? 'sm:grid-cols-2' : n === 2 ? 'grid-cols-2' : ''}`}>
      {courante.choix.map((c, i) => (
        <BoutonReponse
          key={c}
          ref={(el) => {
            boutonsRef.current[i] = el;
          }}
          texte={c}
          index={i}
          etat={etat(c)}
          desactive={!enQuestion}
          onChoisir={() => onChoisir(c)}
        />
      ))}
    </div>
  );
}
