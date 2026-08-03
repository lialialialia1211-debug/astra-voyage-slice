import { useGame } from '../../game/GameProvider';
import type { AdultDisplayMode } from '../../game/initial-state';

const modes: readonly { id: AdultDisplayMode; label: string; copy: string }[] = [
  { id: 'full', label: '完整顯示', copy: '解鎖後顯示已匯入的事件 CG。' },
  { id: 'fade', label: '畫面淡出', copy: '保留事件完成與收藏紀錄，但不渲染 CG。' },
  { id: 'hidden-thumbnails', label: '隱藏縮圖', copy: '收藏列表使用中性封面，開啟事件後才顯示內容。' },
];

export function SettingsScreen() {
  const { state, dispatch } = useGame();

  return (
    <section className="screen-card screen-card--wide settings-screen" aria-labelledby="settings-title">
      <p className="eyebrow">DISPLAY CONTROL</p>
      <h1 id="settings-title">成人內容顯示</h1>
      <p className="intro-copy">可隨時調整。三種模式只改變呈現方式，不影響事件解鎖、戰鬥力或主線進度。</p>
      <div className="mode-options">
        {modes.map((mode) => (
          <button
            aria-pressed={state.adultMode === mode.id}
            key={mode.id}
            type="button"
            onClick={() => dispatch({ type: 'SET_ADULT_MODE', mode: mode.id })}
          >
            <strong>{mode.label}</strong><span>{mode.copy}</span>
          </button>
        ))}
      </div>
      <button className="primary-action" type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'gallery' })}>返回事件收藏</button>
    </section>
  );
}
