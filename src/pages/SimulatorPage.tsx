import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { TableView } from '../components/Table';
import { DiscardTray } from '../components/DiscardTray';
import { Badge, Button, Feedback, Panel, Segmented, Stat, Toggle, formatPct, formatSigned } from '../components/ui';
import { BlackjackGame, type DecisionRecord } from '../engine/game';
import { REFERENCE_RULES, type TableRules, houseEdge, rulesLabel } from '../engine/rules';
import { ACTION_LABELS, type Action } from '../engine/strategy';
import { betForTc, defaultRamp } from '../engine/betting';
import { playerEdgeAtTrueCount, trueCount } from '../engine/count';
import { randInt } from '../engine/rng';
import { DEVIATIONS } from '../engine/deviations';
import { useProgress } from '../lib/progress';

type Mode = 'training' | 'exam';

interface Config {
  rules: TableRules;
  virtualPlayers: number;
  mode: Mode;
  showRc: boolean;
  showTc: boolean;
  showAdvice: boolean;
  warnErrors: boolean;
  speed: number;
  spread: number;
  bankroll: number;
}

const DEFAULT_CONFIG: Config = {
  rules: REFERENCE_RULES,
  virtualPlayers: 2,
  mode: 'training',
  showRc: true,
  showTc: true,
  showAdvice: true,
  warnErrors: true,
  speed: 500,
  spread: 8,
  bankroll: 500,
};

interface CountCheck {
  round: number;
  rc: number;
  rcGuess: number;
  tc: number;
  tcGuess: number;
}

interface BetCheck {
  round: number;
  tc: number;
  bet: number;
  expected: number;
}

function choiceLabel(c: DecisionRecord['taken']): string {
  if (c === 'Ins') return "Prendre l'assurance";
  if (c === 'NoIns') return "Refuser l'assurance";
  return ACTION_LABELS[c];
}

