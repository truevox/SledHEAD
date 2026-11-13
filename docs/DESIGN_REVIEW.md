# SledHEAD Design Review

A review of the design documents ahead of a from-scratch reimplementation. It lists what is underspecified, what contradicts, and what is missing, and records the decisions made during the review so the next session does not re-ask them.

Line references (`ROADMAP:123`) are to `docs/ROADMAP.md` as of this review.

---

## 1. Status of each document

| Document | Status | Notes |
|---|---|---|
| `docs/ROADMAP.md` | **Target design** (source of truth for where the game is going) | Large wishlist, not a spec. See sections 4-6. |
| `docs/README.md`, `docs/CONTROLS.md` | **Prototype as implemented** (accurate for the old build) | Hold details the ROADMAP never restates: WASD/Space controls, 0.5%/day loan charge, out-of-stamina fee `100*(houseReEntry*0.1)`, win condition. Each needs "carried over" or "replaced by X". |
| `docs/1.0_README.md` | **Stale snapshot** (author is unsure of its history) | Treat as archive. Harvest list in section 8. |
| `sledhead-windsurf.md`, `.github/copilot-instructions*.md`, `.cursor/rules/` | **Obsolete agent/IDE instructions** | Code-style rules can be dropped. It also holds design rules worth a decision first; see section 8. |
| `todo.txt` | **Partly out of date** | The trick items are superseded by BitstreamBluffs (section 2). |
| `docs/NEW.GAME.PLUS.SPOILERS.md` | Endgame story and NG+ | Rewards are "+%" with no values; see section 5. |

Suggested cleanup once the new design doc exists: archive `1.0_README.md`, delete the windsurf/copilot/cursor files after harvesting section 8.

---

## 2. Decisions made during this review

### Core structure
- **Two views.** Walking and climbing stay **top-down**. Sledding becomes a **side-view** hill-climber/hill-sledder in the style of BitstreamBluffs (`github.com/truevox/BitstreamBluffs`, trick design is being workshopped there). Its tricks supersede the ROADMAP's 16-trick list.
- **Altitude.** Every overworld square holds an **absolute altitude** value. The light/dark snow gradient is a **display layer relative to the player** ("whiter above you, dirtier below") so up/downhill is readable at a glance. It does not encode absolute altitude.
- **Overworld art** is representative; the **side view is the accurate rendering**.

### How the two views connect
- The player may **mount and dismount anywhere**; the two views are mapped to each other.
- On mounting, a **straight line** is drawn from the mount point at a **player-chosen heading** (not necessarily straight down). Entities and altitude along the line are read from the overworld, and the side-view terrain is **deterministically procedurally generated** from them.
- **Heading selection** is a radial select: tap/drag, mouse drag, or analog stick.
- **Shortcut Awareness** upgrade provides a **preview of the line**.
- **The only way to turn is to dismount** and remount with a new heading.
- **Physics is the penalty system.** A bad line (uphill or too shallow) stalls the sled. Dismounting mid-air gives a "human snowball" tumble. Dismounting at speed is allowed but tumbly.
- **Kickers and dips are world features** and are reflected (approximately) in the per-square altitudes. They are not invented per track.
- **Crossing paths with a ramp gives a real ramp** regardless of approach angle (every entity is a round footprint with one side-view form).
- **Scale** (tentative): about half a screen of side view per overworld tile. Positions scale; entity sizes do not.

### Engine
- Leaning **Phaser 3 + Matter** (continuity with BitstreamBluffs; web-first). **Godot (with the Godot MCP)** was the alternative, chosen against mainly because the sled feel is already tuned in Phaser. Not final; see Q1.

### Naming
- The starter mountain is **Debutmont** ("Je débute!" pun). All occurrences in `docs/ROADMAP.md` were normalized. The other mountain names are still inconsistent (section 3).

### NPCs
- The eight NPCs dropped from the 1.0 list are being **merged into existing characters as roles**, not removed wholesale.
  - Maxi -> likely takes the **Black Market Gear Dealer** role.
  - Darlene -> may take the **Stream Manager** role (fan growth, sponsorships).
  - Cannon -> may take the **Event Broadcaster** role.
  - The **Rival** role may be cut; **bear racing (Carrie)** is intended to provide competitive sledding.
- Still undecided: Mysterious Merchant, Ghost of the Mountain, Ice Sculptor, Time Traveler.

---

## 3. Contradictions

