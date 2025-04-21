// js/upgradeData.js
export const upgradeCategories = [
    {
      name: "Personal Upgrades",
      type: "player",
      upgrades: [
        {
          key: "rocketSurgery",
          label: "Rocket Surgery",
          desc: "Boosts top speed & acceleration for faster downhill runs.",
          // Infinite with soft cap: Diminishing returns after level 15
          softCap: 15, // Level after which scalingFactor is reduced
          scalingType: "sqrt", // Use sqrt for speed/acceleration
          scalingFactor: 0.25, // Each level adds less after soft cap
          baseValue: 1.0, // Base multiplier
          icon: "🚀"
        },
        {
          key: "optimalOptics",
          label: "Optimal Optics",
          desc: "Frees focus & boosts fan engagement for easier weaving.",
          // Infinite with soft cap: Diminishing returns after level 20
          softCap: 20, // Level after which scaling slows
          scalingType: "sqrt",
          scalingFactor: 0.15,
          baseValue: 1.0,
          icon: "📸"
        },
        {
          key: "sledDurability",
          label: "Sled Durability",
          desc: "Reinforce your sled to withstand bigger impacts.",
          // Infinite with soft cap: Diminishing returns after level 30
          softCap: 30,
          scalingType: "log",
          scalingFactor: 0.08,
          baseValue: 1.0,

          icon: "🛷"
        },
        {
          key: "fancierFootwear",
          label: "Fancier Footwear",
          desc: "Less time climbing, more time sledding.",
          // Infinite with soft cap: Diminishing returns after level 25
          softCap: 25,
          scalingType: "log",
          scalingFactor: 0.12,
          baseValue: 1.0,

          icon: "👢"
        },
        {
          key: "grapplingAnchor",
          label: "Grappling Anchor",
          desc: "Hook onto terrain to swing into tricky spots.",
          max: 0,
          icon: "🪝"
        },
        {
          key: "attendLegDay",
          label: "Attend Leg Day",
          desc: "Increase your max stamina for longer uphill pushes.",
          softCap: 20,
          scalingType: "log",
          scalingFactor: 0.18,
          baseValue: 1.0,
          max: 0,
          icon: "🏋️"
        },
        {
          key: "shortcutAwareness",
          label: "Shortcut Awareness",
          desc: "Reveal hidden shortcuts & groomed trails.",
          max: 0,
          icon: "🗺️"
        },
        {
          key: "crowdHypeman",
          label: "Crowd Hypeman",
          desc: "Perform tricks near fans for boosts.",
          max: 0,
          icon: "📣"
        },
        {
          key: "crowdWeaver",
          label: "Crowd Weaver",
          desc: "Crowds move aside more often.",
          max: 0,
          icon: "🧍‍♂️"
        },
        {
          key: "weatherWarrior",
          label: "Weather Warrior",
          desc: "Storms & blizzards barely slow you down.",
          max: 0,
          icon: "🌨️"
        }
      ]
    },
    {
      name: "Mountain Upgrades",
      type: "mountain",
      upgrades: [
        {
          key: "skiLifts",
          label: "High-Speed Ski Lift Expansion",
          desc: "Ride lifts faster & attract more visitors.",
          max: 0,
          icon: "🎿"
        },
        {
          key: "snowmobileRentals",
          label: "Snowmobile Rentals",
          desc: "Rent them out or ride them yourself.",
          max: 0,
          icon: "🏍️"
        },
        {
          key: "eateries",
          label: "Eateries & Snack Bars",
          desc: "Restore stamina and make money.",
          max: 0,
          icon: "🍔"
        },
        {
          key: "groomedTrails",
          label: "Groomed Trails",
          desc: "Smoothed paths with boosty sections.",
          max: 0,
          icon: "🥾"
        },
        {
          key: "firstAidStations",
          label: "Safety & First-Aid Stations",
          desc: "Heal and reduce collision penalties.",
          max: 0,
          icon: "⛑️"
        },
        {
          key: "scenicOverlooks",
          label: "Scenic Overlook Platforms",
          desc: "Lure tourists or use as shortcuts.",
          max: 0,
          icon: "📷"
        },
        {
          key: "advertisingRamps",
          label: "Advertising Ramp-Billboards",
          desc: "Sponsor revenue and epic trick ramps.",
          max: 0,
          icon: "📢"
        },
        {
          key: "resortLodges",
          label: "Resort Amenities & Lodges",
          desc: "Start from fancy remote lodges.",
          max: 0,
          icon: "🏨"
        },
        {
          key: "nightLighting",
          label: "Night Lighting Upgrades",
          desc: "Unlock night sledding.",
          max: 0,
          icon: "🌙"
        },
        {
          key: "weatherControl",
          label: "Weather Control Systems",
          desc: "Control the challenge for higher rewards.",
          max: 0,
          icon: "🌦️"
        }
      ]
    }
  ];
  