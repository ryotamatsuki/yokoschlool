# Verification

## Automated

`node tests/simulation.cjs` — all checks pass:
- platform landing and double-jump limit
- invulnerability after damage
- checkpoint and fall recovery
- pause/resume
- three boss transitions and final victory
- death and retry
- authored geometry traversal using movement/jumps
- ordinary auto-fire can damage and defeat each boss
- drawing smoke test with mocked Canvas

The traversal and weapon tests deliberately suppress incoming damage to isolate geometry and hit reachability. They do not establish difficulty balance or guarantee a human no-damage clear.

## Browser

Public GitHub Pages opened successfully. Title rendering, start, keyboard jump and pause inspected. Portrait (390 × 844) and landscape (844 × 390) iframe viewports inspected, with jump/dash buttons exercised. These are Chromium responsive viewport checks, not physical iOS/Android or multitouch device certification.

Only browser extension metadata errors were observed in the inspected log; no game-source JavaScript errors were reported in that sample.

## Materials

Canvas primitives, system fonts, synthesized Web Audio. No third-party game assets, fonts, audio downloads or external runtime dependencies.
