/*
Final Project: Catch the Fruit Game
By: [Your Name]
Tool: Phaser.js
Based on example code from the Phaser documentation (https://phaser.io/examples)
----- Begin Cited Code -----
Used structure for scene creation and physics setup.
----- End Cited Code -----
*/

// ======== GAME CONFIGURATION ========
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#87CEEB",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

// Start the game
const game = new Phaser.Game(config);

// ======== GLOBAL VARIABLES ========
let player;
let fruits;
let cursors;
let score = 0;
let scoreText;

// ======== PRELOAD FUNCTION ========
function preload() {
  // Load assets (you can replace with your own image URLs)
  this.load.image("basket", "https://i.imgur.com/3QmPpUZ.png"); // basket
  this.load.image("fruit", "https://i.imgur.com/lpS9K9L.png");  // fruit
  this.load.image("background", "https://i.imgur.com/QrM1oA2.jpeg"); // background
}

// ======== CREATE FUNCTION ========
function create() {
  // Add background image
  this.add.image(400, 300, "background").setScale(1.1);

  // Add player basket
  player = this.physics.add.image(400, 550, "basket");
  player.setCollideWorldBounds(true);
  player.setScale(0.3);

  // Add group of fruits
  fruits = this.physics.add.group({
    key: "fruit",
    repeat: 4,
    setXY: { x: 100, y: 0, stepX: 150 },
  });

  // Randomize fruit falling speed
  fruits.children.iterate(function (fruit) {
    fruit.setScale(0.2);
    fruit.setVelocityY(Phaser.Math.Between(100, 250));
  });

  // Setup keyboard controls
  cursors = this.input.keyboard.createCursorKeys();

  // Collision detection: basket catches fruit
  this.physics.add.overlap(player, fruits, catchFruit, null, this);

  // Score display
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#fff",
  });
}

// ======== UPDATE FUNCTION ========
function update() {
  // Move player left/right
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  // Reset fruit when it falls off screen
  fruits.children.iterate(function (fruit) {
    if (fruit.y > 600) {
      resetFruit(fruit);
    }
  });
}

// ======== CUSTOM FUNCTIONS ========

// Called when basket catches a fruit
function catchFruit(player, fruit) {
  fruit.disableBody(true, true); // Remove fruit temporarily
  score += 10;
  scoreText.setText("Score: " + score);

  // Respawn fruit after delay
  setTimeout(() => {
    resetFruit(fruit);
  }, 1000);
}

// Reset fruit to top at random x position
function resetFruit(fruit) {
  fruit.enableBody(true, Phaser.Math.Between(50, 750), 0, true, true);
  fruit.setVelocityY(Phaser.Math.Between(150, 250));
}
