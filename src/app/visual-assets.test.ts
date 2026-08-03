import { existsSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import generatedUiManifest from '../../public/assets/generated-ui/manifest.json';

const expectedGeneratedUiAssets = [
  'bg_title_harbor',
  'bg_hub_harbor',
  'bg_recruit_observatory',
  'bg_loadout_console',
  'bg_battle_land',
  'bg_battle_ocean',
  'bg_private_cabin',
  'bg_ending_star_signal',
  'frame_common',
  'frame_r',
  'frame_sr',
  'frame_ssr',
  'badge_fire',
  'badge_water',
  'badge_wind',
  'badge_earth',
  'badge_light',
  'badge_dark',
  'button_idle',
  'button_hover',
  'button_pressed',
  'boss_mode_frame',
  'charge_frame',
  'dialog_plate',
  'tab_plate',
];

it('contains every generated UI asset required by the approved art checklist', () => {
  expect(Object.keys(generatedUiManifest).sort()).toEqual(expectedGeneratedUiAssets.sort());
  for (const assetUrl of Object.values(generatedUiManifest)) {
    expect(existsSync(path.resolve('public', assetUrl.replace(/^\//, ''))), assetUrl).toBe(true);
  }
});
