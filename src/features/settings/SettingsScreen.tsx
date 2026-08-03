import { useState } from 'react';
import { useGame } from '../../game/GameProvider';
import { type AdultDisplayMode, type GameState } from '../../game/initial-state';
import { gameStateSchema } from '../../game/storage';

const modes: readonly { id: AdultDisplayMode; label: string; copy: string }[] = [
  { id: 'full', label: '完整顯示', copy: '解鎖後顯示已匯入的事件 CG。' },
  { id: 'fade', label: '畫面淡出', copy: '保留事件完成與收藏紀錄，但不渲染 CG。' },
  { id: 'hidden-thumbnails', label: '隱藏縮圖', copy: '收藏列表使用中性封面，開啟事件後才顯示內容。' },
];

export function SettingsScreen() {
  const { state, dispatch } = useGame();
  const [saveMessage, setSaveMessage] = useState('');

  function exportSave() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'astra-voyage-save.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setSaveMessage('存檔已匯出。');
  }

  async function importSave(file: File | undefined) {
    if (!file) return;
    try {
      const imported = gameStateSchema.parse(JSON.parse(await file.text())) as GameState;
      dispatch({ type: 'IMPORT_SAVE', state: imported });
    } catch {
      setSaveMessage('匯入失敗：檔案格式或版本不符。');
    }
  }

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
      <div className="save-tools" aria-label="本機存檔工具">
        <button type="button" onClick={exportSave}>匯出存檔 JSON</button>
        <label>
          匯入存檔
          <input
            accept="application/json,.json"
            aria-label="匯入存檔"
            type="file"
            onChange={(event) => {
              void importSave(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }}
          />
        </label>
        {saveMessage && <p aria-live="polite">{saveMessage}</p>}
      </div>
      <button className="primary-action" type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'gallery' })}>返回事件收藏</button>
    </section>
  );
}
