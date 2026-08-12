import { battleEncounterFor } from './engine';
import type { BattleState } from './types';

interface BattleHudProps {
  battle: BattleState;
}

export function BattleHud({ battle }: BattleHudProps) {
  const encounter = battleEncounterFor(battle.contentSet, battle.encounterId);
  const boss = battle.enemies[0];

  return (
    <header className="battle-hud">
      <div>
        <p className="eyebrow">TURN {battle.turn} · {battle.bossMode.toUpperCase()}</p>
        <h1 id="battle-title">{encounter?.name ?? battle.encounterId}</h1>
      </div>
      <div className="enemy-readout">
        {battle.enemies.map((enemy) => {
          const definition = encounter?.enemies.find((entry) => entry.id === enemy.id);
          const hpPercent = Math.round(enemy.hp / enemy.maxHp * 100);
          return (
            <div className="enemy-meter" key={enemy.id}>
              <span>{definition?.name ?? enemy.id}</span>
              <progress aria-label={`${definition?.name ?? enemy.id} 生命`} max={enemy.maxHp} value={enemy.hp} />
              <small>{enemy.hp.toLocaleString()} / {enemy.maxHp.toLocaleString()} · {hpPercent}%</small>
            </div>
          );
        })}
        {encounter?.kind === 'boss' && boss && (
          <div className={`mode-gauge mode-gauge--${battle.bossMode}`}>
            <span>MODE · {battle.bossMode.toUpperCase()}</span>
            <progress aria-label="模式量表" max={100} value={battle.modeGauge} />
          </div>
        )}
      </div>
      {battle.telegraph && (
        <div className="battle-telegraph" role="alert">
          <strong>預告：{battle.telegraph.name}</strong>
          <span>{battle.telegraph.target === 'all' ? '全體攻擊警報' : '單體攻擊警報'}</span>
        </div>
      )}
    </header>
  );
}
