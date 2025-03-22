# 📍 **SledHEAD Comprehensive Development Roadmap**

This document outlines the detailed path from the current implementation to the complete "1.0" version of **SledHEAD**, including the critical gameplay shift to an **Up-Then-Down** stamina-based mechanic.

---

## 🎯 **Core Concept**
You are an **aspiring sledding champion** who has purchased an entire **procedurally generated mountain** to train and broadcast your extreme sled runs. To fund your dream, you’ve opened the slopes to the public, attracting:

- **Casual Tourists** – Regular visitors who use the mountain but don’t care about you.  
- **Fans & Followers** – Devoted viewers who cheer, hype you up, and even offer in-game boosts.  

Your goal is to master the mountain, **optimize runs for speed and tricks**, and **grow your fanbase**. The **better your performance, the more money you earn**, allowing you to invest in **personal upgrades, and mountain expansions**.

## 🎯 **Gameplay Loop Overview**
- Players start at the mountain's base, managing stamina as they climb upward.
- Strategic decision-making to sled down for rewards before stamina depletion.
- Higher altitudes host rare wildlife, higher rewards, and greater risks.

---

## 🌄 **Segmented Cylinder Wrapping (Layered Mountain Structure)**  
**Handling Horizontal Wrapping at Different Elevations**

To create the effect of a **finite mountain with wraparound sides**, SledHEAD uses a **layered cylindrical system** instead of a continuous cone. The mountain is divided into **stacked segments**, each with its own **fixed circumference** that gets **smaller as you go higher**. This allows for a **consistent wraparound mechanic** while keeping movement predictable.

### 🏔️ **How It Works:**
- Each **layer** is a separate horizontal zone, like a **floating ring** around the mountain.  
- If a player **crosses the left or right boundary** of a layer, they seamlessly wrap around to the other side.  
- **Lower layers are wider**, giving more horizontal space.  
- **Upper layers are narrower**, meaning wraparound happens sooner.  

