import { chapterOneContent } from '../../chapter-one/content';
import { nodeAfterBattle, sceneForNode } from '../../chapter-one/flow';
import { content } from '../../content';
import { useGame } from '../../game/GameProvider';

export function ResultsScreen() {
  const { state, dispatch } = useGame();
  const chapterResult = state.chapterOne.lastResult;
  const encounter = content.encounters.find((entry) => entry.id === state.currentEncounterId);
  const victory = state.lastResult === 'victory';
  const stageResult = state.lastStageRewards;
  const stage = content.stages.find((entry) => entry.id === stageResult?.stageId);
  const postStoryUnread = Boolean(stage && !state.viewedStories.includes(stage.postStoryId));

  if (chapterResult) {
    const victory = chapterResult === 'victory';
    const chapterEncounter = chapterOneContent.encounters.find(
      (entry) => entry.id === state.chapterOne.activeEncounterId,
    );
    const nextNode = chapterEncounter ? nodeAfterBattle(chapterEncounter.id) : null;
    const nextScene = nextNode ? sceneForNode(nextNode) : undefined;
    return (
      <section className={`screen-card result-screen result-screen--${chapterResult}`}>
        <p className="eyebrow">CHAPTER 01 // BATTLE {String(chapterEncounter?.number ?? 1).padStart(2, '0')}</p>
        <h1>{victory ? '主線戰鬥完成' : '作戰失敗'}</h1>
        <p className="result-encounter">{chapterEncounter?.name ?? '章節戰鬥'}</p>
        {victory ? (
          <>
            <p className="intro-copy">
              戰鬥結果已寫入唯一正史，下一站為第 {nextScene?.number ?? '?'} 幕〈{nextScene?.title ?? '未知'}〉。
            </p>
            <button
              className="primary-action"
              onClick={() => dispatch({ type: 'CONTINUE_CHAPTER' })}
              type="button"
            >前往第 {nextScene?.number ?? '?'} 幕</button>
          </>
        ) : (
          <>
            <p className="ap-refund">已退還 AP {state.chapterOne.paidAp}</p>
            <p className="intro-copy">戰敗不改變正史。回到戰前準備後，可更換昭黎的主手再試一次。</p>
            <button
              className="primary-action"
              onClick={() => dispatch({ type: 'REPLAY_CHAPTER_BATTLE' })}
              type="button"
            >返回戰前準備</button>
          </>
        )}
      </section>
    );
  }

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
          <p className="intro-copy">全員關係經驗 +{stageResult?.relationXp ?? 40}，遠征紀錄已寫入本機存檔。</p>
          {stageResult && (
            <div className="result-rewards" aria-label="任務獎勵">
              <p>遠征點數 +{stageResult.clear.expeditionPoints + stageResult.firstClear.expeditionPoints}</p>
              {(stageResult.clear.surfaceAlloy + stageResult.firstClear.surfaceAlloy) > 0 && <p>地表合金 +{stageResult.clear.surfaceAlloy + stageResult.firstClear.surfaceAlloy}</p>}
              {(stageResult.clear.ruinChip + stageResult.firstClear.ruinChip) > 0 && <p>遺跡晶片 +{stageResult.clear.ruinChip + stageResult.firstClear.ruinChip}</p>}
              {(stageResult.clear.leylineCore + stageResult.firstClear.leylineCore) > 0 && <p>地脈核心 +{stageResult.clear.leylineCore + stageResult.firstClear.leylineCore}</p>}
              {(stageResult.clear.fieldRation + stageResult.firstClear.fieldRation) > 0 && <p>遠征補給劑 +{stageResult.clear.fieldRation + stageResult.firstClear.fieldRation}</p>}
              {stageResult.seaUnlocked && <strong>新航路開放：潮汐戰線</strong>}
            </div>
          )}
          <button
            className="primary-action"
            type="button"
            onClick={() => {
              if (stage && postStoryUnread) {
                dispatch({ type: 'START_STORY', storyId: stage.postStoryId, returnScreen: 'expedition-map' });
                return;
              }
              dispatch({ type: 'NAVIGATE', screen: stageResult ? 'expedition-map' : 'cabin' });
            }}
          >
            {stageResult ? (postStoryUnread ? '繼續戰後劇情' : '返回地表地圖') : '返回私人艙室'}
          </button>
        </>
      ) : (
        <>
          <p className="enemy-hp-remaining">敵方剩餘生命：{(state.lastEnemyHp ?? 0).toLocaleString()}</p>
          {stageResult && <p className="ap-refund">已退還 AP {stageResult.refundedAp}</p>}
          <ul className="defeat-advice">
            <li>留意敵方預告，面對全體攻擊時改用全隊防禦。</li>
            <li>累積至 100% 後選取多名角色，可發動奧義連鎖。</li>
          </ul>
          <button
            className="primary-action"
            type="button"
            onClick={() => dispatch(stageResult
              ? { type: 'NAVIGATE', screen: 'loadout' }
              : { type: 'START_ENCOUNTER', encounterId: encounter.id })}
          >{stageResult ? '調整艦裝後重試' : '以原編成重試'}</button>
        </>
      )}
    </section>
  );
}
