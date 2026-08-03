import { fixedTenDraw } from './recruit';

it('always grants chr_04 and nine configured rewards', () => {
  const result = fixedTenDraw();

  expect(result).toHaveLength(10);
  expect(result[9]).toEqual({ kind: 'character', id: 'chr_04', rarity: 'ssr' });
  expect(result.filter((reward) => reward.kind === 'weapon')).toHaveLength(6);
  expect(result.filter((reward) => reward.kind === 'gift')).toHaveLength(3);
});
