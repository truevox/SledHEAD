# SledHEAD Game Controls

## 🎯 Game Overview

SledHEAD is an **arcade-style sledding game** where you play as an **aspiring sledding champion & content creator** who has purchased an entire procedurally generated mountain. Your goal is to master the mountain through optimized sled runs, perform spectacular aerial tricks, photograph elusive wildlife, and earn money to upgrade your equipment and pay off your mountain loan.

The game consists of three distinct phases:

1. **⬆️ Uphill/Climbing Phase** - Navigate uphill to find the perfect starting position, manage your stamina, and photograph wildlife
2. **⬇️ Downhill/Sledding Phase** - Race down the mountain, performing tricks and avoiding obstacles
3. **🏠 Management Phase** - Spend your earnings on upgrades for your equipment and mountain infrastructure

---

## 🎮 Core Controls

### ⬆️ Uphill/Climbing Phase Controls

| Input | Action |
|-------|--------|
| **W/A/S/D** | Move the player up/left/down/right across the mountain |
| **Arrow Keys ↑↓←→** | Adjust camera angle and altitude line for photography |
| **Spacebar** | Take a photograph when an animal is in view & the altitude line is rapidly flashing|
| **E** | [Debug] Manually spawn an animal for testing |

During the uphill phase, you'll:
- Navigate the mountain terrain to find optimal starting points
- Manage your stamina (which depletes while climbing)
- Photograph wildlife to earn additional money
- Look for shortcuts and strategic positions for your downhill run

### ⬇️ Downhill/Sledding Phase Controls

| Input | Action |
|-------|--------|
| **Arrow Keys ←→** | Steer your sled left or right |
| **Spacebar** | Initiate jumps |
| **Arrow Keys** (during jumps) | Perform tricks (specific combinations detailed below) |

During downhill sledding, you'll:
- Build momentum and navigate the fastest route down
- Avoid obstacles like rocks, trees, and tourists
- Find and hit jumps to perform tricks
- Chain tricks together for bonus rewards

### 🏠 Management (House & Upgrades) Controls

Navigate menus using mouse/keyboard to:
- Purchase equipment upgrades
- Expand mountain infrastructure 
- Track your earnings and loan payments
- Check your current mountain seed (for sharing great mountains!)

---

## ✨ Trick System

Perform these trick combinations during jumps to earn additional cash:

| Trick Name | Input Combination | Description |
|------------|-------------------|-------------|
| **🚁⬅️ Helicopter Spin Left** | Left, Left | Spin horizontally like a helicopter twirling left |
| **🚁➡️ Helicopter Spin Right** | Right, Right | Spin horizontally like a helicopter twirling right |
| **🪂 Parachute** | Up, Down | Hold sled overhead to slow descent and extend air time |
| **🛑 Air Brake** | Up, Up | Use sled as air brake to slow lateral speed |

**Trick Tips:**
- Successfully landing tricks earns money
- Chain tricks for bonus multipliers
- Be careful - attempting tricks without enough air time can result in crashes!
- Re-hitting jumps can extend combo chains

---

## 📸 Photography System Controls

| Control | Action |
|---------|--------|
| **Arrow Keys ↑↓←→** | Adjust camera angle and altitude line |
| **Spacebar** | Take photo |

**Photography Tips:**
- Match the altitude line with the animal for maximum reward
- Animals that are moving yield higher rewards
- Each repeated photo of the same animal gives diminishing returns
- Upgrade your camera equipment to improve your photography income

---

## ⚙️ Advanced Mechanics

### Stamina Management
- Stamina depletes during uphill climbing
- Return to the house to end your day and restore stamina
- Each day you will be charged 0.5% of your loan
- If you run out of stamina, you are immediately returned to the house, and charged 100*(houseReEntry*0.1)
- Upgrade your equipment to reduce stamina consumption

### Collision Handling
- Collisions with obstacles slow you down and may cause crashes
- Upgrade sled durability to withstand more collisions
- Each crash reduces your potential earnings

### Upgrade System
Spend your earnings on:
- **Rocket Surgery**: Increases speed and jump dynamics
- **Optimal Optics**: Improves camera angle and accuracy
- **Sled Durability**: Increases collision tolerance
- **Fancier Footwear**: Improves uphill movement speed

### Win Condition
- Pay off your mountain loan to trigger the victory state
- Challenge yourself to complete this with fewer runs!