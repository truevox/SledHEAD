# **SledHEAD**
**Genre:** Roguelike | Trick & Time Trial Racer | Adventure  
**Platform:** Web-based (PC, potentially mobile)  
**Target Audience:** Arcade racing fans, adventure/simulation players, streamers & content creators  

---

## 🎯 **Core Concept**
You are an **aspiring sledding champion & content creator** who has purchased an entire **procedurally generated mountain** to train and live-stream your sled runs. To fund your dream, you’ve opened the slopes to the public, attracting:

- **Casual Tourists** – Regular visitors who use the mountain but don’t care about you.  
- **Fans & Followers** – Devoted viewers who cheer, hype you up, and even offer in-game boosts.  

Your goal is to master the mountain, **optimize runs for speed and tricks**, and **grow your fanbase** to attract **sponsorships, cash, and new opportunities**. The **better your performance, the more money you earn**, allowing you to invest in **personal upgrades, sled modifications, and mountain expansions**.

---

## 🌀 **Core Gameplay Loops**
SledHEAD features **three primary gameplay loops**:

### **1️⃣ Sledding Phase (Downhill) ⬇️**
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

### **2️⃣ Climbing Phase (Uphill) ⬆️**
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

### **3️⃣ Management Phase (House & Upgrades) 🏠**
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

## 🎿 **Trick System (For Extra Cash & Fan Engagement)**
Performing tricks during downhill runs boosts **viewer engagement, increasing cash rewards**.  

### 1. ☁️🪂 **Parachute** (**Up, Down**)  
You hold the sled over your head like a big ol’ parachute, slowing your vertical descent so you can hang in the air longer, just like floatin’ on a cloud, eh?

**Pixel Art Representation:**  
The rider lifts the sled high above their head, arms fully extended. The sled tilts slightly, mimicking a floating parachute. Small pixelated wind streaks or snow particles drift upward to indicate reduced descent speed.

### 2. 🛑🎿 **Air Brake** (**Up, Up**)  
Hold that sled out behind you like a makeshift air brake to suddenly slow down your lateral speed—kinda like when a kitty makes a quick stop!

**Pixel Art Representation:**  
The rider holds the sled behind them at an angle, legs bent forward to emphasize the sudden slowdown. A few small speed lines in front of the rider suddenly cut off, highlighting the braking effect.

### 3. 🔄⬅️ **Sled Flip Back** (**Down, Left**)  
A full backward flip that sends the sled over your head in a smooth reverse rotation, perfect for showin’ off your style.

**Pixel Art Representation:**  
The sled and rider rotate backward together in a fluid animation, leaving a subtle motion blur trail behind to emphasize speed.

### 4. 🔄➡️ **Sled Flip Front** (**Down, Right**)  
Flip forward with a quick rotation that launches you off the ramp—fast, fun, and full of flair!

**Pixel Art Representation:**  
The sled and rider rotate forward rapidly, briefly showing a silhouetted mid-flip pose for a cool spinning effect.

### 5. 🚁⬅️ **Helicopter Spin Left** (**Left, Left**)  
Spin the sled horizontally like a mini helicopter twirlin’ left—watch that pixel art blur as it slices through the air.

**Pixel Art Representation:**  
The sled remains under the rider while spinning rapidly to the left, with small curved motion lines surrounding it to emphasize rotation.

### 6. 🚁➡️ **Helicopter Spin Right** (**Right, Right**)  
Just like its twin but twirlin’ right—this trick’s all about that rapid, smooth spin, buddy.

**Pixel Art Representation:**  
Identical to Helicopter Spin Left but mirrored to the right, with the same spinning blur effect and curved lines.

### 7. 🦸‍♂️✨ **Superman** (**Down, Down**)  
Channel your inner superhero by extending your arms like Superman while holding the sled with both hands—pure power and style on the slopes!

**Pixel Art Representation:**  
The rider extends both arms forward, body stretched out like they’re flying. The sled tilts slightly backward for a dramatic effect.

### 8. 🌪️➡️ **Sky Dive Roll Right** (**Up, Right**)  
Push the sled off and roll to the right in mid-air, spreadin’ out like you’re dancin’ through the sky with a freefall vibe.

**Pixel Art Representation:**  
The rider tumbles sideways while the sled momentarily drifts away, before they reach out to grab it again.

