class HouseScene extends Phaser.Scene {
    constructor() {
        super({key: 'HouseScene'});
    }

    create() {
        // Get player reference
        this.player = this.game.player;
        
        // Create cabin interior background
        this.createBackground();
        
        // Create upgrade panels
        this.createUpgradePanels();
        
        // Create loan payment panel
        this.createLoanPanel();
        
        // Create exit button
        this.createExitButton();
        
        // Setup UI with current house phase
        this.events.emit('gamePhaseChanged', 'house');
    }
    
    createBackground() {
        // Create a cozy cabin interior background
        this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x362c1b
        ).setScrollFactor(0);
        
        // Add wooden floor pattern
        for (let x = 0; x < this.cameras.main.width; x += 100) {
            this.add.rectangle(
                x,
                this.cameras.main.height - 50,
                100,
                100,
                0x73553b
            ).setScrollFactor(0).setOrigin(0, 0);
        }
        
        // Add cabin title
        this.add.text(
            this.cameras.main.width / 2,
            50,
            'Mountain Cabin',
            { fontSize: '32px', fill: '#ffffff' }
        ).setOrigin(0.5).setScrollFactor(0);
    }
    
    createUpgradePanels() {
        const upgradeTypes = [
            {
                id: 'rocketSurgery',
                name: 'Rocket Surgery',
                description: 'Increase your max speed and acceleration',
                effect: '+10% speed per level'
            },
            {
                id: 'optimalOptics',
                name: 'Optimal Optics',
                description: 'Improve your camera accuracy for better photos',
                effect: '+10% camera accuracy per level'
            },
            {
                id: 'sledDurability',
                name: 'Sled Durability',
                description: 'Increase sled durability to withstand more crashes',
                effect: '+1 crash per level'
            },
            {
                id: 'fancierFootwear',
                name: 'Fancier Footwear',
                description: 'Move faster during uphill climbing',
                effect: '+10% uphill speed per level'
            }
        ];
        
        // Create upgrade panels
        const panelWidth = 250;
        const panelHeight = 200;
        const padding = 20;
        const startX = this.cameras.main.width / 2 - (panelWidth * 2 + padding * 1.5);
        const startY = 120;
        
        upgradeTypes.forEach((upgrade, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = startX + col * (panelWidth + padding);
            const y = startY + row * (panelHeight + padding);
            
            this.createUpgradePanel(upgrade, x, y, panelWidth, panelHeight);
        });
    }
    
    createUpgradePanel(upgrade, x, y, width, height) {
        // Create panel background
        const panel = this.add.rectangle(x, y, width, height, 0x545454)
            .setStrokeStyle(2, 0xaaaaaa)
            .setScrollFactor(0)
            .setOrigin(0, 0);
        
        // Add upgrade title
        this.add.text(
            x + width / 2,
            y + 20,
            upgrade.name,
            { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5, 0).setScrollFactor(0);
        
        // Add description
        this.add.text(
            x + 10,
            y + 50,
            upgrade.description,
            { fontSize: '14px', fill: '#cccccc', wordWrap: { width: width - 20 } }
        ).setScrollFactor(0);
        
        // Add effect text
        this.add.text(
            x + 10,
            y + 90,
            upgrade.effect,
            { fontSize: '14px', fill: '#88ff88' }
        ).setScrollFactor(0);
        
        // Get current upgrade level
        const currentLevel = this.player.upgrades[upgrade.id];
        const maxLevel = CONSTANTS.UPGRADE_COSTS[upgrade.id.toUpperCase()].length;
        
        // Add level indicator
        this.add.text(
            x + 10,
            y + 120,
            `Level: ${currentLevel}/${maxLevel}`,
            { fontSize: '16px', fill: '#ffffff' }
        ).setScrollFactor(0);
        
        // Calculate cost for next upgrade
        let costText = 'MAX LEVEL';
        let buttonColor = 0x333333;
        let isMaxLevel = currentLevel >= maxLevel;
        let cost = 0;
        
        if (!isMaxLevel) {
            cost = CONSTANTS.UPGRADE_COSTS[upgrade.id.toUpperCase()][currentLevel];
            costText = `Upgrade: ${formatMoney(cost)}`;
            buttonColor = this.player.money >= cost ? 0x00aa00 : 0xaa0000;
        }
        
        // Add upgrade button
        const button = this.add.rectangle(
            x + width / 2,
            y + height - 30,
            width - 20,
            40,
            buttonColor
        ).setScrollFactor(0).setOrigin(0.5, 0.5);
        
        const buttonText = this.add.text(
            x + width / 2,
            y + height - 30,
            costText,
            { fontSize: '16px', fill: '#ffffff' }
        ).setScrollFactor(0).setOrigin(0.5, 0.5);
        
        // Make button interactive if not max level
        if (!isMaxLevel) {
            button.setInteractive();
            
            button.on('pointerover', () => {
                button.setStrokeStyle(2, 0xffffff);
            });
            
            button.on('pointerout', () => {
                button.setStrokeStyle(0);
            });
            
            button.on('pointerdown', () => {
                this.handleUpgrade(upgrade.id, cost, button, buttonText);
            });
        }
    }
    
    handleUpgrade(upgradeType, cost, button, buttonText) {
        // Try to purchase the upgrade
        const purchased = this.player.buyUpgrade(upgradeType);
        
        if (purchased) {
            // Play upgrade sound
            this.sound.play('upgrade-sound');
            
            // Update button appearance
            const maxLevel = CONSTANTS.UPGRADE_COSTS[upgradeType.toUpperCase()].length;
            const currentLevel = this.player.upgrades[upgradeType];
            
            // Check if max level reached
            if (currentLevel >= maxLevel) {
                button.fillColor = 0x333333;
                buttonText.setText('MAX LEVEL');
                button.disableInteractive();
            } else {
                // Update cost for next level
                const nextCost = CONSTANTS.UPGRADE_COSTS[upgradeType.toUpperCase()][currentLevel];
                buttonText.setText(`Upgrade: ${formatMoney(nextCost)}`);
                
                // Update button color based on affordability
                button.fillColor = this.player.money >= nextCost ? 0x00aa00 : 0xaa0000;
            }
            
            // Refresh all panels to update level displays
            this.refreshPanels();
        } else {
            // Show "not enough money" message
            this.showMessage("Not enough money for upgrade!");
        }
    }
    
    createLoanPanel() {
        const panelWidth = 520;
        const panelHeight = 120;
        const x = this.cameras.main.width / 2 - panelWidth / 2;
        const y = this.cameras.main.height - panelHeight - 100;
        
        // Create panel background
        this.add.rectangle(x, y, panelWidth, panelHeight, 0x1a3c5c)
            .setStrokeStyle(2, 0x4a8ccc)
            .setScrollFactor(0)
            .setOrigin(0, 0);
        
        // Add loan title
        this.add.text(
            x + panelWidth / 2,
            y + 20,
            'Mountain Lodge Loan',
            { fontSize: '22px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5, 0).setScrollFactor(0);
        
        // Add loan amount text
        this.loanText = this.add.text(
            x + 20,
            y + 60,
            `Remaining: ${formatMoney(this.player.loanAmount)}`,
            { fontSize: '18px', fill: '#ffffff' }
        ).setScrollFactor(0);
        
        // Add payment buttons
        this.createPaymentButton(x + 280, y + 60, 100, 40, 100);
        this.createPaymentButton(x + 400, y + 60, 100, 40, 500);
    }
    
    createPaymentButton(x, y, width, height, amount) {
        // Calculate button color based on whether player can afford it
        const buttonColor = this.player.money >= amount ? 0x00aa00 : 0xaa0000;
        
        // Create button
        const button = this.add.rectangle(
            x,
            y,
            width,
            height,
            buttonColor
        ).setScrollFactor(0).setOrigin(0.5, 0.5);
        
        // Add button text
        const buttonText = this.add.text(
            x,
            y,
            `Pay ${formatMoney(amount)}`,
            { fontSize: '14px', fill: '#ffffff' }
        ).setScrollFactor(0).setOrigin(0.5, 0.5);
        
        // Make button interactive
        button.setInteractive();
        
        button.on('pointerover', () => {
            button.setStrokeStyle(2, 0xffffff);
        });
        
        button.on('pointerout', () => {
            button.setStrokeStyle(0);
        });
        
        button.on('pointerdown', () => {
            this.handleLoanPayment(amount);
        });
        
        return { button, buttonText };
    }
    
    handleLoanPayment(amount) {
        // Try to make loan payment
        const paymentMade = this.player.payLoan(amount);
        
        if (paymentMade) {
            // Play cash sound
            this.sound.play('cash-sound');
            
            // Update loan text
            this.loanText.setText(`Remaining: ${formatMoney(this.player.loanAmount)}`);
            
            // Refresh all panels
            this.refreshPanels();
            
            // Show message
            this.showMessage(`Paid ${formatMoney(amount)} toward your loan!`);
            
            // Check if loan is paid off (handled via event in GameScene)
        } else {
            // Show not enough money message
            this.showMessage("Not enough money to make this payment!");
        }
    }
    
    createExitButton() {
        // Create exit button
        const button = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            200,
            50,
            0x3a3a3a
        ).setScrollFactor(0).setInteractive();
        
        const buttonText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'Return to Mountain',
            { fontSize: '18px', fill: '#ffffff' }
        ).setScrollFactor(0).setOrigin(0.5, 0.5);
        
        button.on('pointerover', () => {
            button.setStrokeStyle(2, 0xffffff);
        });
        
        button.on('pointerout', () => {
            button.setStrokeStyle(0);
        });
        
        button.on('pointerdown', () => {
            // Exit to uphill scene
            this.scene.get('GameScene').events.emit('transitionToUphill');
        });
    }
    
    showMessage(text) {
        // Create a temporary message that fades out
        const message = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            text,
            { fontSize: '24px', fill: '#ffffff', backgroundColor: '#000000', padding: { x: 20, y: 10 } }
        ).setScrollFactor(0).setOrigin(0.5, 0.5).setAlpha(0);
        
        // Fade in and out animation
        this.tweens.add({
            targets: message,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 1500,
            onComplete: () => {
                message.destroy();
            }
        });
    }
    
    refreshPanels() {
        // Refresh the scene to update all panels
        // This is a simple approach - a more efficient approach
        // would be to just update specific elements
        this.scene.restart();
    }
}