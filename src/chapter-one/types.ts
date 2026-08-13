import type { Element } from '../domain/types'

export type ChapterActorId =
  | 'zhaoli'
  | 'yanling'
  | 'saifula'
  | 'mila'
  | 'yilan'
  | 'hanze'
  | 'luoen'
  | 'huicen'
export type ChapterPlayableActorId = Exclude<ChapterActorId, 'huicen'>
export type ChapterSpeakerId = ChapterActorId | 'narrator' | 'narration' | 'port-control' | 'harbor-voice'
export type ChapterExpression = 'neutral' | 'happy' | 'tense' | 'angry' | 'hurt' | 'soft'
export type ChapterActorPosition = 'left' | 'center' | 'right'
export type ChapterSceneId = `ch01_scene_${string}`
export type ChapterEncounterId = `ch01_b${string}`
export type StarterWeaponId =
  | 'wpn_fire_01'
  | 'wpn_water_01'
  | 'wpn_earth_01'
  | 'wpn_wind_01'
  | 'wpn_light_01'
  | 'wpn_dark_01'
export type ChapterNodeId =
  | `scene-${number}`
  | `battle-${number}-prep`
  | `battle-${number}`
  | 'chapter-complete'
  | 'milestone-complete'

export interface ChapterActorDefinition {
  id: ChapterActorId
  name: string
  age: number
  element: Element | 'variable'
  role: 'captain' | 'controller' | 'vanguard' | 'caster' | 'support' | 'healer' | 'guest' | 'npc'
  portraitAssetPrefix: string
  battleAssetId?: string
}

export interface ChapterStageActor {
  actorId: ChapterActorId
  position: ChapterActorPosition
  expression: ChapterExpression
  action?: string
}

export interface ChapterAudioCue {
  bgmId?: string
  ambienceId?: string
  sfxId?: string
}

export interface ChapterStoryLine {
  speakerId: ChapterSpeakerId
  speakerName?: string
  text: string
  actors: readonly ChapterStageActor[]
  backgroundAssetId?: string
  cgAssetId?: string
  tone?: string
  adult?: boolean
  audio?: ChapterAudioCue
}

export interface ChapterStoryScene {
  id: ChapterSceneId
  number: number
  title: string
  location: string
  viewpoint: ChapterActorId
  backgroundAssetId: string
  adult: boolean
  sourceFile: string
  lines: readonly ChapterStoryLine[]
}

export interface StarterWeaponDefinition {
  id: StarterWeaponId
  name: string
  element: Element
  summary: string
  assetId: string
}

export interface ChapterBattleActorDefinition {
  id: ChapterPlayableActorId
  name: string
  element: Element
  maxHp: number
  attack: number
  skills: readonly [
    { id: string; name: string; cooldown: number; power: number; effect?: 'break' },
    { id: string; name: string; cooldown: number; power: number; effect?: 'guard' | 'heal' | 'shield' | 'charge' | 'cleanse' },
  ]
  ougi: { name: string; power: number }
}

export interface ChapterEnemyDefinition {
  id: string
  name: string
  element: Element
  maxHp: number
  attack: number
  assetId: string
  modeGauge: number
  actions: readonly {
    id: string
    name: string
    power: number
    target: 'single' | 'all'
    telegraphed: boolean
    statusId?: string
  }[]
}

export type ChapterTutorialFocus =
  | 'basic-attack'
  | 'element'
  | 'skill'
  | 'cooldown'
  | 'ougi'
  | 'guard'

export interface ChapterEncounterDefinition {
  id: ChapterEncounterId
  number: number
  afterSceneNumber: number
  name: string
  kind: 'tutorial' | 'normal' | 'boss'
  partyMode: 'fixed' | 'selectable'
  defaultPartyIds: readonly ChapterPlayableActorId[]
  fixedPartyIds: readonly ChapterPlayableActorId[]
  enemies: readonly ChapterEnemyDefinition[]
  enemy: ChapterEnemyDefinition
  tutorialFocus: ChapterTutorialFocus | null
  tutorialSteps: readonly ['attack', 'enemy-turn', 'hp', 'victory-defeat']
}

export interface ChapterProgress {
  currentNode: ChapterNodeId
  activeSceneId: ChapterSceneId
  activeLineIndex: number
  completedScenes: ChapterSceneId[]
  completedBattles: ChapterEncounterId[]
  selectedStarterWeaponId: StarterWeaponId
}
