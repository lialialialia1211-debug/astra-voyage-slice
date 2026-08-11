import { expect, it } from 'vitest';
import * as contentModule from '../content';

interface VerticalSliceContent {
  scenes: readonly { id: string; lines: readonly unknown[] }[];
  actors: readonly { id: string; age: number }[];
  starterWeapons: readonly { id: string; element: string }[];
  encounters: readonly { id: string; fixedPartyIds: readonly string[] }[];
}

function exportedChapterContent(): VerticalSliceContent | undefined {
  return (contentModule as unknown as { chapterOneContent?: VerticalSliceContent }).chapterOneContent;
}

it('contains the approved first vertical slice', () => {
  const chapter = exportedChapterContent();

  expect(chapter?.scenes.map((scene) => scene.id)).toEqual([
    'ch01_scene_01_port_bell',
    'ch01_scene_02_black_ship',
  ]);
  expect(chapter?.encounters[0]).toMatchObject({
    id: 'ch01_b01_outer_bay_rescue',
    fixedPartyIds: ['zhaoli', 'luoen'],
  });
});

it('keeps every chapter actor adult and supplies six elemental starter weapons', () => {
  const chapter = exportedChapterContent();

  expect(chapter?.actors.every((actor) => actor.age >= 18)).toBe(true);
  expect(chapter?.starterWeapons.map((weapon) => weapon.element)).toEqual([
    'fire',
    'water',
    'earth',
    'wind',
    'light',
    'dark',
  ]);
});

it('adapts both approved scenes into substantial AVG scripts', () => {
  const chapter = exportedChapterContent();

  expect(chapter?.scenes[0]?.lines.length).toBeGreaterThanOrEqual(24);
  expect(chapter?.scenes[1]?.lines.length).toBeGreaterThanOrEqual(24);
});
