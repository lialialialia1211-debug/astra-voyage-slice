import { createAudioController } from './audio-controller';

it('keeps missing audio silent', async () => {
  const controller = createAudioController(() => {
    throw new Error('missing');
  });

  await expect(controller.playBgm('/missing.ogg')).resolves.toBeUndefined();
  await expect(controller.playAmbience('/missing.ogg')).resolves.toBeUndefined();
  await expect(controller.playSfx('/missing.ogg')).resolves.toBeUndefined();
});

it('combines master and channel volume for sound effects', async () => {
  const audio = {
    loop: false,
    volume: 0,
    currentTime: 0,
    play: () => Promise.resolve(),
    pause: () => undefined,
  };
  const controller = createAudioController(() => audio);
  controller.setVolumes({ master: 0.5, bgm: 1, ambience: 1, sfx: 0.4 });

  await controller.playSfx('/ready.ogg');

  expect(audio.volume).toBe(0.2);
});
