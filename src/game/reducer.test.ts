import { createInitialState, type GameState } from './initial-state';
import { gameReducer, type GameAction } from './reducer';

function expeditionReady(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(0),
    adultConfirmed: true,
    captainId: 'cap_f' as const,
    roster: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    party: ['chr_01', 'chr_02', 'chr_03', 'chr_04'],
    ...overrides,
  };
}

it('moves confirmed adults directly to the first canonical scene', () => {
  const state = gameReducer(createInitialState(), { type: 'CONFIRM_ADULT' });

  expect(state.adultConfirmed).toBe(true);
  expect(state).toMatchObject({
    version: 5,
    screen: 'story',
    chapterOne: {
      currentNode: 'scene-1',
      activeSceneId: 'ch01_scene_01_port_bell',
      activeLineIndex: 0,
    },
  });
});

it('stores chapter line navigation and clamps at the first line', () => {
  const opened = gameReducer(createInitialState(0), { type: 'CONFIRM_ADULT' });
  const advanced = gameReducer(opened, { type: 'ADVANCE_CHAPTER_LINE' } as unknown as GameAction);
  const retreated = gameReducer(advanced, { type: 'RETREAT_CHAPTER_LINE' } as unknown as GameAction);
  const clamped = gameReducer(retreated, { type: 'RETREAT_CHAPTER_LINE' } as unknown as GameAction);

  expect(advanced.chapterOne.activeLineIndex).toBe(1);
  expect(retreated.chapterOne.activeLineIndex).toBe(0);
  expect(clamped.chapterOne.activeLineIndex).toBe(0);
});

it('moves scene one to scene two and scene two to battle preparation', () => {
  const sceneOne = gameReducer(createInitialState(0), { type: 'CONFIRM_ADULT' });
  const sceneTwo = gameReducer(sceneOne, { type: 'COMPLETE_CHAPTER_SCENE' } as unknown as GameAction);
  const preparation = gameReducer(sceneTwo, { type: 'COMPLETE_CHAPTER_SCENE' } as unknown as GameAction);

  expect(sceneTwo).toMatchObject({
    screen: 'story',
    chapterOne: {
      currentNode: 'scene-2',
      activeSceneId: 'ch01_scene_02_black_ship',
      activeLineIndex: 0,
      completedScenes: ['ch01_scene_01_port_bell'],
    },
  });
  expect(preparation).toMatchObject({
    screen: 'chapter-prep',
    chapterOne: {
      currentNode: 'battle-1-prep',
      completedScenes: ['ch01_scene_01_port_bell', 'ch01_scene_02_black_ship'],
    },
  });
});

function chapterPrepState(completedBattles: string[] = [], battleNumber = 1) {
  const afterSceneNumber = [2, 5, 8, 10, 12, 13, 16, 17, 19, 23, 24, 26, 27, 28, 29][battleNumber - 1] ?? 2;
  return {
    ...createInitialState(0),
    version: 5,
    adultConfirmed: true,
    screen: 'chapter-prep',
    chapterOne: {
      currentNode: `battle-${battleNumber}-prep`,
      activeSceneId: `ch01_scene_${String(afterSceneNumber).padStart(2, '0')}_test`,
      activeLineIndex: 0,
      completedScenes: ['ch01_scene_01_port_bell', 'ch01_scene_02_black_ship'],
      completedBattles,
      selectedStarterWeaponId: 'wpn_water_01',
      activeEncounterId: null,
      paidAp: 0,
      tutorialStep: 'attack',
      battleSnapshot: null,
      lastResult: null,
    },
  } as unknown as GameState;
}

