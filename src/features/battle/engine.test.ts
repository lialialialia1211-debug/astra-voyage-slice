import { describe, expect, it } from 'vitest';
import { createBattle, resolveTurn, useSkill } from './engine';

const partyIds = ['chr_01', 'chr_02', 'chr_03', 'chr_04'] as const;

function tutorialBattle() {
  return createBattle({
    encounterId: 'enc_tutorial',
    partyIds,
    loadoutAttack: 8420,
    loadoutHp: 2180,
    summonId: 'smn_01_solar_leviathan',
  });
}

function tidalBossBattle() {
  return createBattle({
    encounterId: 'enc_tidal_boss',
    partyIds,
    loadoutAttack: 8420,
    loadoutHp: 2180,
    summonId: 'smn_01_solar_leviathan',
  });
}

describe('battle engine', () => {
  it('applies elemental advantage and starts skill cooldown', () => {
    const battle = tutorialBattle();
    const next = useSkill(battle, 'chr_01', 'armor-break', 'enm_01_port_raider');

    expect(next.enemies[0]?.hp).toBeLessThan(battle.enemies[0]?.hp ?? 0);
    expect(next.party[0]?.cooldowns['armor-break']).toBe(4);
    expect(battle.party[0]?.cooldowns['armor-break']).toBe(0);
  });

  it('moves the boss from overdrive to break', () => {
    const battle = {
      ...tidalBossBattle(),
      bossMode: 'overdrive' as const,
      modeGauge: 10,
    };

    const result = resolveTurn(battle, { kind: 'attack' }, 1);

    expect(result.state.bossMode).toBe('break');
  });

  it('creates a four-character ougi chain', () => {
    const base = tidalBossBattle();
    const battle = {
      ...base,
      party: base.party.map((actor) => ({ ...actor, charge: 100 })),
    };

    const result = resolveTurn(battle, { kind: 'attack', useOugi: true }, 1);

    expect(result.log).toContainEqual(expect.objectContaining({ kind: 'ougi-chain', count: 4 }));
    expect(result.state.party.every((actor) => actor.charge === 0)).toBe(true);
  });
});
