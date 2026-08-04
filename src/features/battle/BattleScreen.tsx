import { useState } from 'react';
import { content } from '../../content';
import type { CharacterId } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { userAssetUrl } from '../../lib/user-assets';
import { calculateLoadout } from '../loadout/calculate-loadout';
import { BattleHud } from './BattleHud';
import { createBattle, resolveTurn, useSkill } from './engine';
import type { BattleCommand, BattleState } from './types';

interface BattleStageProps {
  initialBattle: BattleState;
  onComplete: (battle: BattleState) => void;
}

function actorName(actorId: string) {
  return content.characters.find((character) => character.id === actorId)?.name ?? actorId;
}

export function BattleStage({ initialBattle, onComplete }: BattleStageProps) {
  const [battle, setBattle] = useState(initialBattle);
  const [message, setMessage] = useState('技能階段：可先施放技能，再發動全隊攻擊。');
  const [ougiActors, setOugiActors] = useState<Set<CharacterId>>(() => new Set());
  const [motion, setMotion] = useState('');
  const encounter = content.encounters.find((entry) => entry.id === battle.encounterId);

  function commit(next: BattleState, nextMessage: string, nextMotion: string) {
    setBattle(next);
    setMessage(nextMessage);
    setMotion(nextMotion);
    if (next.result) onComplete(next);
  }

  function runCommand(command: BattleCommand, nextMessage: string) {
    try {
      const result = resolveTurn(battle, command, 1);
      commit(result.state, nextMessage, command.kind === 'summon' ? 'battle-cast' : 'battle-hit');
      if (command.kind === 'attack') setOugiActors(new Set());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '指令無法執行');
    }
  }

  function activateSkill(actorId: CharacterId, skillId: string) {
    const actor = battle.party.find((entry) => entry.id === actorId);
    const targetId = battle.enemies.find((enemy) => enemy.hp > 0)?.id ?? actorId;
    try {
      const next = useSkill(battle, actorId, skillId, targetId, 1);
      commit(next, `${actorName(actorId)}施放技能`, 'battle-cast');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '技能無法執行');
    }
  }

  function toggleOugi(actorId: CharacterId) {
    setOugiActors((current) => {
      const next = new Set(current);
      if (next.has(actorId)) next.delete(actorId);
      else next.add(actorId);
      return next;
    });
  }

  return (
    <section className={`battle-screen battle-screen--${battle.encounterId} ${motion}`} aria-labelledby="battle-title">
      <BattleHud battle={battle} />
      <div className="battle-stage" aria-label="戰鬥區域">
        <div className="enemy-silhouettes">
          {battle.enemies.map((enemy) => {
            const definition = encounter?.enemies.find((entry) => entry.id === enemy.id);
            const assetId = enemy.id.startsWith('boss_')
              ? `${enemy.id}_${battle.bossMode === 'break' ? 'break' : 'idle'}`
              : enemy.id;
            return (
              <img
                alt={`${definition?.name ?? enemy.id}敵人立繪`}
                className={enemy.hp <= 0 ? 'is-defeated' : ''}
                key={enemy.id}
                src={userAssetUrl(assetId) ?? undefined}
              />
            );
          })}
        </div>
        <p className="battle-message" aria-live="polite">{message}</p>
      </div>
      <div className="party-command-row">
        {battle.party.map((actor) => {
          const definition = content.characters.find((character) => character.id === actor.id);
          if (!definition) return null;
          const ougiSelected = ougiActors.has(definition.id);
          return (
            <article className="battle-party-card" key={actor.id}>
              {userAssetUrl(`${definition.id}_battle_idle`) && (
                <img
                  alt={`${definition.name}戰鬥立繪`}
                  className="battle-party-art"
                  src={userAssetUrl(`${definition.id}_battle_idle`) ?? undefined}
                />
              )}
              <div className="party-card-heading">
                <strong>{definition.name}</strong><span>{definition.element}</span>
              </div>
              <progress aria-label={`${definition.name} 生命`} max={actor.maxHp} value={actor.hp} />
              <small>HP {actor.hp.toLocaleString()} / {actor.maxHp.toLocaleString()}</small>
              <div className="charge-line"><span>奧義</span><progress aria-label={`${definition.name} 奧義`} max={100} value={actor.charge} /><b>{actor.charge}%</b></div>
              <div className="skill-buttons">
                {definition.skills.map((skill) => {
                  const cooldown = actor.cooldowns[skill.id] ?? 0;
                  return (
                    <button disabled={actor.hp <= 0 || cooldown > 0} key={skill.id} type="button" onClick={() => activateSkill(definition.id, skill.id)}>
                      {skill.name}{cooldown > 0 ? ` · ${cooldown}` : ''}
                    </button>
                  );
                })}
              </div>
              <button
                aria-pressed={ougiSelected}
                className="ougi-toggle"
                disabled={actor.charge < 100 || actor.hp <= 0}
                type="button"
                onClick={() => toggleOugi(definition.id)}
              >
                {ougiSelected ? '奧義待發' : '選擇奧義'}
              </button>
            </article>
          );
        })}
      </div>
      <footer className="battle-actions">
        <button
          className="secondary-action"
          disabled={battle.summonUsed || battle.summonId === null}
          type="button"
          onClick={() => runCommand({ kind: 'summon' }, '召喚核心已啟動')}
        >召喚</button>
        <button className="secondary-action" type="button" onClick={() => runCommand({ kind: 'attack', guard: true }, '全隊進入防禦姿態')}>全隊防禦</button>
        <button
          className="primary-action"
          type="button"
          onClick={() => runCommand({ kind: 'attack', useOugi: ougiActors.size > 0, ougiActorIds: [...ougiActors] }, ougiActors.size > 0 ? '奧義連鎖發動' : '全隊攻擊完成')}
        >全隊攻擊</button>
      </footer>
    </section>
  );
}

interface BattleSessionProps {
  encounterId: NonNullable<ReturnType<typeof useGame>['state']['currentEncounterId']>;
  partyIds: readonly CharacterId[];
}

function BattleSession({ encounterId, partyIds }: BattleSessionProps) {
  const { state, dispatch } = useGame();
  const totals = calculateLoadout(state.weaponGrid, content.weapons);
  const [initialBattle] = useState(() => createBattle({
    encounterId,
    partyIds,
    loadoutAttack: totals.attack,
    loadoutHp: totals.hp,
    summonId: state.summonId,
  }));

  return (
    <BattleStage
      initialBattle={initialBattle}
      onComplete={(finished) => {
        const encounter = content.encounters.find((entry) => entry.id === encounterId);
        const flags = finished.result === 'victory' && encounter
          ? [...finished.flags, encounter.victoryFlag]
          : finished.flags;
        dispatch({
          type: 'FINISH_ENCOUNTER',
          result: finished.result ?? 'defeat',
          flags,
          enemyHp: finished.enemies.reduce((sum, enemy) => sum + enemy.hp, 0),
        });
      }}
    />
  );
}

export function BattleScreen() {
  const { state } = useGame();
  const partyIds = state.party.filter((id): id is CharacterId => id !== null);
  if (!state.currentEncounterId || partyIds.length !== 4) {
    return <section className="screen-card"><h1>戰鬥資料不完整</h1></section>;
  }
  return <BattleSession encounterId={state.currentEncounterId} partyIds={partyIds} />;
}
