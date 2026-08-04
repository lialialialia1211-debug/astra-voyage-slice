import { useEffect, useMemo, useState } from 'react';
import { content } from '../../content';
import type { RewardBundle } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { AP_MAX, AP_RECOVERY_MS, isStageUnlocked } from './progression';

const rewardNames: Record<keyof RewardBundle, string> = {
  expeditionPoints: '遠征點數',
  surfaceAlloy: '地表合金',
  ruinChip: '遺跡晶片',
  leylineCore: '地脈核心',
  fieldRation: '補給劑',
};

function rewardText(rewards: RewardBundle): string {
  return (Object.entries(rewards) as [keyof RewardBundle, number][])
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${rewardNames[key]} ${value}`)
    .join('・');
}

export function ExpeditionMapScreen() {
  const { state, dispatch } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const selected = content.stages.find((stage) => stage.id === state.selectedStageId) ?? content.stages[0]!;
  const unlocked = isStageUnlocked(selected, state.firstClears);
  const cleared = state.firstClears.includes(selected.id);
  const seaUnlocked = state.firstClears.includes('land_04_leyline_core');
  const nextAp = useMemo(() => {
    if (state.ap.current >= AP_MAX) return '已滿';
    const remaining = Math.max(0, state.ap.lastRecoveredAt + AP_RECOVERY_MS - now);
    const minutes = Math.floor(remaining / 60_000);
    const seconds = Math.ceil((remaining % 60_000) / 1_000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [now, state.ap]);

  useEffect(() => {
    dispatch({ type: 'SYNC_AP', now: Date.now() });
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [dispatch]);

  function challengeSelected() {
    dispatch({ type: 'SELECT_STAGE', stageId: selected.id });
    if (!state.viewedStories.includes(selected.preStoryId)) {
      dispatch({ type: 'START_STORY', storyId: selected.preStoryId, returnScreen: 'loadout' });
      return;
    }
    dispatch({ type: 'NAVIGATE', screen: 'loadout' });
  }

  return (
    <section className="expedition-map-screen" aria-labelledby="expedition-map-title">
      <header className="expedition-map-header">
        <div>
          <p className="eyebrow">HUMAN SURFACE // CHAPTER 01</p>
          <h1 id="expedition-map-title">地表遠征路線</h1>
        </div>
        <div className="expedition-resource-bar">
          <strong>AP {state.ap.current} / {AP_MAX}</strong>
          <span>恢復 {nextAp}</span>
          <span>補給劑 {state.inventory.fieldRation}</span>
          <button
            disabled={state.inventory.fieldRation < 1 || state.ap.current >= AP_MAX}
            type="button"
            onClick={() => dispatch({ type: 'USE_FIELD_RATION', now: Date.now() })}
          >使用補給劑 +15</button>
          <span>遠征點數 {state.inventory.expeditionPoints.toLocaleString()}</span>
        </div>
      </header>

      <nav className="expedition-utility-nav" aria-label="遠征功能">
        <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'formation' })}>隊伍編成</button>
        <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'growth' })}>角色／武器強化</button>
        <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'cabin' })}>私人艙室</button>
        <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'settings' })}>顯示設定</button>
      </nav>

      <div className="expedition-map-layout">
        <div className="land-route" aria-label="陸地關卡">
          <div className="route-line" aria-hidden="true" />
          {content.stages.map((stage, index) => {
            const stageUnlocked = isStageUnlocked(stage, state.firstClears);
            const stageCleared = state.firstClears.includes(stage.id);
            const status = stageCleared ? '已首通' : stageUnlocked ? '可挑戰' : '未解鎖';
            return (
              <button
                aria-current={stage.id === selected.id ? 'step' : undefined}
                aria-label={`${stage.name}，${status}`}
                className={`route-node route-node--${index + 1} ${stageCleared ? 'is-cleared' : ''}`}
                disabled={!stageUnlocked}
                key={stage.id}
                type="button"
                onClick={() => dispatch({ type: 'SELECT_STAGE', stageId: stage.id })}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{stage.name}</strong>
                <small>{status}・AP {stage.apCost}</small>
              </button>
            );
          })}
          <button
            className="sea-route-node"
            disabled={!seaUnlocked}
            type="button"
            onClick={() => dispatch({ type: 'START_ENCOUNTER', encounterId: 'enc_tidal_boss' })}
          >
            {seaUnlocked ? '進入海洋航線' : '海洋航線・擊破地脈核心後解鎖'}
          </button>
        </div>

        <aside className="stage-detail-panel">
          <p className="eyebrow">SELECTED MISSION</p>
          <h2>{selected.name}</h2>
          <p>{selected.summary}</p>
          <dl>
            <div><dt>狀態</dt><dd>{cleared ? '已首通／可重打' : unlocked ? '可挑戰' : '未解鎖'}</dd></div>
            <div><dt>消耗</dt><dd>AP {selected.apCost}</dd></div>
            <div><dt>固定掉落</dt><dd>{rewardText(selected.clearRewards)}</dd></div>
            <div><dt>首次追加</dt><dd>{cleared ? '已領取' : rewardText(selected.firstClearRewards)}</dd></div>
          </dl>
          <button
            className="primary-action"
            disabled={!unlocked}
            type="button"
            onClick={challengeSelected}
          >挑戰{selected.name}</button>
          <div className="story-replay-actions">
            <button
              disabled={!state.viewedStories.includes(selected.preStoryId)}
              type="button"
              onClick={() => dispatch({ type: 'START_STORY', storyId: selected.preStoryId, returnScreen: 'expedition-map' })}
            >重播戰前劇情</button>
            <button
              disabled={!state.viewedStories.includes(selected.postStoryId)}
              type="button"
              onClick={() => dispatch({ type: 'START_STORY', storyId: selected.postStoryId, returnScreen: 'expedition-map' })}
            >重播戰後劇情</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
