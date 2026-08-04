import { content, elementMultiplier } from '../../content';
import type {
  CharacterDefinition,
  CharacterId,
  EnemyActionDefinition,
  SkillDefinition,
} from '../../domain/types';
import type {
  BattleActor,
  BattleCommand,
  BattleLogEntry,
  BattleState,
  BattleStatus,
  CreateBattleInput,
  TurnResult,
} from './types';
import { effectiveCharacter } from '../growth/growth';

function findCharacter(id: string): CharacterDefinition {
  const character = content.characters.find((entry) => entry.id === id);
  if (!character) throw new Error(`找不到角色：${id}`);
  return character;
}

function livingActor(actors: readonly BattleActor[], id: string): BattleActor {
  const actor = actors.find((entry) => entry.id === id && entry.hp > 0);
  if (!actor) throw new Error(`找不到可行動目標：${id}`);
  return actor;
}

function damageAmount(
  attack: number,
  power: number,
  attacker: BattleActor['element'],
  defender: BattleActor['element'],
  randomBand: number,
): number {
  return Math.max(1, Math.round(attack * (power / 100) * elementMultiplier(attacker, defender) * randomBand));
}

function addStatus(statuses: readonly BattleStatus[], status: BattleStatus): BattleStatus[] {
  return [...statuses.filter((entry) => entry.id !== status.id), status];
}

function receiveDamage(actor: BattleActor, amount: number): BattleActor {
  const shield = actor.statuses.find((status) => status.id === 'shield');
  if (!shield) return { ...actor, hp: Math.max(0, actor.hp - amount) };

  const absorbed = Math.min(amount, shield.value);
  const remainingShield = shield.value - absorbed;
  const statuses = remainingShield > 0
    ? actor.statuses.map((status) => status.id === 'shield' ? { ...status, value: remainingShield } : status)
    : actor.statuses.filter((status) => status.id !== 'shield');
  return { ...actor, hp: Math.max(0, actor.hp - (amount - absorbed)), statuses };
}

function initialTelegraph(encounterId: CreateBattleInput['encounterId']) {
  const encounter = content.encounters.find((entry) => entry.id === encounterId);
  const action = encounter?.enemies[0]?.actions.find((entry) => entry.telegraphed);
  return action ? { name: action.name, target: action.target } : null;
}

export function createBattle(input: CreateBattleInput): BattleState {
  const encounter = content.encounters.find((entry) => entry.id === input.encounterId);
  if (!encounter) throw new Error(`找不到戰鬥：${input.encounterId}`);
  if (input.partyIds.length === 0) throw new Error('隊伍至少需要一名角色');

  const partyAttackBonus = Math.round(input.loadoutAttack / 40);
  const partyHpBonus = Math.round(input.loadoutHp / input.partyIds.length);
  const party = input.partyIds.map((id) => {
    const character = effectiveCharacter(findCharacter(id), input.characterLevels?.[id] ?? 1);
    const maxHp = character.maxHp + partyHpBonus;
    return {
      id: character.id,
      element: character.element,
      hp: maxHp,
      maxHp,
      attack: character.attack + partyAttackBonus,
      charge: 0,
      cooldowns: Object.fromEntries(character.skills.map((skill) => [skill.id, 0])),
      statuses: [],
    } satisfies BattleActor;
  });

  const enemies = encounter.enemies.map((enemy) => ({
    id: enemy.id,
    element: enemy.element,
    hp: enemy.maxHp,
    maxHp: enemy.maxHp,
    attack: enemy.attack,
    charge: 0,
    cooldowns: {},
    statuses: [],
  } satisfies BattleActor));

  return {
    encounterId: input.encounterId,
    turn: 1,
    phase: 'player-skills',
    party,
    enemies,
    bossMode: 'normal',
    modeGauge: Math.max(0, ...encounter.enemies.map((enemy) => enemy.modeGauge)),
    summonId: input.summonId,
    summonUsed: false,
    telegraph: initialTelegraph(input.encounterId),
    result: null,
    flags: [],
  };
}

