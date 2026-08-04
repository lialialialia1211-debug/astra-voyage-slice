import { useState } from 'react';
import { content } from '../../content';
import type { CharacterId } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { userAssetUrl } from '../../lib/user-assets';
import { nextRelationTarget } from './relation';

const roleLabels = {
  vanguard: '先鋒',
  caster: '術師',
  support: '支援',
  healer: '治療',
} as const;

export function CabinScreen() {
  const { state, dispatch } = useGame();
  const [selectedId, setSelectedId] = useState<CharacterId>('chr_02');
  const [outfit, setOutfit] = useState(1);
  const character = content.characters.find((entry) => entry.id === selectedId)!;
  const relation = state.relation[selectedId];
  const nextTarget = nextRelationTarget(relation.level);
  const progressMax = nextTarget ?? Math.max(220, relation.xp);
  const cabinAssetId = `${character.id}_cabin_${outfit === 1 ? 'base' : 'outfit_02'}`;
  const cabinArtUrl = userAssetUrl(cabinAssetId) ?? userAssetUrl(`${character.id}_cabin_base`);

  return (
    <section className="cabin-screen" aria-labelledby="cabin-title">
      <header className="cabin-header">
        <div><p className="eyebrow">PRIVATE CABIN</p><h1 id="cabin-title">私人艙室</h1></div>
        <nav aria-label="艙室功能">
          <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'gallery' })}>事件收藏</button>
          <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'settings' })}>顯示設定</button>
          <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'loadout' })}>返回艦裝</button>
        </nav>
      </header>
      <div className="cabin-tabs" role="tablist" aria-label="隊員">
        {content.characters.map((entry) => (
          <button
            aria-selected={entry.id === selectedId}
            key={entry.id}
            role="tab"
            type="button"
            onClick={() => setSelectedId(entry.id)}
          >{entry.name}</button>
        ))}
      </div>
      <div className="cabin-body">
        <div className="cabin-character-stage">
          {cabinArtUrl ? (
            <img alt={`${character.name}艙室立繪`} className="cabin-character-art" src={cabinArtUrl} />
          ) : (
            <div className="cabin-character-placeholder" aria-label={`${character.name}艙室立繪待匯入`} role="img" />
          )}
        </div>
        <aside className="relation-panel">
          <p className={`element-label element-${character.element}`}>{character.element.toUpperCase()}</p>
          <h2>{character.name}</h2>
          <p>{character.age} 歲 · {roleLabels[character.role]}</p>
          <div className="relation-level"><span>關係等級</span><strong>Lv.{relation.level}</strong></div>
          <progress aria-label={`${character.name} 關係經驗`} max={progressMax} value={relation.xp} />
          <p className="relation-next">
            {nextTarget ? `下一級：${relation.xp} / ${nextTarget} XP` : `最高等級 · ${relation.xp} XP`}
          </p>
          <div className="cabin-actions">
            <button type="button" onClick={() => dispatch({ type: 'ADD_RELATION_XP', characterId: selectedId, xp: 20 })}>贈送遠征紀念品 +20</button>
            <button type="button" onClick={() => dispatch({ type: 'ADD_RELATION_XP', characterId: selectedId, xp: 10 })}>艙室交流 +10</button>
            <button disabled={selectedId !== 'chr_02'} type="button" onClick={() => setOutfit((current) => current === 1 ? 2 : 1)}>
              {outfit === 1 ? '切換艙室服裝' : '恢復基礎服裝'}
            </button>
          </div>
          <p className="cabin-boundary-note">關係與成人收藏不增加戰鬥攻擊、生命或武器技能。</p>
        </aside>
      </div>
    </section>
  );
}
