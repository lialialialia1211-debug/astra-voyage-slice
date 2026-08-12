import { render, screen } from '@testing-library/react'
import { App } from '../../app/App'
import { chapterOneContent } from '../../chapter-one/content'
import { createInitialState } from '../../game/initial-state'
import { createSaveRepository } from '../../game/storage'

it('shows the completed canonical chapter after scene thirty', () => {
  const initial = createInitialState(0)
  createSaveRepository(window.localStorage).save({
    ...initial,
    adultConfirmed: true,
    screen: 'chapter-milestone',
    chapterOne: {
      ...initial.chapterOne,
      currentNode: 'chapter-complete',
      activeSceneId: 'ch01_scene_30_first_deep_sea_license',
      completedScenes: chapterOneContent.scenes.map((scene) => scene.id),
      completedBattles: chapterOneContent.encounters.map((encounter) => encounter.id),
      unlockedActorIds: ['zhaoli', 'mila', 'yanling', 'yilan', 'saifula', 'hanze'],
    },
  })

  render(<App />)

  expect(screen.getByRole('heading', { name: '第一章正史完成' })).toBeVisible()
  expect(screen.getByText('30 / 30 幕')).toBeVisible()
  expect(screen.getByText('15 / 15 戰')).toBeVisible()
  expect(screen.getByRole('img', { name: '第一張深海航照' })).toBeVisible()
})
