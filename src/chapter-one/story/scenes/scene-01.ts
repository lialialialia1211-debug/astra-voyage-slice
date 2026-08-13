import type {
  ChapterActorPosition,
  ChapterExpression,
  ChapterSpeakerId,
  ChapterStageActor,
  ChapterStoryLine,
  ChapterStoryScene,
} from '../../types'

const backgroundAssetId = 'bg_harbor_panorama'

function actor(
  actorId: ChapterStageActor['actorId'],
  position: ChapterActorPosition,
  expression: ChapterExpression = 'neutral',
  action?: string,
): ChapterStageActor {
  return { actorId, position, expression, ...(action ? { action } : {}) }
}

function zhaoli(expression: ChapterExpression = 'neutral', action?: string) {
  return actor('zhaoli', 'left', expression, action)
}

function luoen(expression: ChapterExpression = 'neutral', action?: string) {
  return actor('luoen', 'right', expression, action)
}

function yanling(expression: ChapterExpression = 'neutral', action?: string) {
  return actor('yanling', 'center', expression, action)
}

function beat(
  speakerId: ChapterSpeakerId,
  text: string,
  actors: readonly ChapterStageActor[],
  speakerName?: string,
): ChapterStoryLine {
  return {
    speakerId,
    ...(speakerName ? { speakerName } : {}),
    text,
    actors,
    backgroundAssetId,
    tone: 'nostalgic',
    adult: false,
  }
}