### Within the ROADMAP
| Topic | One place says | Another says |
|---|---|---|
| Loop direction | Top: start at base, climb, then sled (`ROADMAP:15-18`) | Downhill goal is still "reach the bottom" (`:105`); tutorial ends "atop" the mountain (`:169`). Prototype docs say sled first, then climb. |
| Stamina drain | "Drains when moving" (`:89`) | "Moving uphill drains" (`:152`) |
| Stamina recovery | Food stands, resting points, upgrades (`:90`); Grandpa says "rest up" | Prototype: restored by ending the day at the house. Windsurf rules (if retained): food only, hard daily cap, no passive regen. Needs one decision (Q3). |
| Debt structure | Prototype: one loan, pay it off to win (`README`) | ROADMAP: repay mountain, then house, then bigger debts (`:78-83`); Debutmont adds "lodge loan" and "Debutmont Debt (loans + base upgrades)" (`:1411,1430`) |
| Mountain upgrades | Unlocked after repaying the house (`:80`) | Core concept: resort is open and earning from the start (`:9-13`) |
| Upgrade caps | "All upgrades become infinitely upgradable" (`:1700`) | Same section: mountain upgrades "may or may not be" infinite; many are binary; Sled Durability is +1 collision per level |
| Lens swapping | One at a time, swapped only at base (`:603`) | Minnie sells Lens Frame Kit / Lens Rack for cycling (`:1087,1130`) |
| Fishing | Photographing fish (`:504-519`) | Minnie sells rods and bait for "catching and cooking" (`:1074`); Glacier Barrel stores fish (`:397`) |
| Dig tools | Panttock does dig/pick/pan (`:564`) | Sled attachments (Mini/Deluxe Dig Kit) also needed as "minigame loadouts" (`:328,362,391`) |
| Animal behavior | Animals flee if you get too close (`:93`) | Moving targets pay 3x (`:99`), so scaring an animal raises its value |
| World persistence | Terrain generates only on new game (`:65`) | Trees are felled and regrow; AVMs and buildings are placed |
| Where NPCs live | Hotel, cabin, shed, lift shack, trailhead store | One articulated truck (`:1771-1905`) |
| Fans vs tourists | Fans listed as obstacles | Crowd Weaver says tourists dodge "like fans do" |
| Upgrade names | Optimal Optics, Crowd Hypeman | Optimized Optics (Darlene), Crowd Hype-Man (Aria); different effects |
| Mountain names | Vertigo Vents, Space Mountain, Crystal Cavern, Underwater Mountain, Garbage Dump Glacier, Steampunk Slopes | Lava/Fire/Volcano Mountain, Lunar Peak, Crystal Caves, Undersea, Garbage Mountain/Glacier, Mechanical Mountain. (The starter is settled as **Debutmont** and normalized in the ROADMAP; the others still need one canonical name each.) |
| Out of stamina | CONTROLS: sent home, fee | ROADMAP: Sled Patrol rescue (`:460`) and rescue bill (`:1678`) |
| Duplicated NPCs | Minnie has two full profiles with different upgrade tables, plus a third description under Deep Diggin'. Pete is described three times. | |

### Between the ROADMAP and the BitstreamBluffs direction
- **Lateral sledding mechanics are obsolete.** Dodging tourists, Crowd Weaver, ice "making turns trickier", cornering/handling parts, "tighter paths at higher layers", downhill layer wraparound, hidden shortcut paths, felled trees "opening sled routes", and the tutorial's "turning left/right".
- **16 tricks.** BitstreamBluffs has six types (backflip, frontflip, helicopter CCW/CW, air brake, parachute). Sky Dive Roll, Corkscrew and Orbit Spin don't read in a side view.
- **Bitstream Bluffs as a mountain.** Its pitch was "handles like your RC sled, no climb, only carve." If all sledding now plays that way, it and the RC sled need a new point of difference.
- **Landings.** The windsurf rules say the landing-angle penalty was removed on purpose; BitstreamBluffs crashes on bad landings. Decide whether a landing penalty exists in side view (Q4).

---

## 4. Underspecified systems