function applySkillToEnemies(
  state: BattleState,
  actor: BattleActor,
  skill: SkillDefinition,
  targetId: string,
  randomBand: number,
): BattleActor[] {
  const targetIds = skill.target === 'all-enemies'
    ? new Set(state.enemies.filter((enemy) => enemy.hp > 0).map((enemy) => enemy.id))
    : new Set([livingActor(state.enemies, targetId).id]);

  return state.enemies.map((enemy) => {
    if (!targetIds.has(enemy.id)) return enemy;
    const amount = damageAmount(actor.attack, skill.power, actor.element, enemy.element, randomBand);
    const damaged = receiveDamage(enemy, amount);
    return skill.effect === 'break'
      ? { ...damaged, statuses: addStatus(damaged.statuses, { id: 'armor-break', turns: 3, value: 20 }) }
      : damaged;
  });
}

function applySkillToParty(state: BattleState, actor: BattleActor, skill: SkillDefinition): BattleActor[] {
  return state.party.map((ally) => {
    const isTarget = skill.target === 'all-allies' || skill.target === 'self' && ally.id === actor.id;
    if (!isTarget || ally.hp <= 0) return ally;
    if (skill.effect === 'heal') return { ...ally, hp: Math.min(ally.maxHp, ally.hp + skill.power) };
    if (skill.effect === 'shield') {
      return { ...ally, statuses: addStatus(ally.statuses, { id: 'shield', turns: 3, value: skill.power }) };
    }
    if (skill.effect === 'charge') return { ...ally, charge: Math.min(100, ally.charge + skill.power) };
    if (skill.effect === 'cleanse') return { ...ally, statuses: [] };
    if (skill.effect === 'guard') {
      return { ...ally, statuses: addStatus(ally.statuses, { id: 'guard', turns: 1, value: 50 }) };
    }
    return ally;
  });
}

export function useSkill(
  state: BattleState,
  actorId: CharacterId,
  skillId: string,
  targetId: string,
  randomBand = 1,
): BattleState {
  if (state.phase !== 'player-skills') throw new Error('目前無法使用技能');
  const actor = livingActor(state.party, actorId);
  const character = findCharacter(actorId);
  const skill = character.skills.find((entry) => entry.id === skillId);
  if (!skill) throw new Error(`找不到技能：${skillId}`);
  if ((actor.cooldowns[skill.id] ?? 0) > 0) throw new Error('技能仍在冷卻中');

  const party = applySkillToParty(state, actor, skill).map((ally) => ally.id === actorId
    ? { ...ally, cooldowns: { ...ally.cooldowns, [skill.id]: skill.cooldown } }
    : ally);
  const enemies = skill.target === 'enemy' || skill.target === 'all-enemies'
    ? applySkillToEnemies(state, actor, skill, targetId, randomBand)
    : state.enemies;

  return { ...state, party, enemies };
}

function updateBossMode(state: BattleState, damage: number): Pick<BattleState, 'bossMode' | 'modeGauge'> {
  const encounter = content.encounters.find((entry) => entry.id === state.encounterId);
  if (encounter?.kind !== 'boss') return { bossMode: state.bossMode, modeGauge: state.modeGauge };
  const boss = state.enemies[0];
  if (!boss) return { bossMode: state.bossMode, modeGauge: state.modeGauge };

  if (state.bossMode === 'overdrive') {
    const modeGauge = Math.max(0, state.modeGauge - Math.max(1, Math.round(damage / 100)));
    return modeGauge === 0 ? { bossMode: 'break', modeGauge } : { bossMode: 'overdrive', modeGauge };
  }
  if (state.bossMode === 'normal' && boss.hp <= boss.maxHp * 0.7) {
    const maximumGauge = encounter.enemies[0]?.modeGauge ?? 100;
    return { bossMode: 'overdrive', modeGauge: maximumGauge };
  }
  return { bossMode: state.bossMode, modeGauge: state.modeGauge };
}

