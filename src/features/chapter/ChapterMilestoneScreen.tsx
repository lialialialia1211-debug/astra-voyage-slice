import { useGame } from '../../game/GameProvider'
import { AssetArtwork } from '../story/AssetArtwork'

export function ChapterMilestoneScreen() {
  const { state, dispatch } = useGame()

  return (
    <section className="screen-card chapter-milestone-screen">
      <p className="eyebrow">CHAPTER 01 // CANON COMPLETE</p>
      <h1>第一章正史完成</h1>
      <AssetArtwork
        alt="第一張深海航照"
        assetId="cg_main_30_first_license_departure"
        className="chapter-complete-cg"
        fallbackLabel="第一張深海航照"
      />
      <div className="chapter-complete-counts" aria-label="章節完成度">
        <strong>{state.chapterOne.completedScenes.length} / 30 幕</strong>
        <strong>{state.chapterOne.completedBattles.length} / 15 戰</strong>
      </div>
      <p className="intro-copy">
        昭黎取得第一張深海航照，30 幕唯一正史與 15 場主線戰鬥已完成。三段關係不再依靠秘密維持。
      </p>
      <div className="chapter-milestone-actions">
        <button
          onClick={() => dispatch({ type: 'REPLAY_CHAPTER_SCENE', sceneId: 'ch01_scene_01_port_bell' })}
          type="button"
        >重播第 1 幕</button>
        <button
          className="primary-action"
          onClick={() => dispatch({ type: 'REPLAY_CHAPTER_SCENE', sceneId: 'ch01_scene_30_first_deep_sea_license' })}
          type="button"
        >重播第 30 幕</button>
      </div>
    </section>
  )
}
