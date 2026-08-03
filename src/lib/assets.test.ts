import { expect, it } from 'vitest';
import { resolveAsset } from './assets';

it('returns a named placeholder for absent optional CG art', () => {
  expect(resolveAsset('evt_chr02_bond03_cg01', {})).toEqual({
    kind: 'placeholder',
    id: 'evt_chr02_bond03_cg01',
    url: null,
    label: '缺少美術：evt_chr02_bond03_cg01',
  });
});

it('returns the manifest URL for ready art', () => {
  expect(resolveAsset('chr_02_cabin_base', {
    chr_02_cabin_base: '/assets/user/chr_02_cabin_base.webp',
  })).toEqual({
    kind: 'ready',
    id: 'chr_02_cabin_base',
    url: '/assets/user/chr_02_cabin_base.webp',
    label: 'chr_02_cabin_base',
  });
});
