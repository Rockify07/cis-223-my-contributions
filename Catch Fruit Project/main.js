/*
Final Project: Catch the Fruit Game
By: Rock Kongolo
Tool: Phaser.js
Description: For my final project, I am developing an interactive browser-based arcade game called “Catch the Fruit,” using the JavaScript framework Phaser.js. The game challenges the player to control a basket and catch fruits that fall from the top of the screen. Each fruit caught earns points, and the goal is to progress through five increasingly challenging levels. The game emphasizes speed, timing, and reaction, providing a fun and engaging experience that demonstrates my ability to apply JavaScript concepts in a creative project.

When the visitor opens the web page, they are greeted by a colorful background and a basket located at the bottom of the screen. Fruits—including apples, bananas, oranges, and grapes—fall from random positions above. Using the left and right arrow keys, the player must move the basket to catch as many fruits as possible. Each caught fruit adds ten points to the score, which is displayed at the top of the screen. Once the player reaches 100 points, the game announces “Level 2 Start!” and increases both the fruit falling speed and the basket’s movement speed. Every 100 additional points advances the player to the next level, up to Level 5.

As the levels progress, the difficulty increases, making it harder to catch fruits in time. If the player successfully reaches 500 points (Level 5 completion), the game displays a “You Win!” message to celebrate the achievement. However, if any fruit reaches the bottom of the screen without being caught, the game ends immediately with a “Game Over” message. The player can then press the spacebar to restart and try again.

Technically, this project demonstrates the use of essential JavaScript fundamentals, including variables, functions, parameters, iteration, conditional logic, arrays, and object-oriented programming. I use Phaser’s built-in methods like `preload()` to load assets, `create()` to initialize game elements, and `update()` to manage continuous gameplay mechanics such as movement and collisions. The fruits are managed through an array-based random selection, and a physics engine handles their gravity and collision detection with the basket.

This project shows how core programming principles can be applied to an enjoyable and visually appealing web game. My goal is to provide players with a rewarding sense of progression while showing my ability to structure organized, well-commented, and interactive JavaScript code. With this project, I combine creativity, logic, and technical skill into one engaging web experience.

Features:
- 3 levels total
- Each level increases fruit fall speed and basket speed
- Level indicators and flash effect
- Win screen at Level 3 completion
- Custom fruit and basket sizes
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
    this.maxLevel = 5; // total number of levels
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

    // 
    this.player = this.physics.add.image(SCREEN_WIDTH / 2, 550, "basket");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.14); // basket size

    // Fruits
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

          // Custom sizes per fruit
          if (type === "banana") fruit.setScale(0.10);
          else if (type === "grapes") fruit.setScale(0.1); 
          else if (type === "apple") fruit.setScale(0.10); 
          else fruit.setScale(0.12);

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

//GAME CONFIG
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
