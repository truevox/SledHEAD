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
   ```

2. If the player **moves upward** past the top boundary of a layer:
   - They **appear at the bottom** of the next layer up with **their horizontal position scaled**.

### 🏁 Gameplay Implications
- Predictable & Manageable: Keeps wraparound and movement feeling natural while allowing for different gameplay per layer.

### Layer-Specific Challenges
- Broader paths at lower levels = more open sledding.
- Tighter paths at higher levels = more technical, precision-based gameplay.
- Performance-Friendly: Each layer is an isolated map segment, simplifying collision checks and procedural generation.

---

## 🌄 Light/Dark Gradient Altitude System

- Introduce a dynamic visual gradient where snow and terrain visually shift, with the snow at higher altitudes lighter due to being cleaner, and the snow downhill from you appears darker (due to the dirt and debris that flows downhill). 🚀
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
### ⬆️1️⃣ Uphill Phase: Climbing & Exploration
**🚶 Top-down adventure traversal with stamina management and exploration.**

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

### ⬇️2️⃣ Sledding Phase (Downhill)
**💨 Fast-paced, high-speed, gravity-driven sledding with a trick system.**

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

### 🏠3️⃣ Management Phase (House & Upgrades)
**🏡 Upgrade your gear, mountain, and social media presence.**

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

## 🎮 Tutorial Mechanics Introduced
The tutorial unfolds organically through **simple, playful challenges**, without heavy UI elements. Players **learn by doing**, with Grandpa offering **gentle, supportive guidance**.

### ⬆️ Walking Uphill (Basic Movement & Stamina)
- Players move **uphill by walking**, learning that **whiter snow = uphill, darker snow = downhill**.
- Moving uphill **drains stamina** gradually.
- Grandpa occasionally calls out:
  > **"You're strong, kid! But ya gotta pace yourself—harder climbs mean ya gotta rest up after!"**

### 🛷 Sledding Downhill (Turning & Speed Control)
- Players start **at the top of the small hill** and practice their **first sled run**.
- **Turning left/right** is introduced, along with simple speed adjustments.
- Grandpa **cheers when the player makes a smooth turn**:
  > **"Look at that! You're a natural! Sleddin's all about balance—lean just right and the hill will do the rest!"**

### 🔄 Climbing & Repeating Runs
- After a few runs, Grandpa suggests:
  > **"Why don't ya take a few more runs? See if ya can get all the way to the bottom without wipin' out!"**
- The player is **free to keep practicing**, reinforcing that **sledding is about trial and improvement**.
- The game subtly **introduces self-motivated play**, rewarding experimentation.

### 🏁 Tutorial Completion
- Once the player **feels confident**, a final sled run **transitions seamlessly into the present day**, cutting to the **modern protagonist** standing atop their massive new mountain.
- **Grandpa's words echo**, setting the tone for the adventure ahead:
  > **"One day, you'll take on bigger mountains than this… but no matter how high you go, never forget the joy of the ride."**
- The camera pulls back, revealing the **full mountain**, and gameplay transitions into the **core SledHEAD experience**.

---

## ✨ Why This Works
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

### Hazards & Interactions
- **Tourists:** Sometimes they move, sometimes they don't—dodge carefully!
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

## ⚖️ Weight is Strategy: You Climb What You Carry
> “Every bolt, every crate, every choice—the mountain feels it, and so will your legs.”

---

### 🎯 Objective  
Your sled isn’t just a ride down—it’s your **command center** on the climb up. Build light to move fast, or go heavy to haul it all—but remember: **weight is your stamina tax**, and every bolt you bring will cost you on the climb.

Use the **modular sled system** to construct anything from a stripped-down **Jack Jumper** for quick ascents, to a massive **Gravity-Sledge** ready to haul enough maple, honey, gems, ores, and various other treasures to stock a trading post. Wanna haul around the bones of **Champs ancestors** - you need a **Sledge**!

---

### 🛠️ Mechanics  

#### 🔩 Modular Components
- **Swappable Parts:** Core body, rails, skids, front, rear, and side attachables.
- **Minigame Loadouts:** Add-ons for *digging*, *panning*, *beekeeping*, *sap collection*, and more.
- **Inventory Scaling:** Bigger sleds = more storage = longer runs without heading home.
- **Weight Scaling:** But heavier sleds = faster stamina burn on climbs.

#### 🛷 Sled Size Tiers  
- 🐇 **Jack Jumper:** Light, fast, perfect for quick climbs and short missions.  
- 🛷 **Toboggan:** Traditional and reliable—adds more haul space with minimal drag.  
- 🛷 **Bobsled:** Balanced stamina and capacity—a mid-game staple.  
- 🛻 **Gravity-Sledge:** Big boy. Built for long hauls, big rewards, and slow climbs.  
- ⚡ **Powered Sledge:** Endgame gear. Built-in motor is powerful, but runs on fire-seeds from Vertigo Vents.

Modular parts adapt to different terrain types and playstyles. Each mountain introduces new **tiered gear**, encouraging players to craft the perfect sled for the challenge ahead.

Tiers are defined by mountain difficulty:
- **Early Game**: Tutorial + base snow mountain
- **Example Mid Game**: Candy Cane Canyon, Garbage Dump Glacier, Crystal Caves
- **Example Late Game**: Fire Mountain, Space Mountain, Steampunk Slopes 

---

##### 🌲 Early Game Example Tier (for illustration only, actual upgrades may change)

###### 🛷 Runners / Skis / Rails
- **Birchwood Skids** – Lightweight, great air, poor traction  
- **Steel Runners** – Balanced grip and durability  
- **Waxed Maple Rails** – Boosts speed on groomed trails

###### 🧱 Body
- **Pineframe Hull** – Standard durability, light carry  
- **Hollowcore Deck** – Reduces weight but fragile on impact  
- **Woven Bark Shell** – Slightly reduces stamina cost on climb

###### 🧳 Front Attachments
- **Mini Dig Kit** – Small shovel + brush set for shallow treasure zones  
- **Photo Crate** – Basic wildlife camera & lens mount  
- **Bee Box Jr.** – Compact hive box, good for early-game beekeeping

###### 🧳 Rear Attachments
- **Trail Crate** – Holds 1 extra item  
- **Thermos Drum** – Provides minor stamina use reduction
- **Sap Bag** – Holds early-game syrup collection

###### 🧳 Side Attachments
- **Supply Satchels** – +1 item slot each  
- **Basic Shock Pads** – Slightly improves trick landing control  
- **Wax Holsters** – Hold multiple wax types for terrain swapping

---

##### ❄️ Mid Game Example Tier (for illustration only, actual upgrades may change)

###### 🛷 Runners / Skis / Rails
- **Frostbite Rails** – Extra grip on ice, trick control reduced  
- **Sugarwax Skids** – Boost jump height on soft terrain  
- **Crystal Edges** – Precision sledding, fragile on landing

###### 🧱 Body
- **Plastic Composite Shell** – Corrosion-resistant and smooth on garbage  
- **Candycar Frame** – Slippery but fast, themed for sweet terrain  
- **Dumpster Diver Deck** – Heavy but has bonus junk pickup radius

###### 🧳 Front Attachments
- **Deluxe Dig Kit** – Panning & pick support included  
- **Crane Camera Rig** – Boosts wildlife photo value and rare animal spawn  
- **Weather Vane Mount** – Improves weather prediction and storm nav

###### 🧳 Rear Attachments
- **Coolant Tank** – Slows stamina drain in hot zones  
- **Mystery Box Rack** – Adds chance to collect bonus junk while sledding  
- **Glacier Barrel** – Improves fish/ice storage during cold runs

###### 🧳 Side Attachments
- **Gear Caddies** – Organize and swap minigame kits mid-run  
- **Stabilizer Runners** – Enhance cornering at high speeds  
- **Candy Lights** – Boost fan appeal on style zones (bonus cash)

---

##### 🔥 Late Game Example Tier (for illustration only, actual upgrades may change)

###### 🛷 Runners / Skis / Rails
- **Molten Rails** – Immune to lava, boosts downhill acceleration  
- **Lunar Skids** – Floaty with huge airtime, bad handling on Earth  
- **Cogwheel Runners** – Self-adjusting mechanical rails that grip terrain dynamically; can misfire on high-speed landings

###### 🧱 Body
- **Volcanic Alloy Core** – Insane durability, massive weight  
- **Zero-G Frame** – No weight cost, but no storage or defense  
- **Boilplate Chassis** – Brass-plated hull with integrated gearboxes; auto-manages loadout but prone to overclock jamming

###### 🧳 Front Attachments
- **Plasma Dig Spade** – Cuts through crystal & magma zones  
- **Drone Rig Mount** – Deploys recon sled drone for photo or scouting  
- **Steam-Powered Survey Arm** – Deploys retractable claw + lens rig for scanning treasures mid-sled

###### 🧳 Rear Attachments
- **Jet Fan Housing** – Trick lift boost, doubles as mid-air air brake  
- **Royal Sap Tank** – Stores rare sap from exotic trees  
- **Chrono Trunk** – Stores more gear and occasionally “rewinds” to earlier contents (unpredictable!)

###### 🧳 Side Attachments
- **Energy Amplifiers** – Boost trick multiplier thresholds  
- **Magnetic Catchers** – Auto-grab dropped treasure or gear  
- **Pressure Valves** – Regulate sled systems, reducing trick cooldown and smoothing performance—can hiss when overloaded


---

> *"One sled won’t climb every mountain, but every mountain leaves behind the parts you’ll need."*  
> – Sled Tech Steve, welding a USB C port to a... sledrunner?!

---

### 💡 Strategy & Loop  
- **Climb Strategy:** Plan your route, weigh the reward. Can you reach the high-level cryptid fossil site with a full panning kit and digging gear? Maybe—but it’ll take stamina.  
- **Run Planning:** Load light for trick runs or fast climbs. Load heavy for treasure, panning, or multi-minigame combos.  
- **Upgrade Path:** Invest in *stamina buffs*, *better wax*, and *sled mods* to offset weight and keep pushing higher.

> *“Think of stamina like cash, and weight like taxes. Spend wisely, friend.”*  
> – **Sled Tech Steve**, sketching blueprints on a greasy napkin while sipping espresso from a spark plug

---

### 🔧 Upgrades & Support  
**Sled Tech Steve** is your **go-to grease guru**, the man who knows every part, every bolt pattern, and exactly why that sled feels like it's hummin' wrong today.              |

> *“You’re not just building a sled. You’re buildin’ the **reason** you get to the summit today.”*  
> – Steve, handing you a bolt and a burrito and suggesting you to eat both

---

### ⚠️ Risks & Strategy  
- **Dead Battery:** Go too heavy without the stamina to back it, and you’ll be so tuckered out Sled Patrol will have to rescue you when your stamina is drained.

---

### 🎤 Sled Tech Steve – The Mechanic Who Makes It Work  
He’s the guy who fixes what you break, builds what you dream, and mutters prophetic wisdom while tightening bolts.

#### 🛠️ Role  
- Crafts, repairs, and upgrades every sled component.  
- Offers expert advice on build balance, gear synergy, and hauling smart.  

#### 💬 Vibe  
Part sage, part mad engineer, part crusty uncle who lives in a garage with three working engines and one broken toaster sled.  
**Smells like axle grease and triumph.**

> *“Don’t ride a sled you don’t love. Don’t climb a hill you ain’t ready for. Don’t bolt on a turbo tank unless you know how to land it.”*  
> *“Every run’s a test. Every build’s a blueprint of your brain.”*  
> *“When the sled’s right, you won’t even feel the climb. Just the hum.”*

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

### 3. **Lockpicking in Abandoned Buildings** 🔐🏚️🧰  
- **Objective:**  
  When you bought the mountain, you inherited a mess of **abandoned structures**—old **lift shacks**, **research stations**, even a few **ranger outposts**. They’re locked tight, but now they’re yours to crack.  
  Break into **doors**, **safes**, and **tool lockers** to uncover 🔦 **mid-mountain hideouts**, 💎 **hidden gear**, and 📖 **long-buried lore** from those who came before.

---

- **🔧 Mechanics:**  
  - **Initiated at locked interactables** found across old buildings and icy outposts.  
  - Gameplay uses a **dual-input system**:  
    - One hand applies **rotational tension** (like a wrench),  
    - The other manipulates a **lock pick** across a row of **virtual tumblers**.  
  - Each lock is **procedurally generated**:  
    - Randomized **pin positions**,  
    - Varying **resistance thresholds**,  
    - And different **feedback styles**—listen for **clicks**, feel for **wiggles**, watch for **HUD shivers**.  
  - **Hold tension steady**—apply too much or too little and you’ll **reset all unset pins**.  
  - Higher-tier locks introduce:
    - 🌀 **False sets** (feel real but drop later),  
    - 🔄 **Multi-stage tumblers**,  
  - **Failing** too many times can result in a **broken pick**

---

#### 🛠️ Upgrades
- 🪛 **Precision Picks** – Smoother glide, better feedback on tough pins.
- ✋ **Grip Master Tensioner** – Wider "sweet spot," more forgiving tension range.
- 🔇 **Stealth Kit** – Allows you to approach wildlife closer before spooking them.

---

#### ⚠️ Risks & Challenge
- **Pick durability** breaks with poor technique—snap a pick and you're done unless you've got backups.
- 🥶 **Bad Weather** increases pick wobble and slows hand speed—bring gloves or warm up first.  

> *“Every lock sings its own little tune. You gotta wiggle your tools to the pins’ rhythm, feel that spring under your fingertips… and hope there isn’t a snarlin’ catamount lurking just past the door.”* – *Tinkerer Maxi*

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

#### 👧 **Minnie – The Convenience Store Owner**

Minnie runs the cozy little convenience store nestled near the trailhead and base camp. She grew up on this mountain—sledding it, hiking it, panning its rivers, and listening to every wild tale folks whispered around campfires. Prospecting tools, backpacks, river pans, rods, bait? She’s got ‘em.She even has a slightly marked up "Everything Else" shelf! But more importantly, by the door sits an eye-catching **rack of Legendary Lenses**, there to tempt curious adventurers to part with their own treasure.

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

### 5. **Kite Flying** 🪁🌬️🎶

#### Objective:
Take to the skies during **uphill climbs** with a trusty kite, using wind and rhythm to lift you to new heights—literally. Your kite's more than a toy—it's a tool for discovery, glide-based trickery, and unlocking secrets only visible from above. Master the flow, and you'll earn ✨ **airborne bonuses**, and 🪁 **flight-only shortcuts**.

---

#### 🎮 Mechanics:

- **Uphill Phase:**
  - Control your kite using a **music-style rhythm system**—directional prompts appear like notes in a jam session.
  - Nail the beat to stabilize, catch wind currents, and **ride the thermals like a verse you wrote yourself**.
  - Botch the timing and your kite'll flutter down like Jay after a particularly mellow afternoon.

- **Downhill Phase:**
  - Your kite becomes a **glider**, extending airtime.
  - Different kite types offer different styles—agile kites offer greater control, larger ones will fly further, aerogel kites are heat resistant, bubble "kites" hold extra air underwater and in vacuum!  

---

#### 🛠️ Kites & Upgrades:
Your kite *is* your upgrade. Each one offers a unique feel, function, and flair based on the environment or your playstyle:

  - 🪁 **Jay’s First Kite** – A balanced, starter-friendly glider. Good control and decent airtime. Fades to red in stormlight.  
  - 🌀 **Windwhip** – Lightweight and ultra-agile. Perfect for trick runs. Loses distance in strong wind.  
  - 🏄 **Stormkite** – Reinforced rigging and heavy fabric. Handles extreme gusts and lightning zones. Tricky to steer.  
  - 🔥 **Aerogel Wing** – Heat-resistant and stable. Soars over volcanic vents and desert thermals. Heavy and slow to lift.  
  - 🫧 **Bubbleknot** – Sealed, floaty "kite" that holds breathable air. Works underwater and in thin-atmosphere zones. Nearly useless in regular air.  
  - 🌕 **Lunarch** – Ultra-wide, low-gravity sail designed for thin-air, nighttime, or vacuum mountain regions. Poor steering but massive airtime.  

> *"I always say... a kite's like a musician: some are meant to dance, some are meant to sing, and some wanna get higher."* – Jay


---

#### 🎯 Special Events & Bonuses:
- ⚡ **Storm Riding** – Extreme winds = extreme lift. Ride lightning skies for massive trick bonuses.
- 🎒 **Floating Loot Drops** – Balloons with loot attached to them sometimes float by - use your kite to pop the balloon and collect the fallen goods!

---

> *"Wind’s just music without the intent, man."*  
> *"Every kite string’s a melody waitin’ to play itself—you just gotta be the hands."*  
> *"I don’t fall, I descend artistically."*  
> *"Most folks chase the peaks. Me? I chase the air between 'em'."*  
> *"People say the mountain talks. Nah, man. It sings."*  
>  
> – *Lift Operator Jay, musician, wind whisperer, habitual floater*


---

### 6. **Sled Tricking** 🛷✨  

#### Objective
Launch yourself into the air, chain together daring stunts, and carve your name into the cold sky. Build 📸 fan hype, earn 💰 trick cash, and prove you've got the grace and grit to earn a nod from Jake—the man who quite literally built the floor beneath your feet.

---

#### 🎮 Mechanics
- **Trick Input System:**
  - Use directional combos you learn from Jake to pull off tricks like **Ghost Rider**, **Helicopter Spins**, **Corkscrews**, **Air Brakes**. Maybe someday you can even learn to **Stand while Sledding** - the art of **Sledboarding**.

- **Combo System:**
  - Land clean to maintain your **multiplier chain**.
  - Mix it up—repeat tricks lower rewards, but variety unlocks **fan bonuses** and **style streaks**.

- **Momentum Flow:**
  - Certain tricks slow descent, others give more air time burst.
  - Mastering when to hold, twist, or toss is what separates a rider from an artist.

---

#### 🛠️ Upgrades & Gear
- 🛷 **Trick-Tuned Mods** – Increases spin rate and air finesse.
- 🪂 **Altitude Boosters** – More lift = more tricks.
- 🌀 **Wind Tail Fin** – Sharper aerial control and faster recovery spins.
- 🎮 **Reflex Dampeners** – Smooths input timing for high-combo riders.
- ✨ **Jake's Signature Move: Sledboarding** – Transition from sitting to riding while standing!

---

#### 🎯 Special Events & Bonuses
- 🎥 **Fan Trick-Sprees** – Performing tricks with multiple fans on-screen starts a bonus chain, starting a short countdown within which you are given bonus rewards for performing more tricks. You can keep the timer resetting by performing more tricks with different fans on screen down hill of the first group.
- 🏁 **Trick Zones** – Areas hand-built for massive stunts and flowing chains.

---

#### ⚠️ Risks & Challenge
- ❌ **Crash Penalty** – Lose your combo and gear durability if you biff it.
- 🌀 **Over-rotation & Drift** – Bad inputs can throw your whole landing outta whack.

---

#### 🏔️ NPC: Jake – Sledboarding Pioneer, Trick Philosopher, and Builder of Mountains
- Jake is a legend not just for what he rode, but for what he *built*.
- He is a sledboarding pioneer and carved out the first trick zones by hand. These days, he's the one who constructs what others only imagine—rails, ramps, photo decks, and even lift stations. If something works up here, it's because Jake made it strong enough to hold.
- Off the slope, he's a quiet carpenter who works in a small shed tucked into a windbreak of trees. But if you're worthy, he'll show you how to move like the mountain's listening. He knows every move in the book - he invented most of 'em!

> *“Style isn’t flash. It’s control without shouting.”*  
> *“Every trick begins before you leave the ground. Every landing finishes long after you hit it.”*  
> *“Balance is a kind of listening.”*  
> *“What you build reflects what you believe. So build things that last.”*  
> *“You think sleddin’s about winnin’? Nah. It’s about wakin’. Every carve, every crash, every laugh—it’s code. You were speakin’ the language of the universe, and it finally heard ya. Now go… Dream bigger.”*  

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

### 10. 🐝 **Beekeeping**

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

### 11. Wood Chopping 🌲🪓   
> *“Bees don’t bother nobody who minds their manners. Same goes for trees, mostly.”* – Pete the Beekeeper

---

#### 🎯 **Objective**
Fell trees during the **Uphill Phase** to create **temporary downhill shortcuts** and gather **wood for crafting**.  
But watch it, bud—trees don’t grow back on command. **Chop too many**, and you’ll change the mountain in ways ya might regret. 🌲💔

---

#### ⚙️ **Mechanics**

##### 🌳 **Interactable Trees**  
Trees can be chopped, felling them and clearing the way.

##### ⏱️ **Mini-Game**  
Chopping triggers a **timed input challenge**, like **Kite Flying** 🎯.

##### 🪓 **Tools Needed**  
You’ll need an **Axe**, buyable from **Minnie** or **Pete**, and **upgradable** for speed, reach, or yield.

##### 💪 **Stamina Cost**  
Every chop uses **stamina**, so you’ll need to **weigh your options** carefully on the climb.

---

#### 🎁 **Results & Benefits**

##### 🛷 **Trailblazing**
- Chopped trees **open up smoother sled routes**, create drop-ins, or reveal hidden ramps.  
- Trails last until regrowth—could be **days, hours, or a surprise snowstorm** 🌨️.

##### 🪵 **Resource Gathering**
- Felled trees drop **wood**, used for **crafting furniture, upgrades, signs**, or even **building cozy structures at home**.  
- Higher-tier trees may offer **unique lumber** for rare blueprints.

---

#### 🌱 **Natural Regrowth System**

- Trees regrow **naturally and randomly** over time based on **elevation, weather**, and how many are still standing nearby.
- A **dynamic forest balance system** tracks how “healthy” a region is:

  - ✅ Clear a small patch = regrowth likely  
  - ❌ Chop everything = growth slows or stops entirely (and the birds stop singin’ too 🐦💔)

---

#### 🌿 **Saplings and Growth Stages**

- Chopped areas might sprout **baby trees** that can’t be chopped (yet).  
- **Mature trees** offer full benefits—but ya gotta wait, or help ‘em along with upgrades. 🌱➡️🌲

---

#### 🔧 **Upgrades & Systems**

| 🔨 **Upgrade**         | 🎯 **Effect**                                                                 |
|------------------------|------------------------------------------------------------------------------|
| 🪓 Sharpened Axe       | Faster chops, lower stamina use.                                             |
| 🌿 Reforester's Charm  | Slightly increases tree regrowth speed in surrounding areas.                 |

---

#### ⚠️ **Risks & Strategy**

- Chop too many trees and you'll risk **barren slopes**—no shortcuts, no wood, no wildlife. 🚫🌲  
- Animals **avoid over-cleared areas**, affecting your **photo score** 📸🐾  
- Trees may **grow into trails** if neglected, **blocking shortcuts**. 😬

---

#### 🧑‍🌲 **Pete the Beekeeper (and Woodsman)**  
Pete ain’t just the guy buzzin’ about bees—he’s been **felling timber** since before you were knee-high in powder. ❄️🪓  
Around these parts, folks say **Pete knows every tree by name**, and every stump by its story. It's why they call him **Encyclopedia Pete**.

He lives at the **edge of the tree line** in a cabin stacked with **firewood, handmade tools**, and **axes sharp enough to split a sneeze**.  
While he’s the one who’ll sell you your **first axe** and teach you how to swing it true, he’s also the first to **warn you not to take more than the mountain gives**.

---

#### 🏔️ **Role**
- Supplies **axes and woodcutting upgrades**  
- Teaches **sustainable harvesting** 🌳  
- Serves as the **in-game conscience** when it comes to **deforestation**  
- If you’re overharvesting, expect a **quiet visit and a firm word**

---

#### 💬 **Vibe**
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

### ❄️🏡 **Legendary NPCs**
These are **mythic figures that support your base mountain**—they run the town, drive your economy, and keep the game loop running.

#### 🏂 **Sled Tech Steve**
- **Purpose:** Repairs damage, sells sled mods.
- **Example Upgrades Unlocked:** **Custom wax, shock absorbers, reinforced sleds.**
- **Best Quote:** *"What’d ya do, run into a bear during a race? I can fix it… for a price."*

#### 🎈 **Lift Operator Jay** *(kite enthusiast)*
- **Purpose:** Manages lifts, introduces **kite mechanics** for gliding shortcuts.
- **Example Unlocks:** **Kite rentals, lift season passes, wind path hints.**
- **Best Quote:** *"Ever thought about catching air... without your sled?"*

#### 🏨🍕 Aria – Hotel Manager, Culinary Whiz, and Mountain’s #1 Hype Chef

> *“Hiya, Cuz! Hope you’re hungry—big days need big flavors.”*

---

##### 🏨 **Role**

- Runs the **mountain’s central hotel (Vermont Homestyle Hotel) and restaurant (The Hearty Entree Restaurant)**, serving as your go-to for **delicious food, fan engagement, and passive income**.
- Offers **buffs and performance boosts** through signature meals and snacks.
- Unlocks **Auto-Vermunch Machines (AVMs)**, and provides ready-to-go  raw ingredient packs for the player to deliver—automagically producing ready-to-eat goodies.
- Manages **fan hype**, tourism bonuses, and **mountain reputation**—every crowd-pleaser goes through her.
- Acts as your **main contact for Sap Tapping**, turning raw sap you deliver into high-grade syrup. She also sells **Sap Tapping upgrades** and  tools.

---

##### 🧠 **Mechanics Unlocked**

- 🍲 **Buff-Based Cooking** – Dishes grant temporary effects: warmth, stamina regen, burst speed, and more.
- 🎰 **Auto-Vermunch Machines (AVMs)** – Once unlocked, place AVMs across the mountain; restock them using raw material packs from the restaurant kitchen.
- 💼 **Tourism & Reputation Income** – Earnings from tourist hotel guests and fans grow as your renown rises. More guests = more tourists to dodge and more fans to trick for on the mountain.
- 📣 **Fan Services** – Sells upgrades like **Crowd Hype-Man** and **Crowd Weaver** to boost trick score multipliers and make tourists start dodging you when you sled.
- 🍁 **Sap Tapping System** – Deliver sap to Aria for processing into syrups used in food and AVM items. Future mountains unlock new syrup types and tapping tools.

---

##### 🔧 **Upgrades Offered**

| 🛠️ Upgrade                 | 🎁 Effect                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------- |
| ☕ **AVM Unlock**            | Places a new Auto-Vermunch Machine on the mountain.                                    |
| 🍲 **Raw Ingredient Crate** | Consumable used for restocking AVMs                                                    |
| 🎤 **Crowd Hype-Man**       | Fan Boosts are progressively increased                                                 |
| 🧣 **Crowd Weaver**         | Tourists now have a progressively higher chance to jump out of your way, like fans do! |
| 🍁 **Tap Line Upgrade**     | Improves sap collection rate or unlocks new syrup flavors                              |
| 🍶 **Sap Storage Flask**    | Lets you carry more raw sap before needing to return to Aria                           |

---

##### 🍽️ **AVM Menu (Auto-Vended Food Items)**

These ready-to-eat items are available at any stocked AVM:

- ☕ **Hot & Iced Cocoa** – Warmth or cool boost, and stamina boost. Made from local milk and Aria’s family’s Smooth Chocorator fudge—melted into creamy perfection and topped with a cloud of homemade marshmallows. The cocoa tastes like childhood winters, first chairlift rides, and everything good about coming in from the cold. The AVMs only make 2 versions, and the Smooth Chocorator fudge version is one for some reason. Aria doesn’t ask why, but she'll gladly make you a "cocoa" herself from any of the other 11 flavors of fudge she sells.
- ☕ **Hot & Iced Coffee** – Warmth or cool boost, and  speed boost. Brewed from beans roasted right here at the hotel—by Aria herself. On roasting days, the whole mountain smells like a cuppa joe. She grinds fresh for guests and morning service, but the AVMs insist on getting the beans whole. “They like it that way; won't take 'em pre-ground” she says. And somehow, they still serve it hot or iced, ground and brewed to order.
- ☕ **Hot & Iced Mocha** – Warmth or cool boost, and minor speed & stamina boost. Rich, chocolaty-smooth, and deeply caffeinated. This mocha is born from Aria’s Turkish Mocha Delight fudge—an intense mix of fine Turkish-ground coffee, dutched cocoa, and generations of family flavor science. Melted into locally-sourced milk and served hot or iced, it’s the only other cocoa variant the AVMs accept. She doesn’t argue. She just restocks.
- 🧊 **Sugar on Snow** – Light stamina regen. Straight from the trail to your tastebuds. This is the exact same simple recipe Aria’s great-aunt used to sell at roadside stands. The syrup used in this mountain classic was tapped, bottled, and sold by you, then automagically caramelized over snow inside the AVM. Don’t think about it too hard—just grab one before it melts.
- 🥒 **Pickled** **Habanero &** **Dill Sour Cucumber Pickle** – Portable stamina regen & warmth boost wrapped in a briny, nose-tinglin’ snap. Made with the same **fiery habaneros** from Aria’s Cowboy Candy but spun into a **dill-forward sour cucumber pickle** that clears your sinuses and jump-starts your core. Not sweet, not subtle—just crisp, bold, and more than a little warming.
- **🥒 Homestyle Spice & Everything Nice Sweet Cucumber Pickle** – Cool boost & stamina regen wrapped in an allspice-sweet, clove-kissed crunch. Originally developed as a **fudge flavoring for a pickle festival contest**, Aria repurposed the family’s legendary "Homestyle Spice & Everything Nice" blend into these soothing **sweet pickles**.
- 🍕 **Personal Cowboy Candy & 3 Cheese Pizza** – High stamina restore & regen featuring **homemade Mozzarella & Feta** Cheeses from local milk, a locally **Vermont-made aged Cheddar** cheese, and the same homemade spicy **Blazing Bull Habanero Edition Cowboy Candy** sold in mason jars at the Vermont Homestyle Hotel Gift Shop (Aria also offers a Mutton Buster Mild Cubanelle edition and the Original Signature Jalapeno Edition, but the AVMs won't take 'em). You gotta **eat 'em hot** to really **enjoy 'em** proper-like.

> AVMs **only accept raw ingredients**—players must supply salt, cucumbers, milk, flour, and more from Aria’s kitchen. They do seem to gather their own filtered ice and water at least.

---

##### 🎤 **Personality & Vibe**

Aria’s got **red hair, freckles, and hustle baked into her bones**. She’s **young**, sweet, and **focused as heck**. Whether she’s flipping pancakes, refilling towel warmers, or managing a tourism rush mid-storm—**she handles it with a smile and a spatula**.

She’s a distant cousin of the player, and she lets ya know it—always with a warm *“Hiya, Cuz!”* before handing you something hot and comforting. She’d restock the AVMs herself if she could, but that’d mean closing the hotel, and **this girl doesn’t believe in shutting down**.

Aria is also a seriously skilled cook—her recipes (like those legendary smoked jalapeño wontons and secret family blond brownies) are known across the slopes. Just don’t ask how the AVMs turn raw ingredients into pizza. Not even the Tinkerer knows. Nobody even can change their recipes... at least on this mountain.

> *“Can’t land a triple cork with an empty belly.”*\
> *“Hospitality is just high-speed logistics in an apron.”*\
> *“The secret to hotel management? Don’t stop movin’, ‘til everyone’s smilin’, sleepin' or fed. Sometimes all three.”*\
> *“You handle the tricks—I’ll keep the cocoa flowin’.”*\
> *"Yeah, the sap takes a while to thicken up, but I've got a big solar-oven."*


#### 🏪🎒 Minnie – Trailside Outfitter, Treasure Whisperer, and Dealer of Gear You Didn’t Know You Needed  
> *“You pack for the trip you think you're takin’. I pack for the one you're *gonna* have.”*

---

##### 🏪 **Role**
- Runs the **mountain’s go-to convenience shack**, specializing in **prospecting gear**, **utility tools**, and **and everything else you've wanted to buy more of**.  
- Acts as the **player’s main point-of-contact** for starting and upgrading **digging, panning, fishing**, and **lens-based discovery systems**.  
- Unlocks **Treasure Tech**, including the **Panttock**—a single tool for dig, pan, and pick actions.  
- Offers **practical wisdom and gear with just a hint of folklore**, always hinting she knows more than she lets on.

---

##### 🧠 **Mechanics Unlocked**
- ⛏️ **Multi-Tool Prospecting** – With the Panttock in hand, unlock access to dig spots, breakables, and gold-rich streambeds.  
- 🐟 **Fishing & Foraging** – Get outfitted with bait, rods, and region-specific tips for catching and cooking.  
- 👁️ **Legendary Lenses** – Visual upgrades that let players **see hidden trails, glints, or fossils** that are otherwise invisible.  
- 🗺️ **Map Scraps & Lore Trails** – Hidden areas, cryptic clues, and bonus missions via Minnie’s rotating stock of “authentic-ish” maps.

---

##### 🔧 **Upgrades Offered**

| 🛠️ Upgrade                   | 🎁 Effect                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| 🥄 **Panttock Enhancements** | Improves speed and success rate for dig, pan, and pick actions.          |
| 🎒 **Utility Pack Slots**     | Carry more tools, samples, or bait types on the go.                      |
| 🗺️ **Rough Sketch Maps**      | Unlock hidden sub-areas and rumored dig zones.                          |
| 👓 **Lens Frame Kit**         | Mount multiple lenses and cycle between modes faster.                   |

---

##### 🎤 **Personality & Vibe**
Minnie’s not flashy, and she’s not out there trickin’ off glaciers—but she *is* the one who sold gear to the guy who did. She’s the kind of local who’s been here forever, never left, and doesn’t *need* to prove it. You ask for rope and she hands you one tied in seven useful knots. You ask for directions, and she gives you a story and a trail riddle.  

She respects the mountain the same way she respects her shelves—kept sharp, kept stocked, and always slightly dusty with mystery. Practical, direct, and not too interested in your excuses—Minnie gives you **what you earn**, not what you ask for.

> *“I’ve seen four different people find four different things in the same hole. Figure that one out.”*  
> *“It ain’t lost. It’s just waitin’ for you to be the right person to find it.”*  
> *“You can’t pan with a full pack or a full head. Drop somethin’ first.”*  
> *“People talk about treasure like it’s buried. Most of it’s just hidin’ under the right light.”*  
> *“Mountain’s got secrets. I just happen to sell the keys.”*

> *“You never know when you’ll need an extra pack of hand warmers.”*

---

##### 🏪 **Role**
- Operates the cozy trailhead **Convenience Store**, supplying gear for **prospecting, treasure hunting, panning, and survival**.  
- Serves as the **starting point and upgrade hub** for all things related to **fossils, minerals, buried treasure**, and **legendary lenses**.  
- Sells the all-important **Panttock**—the multipurpose tool for **digging, picking, and panning**.  
- Once you've bought an item from someone else, Minnie will source it's upgrades for you from the original seller in the future (though at a slightly inflated price to account for her overhead)
- Offers quirky advice, mysterious maps, and just enough help to get you curious—but never enough to spoil the surprise.

---

##### 🧠 **Mechanics Unlocked**
- 🪙 **Treasure Digging** – Soft ground yields lost coins, gear, and rare artifacts.  
- ⛏️ **Rock Picking** – Break icy or rocky terrain to find fossils and minerals.  
- 🌊 **River Panning** – Sift through streams for a little of everything—if you’re patient.  
- 👓 **Legendary Lenses** – Unlock special vision modes to spot hidden loot, wildlife, and secrets.

---

##### 🔧 **Upgrades Offered**

| 🛠️ Upgrade                   | 🎁 Effect                                                                 |
|------------------------------|--------------------------------------------------------------------------|
| 🥄 **Panttock Enhancements** | Reduces stamina cost and improves dig/pick/pan efficiency.              |
| 🧭 **Explorer’s Pack**       | Increases inventory space and tool durability.                          |
| 🗺️ **Quirky Old Maps**       | Reveals cryptic hints and mystery spots on the mountain.                |
| 👓 **Lens Rack**             | Expands storage for more Legendary Lenses, allowing fast swapping.      |

---

##### 🎤 **Personality & Vibe**
Minnie grew up on this mountain—sledding it, climbing it, digging holes in it, and *listening to it*. She's got a dry wit, a sharp eye, and the uncanny ability to sell you exactly what you didn’t know you needed.  

She’s not flashy—she’s **solid**. A quiet legend in her own right, always organizing gear, scribblin’ in ledgers, and somehow knowing exactly when someone’s gonna walk in needing a **wax lens and two baits before sundown**.

> *“If it looks like junk, dig anyway. This mountain hides her best stuff under the worst rocks.”*  
> *“The river don’t care what you’re hopin’ to find—but it’ll show you what you need.”*  
> *“Folks come lookin’ for gold. They leave with stories. Guess which one I trade in?”*  
> *“I don’t sell luck. But I do sell the things luck likes to hang around.”*  
> *“You learn the mountain by listenin’. And diggin’. And then listenin’ again when it buries your gear.”*


#### 🏔️ **Resort Manager Montana Snow**
- **Purpose:** Oversees **mountain upgrades & expansion.**
- **Example Unlocks:** **New trails, safety patrols, winter festivals.**
- **Best Quote:** *"A bigger, better mountain keeps ‘em coming back!"*

---

#### 📸🧠 Darlene – Wildlife Researcher & Trick Shot Analyst  
> *“If it moves fast or looks majestic—I’m shootin’ it, tagging it, and sellin’ the poster.”*

---

##### 📸 **Role**
- Manages **photographic missions**, **wildlife research**, and **extreme trick payouts**.  
- Handles **rare animal spotting quests**, and **photo bounties**.  
- Works with **Beekeeper Pete** to track **ecosystem health** based on player **tree felling**.
- Runs a **wildlife photography magazine**, publishing her own shots *and* **paying players for great wildlife or fish photos**—that’s the basis for the **wildlife photo bonus** and **fish photo bonus**.  
- Advocates for balance and stewardship—**if you’re disrupting the ecosystem**, Darlene will let you know.

---

##### 🧠 **Mechanics Unlocked**
- 🦊 **Animal Rarity Database** – Increases the value of animal photos, as you can prioritize the rare ones.
- 🎞️ **Trick Replay System** – Darlene shoots and edits your tricks before publishing them.
- 📔 **Cryptid Logs** – Darlene is especially interested in... rare... wildlife, and will pay commensurately.

---

##### 🔧 **Upgrades Offered**

| 🎯 Upgrade            | 🎁 Effect                                                                      |
|-----------------------|--------------------------------------------------------------------------------|
| 📸 **Optimized Optics**| Increases the optics cone, and makes the sweet spot of the altitude bar larger.                       |
| 🎥 **Trick Tracker**   | Upgrades Darlene's telescope, icreaseing what tricks are worth.                                  |
| 🐾 **Cryptid Lure**   | Increases cryptid spawn rate for a limited time.                          |

---

##### 🎤 **Personality & Vibe**
Darlene is **sharp, kind, and absolutely unshakable**. A lifelong advocate for people and nature alike, she brings a **people-first mindset** to everything she does—from coaching new riders on trick form to protecting the mountain’s ecosystem.  

Fast-talking, camera-slingin’, and **always on the move**, she calls out sled tricks with the same passion she uses to spot a rare lynx in the trees. Her warmth and leadership make her one of the most trusted figures on the mountain, but **don’t mistake kindness for weakness**—she’ll call out sloppy work or careless players in a heartbeat.

> *“That 360 corkscrew over the flaming fox den? Legendary. Now do it again while a moose photobombs you.”*  
> *“If I had a nickel for every falcon shot I missed, I’d have enough to buy a decent zoom lens. But I don’t. So hustle.”*  
> *“Nature don’t pose. You get one shot—make it count.”*


#### 🏅 **Stunt Organizer Whistler**
- **Purpose:** Hosts **extreme challenge events**—big air, freestyle sessions.
- **Example Unlocks:** **Timed trick courses, skydiving sled events.**
- **Best Quote:** *"I wanna see something so crazy I forget my own name!"*

#### 🏁 **Race Commissioner Cannon**
- **Purpose:** Runs **competitions & time trials**.
- **Example Unlocks:** **Speed sleds, racing circuits, timed event boards.**
- **Best Quote:** *"Fastest run gets the trophy—simple as that."*

#### 🏂 **Retired Pro Jake**
- **Purpose:** **Builds to suit, teaches advanced tricks, & unlocks sledboarding**.
- **Example Unlocks:** **Sledboard transitions, trick combos, building construction.**
- **Best Quote:** *"Back in my day, we landed tricks with style. I can show ya how."*

#### 🚑 **Sled Patrol Captain**
- **Purpose:** Leads **rescue missions & avalanche drills.**
- **Example Unlocks:** **Emergency sled deployment, survival training.**
- **Best Quote:** *"We save people, we don’t just watch ‘em wipe out."*

#### 🔧 Tinkerer Maxi – RC Sled Crafter, Lockpick Enthusiast, and Bitstream Interpreter

> *"Noise is easy. Signal takes work.”*

---

##### 🔧 **Role**

- Leads players through the worlds of **RC Sledding**, **lockpicking**, and **experimental tech**.
- Developed the **Micro RC Sled** used in Micro Mountain's unstable environments.
- Discovered **Bitstream Bluffs** and has been decoding and adapting its glitchy tech ever since.
- Offers tools and upgrades for **RC Sleds**, **lockpicking gear**, and **mountain-legal remote mischief**.

---

##### 🧠 **Mechanics Unlocked**

- ❄️ **RC Motor Sledding** – Control fast, nimble sleds with upgrades for speed, agility, and airborne tricks.
- 🔐 **Lockpicking Systems** – Access abandoned cabins, safes, and facilities using tension tools, rakes, bypass chips, practice, and finesse.
- 💾 **Bitstream Interpretation** – Detect and exploit tech-glitches in the strange digital terrain of Bitstream Bluffs.

---

##### 🔧 **Upgrades Offered**

| 🛠️ Upgrade                  | 🎁 Effect                                                         |
| ---------------------------- | ----------------------------------------------------------------- |
| 🎮 **RC Control Boost**      | Enhances responsiveness and trick potential of RC sleds.          |
| 🔐 **Tension Grip Enhancer** | Expands lockpick "sweet spot" and improves feedback.              |
| 📡 **Bitstream Scanner**     | Reveals glitched terrain nodes and hidden tech secrets.           |
| 🧲 **Magnetic Spool Kit**    | Lets you retrieve lost RC sleds and gear from inaccessible areas. |
| ⚡ **Battery Mod Pack**       | Extends range and duration of all remote devices.                 |

---

##### 🎤 **Personality & Vibe**

Maxi doesn’t *ride* sleds—she engineers them, *pilots* them, and sometimes makes 'em dance to her rhythm. With rainbow glasses and a soldering iron in-hand, she’s the reason Micro Mountain’s pint-sized courses even function—her RC sleds are tiny, turbo-charged miracles. She didn’t build Bitstream Bluffs, but she’s the first to find it, solder it, and she hasn't had any magic smoke escape yet!

Her lift shack-turned-lab is a mess of wires, blinking lights, and half-finished blueprints, but she knows where *everything* is. If it beeps, zaps, or locks shut, Maxi’s already rebuilt it twice—and the new version makes toast. To her, the mountain is one big circuit board, and you’re just another spark lookin’ for ground.

She’s young, with a sharp grin and sharper tools, thick hair up in bright rainbow pigtails, and boots that look like they’ve seen every kind of weather and wiring job. Her gloves are fingerless, her hoodie is well-patched from solder burns, her skirt is a kaleidoscope of color, and there’s almost always something blinking or buzzing quietly in her pocket. Her rainbow lenses flash like signal lights, and when she starts talking tech, it’s like listening to lightning figure itself out.

> *“I wasn’t trying to make a drone sled with a chainsaw. But here we are.”*  \
> *"Bitstream’s not broken. It’s just... dreaming."*  \
> *"Locks are just puzzles with a guaranteed solution."*\
> *“I didn’t break the lock. I simply unlocked permanently.”*  \
> *"Bitstream is smart. That's why you have to out-weird it instead."*

---

#### ❄️🪶 Winter Shaman Bromley – Trail-Tagger, Weather Whisperer & Keeper of the Blue Ribbon  
> *“The mountain remembers. So should you.”*

---

##### ❄️ **Role**
- Unlocks **weather manipulation mechanics**.  

---

##### 🧠 **Mechanics Unlocked**
- 🌨️ **Weather Weaving** – Influence weather patterns temporarily through rituals, affecting trail conditions.  

---

##### 🔧 **Upgrades Offered**

| 🛠️ Upgrade                 | 🎁 Effect                                                                 |
|----------------------------|--------------------------------------------------------------------------|
| 🧥 **Bromley's Standard-Issue Winter Coat**     | Provides resistance against harsh weather conditions.                    |
| 🪓 **Pabst's Ski Poles**    | Enhances jumping.     |
| 🍺 **Blue Ribbon Elixir**   | Temporarily gives a greater chance to see Cryptids, and unearth Cryptid fossils.                   |
| 🏅  **Bromley's Blue Ribbon**   | Let's you call upon Shaman Bromley to change the weather in your favor.                   |

---

##### 🎤 **Personality & Vibe**
Bromley is a **mystic elder**, embodying the spirit of the mountain. Draped in layers of vintage ski gear adorned with feathers and patches, he carries the weight of history with a twinkle in his eye. He speaks in riddles, often referencing past events as if they happened yesterday, and guides players to find harmony between thrill and tradition.

> *“Every trail has a tale. Listen closely.”*  
> *“Snow remembers the first tracks. Make yours count.”*  
> *“Wangfang. Ride the Rhino.”*  
> *“Names hold power. Choose them wisely.”*
> *"Beware the Snow Sharks!"*

#### 🐻🔥 Bear Whisperer Carrie – Animal Trainer, Race Facilitator, and Feral Energy in a Hoodie

*"Bears don’t bite... if you know how to ask nicely."*

---

##### 🐻 **Role**

- Unlocks **bear-racing**, a wild and unforgettable downhill challenge.  
- Offers **Time Trials**, **Trickoffs,** and **Elimination Races**!
- Human vs Bear - **Who Will Win?**

---

##### 🧠 **Mechanics Unlocked**

- 🐾 **Bear Racing** – High-speed, high-risk downhill races where you compete against trained racing bears.

---

##### 🔧 **Upgrades Offered**

| 🛠️ Upgrade                    | 🎁 Effect                                                |
|-------------------------------|----------------------------------------------------------|
| 🍯 **Honey-Lure Tincture**    | Attracts a specific rare bear type for one session.     |

---

##### 🎤 **Personality & Vibe**

Carrie doesn’t *tame* bears. She meets them where they are. She’s been a paraeducator, a technologist, and she’s raised two boys, she’s part animal behaviorist, part adrenaline junkie, and part gentle philosopher who just happens to **slide down cliffs on the back of a 900-pound predator**.

She talks to bears like old friends, whispers to cubs in languages only the mountain knows, and once got in a standoff with a moose and *won by blinking slower*. While most folks are runnin’ from wildlife, Carrie’s out there **sharing trail snacks and takin’ notes**.

Nobody really knows where she learned this stuff—she just showed up one winter with **a sled, a bear, and zero fear**, and people figured it was best not to ask.

*“It’s not about makin’ them obey. It’s about makin’ them wanna run with you.”*  
*“Claws on the ice? It’s like poetry... if poetry could maul you.”*  
*“The first step to racing a bear is trust. The second step is making sure you’re not snack-shaped.”*  
*“You can’t out-muscle a bear. But you can out-vibe one.”*  
*"You think BEARS are hard to train? Try human kids!"*

#### 🐝🌲 Beekeeper Pete – Hive Whisperer, Forest Steward, and Old-School Logger  
> *"Snow bees? Oh yeah, they’re real… and fast."*

---

##### 🐝 **Role**
- Guides players through the **Beekeeping** and **Wood Chopping** systems.  
- Offers tools and wisdom for tracking, harvesting, and managing **wild hives** and **tree ecosystems**.  
- Sells and upgrades essential gear: **smokers, bee boxes, axes**, and more.  
- Oversees the mountain’s delicate balance between **extraction and stewardship**—he’ll notice if you take too much.

---

##### 🧠 **Mechanics Unlocked**
- 🐝 **Wild Hive Beekeeping** – Locate, harvest, and relocate natural bee colonies.  
- 🌲 **Sustainable Logging** – Chop trees for resources and trailblazing, while avoiding ecological harm.  
- 🔍 **Bee Lining & Cutouts** – Mini-games for triangulating and harvesting wild hives.  
- 🧪 **Specialty Resources** – Collect **wax**, **honey**, and **royal jelly** for crafting and upgrades.

---

##### 🔧 **Upgrades Offered**

| 🛠️ Upgrade               | 🎁 Effect                                                                          |
|---------------------------|------------------------------------------------------------------------------------|
| 🍯 **Smokers**            | Calms wild bees for safer harvesting and better yield.                            |
| 🐝 **Hive Boxes**         | Allows you to relocate wild hives to base for passive resource generation.        |
| 🪓 **Sharpened Axe**       | Reduces stamina cost and increases efficiency while chopping trees.               |
| 🧭 **Bee Box & Tracker Kit** | Helps trap and follow foraging bees back to their hive.                         |
| 🌿 **Reforester’s Charm** | Slightly boosts tree regrowth rate in nearby cleared zones.                       |

---

##### 🎤 **Personality & Vibe**
Pete is the mountain’s **quiet heartbeat**—an old soul who’s been out here longer than anyone can remember. They call him **“Encyclopedia Pete”**, ‘cause he knows everything from how to run an Apiary, to how to Zip the limbs off of a felled tree.
He talks to the land like it’s an old friend—and it listens.  

Living in a cabin where the walls literally buzz, Pete splits his time between **caring for his hives** and **swingin’ an axe with surgical precision**. He won’t stop you from harvestin’, but he’ll teach you to **take only what you need, and leave the roots**.

> *“Bees don’t bother nobody who minds their manners. Same goes for trees, mostly.”*  
> *“You wanna learn somethin’ out here, keep yer mouth shut and yer eyes open.”*  
> *“You think the mountain don’t notice when you clearcut a hillside? Wait till the wind shifts.”*  
> *“Harvestin’s not the same as takin’. One leaves roots. The other leaves nothin’.”*  
> *“Cut with care. Leave room for regrowth. The bees’ll thank you. The trees too.”*
> *"They tried to nickname me Logger Pete, but it sounded too much like a bitter drink to me."*
> *"Beekeeper Pete has a sweeter tone to it, if ya ask me."*

---

## 🎮 Enhanced Controls & UI Improvements
- Fully customizable control remapping
- Comprehensive tutorial and onboarding systems
- Improved HUD clarity (stamina, trick scoring, wildlife photography)

---

## 🏔️ **Mountain Themes & Progression**

### 🏔️ Debumont – “The Old Vermont Starter” 🍁❄️

- **Description:**\
  **Debumont** is the **first, friendliest peak** on your SledHEAD journey—a mid‑sized, maple‑and-pine forested Vermont mountain famous for its **rolling groomers**, tuck‑away shortcuts, and cozy base‐village vibe. The slopes are gentle enough for tourists yet varied enough to teach real **trick‑flow**—without overwhelming new riders. By day you’ll sled past Vermunch machines and frost‑tipped pines; by night the summit beacon glows warm amber, guiding late‑run daredevils back to Aria’s cocoa window.

- **Gameplay Rules:**

  - No special gear required—**standard sled & wax** work fine.
  - **Panning Spots** concentrate near creek beds; digging & picking appear in soft drifts and rock outcrops.
  - Native bee species:
    - 🐝 **Snow Bees** build frost-hives nestled in wind-sheltered crevices, using crystalized resin and frozen moss to weather blizzards. They forage what little they can—maple honeydew & spruce drips beneath the treeline, and alpine heather blooms, and even snow algae—crafting a honey that's rosy, rich, and cold on the tongue.
    - 🧣 Snow Bees always wear tiny red scarves, but no one knows where they get them from. Not even Pete.
  - Pay off your **Debumont Debt** (loans + base upgrades) to unlock other peaks like Garbage Mountain.

- **Mechanics:**

  - **Variable Groomers:** Wide, forgiving lines intercut with hidden stashes for first trick chains.
  - **Learn‑by‑Doing Events:**
    - *First Photo Bounty* from Darlene (snap a deer or jay).
    - *Intro Beekeeping* with Pete (locate a Snow Bee hive).
    - *Beginner Dig Spot* flagged by Minnie (find a lost ski badge).
  - **Micro Weather Swings:** Quick flurries drop fresh powder that slows heavy sleds but increases jump loft.

- **Special Features:**

  - 🛷 **Beginner friendly:** Safe landings tuned for early combo practice.

- **Power‑Up Requirement:**\
  None. **Debumont** is your baseline—gear from here works everywhere else, but every upgrade shines first on home snow.

- **Lore Hook:**\
  Locals claim Debumont’s name comes from an old French trapper who shouted *“Je débute!”* (“I’m starting out!”) before his maiden sled run. Modern sledders still echo his spirit—**every legend begins here**, carving their first line past maple trees, friendly Snow Bees, and Aria’s cocoa window. Pay off the lodge loan, earn the town’s respect, and Debumont’s banner is hoisted at your base cabin forever. The man who sold you Debumont used the money to buy a wedding ring.

---

### Garbage Dump Glacier 🗑️❄️
- **Description:** Icy runs through a frozen landfill filled with discarded items, oil slicks, and seagull attacks.  
- **Mechanics:**  
  - **Sticky Garbage Areas:** Slow down your sled unless special upgrades are used.
- **Power-Up:** **Slick Wax Spray**  
  *Required to unlock Garbage Dump Glacier. Prevents sticky terrain and provides a speed boost on all levels.*

---

### 🐫 Pyramid Peak 🏜️📿

- **Description:**\
  When the snow melts and sledding season shuts down back home, thrill-seekers head to **Pyramid Peak**—a sun-scorched dune mountain crowned by ancient ruins. Despite its name, the real sledding happens not on the pyramid itself, but on the **colossal sand dune beside it**, which towers high enough to catch the desert wind. From the summit, you can spot a single, distant pyramid silhouetted against the orange horizon.

- **Gameplay Rules:**

  - You ride your regular sled, but you’ll need **Sandrunner Skis** to traverse shifting dunes and loose terrain.
  - You can **pan the sand anywhere**—this mountain is a prospector’s dream.
  - Home to two distinct bee species:
    - 🐝 Dust Bees build **sand-hives along dune ridges**, harvesting **drift-pollen**—airborne **grains from flowers** carried in by **seasonal winds** and crushed into **fine powder** by the shifting sands. Their honey’s sweet, delicate, **powdery, and nearly weightless**.
    - 🐝 Desert Bees, fondly nicknamed **Dessert Bees**, live in **sandstone and honey-daub hives**. Their cactus flower honey is so rich and naturally sweet, it’s a **signature ingredient** in **Aria’s Baklava**—and a favorite among **high-end chefs** across the globe.

- **Mechanics:**

  - **Sandstorms & Hidden Pitfalls:** Impede vision and open sudden trick paths or buried ruins.
  - **Tumble Hazards:** Falling boulders and crumbling ledges require quick reactions.
  - **Solar Intensity Zones:** Overheating risk unless cooled by shade or fan-supplied gear.

- **Special Features:**

  - 🏜️ **All-Sand Panning:** Every grain might hide treasure—gleaming gems, ancient relics, or bee-built artifacts.
  - 💨 **Wind Surf Zones:** Use dunes and thermals for massive air tricks and combos.
  - 🐪 **Mirage Events:** Rare illusion zones appear mid-run—sometimes loot, sometimes trick gates.

- **Power-Up Requirement:**\
  🏜️ **Sandrunner Skis**\
  *Required to ride. Lets you glide across sand as if it were snow, reducing sink risk and boosting loose-surface speed.*

- **Lore Hook:**\
  Pyramid Peak was first discovered by sledders chasing warm-weather thrills during off-season. But once the mountain was mapped and the ancient scarabs stirred, the real treasure proved to be **beneath the sand**. These days, it’s a pilgrimage site for *prospectors, trickers, and bee hunters* alike.

---

### Underwater Mountain 🌊
- **Description:** Submerged slopes with slow-motion physics. Seaweed, coral formations, and hidden underwater currents abound.  
- **Mechanics:**  
  - **Air Meter (Stamina):** Acts like oxygen; replenished by air bubbles or surface spots.
- **Power-Up:** **Aqua-Lung Mittens**  
  *Required to enter Underwater Mountain. Constantly replenishes stamina underwater and reduces stamina drain on other mountains.*

---

### 🔮 Crystal Cavern 🌌💎

- **Description:**\
  Deep inside the **starter mountain** lies the shimmering, subterranean realm of **Crystal Cavern**. This sparkling maze of glowing crystal formations and slick mineral walls is **only accessible via Deep Diggin'** or hidden cave entrances. It’s the only mountain zone with **enhanced Pickin’**, and the home of the mysterious **Crystal Bees**.

- **Gameplay Rules:**

  - The cavern’s icy floor requires precision sledding and careful control.
  - The **Crystal Bees** here don’t make edible honey—instead, they excrete a mineral-laced resin that hardens into diamond-grade hive walls.
    - Their "honey" has no taste—just sharp little flecks of gemstone.
  - Panning is ineffective here—**this is a dig-and-pick-only zone.**

- **Mechanics:**

  - **Fragile Obstacles:** Crystal walls shatter on contact, scattering reflective debris that temporarily blinds.
  - **Echo Zones:** Trick sounds amplify for longer combo chains and hype generation.
  - **Resonant Hazards:** Some crystal types hum—break 'em wrong, and they’ll explode in a soundburst.

- **Special Features:**

  - 💎 **Echo-Powered Tricks:** Certain tricks hit harder in echo zones.
  - 🧪 **Gem-Infused Honey Shards:** Valuable loot dropped from Crystal Bee hives.
  - 🛠️ **Mega Pick Events:** Large crystal blocks offer rare rewards if cracked just right.

- **Power-Up Requirement:**\
  🔍 **Crystal Clear Goggles**\
  *Essential for navigating the cave. Reduce blinding effects and highlight crackable formations and pick spots.*

- **Lore Hook:**\
  Crystal Cavern was first uncovered by a sledder who heard her echo come back wrong. She followed the sound to find **a maze of luminous tunnels**, rich with treasure and danger. The Crystal Bees don’t sting—but their hives can cut you if you’re not careful. Miners say the caves grow deeper every year... but no one's found the bottom.

---

### Space Mountain 🌌
- **Description:** Sled in low gravity on lunar or Martian slopes with huge craters, steep cliffs, and meteor showers.  
- **Mechanics:**  
  - **Low Gravity:** Higher jumps, longer airtime, easier flips 'n tricks.  
  - **Meteor Showers:** Random meteor strikes introduce obstacles.
- **Power-Up:** **Gravity Stabilizer Sled Upgrade**  
  *Required to unlock Space Mountain. Stabilizes sled control in fluctuating gravity.*

---

### Candy Cane Canyon 🍭
- **Description:** Sweet, candy-themed slopes with chocolate rivers, caramel waterfalls, and peppermint jumps.  
- **Mechanics:**  
  - **Sticky Sweets & Sugar Rush Zones:** Affect speed and maneuverability.
- **Power-Up:** **Sweet-Tooth Coating**  
  *Required for Candy Cane Canyon. Prevents sticking and mitigates slowdown effects on other terrains.*

---

### Sky Jellyfish Mountain ☁️🪼
- **Description:** Ethereal, bouncy slopes with luminous sky jellyfish and shifting cloud platforms.  
- **Mechanics:**  
  - **Bounce Physics & Air Gusts:** Create unpredictable trajectories.
- **Power-Up:** **Stabilizer Sled Rails**  
  *Required for Sky Jellyfish Mountain. Improves landing stability and reduces bounce unpredictability.*

---

### Steampunk Slopes ⚙️🎩
- **Description:** Steampunk-inspired terrain with gears, conveyor belts, and mechanical contraptions.  
- **Mechanics:**  
  - **Timed Obstacles & Gear Grinds:** Require precise timing and offer big cash bonuses.
- **Power-Up:** **Clockwork Treads**  
  *Required to unlock Mechanical Mountain. Provides traction on moving surfaces and enhances handling.*

---

### 🐜 Micro Mountain 🌱🔬

- **Description:**\
  Nestled in the humid glow of Pete’s greenhouse apiary, **Micro Mountain** is no illusion—it’s a living moss-covered mountain **scaled to a micro-drone sled** you’ll pilot using your **familiar RC Sled controls**.\
  What looks like a few stones and some terrarium glass from outside becomes a towering jungle of dew-covered leaves, tumbling ant tunnels, pollen avalanches, and clover-blade cliffs when you’re on the inside.

  It’s a **true miniature mountain**, and  **it never changes**—at least, not on its own...

- **Gameplay Rules:**

  - You ride a **Micro Sled**, a tiny physical drone which happens to match your RC sled’s handling exactly.
  - None of your standard sled gear applies here—**only your RC Sled upgrades** (like handling, drift control, battery tuning, and precision kits) affect performance.
  - Runs require **both a high RC Sledding and Beekeeping level** to unlock. Pete won’t let just anyone drive near his queens.
  - You must **produce Royal Jelly Wax** and apply it to the sled’s micro-runners before each session—it’s the only way to glide through the dense, clumpy moss.

- **Mechanics:**

  - **Garden-Scale Hazards:**
    - Rolling **dew droplets** can crush you or sweep you away.
    - **Pollen dust clouds** choke visibility during flower bloom cycles.
  - **Environmental Dynamics:**
    - **Bees** Pete cares for in the larger greenhouse will influence what appears in Micro Mountain.
    - Breed a new species? The micro-world might gain **new terrain, behavior changes, or rare hazards**.
  - **Hydration Events:**
    - Sprinklers above the terrarium trigger **weather patterns**, soaking moss into slick slides or flooding trails temporarily.

- **Special Features:**

  - 🧪 **Persistent Layout:** Micro Mountain never changes randomly—but it **evolves** based on your actions in the real world.
  - 🐝 **Bee Influence System:**
    - Introduce new bees to Pete’s hives? Expect new pollen types, tunnel behaviors, or even **insect allies** to show up in your micro-runs.
  - 🕳️ **Tunnels & Trail Switches:** Secret wormholes and ant-dug paths allow for run routing choices—risky but rewarding.

- **Power-Up Requirement:**\
  🍯 **Royal Jelly Wax**\
  *A high-efficiency nano-wax derived from rare bees. Applied to the runners of the Micro Sled before entry. Greatly reduces friction on organic terrain (moss, bark, clover). May attract bees.*

- **Pete’s Warning:**

  > “Ya want to sled near my bees, ya’d best learn to *respect* ‘em first. That wax you’re glidin’ on? Took twenty drones a week to make it. Don’t waste it on showboatin’.”

- **Lore Hook:**\
  Pete built Micro Mountain years ago to study pollination routes in miniature. But when he saw a bee riding a dew drop down a moss slide, he got an idea.\
  He fitted a micro drone with a handy control harness and started testin’.\
  Now? It’s your turn. But only if Pete thinks you’re ready—**and the bees agree**.\
  Just remember: in here, **you’re not the apex predator**. You’re just another bug tryin’ to ride the slope.


---

### 💻 Bitstream Bluffs 🔮📶

> *“It’s not alive... just ones and zeros. But then... isn’t DNA the same trick, but in a zip file?”* – Tinkerer Maxi

#### 🏔️ Description

Bitstream Bluffs ain’t on any map—'cause it ain’t real. It’s a fully-virtual **digital mountain**, accessed through a glitchy old **arcade cabinet** you can install at your lodge.\
You don’t ride your usual sled here. Instead, you pilot a **digital proxy sled**, using the **exact same control layout and responsiveness** as your RC Sled. Spooky? Or lucky?

**Your skills carry over—but none of your gear does.** This isn’t a joyride—it’s **a simulation carved in code**..

#### 🕹️ Gameplay Rules

- You ride a **Digital Sled**, rendered entirely in a simulated world.
- It **feels just like your RC Sled**—same physics tuning, control setup, and handling style.
- No sled mods or limited inventory apply—this is a **skill-focused simulation** with randomized hazards.
- You start near the peak, and the **slopes never end**. There is no up, only down. **There is no climb, only carve.**
- Every session is a **procedural remix**, offering new glitch patterns, track shapes, hazards, and gravity rules.
- The **terrain integrates features from every mountain you’ve unlocked**—snowbanks from Garbage Glacier, dune-launch thermals from Pyramid Peak, or bubble-path airtime chains from Underwater Mountain.

#### 🔧 Mechanics

- **Glitch Zones & Malware Hazards:** Scramble vision, invert terrain, or randomize momentary movement.
- **Bit Bridges & Datastream Trails:** High-speed trails through corrupted memory sectors.
- **Firewall Gates:** Fry control stability unless avoided or properly timed.
- **Packet Winds:** Buffering data gusts that can lag you—or crash you—into digital space.
- **Bitstream Drift:** Anti-grav momentum puzzles that test your sled finesse.

#### ⭐ Special Features

- 🕹️ **Arcade Access:** Requires unlocking the **Bitstream Cabinet** and installing it at home.
- 🔁 **Ever-Shifting Layouts:** Glitches rewrite the mountain on every entry—no two runs are alike.
- 📼 **Daily Patch Cycles:** Each real-world day downloads new terrain permutations, visual filters, and challenge rules.\
  Examples: *Upside-Down Mode*, *No Jumping Allowed*, *One-Life Turbo Run*.
- 🌐 **Resonance Echoing:** The more you sled Bitstream Bluffs, the more “in tune” it becomes with your style—future sessions might resemble your past runs, *as if the mountain is remembering you*.

#### 💾 Power-Up

**Error Correction Engine**\
*Prevents crashes from glitch walls, corrects brief input corruption, and adds a buffer against malware trail effects.*

#### 🛠️ Tinkerer’s Tip

> *“It ain’t your RC sled... but it should **feel** like it is. Whoever made it mirrored the controls perfectly, down to the frame... what are the odds?”*

#### 🌀 Lore Hook

Nobody knows where the cabinet came from. The Tinkerer Maxi swears she found it buzzing in a field, half-buried, still warm.\
It updates itself. It runs, whether you plug it in or not. Maybe plug it in though - I think it likes the buzzing.\
The leaderboard refreshes hourly. Sometimes... it knows your name.

Some say it's just a ghost in the machine.\
Others say it’s a window—**a way to sled somewhere else**.\
Somewhere deeper. Older.

Whatever it is...\
it’s waiting.\
And it **wants** to be sledded.

###  Vertigo Vents 🌋💨

- **Description:**  
  Sizzling volcanic slopes with flowing lava rivers, steaming geysers, and jagged obsidian cliffs. This is **trickster paradise**, where the heat is deadly, but the **airtime is divine**. Volcanic vents blast you sky-high, turning every ramp into a launchpad for mid-air madness.

- **Mechanics:**  
  - **Heat Meter:** Stay in the hot zones too long and you’ll fry—seek out sled-mounted **cooling tanks**.  
  - **Ash Clouds:** Sudden visibility loss forces quick reaction sledding.  
  - **Geothermal Geysers:** Act as **natural trick boosters**, launching you for combos and big air.  
  - **Vulcanic Wind Corridors:** Let you chain even more tricks for **massive multipliers**.  

- **Special Feature:**  
  - **Style Zones:** Naturally occurring lava halfpipes and vent blasts set up prime trick sequences.  
  - **Eruption Events:** Mid-run eruptions can end your run early at best, and rack up a significant rescue bill at the worst.

- **Power-Up:**  
  🔥 **Heat Shielding Sled Coating**  
  *Required to enter. Shields your sled from burn damage and slightly improves glide friction across all terrain. Upgrading it will keep you from melting longer.*

- **Jake’s Comment:**  
  > “You only *think* you’ve hit max airtime—wait till the mountain spits fire under you.”

---

## 🔄 Infinite Upgrades with Soft Caps

**Expanding Progression Without Breaking Balance**

Currently, upgrades in **SledHEAD** have **hard caps**, limiting how many times they can be purchased. While this provides structure, it **restricts long-term progression** and prevents **emergent playstyles** from evolving over multiple runs. To keep **each run fresh and engaging**, we're shifting to an **infinite upgrade system** with **diminishing returns** beyond a **soft cap** for
**Personal Upgrades**. **Mountain Upgrades** will
need to be rebought for each new mountain purchased, and
may or may not be infinite as appropriate to the upgrade.

### 🎯 Proposed Solution

-   **All upgrades become infinitely upgradable.**
-   Each upgrade **retains its effectiveness early on** but **scales down gradually** beyond a set level.
-   **Soft caps vary** depending on the upgrade type:
    -   **Speed upgrades** could start diminishing at **Level 10**.
    -   **Trick bonuses** could scale freely until **Level 20** before slowing down.
-   **Mathematical balancing** ensures that upgrades remain **meaningful** but **don't become overpowered**.

### 📊 Scaling Formula: Exponential & Logarithmic Decay

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

### ✅ Benefits of Infinite Upgrades with Soft Caps
----------------------------------------------

✔ **Keeps long-term progression engaging** -- No artificial "max level" bottleneck.\
✔ **Encourages specialized strategies** -- Players can **focus on speed, tricks, or economy-based builds**.\
✔ **Prevents upgrade obsolescence** -- Players **always have something meaningful to invest in**.\
✔ **Maintains challenge balance** -- Runs become **progressively stronger**, but not infinitely easy.

### 📌 Tasks & Implementation Plan

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

## 🚚 0 • Menlo Magician **EVison** Prime Mover

| Spec                          | Detail                                                                                                                                     | Little Extras                                                                                                    |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Drive Train**               | Quad in‑hub motors, instant torque for steep haul roads.                                                                                   | Regenerative braking dumps juice back into the pack on the ride down the pass—Maxi loves watchin’ the kWh climb. |
| **Range‑Extender**            | 4‑cyl. hyper‑efficient diesel (runs on used fryer oil or #2).                                                                              | Aria skims the spent oil from her fry‑pot, Maxi filters it, *boom* free top‑ups.                                 |
| **Dual Driver Cabin**         | Left seat: Maxi (programmable pedals). Right seat: **Bruin the Bear**—reinforced paw‑grips, high‑torque steer servo, bear‑sized seat belt. | Dash plaque reads *“BJ & The Bear II – No Monkey Business!”*                                                     |
| **Cab‑to‑Coach Walk‑Through** | Pressure‑sealed door to Trailer 1.                                                                                                         | Means Carrie can sip cocoa, Bruin can keep one paw on the wheel, and nobody freezes.                             |
| **Exterior Flair**            | *DON’T DEADHEAD, SLEDHEAD!* in bold Yellow on Snow Blue.                                                                                   | Back‑lit letters double as hazard panel at night.                                                                |

---

### 🏡 1 • TRAILER 1 – “The Lodge Car”

#### ▼ Lower Deck – **Front‑of‑House, Kitchen, Cozy Lounge**

| Zone                       | Fixtures                                                                                                                                                                                                                                         | Daily Life Snippets                                                                                                                                                                        |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Covered Side Porch**     | Pop‑out stairs + under‑step boot heaters.                                                                                                                                                                                                        | Guests stamp snow, hang parkas, then shuffle inside.                                                                                                                                       |
| **Check‑in / Service Bar** | Polished maple slab, six log stools, two POS tablets, chalkboard specials.                                                                                                                                                                       | Aria spins to plate, spins back to checkin & chat—zero steps.                                                                                                                              |
| **Aria’s Open Kitchen**    | Behind the bar, face‑to‑face with customers. Double oven, 6‑burner propane top, flat‑top griddle, sous‑vide circulator, walk‑in pantry, chest freezer for wontons & pizza dough. **Exterior Pass‑Through Window** slides open street‑food style. | – *Inside service*: stools & dining nook.– *Outside service*: pass‑through window for slope‑side cocoa, slices, and soup. Aria can whip cocoa, shout “Hiya Cuz!” and never move her boots. |
| **Dining Nook**            | Two 4‑tops plus drop‑leaf extenders → seats 12 in a pinch. Hidden storage benches for extra cutlery & board games.                                                                                                                               | Weekly “Cocoa & Cryptids” trivia night hosted by Darlene.                                                                                                                                  |
| **Lobby Lounge**           | Picture window framing the slope. Four deep chairs, rugged coffee‑table made from retired sled rails, roaring pellet stove, magazine rack. **Bruin's Bear Chair** recliner (Kevlar fabric, seatbelt) next to the stove.                          | Bruin snoozes here when not driving or lumberin’ about. Carrie will often sit nearby when she & Bruin aren't out with the other bears.                                                     |
| **Access Tunnel**          | Accordion‑sealed hallway through articulation to Trailer 2.                                                                                                                                                                                      | Sheltered and out of the weather.                                                                                                                                                          |

#### ▲ Upper Deck – **Crew Quarters & Bath**

* **Three Triple‑Bunk Rooms** (9 pods):

  * Individual reading lights, USB‑C ports, privacy curtain, quilted wool blankets from Vermont sheep.
  * Lockers under the lower bunk; middle bunk folds to couch day‑mode.
* **Shared Bath Module**: on‑demand hot‑water shower, vacuum‑flush toilet, fold‑down sink, grey‑water recycler feeds greenhouse radiator coils.
* **Fire‑Pole & Stair**: drop down to the bar for midnight cocoa raids; stair for normal folk.

---

### 🔧 2 • TRAILER 2 – “Ops & Shops Car”

#### ▲ Upper Deck – **Labs & Private Cabins**

| Half                               | Occupant | Details                                                                                                                                                                                                                                                                                                                                                |
| :--------------------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forward 50 % – Maxi’s Tech‑Lab** | Maxi     | • Triple‑screen dev rig, solder station, Li‑Po charge bank, 3‑D printer tower (PLA, PETG, ABS, conductive).• RC‑sled telemetry wall, drone parts drawers, spare flight‑controllers.• Murphy‑style bunk folds out of wall; LED star‑ceiling for code‑in‑bed vibes.• Secret sub‑floor prototypes labelled “Amphibius-Westinghouse Mk I” in sticky‑notes. |
| **Rear 50 % – Marbee’s Cabin**     | Marbee   | • Full‑size bed, honey‑pine bookshelves stuffed with books.• Compact half‑bath (sink + toilet).• Magnetic whiteboard covered in sled  sketches and rushed scribbles.                                                                                                                                                                                   |

#### ▼ Lower Deck – **Retail & Workshop**

| Zone                                             | Crew         | Fixtures                                                                                                                                                                                                                                | Fun Bits                                                                            |
| :----------------------------------------------- | :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Minnie’s Gift & Gear Shop** (fore half)        | Minnie       | • Counter with brass bell, antique cash drawer.• **Legendary‑Lens Spinner Rack** (lit acrylic ).• **“Everything” Catch‑All Rack** (hex‑bin wall).• Pegboard for Panttocks, rods, panning pans.• Deep Diggin’ pick displays under glass. | Minnie’s motto over the door: *“If it shines, digs, or spins—you’ll find it here.”* |
| **Jake & Steve’s Sled/Carpentry Bay** (aft half) | Jake & Steve | • Belt‑driven lathe, TIG welder, compound miter saw, overhead chain hoist.• Sled‑runner clamp‑jig doubles as beam press for mountain construction projects.• Wax melter & buff wheel for quick race tunes.                              | Smells like maple, axle grease, and campfire coffee.                                |

*Large roll‑up curb-side door = sleds roll right onto snow OR 12‑ft lumber slides straight inside.*

---

### 🐝 3 • Pete’s Hinged‑Glass **Micro‑Mountain Apiary** (Tail‑Module)

| Element                          | Detail                                                                                                                              |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Hive Stacks**                  | Two vertical rack frames, colour‑coded Langstroth boxes.                                                                            |
| **Glass Dome**                   | Tempered, UV‑treated; hinges on top, latches on bottom; pneumatic struts hold it open like a giant terrarium door.                  |
| **Interior Climate Fans**        | Kick on when glass is closed to keep temps steady.                                                                                  |
| **Fold Down Mini‑Terrain Table** | Bonsai evergreens, Micro Mountain, snow‑foam so Pete can teach bee‑lining demos, flowered vines reach up the back around bee boxes. |

Dome stays shut in transit / storms, swings open when Pete wants to check frames or harvest honeycomb for wax lens polish.

---

### 🦅 4 • Roof Deck – “The Crow’s Nest” (continuous)

| Zone                    | Resident      | Kit & Purpose                                                                                                                                               |
| :---------------------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rescue Perch** (fore) | Stratton      | Swivel captain’s chair, gyro‑binoculars, MURS & GMRS rescue radios, avalanche beacon repeater, quick‑drop ladder down to his patrol sled hung on side rack. |
| **Lens & Scope Bay**    | Darlene       | 500 mm tele‑lens on motorized mount, wildlife cam array, weatherproof photo‑server box streaming RAW files to the lab below, fold‑out dark‑cloth hood.      |
| **Launch Pad**          | Maxi & Carrie | Yellow circle with deck plates, four drone charging nests, retractable kite reels (lock when truck’s moving).                                               |
| **Solar‑Wind Farm**     | –             | 48 m² bifacial PV carpet, two micro wind turbines on telescopic masts; feed 400‑V DC bus via MPPT charger.                                                  |

Safety rail around entire deck, heated ladder to stairwell, hot tub.

---

### 🚲 5 • Side Racks & Exterior Storage

* **Sled Racks:** 10 sleds nose‑down, hinged arms fold into travel slots.
* **Utility Lockers (skirt‑level):** diesel genset, battery modules, spare runner bundles, avalanche probes, collapsible stretcher, kite spars, Vermunch Refill Dispenser provisioned directly below the kitchen.
* **Tow‑Eye Hook:** fits ski‑tow,or flatbed.

---

### 🏃‍♂️ 6 • Daily Loop – Expanded

1. **Morning Open:**

   * Bruin pads down from the lounge chair to the driver seat; Maxi boots the EVison Prime, runs diagnostics.
   * Aria fires stoves; smell of maple‑fudge cocoa wafts down both trailers.
   * Solar array tilts toward sunrise.

2. **Guest Arrival:**

   * Visitors climb heated stairs, stomp boots.
   * Aria greets ’em at bar, takes names/checkin, dishes tasty grub.
   * Pass‑through window pops open so slope‑side folks can grab warm food too.

3. **Gearing Up:**

   * Guests stroll articulation tunnel → Minnie’s shop (lenses, Panttocks) → Jake & Steve’s bay for wax tune.
   * Grab sled from side rack; drop down the rear ramp or nearest snow stair.

4. **Slope Time:**

   * Stratton scans ridgeline; Darlene snaps wildlife & Marbee if he's out tricking.
   * Maxi tests new RC controller on drone from roof pad; Carrie launches a kite to check wind aloft.
   * Pete opens dome, hums to his bees, maybe harvests a frame.

5. **Rescue Flow:**

   * Rescue beacon pings → Stratton radios *“Dispatch, I’m rolling.”*
   * He slides down ladder, hops into patrol sled hung on side rack, zips off.
   * If it’s textbook, he handles solo. **Only** if he’s swamped does he radio Marbee for a player‑quest assist.

6. **Evening Wind‑Down:**

   * Darlene live‑casts her best cryptid shot to the lobby holo; trivia night commences.
   * Aria plates pizzas, wontons, maple‑BBQ wings; full menu always available inside.
   * Vermunch machines on‑mountain keep humming the limited menu (warm and cold drinks, pickles (Sweet and Sour both), personal 3‑cheese cowboy candy pizzas).
   * Crew crashes: Maxi folds down her murphy bunk in the lab; Marbee to his cabin; everyone else climbs to triple‑bunks; Bruin curls in the Bear Chair.

7. **Night Mode:**

   * PV carpet folds flat; wind masts lock.
   * Deck lights on warm amber; bee‑dome fans maintain hive temp.
   * Jake & Steve might pull a late weld—soft flashes visible through workshop skylight.

---

This comprehensive roadmap encapsulates all planned features and mechanics, clearly outlines the development trajectory, and integrates your newly defined gameplay mechanic. Use this as your foundational documentation moving forward to guide development clearly and effectively.
