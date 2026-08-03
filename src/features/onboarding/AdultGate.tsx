import { useGame } from '../../game/GameProvider';

export function AdultGate() {
  const { dispatch } = useGame();

  return (
    <section className="modal-card" aria-labelledby="adult-gate-title">
      <p className="eyebrow">ASTRA VOYAGE // PROTOTYPE</p>
      <h1 id="adult-gate-title">成年內容確認</h1>
      <p className="intro-copy">本遊戲僅供年滿 18 歲的成年人使用。</p>
      <button className="primary-action" type="button" onClick={() => dispatch({ type: 'CONFIRM_ADULT' })}>
        我已年滿 18 歲
      </button>
    </section>
  );
}
