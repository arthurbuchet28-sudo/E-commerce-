import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { QuestionPreparee } from '@/engine/partie';
import { ZoneChronologie } from '../zones/ZoneChronologie';
import { ZoneEstimation } from '../zones/ZoneEstimation';
import { ZoneSaisie } from '../zones/ZoneSaisie';

const base = { id: 'x', source: 't', categorie: 'histoire' as const, difficulte: 2 as const, enonce: 'Test ?' };

describe('ZoneChronologie', () => {
  it('réordonne au clavier avec ↑ ↓ puis valide', async () => {
    const onValider = vi.fn();
    const courante: QuestionPreparee = {
      question: { ...base, type: 'chronologie', bonneReponse: ['A', 'B', 'C'] },
      mode: 'chronologie',
      choix: ['B', 'A', 'C'],
      bonne: 'A → B → C',
      marge: 0,
      niveau: 'moyen',
      joueur: 0,
    };
    render(<ZoneChronologie courante={courante} enQuestion ordreJoueur={null} onValider={onValider} />);
    await userEvent.click(screen.getByRole('button', { name: 'Descendre « B »' }));
    await userEvent.click(screen.getByRole('button', { name: 'Valider l’ordre' }));
    expect(onValider).toHaveBeenCalledWith(['A', 'B', 'C']);
  });
});

describe('ZoneSaisie', () => {
  it('valide avec Entrée et masque le bouton une fois la réponse révélée', async () => {
    const onValider = vi.fn();
    const { rerender } = render(<ZoneSaisie enQuestion onValider={onValider} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Écris ta réponse' }), '  Berlin {Enter}');
    expect(onValider).toHaveBeenCalledWith('Berlin');
    rerender(<ZoneSaisie enQuestion={false} onValider={onValider} />);
    expect(screen.queryByRole('button', { name: 'Valider' })).toBeNull();
  });
});

describe('ZoneEstimation', () => {
  it('accepte la virgule décimale', async () => {
    const onValider = vi.fn();
    const courante: QuestionPreparee = {
      question: { ...base, type: 'estimation', bonneReponse: 6.56, estimation: { marge: 2, unite: 'francs' } },
      mode: 'estimation',
      choix: [],
      bonne: '6,56 francs',
      marge: 2,
      niveau: 'moyen',
      joueur: 0,
    };
    render(<ZoneEstimation courante={courante} enQuestion onValider={onValider} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Ton estimation' }), '6,5');
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }));
    expect(onValider).toHaveBeenCalledWith(6.5);
  });
});