### 9. 🌪️⬅️ **Sky Dive Roll Left** (**Up, Left**)  
The same cool roll but to the left—it's like floatin’ and twistin’ in the air, makin’ it look effortless.

**Pixel Art Representation:**  
Mirrored version of Sky Dive Roll Right, with the same falling motion effect and mid-air recovery animation.

### 10. 👻🔥 **Ghost Rider** (**Left, Right**)  
Push the sled away and, like a ghostly apparition, grab it back before you land—spooky and smooth all at once.

**Pixel Art Representation:**  
The rider momentarily separates from the sled, which drifts forward with a slight transparency effect before being grabbed again.

### 11. 🎿🔄 **Toboggan Toss** (**Right, Left**)  
Let go of the sled mid-air, spin yourself a full 360° and land back on it—like tossin’ your worries away with a big, wild spin!

**Pixel Art Representation:**  
The rider performs a spinning animation while the sled briefly floats below them, before they land back on it.

### 12. 🌀➡️ **Corkscrew Right** (**Right, Down**)  
Mix a flip and a spin into one diagonal barrel roll—twist and turn like a corkscrew rightward, leaving a trail of style behind you.

**Pixel Art Representation:**  
The rider and sled rotate diagonally in sync, creating a swirling corkscrew motion with a slight trailing blur.

### 13. 🌀⬅️ **Corkscrew Left** (**Left, Down**)  
Mix a flip and a spin into one diagonal barrel roll—twist and turn like a corkscrew leftward, leaving a trail of style behind you.

**Pixel Art Representation:**  
Same as Corkscrew Right, but mirrored to the left with identical motion blur effects.

### 14. ✨⬆️ **Falling Star** (**Down, Up**)  
In mid-air you let go of the sled for a moment to do a "star pose" (legs and arms spread wide) before getting back on the sled.

**Pixel Art Representation:**  
The rider spreads their limbs wide in mid-air, with small sparkling effects around them before returning to the sled.

### 15. 🌍➡️ **Orbit Spin Clockwise** (**Right, Up**)  
Launching into the air, the rider grips the board firmly in front of them, rotating a full 360° to the right (clockwise) while suspended in mid-air like a satellite caught in orbit.

**Pixel Art Representation:**  
The sled and rider spin together in a tight, controlled orbit-like motion, with a circular blur trailing behind.

### 16. 🌍⬅️ **Orbit Spin Counterwise** (**Left, Up**)  
With an explosive lift-off, the rider soars into the sky, clutching their board tightly while spinning a complete 360° to the left (counterclockwise) in a controlled, weightless rotation.

**Pixel Art Representation:**  
Identical to Orbit Spin Clockwise, but mirrored leftward, keeping the same smooth circular motion and blur effect.

*💡 Later Upgrade:* **"Sledboarding"** unlocks snowboard-style **grinds, flips, and advanced tricks**.  

---

## 🔄 **Procedural World & Persistence**
🌎 **The mountain remains consistent during a playthrough.**  
- **New terrain is only generated when starting a new game.**  
- The current **seed is displayed at home**, and players can enter a **custom seed for a specific mountain.**  
- **Changes per run:**
  - Tourists & fans shift positions.  
  - Weather may change dynamically.  
  - Wildlife encounters vary.  

---

## 🔧 **Upgrade System**
### **🧑‍🎿 Personal Upgrades (Character Enhancements)**
| Upgrade | Effect |
|---------|--------|
| 🚀 **Rocket Surgery** | Faster acceleration & top speed. |
| 🎮 **Optimal Optics** | Increases camera POV for better wildlife photos. |
| 🛡️ **Sled Durability** | +1 collision allowed before crash. |
| 🥾 **Fancier Footwear** | Faster hiking speed, better grip. |
| ❄️ **Grappling Anchor** | Hook onto terrain for shortcuts. |
| 💪 **Attend Leg Day** | Reduces stamina cost while climbing. |
| 🏔️ **Shortcut Awareness** | Reveals hidden shortcuts. |
| 📣 **Crowd Hypeman** | More fans = bigger trick bonuses. |
| 🚶‍♂️ **Crowd Weaver** | Non-fan tourists dodge more often. |
| 🌨️ **Weather Warrior** | Reduces negative weather effects. |

---

