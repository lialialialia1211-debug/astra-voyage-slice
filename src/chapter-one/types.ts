import type { Element } from '../domain/types';

export type ChapterActorId = 'zhaoli' | 'yanling' | 'luoen';
export type ChapterSpeakerId = ChapterActorId | 'narration' | 'port-control' | 'harbor-voice';
export type ChapterExpression = 'neutral' | 'happy' | 'tense' | 'angry' | 'hurt' | 'soft';
export type ChapterActorPosition = 'left' | 'center' | 'right';
export type ChapterSceneId = 'ch01_scene_01_port_bell' | 'ch01_scene_02_black_ship';
export type ChapterEncounterId = 'ch01_b01_outer_bay_rescue';
export type StarterWeaponId =
  | 'wpn_fire_01'
  | 'wpn_water_01'
  | 'wpn_earth_01'
  | 'wpn_wind_01'
  | 'wpn_light_01'
  | 'wpn_dark_01';
export type ChapterNodeId =
  | 'scene-1'
  | 'scene-2'
  | 'battle-1-prep'
  | 'battle-1'
  | 'milestone-complete';

export interface ChapterActorDefinition {
  id: ChapterActorId;
  name: string;
  age: number;
  element: Element | 'variable';
  role: 'captain' | 'controller' | 'vanguard';
  portraitAssetPrefix: string;
  battleAssetId: string;
}

export interface ChapterStageActor {
  actorId: ChapterActorId;
  position: ChapterActorPosition;
  expression: ChapterExpression;
}

export interface ChapterAudioCue {
  bgmId?: string;
  ambienceId?: string;
  sfxId?: string;
}

export interface ChapterStoryLine {
  speakerId: ChapterSpeakerId;
  speakerName?: string;
  text: string;
  actors: readonly ChapterStageActor[];
  backgroundAssetId?: string;
  cgAssetId?: string;
  tone?: 'dawn' | 'neutral' | 'warning' | 'black-tide';
  audio?: ChapterAudioCue;
}

export interface ChapterStoryScene {
  id: ChapterSceneId;
  number: 1 | 2;
  title: string;
  location: string;
  viewpoint: ChapterActorId;
  backgroundAssetId: string;
  lines: readonly ChapterStoryLine[];
}

export interface StarterWeaponDefinition {
  id: StarterWeaponId;
  name: string;
  element: Element;
  summary: string;
  assetId: string;
}

export interface ChapterBattleActorDefinition {
  id: ChapterActorId;
  name: string;
  element: Element;
  maxHp: number;
  attack: number;
  skills: readonly [
    { id: string; name: string; cooldown: number; power: number },
    { id: string; name: string; cooldown: number; power: number },
  ];
  ougi: { name: string; power: number };
}

export interface ChapterEncounterDefinition {
  id: ChapterEncounterId;
  name: string;
  kind: 'tutorial';
  fixedPartyIds: readonly ChapterActorId[];
  enemy: {
    id: string;
    name: string;
    element: Element;
    maxHp: number;
    attack: number;
    assetId: string;
  };
  tutorialSteps: readonly ['attack', 'enemy-turn', 'hp', 'victory-defeat'];
}

export interface ChapterProgress {
  currentNode: ChapterNodeId;
  activeSceneId: ChapterSceneId;
  activeLineIndex: number;
  completedScenes: ChapterSceneId[];
  completedBattles: ChapterEncounterId[];
  selectedStarterWeaponId: StarterWeaponId;
}
