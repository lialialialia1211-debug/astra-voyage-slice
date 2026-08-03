# Original Adult Fleet RPG Web Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete 20–30 minute offline browser slice covering adult confirmation, captain choice, fixed recruitment, formation, a GBF-inspired main-hand-plus-3×3 weapon grid, two turn-based battles, save recovery, a private cabin, and optional adult collection unlocks.

**Architecture:** Use a Vite React single-page application with pure TypeScript domain functions, a reducer-backed game state, Zod-validated content modules, and versioned `localStorage`. Render gameplay with DOM/CSS layers so generated UI backgrounds and user-supplied PNG art can be replaced by stable asset IDs without changing game logic.

**Tech Stack:** Node 24.14.0, pnpm 11.9.0, React 19.2.8, TypeScript 7.0.2, Vite 8.2.0, Zod 4.4.3, Vitest 4.1.10, React Testing Library 16.3.2, Playwright 1.62.1, Sharp 0.35.3.

## Global Constraints

- Target Windows desktop Chrome and Edge at 1280×720, 1440×810, and 1920×1080.
- All user-facing copy is Traditional Chinese.
- Do not use Granblue Fantasy characters, names, story, images, music, trademarks, or copied visual decoration.
- Captain ages are 25; recruitable character ages are 28, 27, 24, and 31.
- Adult content is optional collection content and never required for main-story combat power.
- Weapon layout is one enlarged main hand plus nine sub-weapons in a 3×3 matrix.
- User art is loaded only through IDs listed in `outputs/user-art-checklist.csv`.
- Generated images never contain functional UI text; HTML/CSS renders all labels and values.
- First slice has no server, account, payment, cloud sync, multiplayer, or real-money gacha.
- Every behavior task follows red-green-refactor and ends with a focused commit.

## Planned File Structure

```text
package.json                         dependency and script contract
tsconfig.json                        strict TypeScript settings
vite.config.ts                       Vite and Vitest configuration
playwright.config.ts                 desktop end-to-end projects
index.html                           application entry document
scripts/validate-art.mjs             user-art dimension/path validation
public/assets/generated-ui/          image-generation output
public/assets/user/                  validated user art copied for runtime
src/main.tsx                         React bootstrap
src/app/App.tsx                      screen routing and error boundary
src/app/app.css                      global visual system and responsive layout
src/app/test-setup.ts                jest-dom setup
src/domain/types.ts                  stable domain interfaces
src/domain/schemas.ts                Zod content validation
src/content/characters.ts            captain and four-character definitions
src/content/weapons.ts               twelve weapon definitions
src/content/summons.ts               two summon definitions
src/content/encounters.ts            tutorial and boss encounter definitions
src/content/events.ts                cabin and collection event definitions
src/content/index.ts                 validated content registry
src/game/initial-state.ts            save schema defaults
src/game/reducer.ts                  game actions and transitions
src/game/storage.ts                  versioned persistence and recovery
src/game/GameProvider.tsx            state/context boundary
src/features/onboarding/             adult gate and captain selection
src/features/recruitment/            deterministic ten-draw flow
src/features/formation/              four-slot party editor
src/features/loadout/                calculator and main-hand-plus-3×3 UI
src/features/battle/                 pure engine, battle screen, results
src/features/cabin/                  relation progression and event gallery
src/features/settings/               adult display modes and save tools
src/lib/assets.ts                    ID-to-URL resolution and missing-art fallback
src/test/fixtures.ts                 deterministic state builders
e2e/full-slice.spec.ts               complete user journeys
```

---

### Task 1: Application Shell and Adult Gate

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/test-setup.ts`
- Create: `src/app/App.test.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/app.css`

**Interfaces:**
- Produces: `App(): JSX.Element` and the global `data-testid="app-shell"` root used by all screen tests.
- Consumes: no product code.

- [ ] **Step 1: Create dependency and test configuration**

```json
{
  "name": "astra-voyage-slice",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "validate:art": "node scripts/validate-art.mjs"
  },
  "dependencies": {
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@playwright/test": "1.62.1",
    "@testing-library/jest-dom": "7.0.0",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "26.1.2",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "@vitejs/plugin-react": "6.0.5",
    "jsdom": "30.0.1",
    "sharp": "0.35.3",
    "typescript": "7.0.2",
    "vite": "8.2.0",
    "vitest": "4.1.10"
  }
}
```

Use strict TypeScript with `moduleResolution: "Bundler"`, `jsx: "react-jsx"`, `noUncheckedIndexedAccess: true`, and `exactOptionalPropertyTypes: true`. Configure Vitest with `environment: "jsdom"` and `setupFiles: ["./src/app/test-setup.ts"]`.

- [ ] **Step 2: Write the failing adult-gate test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

it('requires adult confirmation before entering the slice', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('heading', { name: '成年內容確認' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '我已年滿 18 歲' }));
  expect(screen.getByRole('heading', { name: '選擇遠征艦長' })).toBeVisible();
});
```

