export type Element = 'fire' | 'water' | 'wind' | 'earth' | 'light' | 'dark';
export type CaptainId = 'cap_m' | 'cap_f';
export type CharacterId = 'chr_01' | 'chr_02' | 'chr_03' | 'chr_04';
export type WeaponId =
  | 'wpn_01_sunblade'
  | 'wpn_02_molten_lance'
  | 'wpn_03_tidemark_axe'
  | 'wpn_04_resonance_staff'
  | 'wpn_05_fireline_dagger'
  | 'wpn_06_route_bow'
  | 'wpn_07_expedition_rifle'
  | 'wpn_08_shoreguard_shield'
  | 'wpn_09_astrolabe'
  | 'wpn_10_dawn_greatblade'
  | 'wpn_11_depth_anchor'
  | 'wpn_12_void_prism';
export type SummonId = 'smn_01_solar_leviathan' | 'smn_02_abyssal_oracle';
export type EncounterId = 'enc_tutorial' | 'enc_tidal_boss';
export type EventId = 'evt_chr02_bond03' | 'evt_chr02_status' | 'evt_chr02_defeat';

export type SkillTarget = 'self' | 'ally' | 'enemy' | 'all-allies' | 'all-enemies';
export type SkillEffect = 'shield' | 'break' | 'charge' | 'heal' | 'cleanse' | 'guard';

export interface SkillDefinition {
  id: string;
  name: string;
  cooldown: number;
  target: SkillTarget;
  power: number;
  effect?: SkillEffect | undefined;
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  age: number;
  element: Element;
  role: 'vanguard' | 'caster' | 'support' | 'healer';
  maxHp: number;
  attack: number;
  skills: readonly [SkillDefinition, SkillDefinition];
  passive: string;
  ougi: { name: string; power: number };
}

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  element: Element;
  hp: number;
  attack: number;
  skill: { kind: 'might' | 'vitality' | 'ougi-cap'; value: number };
  mainHandPower: number;
}

export interface SummonDefinition {
  id: SummonId;
  name: string;
  element: Element;
  effect: 'damage' | 'heal-and-shield';
  power: number;
}

export interface EnemyActionDefinition {
  id: string;
  name: string;
  power: number;
  target: 'single' | 'all';
  telegraphed: boolean;
  statusId?: string | undefined;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  element: Element;
  maxHp: number;
  attack: number;
  modeGauge: number;
  actions: readonly EnemyActionDefinition[];
}

export interface EncounterDefinition {
  id: EncounterId;
  name: string;
  kind: 'tutorial' | 'boss';
  enemies: readonly EnemyDefinition[];
  victoryFlag: string;
}

export interface EventDefinition {
  id: EventId;
  characterId: CharacterId;
  title: string;
  requiredRelationLevel: 1 | 2 | 3 | 4;
  requiredFlags: readonly string[];
  assetId: string;
  adult: true;
}

export interface ContentRegistry {
  characters: readonly CharacterDefinition[];
  weapons: readonly WeaponDefinition[];
  summons: readonly SummonDefinition[];
  encounters: readonly EncounterDefinition[];
  events: readonly EventDefinition[];
}
