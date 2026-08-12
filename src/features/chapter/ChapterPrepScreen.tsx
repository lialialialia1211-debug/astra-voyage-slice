import { chapterOneContent } from '../../chapter-one/content'
import { chapterBattleApCost, encounterForNode } from '../../chapter-one/flow'
import type { ChapterPlayableActorId } from '../../chapter-one/types'
import type { Element } from '../../domain/types'
import { useGame } from '../../game/GameProvider'
import { AssetArtwork } from '../story/AssetArtwork'

const elementLabels: Record<Element, string> = {
  fire: '火',
  water: '水',
  earth: '土',
  wind: '風',
  light: '光',
  dark: '闇',
}

const tutorialLabels = {
  'basic-attack': '全隊普攻、敵我回合、HP、勝利與戰敗重試',
  element: '六屬性相剋與昭黎主武器換屬',
  skill: '角色技能與技能目標',
  cooldown: '技能冷卻與行動節奏',
  ougi: '奧義累積與奧義連鎖',
  guard: '敵方預告、全隊防禦與 Boss 模式',
} as const

export function ChapterPrepScreen() {
  const { state, dispatch } = useGame()
  const encounter = encounterForNode(state.chapterOne.currentNode)

  if (!encounter) {
    return <section className="screen-card"><h1>找不到章節戰鬥</h1></section>
  }

  const cost = chapterBattleApCost(encounter.id, state.chapterOne.completedBattles)
  const formalUnlocked = state.chapterOne.unlockedActorIds.filter((id) => id !== 'luoen')
  const canSelectParty = encounter.partyMode === 'selectable' && formalUnlocked.length >= 4
  const savedPartyIsValid = state.chapterOne.selectedPartyIds.length === 4
    && state.chapterOne.selectedPartyIds.every((id) => formalUnlocked.includes(id))
  const activePartyIds: readonly ChapterPlayableActorId[] = canSelectParty && savedPartyIsValid
    ? state.chapterOne.selectedPartyIds
    : encounter.defaultPartyIds
  const heading = encounter.number === 1 ? '外灣救難線' : encounter.name

  function toggleParty(actorId: ChapterPlayableActorId) {
    if (actorId === 'zhaoli') return
    const current = [...activePartyIds]
    const partyIds = current.includes(actorId)
      ? current.filter((id) => id !== actorId)
      : current.length < 4
        ? [...current, actorId]
        : [...current.slice(0, 3), actorId]
    dispatch({ type: 'SET_CHAPTER_PARTY', partyIds })
  }

  function startBattle() {
    dispatch({ type: 'SET_CHAPTER_PARTY', partyIds: [...activePartyIds] })
    dispatch({ type: 'START_CHAPTER_BATTLE', now: Date.now() })
  }

  return (
    <section className="chapter-prep-screen" aria-labelledby="chapter-prep-title">
      <header className="chapter-prep-header">
        <div>
          <p className="eyebrow">BATTLE {String(encounter.number).padStart(2, '0')} / 15</p>
          <h1 id="chapter-prep-title">{heading}</h1>
          <p>
            {canSelectParty
              ? '昭黎固定在第一位；從已解鎖成員中選擇另外三人。'
              : `本戰固定隊伍：${activePartyIds.map((id) => chapterOneContent.actors.find((actor) => actor.id === id)?.name).join('／')}。`}
            昭黎的元素由本次主手決定。
          </p>
        </div>
        <div className="chapter-prep-cost">
          <strong>{cost === 0 ? '首通 0 AP' : '消耗 5 AP'}</strong>
          <span>目前 AP {state.ap.current}</span>
          <span>{state.chapterOne.completedBattles.length} / 15 戰完成</span>
        </div>
      </header>

      <div className="chapter-party-grid" aria-label="章節出戰隊伍">
        {(canSelectParty ? formalUnlocked : activePartyIds).map((actorId) => {
          const actor = chapterOneContent.actors.find((entry) => entry.id === actorId)!
          const selected = activePartyIds.includes(actorId)
          const card = (
            <>
              <AssetArtwork
                alt={`${actor.name}角色卡`}
                assetId={`chr_${actorId}_card`}
                className="chapter-party-card-art"
                fallbackLabel={actor.name}
              />
              <strong>{actor.name}</strong>
              <small>{actorId === 'zhaoli' ? '固定隊長' : selected ? '已編入' : '待命'}</small>
            </>
          )
          return canSelectParty ? (
            <button
              aria-label={`選擇${actor.name}`}
              aria-pressed={selected}
              className={`chapter-party-card ${selected ? 'is-selected' : ''}`}
              disabled={actorId === 'zhaoli'}
              key={actorId}
              onClick={() => toggleParty(actorId)}
              type="button"
            >
              {card}
            </button>
          ) : (
            <article className="chapter-party-card is-selected" key={actorId}>{card}</article>
          )
        })}
      </div>

      <div className="starter-weapon-grid" aria-label="六屬性入門主手">
        {chapterOneContent.starterWeapons.map((weapon) => {
          const selected = state.chapterOne.selectedStarterWeaponId === weapon.id
          return (
            <button
              aria-label={`選擇${weapon.name}`}
              aria-pressed={selected}
              className={`starter-weapon-card starter-weapon-card--${weapon.element}`}
              key={weapon.id}
              onClick={() => dispatch({ type: 'SELECT_STARTER_WEAPON', weaponId: weapon.id })}
              type="button"
            >
              <AssetArtwork
                alt={`${weapon.name}主手武器`}
                assetId={weapon.assetId}
                className="starter-weapon-art"
                fallbackLabel={`${elementLabels[weapon.element]}屬性`}
              />
              <span>{elementLabels[weapon.element]}屬性</span>
              <strong>{weapon.name}</strong>
              <small>{weapon.summary}</small>
            </button>
          )
        })}
      </div>

      <footer className="chapter-prep-actions">
        <p>{encounter.tutorialFocus ? `系統教學：${tutorialLabels[encounter.tutorialFocus]}` : '主線實戰：使用完整 RPG 指令完成戰鬥。'}</p>
        <button
          className="primary-action"
          disabled={state.ap.current < cost || activePartyIds.length === 0}
          onClick={startBattle}
          type="button"
        >{encounter.number === 1 ? '開始救援' : '開始戰鬥'}</button>
      </footer>
    </section>
  )
}
