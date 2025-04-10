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

### 2. **Fishing** 📸🐟  
- **Objective:**  
  Photograph fish underwater by deploying a specialized camera rig on a pole.

- **Mechanics:**  
  - The player becomes stationary, anchoring themselves in place.  
  - The **camera rig** is lowered into the water via rod and line.  
  - Use the **arrow keys** to rotate and aim the camera underwater, with standard wildlife photography left-right cone and altitude bar.
  - Fish only appear when the camera is fully submerged, and each species has unique behaviors and movement patterns.  
  - Stealth and timing are key—photographing rare or fast-moving fish requires precision and patience.

- **Upgrades:**  
  - **Camera Clarity:** Improves visibility and resolution underwater.  

- **Special Event:**  
  - **Eco Survey Missions:** Collaborate with in-game researchers to catalog species for rewards. See Wildlife Researcher for more details.

---

### 3. **Lockpicking in Abandoned Buildings** 🔐🏚️  
- **Objective:**  
  When you bought the mountain, a number of abandoned buildings were on the property. They're locked up, but they're yours now. Unlock doors, safes, and gain access to mid-mountain buildings.
- **Mechanics:**  
  - Use tools like **rakes, hooks, and tension wrenches**.  
- **Upgrades:**  
  - High-quality picks, electronic bypass tools, and vibration sensors.

---

### 4. 🧠 **Deep Diggin’**

SledHEAD has a wealth of history, much of which is buried under the snow and ice. Use your new Panttock (a combination of the earth moving, rock picking mattock and a river-sloshing gold pan) to unearth buried treasure, prospect for raw unrefined wealth, and calcified history in the form of cryptid fossils.

#### 🪙 Shovelin' **Dig Spots** (Soft Earth)

- Hidden beneath snow or in barely-noticeable terrain features.
- Yield: **Treasure** and **Fossils**
- Locations: Anything diggable (Snow, dirt, etc).
- **Risk:** None—just the chance of digging up nothing or low-value junk if you pick poorly.
- **Upgrades:**
  - Increased visibility
  - More efficient tool = less stamina/time spent

---

#### ⛏️ Pickin' **Pick Spots** (Ice & Rock)

- Found as subtle glints, cracks, or faint sparkles on rock surfaces.
- Yield: **Gems**, **Minerals**, and **Fossils**
- Locations: Anything pickable (Ice, rock, etc).
- **Risk:** Nada! No cave-ins or hand-smashin’ here—just the classic “oops, wrong vein” situation.
- **Upgrades:**
  - Increased visibility
  - More efficient tool = less stamina/time spent

---

#### 🌊 **Panning in Rivers**

- Can be done in *any* flowing water on the mountain.
- Yield: **All four types**, in **tiny bits**
- Locations: Anything pannable (Rivers, Streams, etc.)
- **Risk:** None at all—just slow returns if you’re in a low-yield stream or not upgraded.
- **Upgrades:**
  - More efficient tool = less stamina/time spent

---

#### 🔍 **Legendary Lenses**

Only one lens may be worn at a time, and they must be swapped out at base. Lenses are upgraded separately. If a lens radius is large enough to "see" something that's off screen, a visual indicator in the direction of what is seen is shown until it is on screen.

| Lens                            | Benefit                                           | Upgrade Effects                                                                      |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 🏴‍☠️ Pirate "Lens" (Eye Patch) | Reveals Treasure by improving visibility          | Larger Radius                                                                        |
| 🧬 Amber Lens                   | Reveals Fossils by improving visibility           | Larger Radius                                                                        |
| 💎 Diamond Lens                 | Reveals Gems and Minerals by improving visibility | Larger Radius                                                                        |
| 🌊 Rippleglass Lens             | Better chances while Panning                      | Continually improving chances while panning                                          |
| 🧠 Rainbow Lens                 | Combo vision (all types, short range)             | Larger Radius                                                                        |
| 🐝 Wax Lens                     | Better bee visibility for finding wild hives      | Further improved visibility and radius                                               |
| 🐟 Fisheye Lens                 | Better chances while Fishing                      | Made from the lens of a Greenland Shark; Continually improving chances while fishing |
| 🔥 Infrared Lens                | Reveals recent wildlife trails                    | Highlights fading heat signatures and animal paths for better tracking and photos    |
| 📹 FPV Lens                     | Enhances control of RC MotorSled                  | Increases control range, speed, and precision with each upgrade                      |

---

#### ❄️ **Exploration Loop**

- Wander the mountain.
- Spot a glimmer, divot, or strange shape.
- Scan with a lens if you got one.
- Choose to dig, pick, or pan.
- No time pressure, no hazards, just discovery and satisfaction.
- Upgrade your gear, refine your eye, and fill your collection log.

---

#### 👧 **Tilly – The Convenience Store Owner**

Tilly runs the cozy little convenience store nestled near the trailhead and base camp. She grew up on this mountain—sledding it, hiking it, panning its rivers, and listening to every wild tale folks whispered around campfires. Prospecting tools, backpacks, river pans, rods, bait, and quirky old maps? She’s got ‘em. But more importantly, by the door sits an eye-catching **rack of Legendary Lenses**, there to tempt curious adventurers to part with their own treasure.