function resolvePartyAttack(
  state: BattleState,
  useOugi: boolean,
  ougiActorIds: readonly CharacterId[] | undefined,
  randomBand: number,
): { party: BattleActor[]; enemies: BattleActor[]; damage: number; log: BattleLogEntry[] } {
  let enemies = state.enemies;
  let totalDamage = 0;
  let ougiCount = 0;
  const log: BattleLogEntry[] = [];

  const party = state.party.map((actor) => {
    if (actor.hp <= 0) return actor;
    const target = enemies.find((enemy) => enemy.hp > 0);
    if (!target) return actor;
    const character = findCharacter(actor.id);
    const isOugi = useOugi
      && actor.charge >= 100
      && (ougiActorIds === undefined || ougiActorIds.includes(actor.id as CharacterId));
    const power = isOugi ? character.ougi.power : 100;
    const amount = damageAmount(actor.attack, power, actor.element, target.element, randomBand);
    enemies = enemies.map((enemy) => enemy.id === target.id ? receiveDamage(enemy, amount) : enemy);
    totalDamage += amount;
    log.push({ kind: 'damage', sourceId: actor.id, targetId: target.id, amount });
    if (isOugi) {
      ougiCount += 1;
      log.push({ kind: 'ougi', actorId: actor.id, name: character.ougi.name });
      return { ...actor, charge: 0 };
    }
    return { ...actor, charge: Math.min(100, actor.charge + 25) };
  });

  if (ougiCount >= 2) log.push({ kind: 'ougi-chain', count: ougiCount });
  return { party, enemies, damage: totalDamage, log };
}

function enemyDefinition(state: BattleState, enemyId: string) {
  const encounter = content.encounters.find((entry) => entry.id === state.encounterId);
  return encounter?.enemies.find((enemy) => enemy.id === enemyId);
}

function enemyAction(state: BattleState, enemyId: string): EnemyActionDefinition | null {
  const enemy = enemyDefinition(state, enemyId);
  if (!enemy || enemy.actions.length === 0) return null;
  return enemy.actions[(state.turn - 1) % enemy.actions.length] ?? null;
}

function guardedDamage(actor: BattleActor, amount: number, commandGuard: boolean): number {
  const statusGuard = actor.statuses.find((status) => status.id === 'guard')?.value ?? 0;
  const reduction = commandGuard ? Math.max(50, statusGuard) : statusGuard;
  return Math.max(1, Math.round(amount * (1 - reduction / 100)));
}

function resolveEnemyActions(
  state: BattleState,
  party: BattleActor[],
  commandGuard: boolean,
  randomBand: number,
): { party: BattleActor[]; flags: string[]; log: BattleLogEntry[] } {
  let nextParty = party;
  let flags = state.flags;
  const log: BattleLogEntry[] = [];

  for (const enemy of state.enemies.filter((entry) => entry.hp > 0)) {
    const action = enemyAction(state, enemy.id);
    if (!action) continue;
    const targetIds = action.target === 'all'
      ? new Set(nextParty.filter((actor) => actor.hp > 0).map((actor) => actor.id))
      : new Set(nextParty.filter((actor) => actor.hp > 0).slice(0, 1).map((actor) => actor.id));

    nextParty = nextParty.map((actor) => {
      if (!targetIds.has(actor.id)) return actor;
      const raw = damageAmount(enemy.attack, action.power, enemy.element, actor.element, randomBand);
      const amount = guardedDamage(actor, raw, commandGuard);
      const damaged = receiveDamage(actor, amount);
      log.push({ kind: 'damage', sourceId: enemy.id, targetId: actor.id, amount });
      if (!action.statusId) return damaged;
      flags = flags.includes(`flag_status_${action.statusId}`)
        ? flags
        : [...flags, `flag_status_${action.statusId}`];
      log.push({ kind: 'status', sourceId: enemy.id, targetId: actor.id, statusId: action.statusId });
      return { ...damaged, statuses: addStatus(damaged.statuses, { id: action.statusId, turns: 3, value: 10 }) };
    });
  }
  return { party: nextParty, flags, log };
}

