class UIScene extends Phaser.Scene {
    constructor() {
        super({key: 'UIScene'});
    }

    create() {
        // Get player reference
        this.player = this.game.player;
        
        // Create UI elements
        this.createMoneyDisplay();
        this.createHealthDisplay();
        this.createPhaseIndicator();
        
        // Listen for events
        this.setupEventListeners();
    }
    
    createMoneyDisplay() {
        // Create background for money display
        this.moneyBg = this.add.rectangle(
            10,
            10,
            180,
            40,
            0x000000,
            0.7
        ).setOrigin(0, 0).setScrollFactor(0);
        
        // Create money text
        this.moneyText = this.add.text(
            20,
            20,
            formatMoney(this.player.money),
            { fontSize: '20px', fill: '#00ff00' }
        ).setScrollFactor(0);
    }
    
    createHealthDisplay() {
        // Create background for health bar
        this.healthBg = this.add.rectangle(
            this.cameras.main.width - 210,
            10,
            200,
            20,
            0x000000,
            0.7
        ).setOrigin(0, 0).setScrollFactor(0);
        
        // Create health bar
        this.healthBar = this.add.rectangle(
            this.cameras.main.width - 205,
            15,
            190 * (this.player.health / CONSTANTS.MAX_PLAYER_HEALTH),
            10,
            0xff0000
        ).setOrigin(0, 0).setScrollFactor(0);
        
        // Create health text
        this.healthText = this.add.text(
            this.cameras.main.width - 110,
            10,
            `${this.player.health}/${CONSTANTS.MAX_PLAYER_HEALTH}`,
            { fontSize: '16px', fill: '#ffffff' }
        ).setOrigin(0.5, 0).setScrollFactor(0);
    }
    
    createPhaseIndicator() {
        // Add game phase indicator
        this.phaseText = this.add.text(
            this.cameras.main.width / 2,
            10,
            'UPHILL PHASE',
            { fontSize: '18px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5, 0).setScrollFactor(0);
    }
    
    setupEventListeners() {
        // Listen for money changes
        this.game.events.on('moneyChanged', this.updateMoneyDisplay, this);
        
        // Listen for health changes
        this.events.on('playerCollision', this.updateHealthDisplay, this);
        
        // Listen for game phase changes
        this.events.on('gamePhaseChanged', this.updatePhaseIndicator, this);
        
        // Listen for loan updates
        this.game.events.on('loanUpdated', this.updateLoanDisplay, this);
    }
    
    updateMoneyDisplay() {
        this.moneyText.setText(formatMoney(this.player.money));
    }
    
    updateHealthDisplay(collisionData) {
        // Update health bar width
        const healthRatio = this.player.health / CONSTANTS.MAX_PLAYER_HEALTH;
        this.healthBar.width = 190 * healthRatio;
        
        // Update health text
        this.healthText.setText(`${this.player.health}/${CONSTANTS.MAX_PLAYER_HEALTH}`);
        
        // Change health bar color based on health level
        if (healthRatio < 0.2) {
            this.healthBar.fillColor = 0xff0000; // Red
        } else if (healthRatio < 0.5) {
            this.healthBar.fillColor = 0xffaa00; // Orange
        } else {
            this.healthBar.fillColor = 0x00ff00; // Green
        }
    }
    
    updatePhaseIndicator(phase) {
        // Update phase text based on current game phase
        switch (phase) {
            case 'uphill':
                this.phaseText.setText('UPHILL PHASE - Photograph Wildlife');
                break;
                
            case 'downhill':
                this.phaseText.setText('DOWNHILL PHASE - Perform Tricks');
                break;
                
            case 'house':
                this.phaseText.setText('CABIN - Upgrades & Loan Payments');
                break;
        }
    }
    
    updateLoanDisplay() {
        // This could be used to show loan info in the UI if needed
        // Currently handled in the HouseScene
    }
    
    update() {
        // Update money display every frame (since it can change frequently)
        this.updateMoneyDisplay();
    }
}