**Role:** Starting point and upgrade hub for all things Treasure, Prospecting, Panning, and Fossil gear. She sells you your Panttock, as well as upgrades it.

**Vibe:** Understated expert with sharp instincts and a dry wit. She knows this mountain like her own reflection, but she won’t spoon-feed you the secrets. That’s the fun part.

> *“If it looks like junk, dig anyway. This mountain hides her best stuff under the worst rocks.”*
>
> *“The river don’t care what you’re hopin’ to find—but it’ll show you what you need.”*
>
> *“Folks come lookin’ for gold. They leave with stories. Guess which one I trade in?”*
>
> *“I don’t sell luck. But I do sell the things luck likes to hang around.”*
>
> *“You learn the mountain by listenin’. And diggin’. And then listenin’ again when it buries your gear.”*

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

### 6. **Sled Tricking** 🛷✨  
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

### 7. **Time Trial Racing** 🏁🛷  
- **Objective:**  
  Trigger time trial races by hitting gates while sledding for money rewards.
- **Mechanics:**  
  - Crossing a time trial gate starts a timer.  
  - The faster and further you go, the more money you earn.
- **Why It Fits:**  
  - Seamlessly integrates as a high-speed challenge within the sledding phase.

---

### 8. **RC Motor Sled** ❄️🏎️  
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

### 9. **Sap Sugaring** 🍁🔥  
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

### 🐝 **Beekeeping**

The mountain is alive with more than just snow and treasure—hidden in trees, under ledges, and tucked along sun-warmed ridgelines are **wild mountain hives**, buzzing with activity and potential. As a beekeeper, you’ll locate these elusive hives, carefully collect precious **wax, honey, and royal jelly**, and even guide new hives to safer, more productive spots.

#### 🐾 **Finding Hives**

- Hives are **hidden in natural terrain** like trees and rock hollows.
- Appear faintly or not at all without proper tools or lens support.
- Use the **🐝 Wax Lens** to have greater visibility for bee lining.

#### 🧭 **Bee Lining: Tracking the Wild Hive**

- Start by spotting foraging bees at flower patches or bait stations (a mix of honey and sugar water).
- Trap a few in a **bee box**—a small wooden box with a viewing window.
- Let them feed, then release them one at a time and **track their flight path**.
- Repeat from several spots to triangulate the location of a wild hive—usually tucked inside a hollow tree.

#### 👑 Getting the Queen:

Attempt a **cutout**:

- Calm bees with smokers before approaching.
- Use an **axe** to carefully open the hive location.
- Watch bee behavior to locate the queen—she’s usually surrounded by a tight cluster.
- Gently capture her using a **queen clip or cage**.
- Transfer her with several combs and workers into a new hive box, starting a new domestic hive back at base.
- Use a **collection kit** to extract wax, honey, or queen pheromones.

#### 🎒 **Harvest Rewards**

- **Honey:** Used for energy restoration and temporary power-ups.
- **Wax:** Used to make your sled go faster.
- **Royal Jelly:** Rare drop—quite valuable!

#### 🔧 **Upgrades**

Most gear is available through **Pete the Beekeeper**, the mountain's laid-back buzz-buddy who talks to bees more than people and swears by the calming power of fresh pine smoke:

- **Smokers –** calms bees before harvest or queen capture
- **Hive Boxes –** used for relocating and domesticating wild colonies
- **Axes –** for felling trees and carefully cutting into hive trees during a cutout
- **Bee Boxes –** for trapping and tracking forager bees during bee lining
- **Bee Breeding –** breed your bees to get other, exotic species of bee that produces even more incredible honey (think Frost Bees and Fire Bees for example)

#### 📍 **Exploration Loop**

- Wander the wilds.
- Watch for visual or audio signs of bee activity.
- Equip the Wax Lens to make it easier to see migrating bees.
- Carefully harvest  hives.
- Return materials to base or use them in crafting.

---

#### 🧑‍🌾 **Pete the Beekeeper**

Known to locals as **"Encyclopedia Pete"**, this seasoned mountain man has spent a lifetime logging, beekeeping, and learnin’ every sound this mountain makes. Pete lives at the bottom of the mountain in a cabin that hums—literally—with hive boxes built into the siding and axes lined up just as neatly. His days are split between tending wild hives and felling trees, and he’ll gladly sell you the tools to do both—**axes, wax kits, and bee gear included**. Pete teaches new beekeepers how to spot wild hives, so they can follow the path of the apiarist.

**Role:** Source of gear, upgrades, and wisdom for the **Wild Hive Beekeeping** minigame and tree felling. Offers beekeeping tools like smokers and hives, and axes.

**Vibe:** Old Vermont soul with a dry wit and deep roots. Talks slow, moves slower, but knows more about the mountain than anyone else alive. Always smells faintly of oak, smoke, and honey.

