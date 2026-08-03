import { GameProvider, useGame } from '../game/GameProvider';
import { AdultGate } from '../features/onboarding/AdultGate';
import { CaptainSelect } from '../features/onboarding/CaptainSelect';
import { PrologueScreen } from '../features/onboarding/PrologueScreen';
import { RecruitScreen } from '../features/recruitment/RecruitScreen';
import { FormationScreen } from '../features/formation/FormationScreen';
import { LoadoutScreen } from '../features/loadout/LoadoutScreen';
import { BattleScreen } from '../features/battle/BattleScreen';
import { ResultsScreen } from '../features/battle/ResultsScreen';
import { CabinScreen } from '../features/cabin/CabinScreen';
import { GalleryScreen } from '../features/cabin/GalleryScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
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
      case 'formation':
        return <FormationScreen />;
      case 'loadout':
        return <LoadoutScreen />;
      case 'battle':
        return <BattleScreen />;
      case 'results':
        return <ResultsScreen />;
      case 'cabin':
        return <CabinScreen />;
      case 'gallery':
        return <GalleryScreen />;
      case 'settings':
        return <SettingsScreen />;
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