### Overworld / sledding connection
- **Terrain detail has two scales.** A tile altitude describes the broad slope; kickers and dips are smaller than a tile at half-screen-per-tile. Needs a stated rule for smoothing between tile altitudes plus how features sit on tiles.
- **Track must be a function of world position**, not of the mount point. Detail must be sampled from world coordinates, otherwise mounting mid-slope differs from sledding through that spot.
- **Crossing lines must agree.** Two lines at different headings must see the same bump where they cross.
- **Corridor width.** A line has no width; pick a corridor and project the entities inside it onto the track.
- **Entity translation table.** Each overworld thing needs a side-view form and collision rule: tree, rock, cliff, river, building, tourist, fan, animal, AVM, ramp.
- **Moving things.** Do tourists and animals keep simulating during a descent, or are they frozen at mount time?
- **Layer boundaries.** Circumference differs per layer, so a constant heading bends. Define the heading in tile units, rescaled at boundaries; a shallow line can wrap around the mountain.
- **Dismount rules.** Fallback when the mapped spot is a rock or river; where you land on the overworld; damage for a tumble (needs the damage model).
- **Preview without the upgrade.** Provide a short baseline preview so new players aren't blind; Shortcut Awareness lengthens it.
- **Input scope.** Radial select by tap, mouse or analog implies touch and gamepad schemes for all other inputs (camera aim, photos).
- **Scale and mountain size.** At BitstreamBluffs speeds (480 px canvas, ~800 px/s) half-a-screen-per-tile is ~3 tiles/s, so a one-minute descent needs a mountain ~200 tiles tall. Pick desired descent and climb times; mountain size follows.

### World geometry
- The layered cylinder (`ROADMAP:22-55`) has no layer count, heights or circumferences, and doesn't say what the player sees across a boundary.
- "Altitude line" for photography is never distinguished from Y position or from tile altitude.
- Caves, interiors, Crystal Cavern (inside the starter mountain), Micro Mountain and Bitstream Bluffs don't fit the model.
- **Gradient shading** needs a formula (altitude difference to lightness, clamp range), behavior on flat ground, and a version for non-snow mountains (sand, water, space, candy, digital).

### Economy
- No numbers anywhere: loan sizes, payouts, costs, interest, price curves.
- "Fanbase", "reputation", "social media presence", passive income and fan boosts are named, with no metric or formula.
- Nothing says who buys honey, gems, fossils or syrup.
- No fail state: can you go bankrupt? What does daily interest do at zero cash?
- Two upgrade formulas (sqrt, log) are offered and neither is assigned to a category; the sqrt one has no soft cap, so "diminishing at Level 10" doesn't follow.

### Damage, weight, inventory
- Collision count, sled-part durability, repairs at Steve, "heal after crashes" at First-Aid Stations, tool and pick durability all coexist with no health model.
- Weight has no units; sled storage vs personal pack is unclear; "weight affects downhill handling" is unstated. In physics terms weight is now mass in the sled sim.
- Three sled models overlap and are never reconciled: five size tiers, modular parts, and flat personal upgrades (Rocket Surgery).
- Wax appears in at least six places as a system and is never defined.
- Temperature (warmth/cool boosts, hot/cold zones, heat meter) and weather (four items modify it, no weather model) are unstated systems.

### Minigames
- Most have a theme and upgrades but no player action or win condition: Deep Diggin', beekeeping, sap sugaring, kite while climbing, RC sled.
- Lockpicking's "dual input" implies analog sticks.
- Micro Mountain requires "high RC Sledding and Beekeeping level"; no skill-level system exists elsewhere.
- Wood is for "furniture, upgrades, signs, structures"; no crafting or home-building system exists.
- Arrow keys are claimed by camera aim, kite rhythm and fishing at once while climbing.

### Progression
- Mountain unlock order and prices are undefined; so are the sellers of each required power-up. Some power-ups also grant stacking global bonuses.
- Tutorial teaches walking and sledding but ends "once the player feels confident", which is not a trigger.
- Endgame/prestige is three bullets. NG+ rewards are "+%" with no values; what resets and which mountains complete the "circuit" is unspecified.
- Day cycle, clock, night, regrowth "over days": only CONTROLS mentions days.
- Phase transitions: nothing defines when climbing ends and sledding begins beyond "mount anywhere".

### NPCs
- Role merges (section 2) need a pass that gives every role exactly one owner.
- **Overlapping ownership:** Jake / Jay / Montana Snow all build or unlock lifts and infrastructure; Minnie and Pete both sell axes; Darlene and Aria both sell fan/trick-payout upgrades; Maxi's and Jake's upgrades overlap.
- **Four stubs:** Montana Snow, Whistler, Cannon, Sled Patrol Captain (three lines each).
- **Orphaned systems** from the dropped roles: sponsorships and audience growth (Stream Manager), cosmetics/sled skins (Ice Sculptor), rival records and leaderboards, risky or illegal mods (Black Market). Each needs an owner or a cut.
- Truck-only characters (Stratton, Marbee, Bruin) are introduced without explanation. The truck section has no stated gameplay role.

