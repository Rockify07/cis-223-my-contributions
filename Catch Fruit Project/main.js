/*
Final Project: Catch the Fruit Game
By: Rock Kongolo
Tool: Phaser.js

Based on:
- Phaser 3 documentation (scene, physics, input, groups)
- General arcade game patterns for collision and scoring

All game logic, structure, and comments in this file are my own work.
*/

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

// ======== MAIN GAME SCENE ========
class CatchFruitScene extends Phaser.Scene {
  constructor() {
    super("CatchFruitScene");

    // Scene state
    this.player = null;
    this.fruits = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = null;
    this.fallSpeed = 200;
    this.gameOver = false;
    this.gameOverText = null;
    this.fruitTypes = ["apple", "banana", "grapes", "orange"];
  }

  // Load all images from local sprites folder
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

  // Create a group for fruits
  this.fruits = this.physics.add.group();

  // Make fruits appear one at a time with random type and X position
  this.time.addEvent({
    delay: 800, // new fruit every 0.8s
    callback: () => {
      const fruitTypes = ["apple", "banana", "grapes", "orange"];
      const type = Phaser.Utils.Array.GetRandom(fruitTypes);

      const fruit = this.fruits.create(
        Phaser.Math.Between(50, SCREEN_WIDTH - 50),
        0,
        type
      );

      fruit.setScale(0.12);
      fruit.setVelocityY(Phaser.Math.Between(this.fallSpeed, this.fallSpeed + 100));
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

  // Game Over text
  this.gameOverText = this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "", {
    fontSize: "48px",
    fill: "#ff0000",
    align: "center",
  });
  this.gameOverText.setOrigin(0.5);
}


    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision: when basket touches fruit, call catchFruit()
    this.physics.add.overlap(
      this.player,
      this.fruits,
      this.catchFruit,
      null,
      this
    );

    // Score text
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#ffffff",
    });

    // Game Over text (starts invisible)
    this.gameOverText = this.add.text(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      "",
      {
        fontSize: "48px",
        fill: "#ff0000",
        align: "center",
      }
    );
    this.gameOverText.setOrigin(0.5);
  }

  // Runs every frame
  update() {
    if (this.gameOver) {
      // Restart with SPACE
      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.scene.restart();
        this.score = 0;
        this.fallSpeed = 200;
        this.gameOver = false;
      }
      return;
    }

    // Basket movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // Check if any fruit falls off bottom = Game Over
    this.fruits.children.iterate((fruit) => {
      if (fruit.active && fruit.y > SCREEN_HEIGHT) {
        this.endGame();
      }
    });
  }

  // Called when basket catches a fruit
  catchFruit(player, fruit) {
    fruit.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    // Increase difficulty every 50 points
    if (this.score % 50 === 0) {
      this.fallSpeed += 30;
    }

    // Respawn fruit after short delay
    this.time.delayedCall(300, () => {
      this.resetFruit(fruit);
    });
  }

  // Reset a fruit at top with random type + speed
  resetFruit(fruit) {
    const newType = Phaser.Utils.Array.GetRandom(this.fruitTypes);
    fruit.setTexture(newType);

    fruit.enableBody(
      true,
      Phaser.Math.Between(50, SCREEN_WIDTH - 50),
      0,
      true,
      true
    );

    fruit.setVelocityY(
      Phaser.Math.Between(this.fallSpeed, this.fallSpeed + 100)
    );
    fruit.setScale(0.12);
  }

  // End the game when a fruit hits the ground
  endGame() {
    if (this.gameOver) return;

    this.gameOver = true;

    this.fruits.children.iterate((fruit) => {
      fruit.setVelocityY(0);
    });
    this.player.setVelocityX(0);

    this.gameOverText.setText("GAME OVER\nPress SPACE to Restart");
  }
}

// ======== GAME CONFIG AFTER SCENE DEFINITION ========
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
