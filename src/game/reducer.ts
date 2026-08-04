import { content } from '../content';
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

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CONFIRM_ADULT':
      return { ...state, adultConfirmed: true, screen: 'captain-select' };
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