it('starts the first chapter battle for free and charges five AP for a replay', () => {
  const first = gameReducer(chapterPrepState(), {
    type: 'START_CHAPTER_BATTLE',
    now: 0,
  } as unknown as GameAction);
  const replay = gameReducer(chapterPrepState(['ch01_b01_outer_bay_rescue']), {
    type: 'START_CHAPTER_BATTLE',
    now: 0,
  } as unknown as GameAction);

  expect(first).toMatchObject({
    screen: 'battle',
    ap: { current: 30 },
    chapterOne: { paidAp: 0, activeEncounterId: 'ch01_b01_outer_bay_rescue' },
  });
  expect(replay).toMatchObject({
    screen: 'battle',
    ap: { current: 25 },
    chapterOne: { paidAp: 5, activeEncounterId: 'ch01_b01_outer_bay_rescue' },
  });
});

it('selects a starter weapon, refunds replay AP on defeat, and records victory', () => {
  const selected = gameReducer(chapterPrepState(), {
    type: 'SELECT_STARTER_WEAPON',
    weaponId: 'wpn_fire_01',
  } as unknown as GameAction);
  const replay = gameReducer(chapterPrepState(['ch01_b01_outer_bay_rescue']), {
    type: 'START_CHAPTER_BATTLE',
    now: 0,
  } as unknown as GameAction);
  const defeated = gameReducer(replay, {
    type: 'FINISH_CHAPTER_BATTLE',
    result: 'defeat',
    flags: [],
    enemyHp: 800,
  } as unknown as GameAction);
  const first = gameReducer(chapterPrepState(), {
    type: 'START_CHAPTER_BATTLE',
    now: 0,
  } as unknown as GameAction);
  const victorious = gameReducer(first, {
    type: 'FINISH_CHAPTER_BATTLE',
    result: 'victory',
    flags: [],
    enemyHp: 0,
  } as unknown as GameAction);

  expect(selected.chapterOne.selectedStarterWeaponId).toBe('wpn_fire_01');
  expect(defeated).toMatchObject({
    screen: 'results',
    ap: { current: 30 },
    chapterOne: { currentNode: 'battle-1-prep', lastResult: 'defeat' },
  });
  expect(victorious).toMatchObject({
    screen: 'results',
    chapterOne: {
      currentNode: 'battle-1',
      completedBattles: ['ch01_b01_outer_bay_rescue'],
      lastResult: 'victory',
    },
  });
});

it('continues from any victorious chapter battle to its next canonical scene', () => {
  const active = {
    ...chapterPrepState([], 6),
    screen: 'battle' as const,
    chapterOne: {
      ...chapterPrepState([], 6).chapterOne,
      currentNode: 'battle-6' as const,
      activeEncounterId: 'ch01_b06_old_port_ambush' as const,
      lastResult: null,
    },
  } as GameState;
  const victorious = gameReducer(active, {
    type: 'FINISH_CHAPTER_BATTLE',
    result: 'victory',
    flags: [],
  } as GameAction);
  const continued = gameReducer(victorious, { type: 'CONTINUE_CHAPTER' } as GameAction);

  expect(continued.screen).toBe('story');
  expect(continued.chapterOne.currentNode).toBe('scene-14');
  expect(continued.chapterOne.activeSceneId).toBe('ch01_scene_14_seal_she_returned');
});

it('unlocks formal actors at their approved story milestones', () => {
  const milestones = [
    ['ch01_scene_04_quarantine_line', 'mila'],
    ['ch01_scene_05_first_answering_anchor', 'yanling'],
    ['ch01_scene_07_second_heart', 'yilan'],
    ['ch01_scene_16_seventh_log', 'saifula'],
    ['ch01_scene_24_ship_without_a_flag', 'hanze'],
  ] as const;

  for (const [sceneId, actorId] of milestones) {
    const initial = createInitialState(0);
    const atScene = {
      ...initial,
      screen: 'story' as const,
      chapterOne: { ...initial.chapterOne, activeSceneId: sceneId },
    } as GameState;
    const completed = gameReducer(atScene, { type: 'COMPLETE_CHAPTER_SCENE' });
    expect(completed.chapterOne.unlockedActorIds).toContain(actorId);
  }
});