- [ ] **Step 3: Install and verify the test fails**

Run: `pnpm install && pnpm test -- src/app/App.test.tsx`

Expected: FAIL because `./App` does not exist.

- [ ] **Step 4: Implement the minimum shell**

```tsx
import { useState } from 'react';
import './app.css';

export function App() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <main data-testid="app-shell" className="app-shell">
      {!confirmed ? (
        <section className="modal-card">
          <h1>成年內容確認</h1>
          <p>本遊戲僅供年滿 18 歲的成年人使用。</p>
          <button onClick={() => setConfirmed(true)}>我已年滿 18 歲</button>
        </section>
      ) : (
        <section className="screen-card"><h1>選擇遠征艦長</h1></section>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Verify shell and commit**

Run: `pnpm test -- src/app/App.test.tsx && pnpm build`

Expected: 1 passing test and a successful Vite build.

```bash
git add package.json pnpm-lock.yaml tsconfig.json vite.config.ts index.html src
git commit -m "feat: scaffold adult-gated web slice"
```

---

### Task 2: Domain Types and Validated Content Registry

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/schemas.ts`
- Create: `src/content/characters.ts`
- Create: `src/content/weapons.ts`
- Create: `src/content/summons.ts`
- Create: `src/content/encounters.ts`
- Create: `src/content/events.ts`
- Create: `src/content/index.ts`
- Test: `src/content/index.test.ts`

**Interfaces:**
- Produces: `content: ContentRegistry`, `elementMultiplier(attacker, defender): number`.
- Produces IDs: `CaptainId`, `CharacterId`, `WeaponId`, `SummonId`, `EncounterId`, `EventId`.
- Consumes: no stateful application code.

- [ ] **Step 1: Write failing content and element tests**

```ts
import { content, elementMultiplier } from './index';

it('loads the complete deterministic slice registry', () => {
  expect(content.characters).toHaveLength(4);
  expect(content.weapons).toHaveLength(12);
  expect(content.summons).toHaveLength(2);
  expect(content.encounters.map(x => x.id)).toEqual(['enc_tutorial', 'enc_tidal_boss']);
});

it.each([
  ['fire', 'wind', 1.25], ['wind', 'earth', 1.25],
  ['earth', 'water', 1.25], ['water', 'fire', 1.25],
  ['light', 'dark', 1.25], ['dark', 'light', 1.25],
  ['fire', 'water', 0.75], ['water', 'earth', 0.75]
] as const)('%s attacking %s uses %s', (a, d, expected) => {
  expect(elementMultiplier(a, d)).toBe(expected);
});
```

- [ ] **Step 2: Run the tests and confirm failure**

Run: `pnpm test -- src/content/index.test.ts`

Expected: FAIL because the registry modules do not exist.

- [ ] **Step 3: Define stable domain interfaces**

```ts
export type Element = 'fire' | 'water' | 'wind' | 'earth' | 'light' | 'dark';
export type CaptainId = 'cap_m' | 'cap_f';
export type CharacterId = 'chr_01' | 'chr_02' | 'chr_03' | 'chr_04';
export type WeaponId = `wpn_${string}`;
export type SummonId = 'smn_01_solar_leviathan' | 'smn_02_abyssal_oracle';
export type EncounterId = 'enc_tutorial' | 'enc_tidal_boss';
export type EventId = 'evt_chr02_bond03' | 'evt_chr02_status' | 'evt_chr02_defeat';

export interface SkillDefinition {
  id: string;
  name: string;
  cooldown: number;
  target: 'self' | 'ally' | 'enemy' | 'all-allies' | 'all-enemies';
  power: number;
  effect?: 'shield' | 'break' | 'charge' | 'heal' | 'cleanse' | 'guard';
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
```

Define Zod schemas matching every interface and reject characters younger than 18, duplicate IDs, an encounter without enemies, or an event whose asset ID is absent from the art manifest.

- [ ] **Step 4: Create exact first-slice content**

