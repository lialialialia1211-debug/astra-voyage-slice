import { z } from 'zod';

export const elementSchema = z.enum(['fire', 'water', 'wind', 'earth', 'light', 'dark']);
export const characterIdSchema = z.enum(['chr_01', 'chr_02', 'chr_03', 'chr_04']);
export const weaponIdSchema = z.enum([
  'wpn_01_sunblade',
  'wpn_02_molten_lance',
  'wpn_03_tidemark_axe',
  'wpn_04_resonance_staff',
  'wpn_05_fireline_dagger',
  'wpn_06_route_bow',
  'wpn_07_expedition_rifle',
  'wpn_08_shoreguard_shield',
  'wpn_09_astrolabe',
  'wpn_10_dawn_greatblade',
  'wpn_11_depth_anchor',
  'wpn_12_void_prism',
]);
export const summonIdSchema = z.enum(['smn_01_solar_leviathan', 'smn_02_abyssal_oracle']);
export const encounterIdSchema = z.enum([
  'enc_tutorial',
  'enc_surface_ruins',
  'enc_orbital_outpost',
  'enc_leyline_core',
  'enc_tidal_boss',
]);
export const eventIdSchema = z.enum(['evt_chr02_bond03', 'evt_chr02_status', 'evt_chr02_defeat']);
export const stageIdSchema = z.enum([
  'land_01_port_defense',
  'land_02_surface_ruins',
  'land_03_orbital_outpost',
  'land_04_leyline_core',
]);
export const storySceneIdSchema = z.enum([
  'story_land_01_pre',
  'story_land_01_post',
  'story_land_02_pre',
  'story_land_02_post',
  'story_land_03_pre',
  'story_land_03_post',
  'story_land_04_pre',
  'story_land_04_post',
]);

export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cooldown: z.number().int().min(1).max(12),
  target: z.enum(['self', 'ally', 'enemy', 'all-allies', 'all-enemies']),
  power: z.number().int().min(0),
  effect: z.enum(['shield', 'break', 'charge', 'heal', 'cleanse', 'guard']).optional(),
});

export const characterSchema = z.object({
  id: characterIdSchema,
  name: z.string().min(1),
  age: z.number().int().min(18),
  element: elementSchema,
  role: z.enum(['vanguard', 'caster', 'support', 'healer']),
  maxHp: z.number().int().positive(),
  attack: z.number().int().positive(),
  skills: z.tuple([skillSchema, skillSchema]),
  passive: z.string().min(1),
  ougi: z.object({ name: z.string().min(1), power: z.number().int().positive() }),
});

export const weaponSchema = z.object({
  id: weaponIdSchema,
  name: z.string().min(1),
  element: elementSchema,
  hp: z.number().int().nonnegative(),
  attack: z.number().int().positive(),
  skill: z.object({
    kind: z.enum(['might', 'vitality', 'ougi-cap']),
    value: z.number().int().positive(),
  }),
  mainHandPower: z.number().int().positive(),
});

export const summonSchema = z.object({
  id: summonIdSchema,
  name: z.string().min(1),
  element: elementSchema,
  effect: z.enum(['damage', 'heal-and-shield']),
  power: z.number().int().positive(),
});

const enemyActionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  power: z.number().int().nonnegative(),
  target: z.enum(['single', 'all']),
  telegraphed: z.boolean(),
  statusId: z.string().min(1).optional(),
});

const enemySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  element: elementSchema,
  maxHp: z.number().int().positive(),
  attack: z.number().int().positive(),
  modeGauge: z.number().int().nonnegative(),
  actions: z.array(enemyActionSchema).min(1),
});

export const encounterSchema = z.object({
  id: encounterIdSchema,
  name: z.string().min(1),
  kind: z.enum(['tutorial', 'normal', 'boss']),
  enemies: z.array(enemySchema).min(1),
  victoryFlag: z.string().min(1),
});

export const rewardBundleSchema = z.object({
  expeditionPoints: z.number().int().nonnegative(),
  surfaceAlloy: z.number().int().nonnegative(),
  ruinChip: z.number().int().nonnegative(),
  leylineCore: z.number().int().nonnegative(),
  fieldRation: z.number().int().nonnegative(),
});

export const stageSchema = z.object({
  id: stageIdSchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  encounterId: encounterIdSchema,
  apCost: z.union([z.literal(5), z.literal(10)]),
  prerequisite: stageIdSchema.nullable(),
  preStoryId: storySceneIdSchema,
  postStoryId: storySceneIdSchema,
  clearRewards: rewardBundleSchema,
  firstClearRewards: rewardBundleSchema,
});

export const storySceneSchema = z.object({
  id: storySceneIdSchema,
  title: z.string().min(1),
  location: z.string().min(1),
  background: z.enum(['port', 'ruins', 'outpost', 'core']),
  lines: z.array(z.object({
    speakerId: z.union([z.literal('captain'), characterIdSchema, z.literal('narration')]),
    text: z.string().min(1),
    expression: z.enum(['neutral', 'happy', 'tense', 'angry', 'hurt']).optional(),
    side: z.enum(['left', 'right']).optional(),
  })).min(3),
});

export const eventSchema = z.object({
  id: eventIdSchema,
  characterId: characterIdSchema,
  title: z.string().min(1),
  requiredRelationLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  requiredFlags: z.array(z.string().min(1)),
  assetId: z.string().regex(/^evt_chr02_(bond03|status|defeat)_cg01$/),
  adult: z.literal(true),
});

function hasUniqueIds(items: readonly { id: string }[]) {
  return new Set(items.map((item) => item.id)).size === items.length;
}

export const contentRegistrySchema = z
  .object({
    characters: z.array(characterSchema).length(4),
    weapons: z.array(weaponSchema).length(12),
    summons: z.array(summonSchema).length(2),
    encounters: z.array(encounterSchema).length(5),
    events: z.array(eventSchema).length(3),
    stages: z.array(stageSchema).length(4),
    stories: z.array(storySceneSchema).length(8),
  })
  .superRefine((registry, context) => {
    for (const [key, items] of Object.entries(registry)) {
      if (!hasUniqueIds(items)) {
        context.addIssue({ code: 'custom', message: `${key} 含有重複 ID`, path: [key] });
      }
    }
  });