### **🏔️ Mountain Upgrades (Resort Expansion)**
| Upgrade | Effect |
|---------|--------|
| 🚡 **High-Speed Ski Lifts** | Lets you quickly ride back up. |
| 🏎️ **Snowmobile Rentals** | You can rent snowmobiles for faster ascents. |
| 🍔 **Food Stalls** | Generates money & restores stamina. |
| 🏁 **Groomed Trails** | Grants occasional speed boosts. |
| ⛑️ **First-Aid Stations** | Heal after crashes. |
| 📷 **Scenic Overlooks** | Passive income & potential shortcuts. |
| 📢 **Ramp-Billboards** | Generates ad revenue & doubles as ramps. |
| 🏨 **Resort Lodges** | Adds new starting locations for runs. |
| 🌙 **Night Lighting** | Enables nighttime runs with bonus rewards. |
| ❄️ **Weather Control** | Modify conditions for different challenges. |

---

## ⚖️ **Game Balance & Tweakable Variables**
All of these are stored in the **TWEAK object** for easy adjustments:
- Wildlife spawn times (min/max).
- Wildlife **sit duration** (min/max).
- Moving animal multiplier.
- Camera **POV cone size**.
- **Time trial activator frequency** & bonuses.
- **Stamina drain rates**.
- **Mountain regeneration rules**.
- **Trick scoring multipliers**.
- **Photograph accuracy bonuses**. 


In both the prototype, and the full game, we'll need a goal. For the prototype, it will be repaying the cost of the mountain.

In the full game, it will be in stages (think Tom Nook). The first repayment will be for your house. That will let you start buying "Mountain" upgrades like ski lifts. Once you pay off your house, there will be a MUCH bigger cost to pay off your mountain. Once you pay off your mountain, you can buy a new mountain (with new environments like Lava Mountain, Space Mountain, and Undersea Mountain). You'll start off with zero mountain upgrades, but you'll keep your personal upgrades.

There will be unique upgrades required to access each mountain, and you may only find a few per mountain, so the choice of where to go next might be somewhat limited (but you can always look for more upgrades on other, snowy, mountains, which are also cheaper). Mountains:

Lava Mountain 🌋
A sizzling, active volcanic mountain filled with flowing lava rivers, steaming geysers, and rocky outcrops. Navigate carefully to avoid molten streams and superheated vents spewing smoke and embers, obscuring visibility. Occasionally, lava bombs shoot into the air, crashing down to form temporary obstacles. Some rocks glow red-hot and will severely damage or slow down your sled if touched. Volcanic tremors randomly shake the terrain, altering the slope and creating sudden fissures. The intense heat waves cause visual distortion, adding extra challenge to steering precision and timing.

Heat Meter: Overheat means game over unless you hit cool-off zones.
Ash Clouds: Temporarily block visibility, so you gotta steer careful-like!

Power-Up: Heat Shielding Sled Coating Required upgrade to unlock Lava Mountain. Protects sled from high temperatures and damage from heat-related hazards. On other mountains, it slightly reduces friction, boosting downhill speed.

Space Mountain 🌌
Located on the Moon or Mars, sledding in low gravity means you achieve massive airtime, creating endless opportunities for tricks. Terrain features huge craters, steep cliffs, and rugged extraterrestrial rocks that make landing tricky. Cosmic dust clouds obscure your path, and meteor showers periodically introduce new hazards. Sudden gravity anomalies can briefly increase or decrease gravitational pull, complicating control. Watch out for floating debris from crashed spacecraft, acting as dynamic obstacles. Without atmosphere, sounds are muffled and vision limited—focusing on clear visibility is critical for landing safely.

Low Gravity: Higher jumps, longer airtime, easier flips 'n tricks.
Meteor Showers: Random meteor strikes make obstacles and ramps mid-run.

Power-Up: Gravity Stabilizer Sled Upgrade
Required to unlock Space Mountain. Stabilizes your sled against gravity fluctuations, ensuring smoother jumps and controlled landings. On other levels, it slightly reduces airtime instability, making aerial tricks easier to execute consistently.

Underwater Mountain 🌊
Navigate submerged slopes with slow-motion sledding physics. Your stamina acts as your oxygen meter, adding urgency. Seaweed forests slow down your sled, and coral formations present complex obstacles. Hidden underwater currents shift unpredictably, pushing your sled off-course or assisting your route if timed correctly. Schools of fish swim across your path, potentially blocking or guiding your sled. Occasional bubbles provide small boosts of oxygen/stamina if timed correctly. Deep-sea creatures periodically move across the screen, adding surprise obstacles and dynamic interactions to your descent. Visibility is affected by depth, gradually dimming unless illuminated by bio-luminescent plants.

