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
export const encounterIdSchema = z.enum(['enc_tutorial', 'enc_tidal_boss']);
export const eventIdSchema = z.enum(['evt_chr02_bond03', 'evt_chr02_status', 'evt_chr02_defeat']);

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
  kind: z.enum(['tutorial', 'boss']),
  enemies: z.array(enemySchema).min(1),
  victoryFlag: z.string().min(1),
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
    encounters: z.array(encounterSchema).length(2),
    events: z.array(eventSchema).length(3),
  })
  .superRefine((registry, context) => {
    for (const [key, items] of Object.entries(registry)) {
      if (!hasUniqueIds(items)) {
        context.addIssue({ code: 'custom', message: `${key} 含有重複 ID`, path: [key] });
      }
    }
  });
