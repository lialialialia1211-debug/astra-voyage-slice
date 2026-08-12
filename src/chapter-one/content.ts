import generatedScenes from '../generated/chapter-one-scenes.json'
import type {
  ChapterActorDefinition,
  ChapterActorId,
  ChapterActorPosition,
  ChapterBattleActorDefinition,
  ChapterEncounterDefinition,
  ChapterEnemyDefinition,
  ChapterExpression,
  ChapterPlayableActorId,
  ChapterStoryScene,
  StarterWeaponDefinition,
} from './types'

const actors = [
  { id: 'zhaoli', name: '昭黎', age: 22, element: 'variable', role: 'captain', portraitAssetPrefix: 'chr_zhaoli_story', battleAssetId: 'chr_zhaoli_battle_idle' },
  { id: 'yanling', name: '晏泠', age: 24, element: 'wind', role: 'controller', portraitAssetPrefix: 'chr_yanling_story', battleAssetId: 'chr_yanling_battle_idle' },
  { id: 'saifula', name: '賽芙拉', age: 27, element: 'dark', role: 'caster', portraitAssetPrefix: 'chr_saifula_story', battleAssetId: 'chr_saifula_battle_idle' },
  { id: 'mila', name: '彌菈', age: 25, element: 'light', role: 'healer', portraitAssetPrefix: 'chr_mila_story', battleAssetId: 'chr_mila_battle_idle' },
  { id: 'yilan', name: '伊蘭', age: 23, element: 'earth', role: 'support', portraitAssetPrefix: 'chr_yilan_story', battleAssetId: 'chr_yilan_battle_idle' },
  { id: 'hanze', name: '韓則', age: 29, element: 'fire', role: 'vanguard', portraitAssetPrefix: 'chr_hanze_story', battleAssetId: 'chr_hanze_battle_idle' },
  { id: 'luoen', name: '洛恩', age: 46, element: 'water', role: 'guest', portraitAssetPrefix: 'chr_luoen_story', battleAssetId: 'chr_luoen_battle_idle' },
  { id: 'huicen', name: '惠岑', age: 38, element: 'light', role: 'npc', portraitAssetPrefix: 'chr_huicen_story' },
] as const satisfies readonly ChapterActorDefinition[]

const viewpointIds: Readonly<Record<string, ChapterActorId>> = {
  昭黎: 'zhaoli',
  晏泠: 'yanling',
  賽芙拉: 'saifula',
  彌菈: 'mila',
  伊蘭: 'yilan',
  韓則: 'hanze',
  洛恩: 'luoen',
  惠岑: 'huicen',
}

function stagePositions(count: number): readonly ChapterActorPosition[] {
  if (count <= 1) return ['center']
  if (count === 2) return ['left', 'right']
  return ['left', 'center', 'right']
}

const scenes: readonly ChapterStoryScene[] = generatedScenes.map((scene) => ({
  id: scene.id,
  number: scene.number,
  title: scene.title,
  location: scene.location,
  viewpoint: viewpointIds[scene.viewpoint] ?? 'zhaoli',
  backgroundAssetId: scene.backgroundAssetId,
  adult: scene.adult,
  sourceFile: scene.sourceFile,
  lines: scene.lines.map((line) => {
    const positions = stagePositions(line.actors.length)
    return {
      speakerId: 'narrator' as const,
      speakerName: line.speakerName,
      text: line.text,
      actors: line.actors.slice(0, 3).map((actorId, index) => ({
        actorId: actorId as ChapterActorId,
        position: positions[index] ?? 'center',
        expression: 'neutral' as ChapterExpression,
      })),
      backgroundAssetId: line.backgroundAssetId,
      ...('cgAssetId' in line ? { cgAssetId: line.cgAssetId } : {}),
      tone: line.tone,
      adult: line.adult,
    }
  }),
}))

const starterWeapons = [
  { id: 'wpn_fire_01', name: '赤燼長刃', element: 'fire', summary: '以灼熱斬擊切開阻礙。', assetId: 'wpn_fire_01' },
  { id: 'wpn_water_01', name: '潮痕劍', element: 'water', summary: '穩定攻防節奏的標準主武器。', assetId: 'wpn_water_01' },
  { id: 'wpn_earth_01', name: '岩脈重鋒', element: 'earth', summary: '以厚重衝擊守住航線。', assetId: 'wpn_earth_01' },
  { id: 'wpn_wind_01', name: '迅風雙刃', element: 'wind', summary: '用高速連擊掌握先機。', assetId: 'wpn_wind_01' },
  { id: 'wpn_light_01', name: '晨星儀劍', element: 'light', summary: '聚焦光能擊穿黑潮。', assetId: 'wpn_light_01' },
  { id: 'wpn_dark_01', name: '夜潮曲刃', element: 'dark', summary: '借深海共鳴壓制敵人。', assetId: 'wpn_dark_01' },
] as const satisfies readonly StarterWeaponDefinition[]