Air Meter (Stamina): Replenished by air bubbles or surface spots.
Sea Creatures: Sharks n' dolphins can either help push or hinder you—depends on their mood, eh!

Power-up: Aqua-Lung Mittens
Required to enter Underwater Mountain. These magical mittens constantly replenish your stamina (oxygen) at a slow rate underwater. On other mountains, they slightly reduce stamina drain, allowing for longer uphill treks without rest.

Garbage Dump Glacier 🗑️❄️
A frozen landfill offers icy runs littered with piles of refuse. Old refrigerators, discarded furniture, and random heaps of recycling materials form the obstacle course. Oil slicks on the ice speed you up unpredictably, while sticky garbage mounds bog you down. Aggressive seagulls swoop and harass you, periodically pecking at your sled and reducing your control. Occasional avalanches of trash can drastically alter terrain mid-run. Watch out for rogue shopping carts barreling downhill unpredictably and patches of sharp metallic debris that damage sled durability. Some discarded objects offer hidden ramps or shortcuts if approached carefully.

Seagull Attacks: Briefly impair your steering if ya get pecked.
Sticky Garbage Areas: Slow down yer sled unless you’ve got special wax upgrades.

Power-up: Slick Wax Spray
Required to unlock Garbage Dump Glacier. Prevents sticky garbage terrain from slowing you down significantly, and reduces friction slightly on all levels, providing a small but constant speed boost.

Micro Mountain 🐜🌱
Shrunk down to microscopic size, you’ll sled through an enormous backyard landscape. Slide down blades of grass, dodge oversized ants, and navigate pollen clusters and dirt clods. Dew droplets create slippery, ultra-fast ramps, while cobwebs and leaves present sticky traps to avoid. Encounter various garden insects acting as dynamic, moving obstacles or even temporary platforms. Raindrops can create instant slippery spots, boosting or hindering your momentum randomly. Bright sunlight through magnifying glasses creates hot spots that damage your sled if you're exposed too long, while shadows from passing insects cause sudden visibility changes.

Grass Blades and Dew Drops: Bouncy, unpredictable terrain.
Ants & Bugs: Movin’ hazards—some might even carry your sled briefly!

Power-up: Antigrav Wax
Required for Micro Mountain. Dramatically reduces friction, letting you glide smoothly over sticky surfaces like pollen and cobwebs. On other mountains, it slightly improves your sled’s overall glide efficiency, reducing stamina drain from steering.

Candy Cane Canyon 🍭
Sweet, candy-themed slopes with chocolate rivers, caramel waterfalls, gummy bear obstacles, and peppermint jumps. Sticky candy patches slow your descent, while marshmallow cushions offer extra bounce, requiring careful timing. Sugar rush zones temporarily increase your speed, but candy floss clouds slow descent if you collide with them. Periodically, candy meteor showers rain gumdrops onto the slopes, forming temporary obstacles. Sugary quicksand areas trap your sled briefly unless you quickly jump clear. Caramel drizzles form slippery streams, while chocolate areas melt and slow you down if you linger too long.

Sticky Sweets: Slow yer sled and reduce jump height temporarily.
Sugar Rush Zones: Briefly double yer speed but harder to steer—sweet chaos!

Power-up: Sweet-Tooth Coating
Required for Candy Cane Canyon. Prevents your sled from sticking or sinking into candy traps and melted chocolate. Elsewhere, slightly reduces the effect of mud, snow, or other terrain types that would typically slow you down.

Crystal Cave Cavern 🔮
Sled through glittering crystal caverns, navigating tight turns around massive stalactites and delicate crystal formations. Crystals break upon impact, temporarily obscuring visibility with sparkling shards. Echoing acoustics make audio cues exaggerated, adding complexity to navigation. Bioluminescent fungi occasionally illuminate secret passages, guiding you to hidden shortcuts. Deep chasms force you to execute jumps carefully, while icy paths require precise control to avoid sliding off ledges. Bats swarm periodically, creating mobile aerial obstacles. Slippery ice sections inside caves alter your steering responsiveness unpredictably.

Fragile Obstacles: Hittin’ em slows you down but destroys them permanently.
Glowing Crystals: Temporarily illuminate hidden shortcuts or secret ramps.

