import type { ContentRegistry, Element } from '../domain/types';
import { contentRegistrySchema } from '../domain/schemas';
import { characters } from './characters';
import { encounters } from './encounters';
import { events } from './events';
import { summons } from './summons';
import { weapons } from './weapons';

const parsed = contentRegistrySchema.parse({ characters, weapons, summons, encounters, events });

export const content: ContentRegistry = Object.freeze({
  characters: Object.freeze(parsed.characters),
  weapons: Object.freeze(parsed.weapons),
  summons: Object.freeze(parsed.summons),
  encounters: Object.freeze(parsed.encounters),
  events: Object.freeze(parsed.events),
});

const advantage: Readonly<Record<Element, Element>> = {
  fire: 'wind',
  wind: 'earth',
  earth: 'water',
  water: 'fire',
  light: 'dark',
  dark: 'light',
};

export function elementMultiplier(attacker: Element, defender: Element): number {
  if (advantage[attacker] === defender) return 1.25;
  if (advantage[defender] === attacker && !(attacker === 'light' || attacker === 'dark')) return 0.75;
  return 1;
}

export type { ContentRegistry } from '../domain/types';
