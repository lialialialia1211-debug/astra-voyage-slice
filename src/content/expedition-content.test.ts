import { content } from './index';

it('defines the approved linear land route and deterministic rewards', () => {
  expect(content.stages.map((stage) => stage.id)).toEqual([
    'land_01_port_defense',
    'land_02_surface_ruins',
    'land_03_orbital_outpost',
    'land_04_leyline_core',
  ]);
  expect(content.stages.map((stage) => stage.apCost)).toEqual([5, 5, 5, 10]);
  expect(content.stages[3]?.clearRewards.leylineCore).toBe(1);
  expect(content.stages[3]?.firstClearRewards.fieldRation).toBe(2);
});

it('defines three new land encounters and eight complete story scenes', () => {
  expect(content.encounters.map((encounter) => encounter.id)).toEqual([
    'enc_tutorial',
    'enc_surface_ruins',
    'enc_orbital_outpost',
    'enc_leyline_core',
    'enc_tidal_boss',
  ]);
  expect(content.stories).toHaveLength(8);
  expect(content.stories.every((story) => story.lines.length >= 3)).toBe(true);
});
