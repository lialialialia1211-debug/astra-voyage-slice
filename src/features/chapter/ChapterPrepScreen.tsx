import { chapterOneContent } from '../../chapter-one/content';
import { chapterBattleApCost } from '../../chapter-one/flow';
import type { Element } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { AssetArtwork } from '../story/AssetArtwork';

const elementLabels: Record<Element, string> = {
  fire: '火',
  water: '水',
  earth: '土',
  wind: '風',
  light: '光',
  dark: '闇',
};

export function ChapterPrepScreen() {
  const { state, dispatch } = useGame();
  const cost = chapterBattleApCost(state.chapterOne.completedBattles);

  return (
    <section className="chapter-prep-screen" aria-labelledby="chapter-prep-title">
      <header className="chapter-prep-header">
        <div>
          <p className="eyebrow">BATTLE 01 // TUTORIAL</p>
          <h1 id="chapter-prep-title">外灣救難線</h1>
          <p>固定隊伍：昭黎／洛恩。昭黎的元素會由本次主手決定，進入戰鬥後不可切換。</p>
        </div>
        <div className="chapter-prep-cost">
          <strong>{cost === 0 ? '首通 0 AP' : '重播 5 AP'}</strong>
          <span>目前 AP {state.ap.current}</span>
        </div>
      </header>
      <div className="starter-weapon-grid" aria-label="六屬性入門主手">
        {chapterOneContent.starterWeapons.map((weapon) => {
          const selected = state.chapterOne.selectedStarterWeaponId === weapon.id;
          return (
            <button
              aria-label={`選擇${weapon.name}`}
              aria-pressed={selected}
              className={`starter-weapon-card starter-weapon-card--${weapon.element}`}
              key={weapon.id}
              onClick={() => dispatch({ type: 'SELECT_STARTER_WEAPON', weaponId: weapon.id })}
              type="button"
            >
              <AssetArtwork
                alt={`${weapon.name}主手武器`}
                assetId={weapon.assetId}
                className="starter-weapon-art"
                fallbackLabel={`${elementLabels[weapon.element]}屬性`}
              />
              <span>{elementLabels[weapon.element]}屬性</span>
              <strong>{weapon.name}</strong>
              <small>{weapon.summary}</small>
            </button>
          );
        })}
      </div>
      <footer className="chapter-prep-actions">
        <p>教學內容：全隊普攻、敵我回合、HP、勝利與戰敗重試。</p>
        <button
          className="primary-action"
          disabled={state.ap.current < cost}
          onClick={() => dispatch({ type: 'START_CHAPTER_BATTLE', now: Date.now() })}
          type="button"
        >開始救援</button>
      </footer>
    </section>
  );
}
