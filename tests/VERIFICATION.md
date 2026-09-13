# Verification

## Automated

`node tests/simulation.cjs` passes the gameplay QA regression suite with an explicit `Image` mock and Canvas mock. The suite covers:

- ground collision and double-jump limit
- damage invulnerability
- checkpoint retry rollback, including the hidden kill/drop counter
- pause/resume
- player-facing manual fire even when a boss is behind the player
- target-gated auto-fire with a visible forward aiming cone
- manual FIRE input while auto-fire is disabled
- swept projectile hitboxes and platform/terrain shielding
- suppression of off-screen enemy attacks
- boss-arena boundaries and boss-body blocking
- continuously animated boss-clear particles
- distinct geometry/enemy mixes for all three stages
- distinct attack patterns for WARDEN, CRUCIBLE and NULL CROWN
- traversal of all three authored stage geometries with ordinary movement/double jumps
- three boss transitions and final victory
- mobile FIRE button, dynamic zone label, and sound-on UI contract
- drawing smoke test with mocked Image/Canvas

The traversal test suppresses incoming damage so it isolates geometry reachability rather than difficulty balance.

## Browser / device scope

The code retains pointer-based simultaneous controls and responsive portrait/landscape layouts. The regression suite is deterministic Node simulation; physical iPhone/Android multi-touch remains a device-level check rather than something this Node suite can certify.

## Gameplay rules audited in this pass

Auto-aim is constrained to the character's facing direction and visible forward cone. Player and enemy projectiles use swept center-line collision rather than a fixed unrotated AABB. Platforms block both player and enemy shots. The boss arena is visually marked, stages use different layouts/enemy mixes, boss patterns differ, and boss-clear particles continue updating during the clear delay.