const battleActors = [
  { id: 'zhaoli', name: '昭黎', element: 'water', maxHp: 1380, attack: 380, skills: [{ id: 'course-correction', name: '航向修正', cooldown: 4, power: 150, effect: 'break' }, { id: 'shared-stop-line', name: '共同停止線', cooldown: 5, power: 0, effect: 'guard' }], ougi: { name: '最後一盞燈外', power: 520 } },
  { id: 'yanling', name: '晏泠', element: 'wind', maxHp: 1260, attack: 405, skills: [{ id: 'anchor-vector', name: '應答向量', cooldown: 4, power: 165, effect: 'break' }, { id: 'control-screen', name: '管制幕', cooldown: 5, power: 0, effect: 'guard' }], ougi: { name: '四十七次呼吸', power: 540 } },
  { id: 'saifula', name: '賽芙拉', element: 'dark', maxHp: 1190, attack: 430, skills: [{ id: 'black-signal', name: '黑訊回波', cooldown: 4, power: 175, effect: 'break' }, { id: 'seventh-log', name: '第七份紀錄', cooldown: 5, power: 0, effect: 'charge' }], ougi: { name: '仍然可以離開', power: 560 } },
  { id: 'mila', name: '彌菈', element: 'light', maxHp: 1320, attack: 345, skills: [{ id: 'sterile-cut', name: '無菌切斷', cooldown: 4, power: 145, effect: 'break' }, { id: 'triage-line', name: '檢傷線', cooldown: 5, power: 260, effect: 'heal' }], ougi: { name: '不停下的理由', power: 500 } },
  { id: 'yilan', name: '伊蘭', element: 'earth', maxHp: 1450, attack: 350, skills: [{ id: 'evidence-lock', name: '證物鎖定', cooldown: 4, power: 150, effect: 'break' }, { id: 'route-shield', name: '航路護盾', cooldown: 5, power: 220, effect: 'shield' }], ougi: { name: '第二顆心', power: 510 } },
  { id: 'hanze', name: '韓則', element: 'fire', maxHp: 1510, attack: 390, skills: [{ id: 'shipyard-breach', name: '船塢突破', cooldown: 4, power: 160, effect: 'break' }, { id: 'watch-relay', name: '輪值接替', cooldown: 5, power: 0, effect: 'guard' }], ougi: { name: '無旗之船', power: 530 } },
  { id: 'luoen', name: '洛恩', element: 'water', maxHp: 1620, attack: 330, skills: [{ id: 'towline-lock', name: '拖纜鎖定', cooldown: 4, power: 145, effect: 'break' }, { id: 'relief-watch', name: '換班守望', cooldown: 5, power: 0, effect: 'guard' }], ougi: { name: '外灣救援', power: 480 } },
] as const satisfies readonly ChapterBattleActorDefinition[]

const commonTutorialSteps = ['attack', 'enemy-turn', 'hp', 'victory-defeat'] as const

function enemy(
  id: string,
  name: string,
  element: ChapterEnemyDefinition['element'],
  maxHp: number,
  attack: number,
  assetId = id,
  boss = false,
): ChapterEnemyDefinition {
  return {
    id,
    name,
    element,
    maxHp,
    attack,
    assetId,
    modeGauge: boss ? 100 : 0,
    actions: [{
      id: `${id}-strike`,
      name: boss ? '深潮壓境' : '航路衝擊',
      power: boss ? 125 : 100,
      target: boss ? 'all' : 'single',
      telegraphed: boss,
    }],
  }
}

function encounter(
  number: number,
  id: ChapterEncounterDefinition['id'],
  afterSceneNumber: number,
  name: string,
  kind: ChapterEncounterDefinition['kind'],
  defaultPartyIds: readonly ChapterPlayableActorId[],
  enemies: readonly ChapterEnemyDefinition[],
  tutorialFocus: ChapterEncounterDefinition['tutorialFocus'],
): ChapterEncounterDefinition {
  return {
    id,
    number,
    afterSceneNumber,
    name,
    kind,
    partyMode: number === 1 ? 'fixed' : 'selectable',
    defaultPartyIds,
    fixedPartyIds: defaultPartyIds,
    enemies,
    enemy: enemies[0]!,
    tutorialFocus,
    tutorialSteps: commonTutorialSteps,
  }
}

