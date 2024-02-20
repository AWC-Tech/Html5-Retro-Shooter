// Game variables
let canvas, ctx;
let player, bullets, enemies;
let lastTime;
let gameOver = false;
let score = 0;
let bulletCooldown = 0; // Added variable for bullet cooldown
const bulletDelay = 1000 / 6; // Delay between bullets (in milliseconds) - 6 bullets per second
let lastSpawnTime = 0;
let startTime = Date.now(); // Added variable to track start time

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
        speed: 5 * 1.04, // Increase x velocity by 4%
        angle: 0, // Initialize player angle
        turnSpeed: 0.09 // Decrease turning speed by 10%
    };

    bullets = [];
    enemies = [];

    lastTime = 0;
    gameOver = false;
    score = 0;
    lastSpawnTime = 0;
    startTime = Date.now(); // Reset start time

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

    // Rotate player left when Q key is pressed
    if (keys["q"]) {
        player.angle -= player.turnSpeed; // Rotate left
    }

    // Rotate player right when E key is pressed
    if (keys["e"]) {
        player.angle += player.turnSpeed; // Rotate right
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
        // Calculate velocity components based on player's angle
        const bulletSpeed = 8; // Bullet speed
        const velocityX = Math.sin(player.angle) * bulletSpeed;
        const velocityY = -Math.cos(player.angle) * bulletSpeed; // Negative due to canvas coordinate system

        // Update bullet position based on velocity components
        bullet.x += velocityX;
        bullet.y += velocityY;
    });

    // Remove bullets that are out of bounds
    bullets = bullets.filter(bullet => bullet.y > 0);

    // Spawn enemies every 4 seconds
    if (Date.now() - lastSpawnTime >= 4000) {
        for (let i = 0; i < 4; i++) {
            let enemy = {
                x: Math.random() * canvas.width,
                y: -30,
                width: 30,
                height: 30,
                speed: 2
            };
            enemies.push(enemy);
        }
        lastSpawnTime = Date.now();
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

        // Check if enemy passed player
        if (enemy.y > canvas.height) {
            enemies.splice(enemies.indexOf(enemy), 1); // Remove enemy
            score -= 10; // Subtract 10 points
        }
    });

    // Check for collisions between bullets and enemies
    bullets.forEach(bullet => {
        enemies.forEach(enemy => {
            // Check if bullet collides with enemy
            if (
                bullet.x + bullet.radius > enemy.x &&
                bullet.x - bullet.radius < enemy.x + enemy.width &&
                bullet.y + bullet.radius > enemy.y &&
                bullet.y - bullet.radius < enemy.y + enemy.height
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
    ctx.save(); // Save current context state
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2); // Translate to player center
    ctx.rotate(player.angle); // Rotate around player center
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-player.size / 2, 0);
    ctx.lineTo(player.size / 2, 0);
    ctx.lineTo(0, -player.size);
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // Restore previous context state

    // Draw bullets with increased hitbox
    ctx.fillStyle = "#fff";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius * 1.08, 0, Math.PI * 2); // Increase radius by 8%
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

    // Draw elapsed time
    ctx.fillText("Time: " + formatTime((Date.now() - startTime) / 1000), 10, 30);

    // Game over text
    if (gameOver) {
        ctx.fillStyle = "#fff";
        ctx.font = "48px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2);
    }
}

// Format time in MM:SS format
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
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
