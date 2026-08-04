import type { EventDefinition } from '../../domain/types';
import type { GameState } from '../../game/initial-state';

export function relationLevelForXp(xp: number): 1 | 2 | 3 | 4 {
  if (xp >= 220) return 4;
  if (xp >= 100) return 3;
  if (xp >= 40) return 2;
  return 1;
}

export function nextRelationTarget(level: 1 | 2 | 3 | 4): number | null {
  if (level === 1) return 40;
  if (level === 2) return 100;
  if (level === 3) return 220;
  return null;
}

export function isEventUnlocked(event: EventDefinition, state: GameState): boolean {
  if (state.flags.includes(`unlocked:${event.id}`)) return true;
  return event.requiredFlags.every((flag) => state.flags.includes(flag))
    && state.relation[event.characterId].level >= event.requiredRelationLevel;
}

const flagLabels: Readonly<Record<string, string>> = {
  flag_tidal_boss_victory: '擊破潮汐守望者',
  flag_status_depth_corrosion: '遭遇深潮侵蝕狀態',
  flag_first_defeat: '記錄首次敗北',
};

export function eventConditionLabel(event: EventDefinition, state: GameState): string {
  if (state.flags.includes(`unlocked:${event.id}`)) return 'QA 已解鎖';
  const requirements = [`${event.characterId.toUpperCase()} 關係 Lv.${event.requiredRelationLevel}`];
  requirements.push(...event.requiredFlags.map((flag) => flagLabels[flag] ?? flag));
  if (isEventUnlocked(event, state)) return '已符合：' + requirements.join('＋');
  return '解鎖條件：' + requirements.join('＋');
}
