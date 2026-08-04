import { content, elementMultiplier } from './index';

it('loads the complete deterministic slice registry', () => {
  expect(content.characters).toHaveLength(4);
  expect(content.weapons).toHaveLength(12);
  expect(content.summons).toHaveLength(2);
  expect(content.encounters.map((encounter) => encounter.id)).toEqual([
    'enc_tutorial',
    'enc_surface_ruins',
    'enc_orbital_outpost',
    'enc_leyline_core',
    'enc_tidal_boss',
  ]);
  expect(content.events).toHaveLength(3);
  expect(content.stages).toHaveLength(4);
  expect(content.stories).toHaveLength(8);
});

it.each([
  ['fire', 'wind', 1.25],
  ['wind', 'earth', 1.25],
  ['earth', 'water', 1.25],
  ['water', 'fire', 1.25],
  ['light', 'dark', 1.25],
  ['dark', 'light', 1.25],
  ['fire', 'water', 0.75],
  ['water', 'earth', 0.75],
] as const)('%s attacking %s uses %s', (attacker, defender, expected) => {
  expect(elementMultiplier(attacker, defender)).toBe(expected);
});

it('rejects underage character definitions', async () => {
  const { characterSchema } = await import('../domain/schemas');
  expect(() =>
    characterSchema.parse({
      id: 'chr_01',
      name: '不合法角色',
      age: 17,
      element: 'fire',
      role: 'vanguard',
      maxHp: 1000,
      attack: 300,
      skills: [
        { id: 'a', name: '技能 A', cooldown: 3, target: 'enemy', power: 100 },
        { id: 'b', name: '技能 B', cooldown: 4, target: 'self', power: 0 },
      ],
      passive: '測試被動',
      ougi: { name: '測試奧義', power: 500 },
    }),
  ).toThrow();
});
