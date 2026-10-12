import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMulti } from '@/store/multi';

/** Entre amis : quand l'hôte lance une manche, chaque appareil passe à l'écran de jeu. */
export function SuiviSalon() {
  const navigate = useNavigate();
  const numero = useMulti((s) => s.numeroManche);
  const vu = useRef(numero);
  useEffect(() => {
    if (numero === vu.current) return;
    vu.current = numero;
    navigate('/partie');
  }, [numero, navigate]);
  return null;
}
