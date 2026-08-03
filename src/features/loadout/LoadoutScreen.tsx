import { useMemo, useState } from 'react';
import { content } from '../../content';
import type { WeaponId } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import type { WeaponGrid } from '../../game/initial-state';
import { calculateLoadout, recommendLoadout } from './calculate-loadout';
import { WeaponSlot } from './WeaponSlot';

type ActiveSlot = 'main' | number | null;

function getWeapon(id: WeaponId | null) {
  return id ? content.weapons.find((weapon) => weapon.id === id) : undefined;
}

export function LoadoutScreen() {
  const { state, dispatch } = useGame();
  const [grid, setGrid] = useState<WeaponGrid>(state.weaponGrid);
  const [summonId, setSummonId] = useState(state.summonId ?? 'smn_01_solar_leviathan');
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>(null);
  const totals = useMemo(() => calculateLoadout(grid, content.weapons), [grid]);
  const equipped = new Set([grid.main, ...grid.sub].filter((id) => id !== null));

  function equipWeapon(weaponId: WeaponId) {
    if (activeSlot === 'main') setGrid({ ...grid, main: weaponId });
    if (typeof activeSlot === 'number') {
      const sub = [...grid.sub] as WeaponGrid['sub'];
      sub[activeSlot] = weaponId;
      setGrid({ ...grid, sub });
    }
    setActiveSlot(null);
  }

  return (
    <section className="loadout-screen" aria-labelledby="loadout-title">
      <header className="loadout-header">
        <div><p className="eyebrow">EXPEDITION LOADOUT</p><h1 id="loadout-title">艦裝武器盤</h1></div>
        <dl className="loadout-stats">
          <div><dt>總生命</dt><dd>{totals.hp.toLocaleString()}</dd></div>
          <div><dt>總攻擊</dt><dd>{totals.attack.toLocaleString()}</dd></div>
          <div><dt>預估傷害</dt><dd>{totals.predictedDamage.toLocaleString()}</dd></div>
        </dl>
      </header>
      <div className="loadout-tabs" role="tablist" aria-label="艦裝分類">
        <button aria-selected="true" role="tab" type="button">武器盤</button>
        <label>召喚核心
          <select value={summonId} onChange={(event) => setSummonId(event.target.value as typeof summonId)}>
            {content.summons.map((summon) => <option key={summon.id} value={summon.id}>{summon.name}</option>)}
          </select>
        </label>
      </div>
      <div className="loadout-body">
        <aside className="main-hand-panel">
          <WeaponSlot label="主手武器" main weapon={getWeapon(grid.main)} onClick={() => setActiveSlot('main')} />
          <p>主手決定艦長屬性、普通攻擊演出與奧義效果。</p>
        </aside>
        <div className="sub-weapon-panel">
          <div className="sub-weapon-heading"><strong>副武器矩陣</strong><span>{grid.sub.filter(Boolean).length} / 9</span></div>
          <div className="sub-weapon-grid">
            {grid.sub.map((weaponId, index) => (
              <WeaponSlot
                key={index}
                label={`副武器 ${index + 1}`}
                weapon={getWeapon(weaponId)}
                onClick={() => setActiveSlot(index)}
              />
            ))}
          </div>
          <div className="skill-summary">
            <span>攻刃 +{totals.skills.might}%</span>
            <span>生命 +{totals.skills.vitality}%</span>
            <span>奧義上限 +{totals.skills.ougiCap}%</span>
          </div>
        </div>
      </div>
      {activeSlot !== null && (
        <aside className="inventory-drawer" aria-label="武器庫">
          <div className="drawer-heading"><h2>武器庫</h2><button type="button" onClick={() => setActiveSlot(null)}>關閉</button></div>
          <div className="inventory-list">
            {content.weapons.map((weapon) => (
              <button
                disabled={equipped.has(weapon.id)}
                key={weapon.id}
                type="button"
                onClick={() => equipWeapon(weapon.id)}
              >
                <strong>{weapon.name}</strong><small>{weapon.element}・ATK {weapon.attack}</small>
              </button>
            ))}
          </div>
        </aside>
      )}
      <footer className="loadout-actions">
        <button className="secondary-action" type="button" onClick={() => setGrid(recommendLoadout('fire', content.weapons))}>推薦編成</button>
        <button className="secondary-action" type="button" onClick={() => setGrid({ main: null, sub: [null, null, null, null, null, null, null, null, null] })}>全部卸下</button>
        <button
          className="primary-action"
          disabled={totals.weaponCount !== 10}
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_LOADOUT', weaponGrid: grid, summonId });
            dispatch({ type: 'START_ENCOUNTER', encounterId: 'enc_tutorial' });
          }}
        >
          確認艦裝
        </button>
      </footer>
    </section>
  );
}
