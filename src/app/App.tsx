import { useState } from 'react';
import './app.css';

export function App() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main data-testid="app-shell" className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      {!confirmed ? (
        <section className="modal-card" aria-labelledby="adult-gate-title">
          <p className="eyebrow">ASTRA VOYAGE // PROTOTYPE</p>
          <h1 id="adult-gate-title">成年內容確認</h1>
          <p className="intro-copy">本遊戲僅供年滿 18 歲的成年人使用。</p>
          <button className="primary-action" type="button" onClick={() => setConfirmed(true)}>
            我已年滿 18 歲
          </button>
        </section>
      ) : (
        <section className="screen-card" aria-labelledby="captain-title">
          <p className="eyebrow">EXPEDITION REGISTRY</p>
          <h1 id="captain-title">選擇遠征艦長</h1>
          <p className="intro-copy">建立你的遠征身分，從地表文明航向未知星空。</p>
        </section>
      )}
    </main>
  );
}
