import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BoutonReponse } from '../BoutonReponse';

describe('BoutonReponse', () => {
  it('affiche le numéro de touche et déclenche le choix', async () => {
    const onChoisir = vi.fn();
    render(<BoutonReponse texte="Paris" index={1} etat="neutre" desactive={false} onChoisir={onChoisir} />);
    const bouton = screen.getByRole('button', { name: 'Réponse 2 : Paris' });
    await userEvent.click(bouton);
    expect(onChoisir).toHaveBeenCalledOnce();
  });

  it('est inactif une fois la réponse révélée', () => {
    render(<BoutonReponse texte="Paris" index={0} etat="correct" desactive onChoisir={() => {}} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
