# **SledHEAD**
**Genre:** Roguelike | Trick & Time Trial Racer | Adventure  
**Platform:** Web-based (PC, potentially mobile)  
**Target Audience:** Arcade racing fans, adventure/simulation players, streamers & content creators  

---

## Table of Contents
1. [Core Concept](#core-concept)
2. [Procedural World & Persistence](#procedural-world--persistence)
3. [Gameplay Loops](#gameplay-loops)
   - [Sledding Phase (Downhill)](#1-sledding-phase-downhill)
   - [Climbing Phase (Uphill)](#2-climbing-phase-uphill)
   - [Management Phase (House & Upgrades)](#3-management-phase-house--upgrades)
4. [Trick System (For Extra Cash & Fan Engagement)](#trick-system-for-extra-cash--fan-engagement)
5. [Upgrade System](#upgrade-system)
   - [Personal Upgrades](#personal-upgrades-character-enhancements)
   - [Mountain Upgrades](#mountain-upgrades-resort-expansion)
6. [Game Balance & Tweakable Variables](#game-balance--tweakable-variables)
7. [Mountain Themes & Progression](#mountain-themes--progression)
8. [Mini-Games in SledHEAD](#mini-games-in-sledhead)
9. [NPCs & Mountain Town Ecosystem](#npcs--mountain-town-ecosystem)


---

## 🎯 **Core Concept**
You are an **aspiring sledding champion & content creator** who has purchased an entire **procedurally generated mountain** to train and live-stream your sled runs. To fund your dream, you’ve opened the slopes to the public, attracting:

- **Casual Tourists** – Regular visitors who use the mountain but don’t care about you.  
- **Fans & Followers** – Devoted viewers who cheer, hype you up, and even offer in-game boosts.  

Your goal is to master the mountain, **optimize runs for speed and tricks**, and **grow your fanbase** to attract **sponsorships, cash, and new opportunities**. The **better your performance, the more money you earn**, allowing you to invest in **personal upgrades, sled modifications, and mountain expansions**.

---

## 🎮 **Controls & Gameplay Mechanics**

### **⬇️ Downhill Phase: Fast-Paced Sledding**
In the **downhill phase**, you’re controlling your sled as it races down procedurally generated slopes, dodging obstacles, pulling off tricks, and aiming for the fastest times.

#### **Basic Movement:**
- **Left / Right Arrow Keys (← →)** – Steer your sled left or right.  
- **Down Arrow (↓)** – Crouch for extra speed on straightaways.  
- **Up Arrow (↑)** – Prepare for a jump off a ramp.  

#### **Trick System:**
- Tricks are executed using combinations of **Up, Down, Left, and Right Arrows**.
- Landing tricks successfully grants extra money and fan engagement.
- Be mindful of your timing - land while doing a trick, and you could crash!

#### **Hazards & Interactions:**
- **Tourists:** Sometimes they move, sometimes they don’t—dodge carefully!
- **Fans:** If you impress them with tricks, they’ll cheer you on and even give you boosts.
- **Ice Patches:** Reduce control and make turns trickier.
- **Snow Drifts & Ramps:** Use them for sick air and trick opportunities.
- **Time Trial Activators:** If you pass through one, your downhill time is tracked—faster times mean better rewards!

---

### **⬆️ Uphill Phase: Climbing & Exploration**
Once you reach the bottom, it’s time to **make your way back up**. The mountain doesn’t regenerate, so you’ll be retracing paths and discovering new shortcuts.

#### **Basic Movement & Stamina:**
- **Left / Right Arrow Keys (← →)** – Move horizontally across the mountain.
- **Up Arrow (↑)** – Hike uphill, consuming stamina.
- **Down Arrow (↓)** – Rest momentarily to recover stamina.

#### **Navigation & Assistance:**
- If you've **unlocked ski lifts or snowmobiles**, you can use them for a quicker return.
- **Shortcut Awareness** upgrades help you find hidden paths to make the climb easier.
- **Food Stalls & Rest Areas** restore stamina—plan your route accordingly!

#### **Wildlife Photography Mini-Game 📸**
- While hiking, **animals appear every few seconds**.
- Aim the camera using **Arrow Keys**, and take a shot with **Spacebar**.
- Align your camera with the **altitude line** for a perfect photo.
- **Moving animals give higher rewards** but are harder to capture.

---

**Next Steps:**  
- **If you want to make money:** Optimize your tricks and time trials.  
- **If you want to upgrade:** Invest in stamina, sled durability, and trick enhancements.  
- **If you want to explore:** Look for wildlife, hidden shortcuts, and fan hotspots!  

---

## 🌎 **Procedural World & Persistence**
- The mountain remains consistent during a playthrough.  
- **New terrain is only generated when starting a new game.**  
- The current **seed is displayed at home**, and players can enter a **custom seed for a specific mountain.**  
- **Changes per run:**
  - Tourists & fans shift positions.  
  - Weather may change dynamically.  
  - Wildlife encounters vary.

---

## 🎮 **Gameplay Loops**

### 1️⃣ **Sledding Phase (Downhill) ⬇️**
💨 **Fast-paced, high-speed, gravity-driven sledding with a trick system.**  
- **Goal:** Reach the bottom as efficiently as possible while **navigating obstacles, taking shortcuts, and pulling off tricks** for extra cash.  
- **Terrain:** Procedurally generated **rocks, ramps, cliffs, ski lifts, obstacles, and hidden paths**.  
- **Obstacles:**
  - **Tourists**: Sometimes move out of the way, sometimes don’t.
  - **Fans**: Cheer you on & give you **boosts** if you impress them.
  - **Moving Hazards**: Ski patrol, rogue snowmobiles, loose sleds.  
- **Weather Effects:** Wind, fog, snow drifts, and ice patches change difficulty dynamically.  
- **Time Trials:**  
  - Activated by **hitting a time trial activator** (e.g., checkpoint, gate, or radar timer).  
  - **Your time between activators determines your bonus.**  
  - **Faster times = more money!**  
  - Not all runs are timed; only those where you activate a trial.  

---

### 2️⃣ **Climbing Phase (Uphill) ⬆️**
🚶 **Top-down adventure traversal with stamina management and exploration.**  
- **Goal:** Return to the top **by hiking, using ski lifts, snowmobiles, or taking shortcuts**.  
- **Terrain:** The same generated world as the downhill run (no regenerating between runs).  
- **Stamina System:**  
  - Stamina drains when hiking.  
  - Replenished by **food stands, resting points, or upgrades**.  
- **Wildlife Photography Mini-Game 📸** *(Active only in Uphill Phase)*  
  - **Random animals appear every 5–10 seconds (TWEAK variable).**  
  - Animals either **stay still (1–20 seconds) or move (making them harder to photograph).**  
  - **Use the Arrow Keys to aim the camera cone** around your character.  
  - **Align the altitude line** with the animal’s altitude for a perfect shot.  
  - **Photos earn money, with multipliers for:**  
    - Accuracy (center of POV cone).  
    - Altitude match precision.  
    - Moving vs. stationary targets (moving = 3x value).  

---

### 3️⃣ **Management Phase (House & Upgrades) 🏠**
🏡 **Upgrade your gear, mountain, and social media presence.**  
- **Spend earned money on:**
  - **Personal Upgrades:** Increase sledding ability, climbing endurance, photography precision.  
  - **Sled Upgrades:** Speed, handling, trick potential.  
  - **Mountain Upgrades:** Add ski lifts, shops, and fans to boost income & challenge.  
- **New Game Start:**  
  - Mountain **ONLY regenerates when starting a completely new game.**  
  - **A seed system** lets players enter a specific seed for reproducible terrain.  
  - **Current seed is displayed at home.**  

---

## ✨ **Trick System (For Extra Cash & Fan Engagement)**
Performing tricks during downhill runs boosts **viewer engagement, increasing cash rewards**.

1. **☁️🪂 Parachute (Up, Down)**  
   You hold the sled over your head like a big ol’ parachute, slowing your vertical descent so you can hang in the air longer, just like floatin’ on a cloud, eh?  
   **Pixel Art Representation:**  
   The rider lifts the sled high above their head, arms fully extended. The sled tilts slightly, mimicking a floating parachute. Small pixelated wind streaks or snow particles drift upward to indicate reduced descent speed.

2. **🛑🎿 Air Brake (Up, Up)**  
   Hold that sled out behind you like a makeshift air brake to suddenly slow down your lateral speed—kinda like when a kitty makes a quick stop!  
   **Pixel Art Representation:**  
   The rider holds the sled behind them at an angle, legs bent forward to emphasize the sudden slowdown. A few small speed lines in front of the rider suddenly cut off, highlighting the braking effect.

3. **🔄⬅️ Sled Flip Back (Down, Left)**  
   A full backward flip that sends the sled over your head in a smooth reverse rotation, perfect for showin’ off your style.  
   **Pixel Art Representation:**  
   The sled and rider rotate backward together in a fluid animation, leaving a subtle motion blur trail behind to emphasize speed.

4. **🔄➡️ Sled Flip Front (Down, Right)**  
   Flip forward with a quick rotation that launches you off the ramp—fast, fun, and full of flair!  
   **Pixel Art Representation:**  
   The sled and rider rotate forward rapidly, briefly showing a silhouetted mid-flip pose for a cool spinning effect.

5. **🚁⬅️ Helicopter Spin Left (Left, Left)**  
   Spin the sled horizontally like a mini helicopter twirlin’ left—watch that pixel art blur as it slices through the air.  
   **Pixel Art Representation:**  
   The sled remains under the rider while spinning rapidly to the left, with small curved motion lines surrounding it to emphasize rotation.

6. **🚁➡️ Helicopter Spin Right (Right, Right)**  
   Just like its twin but twirlin’ right—this trick’s all about that rapid, smooth spin, buddy.  
   **Pixel Art Representation:**  
   Identical to Helicopter Spin Left but mirrored to the right, with the same spinning blur effect and curved lines.

7. **🦸‍♂️✨ Superman (Down, Down)**  
   Channel your inner superhero by extending your arms like Superman while holding the sled with both hands—pure power and style on the slopes!  
   **Pixel Art Representation:**  
   The rider extends both arms forward, body stretched out like they’re flying. The sled tilts slightly backward for a dramatic effect.

8. **🌪️➡️ Sky Dive Roll Right (Up, Right)**  
   Push the sled off and roll to the right in mid-air, spreadin’ out like you’re dancin’ through the sky with a freefall vibe.  
   **Pixel Art Representation:**  
   The rider tumbles sideways while the sled momentarily drifts away, before they reach out to grab it again.

9. **🌪️⬅️ Sky Dive Roll Left (Up, Left)**  
   The same cool roll but to the left—it's like floatin’ and twistin’ in the air, makin’ it look effortless.  
   **Pixel Art Representation:**  
   Mirrored version of Sky Dive Roll Right, with the same falling motion effect and mid-air recovery animation.

10. **👻🔥 Ghost Rider (Left, Right)**  
    Push the sled away and, like a ghostly apparition, grab it back before you land—spooky and smooth all at once.  
    **Pixel Art Representation:**  
    The rider momentarily separates from the sled, which drifts forward with a slight transparency effect before being grabbed again.

11. **🎿🔄 Toboggan Toss (Right, Left)**  
    Let go of the sled mid-air, spin yourself a full 360° and land back on it—like tossin’ your worries away with a big, wild spin!  
    **Pixel Art Representation:**  
    The rider performs a spinning animation while the sled briefly floats below them, before they land back on it.

12. **🌀➡️ Corkscrew Right (Right, Down)**  
    Mix a flip and a spin into one diagonal barrel roll—twist and turn like a corkscrew rightward, leaving a trail of style behind you.  
    **Pixel Art Representation:**  
    The rider and sled rotate diagonally in sync, creating a swirling corkscrew motion with a slight trailing blur.

13. **🌀⬅️ Corkscrew Left (Left, Down)**  
    Mix a flip and a spin into one diagonal barrel roll—twist and turn like a corkscrew leftward, leaving a trail of style behind you.  
    **Pixel Art Representation:**  
    Same as Corkscrew Right, but mirrored to the left with identical motion blur effects.

14. **✨⬆️ Falling Star (Down, Up)**  
    In mid-air you let go of the sled for a moment to do a "star pose" (legs and arms spread wide) before getting back on the sled.  
    **Pixel Art Representation:**  
    The rider spreads their limbs wide in mid-air, with small sparkling effects around them before returning to the sled.

15. **🌍➡️ Orbit Spin Clockwise (Right, Up)**  
    Launching into the air, the rider grips the board firmly in front of them, rotating a full 360° to the right (clockwise) while suspended in mid-air like a satellite caught in orbit.  
    **Pixel Art Representation:**  
    The sled and rider spin together in a tight, controlled orbit-like motion, with a circular blur trailing behind.

16. **🌍⬅️ Orbit Spin Counterwise (Left, Up)**  
    With an explosive lift-off, the rider soars into the sky, clutching their board tightly while spinning a complete 360° to the left (counterclockwise) in a controlled, weightless rotation.  
    **Pixel Art Representation:**  
    Identical to Orbit Spin Clockwise, but mirrored leftward, keeping the same smooth circular motion and blur effect.

*💡 Later Upgrade:* **"Sledboarding"** unlocks snowboard-style **grinds, flips, and advanced tricks**.

---

## 🔧 **Upgrade System**

### 🧑‍🎿 Personal Upgrades (Character Enhancements)
| Upgrade                    | Effect                                             |
|----------------------------|----------------------------------------------------|
| 🚀 **Rocket Surgery**      | Faster acceleration & top speed.                 |
| 🎮 **Optimal Optics**      | Increases camera POV for better wildlife photos.   |
| 🛡️ **Sled Durability**     | +1 collision allowed before crash.               |
| 🥾 **Fancier Footwear**    | Faster hiking speed, better grip.                  |
| ❄️ **Grappling Anchor**    | Hook onto terrain for shortcuts.                 |
| 💪 **Attend Leg Day**      | Reduces stamina cost while climbing.             |
| 🏔️ **Shortcut Awareness**  | Reveals hidden shortcuts.                          |
| 📣 **Crowd Hypeman**       | More fans = bigger trick bonuses.                |
| 🚶‍♂️ **Crowd Weaver**      | Non-fan tourists dodge more often.               |
| 🌨️ **Weather Warrior**     | Reduces negative weather effects.                |

---

### 🏔️ Mountain Upgrades (Resort Expansion)
| Upgrade                        | Effect                                                         |
|--------------------------------|----------------------------------------------------------------|
| 🚡 **High-Speed Ski Lifts**    | Lets you quickly ride back up.                                 |
| 🏎️ **Snowmobile Rentals**      | You can rent snowmobiles for faster ascents.                   |
| 🍔 **Food Stalls**             | Generates money & restores stamina.                            |
| 🏁 **Groomed Trails**          | Grants occasional speed boosts.                                |
| ⛑️ **First-Aid Stations**      | Heal after crashes.                                            |
| 📷 **Scenic Overlooks**        | Passive income & potential shortcuts.                          |
| 📢 **Ramp-Billboards**         | Generates ad revenue & doubles as ramps.                       |
| 🏨 **Resort Lodges**           | Adds new starting locations for runs.                          |
| 🌙 **Night Lighting**          | Enables nighttime runs with bonus rewards.                     |
| ❄️ **Weather Control**         | Modify conditions for different challenges.                    |

---

## ⚖️ **Game Balance & Tweakable Variables**
All these are stored in the **TWEAK object** for easy adjustments:
- Wildlife spawn times (min/max).
- Wildlife **sit duration** (min/max).
- Moving animal multiplier.
- Camera **POV cone size**.
- **Time trial activator frequency** & bonuses.
- **Stamina drain rates**.
- **Mountain regeneration rules**.
- **Trick scoring multipliers**.
- **Photograph accuracy bonuses**. 

**Progression Goals:**  
- **Prototype:** Repay the cost of the mountain.  
- **Full Game:**  
  - Stage 1: Repay your house, unlocking initial "Mountain" upgrades like ski lifts.  
  - Stage 2: After paying off your mountain, a much bigger debt unlocks a new mountain (with fresh environments like Lava Mountain, Space Mountain, and Underwater Mountain).  
  - Note: You'll start off with zero mountain upgrades but keep your personal upgrades.  
  - Unique upgrades are required to access each new mountain, with limited availability—though more snowy peaks are always around to explore!

---

## 🏔️ **Mountain Themes & Progression**

### Lava Mountain 🌋
- **Description:** Sizzling volcanic slopes with flowing lava rivers, steaming geysers, and rocky outcrops. Watch out for molten streams, lava bombs, and volcanic tremors.  
- **Mechanics:**  
  - **Heat Meter:** Overheat means game over unless you hit cool-off zones.  
  - **Ash Clouds:** Temporarily block visibility.
- **Power-Up:** **Heat Shielding Sled Coating**  
  *Required upgrade to unlock Lava Mountain. Provides heat protection and slightly reduces friction on other levels.*

---

### Space Mountain 🌌
- **Description:** Sled in low gravity on lunar or Martian slopes with huge craters, steep cliffs, and meteor showers.  
- **Mechanics:**  
  - **Low Gravity:** Higher jumps, longer airtime, easier flips 'n tricks.  
  - **Meteor Showers:** Random meteor strikes introduce obstacles.
- **Power-Up:** **Gravity Stabilizer Sled Upgrade**  
  *Required to unlock Space Mountain. Stabilizes sled control in fluctuating gravity.*

---

### Underwater Mountain 🌊
- **Description:** Submerged slopes with slow-motion physics. Seaweed, coral formations, and hidden underwater currents abound.  
- **Mechanics:**  
  - **Air Meter (Stamina):** Acts like oxygen; replenished by air bubbles or surface spots.
- **Power-Up:** **Aqua-Lung Mittens**  
  *Required to enter Underwater Mountain. Constantly replenishes stamina underwater and reduces stamina drain on other mountains.*

---

### Garbage Dump Glacier 🗑️❄️
- **Description:** Icy runs through a frozen landfill filled with discarded items, oil slicks, and seagull attacks.  
- **Mechanics:**  
  - **Sticky Garbage Areas:** Slow down your sled unless special upgrades are used.
- **Power-Up:** **Slick Wax Spray**  
  *Required to unlock Garbage Dump Glacier. Prevents sticky terrain and provides a speed boost on all levels.*

---

### Micro Mountain 🐜🌱
- **Description:** A microscopic adventure down blades of grass, dodging oversized ants, and navigating dew drops.  
- **Mechanics:**  
  - **Tiny Obstacles:** Garden insects and pollen clusters create dynamic hazards.
- **Power-Up:** **Antigrav Wax**  
  *Required for Micro Mountain. Dramatically reduces friction and improves glide efficiency across all terrains.*

---

### Candy Cane Canyon 🍭
- **Description:** Sweet, candy-themed slopes with chocolate rivers, caramel waterfalls, and peppermint jumps.  
- **Mechanics:**  
  - **Sticky Sweets & Sugar Rush Zones:** Affect speed and maneuverability.
- **Power-Up:** **Sweet-Tooth Coating**  
  *Required for Candy Cane Canyon. Prevents sticking and mitigates slowdown effects on other terrains.*

---

### Crystal Cave Cavern 🔮
- **Description:** Glittering caverns with stalactites, delicate crystal formations, and echoing acoustics.  
- **Mechanics:**  
  - **Fragile Obstacles:** Crystals break on impact, temporarily obscuring vision.
- **Power-Up:** **Crystal Clear Goggles**  
  *Required for Crystal Cave Cavern. Enhances visibility and reduces the impact of obstructions.*

---

### Haunted Graveyard Hill 👻
- **Description:** Spooky slopes with gravestones, eerie trees, and wandering ghosts.  
- **Mechanics:**  
  - **Ghost Encounters & Phantom Fans:** Can hinder or help your progress with unexpected effects.
- **Power-Up:** **Spirit Lantern**  
  *Required to access Haunted Graveyard Hill. Illuminates hidden pathways and improves overall visibility.*

---

### Sky Jellyfish Mountain ☁️🪼
- **Description:** Ethereal, bouncy slopes with luminous sky jellyfish and shifting cloud platforms.  
- **Mechanics:**  
  - **Bounce Physics & Air Gusts:** Create unpredictable trajectories.
- **Power-Up:** **Stabilizer Sled Rails**  
  *Required for Sky Jellyfish Mountain. Improves landing stability and reduces bounce unpredictability.*

---

### Mechanical Mountain (Steampunk Slopes) ⚙️🎩
- **Description:** Steampunk-inspired terrain with gears, conveyor belts, and mechanical contraptions.  
- **Mechanics:**  
  - **Timed Obstacles & Gear Grinds:** Require precise timing and offer big cash bonuses.
- **Power-Up:** **Clockwork Treads**  
  *Required to unlock Mechanical Mountain. Provides traction on moving surfaces and enhances handling.*

---

### Pyramid Peak 🐫🏜️
- **Description:** Ancient Egyptian slopes with sandy ruins, sandstorms, falling boulders, and scarab swarms.  
- **Mechanics:**  
  - **Sandstorms & Hidden Pitfalls:** Obscure vision and reveal secret ramps.
- **Power-Up:** **Sandrunner Skis**  
  *Required for Pyramid Peak. Enables smooth gliding over sandy terrain and enhances performance on loose surfaces.*

---

### Digital Mountain (Cyber Slopes) 💻🔮
- **Description:** Neon-lit digital slopes filled with glitches, data streams, and pop-up malware ads.  
- **Mechanics:**  
  - **Glitch Zones & Malware Hazards:** Cause unpredictable teleportation and control issues.
- **Power-Up:** **Data Shielding**  
  *Required to access Digital Mountain. Protects against digital hazards and improves overall stability.*

---

## 🎮 **Mini-Games in SledHEAD**

### 1. **Animal Photography** 📸🐾
- **Objective:**  
  Capture high-quality photos of rare and elusive wildlife while climbing uphill.
- **Mechanics:**  
  - **Camera Controls:** Zoom, motion tracking, shifting **POV cone**, and matching the **altitude line** with the target.  
  - **Wildlife Behavior:** Animals spawn randomly (every 5–10 sec) and may stay still (1–20 sec) or move unpredictably (moving targets grant 3x more money).  
  - **Scoring Bonuses:**  
    - **Altitude Match Multiplier**  
    - **POV Centering Bonus**  
    - **Speed Capture Bonus**  
- **Upgrades:**  
  - **Optimal Optics:** Increases the camera’s POV cone.  
  - **Steady Hands:** Reduces camera sway.  
  - **Animal Baiting:** Increases rare animal appearance.
- **Special Events:**  
  - **Rare Animal Sightings** and **Storm Photography**.
- **Risk/Challenge:**  
  - **Repeat Photo Penalty** and aggressive animal disruptions.

---

### 2. **Fishing** 🎣🐟  
- **Objective:**  
  Catch fish using various techniques and bait types.
- **Mechanics:**  
  - Dynamic water simulation with varied fish behaviors.  
  - Choose your bait, casting angle, and reel technique (e.g., slow pull, rapid jerk, deep drag).  
  - Legendary fish yield major rewards.
- **Upgrades:**  
  - Stronger fishing lines, advanced lures, and sonar detection.
- **Special Events:**  
  - Fishing tournaments and rare migration patterns.
- **Risk/Challenge:**  
  - Line snapping and predator interference.

---

### 3. **Lockpicking in Abandoned Buildings** 🔐🏚️  
- **Objective:**  
  Unlock doors, safes, and hidden compartments.
- **Mechanics:**  
  - Use tools like **rakes, hooks, and tension wrenches**.  
  - Navigate traps such as alarms and rusted internals.
- **Upgrades:**  
  - High-quality picks, electronic bypass tools, and vibration sensors.
- **Special Events:**  
  - Timed heists and races with rival scavengers.
- **Risk/Challenge:**  
  - Unstable buildings and hazards that may alert authorities.

---

### 4. **Treasure Hunting** 🏴‍☠️🔍  
- **Objective:**  
  Find buried treasure using maps, clues, and metal detectors.
- **Mechanics:**  
  - Decode old maps, identify landmarks, and use metal detectors for precision.  
  - Digging requires stamina management and upgraded tools.
- **Upgrades:**  
  - Advanced metal detectors, excavation tools, and digging drones.
- **Special Events:**  
  - NPC treasure races and secret cache discoveries.
- **Risk/Challenge:**  
  - Booby traps, hostile environments, and law enforcement risks.

---

### 5. **Kite Flying** 🪁🌬️  
- **Objective:**  
  Control a kite during uphill climbs, then reap aerial bonuses during sled runs.
- **Mechanics:**  
  - **Uphill:** Switch to a Guitar Hero-style directional arrow input to keep the kite stable.  
  - **Downhill:** Kites extend air time and grant special bonuses.
- **Upgrades:**  
  - **Glide Boost, Speed Stream, and Aero Control.**
- **Special Events:**  
  - **Storm Riding** with higher boosts but riskier winds.
- **Risk/Challenge:**  
  - Strong gusts may destabilize your kite.

---

### 6. **Prospecting (Pan & Pickaxe Mining)** ⛏️💎  
- **Objective:**  
  Search for valuable minerals, gems, and gold.
- **Mechanics:**  
  - Explore rivers, caves, and rock formations.  
  - **Panning:** Swirl water to separate gold.  
  - **Pickaxe Mining:** Break rocks for hidden gems.
- **Upgrades:**  
  - High-tech panning kits, seismic scanners, precision drills.
- **Special Events:**  
  - Gold rush hotspots, rare mineral finds, and cave-ins.
- **Risk/Challenge:**  
  - Unstable ground and rival prospectors.

---

### 7. **Cryptid Fossil Digging** 🦴🔍  
- **Objective:**  
  Unearth and assemble fossils of **Champ**, the legendary cryptid of Lake Champlain.
- **Mechanics:**  
  - Use brushes, chisels, and excavation tools to reveal fossils.  
  - Transport fossils to the museum at the base of the first mountain.
- **Upgrades:**  
  - Precision excavation kits, automated digging arms, and fossil resin stabilizers.
- **Special Events:**  
  - Competing paleontologists and hidden dig sites.
- **Risk/Challenge:**  
  - Fragile fossils, extreme weather, cave-ins, and unexpected cryptid sightings.

---

### 8. **Sled Tricking** 🛷✨  
- **Objective:**  
  Chain together aerial sled tricks to earn cash and boost fan engagement.
- **Mechanics:**  
  - Utilize a trick system featuring helicopter spins, flips, air brakes, corkscrews, and ghost rider moves.  
  - Chain tricks for higher multipliers.
- **Upgrades:**  
  - Trick-enhancing sled mods, jump-boosting gear, and aerial control boosters.
- **Special Events:**  
  - Trick challenges and fan-requested stunt competitions.
- **Risk/Challenge:**  
  - Mistimed tricks can cause crashes and loss of earnings.

---

### 9. **Time Trial Racing** 🏁🛷  
- **Objective:**  
  Trigger time trial races by hitting gates while sledding for money rewards.
- **Mechanics:**  
  - Crossing a time trial gate starts a timer.  
  - The faster and further you go, the more money you earn.
- **Why It Fits:**  
  - Seamlessly integrates as a high-speed challenge within the sledding phase.

---

### 10. **RC Motor Sled** ❄️🏎️  
- **Objective:**  
  Control a high-speed RC snowmobile for scouting, trick-based racing, and retrieving stamina-boosting supplies.
- **Mechanics:**  
  - Maneuver nimble RC sleds across frozen tundra.  
  - Nitro boosts and mid-air tricks enhance performance.  
  - Customization options include different sled bodies, engines, and handling upgrades.
- **Special Events:**  
  - Avalanche races, night rides, and hazard runs.
- **Risk/Challenge:**  
  - Limited battery life, high winds, and signal loss in deep snow.

## 🏔️ **NPCs & Mountain Town Ecosystem**
SledHEAD’s world is filled with **unique characters** who contribute to your journey as a **trick-riding, fan-growing, upgrade-building, sled-stunting** legend. Some run the town, some enhance your sledding skills, and others add depth to the **roguelike adventure**.

---

### 🏡 **Core Resort & Business Owners (Essential Infrastructure)**
These **support your base mountain**—they run the town, drive your economy, and keep the game loop running.

#### 🏂 **The Sled Tech (Sled Repairs & Mods)**
- **Purpose:** Repairs damage, sells sled mods.
- **Upgrades Unlocked:** **Custom wax, shock absorbers, reinforced sleds.**
- **Best Quote:** “What’d ya do, run into a moose? I can fix it… for a price.”

#### 🍔 **The Food Vendor (Buffs & Endurance Recovery)**
- **Purpose:** Sells food that restores stamina and gives **temporary buffs** for sledding.
- **Best Quote:** “Hot cocoa makes you go faster, I swear. Try it.”

#### 🎥 **The Stream Manager (Audience Growth & Sponsorships)**
- **Purpose:** Manages your in-game audience; unlocks **sponsorship deals**.
- **Best Quote:** “If you don’t clip the trick, did you even land it?”

#### 🏁 **The Race Commissioner (Tournaments & Time Trials)**
- **Purpose:** Hosts **time trials, speedrun events, and competitive circuits**.
- **Best Quote:** “Half a second off the record? C’mon, I thought you were good.”

#### 🚠 **The Lift Operator (Ski Lift & Shortcut Unlocks)**
- **Purpose:** Lets you **unlock ski lifts** for quicker uphill trips.
- **Upgrades Unlocked:** **Gondola expansions, VIP lift passes.**
- **Best Quote:** “Sure, you could walk… or you could bribe me.”

---

### 💨 **Trick & Racing-Oriented NPCs (For Stunts, Style, & Money)**
These folks help you **push your limits**, pull off **sick tricks**, and **maximize profits**.

#### 🎿 **The Trick Trainer (Advanced Trick Lessons)**
- **Purpose:** Unlocks **trick combos & advanced air control.**
- **Best Quote:** “No guts, no glory. You wanna spin faster? Listen up.”

#### 📸 **The Hype Photographer (Proof-Based Challenges & Bonus Money)**
- **Purpose:** **Trick verification & photography mini-games**.
- **Upgrades Unlocked:** **Slow-mo replays, sponsorship boosts for sick shots.**
- **Best Quote:** “A trick’s only worth money if people see it.”

#### 💰 **The Black Market Gear Dealer (Risky Upgrades & Illegal Mods)**
- **Purpose:** Sells **risky sled tech** (illegal nitro boosts, magnetized rails for grinds).
- **Upgrades Unlocked:** **Unstable overclocked sled parts**.
- **Best Quote:** “No refunds. Don’t ask what’s in it.”

#### 🤡 **The Stunt Organizer (Jackass-Style Events & Side Hustles)**
- **Purpose:** Hosts **insane trick challenges** with **huge risk & reward**.
- **Best Quote:** “Land a quadruple flip, and I’ll give you something real nice.”

---

### 🌎 **Worldbuilding NPCs (Exploration, Hidden Routes, & Fan Engagement)**
These folks **expand the world** and **give reasons to explore**.

#### ⛷️ **The Retired Pro (Hidden Sledding Routes & Legend Quests)**
- **Purpose:** Tells **lore, hidden trails, and backstory of previous champions.**
- **Upgrades Unlocked:** **Secret mountain shortcuts & sled blueprints.**
- **Best Quote:** “Before you, there was someone else. And he disappeared.”

#### 🦊 **The Wildlife Researcher (Animal Photography & Rare Fan Unlocks)**
- **Purpose:** Ties into **wildlife photography mini-games**.
- **Upgrades Unlocked:** **Animal-based sled skins & rare sponsor deals.**
- **Best Quote:** “Snow leopards? They’re watching you, too.”

#### 📡 **The Event Broadcaster (Commentary & Competitive Meta)**
- **Purpose:** Gives **updates on leaderboards, rival NPCs, and changing conditions**.
- **Upgrades Unlocked:** **"Breaking News" reports on your achievements.**
- **Best Quote:** “The fans are watching, buddy. Make it count.”

---

### 🛤️ **The Travel-Ready NPCs (Appear Across Multiple Mountains)**
They **don’t just stay in one place**—you’ll run into them as you unlock new peaks.

#### 🎭 **The Rival (Dynamic Trick & Time Trial Duels)**
- **Purpose:** Appears on any unlocked mountain to **challenge your records**.
- **Best Quote:** “Your best time? That’s cute.”

#### 🛠️ **The Tinkerer (Experimental Sled Mods)**
- **Purpose:** Sells **unstable, high-risk sled modifications**.
- **Upgrades Unlocked:** **Prototype sled tech.**
- **Best Quote:** “This is 50% science and 50% dumb luck.”

#### 🎩 **The Mysterious Merchant (Random Legendary Gear)**
- **Purpose:** Appears randomly, selling **rare sleds & gear**.
- **Best Quote:** “You don’t know what you need… until you see it.”

---

### 🎭 **The Wild Cards (Weird & Legendary NPCs)**
These folks are **just strange**, but they add **flavor, mystery, and unpredictability**.

#### 👻 **The Ghost of the Mountain (Phantom Races & Haunted Challenges)**
- **Purpose:** Unlocks **ghost time trials & haunted trick courses**.
- **Best Quote:** “You ride my path, you race my shadow.”

#### 🧙‍♂️ **The Winter Shaman (Weather Manipulation & Magic Sleds)**
- **Purpose:** **Controls mountain weather** for harder/easier runs.
- **Best Quote:** “Blizzards make legends.”

#### 🐻 **The Bear Whisperer (Bear Sled Racing Mini-Game)**
- **Purpose:** Lets you **race against trained bears** for money.
- **Best Quote:** “You sled. They sled. Only one wins.”

#### 🥶 **The Ice Sculptor (Sled Cosmetics & Customization)**
- **Purpose:** Crafts **one-of-a-kind sled designs**.
- **Best Quote:** “Your ride should be a masterpiece.”

#### 🔮 **The Time Traveler (Future & Past Sled Tech)**
- **Purpose:** Unlocks **anachronistic sled models** (steampunk, cyberpunk, caveman logs).
- **Best Quote:** “The future’s fast. The past is brutal.”

---

## **🏔️ Final Thoughts**
This crew **perfectly balances**:
✅ **Core game economy & upgrades**  
✅ **High-speed trick-focused gameplay**  
✅ **Exploration & hidden content**  
✅ **Hilarious but valuable side NPCs**  

These **NPCs make the town feel alive, push competitive play, and add world depth**. Get ready to **build, race, trick, and explore** with this **cast of unforgettable characters**.  
