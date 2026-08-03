import { GameProvider, useGame } from '../game/GameProvider';
import { AdultGate } from '../features/onboarding/AdultGate';
import { CaptainSelect } from '../features/onboarding/CaptainSelect';
import { PrologueScreen } from '../features/onboarding/PrologueScreen';
import { RecruitScreen } from '../features/recruitment/RecruitScreen';
import './app.css';

function GameRouter() {
  const { state } = useGame();

  const screen = (() => {
    switch (state.screen) {
      case 'adult-gate':
        return <AdultGate />;
      case 'captain-select':
        return <CaptainSelect />;
      case 'prologue':
        return <PrologueScreen />;
      case 'recruit':
        return <RecruitScreen />;
      default:
        return (
          <section className="screen-card">
            <p className="eyebrow">SYSTEM STATUS</p>
            <h1>下一階段建置中</h1>
          </section>
        );
    }
  })();

  return (
    <main data-testid="app-shell" className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      {screen}
    </main>
  );
}

export function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
