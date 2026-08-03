import type { CaptainId, EncounterId, EventId, SummonId } from '../domain/types';
import { createInitialState, type AdultDisplayMode, type GameState, type ScreenId, type WeaponGrid } from './initial-state';

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
  | { type: 'SET_ADULT_MODE'; mode: AdultDisplayMode }
  | { type: 'NAVIGATE'; screen: ScreenId }
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

function relationLevelForXp(xp: number): 1 | 2 | 3 | 4 {
  if (xp >= 220) return 4;
  if (xp >= 100) return 3;
  if (xp >= 40) return 2;
  return 1;
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
      return { ...state, currentEncounterId: action.encounterId, lastResult: null, lastEnemyHp: null, screen: 'battle' };
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
    case 'SET_ADULT_MODE':
      return { ...state, adultMode: action.mode };
    case 'NAVIGATE':
      return { ...state, screen: action.screen };
    case 'RESET':
      return createInitialState();
  }
}
