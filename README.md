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

**Jump-Based Tricks:**
1. **Sled Flip** – Full forward/backflip.  
2. **Helicopter Spin** – Rapid horizontal spin.  
3. **Corkscrew** – Barrel roll-style spin.  
4. **Ghost Rider** – Throw the sled and catch it mid-air.  
5. **Toboggan Toss** – Jump off, spin, land back on sled.  
6. **Superman** – Grab sled with one hand, stretch arms out.  
7. **Tailwhip** – Kick the sled to spin underneath.  
8. **Board Stall** – Land on a ledge before dropping back onto snow.  
9. **Sky Dive** – Free-fall, then grab sled before landing.  

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
