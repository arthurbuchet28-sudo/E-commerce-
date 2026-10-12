import { useCallback, useEffect, useState } from 'react';
import { ExerciseShell, SessionBar } from '../../components/ExerciseShell';
import { Hand } from '../../components/Hand';
import { Button, Feedback, Segmented, formatSigned } from '../../components/ui';
import { DeviationTable } from '../../components/widgets/widgets';
import { useSession } from '../../lib/useSession';
import { DEVIATIONS, type Deviation, countedDecision, deviationApplies, formatIndex, shouldTakeInsurance } from '../../engine/deviations';
import { REFERENCE_RULES, type TableRules } from '../../engine/rules';
import { ACTION_LABELS, type Action } from '../../engine/strategy';
import { type Card, cardFromUpValue, type UpValue } from '../../engine/cards';
import { cardsForSituation } from '../../engine/situations';
import { pick, randInt } from '../../engine/rng';

type Group = 'all' | 'I18' | 'Fab4';
type Choice = Action | 'Ins' | 'NoIns';

interface Problem {
  dev: Deviation;
  tc: number;
  rules: TableRules;
  player: Card[];
  dealer: Card;
  expected: Choice;
  start: number;
}

/** Les déviations « rester » sur 15/16 ne concernent que les tables sans abandon. */
const NEEDS_NO_SURRENDER = new Set(['16v10', '15v10', '16v9']);

function makeProblem(group: Group): Problem {
  const pool = DEVIATIONS.filter((d) => group === 'all' || d.group === group);
  const dev = pick(pool);
  const tc = dev.index + pick([-2, -1, -1, 0, 0, 1, 1, 2]) + (Math.random() < 0.1 ? randInt(-3, 3) : 0);
  const rules: TableRules = { ...REFERENCE_RULES, lateSurrender: !NEEDS_NO_SURRENDER.has(dev.id) };
  const dealer = cardFromUpValue(dev.dealer);
  if (dev.id === 'ins') {
    const s = cardsForSituation({ kind: 'hard', value: randInt(12, 19), dealer: 11 });
    return { dev, tc, rules, player: s.player, dealer, expected: shouldTakeInsurance(tc) ? 'Ins' : 'NoIns', start: performance.now() };
  }
  const isPair = dev.hand.pairValue !== undefined;
  const s = cardsForSituation(isPair ? { kind: 'pair', value: dev.hand.pairValue!, dealer: dev.dealer } : { kind: 'hard', value: dev.hand.total, dealer: dev.dealer });
  const decision = countedDecision(
    { total: dev.hand.total, soft: false, pairValue: dev.hand.pairValue, dealer: dev.dealer as UpValue },
    tc,
    rules,
    { canDouble: true, canSplit: isPair, canSurrender: rules.lateSurrender },
  );
  return { dev, tc, rules, player: s.player, dealer, expected: decision.action, start: performance.now() };
}

function label(c: Choice): string {
  if (c === 'Ins') return "Prendre l'assurance";
  if (c === 'NoIns') return 'Refuser';
  return ACTION_LABELS[c];
}

export function DeviationQuizPage() {
  const { stats, answer, flush } = useSession('deviation-quiz');
  const [group, setGroup] = useState<Group>('all');
  const [p, setP] = useState<Problem>(() => makeProblem('all'));
  const [chosen, setChosen] = useState<Choice | null>(null);
  const [showTable, setShowTable] = useState(false);

  const next = useCallback(() => {
    setP(makeProblem(group));
    setChosen(null);
  }, [group]);

  useEffect(() => {
    next();
  }, [next]);

  const choose = (c: Choice) => {
    if (chosen) return;
    setChosen(c);
    answer(c === p.expected, performance.now() - p.start);
  };

  const isIns = p.dev.id === 'ins';
  const choices: Choice[] = isIns ? ['Ins', 'NoIns'] : ['H', 'S', 'D', ...(p.dev.hand.pairValue !== undefined ? (['P'] as Action[]) : []), ...(p.rules.lateSurrender ? (['R'] as Action[]) : [])];
  const applies = deviationApplies(p.dev, p.tc);

  return (
    <ExerciseShell id="deviation-quiz" intro="Indices Hi-Lo pour sabot 4-8 jeux, S17, DAS, TC arrondi à l'entier inférieur. L'abandon tardif est autorisé sauf mention contraire.">
      <div className="flex flex-wrap items-center gap-4">
        <Segmented label="Liste" value={group} onChange={setGroup} options={[{ value: 'all', label: 'I18 + Fab 4' }, { value: 'I18', label: 'Illustrious 18' }, { value: 'Fab4', label: 'Fab 4' }]} />
        <Button variant="ghost" onClick={() => setShowTable((v) => !v)}>{showTable ? 'Masquer' : 'Afficher'} la table des indices</Button>
      </div>
      {showTable && <DeviationTable />}
      <div className="felt rounded-2xl p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="rounded-full bg-black/40 px-3 py-1 text-lg font-bold text-amber-300">TC {formatSigned(p.tc)}</span>
          <span className={`rounded-full px-3 py-1 ${p.rules.lateSurrender ? 'bg-emerald-900/70 text-emerald-200' : 'bg-rose-900/70 text-rose-200'}`}>
            {p.rules.lateSurrender ? 'Abandon autorisé' : 'Abandon NON autorisé'}
          </span>
        </div>
        <div className="flex flex-col items-center gap-5">
          <Hand cards={[p.dealer]} label="Croupier" size="lg" />
          <Hand cards={p.player} label="Vous" size="lg" />
        </div>
        {isIns && <div className="mt-4 text-center text-emerald-100">Le croupier propose l'assurance.</div>}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {choices.map((c) => (
            <Button
              key={c}
              variant={chosen && c === p.expected ? 'primary' : chosen === c ? 'danger' : 'secondary'}
              disabled={!!chosen}
              onClick={() => choose(c)}
              className="py-3"
            >
              {label(c)}
            </Button>
          ))}
        </div>
      </div>
      {chosen && (
        <>
          <Feedback ok={chosen === p.expected}>
            <div className="font-semibold">{chosen === p.expected ? '✓ Correct' : `✗ Il fallait : ${label(p.expected)}`}</div>
            <div className="mt-1">
              {p.dev.label} — indice : {label(p.dev.deviation)} si {formatIndex(p.dev)} (sinon : {label(p.dev.basic)}). Avec TC {formatSigned(p.tc)}, la déviation {applies ? "s'applique" : "ne s'applique pas"}.
              {p.dev.note && <span className="block text-xs opacity-80">Note : {p.dev.note}</span>}
            </div>
          </Feedback>
          <Button onClick={next} autoFocus>Suivant →</Button>
        </>
      )}
      <SessionBar stats={stats} />
      <Button variant="ghost" onClick={flush} disabled={stats.answered === 0}>Enregistrer et terminer la séance</Button>
    </ExerciseShell>
  );
}