export function SimulatorPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [game, setGame] = useState<BlackjackGame | null>(null);
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [bet, setBet] = useState(1);
  const [warning, setWarning] = useState<string | null>(null);
  const [checks, setChecks] = useState<CountCheck[]>([]);
  const [betChecks, setBetChecks] = useState<BetCheck[]>([]);
  const [askCount, setAskCount] = useState(false);
  const [nextCheckAt, setNextCheckAt] = useState(4);
  const [rcInput, setRcInput] = useState('');
  const [tcInput, setTcInput] = useState('');
  const [report, setReport] = useState(false);
  const [startBankroll, setStartBankroll] = useState(0);
  const { recordExercise } = useProgress();
  const ramp = useMemo(() => defaultRamp(config.spread), [config.spread]);
  const timer = useRef<number | undefined>(undefined);

  const start = () => {
    const g = new BlackjackGame({ rules: config.rules, virtualPlayers: config.virtualPlayers, bankroll: config.bankroll });
    setGame(g);
    setChecks([]);
    setBetChecks([]);
    setAskCount(false);
    setNextCheckAt(randInt(3, 6));
    setReport(false);
    setWarning(null);
    setStartBankroll(config.bankroll);
  };

  // Actions automatiques (joueurs virtuels, croupier), animées pas à pas.
  useEffect(() => {
    if (!game || !game.needsAutoStep) return;
    timer.current = window.setTimeout(() => {
      game.step();
      bump();
    }, config.speed);
    return () => window.clearTimeout(timer.current);
  });

  // En mode examen : vérification du compte à intervalles aléatoires, avant la mise.
  useEffect(() => {
    if (!game || config.mode !== 'exam') return;
    if (game.phase === 'roundOver' && game.round >= nextCheckAt && !askCount) setAskCount(true);
  }, [game, game?.phase, game?.round, config.mode, nextCheckAt, askCount]);

  const willShuffle = game?.shoe.needsShuffle ?? false;
  const preTc = game ? (willShuffle ? 0 : game.trueCount) : 0;
  const suggestedBet = betForTc(ramp, preTc);

  const deal = useCallback(() => {
    if (!game) return;
    if (config.mode === 'exam') setBetChecks((b) => [...b, { round: game.round + 1, tc: preTc, bet, expected: suggestedBet }]);
    game.startRound(bet);
    setWarning(null);
    bump();
  }, [game, bet, config.mode, preTc, suggestedBet]);

  const act = (a: Action) => {
    if (!game) return;
    const rec = game.recommendation();
    game.act(a);
    if (config.mode === 'training' && config.warnErrors && rec && rec.action !== a) {
      const dev = rec.deviation ? ` (déviation : ${rec.deviation.label})` : '';
      setWarning(`Erreur : il fallait ${ACTION_LABELS[rec.action].toLowerCase()}${dev}.`);
    } else setWarning(null);
    bump();
  };

  const insurance = (take: boolean) => {
    if (!game) return;
    const tc = game.trueCount;
    game.decideInsurance(take);
    const should = tc >= 3;
    if (config.mode === 'training' && config.warnErrors && take !== should) {
      setWarning(`Erreur : avec TC ${formatSigned(tc)}, il fallait ${should ? 'prendre' : 'refuser'} l'assurance (indice +3).`);
    } else setWarning(null);
    bump();
  };

  const submitCheck = () => {
    if (!game) return;
    const rcGuess = Number(rcInput.replace('−', '-'));
    const tcGuess = Number(tcInput.replace('−', '-'));
    if (!Number.isFinite(rcGuess) || !Number.isFinite(tcGuess) || rcInput === '' || tcInput === '') return;
    setChecks((c) => [...c, { round: game.round, rc: game.runningCount, rcGuess, tc: game.trueCount, tcGuess }]);
    setAskCount(false);
    setRcInput('');
    setTcInput('');
    setNextCheckAt(game.round + randInt(3, 7));
  };

  const finishExam = () => {
    if (!game) return;
    const decisions = game.decisions;
    const ok = decisions.filter((d) => d.correct).length + checks.filter((c) => c.rc === c.rcGuess).length;
    const total = decisions.length + checks.length;
    if (total > 0) recordExercise('simulator', { answered: total, correct: ok, score: Math.round((ok / total) * 100) });
    setReport(true);
  };

  /* --------------------------- Écran de configuration --------------------------- */
  if (!game) {
    const r = config.rules;
    const setRules = (patch: Partial<TableRules>) => setConfig({ ...config, rules: { ...r, ...patch } });
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader kicker="Pratique" title="Simulateur de table" subtitle="Jouez contre le croupier, avec des joueurs virtuels qui appliquent la stratégie de base et ajoutent des cartes à compter." />
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Règles de la table">
            <div className="space-y-3">
              <Segmented label="Jeux" value={r.decks} onChange={(decks) => setRules({ decks })} options={[1, 2, 4, 6, 8].map((d) => ({ value: d, label: String(d) }))} />
              <Segmented label="Croupier" value={r.dealerHitsSoft17 ? 'H17' : 'S17'} onChange={(v) => setRules({ dealerHitsSoft17: v === 'H17' })} options={[{ value: 'S17', label: 'S17' }, { value: 'H17', label: 'H17' }]} />
              <Segmented label="Blackjack" value={r.blackjackPayout} onChange={(v) => setRules({ blackjackPayout: v })} options={[{ value: 1.5, label: '3:2' }, { value: 1.2, label: '6:5' }]} />
              <Toggle label="Double après séparation (DAS)" checked={r.doubleAfterSplit} onChange={(v) => setRules({ doubleAfterSplit: v })} />
              <Toggle label="Abandon tardif" checked={r.lateSurrender} onChange={(v) => setRules({ lateSurrender: v })} />
              <label className="block text-sm text-slate-300">
                Pénétration : <strong>{Math.round(r.penetration * 100)} %</strong>
                <input type="range" min={0.5} max={0.9} step={0.05} value={r.penetration} onChange={(e) => setRules({ penetration: Number(e.target.value) })} className="block w-full accent-emerald-500" />
              </label>
              <div className="text-xs text-slate-500">Avantage de la maison (stratégie de base) ≈ {formatPct(houseEdge(r)).replace('+', '')}</div>
            </div>
          </Panel>
          <Panel title="Partie">
            <div className="space-y-3">
              <Segmented label="Joueurs virtuels" value={config.virtualPlayers} onChange={(v) => setConfig({ ...config, virtualPlayers: v })} options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))} />
              <Segmented
                label="Mode"
                value={config.mode}
                onChange={(mode) => setConfig({ ...config, mode })}
                options={[{ value: 'training', label: 'Entraînement' }, { value: 'exam', label: 'Examen' }]}
              />
              {config.mode === 'training' ? (
                <div className="space-y-2 rounded-xl bg-slate-800/50 p-3">
                  <Toggle label="Afficher le running count" checked={config.showRc} onChange={(v) => setConfig({ ...config, showRc: v })} />
                  <Toggle label="Afficher le true count" checked={config.showTc} onChange={(v) => setConfig({ ...config, showTc: v })} />
                  <Toggle label="Afficher l'action et la mise recommandées" checked={config.showAdvice} onChange={(v) => setConfig({ ...config, showAdvice: v })} />
                  <Toggle label="Signaler mes erreurs immédiatement" checked={config.warnErrors} onChange={(v) => setConfig({ ...config, warnErrors: v })} />
                </div>
              ) : (
                <p className="rounded-xl bg-slate-800/50 p-3 text-sm text-slate-300">
                  Mode examen : aucune aide affichée. À intervalles aléatoires (toutes les 3 à 7 mains), on vous demande le running count et le true count avant la mise. Vos décisions, vos mises (selon la rampe) et vos comptes sont notés ; le bilan s'affiche à la fin.
                </p>
              )}
              <Segmented label="Rampe de mise" value={config.spread} onChange={(spread) => setConfig({ ...config, spread })} options={[4, 8, 12].map((s) => ({ value: s, label: `1-${s}` }))} />
              <label className="block text-sm text-slate-300">
                Vitesse des autres joueurs et du croupier : <strong>{config.speed} ms</strong>
                <input type="range" min={100} max={1500} step={50} value={config.speed} onChange={(e) => setConfig({ ...config, speed: Number(e.target.value) })} className="block w-full accent-emerald-500" />
              </label>
              <label className="block text-sm text-slate-300">
                Bankroll de départ (unités)
                <input type="number" min={10} value={config.bankroll} onChange={(e) => setConfig({ ...config, bankroll: Math.max(10, Number(e.target.value) || 10) })} className="ml-2 w-24 rounded border border-slate-700 bg-slate-950 px-2 py-0.5" />
              </label>
            </div>
          </Panel>
        </div>
        <div className="mt-4 text-sm text-slate-400">{rulesLabel(config.rules)}</div>
        <Button variant="gold" className="mt-4 px-6 py-3 text-base" onClick={start}>
          Lancer la partie
        </Button>
      </div>
    );
  }

  /* --------------------------------- Bilan --------------------------------- */
  if (report) {
    const d = game.decisions;
    const errors = d.filter((x) => !x.correct);
    const devDecisions = d.filter((x) => x.deviationId);
    const rcOk = checks.filter((c) => c.rc === c.rcGuess).length;
    const tcOk = checks.filter((c) => c.tc === c.tcGuess).length;
    const tcClose = checks.filter((c) => Math.abs(c.tc - c.tcGuess) <= 1).length;
    const betsOk = betChecks.filter((b) => b.bet === b.expected).length;
    const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : '—');
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <PageHeader kicker="Simulateur" title="Bilan de la session" subtitle={rulesLabel(game.rules)} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Mains jouées" value={game.round} />
          <Stat label="Décisions justes" value={pct(d.length - errors.length, d.length)} hint={`${d.length - errors.length} / ${d.length}`} />
          <Stat label="Running count exact" value={pct(rcOk, checks.length)} hint={`${rcOk} / ${checks.length} vérifications`} />
          <Stat label="True count exact" value={pct(tcOk, checks.length)} hint={`à ±1 : ${pct(tcClose, checks.length)}`} />
          <Stat label="Mises conformes à la rampe" value={pct(betsOk, betChecks.length)} hint={`${betsOk} / ${betChecks.length}`} />
          <Stat label="Situations de déviation" value={devDecisions.length} hint={`${devDecisions.filter((x) => x.correct).length} réussie(s)`} />
          <Stat label="Résultat" value={`${formatSigned(game.bankroll - startBankroll, 1)} u`} hint="(peu significatif à court terme)" />
        </div>
        {checks.length > 0 && (
          <Panel title="Vérifications du compte">
            <ul className="space-y-1 text-sm tabular-nums">
              {checks.map((c, i) => (
                <li key={i} className="flex flex-wrap gap-x-4">
                  <span className="text-slate-400">Main {c.round}</span>
                  <span className={c.rc === c.rcGuess ? 'text-emerald-300' : 'text-rose-300'}>RC : {formatSigned(c.rcGuess)} (réel {formatSigned(c.rc)})</span>
                  <span className={c.tc === c.tcGuess ? 'text-emerald-300' : Math.abs(c.tc - c.tcGuess) <= 1 ? 'text-amber-300' : 'text-rose-300'}>TC : {formatSigned(c.tcGuess)} (réel {formatSigned(c.tc)})</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        <Panel title={`Erreurs de jeu (${errors.length})`}>
          {errors.length === 0 ? (
            <p className="text-sm text-emerald-300">Aucune erreur de décision. Excellent !</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {errors.map((e, i) => (
                <li key={i} className="rounded-lg bg-slate-800/50 px-3 py-2">
                  <span className="text-slate-400">Main {e.round} · TC {formatSigned(e.trueCount)} · </span>
                  <span className="text-slate-200">{e.description}</span> — vous : <span className="text-rose-300">{choiceLabel(e.taken)}</span>, correct : <span className="text-emerald-300">{choiceLabel(e.expected)}</span>
                  {e.deviationId && <Badge tone="amber">déviation {DEVIATIONS.find((x) => x.id === e.deviationId)?.label}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        {betChecks.some((b) => b.bet !== b.expected) && (
          <Panel title="Mises non conformes à la rampe">
            <ul className="space-y-1 text-sm tabular-nums">
              {betChecks.filter((b) => b.bet !== b.expected).slice(0, 30).map((b, i) => (
                <li key={i} className="text-slate-300">
                  Main {b.round} · TC {formatSigned(b.tc)} : vous avez misé {b.bet} u, la rampe indiquait {b.expected} u.
                </li>
              ))}
            </ul>
          </Panel>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={start}>Nouvelle session (mêmes réglages)</Button>
          <Button variant="secondary" onClick={() => setGame(null)}>Modifier les réglages</Button>
        </div>
      </div>
    );
  }

  /* --------------------------------- Table --------------------------------- */
  const training = config.mode === 'training';
  const rec = game.recommendation();
  const legal = game.legalActions();
  const decksLeft = game.decksRemaining;
  const tcExact = trueCount(game.runningCount, decksLeft, 'exact');
  const edge = playerEdgeAtTrueCount(preTc, houseEdge(game.rules));
  const canBet = (game.phase === 'betting' || game.phase === 'roundOver') && !askCount;
  const decided = game.decisions.length;
  const correct = game.decisions.filter((x) => x.correct).length;
  const chips = Array.from(new Set([1, 2, 4, 6, 8, 10, 12, config.spread])).filter((c) => c <= Math.max(config.spread, 12)).sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-50">Simulateur {training ? '· entraînement' : '· examen'}</h1>
          <div className="text-xs text-slate-400">{rulesLabel(game.rules)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!training && <Button variant="gold" onClick={finishExam}>Terminer l'examen et voir le bilan</Button>}
          {training && <Button variant="secondary" onClick={finishExam}>Bilan de la session</Button>}
          <Button variant="ghost" onClick={() => setGame(null)}>Réglages</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <div className="space-y-3">
          <TableView game={game} />

          {warning && <Feedback ok={false}>{warning}</Feedback>}
          {game.shuffledThisRound && game.phase !== 'roundOver' && <div className="text-sm text-amber-300">🔀 Le sabot vient d'être mélangé : le compte repart de 0.</div>}

          {/* Contrôles */}
          <Panel>
            {askCount && (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitCheck();
                }}
              >
                <div className="font-semibold text-amber-300">🧠 Vérification du compte avant la prochaine mise</div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-sm text-slate-300">
                    Running count
                    <input autoFocus value={rcInput} onChange={(e) => setRcInput(e.target.value)} inputMode="text" className="mt-1 block w-24 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-center text-xl" />
                  </label>
                  <label className="text-sm text-slate-300">
                    True count
                    <input value={tcInput} onChange={(e) => setTcInput(e.target.value)} inputMode="text" className="mt-1 block w-24 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-center text-xl" />
                  </label>
                  <Button type="submit">Valider</Button>
                </div>
                <p className="text-xs text-slate-500">Utilisez le bac de défausse pour estimer les jeux restants. Le TC attendu est arrondi à l'entier inférieur.</p>
              </form>
            )}

            {canBet && (
              <div className="space-y-3">
                {willShuffle && <div className="text-sm text-amber-300">La carte de coupe est sortie : le sabot sera mélangé avant cette main.</div>}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-300">Mise :</span>
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBet(c)}
                      className={`h-11 w-11 rounded-full border-4 border-dashed text-sm font-bold transition ${bet === c ? 'border-white bg-amber-500 text-slate-900' : 'border-amber-200/40 bg-amber-800 text-amber-100 hover:bg-amber-700'}`}
                      aria-pressed={bet === c}
                    >
                      {c}
                    </button>
                  ))}
                  <span className="text-sm text-slate-400">unité(s)</span>
                </div>
                {training && config.showAdvice && (
                  <div className="text-sm text-sky-300">
                    💡 Rampe 1-{config.spread} : à TC {formatSigned(preTc)}, misez <strong>{suggestedBet} u</strong>{' '}
                    {suggestedBet !== bet && <button className="underline" onClick={() => setBet(suggestedBet)}>(appliquer)</button>}
                  </div>
                )}
                <Button variant="gold" className="px-6 py-3 text-base" onClick={deal}>
                  Distribuer
                </Button>
              </div>
            )}

            {game.phase === 'insurance' && (
              <div className="space-y-2">
                <div className="font-semibold text-slate-100">Le croupier montre un As : assurance ?</div>
                {training && config.showAdvice && <div className="text-sm text-sky-300">💡 TC {formatSigned(game.trueCount)} : {game.trueCount >= 3 ? "prenez l'assurance (TC ≥ +3)" : "refusez (assurance seulement à TC ≥ +3)"}.</div>}
                <div className="flex gap-2">
                  <Button onClick={() => insurance(true)}>Prendre l'assurance ({game.human.hands[0].bet / 2} u)</Button>
                  <Button variant="secondary" onClick={() => insurance(false)}>Refuser</Button>
                </div>
              </div>
            )}

            {game.isHumanTurn && (
              <div className="space-y-2">
                {training && config.showAdvice && rec && (
                  <div className="text-sm text-sky-300">
                    💡 Recommandé : <strong>{ACTION_LABELS[rec.action]}</strong>
                    {rec.deviation ? ` — déviation « ${rec.deviation.label} » (stratégie de base : ${ACTION_LABELS[rec.basic].toLowerCase()})` : ''}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {(['H', 'S', 'D', 'P', 'R'] as Action[]).map((a) => (
                    <Button key={a} variant={a === 'R' ? 'ghost' : 'secondary'} disabled={!legal.includes(a)} onClick={() => act(a)} className="py-3 text-base">
                      {ACTION_LABELS[a]}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {(game.phase === 'dealer' || (game.phase === 'playing' && !game.isHumanTurn)) && <div className="text-sm text-slate-400">Les autres joueurs et le croupier jouent… comptez leurs cartes !</div>}

            {game.phase === 'roundOver' && game.round > 0 && !askCount && (
              <div className={`mt-3 text-sm ${game.lastRoundNet > 0 ? 'text-emerald-300' : game.lastRoundNet < 0 ? 'text-rose-300' : 'text-slate-300'}`}>
                Résultat de la main : {formatSigned(game.lastRoundNet, game.lastRoundNet % 1 ? 1 : 0)} u
              </div>
            )}
          </Panel>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-3">
          <Panel>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Bankroll" value={`${game.bankroll % 1 ? game.bankroll.toFixed(1).replace('.', ',') : game.bankroll} u`} />
              <Stat label="Main n°" value={game.round} />
              {training && config.showRc && <Stat label="Running count" value={formatSigned(game.runningCount)} />}
              {training && config.showTc && <Stat label="True count" value={formatSigned(game.trueCount)} hint={`exact ${formatSigned(tcExact, 2)}`} />}
              {training && config.showTc && <Stat label="Jeux restants" value={decksLeft.toFixed(1).replace('.', ',')} />}
              {training && config.showAdvice && <Stat label="Avantage estimé" value={formatPct(edge, 1)} />}
              {training && <Stat label="Décisions justes" value={decided ? `${Math.round((correct / decided) * 100)} %` : '—'} hint={`${correct}/${decided}`} />}
            </div>
          </Panel>
          <Panel title="Bac de défausse">
            <div className="flex items-center justify-center gap-3">
              <DiscardTray decks={game.shoe.cardsDealt / 52} capacity={game.rules.decks} label="Défausse" />
              <div className="text-xs text-slate-400">
                Sabot de {game.rules.decks} jeux
                <br />
                Carte de coupe à {Math.round(game.rules.penetration * 100)} %
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
