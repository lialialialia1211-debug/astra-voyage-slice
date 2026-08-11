import type {
  ChapterActorDefinition,
  ChapterBattleActorDefinition,
  ChapterEncounterDefinition,
  ChapterStoryLine,
  ChapterStoryScene,
  StarterWeaponDefinition,
} from './types';

const actors = [
  {
    id: 'zhaoli',
    name: '昭黎',
    age: 22,
    element: 'variable',
    role: 'captain',
    portraitAssetPrefix: 'chr_zhaoli_story',
    battleAssetId: 'chr_zhaoli_battle_idle',
  },
  {
    id: 'yanling',
    name: '晏泠',
    age: 24,
    element: 'wind',
    role: 'controller',
    portraitAssetPrefix: 'chr_yanling_story',
    battleAssetId: 'chr_yanling_battle_idle',
  },
  {
    id: 'luoen',
    name: '洛恩',
    age: 46,
    element: 'water',
    role: 'vanguard',
    portraitAssetPrefix: 'chr_luoen_story',
    battleAssetId: 'chr_luoen_battle_idle',
  },
] as const satisfies readonly ChapterActorDefinition[];

const scene01Lines = [
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '潮生港每天醒兩次。第二次，是港鐘讓所有船在同一刻知道誰該讓、誰該救。',
    actors: [],
    tone: 'dawn',
    audio: { bgmId: 'bgm_harbor_dawn', ambienceId: 'amb_harbor_morning', sfxId: 'sfx_port_bell_short' },
  },
  {
    speakerId: 'zhaoli',
    text: '拖纜的繩眼又被翻面藏起來了。昨夜班很有想像力。',
    actors: [{ actorId: 'zhaoli', position: 'center', expression: 'neutral' }],
  },
  {
    speakerId: 'luoen',
    text: '你查第二次才看見？',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'neutral' },
      { actorId: 'zhaoli', position: 'right', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '第一次確認它在，第二次確認它能用。等我有自己的船，再決定要不要查第三次。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'neutral' },
      { actorId: 'zhaoli', position: 'right', expression: 'happy' },
    ],
  },
  {
    speakerId: 'luoen',
    text: '先把初級資格坐穩。自己的船，不是讓你一個人把每個結摸到天亮。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'tense' },
      { actorId: 'zhaoli', position: 'right', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '昭黎望過最後一盞護航燈。他想要的不是酒館故事，而是一艘能在名冊上寫下自己名字的船。',
    actors: [{ actorId: 'zhaoli', position: 'center', expression: 'soft' }],
  },
  {
    speakerId: 'port-control',
    speakerName: '港務台',
    text: '折蘆，東入口三船衝突。昭黎主舵，洛恩監督。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'neutral' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
    ],
    audio: { sfxId: 'sfx_radio_open' },
  },
  {
    speakerId: 'luoen',
    text: '你的港。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'soft' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
    ],
  },
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '糧駁、快船與載著重傷員的漁船，被退潮推進只能容兩船錯身的窄口。',
    actors: [],
    backgroundAssetId: 'bg_outer_bay_rescue_pier',
    tone: 'neutral',
  },
  {
    speakerId: 'harbor-voice',
    speakerName: '海榕船員',
    text: '人快沒氣了，讓開！',
    actors: [{ actorId: 'zhaoli', position: 'center', expression: 'tense' }],
  },
  {
    speakerId: 'zhaoli',
    text: '榴星號收右槳，退南二空泊。海榕貼三號浮標內緣直進醫療棧橋。平穗七號減半速。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'neutral' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
    ],
  },
  {
    speakerId: 'harbor-voice',
    speakerName: '榴星號管事',
    text: '南二是我商社租的卸貨位！',
    actors: [{ actorId: 'zhaoli', position: 'center', expression: 'neutral' }],
  },
  {
    speakerId: 'zhaoli',
    text: '泊位是租的，救護航道不是。藥箱先移高架棚，十五分後還位。',
    actors: [{ actorId: 'zhaoli', position: 'center', expression: 'angry' }],
  },
  {
    speakerId: 'harbor-voice',
    speakerName: '平穗七號押運官',
    text: '潮窗由公議署共同核發，你無權改序。',
    actors: [
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
      { actorId: 'luoen', position: 'left', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '潮窗准你到港，進哪條水道由港務調。三息後回流頂尾，你不停，先撞的是自己。',
    actors: [{ actorId: 'zhaoli', position: 'center', expression: 'angry' }],
  },
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '第三息，回流推動重船船尾。押運官終於減速，海榕從讓出的窄縫鑽向醫療棧橋。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'neutral' },
      { actorId: 'zhaoli', position: 'right', expression: 'hurt' },
    ],
    audio: { sfxId: 'sfx_hull_creak' },
  },
  {
    speakerId: 'luoen',
    text: '報回流晚了一息。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'tense' },
      { actorId: 'zhaoli', position: 'right', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '三艘都過了。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'tense' },
      { actorId: 'zhaoli', position: 'right', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'luoen',
    text: '所以你有空把那一息寫進去。船長不是最後一個不肯停的人。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'soft' },
      { actorId: 'zhaoli', position: 'right', expression: 'soft' },
    ],
  },
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '折蘆靠回南棧橋。港務塔下，一名穿深灰公服的女人抱著封印箱等待。',
    actors: [{ actorId: 'zhaoli', position: 'right', expression: 'tense' }],
    backgroundAssetId: 'bg_harbor_panorama',
  },
  {
    speakerId: 'yanling',
    text: '初級引航救難員昭黎？',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'neutral' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '是。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'neutral' },
      { actorId: 'zhaoli', position: 'right', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '我是航安事故審查官晏泠。你的原始航誌不得重抄，資格覆核由我主審。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'tense' },
      { actorId: 'zhaoli', position: 'right', expression: 'hurt' },
      { actorId: 'luoen', position: 'center', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '審查官沒有別的人？',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'tense' },
      { actorId: 'zhaoli', position: 'right', expression: 'angry' },
      { actorId: 'luoen', position: 'center', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '你可以依法申請迴避。理由要寫。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'hurt' },
      { actorId: 'zhaoli', position: 'right', expression: 'hurt' },
    ],
  },
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '新的拖纜已被放在昭黎慣用的左側第二格。晏泠沒有看他，兩人都沒有問她為什麼仍記得。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'soft' },
      { actorId: 'zhaoli', position: 'right', expression: 'soft' },
    ],
  },
  {
    speakerId: 'port-control',
    speakerName: '港務台',
    text: '外灣救難線啟動。南泊商船秋穗號主桅折斷，折蘆立即出勤。',
    actors: [
      { actorId: 'luoen', position: 'left', expression: 'tense' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
      { actorId: 'yanling', position: 'center', expression: 'tense' },
    ],
    audio: { sfxId: 'sfx_rescue_alarm' },
  },
] as const satisfies readonly ChapterStoryLine[];

