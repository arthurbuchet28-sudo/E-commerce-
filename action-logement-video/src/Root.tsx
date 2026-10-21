import React from 'react';
import {Composition, Folder} from 'remotion';
import {loadFonts} from './fonts';
import {Main} from './Main';
import {Scene1Accroche} from './scenes/Scene1Accroche';
import {Scene2Reponse} from './scenes/Scene2Reponse';
import {Scene3Solutions} from './scenes/Scene3Solutions';
import {Scene4Entreprises} from './scenes/Scene4Entreprises';
import {Scene5Signature} from './scenes/Scene5Signature';
import {FPS, TOTAL_FRAMES, scenes} from './timings';

loadFonts();

const formats = [
  {id: '16x9', width: 1920, height: 1080},
  {id: '9x16', width: 1080, height: 1920},
] as const;

const sceneList = [
  {id: 'Scene1Accroche', component: Scene1Accroche, duration: scenes.accroche},
  {id: 'Scene2Reponse', component: Scene2Reponse, duration: scenes.reponse},
  {id: 'Scene3Solutions', component: Scene3Solutions, duration: scenes.solutions},
  {id: 'Scene4Entreprises', component: Scene4Entreprises, duration: scenes.entreprises},
  {id: 'Scene5Signature', component: Scene5Signature, duration: scenes.signature},
];

export const RemotionRoot: React.FC = () => (
  <>
    {formats.map((f) => (
      <Composition
        key={f.id}
        id={`ActionLogement-${f.id}`}
        component={Main}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={f.width}
        height={f.height}
      />
    ))}
    {formats.map((f) => (
      <Folder key={f.id} name={`Scenes-${f.id}`}>
        {sceneList.map((s) => (
          <Composition
            key={s.id}
            id={`${s.id}-${f.id}`}
            component={s.component}
            durationInFrames={s.duration}
            fps={FPS}
            width={f.width}
            height={f.height}
          />
        ))}
      </Folder>
    ))}
  </>
);