> *“Bees don’t bother nobody who minds their manners. Same goes for trees, mostly.”*
>
> *“You wanna learn somethin' out here, keep yer mouth shut and yer eyes open.”*
>
> *“It doesn't take me 8 hours to do a full day of work."*
>
> *“Trees'll tell ya when they’re ready. Bees too. Just gotta be listenin’.”*
>
> *“Go on - give it a try if ya wanna. How long could it take?”*

---

## 🌲🪓 Wood Chopping  
> *“Bees don’t bother nobody who minds their manners. Same goes for trees, mostly.”* – Pete the Beekeeper

---

### 🎯 **Objective**
Fell trees during the **Uphill Phase** to create **temporary downhill shortcuts** and gather **wood for crafting**.  
But watch it, bud—trees don’t grow back on command. **Chop too many**, and you’ll change the mountain in ways ya might regret. 🌲💔

---

### ⚙️ **Mechanics**

#### 🌳 **Interactable Trees**  
Trees can be chopped, felling them and clearing the way.

#### ⏱️ **Mini-Game**  
Chopping triggers a **timed input challenge**, like **Kite Flying** 🎯.

#### 🪓 **Tools Needed**  
You’ll need an **Axe**, buyable from **Tilly** or **Pete**, and **upgradable** for speed, reach, or yield.

#### 💪 **Stamina Cost**  
Every chop uses **stamina**, so you’ll need to **weigh your options** carefully on the climb.

---

### 🎁 **Results & Benefits**

#### 🛷 **Trailblazing**
- Chopped trees **open up smoother sled routes**, create drop-ins, or reveal hidden ramps.  
- Trails last until regrowth—could be **days, hours, or a surprise snowstorm** 🌨️.

#### 🪵 **Resource Gathering**
- Felled trees drop **wood**, used for **crafting furniture, upgrades, signs**, or even **building cozy structures at home**.  
- Higher-tier trees may offer **unique lumber** for rare blueprints.

---

### 🌱 **Natural Regrowth System**

- Trees regrow **naturally and randomly** over time based on **elevation, weather**, and how many are still standing nearby.
- A **dynamic forest balance system** tracks how “healthy” a region is:

  - ✅ Clear a small patch = regrowth likely  
  - ❌ Chop everything = growth slows or stops entirely (and the birds stop singin’ too 🐦💔)

---

### 🌿 **Saplings and Growth Stages**

- Chopped areas might sprout **baby trees** that can’t be chopped (yet).  
- **Mature trees** offer full benefits—but ya gotta wait, or help ‘em along with upgrades. 🌱➡️🌲

---

### 🔧 **Upgrades & Systems**

| 🔨 **Upgrade**         | 🎯 **Effect**                                                                 |
|------------------------|------------------------------------------------------------------------------|
| 🪓 Sharpened Axe       | Faster chops, lower stamina use.                                             |
| 🌿 Reforester's Charm  | Slightly increases tree regrowth speed in surrounding areas.                 |

---

### ⚠️ **Risks & Strategy**

- Chop too many trees and you'll risk **barren slopes**—no shortcuts, no wood, no wildlife. 🚫🌲  
- Animals **avoid over-cleared areas**, affecting your **photo score** 📸🐾  
- Trees may **grow into trails** if neglected, **blocking shortcuts**. 😬

---

### 🧑‍🌲 **Pete the Beekeeper (and Woodsman)**  
Pete ain’t just the guy buzzin’ about bees—he’s been **felling timber** since before you were knee-high in powder. ❄️🪓  
Around these parts, folks say **Pete knows every tree by name**, and every stump by its story. It's why they call him **Encyclopedia Pete**.

He lives at the **edge of the tree line** in a cabin stacked with **firewood, handmade tools**, and **axes sharp enough to split a sneeze**.  
While he’s the one who’ll sell you your **first axe** and teach you how to swing it true, he’s also the first to **warn you not to take more than the mountain gives**.

---

### 🏔️ **Role**
- Supplies **axes and woodcutting upgrades**  
- Teaches **sustainable harvesting** 🌳  
- Serves as the **in-game conscience** when it comes to **deforestation**  
- If you’re overharvesting, expect a **quiet visit and a firm word**

---

### 💬 **Vibe**
Stoic, rooted, and wise in that way only folks who **listen to trees** can be.  
He doesn’t say much, but when he does, it sticks.  
Smells faintly of **oak, smoke, and pine sap**. 🪵🌫️🌲

---

> *“You don’t chop a tree to make your path easier. You chop it to make it better.”*  
> *“Any fool can swing an axe. A logger knows when not to.”*  
> *“You think the mountain don’t notice when you clearcut a hillside? Wait till the wind shifts. Don't get into a puppy-snatch.”*  
> *“Every trail you make is a promise. Don’t break it just to shave a second.”*  
> *“Cut with care. Leave roots when you can. And if a tree’s leanin’ toward you, maybe she’s askin’ for a hug, not an axe.”*

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
- **Example Stock:** **Prospecting tools, backpacks, river pans, rods, bait, and quirky old maps**
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
