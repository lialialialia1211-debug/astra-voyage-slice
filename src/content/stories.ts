import type { StorySceneDefinition } from '../domain/types';

export const stories = [
  {
    id: 'story_land_01_pre',
    title: '遠征前的警報',
    location: '港都・第一遠征碼頭',
    background: 'port',
    lines: [
      { speakerId: 'narration', text: '遠征艦即將離港，尖銳警報卻先一步劃破港區。' },
      { speakerId: 'chr_01', expression: 'angry', side: 'left', text: '東側防線失去回報。艦長，請把第一次命令交給我。' },
      { speakerId: 'captain', expression: 'tense', side: 'right', text: '全員轉入戰鬥配置。先守住港口，再追查襲擊來源。' },
      { speakerId: 'chr_03', expression: 'happy', side: 'left', text: '航線已重新標定。只要港口還在，我就能帶大家回來。' },
    ],
  },
  {
    id: 'story_land_01_post',
    title: '不屬於港都的訊號',
    location: '港都・殘骸回收區',
    background: 'port',
    lines: [
      { speakerId: 'chr_04', expression: 'neutral', side: 'left', text: '傷員狀況穩定。這批無人機的能源反應卻不像現代製品。' },
      { speakerId: 'chr_02', expression: 'tense', side: 'right', text: '外殼來自港都，核心編碼卻源自地表遺跡，而且還在向外發訊。' },
      { speakerId: 'captain', expression: 'neutral', side: 'left', text: '把座標送進遠征系統。我們從陸地開始追。' },
      { speakerId: 'narration', text: '第一條遠征路線亮起，終點指向被人類文明遺忘的設施群。' },
    ],
  },
  {
    id: 'story_land_02_pre',
    title: '荒原之下',
    location: '地表遺跡・外圍通道',
    background: 'ruins',
    lines: [
      { speakerId: 'narration', text: '鏽蝕閘門在風沙中開啟，沉睡多年的照明逐盞甦醒。' },
      { speakerId: 'chr_02', expression: 'happy', side: 'left', text: '管線還有壓力。這裡曾同時服務深海港與軌道設施。' },
      { speakerId: 'chr_01', expression: 'neutral', side: 'right', text: '前方有大型反應。不是無人機，是守衛。' },
      { speakerId: 'captain', expression: 'tense', side: 'left', text: '保持陣形，回收資料比摧毀設施更重要。' },
    ],
  },
  {
    id: 'story_land_02_post',
    title: '兩個方向',
    location: '地表遺跡・控制室',
    background: 'ruins',
    lines: [
      { speakerId: 'chr_02', expression: 'neutral', side: 'left', text: '找到了。訊號被分成兩束，一束沉入海底，一束送往軌道升降機。' },
      { speakerId: 'chr_03', expression: 'tense', side: 'right', text: '升降機早就停用了，但前哨還可能保存最後一次傳輸。' },
      { speakerId: 'chr_04', expression: 'happy', side: 'left', text: '回收材料足以強化裝備。我建議整備後再前進。' },
      { speakerId: 'captain', expression: 'neutral', side: 'right', text: '先掌握地表全貌，再決定我們要向海底還是星空出發。' },
    ],
  },
  {
    id: 'story_land_03_pre',
    title: '沉默的升降機',
    location: '軌道升降機・地表前哨',
    background: 'outpost',
    lines: [
      { speakerId: 'narration', text: '巨塔沒入雲層，前哨能源在遠征隊接近時自行啟動。' },
      { speakerId: 'chr_03', expression: 'happy', side: 'left', text: '高空風場仍在運作。給我一點時間，我能讓觀測陣列重新上線。' },
      { speakerId: 'chr_01', expression: 'angry', side: 'right', text: '守衛從三個方向接近。它們不打算給我們時間。' },
      { speakerId: 'captain', expression: 'tense', side: 'left', text: '焰衛守住入口，其他人跟著風航推進控制塔。' },
    ],
  },
  {
    id: 'story_land_03_post',
    title: '來自地底的回聲',
    location: '軌道升降機・觀測台',
    background: 'outpost',
    lines: [
      { speakerId: 'chr_03', expression: 'hurt', side: 'left', text: '軌道端沒有任何回覆……不，等等，訊號被地面反射回來了。' },
      { speakerId: 'chr_02', expression: 'tense', side: 'right', text: '反射源在我們腳下。遺跡把深海座標藏進了地脈核心。' },
      { speakerId: 'chr_04', expression: 'neutral', side: 'left', text: '核心周圍的能量正在升高，守衛系統也會一起甦醒。' },
      { speakerId: 'captain', expression: 'neutral', side: 'right', text: '完成補給。我們在地表的最後一站，就是那座核心。' },
    ],
  },
  {
    id: 'story_land_04_pre',
    title: '文明的封印',
    location: '地脈核心・封鎖層',
    background: 'core',
    lines: [
      { speakerId: 'narration', text: '古代閘門封死退路，地脈光芒在巨型守衛胸口匯聚。' },
      { speakerId: 'chr_04', expression: 'tense', side: 'left', text: '它不是單純防衛遺跡，而是在阻止核心座標被重新讀取。' },
      { speakerId: 'chr_01', expression: 'happy', side: 'right', text: '那就讓它看看，現在的人類也有保護文明的力量。' },
      { speakerId: 'captain', expression: 'tense', side: 'left', text: '遠征隊，突破封鎖。把通往下一片世界的座標帶回港都。' },
    ],
  },
  {
    id: 'story_land_04_post',
    title: '海洋航線',
    location: '地脈核心・座標室',
    background: 'core',
    lines: [
      { speakerId: 'chr_02', expression: 'happy', side: 'left', text: '座標解開了。訊號先沉入深海，再從另一端射向星空。' },
      { speakerId: 'chr_03', expression: 'happy', side: 'right', text: '港都已收到完整航路。海洋遠征許可正在送來。' },
      { speakerId: 'captain', expression: 'happy', side: 'left', text: '地表只是起點。下一站，潮汐守望者所在的深海入口。' },
      { speakerId: 'narration', text: '黃銅航線越過海岸，在遠方海面點亮第一座未知座標。' },
    ],
  },
] as const satisfies readonly StorySceneDefinition[];
