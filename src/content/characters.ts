import type { CharacterDefinition } from '../domain/types';

export const characters = [
  {
    id: 'chr_01',
    name: '焰衛',
    age: 28,
    element: 'fire',
    role: 'vanguard',
    maxHp: 1450,
    attack: 390,
    skills: [
      { id: 'armor-break', name: '熔甲突擊', cooldown: 4, target: 'enemy', power: 160, effect: 'break' },
      { id: 'intercept', name: '防線接管', cooldown: 5, target: 'all-allies', power: 0, effect: 'guard' },
    ],
    passive: '港都守誓',
    ougi: { name: '旭焰斷潮', power: 520 },
  },
  {
    id: 'chr_02',
    name: '潮工',
    age: 27,
    element: 'water',
    role: 'caster',
    maxHp: 1180,
    attack: 420,
    skills: [
      { id: 'pressure-wave', name: '壓差震波', cooldown: 4, target: 'enemy', power: 175, effect: 'break' },
      { id: 'tide-shield', name: '潮汐護幕', cooldown: 5, target: 'all-allies', power: 260, effect: 'shield' },
    ],
    passive: '深潛校準',
    ougi: { name: '藍界崩解', power: 540 },
  },
  {
    id: 'chr_03',
    name: '風航',
    age: 24,
    element: 'wind',
    role: 'support',
    maxHp: 1090,
    attack: 360,
    skills: [
      { id: 'tailwind', name: '順風航線', cooldown: 4, target: 'all-allies', power: 20, effect: 'charge' },
      { id: 'crosswind', name: '側風掃射', cooldown: 3, target: 'all-enemies', power: 120 },
    ],
    passive: '空域直覺',
    ougi: { name: '天穹迴旋', power: 500 },
  },
  {
    id: 'chr_04',
    name: '光醫',
    age: 31,
    element: 'light',
    role: 'healer',
    maxHp: 1260,
    attack: 310,
    skills: [
      { id: 'spectrum-heal', name: '光譜療癒', cooldown: 4, target: 'all-allies', power: 320, effect: 'heal' },
      { id: 'sterile-field', name: '無菌光場', cooldown: 5, target: 'all-allies', power: 0, effect: 'cleanse' },
    ],
    passive: '生體分析',
    ougi: { name: '白晝再生', power: 460 },
  },
] as const satisfies readonly CharacterDefinition[];
