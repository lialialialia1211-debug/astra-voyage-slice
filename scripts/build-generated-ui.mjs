import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'work', 'imagegen', 'background-sources');
const outputRoot = path.join(projectRoot, 'public', 'assets', 'generated-ui');
const manifest = {};

const backgroundIds = [
  'bg_title_harbor',
  'bg_hub_harbor',
  'bg_recruit_observatory',
  'bg_loadout_console',
  'bg_battle_land',
  'bg_battle_ocean',
  'bg_private_cabin',
  'bg_ending_star_signal',
];

function svgDocument(width, height, body, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>${defs}</defs>${body}
  </svg>`;
}

async function writeSvgAsset(directory, id, width, height, body, defs = '') {
  const targetDirectory = path.join(outputRoot, directory);
  await mkdir(targetDirectory, { recursive: true });
  const target = path.join(targetDirectory, `${id}.webp`);
  await sharp(Buffer.from(svgDocument(width, height, body, defs)))
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(target);
  manifest[id] = `/assets/generated-ui/${directory}/${id}.webp`;
}

function frameBody(color, innerColor, ornamentColor) {
  return `
    <rect x="48" y="48" width="928" height="928" rx="68" fill="none" stroke="#07121c" stroke-opacity=".82" stroke-width="42"/>
    <rect x="54" y="54" width="916" height="916" rx="62" fill="none" stroke="${color}" stroke-width="18"/>
    <rect x="78" y="78" width="868" height="868" rx="46" fill="none" stroke="${innerColor}" stroke-opacity=".76" stroke-width="6"/>
    <path d="M62 236V112Q62 62 112 62h124M788 62h124q50 0 50 50v124M962 788v124q0 50-50 50H788M236 962H112q-50 0-50-50V788" fill="none" stroke="${ornamentColor}" stroke-width="24" stroke-linecap="round"/>
    <path d="M96 174l78-78 62 0-140 140zM928 174l-78-78-62 0 140 140zM96 850l78 78 62 0-140-140zM928 850l-78 78-62 0 140-140z" fill="${ornamentColor}" fill-opacity=".88"/>`;
}

const badgeDefs = `
  <linearGradient id="badgeMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff2c8"/><stop offset=".4" stop-color="#b9893f"/><stop offset="1" stop-color="#513318"/></linearGradient>
  <radialGradient id="badgeCore"><stop stop-color="#ffffff" stop-opacity=".92"/><stop offset=".35" stop-color="var(--core)"/><stop offset="1" stop-color="#07121c"/></radialGradient>`;

function badgeBody(core, symbol) {
  return `
    <g style="--core:${core}">
      <circle cx="256" cy="256" r="202" fill="#071522" fill-opacity=".94" stroke="url(#badgeMetal)" stroke-width="26"/>
      <circle cx="256" cy="256" r="164" fill="url(#badgeCore)" stroke="${core}" stroke-opacity=".74" stroke-width="7"/>
      <circle cx="256" cy="256" r="190" fill="none" stroke="#d7eef1" stroke-opacity=".34" stroke-width="3" stroke-dasharray="15 15"/>
      ${symbol}
    </g>`;
}

const symbols = {
  badge_fire: '<path d="M268 115c22 72-27 83 7 132 16-34 47-43 48-89 43 49 63 98 42 153-24 63-84 91-143 67-58-24-88-89-59-145 20-39 61-61 105-118z" fill="#ffb05c" stroke="#fff2c2" stroke-width="9"/>',
  badge_water: '<path d="M256 103c-26 55-105 126-105 194 0 61 47 108 105 108s105-47 105-108c0-68-79-139-105-194z" fill="#4dd9ef" stroke="#e6fbff" stroke-width="10"/><path d="M201 311c12 38 49 58 86 44" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="12" stroke-linecap="round"/>',
  badge_wind: '<path d="M121 220h207c41 0 54-58 12-69-29-7-47 13-48 35M107 274h248c51 0 53 72 8 83-30 7-51-12-54-36M151 329h93" fill="none" stroke="#baf4d6" stroke-width="24" stroke-linecap="round"/>',
  badge_earth: '<path d="M111 346l104-190 55 82 39-58 92 166H111z" fill="#b9d26a" stroke="#f5f1bd" stroke-width="10"/><path d="M188 346l70-112 68 112" fill="#806a36" fill-opacity=".72"/>',
  badge_light: '<path d="M256 102l39 105 111 8-87 69 27 108-90-61-90 61 27-108-87-69 111-8 39-105z" fill="#fff3aa" stroke="#fff" stroke-width="9"/>',
  badge_dark: '<circle cx="256" cy="256" r="116" fill="#6d5aa9" stroke="#e3d6ff" stroke-width="10"/><circle cx="304" cy="214" r="118" fill="#101729"/><circle cx="184" cy="182" r="11" fill="#d7c9ff"/><circle cx="330" cy="326" r="8" fill="#d7c9ff"/>',
};

function controlDefs(base, edge, glow) {
  return `
    <linearGradient id="controlFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${base}"/><stop offset="1" stop-color="#091522"/></linearGradient>
    <linearGradient id="controlEdge" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${edge}"/><stop offset=".5" stop-color="${glow}"/><stop offset="1" stop-color="${edge}"/></linearGradient>`;
}

