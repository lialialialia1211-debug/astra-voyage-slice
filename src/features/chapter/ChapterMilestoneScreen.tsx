import { useGame } from '../../game/GameProvider';

export function ChapterMilestoneScreen() {
  const { dispatch } = useGame();

  return (
    <section className="screen-card chapter-milestone-screen">
      <p className="eyebrow">VERTICAL SLICE COMPLETE</p>
      <h1>第 3 幕尚未實裝</h1>
      <p className="intro-copy">
        你已完成第1幕〈港鐘與舊情〉、第2幕〈黑船返航〉與戰鬥1〈外灣救難線〉。
        後續會沿唯一正史接續製作。
      </p>
      <div className="chapter-milestone-actions">
        <button
          onClick={() => dispatch({ type: 'REPLAY_CHAPTER_SCENE', sceneId: 'ch01_scene_01_port_bell' })}
          type="button"
        >重播第 1 幕</button>
        <button className="primary-action" onClick={() => dispatch({ type: 'REPLAY_CHAPTER_BATTLE' })} type="button">
          重播戰鬥 1
        </button>
      </div>
    </section>
  );
}
