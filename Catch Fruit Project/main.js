/*
Final Project: Catch the Fruit Game
By: Rock Kongolo
Tool: Phaser.js

Features:
- 3 levels total
- Each level increases fruit fall speed and basket speed
- Level indicators and flash effect
- Win screen at Level 3 completion
*/

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

// ======== MAIN GAME SCENE ========
class CatchFruitScene extends Phaser.Scene {
  constructor() {
    super("CatchFruitScene");

    this.player = null;
    this.fruits = null;
    this.cursors = null;
    this.score = 0;
    this.level = 1;
    this.maxLevel = 3; // total number of levels
    this.scoreText = null;
    this.levelText = null;
    this.fallSpeed = 200;
    this.moveSpeed = 500;
    this.gameOver = false;
    this.wonGame = false;
    this.fruitTypes = ["apple", "banana", "grapes", "orange"];
  }

  preload() {
    this.load.image("basket", "sprites/basket.png");
    this.load.image("apple", "sprites/apple.png");
    this.load.image("banana", "sprites/banana.png");
    this.load.image("grapes", "sprites/grapes.png");
    this.load.image("orange", "sprites/orange.png");
    this.load.image("background", "sprites/background.png");
  }

  create() {
    // Background
    this.add
      .image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "background")
      .setDisplaySize(SCREEN_WIDTH, SCREEN_HEIGHT);

    // Player basket
    this.player = this.physics.add.image(SCREEN_WIDTH / 2, 550, "basket");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.2);

    // Fruits group
    this.fruits = this.physics.add.group();

    // Spawner: drops fruit continuously
    this.time.addEvent({
      delay: 800,
      callback: () => {
        if (!this.gameOver && !this.wonGame) {
          const type = Phaser.Utils.Array.GetRandom(this.fruitTypes);
          const fruit = this.fruits.create(
            Phaser.Math.Between(50, SCREEN_WIDTH - 50),
            0,
            type
          );
          fruit.setScale(0.12);
          fruit.setVelocityY(
            Phaser.Math.Between(this.fallSpeed, this.fallSpeed + 100)
          );
        }
      },
      loop: true,
    });

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision detection
    this.physics.add.overlap(this.player, this.fruits, this.catchFruit, null, this);

    // Score text
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#ffffff",
    });

    // Level text
    this.levelText = this.add.text(16, 60, "Level: 1", {
      fontSize: "28px",
      fill: "#ffffff",
    });

    // Game Over / Win text
    this.messageText = this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "", {
      fontSize: "48px",
      fill: "#ff0000",
      align: "center",
      fontFamily: "Arial",
    });
    this.messageText.setOrigin(0.5);
  }

  update() {
    if (this.gameOver || this.wonGame) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.scene.restart();
        this.score = 0;
        this.level = 1;
        this.fallSpeed = 200;
        this.moveSpeed = 500;
        this.gameOver = false;
        this.wonGame = false;
      }
      return;
    }

    // Player movement
    if (this.cursors.left.isDown) this.player.setVelocityX(-this.moveSpeed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(this.moveSpeed);
    else this.player.setVelocityX(0);

    // Check if fruit missed
    this.fruits.children.iterate((fruit) => {
      if (fruit.active && fruit.y > SCREEN_HEIGHT) this.endGame();
    });
  }

  catchFruit(player, fruit) {
    fruit.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    // Check level thresholds (100, 200, 300)
    if (this.score % 100 === 0 && this.score <= this.maxLevel * 100) {
      this.advanceLevel();
    }
  }

  advanceLevel() {
    if (this.level < this.maxLevel) {
      this.level++;
      this.levelText.setText("Level: " + this.level);

      // Increase difficulty
      this.fallSpeed += 75;
      this.moveSpeed += 75;

      // Flash effect
      const flash = this.add.rectangle(
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        0xffffff,
        0.3
      );
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy(),
      });

      // Show level message
      const levelMsg = this.add.text(
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2,
        `LEVEL ${this.level} START!`,
        {
          fontSize: "48px",
          fill: "#00ff00",
          fontFamily: "Arial",
        }
      );
      levelMsg.setOrigin(0.5);
      this.time.delayedCall(1000, () => levelMsg.destroy());
    } else {
      this.winGame();
    }
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;

    this.fruits.children.iterate((fruit) => fruit.setVelocityY(0));
    this.player.setVelocityX(0);
    this.messageText.setText("GAME OVER\nPress SPACE to Restart");
  }

  winGame() {
    this.wonGame = true;
    this.player.setVelocityX(0);
    this.fruits.children.iterate((fruit) => fruit.setVelocityY(0));
    this.messageText.setFill("#00ff00");
    this.messageText.setText("🎉 YOU WIN! 🎉\nPress SPACE to Play Again");
  }
}

// ======== GAME CONFIG ========
const config = {
  type: Phaser.AUTO,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  backgroundColor: "#87CEEB",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: false,
    },
  },
  scene: CatchFruitScene,
};

new Phaser.Game(config);
