import React from 'react';
import {AbsoluteFill, Sequence, Series} from 'remotion';
import {SoundTrack, type SfxCue} from './components/SoundTrack';
import {Wipe} from './components/Wipe';
import {Scene1Accroche} from './scenes/Scene1Accroche';
import {Scene2Reponse} from './scenes/Scene2Reponse';
import {Scene3Solutions} from './scenes/Scene3Solutions';
import {Scene4Entreprises} from './scenes/Scene4Entreprises';
import {Scene5Signature} from './scenes/Scene5Signature';
import {colors} from './theme';
import {CARD_DURATION, HALF_TRANSITION, TRANSITION, scenes} from './timings';

// Début de chaque scène (en images)
const order = [scenes.accroche, scenes.reponse, scenes.solutions, scenes.entreprises, scenes.signature];
const starts = order.map((_, i) => order.slice(0, i).reduce((a, b) => a + b, 0));
const boundaries = starts.slice(1);

// Effets sonores calés sur les transitions et les temps forts
const cues: SfxCue[] = [
  ...boundaries.map((b) => ({at: b - HALF_TRANSITION, name: 'whoosh' as const})),
  {at: starts[1] + 6, name: 'pop'}, // logo blanc
  ...[1, 2, 3].map((k) => ({at: starts[2] + k * CARD_DURATION - 4, name: 'pop' as const, volume: 0.4})),
  {at: starts[3] + 44, name: 'pop'}, // maison reliée
  {at: starts[4] + 12, name: 'reveal'}, // logo final
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{background: colors.blanc}}>
    <Series>
      <Series.Sequence durationInFrames={scenes.accroche} name="Scene1Accroche">
        <Scene1Accroche />
      </Series.Sequence>
      <Series.Sequence durationInFrames={scenes.reponse} name="Scene2Reponse">
        <Scene2Reponse />
      </Series.Sequence>
      <Series.Sequence durationInFrames={scenes.solutions} name="Scene3Solutions">
        <Scene3Solutions />
      </Series.Sequence>
      <Series.Sequence durationInFrames={scenes.entreprises} name="Scene4Entreprises">
        <Scene4Entreprises />
      </Series.Sequence>
      <Series.Sequence durationInFrames={scenes.signature} name="Scene5Signature">
        <Scene5Signature />
      </Series.Sequence>
    </Series>
    {boundaries.map((b) => (
      <Sequence key={b} from={b - HALF_TRANSITION} durationInFrames={TRANSITION} name="Wipe">
        <Wipe />
      </Sequence>
    ))}
    <SoundTrack cues={cues} />
  </AbsoluteFill>
);
