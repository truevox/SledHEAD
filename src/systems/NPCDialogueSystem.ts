import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

// NPC data types
export interface DialogueNode {
  text: string;
  speaker: string;
  choices?: DialogueChoice[];
  nextNode?: string;
  condition?: (state: any) => boolean;
  onComplete?: (state: any) => void;
}

export interface DialogueChoice {
  text: string;
  nextNode: string;
  condition?: (state: any) => boolean;
}

export interface NPCData {
  name: string;
  role: string;
  portrait: string; // Emoji or color
  dialogueTrees: { [key: string]: DialogueNode };
  greetingNode: string;
  shopNode?: string;
}

// All NPCs in the game
export const NPCS: { [key: string]: NPCData } = {
  grandpa: {
    name: 'Grandpa',
    role: 'Mentor & Guide',
    portrait: '👴',
    greetingNode: 'greeting',
    dialogueTrees: {
      greeting: {
        text: "Well, well! Look who's climbin' higher every day. You remind me of myself at your age... except I never bought a whole mountain!",
        speaker: 'Grandpa',
        choices: [
          { text: 'Got any wisdom for me, Grandpa?', nextNode: 'wisdom' },
          { text: 'How were things in your day?', nextNode: 'nostalgia' },
          { text: 'Thanks, Grandpa!', nextNode: 'goodbye' },
        ],
      },
      wisdom: {
        text: "You're strong, kid! But ya gotta pace yourself—harder climbs mean ya gotta rest up after! Remember, the snow's always whiter above you, and dirtier below. Keep your eyes on the peak, but never forget to enjoy the ride.",
        speaker: 'Grandpa',
        nextNode: 'greeting',
      },
      nostalgia: {
        text: "Ahh, y'know, I used to be the best sledder on this hill... but these ol' legs don't have the stamina they used to! Every carve, every crash, every laugh—those were the days. Now it's your turn to make memories.",
        speaker: 'Grandpa',
        nextNode: 'greeting',
      },
      goodbye: {
        text: "One day, you'll take on bigger mountains than this… but no matter how high you go, never forget the joy of the ride. Now go on, make me proud!",
        speaker: 'Grandpa',
      },
    },
  },

  jake: {
    name: 'Jake',
    role: 'Trick Master & Builder',
    portrait: '🏂',
    greetingNode: 'greeting',
    shopNode: 'shop',
    dialogueTrees: {
      greeting: {
        text: "Hey. You're gettin' better. I can tell by how you land.",
        speaker: 'Jake',
        choices: [
          { text: 'Teach me more tricks?', nextNode: 'tricks' },
          { text: 'What\'s your philosophy on sledding?', nextNode: 'philosophy' },
          { text: 'See you around.', nextNode: 'goodbye' },
        ],
      },
      tricks: {
        text: "Style isn't flash. It's control without shouting. Every trick begins before you leave the ground. Every landing finishes long after you hit it. Master the basics first—the fancy stuff comes when you stop trying.",
        speaker: 'Jake',
        nextNode: 'greeting',
      },
      philosophy: {
        text: "Balance is a kind of listening. What you build reflects what you believe. So build things that last. You think sleddin's about winnin'? Nah. It's about wakin'. Every carve, every crash, every laugh—it's code. You were speakin' the language of the universe, and it finally heard ya.",
        speaker: 'Jake',
        nextNode: 'greeting',
      },
      goodbye: {
        text: "Dream bigger. Build stronger.",
        speaker: 'Jake',
      },
    },
  },

  steve: {
    name: 'Sled Tech Steve',
    role: 'Mechanic & Engineer',
    portrait: '🔧',
    greetingNode: 'greeting',
    shopNode: 'shop',
    dialogueTrees: {
      greeting: {
        text: "What'd ya do, run into a bear during a race? I can fix it... for a price. Every sled that rolls through here tells a story—yours is gettin' interesting.",
        speaker: 'Steve',
        choices: [
          { text: 'What can you upgrade?', nextNode: 'shop' },
          { text: 'Any advice on my sled?', nextNode: 'advice' },
          { text: 'Just browsing.', nextNode: 'goodbye' },
        ],
      },
      advice: {
        text: "Think of stamina like cash, and weight like taxes. Spend wisely, friend. Don't ride a sled you don't love. Don't climb a hill you ain't ready for. Don't bolt on a turbo tank unless you know how to land it.",
        speaker: 'Steve',
        nextNode: 'greeting',
      },
      shop: {
        text: "You're not just building a sled. You're buildin' the **reason** you get to the summit today. Every run's a test. Every build's a blueprint of your brain. When the sled's right, you won't even feel the climb. Just the hum.",
        speaker: 'Steve',
        choices: [
          { text: 'Show me what you\'ve got.', nextNode: 'shopMenu' },
          { text: 'Not right now.', nextNode: 'greeting' },
        ],
      },
      shopMenu: {
        text: "Here's what I've got in stock. One sled won't climb every mountain, but every mountain leaves behind the parts you'll need.",
        speaker: 'Steve',
        // This would trigger the actual shop UI
        nextNode: 'greeting',
      },
      goodbye: {
        text: "Come back when you've got somethin' that needs fixin'. Or improvin'. There's always room for improvin'.",
        speaker: 'Steve',
      },
    },
  },

  minnie: {
    name: 'Minnie',
    role: 'Convenience Store Owner',
    portrait: '👧',
    greetingNode: 'greeting',
    shopNode: 'shop',
    dialogueTrees: {
      greeting: {
        text: "Hey there! Need supplies for the mountain? I've got everything from tools to lenses. Been runnin' this place since I was knee-high to a snowdrift.",
        speaker: 'Minnie',
        choices: [
          { text: 'What do you recommend?', nextNode: 'advice' },
          { text: 'Show me your wares.', nextNode: 'shop' },
          { text: 'Just looking around.', nextNode: 'goodbye' },
        ],
      },
      advice: {
        text: "If it looks like junk, dig anyway. This mountain hides her best stuff under the worst rocks. The river don't care what you're hopin' to find—but it'll show you what you need. I don't sell luck. But I do sell the things luck likes to hang around.",
        speaker: 'Minnie',
        nextNode: 'greeting',
      },
      shop: {
        text: "Folks come lookin' for gold. They leave with stories. Guess which one I trade in? You learn the mountain by listenin'. And diggin'. And then listenin' again when it buries your gear.",
        speaker: 'Minnie',
        choices: [
          { text: 'Show me the legendary lenses.', nextNode: 'lenses' },
          { text: 'What about tools?', nextNode: 'tools' },
          { text: 'Maybe later.', nextNode: 'greeting' },
        ],
      },
      lenses: {
        text: "Ah, the legendary lenses! Each one shows you somethin' different about this mountain. Choose wisely—you can only wear one at a time.",
        speaker: 'Minnie',
        nextNode: 'shop',
      },
      tools: {
        text: "Your Panttock is your best friend out here. Dig, pick, pan—it does it all. And I've got upgrades that'll make it sing.",
        speaker: 'Minnie',
        nextNode: 'shop',
      },
      goodbye: {
        text: "Come back anytime. Mountain's got more secrets than I've got shelves.",
        speaker: 'Minnie',
      },
    },
  },

  pete: {
    name: 'Encyclopedia Pete',
    role: 'Beekeeper & Logger',
    portrait: '🐝',
    greetingNode: 'greeting',
    shopNode: 'shop',
    dialogueTrees: {
      greeting: {
        text: "Bees don't bother nobody who minds their manners. Same goes for trees, mostly. What brings ya to my neck of the woods?",
        speaker: 'Pete',
        choices: [
          { text: 'Tell me about beekeeping.', nextNode: 'beekeeping' },
          { text: 'How do I fell trees safely?', nextNode: 'logging' },
          { text: 'What gear do you have?', nextNode: 'shop' },
          { text: 'Just saying hi.', nextNode: 'goodbye' },
        ],
      },
      beekeeping: {
        text: "You wanna learn somethin' out here, keep yer mouth shut and yer eyes open. Trees'll tell ya when they're ready. Bees too. Just gotta be listenin'. Start with a smoker and a bee box—rest comes natural if you're patient.",
        speaker: 'Pete',
        nextNode: 'greeting',
      },
      logging: {
        text: "It doesn't take me 8 hours to do a full day of work. Go on - give it a try if ya wanna. How long could it take? But seriously—respect the tree. One clean cut, mind the fall zone, and always have an exit path.",
        speaker: 'Pete',
        nextNode: 'greeting',
      },
      shop: {
        text: "I've got axes for loggin', smokers for bees, and hive boxes for when you find a wild colony. All handmade, all tested on this very mountain.",
        speaker: 'Pete',
        choices: [
          { text: 'I need beekeeping supplies.', nextNode: 'beeGear' },
          { text: 'Show me your axes.', nextNode: 'axes' },
          { text: 'Not today.', nextNode: 'greeting' },
        ],
      },
      beeGear: {
        text: "Smokers'll calm 'em down, bee boxes help you track 'em, and hive boxes let you relocate colonies. Treat 'em right and they'll treat you right back.",
        speaker: 'Pete',
        nextNode: 'shop',
      },
      axes: {
        text: "Each axe is weighted different. Find one that feels right in your hands. Sharper ain't always better—it's the swing that counts.",
        speaker: 'Pete',
        nextNode: 'shop',
      },
      goodbye: {
        text: "Mind the bees. Mind the trees. They were here before us, and they'll be here after.",
        speaker: 'Pete',
      },
    },
  },

  aria: {
    name: 'Aria',
    role: 'Hotel Manager & Chef',
    portrait: '👩‍🍳',
    greetingNode: 'greeting',
    shopNode: 'shop',
    dialogueTrees: {
      greeting: {
        text: "Hiya, Cuz! Hope you're hungry—big days need big flavors. The hotel's been hoppin' and the restaurant's slammin'. How can I help ya?",
        speaker: 'Aria',
        choices: [
          { text: 'What\'s cooking today?', nextNode: 'food' },
          { text: 'Tell me about the AVMs.', nextNode: 'avms' },
          { text: 'Got any sap processing?', nextNode: 'sap' },
          { text: 'Just visiting!', nextNode: 'goodbye' },
        ],
      },
      food: {
        text: "Can't land a triple cork with an empty belly! I've got everything from hot coffee to those legendary jalapeño wontons. Each dish comes with a boost—warmth, stamina, speed, you name it.",
        speaker: 'Aria',
        nextNode: 'greeting',
      },
      avms: {
        text: "Auto-Vermunch Machines! Once unlocked, you can place 'em across the mountain. I'll give you raw ingredient packs to restock 'em. They do the cookin' themselves—don't ask me how, even the Tinkerer can't figure it out.",
        speaker: 'Aria',
        nextNode: 'greeting',
      },
      sap: {
        text: "Yeah, the sap takes a while to thicken up, but I've got a big solar-oven. Bring me what you collect and I'll turn it into premium syrup. Different trees, different flavors—gets real interesting on the exotic mountains.",
        speaker: 'Aria',
        nextNode: 'greeting',
      },
      shop: {
        text: "You handle the tricks—I'll keep the cocoa flowin'. Hospitality is just high-speed logistics in an apron. The secret to hotel management? Don't stop movin', 'til everyone's smilin', sleepin' or fed.",
        speaker: 'Aria',
        choices: [
          { text: 'Show me the food buffs.', nextNode: 'foodMenu' },
          { text: 'I want to unlock an AVM.', nextNode: 'avmUnlock' },
          { text: 'Maybe later, Cuz.', nextNode: 'greeting' },
        ],
      },
      foodMenu: {
        text: "Here's today's menu! Everything's made fresh, and I mean **fresh**. Each item gives ya different boosts for the mountain.",
        speaker: 'Aria',
        nextNode: 'shop',
      },
      avmUnlock: {
        text: "Great! Each AVM placement costs a bit, but they'll pay for themselves in convenience. Just remember to keep 'em stocked with ingredient packs!",
        speaker: 'Aria',
        nextNode: 'shop',
      },
      goodbye: {
        text: "Sometimes all three! Come back anytime, Cuz. Door's always open, and the kitchen's always hot!",
        speaker: 'Aria',
      },
    },
  },

  jay: {
    name: 'Jay',
    role: 'Lift Operator & Kite Enthusiast',
    portrait: '🪁',
    greetingNode: 'greeting',
    shopNode: 'shop',
    dialogueTrees: {
      greeting: {
        text: "Wind's just music without the intent, man. You feel it up there? That's the mountain singin'.",
        speaker: 'Jay',
        choices: [
          { text: 'Tell me about kites.', nextNode: 'kites' },
          { text: 'How do lifts work?', nextNode: 'lifts' },
          { text: 'What\'s your philosophy?', nextNode: 'philosophy' },
          { text: 'Catch you later.', nextNode: 'goodbye' },
        ],
      },
      kites: {
        text: "I always say... a kite's like a musician: some are meant to dance, some are meant to sing, and some wanna get higher. Every kite string's a melody waitin' to play itself—you just gotta be the hands.",
        speaker: 'Jay',
        nextNode: 'greeting',
      },
      lifts: {
        text: "Lifts'll get you uphill without burnin' all your stamina. Upgrade 'em and they go faster, carry more, even play better music. Yeah, I program the lift tunes myself.",
        speaker: 'Jay',
        nextNode: 'greeting',
      },
      philosophy: {
        text: "People say the mountain talks. Nah, man. It sings. Most folks chase the peaks. Me? I chase the air between 'em. I don't fall, I descend artistically.",
        speaker: 'Jay',
        nextNode: 'greeting',
      },
      shop: {
        text: "I've got kites for every condition—wind, storm, heat, even underwater. Each one changes how you ride the mountain.",
        speaker: 'Jay',
        choices: [
          { text: 'Show me the kites.', nextNode: 'kiteMenu' },
          { text: 'Tell me about lift passes.', nextNode: 'liftPass' },
          { text: 'Not right now.', nextNode: 'greeting' },
        ],
      },
      kiteMenu: {
        text: "Jay's First Kite is solid for beginners. But if you're ready to ride thermals like a pro, I've got specialty kites that'll blow your mind. Literally.",
        speaker: 'Jay',
        nextNode: 'shop',
      },
      liftPass: {
        text: "Season pass gets you unlimited rides. Worth every penny when you're grindin' for that perfect run.",
        speaker: 'Jay',
        nextNode: 'shop',
      },
      goodbye: {
        text: "Keep ridin' the wind, friend. It knows where you need to go.",
        speaker: 'Jay',
      },
    },
  },
};