```ts
export const characters = [
  { id: 'chr_01', name: '焰衛', age: 28, element: 'fire', role: 'vanguard', maxHp: 1450, attack: 390,
    skills: [{ id: 'armor-break', name: '熔甲突擊', cooldown: 4, target: 'enemy', power: 160, effect: 'break' },
             { id: 'intercept', name: '防線接管', cooldown: 5, target: 'all-allies', power: 0, effect: 'guard' }],
    passive: '港都守誓', ougi: { name: '旭焰斷潮', power: 520 } },
  { id: 'chr_02', name: '潮工', age: 27, element: 'water', role: 'caster', maxHp: 1180, attack: 420,
    skills: [{ id: 'pressure-wave', name: '壓差震波', cooldown: 4, target: 'enemy', power: 175, effect: 'break' },
             { id: 'tide-shield', name: '潮汐護幕', cooldown: 5, target: 'all-allies', power: 260, effect: 'shield' }],
    passive: '深潛校準', ougi: { name: '藍界崩解', power: 540 } },
  { id: 'chr_03', name: '風航', age: 24, element: 'wind', role: 'support', maxHp: 1090, attack: 360,
    skills: [{ id: 'tailwind', name: '順風航線', cooldown: 4, target: 'all-allies', power: 20, effect: 'charge' },
             { id: 'crosswind', name: '側風掃射', cooldown: 3, target: 'all-enemies', power: 120 }],
    passive: '空域直覺', ougi: { name: '天穹迴旋', power: 500 } },
  { id: 'chr_04', name: '光醫', age: 31, element: 'light', role: 'healer', maxHp: 1260, attack: 310,
    skills: [{ id: 'spectrum-heal', name: '光譜療癒', cooldown: 4, target: 'all-allies', power: 320, effect: 'heal' },
             { id: 'sterile-field', name: '無菌光場', cooldown: 5, target: 'all-allies', power: 0, effect: 'cleanse' }],
    passive: '生體分析', ougi: { name: '白晝再生', power: 460 } }
] as const;
```

Create 12 weapons using the IDs from `outputs/user-art-work-order.md`, two summons, the tutorial encounter, the tidal boss encounter, and three `CHR_02` collection events. `src/content/index.ts` validates all arrays during module initialization and freezes the returned registry.

- [ ] **Step 5: Pass tests and commit**

Run: `pnpm test -- src/content/index.test.ts && pnpm build`

Expected: registry tests pass and TypeScript reports no errors.

```bash
git add src/domain src/content
git commit -m "feat: add validated slice content registry"
```

---

### Task 3: Versioned Game State, Reducer, and Save Recovery

**Files:**
- Create: `src/game/initial-state.ts`
- Create: `src/game/reducer.ts`
- Create: `src/game/storage.ts`
- Create: `src/game/GameProvider.tsx`
- Create: `src/test/fixtures.ts`
- Test: `src/game/reducer.test.ts`
- Test: `src/game/storage.test.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `GameState`, `GameAction`, `gameReducer(state, action)`, `createSaveRepository(storage)`, `useGame()`.
- Consumes: stable IDs and content registry from Task 2.

- [ ] **Step 1: Write reducer and storage failure tests**

```ts
it('moves confirmed adults to captain selection', () => {
  expect(gameReducer(createInitialState(), { type: 'CONFIRM_ADULT' }).screen).toBe('captain-select');
});

