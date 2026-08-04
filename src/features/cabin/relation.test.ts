import { describe, expect, it } from 'vitest';
import { content } from '../../content';
import { createInitialState } from '../../game/initial-state';
import { eventConditionLabel, isEventUnlocked, relationLevelForXp } from './relation';

describe('relation progression', () => {
  it.each([[0, 1], [40, 2], [100, 3], [220, 4]] as const)('maps %s XP to level %s', (xp, level) => {
    expect(relationLevelForXp(xp)).toBe(level);
  });

  it('requires level three and boss victory for the main event', () => {
    const initial = createInitialState();
    const event = content.events.find((entry) => entry.id === 'evt_chr02_bond03')!;
    const locked = {
      ...initial,
      relation: { ...initial.relation, chr_02: { xp: 100, level: 3 as const } },
    };
    const unlocked = { ...locked, flags: ['flag_tidal_boss_victory'] };

    expect(isEventUnlocked(event, locked)).toBe(false);
    expect(isEventUnlocked(event, unlocked)).toBe(true);
  });

  it('honors an explicit QA unlock without changing progression', () => {
    const initial = createInitialState();
    const event = content.events.find((entry) => entry.id === 'evt_chr02_status')!;
    const overridden = { ...initial, flags: [`unlocked:${event.id}`] };

    expect(overridden.relation.chr_02).toEqual(initial.relation.chr_02);
    expect(isEventUnlocked(event, overridden)).toBe(true);
    expect(eventConditionLabel(event, overridden)).toBe('QA 已解鎖');
  });
});