### ⬆️⬇️ **Moving Between Layers**
When transitioning **between vertical segments**:
1. If the player **moves downward** past the bottom boundary of a layer:
   - They **teleport to the top boundary** of the layer below.  
   - Their **horizontal position scales** based on the new circumference to maintain a proportional location.  
   
   ```pseudocode
   scale_factor = new_layer.circumference / old_layer.circumference
   x_new = x_old * scale_factor

2. If the player **moves upward** past the top boundary of a layer:
   - They **appear at the bottom** of the next layer up with **their horizontal position **scaled.

### 🏁 **Gameplay Implications**
   - Predictable & Manageable: Keeps wraparound and movement feeling natural while allowing for different gameplay per layer.

### **Layer-Specific Challenges**:
   - Broader paths at lower levels = more open sledding.
   - Tighter paths at higher levels = more technical, precision-based gameplay.
   - Performance-Friendly: Each layer is an isolated map segment, simplifying collision checks and procedural generation.

---

## 🌄 **Light/Dark Gradient Altitude System**

- Introduce a dynamic visual gradient where snow and terrain visually shift, with the snow at higher altitudes lighter due to being cleaner, and the snow downhill from you appears darker (due to the dirt and debres that flows down hill). 🚀
- The gradient will provide a dynamic natural visual guide for players to intuitively gauge altitude and plan their climbs and descents. 🎯

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

## 🎢 Gameplay Loops
**Progression Goals:**  
- **Prototype:** Repay the cost of the mountain.  
- **Full Game:**  
  - Stage 1: Repay your house, unlocking initial "Mountain" upgrades like ski lifts.  
  - Stage 2: After paying off your mountain, a much bigger debt unlocks a new mountain (with fresh environments like Lava Mountain, Space Mountain, and Underwater Mountain).  
  - Note: You'll start off with zero mountain upgrades but keep your personal upgrades.  
  - Unique upgrades are required to access each new mountain, with limited availability—though more snowy peaks are always around to explore!
### **⬆️1️⃣ Uphill Phase: Climbing & Exploration**
#### 🚶 **Top-down adventure traversal with stamina management and exploration.**  
- **Goal:** Ascend to the top **by hiking, using ski lifts, snowmobiles, or taking shortcuts**.  
- **Stamina System:**  
  - Stamina drains when moving.  
  - Replenished by **food stands, resting points, or upgrades**.  
- **Wildlife Photography Mini-Game 📸** *(Active only in Uphill Phase)*  
  - **Random animals appear every few seconds (TWEAK variable).**  
  - Animals either **stay still and will run if you get too close.** Eventually they will **wander off**.  
  - **Use the Left & Right Arrow Keys to aim the camera cone** around your character.  
  - **Align the altitude line (using the Up & Down Arrow Keys)** with the animal’s altitude for a perfect shot.  
  - **Photos earn money, with multipliers for:**  
    - Accuracy (center of POV cone).  
    - Altitude match precision.  
    - Moving vs. stationary targets (moving = 3x value).
    - Animal Rarity (more exotic animals the further up the mountain you are).

### **⬇️2️⃣ Sledding Phase (Downhill)**
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

### 🏠3️⃣ **Management Phase (House & Upgrades)**
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

## 🏡 **Tutorial Level: Childhood Memories on Grandpa’s Hill**  
**Learning the Basics in a Cozy, Story-Driven Introduction**

Before tackling the **massive procedural mountains** of SledHEAD, players start with a heartwarming **tutorial level**, set in a **quiet rural winter landscape**. This **flashback sequence** lets players experience sledding as a **young child**, learning the fundamental mechanics under the guidance of their **grandfather**.

### 📜 **Narrative Setup**
The game opens on a **small, snow-covered hill** just outside a **cozy cabin**, where the protagonist—**a child version of themselves**—is spending time with their **grandfather** on a crisp winter afternoon. Grandpa is **wrapped up in a warm coat, standing at the base of the hill after sledding down himself**, watching proudly as the player **takes their maiden toboggan run, learning to sled**. The sky glows with the **soft oranges and purples of a winter sunset**, setting a nostalgic and peaceful mood.

Before long, Grandpa gives a gentle laugh:  
> **"Ahh, y'know, I used to be the best sledder on this hill... but these ol' legs don’t have the stamina they used to! You go on, get a few more runs in—I’ll watch and cheer ya on from here! And remember - the snow's always whiter above you, and dirtier below!"**  

With that, the tutorial **fully hands control to the player**, reinforcing the **stamina system** and setting up a meaningful reason to **manage energy wisely**.

---

## 🎮 **Tutorial Mechanics Introduced**
The tutorial unfolds organically through **simple, playful challenges**, without heavy UI elements. Players **learn by doing**, with Grandpa offering **gentle, supportive guidance**.

### **⬆️ Walking Uphill (Basic Movement & Stamina)**
- Players move **uphill by walking**, learning that **whiter snow = uphill, darker snow = downhill**.  
- Moving uphill **drains stamina** gradually.  
- Grandpa occasionally calls out:
  > **"You’re strong, kid! But ya gotta pace yourself—harder climbs mean ya gotta rest up after!"**

### **🛷 Sledding Downhill (Turning & Speed Control)**
- Players start **at the top of the small hill** and practice their **first sled run**.  
- **Turning left/right** is introduced, along with simple speed adjustments.  
- Grandpa **cheers when the player makes a smooth turn**:
  > **"Look at that! You’re a natural! Sleddin’s all about balance—lean just right and the hill will do the rest!"**

### **🔄 Climbing & Repeating Runs**
- After a few runs, Grandpa suggests:
  > **"Why don’t ya take a few more runs? See if ya can get all the way to the bottom without wipin’ out!"**  
- The player is **free to keep practicing**, reinforcing that **sledding is about trial and improvement**.  
- The game subtly **introduces self-motivated play**, rewarding experimentation.

### **🏁 Tutorial Completion**
- Once the player **feels confident**, a final sled run **transitions seamlessly into the present day**, cutting to the **modern protagonist** standing atop their massive new mountain.
- **Grandpa’s words echo**, setting the tone for the adventure ahead:
  > **"One day, you’ll take on bigger mountains than this… but no matter how high you go, never forget the joy of the ride."**  
- The camera pulls back, revealing the **full mountain**, and gameplay transitions into the **core SledHEAD experience**.

---

## ✨ **Why This Works**
- **Emotionally Engaging** – Connects the player to their childhood roots and motivation.  
- **Smooth Learning Curve** – Teaches fundamental mechanics **without forced tutorials**.  
- **Worldbuilding & Nostalgia** – Grandpa’s wisdom adds charm and meaning to the stamina system.  
- **Seamless Transition to Main Game** – Keeps momentum going without feeling like a "tutorial level."  

This opening ensures that **players feel connected to their journey**—from childhood sledding to **becoming a sledding legend**. 🎿🔥  

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

### **Hazards & Interactions:**
- **Tourists:** Sometimes they move, sometimes they don’t—dodge carefully!
- **Fans:** If you impress them with tricks, they’ll cheer you on and even give you boosts.
- **Ice Patches:** Reduce control and make turns trickier.
- **Snow Drifts & Ramps:** Use them for sick air and trick opportunities.
- **Time Trial Activators:** If you pass through one, your downhill time is tracked—faster times mean better rewards!

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

---

### 11. **Sap Sugaring** 🍁🔥  
- **Objective:**  
  Tap into nature’s sweetest resource—maple syrup! Harvest sap from trees to create energy-restoring treats and valuable trade goods.  
- **Mechanics:**  
  - Start by tapping maple trees on the starter mountain.  
  - Explore new regions to discover exotic trees like the **Cinderwillow** on Volcano Mountain, producing rare and powerful saps.  
  - Upgrade your tapping tools and storage tanks to increase yield and quality.  
- **Upgrades:**  
  - **Precision Taps:** Extract sap faster with reduced waste.  
  - **Insulated Buckets:** Prevent spoilage and maximize collection.  
  - **Sap Refinery:** Process sap into premium syrup with added benefits.  

---

### 12. **Beekeeping** 🐝🍯  
- **Objective:**  
  Raise and breed bees to produce high-quality honey and wax, each offering unique benefits for sledding, income, and buffs.  
- **Mechanics:**  
  - Manage beehives and optimize honey production.  
  - Crossbreed bees to develop specialized traits.  
  - Explore forests to find and capture new queen bees.  
  - Maintain hive conditions to ensure steady honey and wax yields.  
- **Upgrades:**  
  - **Deluxe Hives:** Improve bee happiness and productivity.  
  - **Queen Breeding Chambers:** Unlock advanced genetic traits for custom honey effects.  
  - **Protective Suits & Smokers:** Handle bees safely and reduce swarm risks.  
- **Special Events:**  
  - **Swarm Rescues:** Save lost colonies for rare genetic lines.  
  - **Beekeeper Pete’s Challenges:** Complete tricky hive management tasks for rewards.  

---

## 🌆 **NPCs & Mountain Ecosystem**
A thriving **mountain resort** needs a mix of **essential services, skilled specialists, and quirky legends**. These NPCs **enhance gameplay, create dynamic events, and unlock hidden mechanics**.

---

### 🏡 **Core Resort & Business Owners (Essential Infrastructure)**
These **support your base mountain**—they run the town, drive your economy, and keep the game loop running.

#### 🏂 **Sled Tech Steve**
- **Purpose:** Repairs damage, sells sled mods.
- **Example Upgrades Unlocked:** **Custom wax, shock absorbers, reinforced sleds.**
- **Best Quote:** *"What’d ya do, run into a bear during a race? I can fix it… for a price."*

#### 🍔 **Food Vendor**
- **Purpose:** Sells food that provides **stamina buffs & temporary performance boosts**.
- **Example Menu:** **Hot cocoa (warmth boost), Protein bars (stamina regen), Energy drinks (speed burst).**
- **Best Quote:** *"You can't land tricks on an empty stomach!"*

#### 🎈 **Lift Operator Jay** *(kite enthusiast)*
- **Purpose:** Manages lifts, introduces **kite mechanics** for gliding shortcuts.
- **Example Unlocks:** **Kite rentals, lift season passes, wind path hints.**
- **Best Quote:** *"Ever thought about catching air... without your sled?"*

#### 🏨 **The Hotel Hostess**
- **Purpose:** Offers accommodations & **passive income based on popularity**.
- **Example Unlocks:** **Penthouse suites, reputation perks, tourism boosts.**
- **Best Quote:** *"The more people love this place, the more we all win."*

#### 🏪 **Convenience Store Owner Tilly**
- **Purpose:** Sells consumables, **prospecting gear**, and utility tools.
- **Example Stock:** **Batteries, flares, bait, shovels.**
- **Best Quote:** *"You never know when you’ll need an extra pack of hand warmers."*

#### 🏔️ **Resort Manager Montana Snow**
- **Purpose:** Oversees **mountain upgrades & expansion.**
- **Example Unlocks:** **New trails, safety patrols, winter festivals.**
- **Best Quote:** *"A bigger, better mountain keeps ‘em coming back!"*

---

### 🏆 **Trick & Racing-Oriented NPCs**
These **drive skill progression**—unlocking **better tricks, harder competitions, and high-stakes challenges**.

#### 📸 **Hype Photographer Darlene**
- **Purpose:** **Photo verification & bonus earnings** for sick tricks.
- **Example Unlocks:** **Sponsor deals, cinematic trick replays.**
- **Best Quote:** *"If it ain't on camera, did it even happen?"*

#### 🏅 **Stunt Organizer Whistler**
- **Purpose:** Hosts **extreme challenge events**—big air, freestyle sessions.
- **Example Unlocks:** **Timed trick courses, skydiving sled events.**
- **Best Quote:** *"I wanna see something so crazy I forget my own name!"*

#### 🏁 **Race Commissioner Cannon**
- **Purpose:** Runs **competitions & time trials**.
- **Example Unlocks:** **Speed sleds, racing circuits, timed event boards.**
- **Best Quote:** *"Fastest run gets the trophy—simple as that."*

#### 🏂 **Retired Pro Burton**
- **Purpose:** **Teaches advanced tricks & unlocks sledboarding**.
- **Example Unlocks:** **Sled-to-board transitions, trick combos.**
- **Best Quote:** *"Back in my day, we landed tricks with style. I can show ya how."*

---

### 🏔️ **World-Building & Exploration NPCs**
These **add depth, side quests, and hidden mechanics** to the world.

#### 🐾 **Wildlife Researcher**
- **Purpose:** Tracks **rare animal spawns, photographic missions, fishing spots.**
- **Example Unlocks:** **Bear sightings, falcon partner, eco-tourism quests.**
- **Best Quote:** *"You ever seen a snow leopard up close? Neither have I… yet."*

#### 🚑 **Sled Patrol Captain**
- **Purpose:** Leads **rescue missions & avalanche drills.**
- **Example Unlocks:** **Emergency sled deployment, survival training.**
- **Best Quote:** *"We save people, we don’t just watch ‘em wipe out."*

---

### 🎭 **Traveling & Recurring NPCs**
They **come and go**, bringing **special challenges, rare gear, and unpredictable encounters**.

#### 🔥 **Rival**
- **Purpose:** **Dynamic trick/time trial duels.**
- **Example Unlocks:** **Personalized callouts, grudge matches, rare sled decals.**
- **Best Quote:** *"You think you’re better than me? Prove it."*

#### 🎩 **Mysterious Merchant**
- **Purpose:** **Sells rare & high-risk tech**—limited stock, always random.
- **Example Stock:** **Prototype sled engines, cloaking wax, ghost sled.**
- **Best Quote:** *"I sell only to those who dare."*

#### 🔧 **Tinkerer**
- **Purpose:** **Experimental tech**—RC sleds, lock-picking, custom builds.
- **Example Unlocks:** **Remote sleds, grappling hooks, hacking upgrades.**
- **Best Quote:** *"You didn’t hear this from me, but I might’ve… *enhanced* a sled or two."*

---

### ❄️ **Legendary NPCs**
These are **mythic figures**, unlocking **wild game mechanics, hidden areas, and secret challenges**.

#### 🌨️ **Winter Shaman Bromley**
- **Purpose:** **Controls weather effects**—snowstorms, icy terrain, wind boosts.
- **Example Unlocks:** **Weather manipulation quests, legendary snowboards.**
- **Best Quote:** *"The mountain speaks… and I listen."*

#### 🐻 **Bear Whisperer Carrie**
- **Purpose:** Unlocks **bear-racing.**
- **Example Unlocks:** **Bear races, such as Time Trials and Elimination.**
- **Best Quote:** *"Bears don’t bite... if you know how to ask nicely."*

#### 🐝 **Beekeeper Pete**
- **Purpose:** Sells **beekeeping upgrades**.
- **Example Unlocks:** **Speed honey, frost-resistant sled wax.**
- **Best Quote:** *"Snow bees? Oh yeah, they’re real… and fast."*

#### ⏳ **The Time Traveler**
- **Purpose:** Unlocks **cryptid fossil digging & timeline anomalies.**
- **Example Unlocks:** **Ancient sleds, legendary trails, prehistoric snowboard challenges.**
- **Best Quote:** *"The past isn’t gone—it’s just buried under the snow."*

---

## 🎮 Enhanced Controls & UI Improvements
- Fully customizable control remapping
- Comprehensive tutorial and onboarding systems
- Improved HUD clarity (stamina, trick scoring, wildlife photography)

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

🔄 Infinite Upgrades with Soft Caps
===================================

**Expanding Progression Without Breaking Balance**

Currently, upgrades in **SledHEAD** have **hard caps**, limiting how many times they can be purchased. While this provides structure, it **restricts long-term progression** and prevents **emergent playstyles** from evolving over multiple runs. To keep **each run fresh and engaging**, we're shifting to an **infinite upgrade system** with **diminishing returns** beyond a **soft cap** for
**Personal Upgrades**. **Mountain Upgrades** will
need to be rebought for each new mountain purchased, and
may or may not be infinite as appropriate to the upgrade.

🎯 Proposed Solution
--------------------

-   **All upgrades become infinitely upgradable.**
-   Each upgrade **retains its effectiveness early on** but **scales down gradually** beyond a set level.
-   **Soft caps vary** depending on the upgrade type:
    -   **Speed upgrades** could start diminishing at **Level 10**.
    -   **Trick bonuses** could scale freely until **Level 20** before slowing down.
-   **Mathematical balancing** ensures that upgrades remain **meaningful** but **don't become overpowered**.

📊 Scaling Formula: Exponential & Logarithmic Decay
---------------------------------------------------

Instead of **linear scaling** (e.g., "+1 Speed per level"), we use **diminishing returns** to keep upgrades valuable without breaking balance.

### ✏ Formula Example:

newValue = baseValue + (scalingFactor * sqrt(level))

-   **Early levels feel impactful**, allowing noticeable improvements.
-   **Later levels slow down naturally**, preventing infinite stacking from making players overpowered.
-   Works across **various upgrade types**, from **speed boosts to trick multipliers**.

🔎 **Alternative Approach: Logarithmic Scaling**\
For upgrades that should scale *aggressively early on* but taper off smoothly:

newValue = baseValue * (1 + (scalingFactor * log(level + 1)))

-   Great for upgrades like **boost charge rates or sled handling**, where a **big early impact** makes sense but **total mastery should be gradual**.

✅ Benefits of Infinite Upgrades with Soft Caps
----------------------------------------------

✔ **Keeps long-term progression engaging** -- No artificial "max level" bottleneck.\
✔ **Encourages specialized strategies** -- Players can **focus on speed, tricks, or economy-based builds**.\
✔ **Prevents upgrade obsolescence** -- Players **always have something meaningful to invest in**.\
✔ **Maintains challenge balance** -- Runs become **progressively stronger**, but not infinitely easy.

📌 Tasks & Implementation Plan
------------------------------

-   [ ]  **Remove hard upgrade caps** for all current upgrades.
-   [ ]  **Implement soft cap mechanics** using **square root or logarithmic scaling**.
-   [ ]  **Fine-tune soft cap levels** for different upgrade categories (e.g., Speed vs. Trick Boosts).
-   [ ]  **Balance test progression** to ensure **long-term upgrades stay meaningful but not overpowered**.

This system ensures **players always have room to grow**, while keeping **SledHEAD's challenge intact**. 🚀🔥

---

## 🏆 Endgame & Prestige Content
- Prestige system for continued replayability
- Elite sled runs with intensified challenges
- Legendary animal photo hunts for ultimate rewards

---

## 📅 Development Milestones & Timeline
### Short-Term:
- Implement stamina system, basic uphill-downhill gameplay
- Expand wildlife photography with rare animals at altitude
- Basic personal and mountain upgrades functionality

### Mid-Term:
- Integrate the light/dark gradient altitude system to enhance visual depth and player navigation
- Introduce NPCs and interactive infrastructure
- Initial mini-games integration

### Long-Term:
- Add mountain biomes and unique thematic mechanics
- Fully expand trick system
- Complete mini-games and endgame challenges
- Polish UI/UX and refine progression systems

---

This comprehensive roadmap encapsulates all planned features and mechanics, clearly outlines the development trajectory, and integrates your newly defined gameplay mechanic. Use this as your foundational documentation moving forward to guide development clearly and effectively.