### Dropped from the 1.0 list with no replacement
- **TWEAK variable list** (spawn timings, sit duration, moving multiplier, stamina drain, scoring multipliers). The ROADMAP has no balance-variables section.
- Fishing as catching (bait, reel technique, line snaps, tournaments); treasure hunting (maps, metal detectors, law enforcement risk); lockpicking alarms, authorities, rival scavengers.
- The Champ fossil museum at the first mountain's base. Champ is mentioned but nothing says where fossils go.
- Haunted Graveyard Hill (only dropped mountain; Spirit Lantern, ghosts, phantom fans).
- "Roguelike" genre label (conflicts with a persistent mountain plus debt).

---

## 5. Issues easy to miss

- **Lifts and snowmobiles undo the core mechanic.** Stamina climbing is the game, and the first mountain upgrades skip it. Decide what they cost or limit.
- **Nothing ties starting height to payout.** "Higher rewards" is asserted for wildlife only. With mount-anywhere, what makes a longer descent pay more?
- **Tricks no longer conflict with steering,** but BitstreamBluffs has pickup power-ups, an emergency reset and a "push forward" key that the ROADMAP never mentions. Decide which come along.
- **BitstreamBluffs is endless, score-based, and ends on a crash** with a restart in under 10 seconds. SledHEAD descents are finite, pay money and use collision/durability. These are different loops.
- **Online features are implied** by Bitstream Bluffs (hourly leaderboard, real-world daily patches, "remembers your style").
- **Platform is open.** Web PC is the only stated target. BitstreamBluffs targets Steam Deck, gamepad and touch; the old windsurf rules had a 60 FPS target on Steam Deck and mid-tier Chromebooks. Decide whether SledHEAD inherits these, and whether the two games share code.
- **Phantom or ambiguous tech.** "Pascal's Ledger" is the pause/run ledger in BitstreamBluffs but the save-game foundation in the windsurf rules; "Pascal's Entropy Chain" (autosave) is undefined; "TilePipe2" looks like an external tile tool.
- **Trademark exposure if it ships commercially:** "Space Mountain", "Superman", "Guitar Hero-style", "Pabst" / "Blue Ribbon", "BJ & The Bear".
- **No glossary.** "Run" means one descent, one day and one playthrough in different places.

---

## 6. Harvest before deleting old files

### From `sledhead-windsurf.md` (design rules, not tooling)
Decide keep / change / drop for each:
- Stamina never regenerates passively; food is the only recovery; food has a hard daily cap; strict daily stamina limit.
- The landing-angle penalty was intentionally removed and must not return "in any form".
- Tricks are holds, not taps (direction + duration sets complexity). Consistent with `todo.txt` and BitstreamBluffs.
- Each mountain defines about two active cryptids plus one fossil cryptid.
- Wildlife has biome spawn rules and a layer index.
- 60 FPS target on Steam Deck and mid-tier Chromebooks.
- Production domains: `sledhead.truevox.net`, `go.sledhead.ing`; everything else is dev.
- Safe to drop: code style, Gitmoji/changelog/semver rules, ESLint, `notify.js`, canvas conventions, file layout.

### From `todo.txt`
- Swap loop direction: ROADMAP direction is "up then down"; resolve against Q2.
- "Find some NPC to cover prospecting, treasure hunting, and rescue missions": addressed by Minnie and the Patrol Captain/Stratton, both thin.
- "Nerf jumping, buff ramps, Attend Leg Day affects jump height": decide whether it survives the side-view move.
- Tricks press-to-hold: superseded by BitstreamBluffs.

### From `docs/1.0_README.md`
- TWEAK variable list, the fishing/lockpicking/treasure-hunting detail, and the Champ museum (section 4).

---

## 7. Open questions for the design thread

1. **Engine:** Phaser + Matter or Godot? (Leaning Phaser; ship target is the deciding question: browser-first vs native/Steam-first.)
2. **Loop order:** is the canonical day climb-then-sled with mount-anywhere, or can a day start with a descent from the top?
3. **Stamina:** ROADMAP (resting points, regen) or prototype/windsurf (food only, daily cap, reset at day end)?
4. **Landings:** is there a landing penalty or crash in side view, given it was deliberately removed before?
5. **MVP scope:** what is the first rebuild, and which minigames and NPCs does it include?
6. **Debt and win:** how many debts, in what order, and what is the actual win condition?
7. **Truck vs fixed buildings:** hub replacement or lore only?
8. **Platform:** web-only, or Steam Deck / gamepad / touch from day one? Share code with BitstreamBluffs?
9. **Dismount and tumble cost:** damage, stamina, dropped cargo, or money?
10. **Mountain scale:** target descent and climb durations (they fix mountain height).
11. **Remaining NPC roles:** Mysterious Merchant, Ghost of the Mountain, Ice Sculptor and Time Traveler: merge or cut?
