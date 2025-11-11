/*
Final Project: Catch the Fruit Game
By: Rock Kongolo
Tool: Phaser.js
Inspired by: Phaser documentation & arcade game tutorials
*/

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

// Phaser game configuration
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
  scene: [CatchFruitScene],
};

// ======== SCENE CLASS ========
class CatchFruitScene extends Phaser.Scene {
  constructor() {
    super("CatchFruitScene");
    this.player = null;
    this.fruits = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = null;
    this.fallSpeed = 200;
    this.gameOver = false;
  }

  // ======== LOAD IMAGES ========
  preload() {
    this.load.image("basket", "sprites/basket.png");
    this.load.image("apple", "sprites/apple.png");
    this.load.image("banana", "sprites/banana.png");
    this.load.image("grapes", "sprites/grapes.png");
    this.load.image("orange", "sprites/orange.png");
    this.load.image("background", "sprites/background.png");
  }

  // ======== CREATE SCENE ========
  create() {
    // Background
    this.add.image(400, 300, "background").setDisplaySize(SCREEN_WIDTH, SCREEN_HEIGHT);

    // Basket (player)
    this.player = this.physics.add.image(400, 550, "basket");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.2);

    // Fruits group
    this.fruits = this.physics.add.group({
      repeat: 4,
      setXY: { x: 100, y: 0, stepX: 150 },
    });

    const fruitTypes = ["apple", "banana", "grapes", "orange"];
    this.fruits.children.iterate((fruit) => {
      const randomType = Phaser.Utils.Array.GetRandom(fruitTypes);
      fruit.setTexture(randomType);
      fruit.setScale(0.12);
      fruit.setVelocityY(Phaser.Math.Between(this.fallSpeed, this.fallSpeed + 100));
    });

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision detection: basket + fruit
    this.physics.add.overlap(this.player, this.fruits, this.catchFruit, null, this);

    // Score text
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#ffffff",
      fontFamily: "Arial",
    });

    // Game Over text
    this.gameOverText = this.add.text(400, 300, "", {
      fontSize: "48px",
      fill: "#ff0000",
      align: "center",
      fontFamily: "Arial",
    });
    this.gameOverText.setOrigin(0.5);
  }

  // ======== UPDATE EACH FRAME ========
  update() {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.scene.restart();
        this.score = 0;
        this.fallSpeed = 200;
        this.gameOver = false;
      }
      return;
    }

    // Basket movement
    if (this.cursors.left.isDown) this.player.setVelocityX(-300);
    else if (this.cursors.right.isDown) this.player.setVelocityX(300);
    else this.player.setVelocityX(0);

    // Check for missed fruits (game over)
    this.fruits.children.iterate((fruit) => {
      if (fruit.active && fruit.y > SCREEN_HEIGHT) {
        this.endGame();
      }
    });
  }

  // ======== HELPER METHODS ========
  catchFruit(player, fruit) {
    fruit.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    // Speed up every 50 points
    if (this.score % 50 === 0) this.fallSpeed += 30;

    // Respawn fruit
    setTimeout(() => {
      this.resetFruit(fruit);
    }, 300);
  }

  resetFruit(fruit) {
    const fruitTypes = ["apple", "banana", "grapes", "orange"];
    const newType = Phaser.Utils.Array.GetRandom(fruitTypes);
    fruit.setTexture(newType);
    fruit.enableBody(true, Phaser.Math.Between(50, 750), 0, true, true);
    fruit.setVelocityY(Phaser.Math.Between(this.fallSpeed, this.fallSpeed + 100));
    fruit.setScale(0.12);
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;

    this.fruits.children.iterate((fruit) => fruit.setVelocityY(0));
    this.player.setVelocityX(0);
    this.gameOverText.setText("GAME OVER\nPress SPACE to Restart");
  }
}

// ======== CREATE GAME ========
const game = new Phaser.Game(config);
