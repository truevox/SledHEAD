# SledHEAD Design Review (revision 2)

A review of the design documents ahead of a from-scratch reimplementation. It lists what contradicts, what is underspecified, what has been lost, and what is easy to miss. It also records the decisions made during the review so the next session does not re-ask them.

This revision replaces the first pass. It reflects: the side-view sledding direction, the author's corrections about which documents are authoritative, the NPC role merges, a comparison with the Google Doc copy of the roadmap, and a harvest of the 1.0 README and windsurf rules.

Line references (`ROADMAP:123`) are to `docs/ROADMAP.md` as of this revision.

---

## 1. Status of each document

| Document | Status | Notes |
|---|---|---|
| `docs/ROADMAP.md` | **Target design.** The source of truth for where the game is going. | A large wishlist, not a spec. Sections 3-5. |
| Google Doc "SledHEAD Roadmap (In Development)" | **Working copy of the ROADMAP.** About 99.7% identical. | Its only content difference (the rewritten Snow Bees entry) was merged into the repo. The Google Doc still has typos and one damaged sentence the repo fixed. |
| `docs/README.md`, `docs/CONTROLS.md` | **Prototype as implemented.** Accurate for the old build. | Hold details the ROADMAP never restates (section 3C). |
| `docs/1.0_README.md` | **Stale snapshot.** Treat as archive. | Harvest list in section 6. |
| `sledhead-windsurf.md`, `.github/copilot-instructions*.md`, `.cursor/rules/` | **Obsolete agent/IDE instructions.** | Code-style rules can go. It also holds design rules to decide on first (section 6). |
| `todo.txt` | **Partly out of date.** | Trick items are superseded by BitstreamBluffs. |
| `docs/NEW.GAME.PLUS.SPOILERS.md` | Endgame story and NG+. | Rewards are "+%" with no values. |

Suggested cleanup once the new design doc exists: archive `1.0_README.md`, and delete the windsurf, copilot and cursor files after the section 6 decisions are made.

---

## 2. Decisions made