// Dialogue UI Manager
export class NPCDialogueSystem {
  private scene: Phaser.Scene;
  private gameStateManager: GameStateManager;

  // UI Elements
  private dialogueBox?: Phaser.GameObjects.Container;
  private dialogueBg?: Phaser.GameObjects.Graphics;
  private portraitText?: Phaser.GameObjects.Text;
  private nameText?: Phaser.GameObjects.Text;
  private dialogueText?: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Container[] = [];

  // State
  private currentNPC?: NPCData;
  private currentNode?: DialogueNode;
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameStateManager = GameStateManager.getInstance();
  }

  /**
   * Start a dialogue with an NPC
   */
  startDialogue(npcKey: string, startNode?: string): void {
    const npc = NPCS[npcKey];
    if (!npc) {
      console.error(`NPC ${npcKey} not found`);
      return;
    }

    this.currentNPC = npc;
    this.isActive = true;

    // Start at greeting or specified node
    const nodeKey = startNode || npc.greetingNode;
    this.showNode(nodeKey);

    // Create UI
    this.createDialogueUI();
  }

  /**
   * Show a specific dialogue node
   */
  private showNode(nodeKey: string): void {
    if (!this.currentNPC) return;

    const node = this.currentNPC.dialogueTrees[nodeKey];
    if (!node) {
      console.error(`Node ${nodeKey} not found`);
      return;
    }

    // Check condition if present
    if (node.condition && !node.condition(this.gameStateManager.getState())) {
      // Skip to next node if condition not met
      if (node.nextNode) {
        this.showNode(node.nextNode);
      }
      return;
    }

    this.currentNode = node;
    this.updateDialogueUI();
  }

  /**
   * Create the dialogue UI
   */
  private createDialogueUI(): void {
    const { width, height } = this.scene.cameras.main;

    // Create container
    this.dialogueBox = this.scene.add.container(0, 0);
    this.dialogueBox.setDepth(10000);
    this.dialogueBox.setScrollFactor(0);

    // Background
    this.dialogueBg = this.scene.add.graphics();
    this.dialogueBg.fillStyle(0x2c3e50, 0.95);
    this.dialogueBg.fillRoundedRect(50, height - 250, width - 100, 200, 12);
    this.dialogueBg.lineStyle(3, 0x3498db, 1);
    this.dialogueBg.strokeRoundedRect(50, height - 250, width - 100, 200, 12);
    this.dialogueBox.add(this.dialogueBg);

    // Portrait (emoji)
    this.portraitText = this.scene.add.text(80, height - 230, '', {
      fontSize: '64px',
    });
    this.dialogueBox.add(this.portraitText);

    // NPC Name
    this.nameText = this.scene.add.text(170, height - 235, '', {
      fontSize: '24px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    });
    this.dialogueBox.add(this.nameText);

    // Role text
    const _roleText = this.scene.add.text(170, height - 205, '', {
      fontSize: '16px',
      color: '#95a5a6',
    });
    this.dialogueBox.add(_roleText);

    // Dialogue text
    this.dialogueText = this.scene.add.text(170, height - 175, '', {
      fontSize: '18px',
      color: '#ecf0f1',
      wordWrap: { width: width - 250 },
    });
    this.dialogueBox.add(this.dialogueText);

    // Update with current NPC data
    if (this.currentNPC) {
      this.portraitText.setText(this.currentNPC.portrait);
      this.nameText.setText(this.currentNPC.name);
      _roleText.setText(this.currentNPC.role);
    }
  }

  /**
   * Update dialogue UI with current node
   */
  private updateDialogueUI(): void {
    if (!this.currentNode || !this.dialogueText) return;

    // Update dialogue text
    this.dialogueText.setText(this.currentNode.text);

    // Clear old choice buttons
    this.choiceButtons.forEach(btn => btn.destroy());
    this.choiceButtons = [];

    // Create choice buttons if present
    if (this.currentNode.choices && this.currentNode.choices.length > 0) {
      const { height } = this.scene.cameras.main;
      const startY = height - 70;
      const buttonSpacing = 10;

      this.currentNode.choices.forEach((choice, index) => {
        // Check condition if present
        if (choice.condition && !choice.condition(this.gameStateManager.getState())) {
          return;
        }

        const buttonContainer = this.scene.add.container(0, 0);
        buttonContainer.setDepth(10001);
        buttonContainer.setScrollFactor(0);

        const buttonWidth = 300;
        const buttonHeight = 40;
        const buttonX = 170 + (index * (buttonWidth + buttonSpacing));
        const buttonY = startY;

        // Button background
        const buttonBg = this.scene.add.graphics();
        buttonBg.fillStyle(0x3498db, 1);
        buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
        buttonContainer.add(buttonBg);

        // Button text
        const buttonText = this.scene.add.text(
          buttonX + buttonWidth / 2,
          buttonY + buttonHeight / 2,
          choice.text,
          {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: buttonWidth - 20 },
          }
        ).setOrigin(0.5);
        buttonContainer.add(buttonText);

        // Make interactive
        const zone = this.scene.add.zone(
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight
        ).setOrigin(0, 0);
        zone.setInteractive({ useHandCursor: true });
        zone.setScrollFactor(0);
        zone.setDepth(10002);

        zone.on('pointerover', () => {
          buttonBg.clear();
          buttonBg.fillStyle(0x2980b9, 1);
          buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
        });

        zone.on('pointerout', () => {
          buttonBg.clear();
          buttonBg.fillStyle(0x3498db, 1);
          buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
        });

        zone.on('pointerdown', () => {
          this.handleChoice(choice);
        });

        buttonContainer.add(zone);
        this.choiceButtons.push(buttonContainer);

        if (this.dialogueBox) {
          this.dialogueBox.add(buttonContainer);
        }
      });
    } else if (this.currentNode.nextNode) {
      // Auto-continue button
      this.createContinueButton();
    } else {
      // End dialogue button
      this.createCloseButton();
    }
  }

  /**
   * Handle player choice selection
   */
  private handleChoice(choice: DialogueChoice): void {
    // Execute onComplete callback if present
    if (this.currentNode?.onComplete) {
      this.currentNode.onComplete(this.gameStateManager.getState());
    }

    // Show next node
    this.showNode(choice.nextNode);
  }

  /**
   * Create continue button for auto-progression
   */
  private createContinueButton(): void {
    if (!this.currentNode?.nextNode) return;

    const { width, height } = this.scene.cameras.main;
    const buttonContainer = this.scene.add.container(0, 0);
    buttonContainer.setDepth(10001);
    buttonContainer.setScrollFactor(0);

    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonX = width - buttonWidth - 70;
    const buttonY = height - 70;

    const buttonBg = this.scene.add.graphics();
    buttonBg.fillStyle(0x27ae60, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    buttonContainer.add(buttonBg);

    const buttonText = this.scene.add.text(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      'Continue',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5);
    buttonContainer.add(buttonText);

    const zone = this.scene.add.zone(buttonX, buttonY, buttonWidth, buttonHeight).setOrigin(0, 0);
    zone.setInteractive({ useHandCursor: true });
    zone.setScrollFactor(0);
    zone.setDepth(10002);

    zone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x2ecc71, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    });

    zone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x27ae60, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    });

    zone.on('pointerdown', () => {
      if (this.currentNode?.nextNode) {
        this.showNode(this.currentNode.nextNode);
      }
    });

    buttonContainer.add(zone);
    this.choiceButtons.push(buttonContainer);

    if (this.dialogueBox) {
      this.dialogueBox.add(buttonContainer);
    }
  }

  /**
   * Create close button to end dialogue
   */
  private createCloseButton(): void {
    const { width, height } = this.scene.cameras.main;
    const buttonContainer = this.scene.add.container(0, 0);
    buttonContainer.setDepth(10001);
    buttonContainer.setScrollFactor(0);

    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonX = width - buttonWidth - 70;
    const buttonY = height - 70;

    const buttonBg = this.scene.add.graphics();
    buttonBg.fillStyle(0xe74c3c, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    buttonContainer.add(buttonBg);

    const buttonText = this.scene.add.text(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      'Goodbye',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5);
    buttonContainer.add(buttonText);

    const zone = this.scene.add.zone(buttonX, buttonY, buttonWidth, buttonHeight).setOrigin(0, 0);
    zone.setInteractive({ useHandCursor: true });
    zone.setScrollFactor(0);
    zone.setDepth(10002);

    zone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0xc0392b, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    });

    zone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0xe74c3c, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 6);
    });

    zone.on('pointerdown', () => {
      this.endDialogue();
    });

    buttonContainer.add(zone);
    this.choiceButtons.push(buttonContainer);

    if (this.dialogueBox) {
      this.dialogueBox.add(buttonContainer);
    }
  }

  /**
   * End the current dialogue
   */
  endDialogue(): void {
    // Execute onComplete callback if present
    if (this.currentNode?.onComplete) {
      this.currentNode.onComplete(this.gameStateManager.getState());
    }

    this.isActive = false;
    this.currentNPC = undefined;
    this.currentNode = undefined;

    // Destroy UI
    this.choiceButtons.forEach(btn => btn.destroy());
    this.choiceButtons = [];

    if (this.dialogueBox) {
      this.dialogueBox.destroy();
      this.dialogueBox = undefined;
    }
  }

  /**
   * Check if dialogue is active
   */
  isDialogueActive(): boolean {
    return this.isActive;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.endDialogue();
  }
}