const encounters = [
  encounter(1, 'ch01_b01_outer_bay_rescue', 2, '外灣救援', 'tutorial', ['zhaoli', 'luoen'], [enemy('enemy_rescue_wreckage', '漂流殘骸群', 'wind', 2600, 145)], 'basic-attack'),
  encounter(2, 'ch01_b02_first_answering_anchor', 5, '第一次應答錨', 'boss', ['zhaoli', 'yanling', 'mila', 'luoen'], [enemy('boss_first_anchor_core', '第一應答錨核心', 'dark', 5200, 180, 'boss_first_anchor_core', true)], 'element'),
  encounter(3, 'ch01_b03_signal_in_the_drain', 8, '排水渠訊號攔截', 'normal', ['zhaoli', 'yanling', 'mila', 'yilan'], [enemy('enemy_signal_interceptor', '訊號攔截體', 'water', 4100, 175)], 'skill'),
  encounter(4, 'ch01_b04_forty_seven_breaths', 10, '四十七次呼吸', 'normal', ['zhaoli', 'yanling', 'mila', 'yilan'], [enemy('enemy_anchor_echo', '應答錨回聲', 'dark', 4600, 185)], 'cooldown'),
  encounter(5, 'ch01_b05_old_messages_as_evidence', 12, '舊訊息證物戰', 'normal', ['zhaoli', 'yanling', 'mila', 'yilan'], [enemy('enemy_signal_interceptor', '訊號攔截體', 'water', 3100, 170), enemy('enemy_old_port_raider', '舊港襲擊者', 'fire', 3300, 180)], 'ougi'),
  encounter(6, 'ch01_b06_old_port_ambush', 13, '舊港伏擊', 'boss', ['zhaoli', 'yanling', 'mila', 'yilan'], [enemy('boss_old_port_commander', '舊港指揮官', 'earth', 7200, 215, 'boss_old_port_commander', true)], 'guard'),
  encounter(7, 'ch01_b07_seventh_log', 16, '第七份紀錄', 'normal', ['zhaoli', 'saifula', 'yanling', 'yilan'], [enemy('enemy_north_route_predator', '北線掠食體', 'wind', 6500, 215)], null),
  encounter(8, 'ch01_b08_signal_she_kept', 17, '她留下的訊號', 'normal', ['zhaoli', 'saifula', 'mila', 'yilan'], [enemy('enemy_white_cliff_echo', '白崖回聲', 'light', 6900, 225)], null),
  encounter(9, 'ch01_b09_price_of_silence', 19, '沉默的代價', 'boss', ['zhaoli', 'saifula', 'yanling', 'mila'], [enemy('boss_black_tide_core', '黑潮核心', 'dark', 9800, 255, 'boss_black_tide_core', true)], null),
  encounter(10, 'ch01_b10_three_ways_to_save_him', 23, '三種救援方案', 'normal', ['zhaoli', 'yanling', 'mila', 'saifula'], [enemy('enemy_shipyard_security', '船塢保全機', 'earth', 7600, 245)], null),
  encounter(11, 'ch01_b11_ship_without_a_flag', 24, '無旗之船', 'boss', ['zhaoli', 'hanze', 'yanling', 'mila'], [enemy('boss_unflagged_ship', '無旗艦', 'water', 11200, 275, 'boss_unflagged_ship', true)], null),
  encounter(12, 'ch01_b12_three_dark_anchors', 26, '三座暗錨', 'normal', ['zhaoli', 'yanling', 'saifula', 'mila'], [enemy('enemy_black_tide_spawn', '黑潮孳生體', 'dark', 5200, 245), enemy('enemy_unflagged_boarder', '無旗登艦者', 'fire', 5000, 250)], null),
  encounter(13, 'ch01_b13_route_everyone_can_stop', 27, '所有人都能停下的航路', 'normal', ['zhaoli', 'yanling', 'saifula', 'yilan'], [enemy('enemy_navigation_illusion', '航路幻象', 'light', 10800, 265)], null),
  encounter(14, 'ch01_b14_beyond_last_light', 28, '最後一盞燈外', 'normal', ['zhaoli', 'yanling', 'saifula', 'mila'], [enemy('enemy_navigation_illusion', '深海航路幻象', 'dark', 11600, 280)], null),
  encounter(15, 'ch01_b15_question_for_deep_ocean', 29, '向深海提問', 'boss', ['zhaoli', 'yanling', 'saifula', 'mila'], [enemy('boss_tide_watcher', '望潮者', 'dark', 14800, 310, 'boss_tide_watcher', true)], null),
] as const satisfies readonly ChapterEncounterDefinition[]

export const chapterOneContent = Object.freeze({
  actors,
  battleActors,
  scenes,
  starterWeapons,
  encounters,
})
