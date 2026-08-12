import { content } from '../content';
import { chapterOneContent } from '../chapter-one/content';
import {
  chapterBattleApCost,
  encounterForNode,
  nodeAfterBattle,
  nodeAfterScene,
  sceneForNode,
} from '../chapter-one/flow';
import type {
  ChapterPlayableActorId,
  ChapterSceneId,
  StarterWeaponId,
} from '../chapter-one/types';
import type {
  CaptainId,
  CharacterId,
  EncounterId,
  EventId,
  StageId,
  StorySceneId,
  SummonId,
  WeaponId,
} from '../domain/types';
import { relationLevelForXp } from '../features/cabin/relation';
import {
  addRewards,
  AP_MAX,
  emptyRewards,
  isStageUnlocked,
  subtractRewards,
  syncAp,
} from '../features/expedition/progression';
import { characterUpgradeCost, weaponUpgradeCost } from '../features/growth/growth';
import type { BattleState } from '../features/battle/types';
import {
  createInitialState,
  type AdultDisplayMode,
  type GameState,
  type GrowthLevel,
  type ScreenId,
  type WeaponGrid,
} from './initial-state';

export type GameAction =
  | { type: 'CONFIRM_ADULT' }
  | { type: 'SELECT_CAPTAIN'; captainId: CaptainId }
  | { type: 'COMPLETE_RECRUIT' }
  | { type: 'SET_PARTY'; party: GameState['party'] }
  | { type: 'SET_LOADOUT'; weaponGrid: WeaponGrid; summonId: SummonId }
  | { type: 'START_ENCOUNTER'; encounterId: EncounterId }
  | { type: 'FINISH_ENCOUNTER'; result: 'victory' | 'defeat'; flags: string[]; enemyHp?: number }
  | { type: 'UNLOCK_EVENT'; eventId: EventId }
  | { type: 'MARK_EVENT_VIEWED'; eventId: EventId }
  | { type: 'ADD_RELATION_XP'; characterId: CharacterId; xp: number }
  | { type: 'SET_ADULT_MODE'; mode: AdultDisplayMode }
  | { type: 'IMPORT_SAVE'; state: GameState }
  | { type: 'NAVIGATE'; screen: ScreenId }
  | { type: 'ADVANCE_CHAPTER_LINE' }
  | { type: 'RETREAT_CHAPTER_LINE' }
  | { type: 'COMPLETE_CHAPTER_SCENE' }
  | { type: 'REPLAY_CHAPTER_SCENE'; sceneId: ChapterSceneId }
  | { type: 'SELECT_STARTER_WEAPON'; weaponId: StarterWeaponId }
  | { type: 'SET_CHAPTER_PARTY'; partyIds: ChapterPlayableActorId[] }
  | { type: 'START_CHAPTER_BATTLE'; now: number }
  | { type: 'SAVE_CHAPTER_BATTLE_SNAPSHOT'; battle: BattleState }
  | { type: 'FINISH_CHAPTER_BATTLE'; result: 'victory' | 'defeat'; flags: string[]; enemyHp?: number }
  | { type: 'REPLAY_CHAPTER_BATTLE' }
  | { type: 'CONTINUE_CHAPTER' }
  | { type: 'SYNC_AP'; now: number }
  | { type: 'USE_FIELD_RATION'; now: number }
  | { type: 'SELECT_STAGE'; stageId: StageId }
  | { type: 'START_STORY'; storyId: StorySceneId; returnScreen: ScreenId }
  | { type: 'COMPLETE_STORY' }
  | { type: 'START_STAGE'; stageId: StageId; now: number }
  | { type: 'SAVE_BATTLE_SNAPSHOT'; battle: BattleState }
  | { type: 'FINISH_STAGE'; result: 'victory' | 'defeat'; flags: string[]; enemyHp?: number }
  | { type: 'UPGRADE_CHARACTER'; characterId: CharacterId }
  | { type: 'UPGRADE_WEAPON'; weaponId: WeaponId }
  | { type: 'RESET' };

function unique<T>(items: readonly T[]) {
  return [...new Set(items)];
}

function assertUniqueParty(party: GameState['party']) {
  const members = party.filter((member) => member !== null);
  if (new Set(members).size !== members.length) throw new Error('隊伍角色不可重複');
}