it('selects a captain and opens the prologue', () => {
  const confirmed = gameReducer(createInitialState(), { type: 'CONFIRM_ADULT' });
  const state = gameReducer(confirmed, { type: 'SELECT_CAPTAIN', captainId: 'cap_f' });

  expect(state.captainId).toBe('cap_f');
  expect(state.screen).toBe('prologue');
});

it('rejects duplicate party members', () => {
  expect(() =>
    gameReducer(createInitialState(), {
      type: 'SET_PARTY',
      party: ['chr_01', 'chr_01', 'chr_02', 'chr_03'],
    }),
  ).toThrow('隊伍角色不可重複');
});

it('grants relation experience only after victory', () => {
  const initial = createInitialState();
  const victory = gameReducer(initial, { type: 'FINISH_ENCOUNTER', result: 'victory', flags: [] });
  const defeat = gameReducer(initial, { type: 'FINISH_ENCOUNTER', result: 'defeat', flags: [] });

  expect(victory.relation.chr_02).toEqual({ xp: 40, level: 2 });
  expect(defeat.relation.chr_02).toEqual({ xp: 0, level: 1 });
});

it('clears land-stage rewards before starting the unlocked sea encounter', () => {
  const reward = {
    stageId: 'land_04_leyline_core' as const,
    clear: { expeditionPoints: 350, surfaceAlloy: 4, ruinChip: 3, leylineCore: 1, fieldRation: 0 },
    firstClear: { expeditionPoints: 700, surfaceAlloy: 0, ruinChip: 0, leylineCore: 2, fieldRation: 2 },
    relationXp: 40,
    refundedAp: 0,
    seaUnlocked: true,
  };
  const next = gameReducer(expeditionReady({ lastStageRewards: reward }), {
    type: 'START_ENCOUNTER',
    encounterId: 'enc_tidal_boss',
  });

  expect(next.lastStageRewards).toBeNull();
  expect(next.currentEncounterId).toBe('enc_tidal_boss');
});

it('keeps party and loadout unchanged when adult collection state changes', () => {
  const initial = createInitialState();
  const relation = gameReducer(initial, { type: 'ADD_RELATION_XP', characterId: 'chr_02', xp: 100 });
  const viewed = gameReducer(relation, { type: 'MARK_EVENT_VIEWED', eventId: 'evt_chr02_bond03' });
  const hidden = gameReducer(viewed, { type: 'SET_ADULT_MODE', mode: 'hidden-thumbnails' });

  expect(hidden.party).toEqual(initial.party);
  expect(hidden.weaponGrid).toEqual(initial.weaponGrid);
  expect(hidden.relation.chr_02).toEqual({ xp: 100, level: 3 });
});

it('deducts AP once and creates an active challenge atomically', () => {
  const next = gameReducer(expeditionReady(), {
    type: 'START_STAGE',
    stageId: 'land_01_port_defense',
    now: 0,
  });

  expect(next.ap.current).toBe(25);
  expect(next.activeChallenge).toEqual({
    stageId: 'land_01_port_defense',
    encounterId: 'enc_tutorial',
    apCost: 5,
  });
  expect(next.currentEncounterId).toBe('enc_tutorial');
  expect(next.screen).toBe('battle');
});

it('rejects locked stages and insufficient AP without changing the state', () => {
  const initial = expeditionReady({ ap: { current: 4, lastRecoveredAt: 0 } });
  expect(() => gameReducer(initial, {
    type: 'START_STAGE',
    stageId: 'land_01_port_defense',
    now: 0,
  })).toThrow('AP 不足');
  expect(() => gameReducer(expeditionReady(), {
    type: 'START_STAGE',
    stageId: 'land_02_surface_ruins',
    now: 0,
  })).toThrow('關卡尚未解鎖');
  expect(initial.ap.current).toBe(4);
});

