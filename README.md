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
