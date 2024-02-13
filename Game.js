// Game variables
let canvas, ctx;
let player, bullets, enemies;
let lastTime;
let gameOver = false;
let score = 0;
let bulletCooldown = 0; // Added variable for bullet cooldown
const bulletDelay = 1000 / 6; // Delay between bullets (in milliseconds) - 6 bullets per second

// Main menu initialization
function initMainMenu() {
    const mainMenu = document.getElementById("mainMenu");
    const playButton = document.getElementById("playButton");

    playButton.addEventListener("click", () => {
        mainMenu.style.display = "none";
        initGame(); // Start the game after clicking Play button
    });
}

// Game initialization
function initGame() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.style.display = "block"; // Ensure canvas is displayed

    player = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        size: 30,
        speed: 5
    };

    bullets = [];
    enemies = [];

    lastTime = 0;
    gameOver = false;
    score = 0;

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    if (gameOver) return;

    // Update player position
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x < canvas.width - player.size) {
        player.x += player.speed;
    }

    // Shoot bullets with cooldown
    bulletCooldown -= deltaTime; // Decrease cooldown time
    if (keys[" "] && bulletCooldown <= 0) {
        let bullet = {
            x: player.x + player.size / 2,
            y: player.y,
            radius: 5,
            speed: 8
        };
        bullets.push(bullet);
        bulletCooldown = bulletDelay; // Reset cooldown
    }

    // Update bullets position
    bullets.forEach(bullet => {
        bullet.y -= bullet.speed;
    });

    // Remove bullets that are out of bounds
    bullets = bullets.filter(bullet => bullet.y > 0);

    // Spawn enemies
    if (Math.random() < 0.02) {
        let enemy = {
            x: Math.random() * canvas.width,
            y: -30,
            width: 30,
            height: 30,
            speed: 2
        };
        enemies.push(enemy);
    }

    // Update enemies position
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;

        // Check for collision with player
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.size > enemy.y
        ) {
            gameOver = true;
        }
    });

    // Check for collisions between bullets and enemies
    bullets.forEach(bullet => {
        enemies.forEach(enemy => {
            if (
                bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y &&
                bullet.y < enemy.y + enemy.height
            ) {
                // Collision detected, remove bullet and enemy
                bullets.splice(bullets.indexOf(bullet), 1);
                enemies.splice(enemies.indexOf(enemy), 1);
                score += 10; // Increase score
            }
        });
    });
}

// Render game objects
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player triangle
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.size, player.y);
    ctx.lineTo(player.x + player.size / 2, player.y - player.size);
    ctx.closePath();
    ctx.fill();

    // Draw bullets with increased hitbox
    ctx.fillStyle = "#fff";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius * 1.04, 0, Math.PI * 2); // Increase radius by 4%
        ctx.fill();
    });

    // Draw enemies
    ctx.fillStyle = "#0f0";
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw score
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width - 100, 30);

    // Game over text
    if (gameOver) {
        ctx.fillStyle = "#fff";
        ctx.font = "48px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2);
    }
}

// Game loop
function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    render();

    // Continue game loop
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Keyboard input handling
let keys = {};
document.addEventListener("keydown", event => {
    keys[event.key] = true;
});
document.addEventListener("keyup", event => {
    keys[event.key] = false;
});

// Start the main menu
initMainMenu();