function tickParty(party: readonly BattleActor[]): BattleActor[] {
  return party.map((actor) => ({
    ...actor,
    cooldowns: Object.fromEntries(Object.entries(actor.cooldowns).map(([id, turns]) => [id, Math.max(0, turns - 1)])),
    statuses: actor.statuses
      .map((status) => ({ ...status, turns: status.turns - 1 }))
      .filter((status) => status.turns > 0),
  }));
}

function finish(
  state: BattleState,
  party: BattleActor[],
  enemies: BattleActor[],
  flags: string[],
  log: BattleLogEntry[],
): TurnResult | null {
  if (enemies.every((enemy) => enemy.hp <= 0)) {
    return { state: { ...state, party, enemies, flags, phase: 'complete', result: 'victory' }, log: [...log, { kind: 'victory' }] };
  }
  if (party.every((actor) => actor.hp <= 0)) {
    const defeatFlags = flags.includes('flag_first_defeat') ? flags : [...flags, 'flag_first_defeat'];
    return { state: { ...state, party, enemies, flags: defeatFlags, phase: 'complete', result: 'defeat' }, log: [...log, { kind: 'defeat' }] };
  }
  return null;
}

function resolveSummon(state: BattleState, randomBand: number): TurnResult {
  if (state.summonUsed || !state.summonId) throw new Error('召喚已使用或尚未裝備');
  const summon = content.summons.find((entry) => entry.id === state.summonId);
  if (!summon) throw new Error(`找不到召喚：${state.summonId}`);

  if (summon.effect === 'heal-and-shield') {
    const party = state.party.map((actor) => ({
      ...actor,
      hp: Math.min(actor.maxHp, actor.hp + summon.power),
      statuses: addStatus(actor.statuses, { id: 'shield', turns: 3, value: summon.power }),
    }));
    return { state: { ...state, party, summonUsed: true }, log: [] };
  }

  const source = state.party.find((actor) => actor.hp > 0);
  if (!source) return { state, log: [] };
  const enemies = state.enemies.map((enemy) => enemy.hp <= 0 ? enemy : receiveDamage(
    enemy,
    damageAmount(source.attack, summon.power, summon.element, enemy.element, randomBand),
  ));
  return { state: { ...state, enemies, summonUsed: true }, log: [] };
}

export function resolveTurn(state: BattleState, command: BattleCommand, randomBand = 1): TurnResult {
  if (state.result || state.phase === 'complete') throw new Error('戰鬥已結束');
  if (command.kind === 'summon') return resolveSummon(state, randomBand);

  const attack = resolvePartyAttack(state, Boolean(command.useOugi), command.ougiActorIds, randomBand);
  const mode = updateBossMode({ ...state, enemies: attack.enemies }, attack.damage);
  const modeLog: BattleLogEntry[] = mode.bossMode !== state.bossMode ? [{ kind: 'mode', mode: mode.bossMode }] : [];
  const afterAttack = { ...state, ...mode, party: attack.party, enemies: attack.enemies };
  const earlyFinish = finish(afterAttack, attack.party, attack.enemies, state.flags, [...attack.log, ...modeLog]);
  if (earlyFinish) return earlyFinish;

  const enemy = resolveEnemyActions(afterAttack, attack.party, Boolean(command.guard), randomBand);
  const party = tickParty(enemy.party);
  const ended = finish(afterAttack, party, attack.enemies, enemy.flags, [...attack.log, ...modeLog, ...enemy.log]);
  if (ended) return ended;

  const nextTurn = state.turn + 1;
  const nextAction = attack.enemies
    .filter((entry) => entry.hp > 0)
    .map((entry) => enemyDefinition(state, entry.id))
    .filter((entry) => entry !== undefined)
    .flatMap((entry) => entry.actions)[nextTurn - 1];
  const telegraph = nextAction?.telegraphed ? { name: nextAction.name, target: nextAction.target } : null;
  const telegraphLog: BattleLogEntry[] = telegraph ? [{ kind: 'telegraph', ...telegraph }] : [];

  return {
    state: {
      ...afterAttack,
      turn: nextTurn,
      phase: 'player-skills',
      party,
      flags: enemy.flags,
      telegraph,
    },
    log: [...attack.log, ...modeLog, ...enemy.log, ...telegraphLog],
  };
}
