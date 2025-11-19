/*
Final Project: Catch the Fruit Game
By: Rock Kongolo
Tool: Phaser.js

Description:
For my final project, I am developing an interactive browser-based arcade game called “Catch the Fruit,” using the JavaScript framework Phaser.js. The game challenges the player to control a basket and catch fruits that fall from the top of the screen. Each fruit caught earns points, and the goal is to progress through five increasingly challenging levels. The game emphasizes speed, timing, and reaction, providing a fun and engaging experience that demonstrates my ability to apply JavaScript concepts in a creative project.

When the visitor opens the web page, they are greeted by a basket located at the bottom of the screen and a Level 1 background. A unique feature of my project is that **each level has its own background image**, such as daytime, sunset, nighttime, and space themes. As the player advances through levels, the background smoothly fades into the next one using a tween transition effect. This gives the game a more polished, professional feel and visually rewards the player for progressing.

Fruits—including apples, bananas, oranges, and grapes—fall from random positions above. Using the left and right arrow keys, the player moves the basket to catch the fruits. Each catch adds ten points to the score, which is displayed at the top left. Every 100 points, the level increases, the fruit falling speed increases, and the basket moves faster, making gameplay more challenging. These difficulty changes create a sense of progression across all five levels.

If the player reaches 500 points (Level 5 completion), the game displays a celebratory “You Win!” message. However, if any fruit reaches the ground, the game ends immediately with a “Game Over” message. Pressing the spacebar restarts the entire game.

Technically, this project demonstrates essential JavaScript fundamentals, including variables, functions, iteration, parameters, conditional logic, arrays, and object-oriented programming. Phaser’s core functions—`preload()`, `create()`, and `update()`—are used to manage asset loading, game object initialization, real-time physics, fruit spawning, movement, and collision detection. The background transition system uses tween animations to smoothly fade between images.

This project shows how core programming principles can be applied to create a polished, interactive browser game. The dynamic backgrounds, increasing difficulty, and responsive controls combine to create a fun and engaging experience that reflects both creativity and technical skill.

Features:
- 5 total levels of increasing difficulty
- A unique background image for every level (day, sunset, night, space, neon/5th background)
- Smooth fade transition between backgrounds when leveling up
- Fruit fall speed increases each level
- Basket movement speed increases each level
- Score increases by 10 for each fruit caught
- Level-up announcement messages with flash effect
- Game Over screen when a fruit touches the ground
- Win screen when the player reaches 500 points (Level 5 complete)
- Custom fruit and basket sizes for cleaner gameplay visuals
- Continuous fruit spawning with random fruit types

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
    this.maxLevel = 5;
    this.scoreText = null;
    this.levelText = null;
    this.fallSpeed = 200;
    this.moveSpeed = 500;
    this.gameOver = false;
    this.wonGame = false;

    // Backgrounds for each level
    this.backgroundImages = [
      "background1",
      "background2",
      "background3",
      "background4",
      "background5",
    ];

    this.currentBackground = null;

    this.fruitTypes = ["apple", "banana", "grapes", "orange"];
  }

  preload() {
    this.load.image("basket", "sprites/basket.png");
    this.load.image("apple", "sprites/apple.png");
    this.load.image("banana", "sprites/banana.png");
    this.load.image("grapes", "sprites/grapes.png");
    this.load.image("orange", "sprites/orange.png");

    // Load all 5 level backgrounds
    this.load.image("background1", "sprites/background1.png");
    this.load.image("background2", "sprites/background2.png");
    this.load.image("background3", "sprites/background3.png");
    this.load.image("background4", "sprites/background4.png");
    this.load.image("background5", "sprites/background5.png");
  }

  create() {
    // Initial Background (Level 1)
    this.currentBackground = this.add
      .image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "background1")
      .setDisplaySize(SCREEN_WIDTH, SCREEN_HEIGHT);

    // Basket
    this.player = this.physics.add.image(SCREEN_WIDTH / 2, 550, "basket");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.14);

    // Fruit Group
    this.fruits = this.physics.add.group();

    // Fruit Spawner
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

    // Collision Detection
    this.physics.add.overlap(this.player, this.fruits, this.catchFruit, null, this);

    // Score UI
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#ffffff",
    });

    // Level UI
    this.levelText = this.add.text(16, 60, "Level: 1", {
      fontSize: "28px",
      fill: "#ffffff",
    });

    // Win / Game Over UI
    this.messageText = this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "", {
      fontSize: "48px",
      fill: "#ff0000",
      fontFamily: "Arial",
      align: "center",
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

    // Movement
    if (this.cursors.left.isDown) this.player.setVelocityX(-this.moveSpeed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(this.moveSpeed);
    else this.player.setVelocityX(0);

    // Missed Fruit
    this.fruits.children.iterate((fruit) => {
      if (fruit.active && fruit.y > SCREEN_HEIGHT) this.endGame();
    });
  }

  catchFruit(player, fruit) {
    fruit.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    // Level triggers: 100, 200, 300, 400, 500
    if (this.score % 100 === 0 && this.score <= this.maxLevel * 100) {
      this.advanceLevel();
    }
  }

  advanceLevel() {
    if (this.level < this.maxLevel) {
      this.level++;
      this.levelText.setText("Level: " + this.level);

      this.fallSpeed += 75;
      this.moveSpeed += 75;

      this.changeBackground(this.level);

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

      const msg = this.add.text(
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2,
        `LEVEL ${this.level} START!`,
        { fontSize: "48px", fill: "#00ff00", fontFamily: "Arial" }
      );
      msg.setOrigin(0.5);
      this.time.delayedCall(1000, () => msg.destroy());
    } else {
      this.winGame();
    }
  }

  // ⭐ Background transition
  changeBackground(level) {
    const bgKey = this.backgroundImages[level - 1];

    const newBG = this.add
      .image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, bgKey)
      .setDisplaySize(SCREEN_WIDTH, SCREEN_HEIGHT)
      .setAlpha(0);

    this.tweens.add({
      targets: newBG,
      alpha: 1,
      duration: 800,
      onComplete: () => {
        this.currentBackground.destroy();
        this.currentBackground = newBG;
      },
    });
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

// GAME CONFIG
const config = {
  type: Phaser.AUTO,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  backgroundColor: "#000",
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