function buttonBody(yOffset = 0) {
  return `
    <rect x="48" y="${48 + yOffset}" width="928" height="288" rx="76" fill="#020810" fill-opacity=".62"/>
    <rect x="56" y="${56 + yOffset}" width="912" height="272" rx="68" fill="url(#controlFill)" stroke="url(#controlEdge)" stroke-width="12"/>
    <path d="M128 ${94 + yOffset}h768M128 ${290 + yOffset}h768" stroke="#fff" stroke-opacity=".12" stroke-width="4"/>
    <path d="M78 ${192 + yOffset}l52-52v104zM946 ${192 + yOffset}l-52-52v104z" fill="url(#controlEdge)" fill-opacity=".84"/>`;
}

function longFrameBody(color, accent) {
  return `
    <rect x="32" y="32" width="1984" height="192" rx="68" fill="#06111d" fill-opacity=".84" stroke="#02070d" stroke-width="24"/>
    <rect x="42" y="42" width="1964" height="172" rx="58" fill="none" stroke="${color}" stroke-width="9"/>
    <path d="M72 128h220l54-54h1356l54 54h220M72 128h220l54 54h1356l54-54h220" fill="none" stroke="${accent}" stroke-opacity=".78" stroke-width="5"/>
    <circle cx="1024" cy="42" r="13" fill="${accent}"/><circle cx="1024" cy="214" r="13" fill="${accent}"/>`;
}

for (const id of backgroundIds) {
  const directory = path.join(outputRoot, 'backgrounds');
  await mkdir(directory, { recursive: true });
  const target = path.join(directory, `${id}.webp`);
  await sharp(path.join(sourceRoot, `${id}.png`))
    .resize(2560, 1440, { fit: 'cover', position: 'centre' })
    .webp({ quality: 88, smartSubsample: true })
    .toFile(target);
  manifest[id] = `/assets/generated-ui/backgrounds/${id}.webp`;
}

await writeSvgAsset('frames', 'frame_common', 1024, 1024, frameBody('#56788b', '#b7d6dc', '#6bc6d2'));
await writeSvgAsset('frames', 'frame_r', 1024, 1024, frameBody('#a8753c', '#e0b978', '#76512d'));
await writeSvgAsset('frames', 'frame_sr', 1024, 1024, frameBody('#a9cbd1', '#efffff', '#55c7d8'));
await writeSvgAsset('frames', 'frame_ssr', 1024, 1024, frameBody('#d7a93f', '#fff0a7', '#f4d36c'));

for (const [id, symbol] of Object.entries(symbols)) {
  const core = {
    badge_fire: '#e85e45', badge_water: '#2bb8da', badge_wind: '#4bc985',
    badge_earth: '#a38b4d', badge_light: '#f4d66e', badge_dark: '#68519b',
  }[id];
  await writeSvgAsset('badges', id, 512, 512, badgeBody(core, symbol), badgeDefs);
}

await writeSvgAsset('controls', 'button_idle', 1024, 384, buttonBody(), controlDefs('#183449', '#9b7436', '#e6c56d'));
await writeSvgAsset('controls', 'button_hover', 1024, 384, buttonBody(), controlDefs('#24536a', '#b48a42', '#9beaf1'));
await writeSvgAsset('controls', 'button_pressed', 1024, 384, buttonBody(7), controlDefs('#102637', '#785728', '#c29a4a'));
await writeSvgAsset('controls', 'boss_mode_frame', 2048, 256, longFrameBody('#b95a50', '#f2a36f'));
await writeSvgAsset('controls', 'charge_frame', 2048, 256, longFrameBody('#4cb9c9', '#ead06e'));

await writeSvgAsset('controls', 'dialog_plate', 2048, 512, `
  <rect x="64" y="64" width="1920" height="384" rx="48" fill="#06111d" fill-opacity=".94" stroke="#02070d" stroke-width="36"/>
  <rect x="76" y="76" width="1896" height="360" rx="38" fill="none" stroke="#a47d3d" stroke-width="9"/>
  <rect x="96" y="96" width="1856" height="320" rx="28" fill="none" stroke="#72cbd5" stroke-opacity=".42" stroke-width="4"/>
  <path d="M88 166V88h78M1882 88h78v78M1960 346v78h-78M166 424H88v-78" fill="none" stroke="#e5c76d" stroke-width="15"/>
  <circle cx="128" cy="128" r="15" fill="#72cbd5"/><circle cx="1920" cy="128" r="15" fill="#72cbd5"/>`);

await writeSvgAsset('controls', 'tab_plate', 1024, 256, `
  <path d="M52 224V92q0-52 52-52h746l122 92v92H52z" fill="#0c2233" fill-opacity=".96" stroke="#020810" stroke-width="28"/>
  <path d="M62 218V98q0-46 46-46h738l112 84v82H62z" fill="none" stroke="#a47d3d" stroke-width="9"/>
  <path d="M108 82h708l76 58H108z" fill="#72cbd5" fill-opacity=".12"/>`);

await writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${Object.keys(manifest).length} UI assets.`);