it('refunds all paid AP on defeat and grants nothing', () => {
  const active = gameReducer(expeditionReady(), {
    type: 'START_STAGE',
    stageId: 'land_01_port_defense',
    now: 0,
  });
  const next = gameReducer(active, {
    type: 'FINISH_STAGE',
    result: 'defeat',
    flags: [],
    enemyHp: 800,
  });

  expect(next.ap.current).toBe(30);
  expect(next.inventory).toEqual(expeditionReady().inventory);
  expect(next.activeChallenge).toBeNull();
  expect(next.lastStageRewards?.refundedAp).toBe(5);
  expect(next.relation.chr_02).toEqual({ xp: 0, level: 1 });
});

it('grants deterministic and first-clear rewards only once', () => {
  const active = gameReducer(expeditionReady(), {
    type: 'START_STAGE',
    stageId: 'land_01_port_defense',
    now: 0,
  });
  const first = gameReducer(active, {
    type: 'FINISH_STAGE',
    result: 'victory',
    flags: [],
    enemyHp: 0,
  });
  const repeatedActive = gameReducer({
    ...first,
    screen: 'expedition-map',
    ap: { current: 30, lastRecoveredAt: 0 },
  }, {
    type: 'START_STAGE',
    stageId: 'land_01_port_defense',
    now: 0,
  });
  const repeated = gameReducer(repeatedActive, {
    type: 'FINISH_STAGE',
    result: 'victory',
    flags: [],
    enemyHp: 0,
  });

  expect(first.inventory).toEqual({
    expeditionPoints: 180,
    surfaceAlloy: 3,
    ruinChip: 0,
    leylineCore: 0,
    fieldRation: 2,
  });
  expect(first.firstClears).toEqual(['land_01_port_defense']);
  expect(repeated.lastStageRewards?.firstClear).toEqual({
    expeditionPoints: 0,
    surfaceAlloy: 0,
    ruinChip: 0,
    leylineCore: 0,
    fieldRation: 0,
  });
  expect(repeated.inventory.expeditionPoints).toBe(260);
});

it('uses a field ration after synchronizing AP and never exceeds the cap', () => {
  const initial = expeditionReady({
    ap: { current: 10, lastRecoveredAt: 0 },
    inventory: { ...createInitialState(0).inventory, fieldRation: 2 },
  });
  const next = gameReducer(initial, { type: 'USE_FIELD_RATION', now: 300_000 });

  expect(next.ap).toEqual({ current: 26, lastRecoveredAt: 300_000 });
  expect(next.inventory.fieldRation).toBe(1);
});

it('upgrades a character and weapon by exactly one level', () => {
  const inventory = {
    expeditionPoints: 1000,
    surfaceAlloy: 20,
    ruinChip: 10,
    leylineCore: 2,
    fieldRation: 1,
  };
  const character = gameReducer(expeditionReady({ inventory }), {
    type: 'UPGRADE_CHARACTER',
    characterId: 'chr_01',
  });
  const weapon = gameReducer(character, {
    type: 'UPGRADE_WEAPON',
    weaponId: 'wpn_01_sunblade',
  });

  expect(character.characterLevels.chr_01).toBe(2);
  expect(weapon.weaponLevels.wpn_01_sunblade).toBe(2);
  expect(weapon.inventory.expeditionPoints).toBe(820);
  expect(weapon.inventory.surfaceAlloy).toBe(16);
});

it('completes and records a story before returning to its destination', () => {
  const opened = gameReducer(expeditionReady(), {
    type: 'START_STORY',
    storyId: 'story_land_01_pre',
    returnScreen: 'loadout',
  });
  const completed = gameReducer(opened, { type: 'COMPLETE_STORY' });

  expect(opened.screen).toBe('story');
  expect(completed.viewedStories).toEqual(['story_land_01_pre']);
  expect(completed.activeStoryId).toBeNull();
  expect(completed.screen).toBe('loadout');
});
