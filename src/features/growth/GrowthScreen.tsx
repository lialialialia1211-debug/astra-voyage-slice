import { useState } from 'react';
import { content } from '../../content';
import type { RewardBundle } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { userAssetUrl } from '../../lib/user-assets';
import { canAfford } from '../expedition/progression';
import {
  characterUpgradeCost,
  effectiveCharacter,
  effectiveWeapon,
  weaponUpgradeCost,
} from './growth';

const resourceLabels: Record<keyof RewardBundle, string> = {
  expeditionPoints: '遠征點數',
  surfaceAlloy: '地表合金',
  ruinChip: '遺跡晶片',
  leylineCore: '地脈核心',
  fieldRation: '補給劑',
};

function costText(cost: RewardBundle | null): string {
  if (!cost) return '已達最高等級';
  return (Object.entries(cost) as [keyof RewardBundle, number][])
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${resourceLabels[key]} ${value}`)
    .join('・');
}

function missingText(inventory: RewardBundle, cost: RewardBundle | null): string {
  if (!cost) return '';
  const missing = (Object.entries(cost) as [keyof RewardBundle, number][])
    .map(([key, value]) => [key, Math.max(0, value - inventory[key])] as const)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${resourceLabels[key]} ${value}`);
  return missing.length > 0 ? `缺少：${missing.join('・')}` : '素材充足';
}

export function GrowthScreen() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<'characters' | 'weapons'>('characters');

  return (
    <section className="growth-screen" aria-labelledby="growth-title">
      <header className="growth-header">
        <div><p className="eyebrow">EXPEDITION DEVELOPMENT</p><h1 id="growth-title">遠征養成</h1></div>
        <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'expedition-map' })}>返回地表地圖</button>
      </header>
      <div className="growth-inventory" aria-label="養成素材">
        <span>點數 {state.inventory.expeditionPoints}</span>
        <span>合金 {state.inventory.surfaceAlloy}</span>
        <span>晶片 {state.inventory.ruinChip}</span>
        <span>核心 {state.inventory.leylineCore}</span>
      </div>
      <div className="growth-tabs" role="tablist" aria-label="養成分類">
        <button aria-selected={tab === 'characters'} role="tab" type="button" onClick={() => setTab('characters')}>角色強化</button>
        <button aria-selected={tab === 'weapons'} role="tab" type="button" onClick={() => setTab('weapons')}>武器強化</button>
      </div>

      {tab === 'characters' ? (
        <div className="growth-grid growth-grid--characters">
          {content.characters.filter((character) => state.roster.includes(character.id)).map((character) => {
            const level = state.characterLevels[character.id];
            const current = effectiveCharacter(character, level);
            const next = level < 10 ? effectiveCharacter(character, level + 1) : current;
            const cost = characterUpgradeCost(level);
            const affordable = cost !== null && canAfford(state.inventory, cost);
            return (
              <article className="growth-card" key={character.id}>
                {userAssetUrl(`${character.id}_card`) && <img alt={`${character.name}角色卡`} src={userAssetUrl(`${character.id}_card`) ?? undefined} />}
                <div><h2>{character.name}</h2><strong className="growth-level">Lv.{level}</strong></div>
                <p>ATK {current.attack} → {next.attack}</p>
                <p>HP {current.maxHp} → {next.maxHp}</p>
                <small>{costText(cost)}</small>
                <small className={affordable ? 'is-ready' : 'is-missing'}>{missingText(state.inventory, cost)}</small>
                <button
                  aria-label={level < 10 ? `提升${character.name}至 Lv.${level + 1}` : `${character.name}已滿級`}
                  disabled={!affordable}
                  type="button"
                  onClick={() => dispatch({ type: 'UPGRADE_CHARACTER', characterId: character.id })}
                >{level < 10 ? '強化一級' : '已滿級'}</button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="growth-grid growth-grid--weapons">
          {content.weapons.map((weapon) => {
            const level = state.weaponLevels[weapon.id];
            const current = effectiveWeapon(weapon, level);
            const next = level < 10 ? effectiveWeapon(weapon, level + 1) : current;
            const cost = weaponUpgradeCost(level);
            const affordable = cost !== null && canAfford(state.inventory, cost);
            return (
              <article className="growth-card growth-card--weapon" key={weapon.id}>
                {userAssetUrl(weapon.id) && <img alt={`${weapon.name}武器圖`} src={userAssetUrl(weapon.id) ?? undefined} />}
                <div><h2>{weapon.name}</h2><strong className="growth-level">Lv.{level}</strong></div>
                <p>ATK {current.attack} → {next.attack}</p>
                <p>HP {current.hp} → {next.hp}</p>
                <small>{costText(cost)}</small>
                <small className={affordable ? 'is-ready' : 'is-missing'}>{missingText(state.inventory, cost)}</small>
                <button
                  aria-label={level < 10 ? `提升${weapon.name}至 Lv.${level + 1}` : `${weapon.name}已滿級`}
                  disabled={!affordable}
                  type="button"
                  onClick={() => dispatch({ type: 'UPGRADE_WEAPON', weaponId: weapon.id })}
                >{level < 10 ? '強化一級' : '已滿級'}</button>
              </article>
            );
          })}
        </div>
      )}
      <p className="growth-boundary-note">角色戰鬥等級與私人關係等級彼此獨立；養成不會直接解鎖成人收藏。</p>
    </section>
  );
}