function assertValidLoadout(grid: WeaponGrid) {
  const weapons = [grid.main, ...grid.sub].filter((weapon) => weapon !== null);
  if (new Set(weapons).size !== weapons.length) throw new Error('武器不可重複裝備');
}

function grantVictoryRelation(state: GameState): GameState['relation'] {
  return {
    chr_01: advance(state.relation.chr_01),
    chr_02: advance(state.relation.chr_02),
    chr_03: advance(state.relation.chr_03),
    chr_04: advance(state.relation.chr_04),
  };
}

function advance(entry: GameState['relation']['chr_01']) {
  const xp = entry.xp + 40;
  return { xp, level: relationLevelForXp(xp) };
}

const chapterUnlocks: Readonly<Record<number, ChapterPlayableActorId>> = {
  4: 'mila',
  5: 'yanling',
  7: 'yilan',
  16: 'saifula',
  24: 'hanze',
};

function unlockedAfterScene(
  current: readonly ChapterPlayableActorId[],
  sceneNumber: number,
): ChapterPlayableActorId[] {
  const unlocked = chapterUnlocks[sceneNumber];
  return unlocked ? unique([...current, unlocked]) : [...current];
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CONFIRM_ADULT':
      return {
        ...state,
        adultConfirmed: true,
        screen: 'story',
        chapterOne: {
          ...state.chapterOne,
          currentNode: 'scene-1',
          activeSceneId: 'ch01_scene_01_port_bell',
          activeLineIndex: 0,
        },
      };
    case 'SELECT_CAPTAIN':
      if (!state.adultConfirmed) throw new Error('必須先完成成年確認');
      return { ...state, captainId: action.captainId, screen: 'prologue' };
    case 'COMPLETE_RECRUIT':
      return { ...state, roster: unique([...state.roster, 'chr_04']), screen: 'formation' };
    case 'SET_PARTY':
      assertUniqueParty(action.party);
      return { ...state, party: [...action.party] };
    case 'SET_LOADOUT':
      assertValidLoadout(action.weaponGrid);
      return {
        ...state,
        weaponGrid: { main: action.weaponGrid.main, sub: [...action.weaponGrid.sub] },
        summonId: action.summonId,
      };
    case 'START_ENCOUNTER':
      if (state.party.some((member) => member === null)) throw new Error('開始戰鬥前必須編滿四名角色');
      return {
        ...state,
        currentEncounterId: action.encounterId,
        lastResult: null,
        lastEnemyHp: null,
        lastStageRewards: null,
        battleSnapshot: null,
        screen: 'battle',
      };
    case 'FINISH_ENCOUNTER':
      return {
        ...state,
        lastResult: action.result,
        lastEnemyHp: action.enemyHp ?? null,
        flags: unique([...state.flags, ...action.flags]),
        relation: action.result === 'victory' ? grantVictoryRelation(state) : state.relation,
        screen: 'results',
      };
    case 'UNLOCK_EVENT':
      return { ...state, flags: unique([...state.flags, `unlocked:${action.eventId}`]) };
    case 'MARK_EVENT_VIEWED':
      return { ...state, viewedEvents: unique([...state.viewedEvents, action.eventId]) };
    case 'ADD_RELATION_XP': {
      if (!Number.isInteger(action.xp) || action.xp <= 0) throw new Error('關係經驗必須是正整數');
      const xp = state.relation[action.characterId].xp + action.xp;
      return {
        ...state,
        relation: {
          ...state.relation,
          [action.characterId]: { xp, level: relationLevelForXp(xp) },
        },
      };
    }
    case 'SET_ADULT_MODE':
      return { ...state, adultMode: action.mode };
    case 'IMPORT_SAVE':
      return action.state;
    case 'NAVIGATE':
      return { ...state, screen: action.screen };
    case 'ADVANCE_CHAPTER_LINE': {
      const scene = chapterOneContent.scenes.find((entry) => entry.id === state.chapterOne.activeSceneId);
      if (!scene) throw new Error('找不到目前的第一章場景');
      return {
        ...state,
        chapterOne: {
          ...state.chapterOne,
          activeLineIndex: Math.min(state.chapterOne.activeLineIndex + 1, scene.lines.length - 1),
        },
      };
    }
    case 'RETREAT_CHAPTER_LINE':
      return {
        ...state,
        chapterOne: {
          ...state.chapterOne,
          activeLineIndex: Math.max(0, state.chapterOne.activeLineIndex - 1),
        },
      };
    case 'COMPLETE_CHAPTER_SCENE': {
      const sceneId = state.chapterOne.activeSceneId;
      const scene = chapterOneContent.scenes.find((entry) => entry.id === sceneId);
      if (!scene) throw new Error(`找不到章節場景：${sceneId}`);
      const completedScenes = unique([...state.chapterOne.completedScenes, sceneId]);
      const currentNode = nodeAfterScene(sceneId);
      const nextScene = sceneForNode(currentNode);
      return {
        ...state,
        screen: currentNode === 'chapter-complete'
          ? 'chapter-milestone'
          : currentNode.endsWith('-prep')
            ? 'chapter-prep'
            : 'story',
        chapterOne: {
          ...state.chapterOne,
          currentNode,
          activeSceneId: nextScene?.id ?? sceneId,
          activeLineIndex: 0,
          completedScenes,
          unlockedActorIds: unlockedAfterScene(state.chapterOne.unlockedActorIds, scene.number),
        },
      };
    }
    case 'REPLAY_CHAPTER_SCENE': {
      const scene = chapterOneContent.scenes.find((entry) => entry.id === action.sceneId);
      if (!scene) throw new Error(`找不到章節場景：${action.sceneId}`);
      return {
        ...state,
        screen: 'story',
        activeStoryId: null,
        chapterOne: {
          ...state.chapterOne,
          currentNode: `scene-${scene.number}`,
          activeSceneId: action.sceneId,
          activeLineIndex: 0,
        },
      };
    }
    case 'SELECT_STARTER_WEAPON':
      return {
        ...state,
        chapterOne: { ...state.chapterOne, selectedStarterWeaponId: action.weaponId },
      };
    case 'SET_CHAPTER_PARTY': {
      if (action.partyIds[0] !== 'zhaoli') throw new Error('昭黎必須固定在第一位');
      if (new Set(action.partyIds).size !== action.partyIds.length) throw new Error('章節隊伍不可重複');
      if (action.partyIds.some((actorId) => actorId !== 'luoen'
        && !state.chapterOne.unlockedActorIds.includes(actorId))) {
        throw new Error('隊伍包含尚未解鎖的角色');
      }
      return {
        ...state,
        chapterOne: { ...state.chapterOne, selectedPartyIds: [...action.partyIds] },
      };
    }
    case 'START_CHAPTER_BATTLE': {
      const encounter = encounterForNode(state.chapterOne.currentNode);
      if (state.screen !== 'chapter-prep' || !state.chapterOne.currentNode.endsWith('-prep') || !encounter) {
        throw new Error('第一章戰鬥尚未開放');
      }
      const ap = syncAp(state.ap, action.now);
      const cost = chapterBattleApCost(encounter.id, state.chapterOne.completedBattles);
      if (ap.current < cost) throw new Error('AP 不足');
      return {
        ...state,
        screen: 'battle',
        ap: { ...ap, current: ap.current - cost },
        chapterOne: {
          ...state.chapterOne,
          currentNode: `battle-${encounter.number}`,
          activeEncounterId: encounter.id,
          paidAp: cost,
          battleSnapshot: null,
          lastResult: null,
        },
      };
    }
    case 'SAVE_CHAPTER_BATTLE_SNAPSHOT':
      if (action.battle.contentSet !== 'chapter-one'
        || action.battle.encounterId !== state.chapterOne.activeEncounterId) {
        throw new Error('戰鬥快照不屬於目前第一章遭遇');
      }
      return {
        ...state,
        chapterOne: {
          ...state.chapterOne,
          battleSnapshot: action.battle,
          tutorialStep: action.battle.result
            ? 'victory-defeat'
            : action.battle.turn > 1
              ? 'hp'
              : 'enemy-turn',
        },
      };
    case 'FINISH_CHAPTER_BATTLE': {
      if (!state.chapterOne.activeEncounterId) throw new Error('沒有進行中的第一章戰鬥');
      const encounter = chapterOneContent.encounters.find(
        (entry) => entry.id === state.chapterOne.activeEncounterId,
      );
      if (!encounter) throw new Error(`找不到章節戰鬥：${state.chapterOne.activeEncounterId}`);
      const shared = {
        ...state.chapterOne,
        battleSnapshot: null,
        lastResult: action.result,
        tutorialStep: 'victory-defeat' as const,
      };
      if (action.result === 'defeat') {
        return {
          ...state,
          screen: 'results',
          flags: unique([...state.flags, ...action.flags]),
          ap: { ...state.ap, current: Math.min(AP_MAX, state.ap.current + state.chapterOne.paidAp) },
          chapterOne: { ...shared, currentNode: `battle-${encounter.number}-prep` },
        };
      }
      return {
        ...state,
        screen: 'results',
        flags: unique([...state.flags, ...action.flags, `flag_${encounter.id}_victory`]),
        chapterOne: {
          ...shared,
          currentNode: `battle-${encounter.number}`,
          completedBattles: unique([
            ...state.chapterOne.completedBattles,
            state.chapterOne.activeEncounterId,
          ]),
        },
      };
    }
    case 'CONTINUE_CHAPTER': {
      const encounterId = state.chapterOne.activeEncounterId;
      if (!encounterId || state.chapterOne.lastResult !== 'victory') {
        throw new Error('沒有可繼續的章節勝利');
      }
      const currentNode = nodeAfterBattle(encounterId);
      const nextScene = sceneForNode(currentNode);
      if (!nextScene) throw new Error(`找不到戰鬥後場景：${encounterId}`);
      return {
        ...state,
        screen: 'story',
        chapterOne: {
          ...state.chapterOne,
          currentNode,
          activeSceneId: nextScene.id,
          activeLineIndex: 0,
          activeEncounterId: null,
          paidAp: 0,
          battleSnapshot: null,
          lastResult: null,
        },
      };
    }
    case 'REPLAY_CHAPTER_BATTLE': {
      const encounter = state.chapterOne.activeEncounterId
        ? chapterOneContent.encounters.find((entry) => entry.id === state.chapterOne.activeEncounterId)
        : encounterForNode(state.chapterOne.currentNode)
          ?? chapterOneContent.encounters.find(
            (entry) => entry.id === state.chapterOne.completedBattles.at(-1),
          );
      if (!encounter) throw new Error('找不到要重試的章節戰鬥');
      return {
        ...state,
        screen: 'chapter-prep',
        chapterOne: {
          ...state.chapterOne,
          currentNode: `battle-${encounter.number}-prep`,
          activeEncounterId: null,
          paidAp: 0,
          tutorialStep: 'attack',
          battleSnapshot: null,
          lastResult: null,
        },
      };
    }
    case 'SYNC_AP':
      return { ...state, ap: syncAp(state.ap, action.now) };
    case 'USE_FIELD_RATION': {
      const ap = syncAp(state.ap, action.now);
      if (state.inventory.fieldRation < 1) throw new Error('沒有遠征補給劑');
      if (ap.current >= AP_MAX) throw new Error('AP 已達上限');
      const current = Math.min(AP_MAX, ap.current + 15);
      return {
        ...state,
        ap: {
          current,
          lastRecoveredAt: current === AP_MAX ? action.now : ap.lastRecoveredAt,
        },
        inventory: {
          ...state.inventory,
          fieldRation: state.inventory.fieldRation - 1,
        },
      };
    }
    case 'SELECT_STAGE': {
      if (!content.stages.some((stage) => stage.id === action.stageId)) throw new Error('找不到關卡');
      return { ...state, selectedStageId: action.stageId };
    }
    case 'START_STORY': {
      if (!content.stories.some((story) => story.id === action.storyId)) throw new Error('找不到劇情');
      return {
        ...state,
        activeStoryId: action.storyId,
        storyReturnScreen: action.returnScreen,
        screen: 'story',
      };
    }
    case 'COMPLETE_STORY': {
      if (!state.activeStoryId) throw new Error('沒有進行中的劇情');
      return {
        ...state,
        viewedStories: unique([...state.viewedStories, state.activeStoryId]),
        activeStoryId: null,
        screen: state.storyReturnScreen ?? 'expedition-map',
        storyReturnScreen: null,
      };
    }
    case 'START_STAGE': {
      const stage = content.stages.find((entry) => entry.id === action.stageId);
      if (!stage) throw new Error('找不到關卡');
      if (!isStageUnlocked(stage, state.firstClears)) throw new Error('關卡尚未解鎖');
      if (state.party.some((member) => member === null)) throw new Error('開始戰鬥前必須編滿四名角色');
      if (state.activeChallenge) throw new Error('已有進行中的挑戰');
      const ap = syncAp(state.ap, action.now);
      if (ap.current < stage.apCost) throw new Error('AP 不足');
      return {
        ...state,
        ap: { ...ap, current: ap.current - stage.apCost },
        selectedStageId: stage.id,
        currentEncounterId: stage.encounterId,
        activeChallenge: {
          stageId: stage.id,
          encounterId: stage.encounterId,
          apCost: stage.apCost,
        },
        battleSnapshot: null,
        lastResult: null,
        lastEnemyHp: null,
        lastStageRewards: null,
        screen: 'battle',
      };
    }
    case 'SAVE_BATTLE_SNAPSHOT': {
      if (!state.activeChallenge) throw new Error('沒有進行中的挑戰');
      if (action.battle.encounterId !== state.activeChallenge.encounterId) throw new Error('戰鬥快照不屬於目前關卡');
      return { ...state, battleSnapshot: action.battle };
    }
    case 'FINISH_STAGE': {
      if (!state.activeChallenge) throw new Error('沒有進行中的挑戰');
      const stage = content.stages.find((entry) => entry.id === state.activeChallenge?.stageId);
      if (!stage) throw new Error('找不到進行中的關卡');
      const firstClear = !state.firstClears.includes(stage.id);

      if (action.result === 'defeat') {
        return {
          ...state,
          ap: { ...state.ap, current: Math.min(AP_MAX, state.ap.current + state.activeChallenge.apCost) },
          flags: unique([...state.flags, ...action.flags]),
          lastResult: 'defeat',
          lastEnemyHp: action.enemyHp ?? null,
          activeChallenge: null,
          battleSnapshot: null,
          lastStageRewards: {
            stageId: stage.id,
            clear: emptyRewards(),
            firstClear: emptyRewards(),
            relationXp: 0,
            refundedAp: state.activeChallenge.apCost,
            seaUnlocked: false,
          },
          screen: 'results',
        };
      }

      const firstClearRewards = firstClear ? stage.firstClearRewards : emptyRewards();
      const inventory = addRewards(addRewards(state.inventory, stage.clearRewards), firstClearRewards);
      const encounter = content.encounters.find((entry) => entry.id === stage.encounterId);
      return {
        ...state,
        inventory,
        firstClears: unique([...state.firstClears, stage.id]),
        flags: unique([
          ...state.flags,
          ...action.flags,
          ...(encounter ? [encounter.victoryFlag] : []),
        ]),
        relation: grantVictoryRelation(state),
        lastResult: 'victory',
        lastEnemyHp: action.enemyHp ?? null,
        activeChallenge: null,
        battleSnapshot: null,
        lastStageRewards: {
          stageId: stage.id,
          clear: { ...stage.clearRewards },
          firstClear: { ...firstClearRewards },
          relationXp: 40,
          refundedAp: 0,
          seaUnlocked: firstClear && stage.id === 'land_04_leyline_core',
        },
        screen: 'results',
      };
    }
    case 'UPGRADE_CHARACTER': {
      const level = state.characterLevels[action.characterId];
      const cost = characterUpgradeCost(level);
      if (!cost) throw new Error('角色已達最高等級');
      return {
        ...state,
        inventory: subtractRewards(state.inventory, cost),
        characterLevels: {
          ...state.characterLevels,
          [action.characterId]: (level + 1) as GrowthLevel,
        },
      };
    }
    case 'UPGRADE_WEAPON': {
      const level = state.weaponLevels[action.weaponId];
      const cost = weaponUpgradeCost(level);
      if (!cost) throw new Error('武器已達最高等級');
      return {
        ...state,
        inventory: subtractRewards(state.inventory, cost),
        weaponLevels: {
          ...state.weaponLevels,
          [action.weaponId]: (level + 1) as GrowthLevel,
        },
      };
    }
    case 'RESET':
      return createInitialState();
  }
}
