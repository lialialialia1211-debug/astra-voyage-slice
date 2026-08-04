import type {
  CharacterId,
  Element,
  EncounterId,
  SummonId,
} from '../../domain/types';

export interface BattleStatus {
  id: string;
  turns: number;
  value: number;
}

export interface BattleActor {
  id: string;
  element: Element;
  hp: number;
  maxHp: number;
  attack: number;
  charge: number;
  cooldowns: Record<string, number>;
  statuses: BattleStatus[];
}

export interface BattleState {
  encounterId: EncounterId;
  turn: number;
  phase: 'player-skills' | 'player-attack' | 'enemy' | 'complete';
  party: BattleActor[];
  enemies: BattleActor[];
  bossMode: 'normal' | 'overdrive' | 'break';
  modeGauge: number;
  summonId: SummonId | null;
  summonUsed: boolean;
  telegraph: { name: string; target: 'single' | 'all' } | null;
  result: 'victory' | 'defeat' | null;
  flags: string[];
}

export interface CreateBattleInput {
  encounterId: EncounterId;
  partyIds: readonly CharacterId[];
  loadoutAttack: number;
  loadoutHp: number;
  summonId: SummonId | null;
  characterLevels?: Partial<Record<CharacterId, number>> | undefined;
}

export type BattleCommand =
  | { kind: 'attack'; useOugi?: boolean; ougiActorIds?: readonly CharacterId[]; guard?: boolean }
  | { kind: 'summon' };

export type BattleLogEntry =
  | { kind: 'damage'; sourceId: string; targetId: string; amount: number }
  | { kind: 'heal'; sourceId: string; targetId: string; amount: number }
  | { kind: 'status'; sourceId: string; targetId: string; statusId: string }
  | { kind: 'ougi'; actorId: string; name: string }
  | { kind: 'ougi-chain'; count: number }
  | { kind: 'mode'; mode: BattleState['bossMode'] }
  | { kind: 'telegraph'; name: string; target: 'single' | 'all' }
  | { kind: 'victory' }
  | { kind: 'defeat' };

export interface TurnResult {
  state: BattleState;
  log: BattleLogEntry[];
}