const lines: readonly ChapterStoryLine[] = [
  beat('zhaoli', '這捆不出勤。', [
    zhaoli('neutral', '指腹停在磨平的繩眼。'),
    luoen(),
  ]),
  beat('luoen', '你查第二次才看見？', [
    zhaoli(),
    luoen('neutral', '單手接住繩頭，繫上報廢牌。'),
  ]),
  beat('zhaoli', '第一次確認它在，第二次確認它能用。', [zhaoli(), luoen()]),
  beat('luoen', '第三次留給接手的人看什麼？', [zhaoli(), luoen()]),
  beat('zhaoli', '繩眼磨損。左二換新纜；紅牌朝外，時刻我補。', [
    zhaoli('neutral', '把報廢時刻寫進航誌。'),
    luoen(),
  ]),
  beat('luoen', '這才像交班。', [zhaoli(), luoen('happy', '把航誌板推回昭黎面前。')]),
  beat('zhaoli', '等我有自己的船，再決定要不要查第三次。', [zhaoli('happy'), luoen()]),
  beat('luoen', '先把初級資格坐穩。自己的船不是讓你摸遍每個結。', [zhaoli(), luoen()]),
  beat('port-control', '折蘆，東入口三船衝突。昭黎主舵，洛恩監督。', [
    zhaoli('tense', '北泊調度線轉紅。'),
    luoen('tense'),
  ], '港務台'),
  beat('luoen', '你的港。', [
    zhaoli('tense'),
    luoen('neutral', '手離開舵柄，退到舵架側邊。'),
  ]),
  beat('port-control', '平穗依潮窗進港，吃水比申報深一掌。', [zhaoli('tense'), luoen()], '港務台'),
  beat('port-control', '榴星藥材怕誤晨窗；海榕有失血傷員，要求直靠醫療棧橋。', [zhaoli('tense'), luoen()], '港務台'),
  beat('zhaoli', '三線都別搶話。先報實際吃水、槳位、傷者呼吸。', [
    zhaoli('tense', '蹲低看碎冰在石階前回旋。'),
    luoen('tense'),
  ]),
  beat('port-control', '榴星右槳未收，船尾藥箱尚未固定。', [zhaoli('tense'), luoen()], '港務台'),
  beat('port-control', '海榕傷者呼吸弱，止血暫時有效。', [zhaoli('tense'), luoen()], '醫療棧橋'),
  beat('zhaoli', '榴星收右槳，退南二；海榕貼三號浮標進醫療線。', [
    zhaoli('tense', '手停在舵輪前，等三線回覆。'),
    luoen('tense'),
  ]),
  beat('port-control', '南二是我商社租的卸貨位。', [zhaoli('tense'), luoen()], '榴星號管事'),
  beat('zhaoli', '泊位是租的，救護線不是。占位十五分；藥箱先移高架棚。', [zhaoli('tense'), luoen()]),
  beat('port-control', '平穗七號照時進港。你無權改序。', [zhaoli('tense'), luoen()], '平穗押運官'),
  beat('zhaoli', '潮窗准你到港，水道由港務調。右舵四分。', [zhaoli('tense'), luoen()]),
  beat('zhaoli', '三息後回流頂尾；不停，先撞的是你自己。', [
    zhaoli('tense', '指向石階下剛翻出的暗紋。'),
    luoen('tense'),
  ]),
  beat('port-control', '回流翻了！右舷只剩半臂！', [zhaoli('tense'), luoen('tense')], '平穗舵手'),
  beat('zhaoli', '現在減半速。海榕，走你前面的窄縫。', [
    zhaoli('tense', '折蘆橫進快船與糧駁之間。'),
    luoen('tense'),
  ]),
  beat('port-control', '海榕已靠。傷者進門，仍有反應。', [zhaoli('neutral'), luoen()], '醫療棧橋'),
  beat('luoen', '回流報晚一息。', [zhaoli(), luoen('neutral', '把空白時刻推到昭黎手邊。')]),
  beat('luoen', '三艘都過了，所以你有空把那一息寫進去。', [
    zhaoli('happy'),
    luoen('happy', '等航誌補完，才讓出半掌舵位。'),
  ]),
  beat('zhaoli', '觀測晚一息；榴星等待十五分。修正與受影響者分開記。', [
    zhaoli('neutral', '補完觀測、假設與等待通知。'),
    luoen(),
  ]),
  beat('port-control', '西四泊位旁那口石井呢？港不會說沒就沒。', [zhaoli(), luoen()], '舊客船老婦'),
  beat('zhaoli', '井沒了，淺灣也填成貨場。你手上是舊圖？', [zhaoli(), luoen()]),
  beat('zhaoli', '把舊圖攤開。哪一根潮紋柱沒移過？', [
    zhaoli('neutral', '把新港圖壓在舵台另一側。'),
    luoen(),
  ]),
  beat('port-control', '這根。井在它西邊，我丈夫最後一次出海前還走過。', [zhaoli(), luoen()], '舊客船老婦'),
  beat('zhaoli', '柱沒動，水道偏了半條街。你要保船首鐵環，就走新線。', [zhaoli(), luoen()]),
  beat('port-control', '多留一臂。那個不能撞。', [zhaoli(), luoen()], '舊客船老婦'),
  beat('zhaoli', '收到。舊井位置我交岸務校驗。', [
    zhaoli('neutral', '在兩張圖的交會處畫圈。'),
    luoen(),
  ]),
  beat('zhaoli', '若舊圖會讓人不照新圖走，就要記。', [zhaoli(), luoen()]),
  beat('luoen', '那你去深洋，得帶多少紙？', [zhaoli(), luoen('happy')]),
  beat('zhaoli', '帶得動多少，就帶多少。', [zhaoli('happy'), luoen()]),
  beat('luoen', '你要自己的船，是想不必聽人，還是讓人知道你看見什麼？', [zhaoli(), luoen()]),
  beat('zhaoli', '我想去沒有圖的地方。船上的人得知道我看見什麼。', [zhaoli('soft'), luoen()]),
  beat('luoen', '還不夠。', [zhaoli(), luoen()]),
  beat('zhaoli', '也要能叫我停。', [zhaoli('neutral'), luoen()]),
  beat('luoen', '勉強像一張能考的答案。', [zhaoli(), luoen('happy')]),
  beat('port-control', '南二副跳板鉸鏈裂開，兩名工人還在上面！', [zhaoli('tense'), luoen('tense')], '榴星號管事'),
  beat('zhaoli', '折蘆貼岸頂住跳板。上面的人停步，藥箱別鬆手。', [
    zhaoli('tense', '以艇首抵住下沉的跳板。'),
    luoen('tense'),
  ]),
  beat('luoen', '備用索上柱。拉平後，一次過一人。', [
    zhaoli('tense'),
    luoen('tense', '單手收緊備用索。'),
  ]),
  beat('port-control', '人過了，藥箱也穩。你肩膀在流血。', [zhaoli('hurt'), luoen()], '榴星號管事'),
  beat('zhaoli', '擦傷。跳板是退泊帶裂的？', [zhaoli('hurt'), luoen()]),
  beat('port-control', '舊鉸鏈先裂。你敢全攬，我就告你妨礙索賠。', [zhaoli(), luoen()], '榴星號管事'),
  beat('zhaoli', '原因未確認；退泊擺動只列待查。藥材全數入棚？', [
    zhaoli('neutral', '把責任欄留白。'),
    luoen(),
  ]),
  beat('port-control', '全數入棚，無新增受潮。我簽。', [zhaoli(), luoen()], '榴星號管事'),
  beat('luoen', '你救到箱子，也別替裂鉸鏈回答。', [zhaoli(), luoen()]),
  beat('yanling', '初級引航救難員昭黎？', [
    zhaoli('tense', '手停在纜樁。'),
    yanling('neutral', '銀色識別牌轉到可見角度。'),
    luoen(),
  ]),
  beat('zhaoli', '是。晏審查官。', [zhaoli('tense'), yanling(), luoen()]),
  beat('yanling', '三項覆核：平穗吃水、榴星損失保全、你的資格屆期。', [zhaoli(), yanling(), luoen()]),
  beat('zhaoli', '三件一起？', [zhaoli(), yanling(), luoen()]),
  beat('yanling', '若你認為其中兩件與操船無關，提出理由。', [zhaoli(), yanling(), luoen()]),
  beat('zhaoli', '吃水異常已回報；等待時間有通知；資格由我本人回答。', [
    zhaoli('neutral', '將原始航誌板柄朝外遞出。'),
    yanling(),
    luoen(),
  ]),
  beat('yanling', '你把折蘆橫進兩船之間。平穗若不減速，退出角在哪裡？', [zhaoli(), yanling('tense'), luoen()]),
  beat('zhaoli', '南二泊位外緣。', [zhaoli(), yanling(), luoen()]),
  beat('yanling', '榴星當時正在退入南二。', [zhaoli(), yanling(), luoen()]),
  beat('zhaoli', '右槳已收，船尾有兩丈空隙。', [zhaoli(), yanling(), luoen()]),
  beat('yanling', '看見，還是推測？', [
    zhaoli(),
    yanling('tense', '拇指按住食指根部。'),
    luoen(),
  ]),
  beat('zhaoli', '看見。時刻在這；洛恩有獨立紀錄。', [zhaoli(), yanling(), luoen()]),
  beat('luoen', '我會交自己的紀錄，不替他答。', [zhaoli(), yanling(), luoen('neutral', '把自己的航誌留在手中。')]),
  beat('yanling', '資料保全成立。原始航誌不得重抄；資格覆核由我主審。', [
    zhaoli('hurt'),
    yanling('neutral', '印章落在保全欄，不碰私人註記。'),
    luoen(),
  ]),
  beat('zhaoli', '若我申請迴避？', [zhaoli('hurt'), yanling(), luoen()]),
  beat('yanling', '你可以依法申請迴避。理由要寫。', [zhaoli(), yanling('hurt'), luoen()]),
  beat('port-control', '外灣救難線：秋穗號主桅折斷，正向東南霧牆橫漂！', [
    zhaoli('tense'),
    yanling('tense', '退到黃色公務線外。'),
    luoen('tense'),
  ], '港務台'),
  beat('luoen', '折蘆接令。', [
    zhaoli('tense'),
    luoen('tense', '打開出勤器材櫃。'),
  ]),
  beat('zhaoli', '新纜左二，紅牌朝外。確認完畢，出勤。', [
    zhaoli('tense', '抽出新纜，兩次拉緊繩眼。'),
    luoen('tense'),
  ]),
]

export const scene01: ChapterStoryScene = {
  id: 'ch01_scene_01_port_bell',
  number: 1,
  title: '港鐘與舊情',
  location: '雲港外港',
  viewpoint: 'zhaoli',
  backgroundAssetId,
  adult: false,
  sourceFile: 'scene-01-port-bell-old-flame.md',
  lines,
}
