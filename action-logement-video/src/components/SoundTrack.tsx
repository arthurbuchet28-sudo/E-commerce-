import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {assetsManifest} from '../assetsManifest';
import {MUSIC_FADE_IN, MUSIC_FADE_OUT, MUSIC_VOLUME} from '../timings';

export type SfxCue = {at: number; name: keyof typeof assetsManifest.sfx; volume?: number};

// Musique (assets/audio/music.mp3) + effets (assets/sfx/*.mp3).
// Chaque fichier n'est joué que s'il a été déposé : sans lui, rien ne casse.
export const SoundTrack: React.FC<{cues: SfxCue[]}> = ({cues}) => {
  const {durationInFrames} = useVideoConfig();
  return (
    <>
      {assetsManifest.music && (
        <Audio
          src={staticFile('audio/music.mp3')}
          volume={(f) =>
            interpolate(
              f,
              [0, MUSIC_FADE_IN, durationInFrames - MUSIC_FADE_OUT, durationInFrames],
              [0, MUSIC_VOLUME, MUSIC_VOLUME, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
            )
          }
        />
      )}
      {cues
        .filter((c) => assetsManifest.sfx[c.name])
        .map((c, i) => (
          <Sequence key={i} from={Math.max(0, c.at)} layout="none">
            <Audio src={staticFile(`sfx/${c.name}.mp3`)} volume={c.volume ?? 0.6} />
          </Sequence>
        ))}
    </>
  );
};
