import { useState } from 'react';
import { useGame } from '../../game/GameProvider';
import { fixedTenDraw } from './recruit';

const resultNames: Record<string, string> = {
  wpn_01_sunblade: '旭日裂潮劍',
  wpn_02_molten_lance: '熔核長槍',
  gift_navigation_chart: '舊航路圖',
  wpn_03_tidemark_axe: '潮痕戰斧',
  gift_engineering_tea: '工程師茶罐',
  wpn_04_resonance_staff: '共鳴權杖',
  wpn_05_fireline_dagger: '火線短劍',
  gift_star_fragment: '星屑樣本',
  wpn_06_route_bow: '航路弓',
  chr_04: '光醫・外星生物研究醫師',
};

export function RecruitScreen() {
  const { dispatch } = useGame();
  const [revealed, setRevealed] = useState(0);
  const results = fixedTenDraw();

  return (
    <section className="screen-card screen-card--wide" aria-labelledby="recruit-title">
      <p className="eyebrow">FIXED EXPEDITION DRAW // FREE</p>
      <h1 id="recruit-title">遠征招募</h1>
      <p className="intro-copy">這次十連不消耗資源，結果固定以確保原型流程一致。</p>
      <div className="recruit-grid" aria-live="polite">
        {results.map((result, index) => (
          <article className={`recruit-card rarity-${result.rarity}`} key={`${result.id}-${index}`}>
            {index < revealed ? (
              <><span>{result.rarity.toUpperCase()}</span><strong>{resultNames[result.id]}</strong></>
            ) : (
              <span className="card-back">ASTRA</span>
            )}
          </article>
        ))}
      </div>
      <div className="action-row">
        {revealed < results.length ? (
          <>
            <button className="secondary-action" type="button" onClick={() => setRevealed((count) => Math.min(count + 1, 10))}>
              揭曉下一張
            </button>
            <button className="primary-action" type="button" onClick={() => setRevealed(10)}>全部揭曉</button>
          </>
        ) : (
          <button className="primary-action" type="button" onClick={() => dispatch({ type: 'COMPLETE_RECRUIT' })}>
            前往編隊
          </button>
        )}
      </div>
    </section>
  );
}
