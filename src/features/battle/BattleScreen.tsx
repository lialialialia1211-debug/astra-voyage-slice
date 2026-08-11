import { useState } from 'react';
import { chapterOneContent } from '../../chapter-one/content';
import { content } from '../../content';
import type { CharacterId } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { calculateLoadout } from '../loadout/calculate-loadout';
import { AssetArtwork } from '../story/AssetArtwork';
import { BattleHud } from './BattleHud';
import {
  battleCharacterFor,
  battleEncounterFor,
  createBattle,
  resolveTurn,
  useSkill,
} from './engine';
import type { BattleActorId, BattleCommand, BattleState } from './types';

interface BattleStageProps {
  initialBattle: BattleState;
  onComplete: (battle: BattleState) => void;
  onSnapshot?: (battle: BattleState) => void;
}

function actorName(battle: BattleState, actorId: string) {
  return battleCharacterFor(battle.contentSet, actorId)?.name ?? actorId;
}

function partyAssetId(battle: BattleState, actorId: string): string {
  if (battle.contentSet === 'legacy') return `${actorId}_battle_idle`;
  return chapterOneContent.actors.find((actor) => actor.id === actorId)?.battleAssetId ?? actorId;
}

function enemyAssetId(battle: BattleState, enemyId: string): string {
  if (battle.contentSet === 'chapter-one') {
    return chapterOneContent.encounters
      .find((encounter) => encounter.id === battle.encounterId)?.enemy.assetId ?? enemyId;
  }
  return enemyId.startsWith('boss_')
    ? `${enemyId}_${battle.bossMode === 'break' ? 'break' : 'idle'}`
    : enemyId;
}

