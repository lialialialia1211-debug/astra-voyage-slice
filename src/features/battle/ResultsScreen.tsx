import { content } from '../../content';
import { useGame } from '../../game/GameProvider';

export function ResultsScreen() {
  const { state, dispatch } = useGame();
  const encounter = content.encounters.find((entry) => entry.id === state.currentEncounterId);
  const victory = state.lastResult === 'victory';

  if (!encounter || !state.lastResult) {
    return <section className="screen-card"><h1>沒有可顯示的戰果</h1></section>;
  }

  return (
    <section className={`screen-card result-screen result-screen--${state.lastResult}`}>
      <p className="eyebrow">MISSION REPORT</p>
      <h1>{victory ? '任務完成' : '作戰失敗'}</h1>
      <p className="result-encounter">{encounter.name}</p>
      {victory ? (
        <>
          <p className="intro-copy">全員關係經驗 +40，遠征紀錄已寫入本機存檔。</p>
          <button
            className="primary-action"
            type="button"
            onClick={() => dispatch({ type: 'NAVIGATE', screen: encounter.id === 'enc_tutorial' ? 'loadout' : 'cabin' })}
          >
            {encounter.id === 'enc_tutorial' ? '前往潮汐戰線' : '返回私人艙室'}
          </button>
        </>
      ) : (
        <>
          <p className="enemy-hp-remaining">敵方剩餘生命：{(state.lastEnemyHp ?? 0).toLocaleString()}</p>
          <ul className="defeat-advice">
            <li>留意敵方預告，面對全體攻擊時改用全隊防禦。</li>
            <li>累積至 100% 後選取多名角色，可發動奧義連鎖。</li>
          </ul>
          <button
            className="primary-action"
            type="button"
            onClick={() => dispatch({ type: 'START_ENCOUNTER', encounterId: encounter.id })}
          >以原編成重試</button>
        </>
      )}
    </section>
  );
}