it('preserves corrupt text for export and starts a safe state', () => {
  const storage = memoryStorage({ 'astra-save-v1': '{broken' });
  const repo = createSaveRepository(storage);
  const result = repo.load();
  expect(result.state).toEqual(createInitialState());
  expect(result.corruptBackup).toBe('{broken');
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/game/reducer.test.ts src/game/storage.test.ts`

Expected: FAIL because reducer and repository exports do not exist.

- [ ] **Step 3: Implement exact state and action contracts**

```ts
export interface GameState {
  version: 1;
  screen: 'adult-gate' | 'captain-select' | 'prologue' | 'recruit' | 'formation' | 'loadout' | 'battle' | 'results' | 'cabin' | 'gallery' | 'settings';
  adultConfirmed: boolean;
  adultMode: 'full' | 'fade' | 'hidden-thumbnails';
  captainId: CaptainId | null;
  roster: CharacterId[];
  party: [CharacterId | null, CharacterId | null, CharacterId | null, CharacterId | null];
  weaponGrid: { main: WeaponId | null; sub: [WeaponId | null, WeaponId | null, WeaponId | null, WeaponId | null, WeaponId | null, WeaponId | null, WeaponId | null, WeaponId | null, WeaponId | null] };
  summonId: SummonId | null;
  relation: Record<CharacterId, { xp: number; level: 1 | 2 | 3 | 4 }>;
  flags: string[];
  viewedEvents: EventId[];
  currentEncounterId: EncounterId | null;
  lastResult: 'victory' | 'defeat' | null;
}

export type GameAction =
  | { type: 'CONFIRM_ADULT' }
  | { type: 'SELECT_CAPTAIN'; captainId: CaptainId }
  | { type: 'COMPLETE_RECRUIT' }
  | { type: 'SET_PARTY'; party: GameState['party'] }
  | { type: 'SET_LOADOUT'; weaponGrid: GameState['weaponGrid']; summonId: SummonId }
  | { type: 'START_ENCOUNTER'; encounterId: EncounterId }
  | { type: 'FINISH_ENCOUNTER'; result: 'victory' | 'defeat'; flags: string[] }
  | { type: 'UNLOCK_EVENT'; eventId: EventId }
  | { type: 'MARK_EVENT_VIEWED'; eventId: EventId }
  | { type: 'SET_ADULT_MODE'; mode: GameState['adultMode'] }
  | { type: 'NAVIGATE'; screen: GameState['screen'] }
  | { type: 'RESET' };
```

The reducer must reject duplicate party members, a main weapon repeated in sub slots, and an encounter start without four party members. The save repository stores key `astra-save-v1`, parses with Zod, and returns `{ state, corruptBackup }`.

- [ ] **Step 4: Wrap the application in `GameProvider`**

```tsx
export function GameProvider({ children }: PropsWithChildren) {
  const repository = useMemo(() => createSaveRepository(window.localStorage), []);
  const loaded = useMemo(() => repository.load(), [repository]);
  const [state, dispatch] = useReducer(gameReducer, loaded.state);
  useEffect(() => repository.save(state), [repository, state]);
  return <GameContext value={{ state, dispatch, corruptBackup: loaded.corruptBackup }}>{children}</GameContext>;
}
```

- [ ] **Step 5: Pass tests and commit**

Run: `pnpm test -- src/game && pnpm build`

Expected: reducer and corrupt-save recovery tests pass.

```bash
git add src/game src/test src/app/App.tsx src/main.tsx
git commit -m "feat: add versioned game state and recovery"
```

---

### Task 4: Captain Choice, Prologue, and Deterministic Recruitment

**Files:**
- Create: `src/features/onboarding/AdultGate.tsx`
- Create: `src/features/onboarding/CaptainSelect.tsx`
- Create: `src/features/onboarding/PrologueScreen.tsx`
- Create: `src/features/recruitment/recruit.ts`
- Create: `src/features/recruitment/RecruitScreen.tsx`
- Test: `src/features/recruitment/recruit.test.ts`
- Test: `src/features/onboarding/onboarding.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `fixedTenDraw(): RecruitResult[]`.
- Consumes: `useGame()`, `CaptainId`, weapon IDs, and `COMPLETE_RECRUIT`.

- [ ] **Step 1: Write deterministic draw and route tests**

```ts
it('always grants chr_04 and nine configured rewards', () => {
  const result = fixedTenDraw();
  expect(result).toHaveLength(10);
  expect(result[9]).toEqual({ kind: 'character', id: 'chr_04', rarity: 'ssr' });
  expect(result.filter(x => x.kind === 'weapon')).toHaveLength(6);
  expect(result.filter(x => x.kind === 'gift')).toHaveLength(3);
});
```

```tsx
it('selects the female captain and reaches recruitment', async () => {
  const user = userEvent.setup();
  renderGame();
  await user.click(screen.getByRole('button', { name: '我已年滿 18 歲' }));
  await user.click(screen.getByRole('button', { name: '女性艦長' }));
  await user.click(screen.getByRole('button', { name: '開始遠征' }));
  expect(screen.getByRole('heading', { name: '遠征招募' })).toBeVisible();
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/features/onboarding src/features/recruitment`

Expected: FAIL because screens and fixed draw are missing.

- [ ] **Step 3: Implement deterministic results and accessible screens**

```ts
export function fixedTenDraw(): RecruitResult[] {
  return [
    { kind: 'weapon', id: 'wpn_01_sunblade', rarity: 'ssr' },
    { kind: 'weapon', id: 'wpn_02_molten_lance', rarity: 'sr' },
    { kind: 'gift', id: 'gift_navigation_chart', rarity: 'r' },
    { kind: 'weapon', id: 'wpn_03_tidemark_axe', rarity: 'sr' },
    { kind: 'gift', id: 'gift_engineering_tea', rarity: 'r' },
    { kind: 'weapon', id: 'wpn_04_resonance_staff', rarity: 'sr' },
    { kind: 'weapon', id: 'wpn_05_fireline_dagger', rarity: 'r' },
    { kind: 'gift', id: 'gift_star_fragment', rarity: 'sr' },
    { kind: 'weapon', id: 'wpn_06_route_bow', rarity: 'sr' },
    { kind: 'character', id: 'chr_04', rarity: 'ssr' }
  ];
}
```

The recruit animation reveals ten cards in sequence, supports a `全部揭曉` button, and dispatches `COMPLETE_RECRUIT` only once.

- [ ] **Step 4: Pass tests and commit**

Run: `pnpm test -- src/features/onboarding src/features/recruitment && pnpm build`

Expected: all onboarding tests pass.

```bash
git add src/features/onboarding src/features/recruitment src/app/App.tsx
git commit -m "feat: add captain choice and fixed recruitment"
```

---

### Task 5: Four-Slot Formation and Main-Hand-Plus-3×3 Loadout

**Files:**
- Create: `src/features/formation/FormationScreen.tsx`
- Create: `src/features/loadout/calculate-loadout.ts`
- Create: `src/features/loadout/LoadoutScreen.tsx`
- Create: `src/features/loadout/WeaponSlot.tsx`
- Test: `src/features/loadout/calculate-loadout.test.ts`
- Test: `src/features/loadout/LoadoutScreen.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `calculateLoadout(grid, weapons): LoadoutTotals` and `recommendLoadout(element, weapons): WeaponGrid`.
- Consumes: `WeaponDefinition`, `GameState['weaponGrid']`, `SET_PARTY`, and `SET_LOADOUT`.

- [ ] **Step 1: Write failing loadout tests**

```ts
it('adds the main hand and nine unique sub-weapons', () => {
  const totals = calculateLoadout(fullFireGrid, content.weapons);
  expect(totals.weaponCount).toBe(10);
  expect(totals.attack).toBe(8420);
  expect(totals.hp).toBe(2180);
  expect(totals.skills.might).toBe(38);
});

it('rejects duplicate equipment IDs', () => {
  expect(() => calculateLoadout(duplicateGrid, content.weapons)).toThrow('武器不可重複裝備');
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/features/loadout`

Expected: FAIL because calculators and components do not exist.

- [ ] **Step 3: Implement calculators**

```ts
export interface LoadoutTotals {
  weaponCount: number;
  attack: number;
  hp: number;
  predictedDamage: number;
  skills: { might: number; vitality: number; ougiCap: number };
}

export function calculateLoadout(grid: WeaponGrid, weapons: readonly WeaponDefinition[]): LoadoutTotals {
  const ids = [grid.main, ...grid.sub].filter((id): id is WeaponId => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error('武器不可重複裝備');
  const selected = ids.map(id => weapons.find(w => w.id === id) ?? fail(`找不到武器：${id}`));
  const attack = selected.reduce((sum, w) => sum + w.attack, 0);
  const hp = selected.reduce((sum, w) => sum + w.hp, 0);
  const skills = aggregateSkills(selected);
  return { weaponCount: ids.length, attack, hp, skills, predictedDamage: Math.round(attack * (1 + skills.might / 100)) };
}
```

- [ ] **Step 4: Implement the approved visual hierarchy**

`LoadoutScreen` renders an enlarged main-hand card in the left column, a nine-slot CSS grid in the right column, total HP/attack/predicted damage at the top, skill totals below, and an inventory drawer opened by clicking a slot. `召喚核心` is a separate tab. Keyboard activation uses native buttons; selected slots expose `aria-pressed="true"`.

- [ ] **Step 5: Pass tests and commit**

Run: `pnpm test -- src/features/formation src/features/loadout && pnpm build`

Expected: calculator and UI interaction tests pass.

```bash
git add src/features/formation src/features/loadout src/app/App.tsx
git commit -m "feat: add formation and ten-weapon loadout"
```

---

### Task 6: Pure Turn-Based Battle Engine

**Files:**
- Create: `src/features/battle/types.ts`
- Create: `src/features/battle/engine.ts`
- Create: `src/features/battle/engine.test.ts`

**Interfaces:**
- Produces: `createBattle(input): BattleState`, `useSkill(state, actorId, skillId, targetId): BattleState`, `resolveTurn(state, command): TurnResult`.
- Consumes: content registry, party, loadout totals, summon selection.

- [ ] **Step 1: Write failing engine tests**

```ts
it('applies elemental advantage and starts skill cooldown', () => {
  const battle = tutorialBattle();
  const next = useSkill(battle, 'chr_01', 'armor-break', 'enemy_1');
  expect(next.enemies[0].hp).toBeLessThan(battle.enemies[0].hp);
  expect(next.party[0].cooldowns['armor-break']).toBe(4);
});

it('moves the boss from overdrive to break', () => {
  const battle = tidalBossBattle({ mode: 'overdrive', modeGauge: 10 });
  const result = resolveTurn(battle, { kind: 'attack' });
  expect(result.state.bossMode).toBe('break');
});

it('creates a four-character ougi chain', () => {
  const battle = chargedPartyBattle();
  const result = resolveTurn(battle, { kind: 'attack', useOugi: true });
  expect(result.log).toContainEqual(expect.objectContaining({ kind: 'ougi-chain', count: 4 }));
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/features/battle/engine.test.ts`

Expected: FAIL because battle engine exports do not exist.

- [ ] **Step 3: Implement immutable engine contracts**

```ts
export interface BattleActor {
  id: string;
  element: Element;
  hp: number;
  maxHp: number;
  attack: number;
  charge: number;
  cooldowns: Record<string, number>;
  statuses: { id: string; turns: number; value: number }[];
}

export interface BattleState {
  encounterId: EncounterId;
  turn: number;
  phase: 'player-skills' | 'player-attack' | 'enemy' | 'complete';
  party: BattleActor[];
  enemies: BattleActor[];
  bossMode: 'normal' | 'overdrive' | 'break';
  modeGauge: number;
  summonUsed: boolean;
  telegraph: { name: string; target: 'single' | 'all' } | null;
  result: 'victory' | 'defeat' | null;
}
```

Use pure functions and return new objects. Damage is `round(actor.attack * skillPower / 100 * elementMultiplier * randomBand)`, where tests pass `randomBand = 1`. The production adapter injects a seeded value between 0.95 and 1.05.

- [ ] **Step 4: Implement status, mode, and defeat flags**

`resolveTurn` decrements cooldowns after enemy actions, resolves shields before HP, sets `flag_status_depth_corrosion` when the boss applies that status, sets `flag_first_defeat` on defeat, and never mutates content definitions.

- [ ] **Step 5: Pass tests and commit**

Run: `pnpm test -- src/features/battle/engine.test.ts && pnpm build`

Expected: all deterministic engine tests pass.

```bash
git add src/features/battle/types.ts src/features/battle/engine.ts src/features/battle/engine.test.ts
git commit -m "feat: add deterministic turn-based battle engine"
```

---

### Task 7: Battle Stage, Results, and Retry

**Files:**
- Create: `src/features/battle/BattleScreen.tsx`
- Create: `src/features/battle/BattleHud.tsx`
- Create: `src/features/battle/ResultsScreen.tsx`
- Test: `src/features/battle/BattleScreen.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/app.css`

**Interfaces:**
- Produces: accessible battle controls and result dispatches.
- Consumes: Task 6 engine, `START_ENCOUNTER`, `FINISH_ENCOUNTER`, and `useGame()`.

- [ ] **Step 1: Write failing battle-screen tests**

```tsx
it('telegraphs the tidal strike and allows all-party guard', async () => {
  const user = userEvent.setup();
  renderBattle(tidalBossBattle({ telegraph: { name: '全體潮汐衝擊', target: 'all' } }));
  expect(screen.getByText('下一回合：全體潮汐衝擊')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '全隊防禦' }));
  expect(screen.getByText('受到防禦減傷')).toBeVisible();
});

it('keeps the selected loadout when retrying a defeat', async () => {
  const user = userEvent.setup();
  const { state } = renderDefeatResult();
  await user.click(screen.getByRole('button', { name: '立即重試' }));
  expect(state.weaponGrid).toEqual(fullFireGrid);
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/features/battle/BattleScreen.test.tsx`

Expected: FAIL because the battle UI does not exist.

- [ ] **Step 3: Implement the battle-stage layout**

Render boss name, HP, mode gauge, telegraph, status chips, and turn count at the top. Render four party cards with HP, charge, two skill buttons, cooldown labels, and ougi toggles at the bottom. DOM layers use CSS classes `battle-hit`, `battle-cast`, `battle-ougi`, and `battle-break`; animations respect `prefers-reduced-motion`.

- [ ] **Step 4: Implement results and retry**

Victory grants relation XP and navigates tutorial victory to loadout, then boss victory to cabin. Defeat records `flag_first_defeat`, displays remaining enemy HP and two advice lines, and starts the same encounter without changing party or loadout.

- [ ] **Step 5: Pass tests and commit**

Run: `pnpm test -- src/features/battle && pnpm build`

Expected: engine and screen tests pass.

```bash
git add src/features/battle src/app
git commit -m "feat: add battle stage results and retry"
```

---

### Task 8: Private Cabin, Relation Levels, and Adult Collection Modes

**Files:**
- Create: `src/features/cabin/relation.ts`
- Create: `src/features/cabin/CabinScreen.tsx`
- Create: `src/features/cabin/GalleryScreen.tsx`
- Create: `src/features/cabin/EventViewer.tsx`
- Create: `src/features/settings/SettingsScreen.tsx`
- Test: `src/features/cabin/relation.test.ts`
- Test: `src/features/cabin/CabinScreen.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `relationLevelForXp(xp): 1 | 2 | 3 | 4`, `isEventUnlocked(event, state): boolean`.
- Consumes: event registry, flags, viewed events, adult display mode, and asset resolver.

- [ ] **Step 1: Write failing relation and display-mode tests**

```ts
it.each([[0, 1], [40, 2], [100, 3], [220, 4]] as const)('maps %s XP to level %s', (xp, level) => {
  expect(relationLevelForXp(xp)).toBe(level);
});

it('requires level three and boss victory for the main event', () => {
  const state = stateWith({ relation: { chr_02: { xp: 100, level: 3 } }, flags: ['flag_tidal_boss_victory'] });
  expect(isEventUnlocked(content.events[0]!, state)).toBe(true);
});
```

```tsx
it('uses the fade summary without rendering the adult CG', () => {
  renderEventViewer({ mode: 'fade', eventId: 'evt_chr02_bond03' });
  expect(screen.getByText('事件已以淡出模式完成')).toBeVisible();
  expect(screen.queryByRole('img', { name: '關係 Lv.3 事件 CG' })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/features/cabin`

Expected: FAIL because cabin functions and components do not exist.

- [ ] **Step 3: Implement relation and event conditions**

```ts
export function relationLevelForXp(xp: number): 1 | 2 | 3 | 4 {
  if (xp >= 220) return 4;
  if (xp >= 100) return 3;
  if (xp >= 40) return 2;
  return 1;
}

export function isEventUnlocked(event: EventDefinition, state: GameState): boolean {
  return event.requiredFlags.every(flag => state.flags.includes(flag))
    && state.relation[event.characterId].level >= event.requiredRelationLevel;
}
```

- [ ] **Step 4: Implement cabin, gallery, and settings**

Cabin shows four character tabs, relation bar, exact next condition, gift button, outfit button, and interaction button. Gallery renders locked cards with explicit conditions. `full` mode resolves the CG asset, `fade` mode shows a textual completion summary, and `hidden-thumbnails` uses a neutral lock plate until the user opens an unlocked event.

- [ ] **Step 5: Pass tests and commit**

Run: `pnpm test -- src/features/cabin src/features/settings && pnpm build`

Expected: relation, lock-condition, event-save, and display-mode tests pass.

```bash
git add src/features/cabin src/features/settings src/app/App.tsx
git commit -m "feat: add optional adult collection and cabin"
```

---

### Task 9: Asset Resolver and User-Art Validation Pipeline

**Files:**
- Create: `src/lib/assets.ts`
- Create: `src/lib/assets.test.ts`
- Create: `scripts/validate-art.mjs`
- Create: `public/assets/user/.gitkeep`
- Create: `public/assets/generated-ui/.gitkeep`
- Modify: `package.json`

**Interfaces:**
- Produces: `resolveAsset(id, manifest): AssetResolution` and CLI `pnpm validate:art -- <art-drop-path>`.
- Consumes: `outputs/user-art-checklist.csv` and user `art-drop` folder.

- [ ] **Step 1: Write missing-asset tests**

```ts
it('returns a named placeholder for absent optional CG art', () => {
  expect(resolveAsset('evt_chr02_bond03_cg01', emptyManifest)).toEqual({
    kind: 'placeholder',
    id: 'evt_chr02_bond03_cg01',
    url: null,
    label: '缺少資產：evt_chr02_bond03_cg01'
  });
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/lib/assets.test.ts`

Expected: FAIL because `resolveAsset` does not exist.

- [ ] **Step 3: Implement the resolver**

```ts
export type AssetResolution =
  | { kind: 'ready'; id: string; url: string; label: string }
  | { kind: 'placeholder'; id: string; url: null; label: string };

export function resolveAsset(id: string, manifest: Readonly<Record<string, string>>): AssetResolution {
  const url = manifest[id];
  return url
    ? { kind: 'ready', id, url, label: id }
    : { kind: 'placeholder', id, url: null, label: `缺少資產：${id}` };
}
```

- [ ] **Step 4: Implement exact CLI validation**

The Node script parses `outputs/user-art-checklist.csv`, verifies all `ready` rows exist, reads dimensions with Sharp, checks whether `alpha=yes` files have an alpha channel, reports each mismatch, and exits 1 on any error. Valid files are converted to WebP under `public/assets/user/<asset_id>.webp` and a JSON manifest is written to `public/assets/user/manifest.json`.

```js
const metadata = await sharp(sourcePath).metadata();
if (`${metadata.width}x${metadata.height}` !== row.source_size) {
  errors.push(`${row.asset_id}: expected ${row.source_size}, received ${metadata.width}x${metadata.height}`);
}
if (row.alpha === 'yes' && !metadata.hasAlpha) errors.push(`${row.asset_id}: alpha channel required`);
await sharp(sourcePath).webp({ quality: row.category === 'event_cg' ? 90 : 85 }).toFile(outputPath);
```

- [ ] **Step 5: Pass tests and commit**

Run: `pnpm test -- src/lib/assets.test.ts && pnpm validate:art -- outputs/art-drop-sample`

Expected: resolver test passes; sample validation reports missing `ready` files with exit 1, while an all-`needed` checklist exits 0 and writes an empty manifest.

```bash
git add src/lib scripts public package.json
git commit -m "feat: add art validation and fallback pipeline"
```

---

### Task 10: Generated UI Art and Visual System

**Files:**
- Create: `public/assets/generated-ui/backgrounds/*.webp`
- Create: `public/assets/generated-ui/frames/*.webp`
- Create: `public/assets/generated-ui/badges/*.webp`
- Create: `public/assets/generated-ui/controls/*.webp`
- Create: `public/assets/generated-ui/manifest.json`
- Modify: `src/app/app.css`
- Modify: all feature screen CSS classes
- Test: `src/app/visual-assets.test.ts`

**Interfaces:**
- Produces: generated UI asset manifest with the 25 `codex` rows from `outputs/art-asset-checklist.csv`.
- Consumes: image generation tool, approved A+B visual direction, and stable asset IDs.

- [ ] **Step 1: Write the manifest completeness test**

```ts
it('contains every generated UI asset required by the approved art checklist', () => {
  const expected = codexRowsFromChecklist().map(row => row.asset_id).sort();
  expect(Object.keys(generatedUiManifest).sort()).toEqual(expected);
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test -- src/app/visual-assets.test.ts`

Expected: FAIL because generated assets and manifest are absent.

- [ ] **Step 3: Generate eight background plates**

Use the image generation tool with one prompt per background ID. Every prompt includes: “original science-fantasy expedition setting, ivory and navy human civilization with brass trim transitioning to deep-ocean cyan bioluminescence and warning red, 16:9 game background, no people, no characters, no logos, no lettering, no UI text.” Add the scene-specific composition and safe zone from `outputs/art-asset-checklist.csv`.

- [ ] **Step 4: Generate and process decorative UI assets**

Generate rarity frames, six elemental emblems, three button textures, two gauges, dialog plate, and tab plate without text. Use Sharp to crop, resize to checklist dimensions, remove unused opaque margins where transparency is required, convert to WebP, and write exact paths to `manifest.json`.

- [ ] **Step 5: Apply the visual system**

Define CSS custom properties for `--ivory`, `--navy`, `--brass`, `--abyss`, `--cyan`, `--warning`, spacing, radii, shadows, and motion. Use backgrounds as low-contrast layers; preserve WCAG AA contrast for text and focus outlines. Add a reduced-motion rule that disables shakes, flashes, and card flips.

- [ ] **Step 6: Pass tests and commit**

Run: `pnpm test -- src/app/visual-assets.test.ts && pnpm build`

Expected: all 25 generated UI IDs exist and build succeeds.

```bash
git add public/assets/generated-ui src/app src/features
git commit -m "feat: add generated expedition UI art"
```

---

### Task 11: Full-Slice E2E, Responsive Verification, and Delivery

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/full-slice.spec.ts`
- Create: `e2e/save-recovery.spec.ts`
- Create: `e2e/adult-modes.spec.ts`
- Create: `README.md`
- Modify: `package.json`

**Interfaces:**
- Produces: final verified static build in `dist/`.
- Consumes: every interface and screen from Tasks 1–10.

- [ ] **Step 1: Write failing full-flow tests**

```ts
for (const captain of ['男性艦長', '女性艦長']) {
  test(`${captain} completes the full slice`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '我已年滿 18 歲' }).click();
    await page.getByRole('button', { name: captain }).click();
    await page.getByRole('button', { name: '開始遠征' }).click();
    await page.getByRole('button', { name: '全部揭曉' }).click();
    await page.getByRole('button', { name: '前往編隊' }).click();
    await completeFormation(page);
    await completeLoadout(page);
    await winTutorial(page);
    await winTidalBoss(page);
    await expect(page.getByRole('heading', { name: '私人艙室' })).toBeVisible();
    await expect(page.getByText('來自星空的未知訊號')).toBeVisible();
  });
}
```

- [ ] **Step 2: Configure three desktop viewport projects and verify failure**

Use Playwright projects named `desktop-720`, `desktop-810`, and `desktop-1080` with 1280×720, 1440×810, and 1920×1080 viewports.

Run: `pnpm exec playwright install chromium && pnpm test:e2e`

Expected: FAIL on any remaining missing navigation or flow behavior.

- [ ] **Step 3: Close integration gaps exposed by E2E**

Fix only concrete failures reported by Playwright. Add test IDs only where role/name selectors cannot express the interaction. Keep all gameplay buttons keyboard accessible and preserve the same reducer actions.

- [ ] **Step 4: Add save-recovery and adult-mode journeys**

Test corrupt localStorage recovery, JSON export/import, page reload after boss victory, missing adult CG placeholder, fade mode, and hidden-thumbnail mode. Assert that adult events never change party attack, HP, weapon skills, or battle unlock requirements.

- [ ] **Step 5: Run the complete verification suite**

Run: `pnpm test && pnpm test:e2e && pnpm build`

Expected: all Vitest and Playwright tests pass; TypeScript and Vite build succeed; browser console has no unhandled error.

- [ ] **Step 6: Document local use and commit**

`README.md` contains exact commands for install, dev, test, build, art validation, user-art drop location, save export, and static hosting. It links the approved design and user art work order.

```bash
git add e2e playwright.config.ts README.md package.json src
git commit -m "test: verify complete web slice journey"
```

---

## Final Verification Gate

Run these commands from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
git status --short
```

Expected results:

- Dependency lockfile is unchanged.
- Vitest exits 0.
- Playwright exits 0 for all three desktop viewports.
- TypeScript and Vite build exit 0.
- `git status --short` is empty.