### Two views
- **Walking and climbing stay top-down.** **Sledding becomes a side-view hill-sledder** in the style of BitstreamBluffs (`github.com/truevox/BitstreamBluffs`, where the tricks are being workshopped). Its tricks supersede the ROADMAP's 16-trick list. BitstreamBluffs has six types: backflip, frontflip, helicopter CCW/CW, air brake, parachute.
- **Overworld art is representative; the side view is the accurate rendering.** Sizes are not to scale in the overworld (a tree is not the player's size).

### How the views connect
- **Every overworld square holds an absolute altitude.** The light/dark snow gradient is a display layer relative to the player ("whiter above you, dirtier below") so up and downhill are readable. It does not encode absolute altitude.
- **Mount and dismount anywhere.** On mounting, a **straight line** is drawn from the mount point at a **player-chosen heading** (not necessarily downhill). Entities and altitude along the line are read from the overworld and the side-view track is **deterministically procedurally generated** from them. The two views are mapped to each other.
- **Heading selection** is a radial select: tap/drag, mouse drag, or analog stick.
- **Shortcut Awareness** previews the line.
- **The only way to turn is to dismount** and remount.
- **Physics is the penalty system.** A bad line stalls the sled. Dismounting mid-air gives a "human snowball" tumble. Dismounting at speed is allowed but tumbly.
- **Kickers and dips are world features**, reflected approximately in the per-square altitudes, not invented per track.
- **A crossed ramp is a real ramp.** Every entity is a round footprint with one side-view form, whatever the approach angle.
- **Scale (tentative):** about half a screen of side view per overworld tile. Positions scale; entity sizes do not.

### Engine
- **Leaning Phaser 3 + Matter.** Reasons: the sled feel is already tuned in BitstreamBluffs, web is the stated target, and plain JS logic runs in Node tests. **Godot (with the Godot MCP)** was the alternative, kept mainly for smoother tooling. Not final; see Q1.

### Naming and content merged
- The starter mountain is **Debutmont** (the "Je débute!" pun). All occurrences in the ROADMAP were normalized. The other mountains still have inconsistent names (section 3A).
- The rewritten **Snow Bees** entry and the red-scarves line were merged into the ROADMAP. The old line gave their honey a faster stamina recovery in cold zones; that effect is now stated nowhere.

### NPC roles
- The NPCs dropped from the 1.0 list are being **merged into existing characters as roles**, not removed wholesale: Maxi is likely the Black Market Gear Dealer; Darlene may take the Stream Manager; Cannon may take the Event Broadcaster. The **Rival** may simply be cut, with bear racing (Carrie) providing competitive sledding. Per-role detail is in section 6.

---

## 3. Contradictions

### A. Within the ROADMAP
| Topic | One place says | Another says |
|---|---|---|
| Loop direction | Overview: start at base, climb, then sled (`ROADMAP:15-18`) | Downhill goal is still "reach the bottom" (`:105`); tutorial ends "atop" the mountain (`:169`). The prototype sled first, then climbed. |
| Stamina drain | "Drains when moving" (`:89`) | "Moving uphill drains" (`:152`) |
| Stamina recovery | Food stands, resting points, upgrades (`:90`); Grandpa says "rest up" | Prototype: restored by ending the day at the house. Windsurf rules: food only, hard daily cap, never passive. Needs one decision (Q3). |
| Out of stamina | CONTROLS: sent home with a fee | ROADMAP: Sled Patrol rescue (`:460`) and a rescue bill (`:1679`) |
| Debt structure | Prototype: one loan, pay it off to win | ROADMAP: repay mountain, then house, then bigger debts (`:78-83`); Debutmont adds a "lodge loan" and "Debutmont Debt (loans + base upgrades)" (`:1412,1431`) |
| Mountain upgrades | Unlocked after repaying the house (`:80`) | Core concept has the resort open and earning from the start (`:9-13`) |
| Upgrade caps | "All upgrades become infinitely upgradable" (`:1701`) | Same section: mountain upgrades "may or may not be" infinite; many are binary; Sled Durability is +1 collision per level |
| Lens swapping | One lens at a time, swapped only at base (`:603`) | Minnie sells a Lens Frame Kit and Lens Rack for cycling (`:1087,1130`) |
| Fishing | Photographing fish (`:504-519`) | Minnie sells rods and bait for "catching and cooking" (`:1074`); Glacier Barrel stores fish (`:397`) |
| Dig tools | Panttock does dig/pick/pan (`:564`) | Sled dig kits also needed as "minigame loadouts" (`:328,361,390`) |
| Animal behavior | Animals run if you get too close (`:93`) | Moving targets pay 3x (`:99`), so scaring an animal raises its value |
| World persistence | Terrain generates only on a new game (`:65`) | Trees are felled and regrow; AVMs and buildings are placed |
| Where NPCs live | Hotel, cabin, shed, lift shack, trailhead store | One articulated truck (`:1772-1906`) |
| Fans vs tourists | Fans listed as obstacles | Crowd Weaver says tourists dodge "like fans do" |
| Upgrade names | Optimal Optics, Crowd Hypeman | Optimized Optics (Darlene), Crowd Hype-Man (Aria); different effects |
| Mountain names | Vertigo Vents, Space Mountain, Crystal Cavern, Underwater Mountain, Garbage Dump Glacier, Steampunk Slopes | Lava/Fire/Volcano Mountain, Lunar Peak, Crystal Caves, Undersea, Garbage Mountain/Glacier, Mechanical Mountain. The starter is settled; the rest need one canonical name each. |
| Duplicated NPCs | Minnie has two full profiles with different upgrade tables, plus a third description under Deep Diggin'. Pete is described three times. | |

### B. The ROADMAP against the side-view direction
- **Lateral sledding mechanics are obsolete:** dodging tourists and Crowd Weaver; ice "making turns trickier"; cornering and handling parts; "tighter paths at higher layers"; downhill wraparound; hidden shortcut paths; felled trees "opening sled routes"; the tutorial's "turning left/right". Some can be reborn as "pick a good line" mechanics.
- **16 tricks.** Sky Dive Roll, Corkscrew and Orbit Spin don't read in a side view.
- **Bitstream Bluffs as a mountain.** Its pitch was "handles like your RC sled, no climb, only carve". If all sledding now plays that way, it and the RC sled need a new point of difference.
- **Landings.** The windsurf rules say a landing-angle penalty was removed on purpose; BitstreamBluffs crashes on bad landings. Decide whether a landing penalty exists in side view (Q4).
- **Jumps ignoring downhill physics** (windsurf) no longer applies; the side view has one physics model.

### C. Prototype docs against the ROADMAP
Several things are specified only in the prototype docs. Each needs "carried over" or "replaced by X":
- Movement and jump keys (the ROADMAP assigns arrows only to the camera and tricks).
- The day cycle and the 0.5% daily loan charge.
- The out-of-stamina fee `100*(houseReEntry*0.1)`.
- The win condition ("pay off the loan").
- Repeat-photo diminishing returns and the debug spawn key (`E`).

---

## 4. Underspecified systems

### The overworld-to-sled link
- **Two scales of terrain detail.** A tile altitude describes the broad slope; kickers and dips are smaller than a tile at half a screen per tile. Needs a smoothing rule between tile altitudes plus how features sit on tiles.
- **The track must be a function of world position,** not the mount point. Sample all detail from world coordinates, otherwise mounting mid-slope differs from sledding through the same spot. Two lines at different headings must see the same bump where they cross.
- **Corridor width.** A line has no width; pick a corridor and project the entities inside it onto the track.
- **Entity translation table.** Each overworld thing needs a side-view form and collision rule: tree, rock, cliff, river, building, tourist, fan, animal, AVM, ramp.
- **What is seeded and what is live.** The seed fixes terrain, but the ROADMAP also says tourists, fans, weather and wildlife change per run. State which parts of a descent are deterministic.
- **Moving things.** Do tourists and animals keep simulating during a descent, or freeze at mount time?
- **Layer boundaries.** Circumference differs per layer, so a constant heading bends. Define heading in tile units, rescaled at boundaries; a shallow line can wrap around the mountain.
- **Dismount rules.** A fallback when the mapped spot is a rock or river; where you land on the overworld; what a tumble costs (damage, stamina, dropped cargo, money).
- **Baseline preview.** Give new players a short preview, with Shortcut Awareness lengthening it, so early lines aren't blind.
- **Input scope.** A radial select by tap, mouse or analog implies touch and gamepad schemes for everything else (camera aim, photos).
- **Scale and mountain size.** At BitstreamBluffs speeds (480 px canvas, ~800 px/s), half a screen per tile is ~3 tiles/s, so a one-minute descent needs a mountain ~200 tiles tall. Pick descent and climb times; mountain size follows.
- **Height field and gradient.** The shading needs a formula (altitude difference to lightness, clamp range), a flat-ground rule, and a version for non-snow mountains (sand, water, space, candy, digital).

### World geometry
- The layered cylinder (`ROADMAP:22-55`) has no layer count, heights or circumferences.
- The photography "altitude line" is never distinguished from Y position or tile altitude.
- Caves, interiors, Crystal Cavern (inside the starter mountain), Micro Mountain and Bitstream Bluffs don't fit the model.
- There are no regions or biomes inside a mountain, although wildlife and Debutmont's panning/digging zones assume them.

### Economy
- No numbers anywhere: loan sizes, payouts, costs, interest, price curves.
- "Fanbase", reputation, social media presence, passive income and fan boosts are named with no metric, formula or owner (Stream Manager role; see section 6).
- Nothing says who buys honey, gems, fossils or syrup.
- No fail state: can you go bankrupt, and what does daily interest do at zero cash?
- Two upgrade formulas (sqrt, log) are offered and neither is assigned to a category. The sqrt one has no soft cap, so "diminishing at Level 10" doesn't follow.
- What ties a descent's payout to its length or starting height is never stated.

### Damage, weight, inventory
- Collision count, sled-part durability, repairs, "heal after crashes" at First-Aid Stations, tool and pick durability all coexist with no health model.
- Weight has no units; sled storage vs personal pack is unclear. In the side view, weight is also mass in the physics.
- Three sled models overlap: five size tiers, modular parts, and flat personal upgrades.
- Wax appears in at least six places as a system and is never defined.
- Temperature (warmth and cool boosts, hot and cold zones, heat meter) and weather (four items modify it, no weather model) are unstated systems.

### Minigames
- Most have a theme and upgrades but no player action or win condition: Deep Diggin', beekeeping, sap sugaring, kite while climbing, RC sled.
- Lockpicking's "dual input" implies analog sticks.
- Micro Mountain requires "high RC Sledding and Beekeeping level", but no skill-level system exists elsewhere.
- Wood is for "furniture, upgrades, signs, structures" but no crafting or home-building system exists.
- Arrow keys are claimed by camera aim, kite rhythm and fishing at once while climbing.

### Progression and structure
- Mountain unlock order and prices are undefined, as are the sellers of each required power-up. Some power-ups also grant stacking global bonuses.
- The tutorial teaches walking and sledding but ends "once the player feels confident", which is not a trigger.
- Endgame and prestige are three bullets. NG+ rewards are "+%" with no values; what resets and which mountains complete the "circuit" is unspecified.
- Day cycle, clock, night, and regrowth "over days": only CONTROLS mentions days.
- **No save system.** A game with debt, a persistent mountain and NG+ needs one (the windsurf file named regular, checkpoint and contextual autosaves).
- **No audio or feedback spec,** and the UI section is three bullets.
- Phase transitions beyond "mount anywhere": what ends a descent, and how climbing resumes.

### NPCs
- Role merges need a pass giving every role exactly one owner.
- **Overlapping ownership:** Jake, Jay and Montana Snow all build or unlock lifts and infrastructure; Minnie and Pete both sell axes; Darlene and Aria both sell fan and trick-payout upgrades; Maxi's and Jake's upgrades overlap.
- **Four stubs:** Montana Snow, Whistler, Cannon, Sled Patrol Captain (three lines each).
- The truck section has no stated gameplay role, and Stratton, Marbee and Bruin appear only there.
- **Travel-ready NPCs:** the ROADMAP never says who follows you to a new mountain or which services survive when mountain upgrades are rebought.

---

## 5. Issues easy to miss

- **Lifts and snowmobiles undo the core mechanic.** The stamina climb is the game, and the first mountain upgrades skip it.
- **Two loops with different shapes.** BitstreamBluffs is endless, score-based and ends on a crash with restart under 10 seconds. SledHEAD descents are finite, pay money, and use collisions and durability.
- **BitstreamBluffs features the ROADMAP never mentions:** pickup power-ups, an emergency reset and a "push forward" key. Decide which come along.
- **Online features are implied** by Bitstream Bluffs (hourly leaderboard, real-world daily patches, "remembers your style").
- **Platform is open.** Web PC is the only stated target. BitstreamBluffs targets Steam Deck, gamepad and touch; the windsurf rules wanted 60 FPS on Steam Deck and mid-tier Chromebooks. Decide what SledHEAD inherits and whether the two games share code.
- **Phantom or ambiguous tech.** "Pascal's Ledger" is the pause and run ledger in BitstreamBluffs but the save foundation in the windsurf rules; "Pascal's Entropy Chain" (autosave) is undefined; "TilePipe2" looks like an external tile tool.
- **Trademark exposure if it ships commercially:** "Space Mountain", "Superman", "Guitar Hero-style", "Pabst" / "Blue Ribbon", "BJ & The Bear".
- **No glossary.** "Run" means one descent, one day and one playthrough in different places.
- **Copy drift.** The ROADMAP exists in two places (repo and Google Doc). Pick one as canonical.

---

## 6. Lost-content ledger

### From the 1.0 README: NPC roles
| Dropped NPC | Mechanics it carried | Likely owner |
|---|---|---|
| Stream Manager | Audience growth, sponsorship deals | Darlene |
| Black Market Gear Dealer | Risky or illegal sled tech | Maxi |
| Event Broadcaster | Leaderboard and rival updates, "Breaking News" on achievements | Cannon |
| The Rival | Duels against your records | Possibly cut (bear racing) |
| Mysterious Merchant | Random-appearance legendary gear | Undecided |
| Ghost of the Mountain | Ghost time trials, haunted trick courses | Undecided |
| Ice Sculptor | Sled cosmetics | Undecided |
| Time Traveler | Anachronistic sled models | Undecided (late-game tier parts partly cover it) |

Smaller lost ideas: previous-champion lore (Retired Pro: "Before you, there was someone else"), replays and trick verification for payouts, sponsorship boosts for good shots, gondola expansions and VIP lift passes.

### From the 1.0 README: everything else
- **TWEAK variable list** (spawn timings, sit duration, moving multiplier, stamina drain, scoring multipliers). The ROADMAP has no balance-variables section.
- **Minigame detail:** fishing as catching (bait, casting, reeling, sonar, tournaments); lockpicking alarms and rivals; treasure hunting (maps, metal detectors, treasure races); prospecting (scanners, gold rushes, cave-ins); fossils (assembling Champ, the museum, rival paleontologists); kite upgrades; fan-requested stunt events.
- **Haunted Graveyard Hill** (the only dropped mountain), Lava Mountain's "overheat is game over", and the "Roguelike" label.

### From the windsurf rules: design rules to decide on
Keep, change or drop each:
- Stamina never regenerates passively; food is the only recovery; food has a hard daily cap.
- The landing-angle penalty was intentionally removed and must not return "in any form".
- Tricks are holds, not taps. Consistent with `todo.txt` and BitstreamBluffs.
- Each mountain has about two active cryptids plus one fossil cryptid.
- Wildlife has biome spawn rules, a layer index and a per-animal photo bonus.
- Save types: regular, checkpoint, contextual autosave.
- QA acceptance checks: animal rendering, biome filtering, layer wraparound, stamina cost and food logic.
- 60 FPS target on Steam Deck and mid-tier Chromebooks.
- Production domains `sledhead.truevox.net` and `go.sledhead.ing`; everything else is development.
- **Safe to drop:** code style, Gitmoji/changelog/semver rules, ESLint, `notify.js` and canvas conventions, file layout.

### From `todo.txt`
- "Swap from down-to-up to up-to-down": the ROADMAP direction is up then down; resolve with Q2.
- "Find some NPC to cover prospecting, treasure hunting, and rescue missions": covered by Minnie and the Patrol Captain/Stratton, both thin.
- "Nerf jumping, buff ramps, Attend Leg Day affects jump height": decide whether it survives the side-view move.
- Tricks press-to-hold: superseded by BitstreamBluffs.

---

## 7. Corrections to the first pass

- **Altitude gradient.** I said a player-relative gradient can't show absolute altitude. Withdrawn: tile altitude is absolute and the shading is only a display aid.
- **Windsurf file.** I first treated it as one dead thing. It mixes tooling with real design decisions; those are now in section 6.
- **1.0 NPCs.** I said "about ten" were dropped; it is eight.
- **Platform.** I called the 60 FPS target dead. It is undecided.
- **Pascal's Ledger.** Not a phantom: it exists in BitstreamBluffs. It still needs defining for SledHEAD.
- **Trick questions** are resolved by the BitstreamBluffs direction.

---

## 8. Open questions

### Block everything else
1. **Engine and platform:** Phaser + Matter (leaning) or Godot? Browser-first or native-first? Gamepad and touch from day one? Shared code with BitstreamBluffs?
2. **Loop order:** is the canonical day climb-then-sled with mount-anywhere, or can a day start with a descent from the top?
3. **Stamina:** ROADMAP (resting points, regeneration) or prototype/windsurf (food only, daily cap, reset at day end)?
4. **Debt and win:** how many debts, in what order, and what is the actual win condition?
5. **MVP scope:** what is the first rebuild, and which minigames and NPCs does it include?

### Needed for the first playable
6. **Landings:** is there a landing penalty or crash in side view, given it was deliberately removed before?
7. **Tumble and dismount cost:** damage, stamina, dropped cargo, or money?
8. **Payout:** what ties a descent's earnings to its length, height or tricks?
9. **Mountain scale:** target descent and climb durations (they fix mountain height).
10. **Damage and health model:** collision count, durability, repairs.
11. **Saves:** what is saved, when, and how does NG+ carry over?

### Content decisions
12. **Remaining NPC roles:** Mysterious Merchant, Ghost of the Mountain, Ice Sculptor, Time Traveler: merge or cut? Who owns fan growth?
13. **Truck vs fixed buildings:** hub replacement or lore only?
14. **Canonical names** for the other mountains, and which ROADMAP copy is canonical.
15. **Snow Bees honey:** does the cold-zone stamina effect come back?
