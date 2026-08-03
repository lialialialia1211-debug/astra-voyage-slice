import { useGame } from '../../game/GameProvider';

export function PrologueScreen() {
  const { state, dispatch } = useGame();
  const captainLabel = state.captainId === 'cap_f' ? '女性艦長' : '男性艦長';

  return (
    <section className="screen-card screen-card--story" aria-labelledby="prologue-title">
      <p className="eyebrow">PROLOGUE // COASTAL YEAR 217</p>
      <h1 id="prologue-title">離岸之前</h1>
      <p className="story-copy">
        身為新任{captainLabel}，你接手了第一遠征艦。港都外海持續出現無法解讀的深海訊號，而最新一次回波竟指向天空之外。
      </p>
      <p className="story-copy">遠征委員會批准你進行最後一次人員招募，接著立即前往潮汐遺跡。</p>
      <button className="primary-action" type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'recruit' })}>
        開始遠征
      </button>
    </section>
  );
}