Power-up: Crystal Clear Goggles
Required for Crystal Cave Cavern. Enhances visibility, reducing the impact of obscuring effects like dust or crystal shards. Provides improved vision through poor visibility conditions across all mountains.

Haunted Graveyard Hill 👻
Navigate spooky slopes littered with gravestones, eerie trees, and wandering ghosts. Phantom obstacles fade in and out unpredictably. Spooky mist slows movement and obscures vision. Sudden ghostly apparitions scare your sled into abrupt speed bursts or momentary freezes. Occasional supernatural gusts alter sled trajectory, either helping or hindering your progress unpredictably. Spectral whispers provide audio clues to hidden shortcuts or upcoming hazards. Watch out for haunted patches of ground that momentarily seize your sled, causing slight directional disruptions.

Ghost Encounters: Randomly appear, block vision, or temporarily invert your controls.
Phantom Fans: Provide boosts if ya take spooky snapshots uphill!

Power-up: Spirit Lantern
Required to access Haunted Graveyard Hill. Illuminates and reveals ghostly obstacles and hidden pathways. Slightly increases visibility and awareness of hidden elements across all maps.

Sky Jellyfish Mountain ☁️🪼
Soar and bounce across ethereal clouds populated by luminous sky jellyfish. Physics become ultra-bouncy, creating unpredictable trajectories. Jellyfish platforms shift and pulse rhythmically, affecting landing precision. Air currents push you unpredictably, aiding or hindering your path. Occasional lightning strikes briefly illuminate the slopes, creating momentary visibility boosts. Clouds dissolve randomly, forcing quick route adjustments. Watch out for lightning jellyfish that electrify your sled temporarily, reducing control.

Bounce Physics: Jump higher and farther, but risk losin’ control on landin'.
Air Gusts: Boost ya sideways unexpectedly, for good or ill.

Power-up: Stabilizer Sled Rails
Required for Sky Jellyfish Mountain. These advanced rails significantly improve landing stability after jumps. Across other mountains, they generally reduce bounce and improve landing precision.

Mechanical Mountain (Steampunk Slopes) ⚙️🎩
Steampunk slopes feature gears, conveyor belts, and mechanical contraptions that constantly shift and rotate terrain. Steam jets sporadically push your sled in unexpected directions. Rotating gears can be ground on for trick points but risk sudden changes in direction. Conveyor belts alter your trajectory and speed dramatically. Piston-driven platforms lift and drop at intervals, providing dynamic jump points. Rusty oil slicks enhance speed but reduce control.

Timed Obstacles: Movin’ platforms appear and vanish rhythmically—precision’s key!
Gear Grinds: Successful grindin' across gears gives huge cash bonuses.

Power-up: Clockwork Treads
Required to unlock Mechanical Mountain. Provide superior traction on moving surfaces like conveyor belts. On other levels, they slightly enhance overall sled handling and turning radius.

Pyramid Peak 🐫🏜️
Ancient Egyptian pyramid slopes covered in sand and ancient ruins. Sandstorms intermittently obscure your view. Falling boulders form temporary obstacles. Hieroglyphic doors randomly open to reveal shortcuts or hidden chambers filled with treasure. Scarab swarms periodically chase you, slightly pushing you off course. Quick-sand traps slow you down significantly unless avoided promptly.

Sandstorms: Slow you down or obscure yer vision.
Hidden Pitfalls: Collapsin’ floors reveal secret ramps or dangerous traps.

Power-up: Sandrunner Skis
Required for Pyramid Peak. Let you glide smoothly over sandy terrain without losing speed. Improve performance slightly on loose or rough terrains in other environments.

Digital Mountain (Cyber Slopes) 💻🔮
Traverse neon-lit digital slopes filled with glitches, data streams, and pop-up malware ads obstructing your vision. Data packets form temporary ramps; corrupted data areas distort controls. Glitch fields teleport or flicker you unpredictably across short distances. Virtual hazards like firewall walls periodically appear, forcing rapid dodging maneuvers. Randomly appearing portals shift your sled between points on the slope unexpectedly.

Glitch Zones: Randomly teleport ya a short distance forward or backward.
Malware Hazards: Briefly invert yer controls if ya collide with ’em.

Power-up: Data Shielding
Required to access Digital Mountain. Protects your sled from malware hazards, significantly reducing random steering disruptions. Slightly improves resistance to environmental status effects across all maps.