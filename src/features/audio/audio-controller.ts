export interface AudioTrack {
  loop: boolean;
  volume: number;
  currentTime: number;
  play(): void | Promise<void>;
  pause(): void;
}

export interface AudioVolumes {
  master: number;
  bgm: number;
  ambience: number;
  sfx: number;
}

export type AudioFactory = (source: string) => AudioTrack;

const fadeDurationMs = 300;
const fadeSteps = 6;

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function defaultAudioFactory(source: string): AudioTrack {
  return new Audio(source);
}

export function createAudioController(audioFactory: AudioFactory = defaultAudioFactory) {
  let volumes: AudioVolumes = { master: 1, bgm: 1, ambience: 1, sfx: 1 };
  let bgm: AudioTrack | null = null;
  let ambience: AudioTrack | null = null;

  function channelVolume(channel: keyof Omit<AudioVolumes, 'master'>): number {
    return clampVolume(volumes.master * volumes[channel]);
  }

  function createTrack(source: string): AudioTrack | null {
    try {
      return audioFactory(source);
    } catch {
      return null;
    }
  }

  async function safelyPlay(track: AudioTrack): Promise<boolean> {
    try {
      await track.play();
      return true;
    } catch {
      try {
        track.pause();
      } catch {
        // A broken media element must never interrupt the game flow.
      }
      return false;
    }
  }

  function fadeTo(track: AudioTrack, target: number, pauseAfter = false): void {
    const start = track.volume;
    for (let step = 1; step <= fadeSteps; step += 1) {
      window.setTimeout(() => {
        try {
          track.volume = start + (target - start) * (step / fadeSteps);
          if (pauseAfter && step === fadeSteps) track.pause();
        } catch {
          // Ignore media elements that become unavailable during a fade.
        }
      }, (fadeDurationMs / fadeSteps) * step);
    }
  }

  async function playLoop(
    source: string,
    channel: 'bgm' | 'ambience',
    current: AudioTrack | null,
  ): Promise<AudioTrack | null> {
    const next = createTrack(source);
    if (!next) return current;
    next.loop = true;
    next.volume = 0;
    if (!(await safelyPlay(next))) return current;
    if (current) fadeTo(current, 0, true);
    fadeTo(next, channelVolume(channel));
    return next;
  }

  return {
    setVolumes(next: AudioVolumes) {
      volumes = {
        master: clampVolume(next.master),
        bgm: clampVolume(next.bgm),
        ambience: clampVolume(next.ambience),
        sfx: clampVolume(next.sfx),
      };
      if (bgm) bgm.volume = channelVolume('bgm');
      if (ambience) ambience.volume = channelVolume('ambience');
    },
    async playBgm(source: string): Promise<void> {
      bgm = await playLoop(source, 'bgm', bgm);
    },
    async playAmbience(source: string): Promise<void> {
      ambience = await playLoop(source, 'ambience', ambience);
    },
    async playSfx(source: string): Promise<void> {
      const track = createTrack(source);
      if (!track) return;
      track.loop = false;
      track.currentTime = 0;
      track.volume = channelVolume('sfx');
      await safelyPlay(track);
    },
    stopAll(): void {
      for (const track of [bgm, ambience]) {
        if (track) fadeTo(track, 0, true);
      }
      bgm = null;
      ambience = null;
    },
  };
}
