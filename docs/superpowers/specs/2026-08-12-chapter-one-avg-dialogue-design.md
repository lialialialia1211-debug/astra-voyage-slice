# Chapter 01 AVG Dialogue Conversion Design

## Goal

Convert all 30 canonical Chapter 01 novel scenes into readable AVG dialogue beats without changing the canonical Markdown sources or story order. Fix the viewport overflow that currently hides story controls on 720p screens.

## Canonical Source

- The Markdown files in `docs/worldbuilding/first-major-arc-novel-v0.2/` remain the sole canonical prose.
- Generated JSON is a presentation artifact and may remove dialogue quotation marks or attribution phrases when the same information is represented by the AVG speaker label.
- The generator must retain the full narrative meaning and ordering of the source.

## AVG Beat Rules

- One quoted utterance becomes one speaker-labelled dialogue beat.
- Narration is split at paragraph and sentence boundaries into beats of roughly 35–100 Chinese characters.
- A beat must never exceed 120 characters unless a single indivisible sentence is longer.
- Mixed narration and quoted dialogue are separated into distinct beats.
- Explicit speaker attributions are mapped to Chapter 01 actor IDs. Generic or unknown speakers use a readable speaker name without pretending to be a playable actor.
- Ambiguous alternating dialogue may use scene-specific speaker overrides. Unresolved lines remain labelled as dialogue rather than being assigned to a wrong character.
- Existing background, actor staging, tone, audio, main CG, and three-image adult CG sequencing remain intact.

## Layout Safety

- The story shell keeps its fixed game viewport.
- The prose portion of the dialogue panel becomes independently scrollable when content is unexpectedly long.
- Speaker name and story controls remain visible; controls are not part of the scrolling prose region.
- Chapter preparation screens expose a visible scroll affordance and keep their primary action reachable.

## Testing

- Generator tests enforce the 30-scene order, short AVG beat limits, presence of speaker-labelled dialogue, and ordered adult CG mapping.
- Component tests enforce a dedicated dialogue scroll region and persistent controls.
- Remote QA must pass through the `Remote QA - GitHub Pages` workflow and manual browser verification must use the fixed Pages URL.

## Out of Scope

- Rewriting story events or prose canon.
- Replacing artwork or audio assets.
- Adding new routes, battles, affection gates, or adult scenes.