const scene02Lines = [
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '晏泠第一次看見遠溟三號時，先看見昭黎。折蘆只剩霧裡一枚逆浪的黃點。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'tense' }],
    tone: 'warning',
    audio: { bgmId: 'bgm_black_ship_approach', ambienceId: 'amb_outer_bay_wind' },
  },
  {
    speakerId: 'yanling',
    text: '折蘆現有退出線？',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'neutral' }],
  },
  {
    speakerId: 'port-control',
    speakerName: '外灣觀測員',
    text: '北偏西，貼四號外灣標返回。秋穗號再二十息可拖離。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'tense' }],
  },
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '東外環第一盞觀測燈轉紅。那組燈只監測深潮線方向的界壓。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'hurt' }],
    audio: { sfxId: 'sfx_warning_light' },
  },
  {
    speakerId: 'port-control',
    speakerName: '外灣觀測員',
    text: '第二盞轉紅。三座塔分用不同供能，不像單一儀器故障。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'tense' }],
  },
  {
    speakerId: 'narration',
    speakerName: '晏泠',
    text: '她怕昭黎死。不是怕報告多一個名字，而是怕那個被她親手放開的人沉進無法找回屍身的海。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'hurt' }],
  },
  {
    speakerId: 'port-control',
    speakerName: '外灣觀測員',
    text: '第三盞觀測燈轉紅！',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'angry' }],
    audio: { sfxId: 'sfx_warning_triple' },
  },
  {
    speakerId: 'yanling',
    text: '敲長鐘。所有非救難船停槳降帆，把我名字記在發令人欄。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'angry' }],
    audio: { sfxId: 'sfx_port_bell_long' },
  },
  {
    speakerId: 'harbor-voice',
    speakerName: '南泊代表',
    text: '你們困住我們的貨，卻不保證賠償。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'tense' }],
  },
  {
    speakerId: 'yanling',
    text: '封港只能決定現在不能移動，不能預先免除瀾國該負的損失。每一次命令都留下時刻。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'neutral' }],
  },
  {
    speakerId: 'yanling',
    text: '折蘆，回報可中止點。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'tense' },
      { actorId: 'luoen', position: 'right', expression: 'neutral' },
    ],
    audio: { sfxId: 'sfx_radio_open' },
  },
  {
    speakerId: 'luoen',
    text: '秋穗號殘桅已脫離破船角。現在放棄，商船會重新橫漂，但船員可自行處理。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'tense' },
      { actorId: 'luoen', position: 'right', expression: 'tense' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '完成二十息。之後沿北線退回，不得接近霧牆。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'angry' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '北線下層潮向西北，會把船尾推回秋穗號。申請改走原東標線。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'angry' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '原線界壓上升，未獲准。你只能證明表層。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'hurt' },
      { actorId: 'zhaoli', position: 'right', expression: 'hurt' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '收到。二十息後再報。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'hurt' },
      { actorId: 'zhaoli', position: 'right', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'narration',
    speakerName: '航行紀錄',
    text: '霧牆裡亮起青白光。焦黑木材、鉚接金屬與灰色異質物組成的黑船逆潮現身。',
    actors: [],
    backgroundAssetId: 'bg_outer_bay_quarantine_black_fog',
    cgAssetId: 'cg_main_02_black_ship_return',
    tone: 'black-tide',
    audio: { sfxId: 'sfx_black_ship_pulse' },
  },
  {
    speakerId: 'zhaoli',
    text: '黑船周圍有兩層潮。折蘆申請先向北切兩船長，再回港。',
    actors: [
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
      { actorId: 'luoen', position: 'left', expression: 'tense' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '駁回。巡航二艇，橫封四號內線。折蘆取消返回內港資格。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'angry' },
      { actorId: 'zhaoli', position: 'right', expression: 'hurt' },
    ],
  },
  {
    speakerId: 'port-control',
    speakerName: '值勤官',
    text: '折蘆還在封線外。命令一落，他們沒有退路。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'hurt' }],
  },
  {
    speakerId: 'yanling',
    text: '留下來的不是退路，是把未知帶進城的入口。執行。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'angry' }],
  },
  {
    speakerId: 'zhaoli',
    text: '四號線是你封的？',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'hurt' },
      { actorId: 'zhaoli', position: 'right', expression: 'angry' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '命令由航安事故審查官晏泠簽發。折蘆不得返回內港。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'hurt' },
      { actorId: 'zhaoli', position: 'right', expression: 'angry' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '折蘆收到。秋穗號自行返港，我艇轉歸潮灣。',
    actors: [
      { actorId: 'zhaoli', position: 'right', expression: 'neutral' },
      { actorId: 'luoen', position: 'left', expression: 'tense' },
    ],
  },
  {
    speakerId: 'port-control',
    speakerName: '外灣觀測員',
    text: '黑船右舷有脫落物——是救生艇。艇內發現一名生還者！',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'tense' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
      { actorId: 'luoen', position: 'center', expression: 'tense' },
    ],
    audio: { sfxId: 'sfx_rescue_alarm' },
  },
  {
    speakerId: 'zhaoli',
    text: '救生艇二十息內會撞回黑船。申請救援。',
    actors: [
      { actorId: 'zhaoli', position: 'right', expression: 'angry' },
      { actorId: 'yanling', position: 'left', expression: 'tense' },
      { actorId: 'luoen', position: 'center', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '提出不接觸黑船的方案。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'angry' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
    ],
  },
  {
    speakerId: 'zhaoli',
    text: '浮囊送纜，沉纜從艇底轉向，只勾船尾斷樁。兩層潮下次重合約六息，誤差半息。',
    actors: [
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
      { actorId: 'luoen', position: 'left', expression: 'neutral' },
    ],
  },
  {
    speakerId: 'yanling',
    text: '折蘆可執行單次拋纜。間隔偏差超過半息，立即中止。',
    actors: [
      { actorId: 'yanling', position: 'left', expression: 'hurt' },
      { actorId: 'zhaoli', position: 'right', expression: 'tense' },
      { actorId: 'luoen', position: 'center', expression: 'tense' },
    ],
  },
  {
    speakerId: 'narration',
    speakerName: '晏泠',
    text: '她把封線理由寫進原始紀錄：審查官知悉折蘆主舵者為未申報成年舊交，私人關係可能影響判斷。',
    actors: [{ actorId: 'yanling', position: 'center', expression: 'hurt' }],
  },
  {
    speakerId: 'zhaoli',
    text: '收到。洛恩，準備拋纜。',
    actors: [
      { actorId: 'zhaoli', position: 'right', expression: 'angry' },
      { actorId: 'luoen', position: 'left', expression: 'angry' },
      { actorId: 'yanling', position: 'center', expression: 'tense' },
    ],
    audio: { sfxId: 'sfx_harpoon_ready' },
  },
] as const satisfies readonly ChapterStoryLine[];

const scenes = [
  {
    id: 'ch01_scene_01_port_bell',
    number: 1,
    title: '港鐘與舊情',
    location: '潮生港・南棧橋',
    viewpoint: 'zhaoli',
    backgroundAssetId: 'bg_harbor_panorama',
    lines: scene01Lines,
  },
  {
    id: 'ch01_scene_02_black_ship',
    number: 2,
    title: '黑船返航',
    location: '潮生港・港務塔與外灣',
    viewpoint: 'yanling',
    backgroundAssetId: 'bg_outer_bay_quarantine',
    lines: scene02Lines,
  },
] as const satisfies readonly ChapterStoryScene[];

const starterWeapons = [
  { id: 'wpn_fire_01', name: '逆焰舵刃', element: 'fire', summary: '以高熱切開纜結與外殼。', assetId: 'wpn_fire_01' },
  { id: 'wpn_water_01', name: '回潮長槍', element: 'water', summary: '借潮勢維持穩定輸出。', assetId: 'wpn_water_01' },
  { id: 'wpn_earth_01', name: '錨岩重斧', element: 'earth', summary: '以重量壓住失控船體。', assetId: 'wpn_earth_01' },
  { id: 'wpn_wind_01', name: '斷風航弓', element: 'wind', summary: '從安全距離切斷障礙。', assetId: 'wpn_wind_01' },
  { id: 'wpn_light_01', name: '晨燈儀杖', element: 'light', summary: '以導航光標定救援線。', assetId: 'wpn_light_01' },
  { id: 'wpn_dark_01', name: '深痕短刃', element: 'dark', summary: '沿異常潮痕破壞核心。', assetId: 'wpn_dark_01' },
] as const satisfies readonly StarterWeaponDefinition[];

const battleActors = [
  {
    id: 'zhaoli',
    name: '昭黎',
    element: 'water',
    maxHp: 1380,
    attack: 380,
    skills: [
      { id: 'course-correction', name: '航向修正', cooldown: 4, power: 150 },
      { id: 'shared-stop-line', name: '共同中止線', cooldown: 5, power: 0 },
    ],
    ougi: { name: '越過最後一燈', power: 520 },
  },
  {
    id: 'luoen',
    name: '洛恩',
    element: 'water',
    maxHp: 1620,
    attack: 330,
    skills: [
      { id: 'towline-lock', name: '拖纜鎖定', cooldown: 4, power: 145 },
      { id: 'relief-watch', name: '替班監督', cooldown: 5, power: 0 },
    ],
    ougi: { name: '折蘆回轉', power: 480 },
  },
] as const satisfies readonly ChapterBattleActorDefinition[];

const encounters = [
  {
    id: 'ch01_b01_outer_bay_rescue',
    name: '外灣救難線',
    kind: 'tutorial',
    fixedPartyIds: ['zhaoli', 'luoen'],
    enemy: {
      id: 'enemy_rescue_wreckage',
      name: '失控殘骸群',
      element: 'wind',
      maxHp: 2600,
      attack: 145,
      assetId: 'enemy_rescue_wreckage',
    },
    tutorialSteps: ['attack', 'enemy-turn', 'hp', 'victory-defeat'],
  },
] as const satisfies readonly ChapterEncounterDefinition[];

export const chapterOneContent = Object.freeze({
  actors,
  battleActors,
  scenes,
  starterWeapons,
  encounters,
});