export function BattleStage({ initialBattle, onComplete, onSnapshot }: BattleStageProps) {
  const tutorial = initialBattle.contentSet === 'chapter-one';
  const [battle, setBattle] = useState(initialBattle);
  const [message, setMessage] = useState(tutorial
    ? '選擇全隊攻擊，昭黎與洛恩會依序行動。'
    : '技能階段：可先施放技能，再發動全隊攻擊。');
  const [ougiActors, setOugiActors] = useState<Set<BattleActorId>>(() => new Set());
  const [motion, setMotion] = useState('');
  const encounter = battleEncounterFor(battle.contentSet, battle.encounterId);

  function commit(next: BattleState, nextMessage: string, nextMotion: string) {
    setBattle(next);
    setMessage(nextMessage);
    setMotion(nextMotion);
    onSnapshot?.(next);
    if (next.result) onComplete(next);
  }

  function runCommand(command: BattleCommand, nextMessage: string) {
    try {
      const result = resolveTurn(battle, command, 1);
      const tutorialMessage = result.state.result === 'victory'
        ? '救援線已清除。這就是勝利；戰敗時可退還 AP 並重新挑戰。'
        : result.state.result === 'defeat'
          ? '救援失敗。已記錄戰敗，返回準備後可以重試。'
          : '敵方回合已結束。留意雙方 HP，準備下一次全隊攻擊。';
      commit(
        result.state,
        tutorial ? tutorialMessage : nextMessage,
        command.kind === 'summon' ? 'battle-cast' : 'battle-hit',
      );
      if (command.kind === 'attack') setOugiActors(new Set());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '指令無法執行');
    }
  }

  function activateSkill(actorId: BattleActorId, skillId: string) {
    const actor = battle.party.find((entry) => entry.id === actorId);
    const targetId = battle.enemies.find((enemy) => enemy.hp > 0)?.id ?? actorId;
    try {
      const next = useSkill(battle, actorId, skillId, targetId, 1);
      commit(next, `${actorName(battle, actorId)}施放技能`, 'battle-cast');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '技能無法執行');
    }
  }

  function toggleOugi(actorId: BattleActorId) {
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
            return (
              <AssetArtwork
                alt={`${definition?.name ?? enemy.id}敵人立繪`}
                assetId={enemyAssetId(battle, enemy.id)}
                className={enemy.hp <= 0 ? 'is-defeated battle-enemy-art' : 'battle-enemy-art'}
                fallbackLabel={definition?.name ?? enemy.id}
                key={enemy.id}
              />
            );
          })}
        </div>
        <p className="battle-message" aria-live="polite">{message}</p>
      </div>
      <div className={`party-command-row ${tutorial ? 'party-command-row--tutorial' : ''}`}>
        {battle.party.map((actor) => {
          const definition = battleCharacterFor(battle.contentSet, actor.id);
          if (!definition) return null;
          const ougiSelected = ougiActors.has(definition.id);
          return (
            <article className="battle-party-card" key={actor.id}>
              <AssetArtwork
                alt={`${definition.name}戰鬥立繪`}
                assetId={partyAssetId(battle, actor.id)}
                className="battle-party-art"
                fallbackLabel="戰鬥立繪待匯入"
              />
              <div className="party-card-heading">
                <strong>{definition.name}</strong><span>{actor.element}</span>
              </div>
              <progress aria-label={`${definition.name} 生命`} max={actor.maxHp} value={actor.hp} />
              <small>HP {actor.hp.toLocaleString()} / {actor.maxHp.toLocaleString()}</small>
              {!tutorial && (
                <>
                  <div className="charge-line"><span>奧義</span><progress aria-label={`${definition.name} 奧義`} max={100} value={actor.charge} /><b>{actor.charge}%</b></div>
                  <div className="skill-buttons">
                    {definition.skills.map((skill) => {
                      const cooldown = actor.cooldowns[skill.id] ?? 0;
                      return (
                        <button disabled={actor.hp <= 0 || cooldown > 0} key={skill.id} onClick={() => activateSkill(definition.id, skill.id)} type="button">
                          {skill.name}{cooldown > 0 ? ` · ${cooldown}` : ''}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    aria-pressed={ougiSelected}
                    className="ougi-toggle"
                    disabled={actor.charge < 100 || actor.hp <= 0}
                    onClick={() => toggleOugi(definition.id)}
                    type="button"
                  >{ougiSelected ? '奧義待發' : '選擇奧義'}</button>
                </>
              )}
            </article>
          );
        })}
      </div>
      <footer className="battle-actions">
        {!tutorial && (
          <>
            <button
              className="secondary-action"
              disabled={battle.summonUsed || battle.summonId === null}
              onClick={() => runCommand({ kind: 'summon' }, '召喚核心已啟動')}
              type="button"
            >召喚</button>
            <button className="secondary-action" onClick={() => runCommand({ kind: 'attack', guard: true }, '全隊進入防禦姿態')} type="button">全隊防禦</button>
          </>
        )}
        <button
          className="primary-action"
          onClick={() => runCommand(
            { kind: 'attack', useOugi: ougiActors.size > 0, ougiActorIds: [...ougiActors] },
            ougiActors.size > 0 ? '奧義連鎖發動' : '全隊攻擊完成',
          )}
          type="button"
        >全隊攻擊</button>
      </footer>
    </section>
  );
}

interface LegacyBattleSessionProps {
  encounterId: NonNullable<ReturnType<typeof useGame>['state']['currentEncounterId']>;
  partyIds: readonly CharacterId[];
}

function LegacyBattleSession({ encounterId, partyIds }: LegacyBattleSessionProps) {
  const { state, dispatch } = useGame();
  const totals = calculateLoadout(state.weaponGrid, content.weapons, state.weaponLevels);
  const [initialBattle] = useState(() => {
    if (state.battleSnapshot?.contentSet === 'legacy'
      && state.battleSnapshot.encounterId === encounterId) return state.battleSnapshot;
    return createBattle({
      contentSet: 'legacy',
      encounterId,
      partyIds,
      loadoutAttack: totals.attack,
      loadoutHp: totals.hp,
      summonId: state.summonId,
      characterLevels: state.characterLevels,
    });
  });

  return (
    <BattleStage
      initialBattle={initialBattle}
      onSnapshot={(battle) => {
        if (state.activeChallenge) dispatch({ type: 'SAVE_BATTLE_SNAPSHOT', battle });
      }}
      onComplete={(finished) => {
        const encounter = content.encounters.find((entry) => entry.id === encounterId);
        const flags = finished.result === 'victory' && encounter
          ? [...finished.flags, encounter.victoryFlag]
          : finished.flags;
        const result = finished.result ?? 'defeat';
        const enemyHp = finished.enemies.reduce((sum, enemy) => sum + enemy.hp, 0);
        if (state.activeChallenge) dispatch({ type: 'FINISH_STAGE', result, flags, enemyHp });
        else dispatch({ type: 'FINISH_ENCOUNTER', result, flags, enemyHp });
      }}
    />
  );
}

function ChapterBattleSession() {
  const { state, dispatch } = useGame();
  const encounterId = state.chapterOne.activeEncounterId!;
  const weapon = chapterOneContent.starterWeapons.find(
    (entry) => entry.id === state.chapterOne.selectedStarterWeaponId,
  )!;
  const [initialBattle] = useState(() => {
    if (state.chapterOne.battleSnapshot?.contentSet === 'chapter-one'
      && state.chapterOne.battleSnapshot.encounterId === encounterId) {
      return state.chapterOne.battleSnapshot;
    }
    return createBattle({
      contentSet: 'chapter-one',
      encounterId,
      partyIds: ['zhaoli', 'luoen'],
      elementOverrides: { zhaoli: weapon.element },
      loadoutAttack: 0,
      loadoutHp: 0,
      summonId: null,
    });
  });

  return (
    <BattleStage
      initialBattle={initialBattle}
      onSnapshot={(battle) => dispatch({ type: 'SAVE_CHAPTER_BATTLE_SNAPSHOT', battle })}
      onComplete={(finished) => dispatch({
        type: 'FINISH_CHAPTER_BATTLE',
        result: finished.result ?? 'defeat',
        flags: finished.flags,
        enemyHp: finished.enemies.reduce((sum, enemy) => sum + enemy.hp, 0),
      })}
    />
  );
}

export function BattleScreen() {
  const { state } = useGame();
  if (state.chapterOne.activeEncounterId) return <ChapterBattleSession />;

  const partyIds = state.party.filter((id): id is CharacterId => id !== null);
  if (!state.currentEncounterId || partyIds.length !== 4) {
    return <section className="screen-card"><h1>戰鬥資料不完整</h1></section>;
  }
  return <LegacyBattleSession encounterId={state.currentEncounterId} partyIds={partyIds} />;
}
