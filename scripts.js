// Select the player and ground elements
const player = document.getElementById('p');
const ground = document.querySelector('.ground');

// Player properties
player.style.transform = spawn.style.transform;
let playerX = 50;
let playerY = 50;
let playerVelocityX = 0;
let playerVelocityY = 0;
const playerSpeed = 1;
const gravity = 0.5;
const jumpPower = 12.5;
let isJumping = false;

// Tile properties
const tileSize = 75;
const tiles = [
    {x: 100, y: 300},
    {x: 175, y: 300},
    {x: 325, y: 300},
    // Add more coordinates as needed
];

// Create tiles
tiles.forEach(tile => {
    const tileDiv = document.createElement('div');
    tileDiv.classList.add('tile');
    tileDiv.style.width = `${tileSize}px`;
    tileDiv.style.height = `${tileSize}px`;
    tileDiv.style.position = 'absolute';
    tileDiv.style.left = `${tile.x}px`;
    tileDiv.style.top = `${tile.y}px`;
    tileDiv.style.backgroundColor = 'brown';
    document.body.appendChild(tileDiv);
});

// Keyboard state
const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

// Set up event listeners for key down and key up
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            keys.right = true;
            break;
        case 'ArrowUp':
        case 'w':
        case ' ':
            keys.up = true;
            break;
        case 'ArrowDown':
        case 's':
        case 'Shift':
            keys.down = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            keys.right = false;
            break;
        case 'ArrowUp':
        case 'w':
        case ' ':
            keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
        case 'Shift':
            keys.down = false;
            break;
    }
});

// Function to check point-rectangle collision
function pointRect(px, py, rx0, ry0, rx1, ry1) {
    const left = Math.min(rx0, rx1);
    const right = Math.max(rx0, rx1);
    const top = Math.min(ry0, ry1);
    const bottom = Math.max(ry0, ry1);
    let inRight = px > left;
    let inLeft = px < right;
    let inTop = py > top;
    let inBottom = py < bottom;
    return (inRight && inLeft && inTop && inBottom);
}

// Function to check rectangle-rectangle collision
function rectRect(rxa0, rya0, rxa1, rya1, rxb0, ryb0, rxb1, ryb1) {
    const leftA = Math.min(rxa0, rxa1);
    const rightA = Math.max(rxa0, rxa1);
    const topA = Math.min(rya0, rya1);
    const bottomA = Math.max(rya0, rya1);
    const leftB = Math.min(rxb0, rxb1);
    const rightB = Math.max(rxb0, rxb1);
    const topB = Math.min(ryb0, ryb1);
    const bottomB = Math.max(ryb0, ryb1);
    let inRight = rightA > leftB;
    let inLeft = leftA < rightB;
    let inBottom = bottomA > topB;
    let inTop = topA < bottomB;
    return inLeft && inRight && inTop && inBottom;
}

// Function to handle collisions
function handleCollisions() {
    tiles.forEach(tile => {
        if (rectRect(playerX, playerY, playerX + player.offsetWidth, playerY + player.offsetHeight,
            tile.x, tile.y, tile.x + tileSize, tile.y + tileSize)) {
            // Gradually move the player up to a maximum of 10px
            let moveUpDistance = 0;
            let moveUpIncrement = 1;
            let collisionResolved = false;
            
            while (moveUpDistance <= 15) {
                playerY -= moveUpIncrement;
                moveUpDistance += moveUpIncrement;
                if (!(rectRect(playerX, playerY, playerX + player.offsetWidth, playerY + player.offsetHeight,
                    tile.x, tile.y, tile.x + tileSize, tile.y + tileSize))) {
                    collisionResolved = true;
                    isJumping = false;
                    playerVelocityY = 0;
                    break;
                } else {
                    collisionResolved = false
                }
            }

            if (!collisionResolved) {
                // Collision persists, vibrate the player left and right with increasing magnitude
                let vibrateMagnitude = 1;
                let collisionPersists = true;
                const origX = playerX
                
                while (collisionPersists && (vibrateMagnitude > 15)) {
                    playerX += vibrateMagnitude;
                    if (!rectRect(playerX, playerY, playerX + player.offsetWidth, playerY + player.offsetHeight,
                        tile.x, tile.y, tile.x + tileSize, tile.y + tileSize)) {
                        collisionPersists = false;
                        break;
                    }
                    playerX -= 2 * vibrateMagnitude;
                    if (!rectRect(playerX, playerY, playerX + player.offsetWidth, playerY + player.offsetHeight,
                        tile.x, tile.y, tile.x + tileSize, tile.y + tileSize)) {
                        collisionPersists = false;
                        break;
                    }
                    playerX += vibrateMagnitude;
                    vibrateMagnitude += 1;
                }
                while (collisionPersists) {
                    playerY += 1
                    collisionPersists = rectRect(playerX, playerY, playerX + player.offsetWidth, playerY + player.offsetHeight,
                        tile.x, tile.y, tile.x + tileSize, tile.y + tileSize)
                }
                playerY += 16
                playerVelocityX *= -0.5; // Invert horizontal velocity
            }
        }
    });
}


// Game loop
function gameLoop() {
    // Horizontal movement
    if (keys.left) {
        playerVelocityX -= playerSpeed;
    }
    if (keys.right) {
        playerVelocityX += playerSpeed;
    }
    
    playerX += playerVelocityX;
    playerVelocityX *= .92;

    // Jumping
    if (keys.up && !isJumping) {
        playerVelocityY = -jumpPower;
        isJumping = true;
    }

    // Apply gravity
    playerVelocityY += gravity;
    playerY += playerVelocityY;

    // Handle collisions with tiles
    handleCollisions();

    // Prevent falling through the ground
    if (playerY >= ground.offsetTop - player.offsetHeight) {
        playerY = ground.offsetTop - player.offsetHeight;
        playerVelocityY = 0;
        isJumping = false;
    }

    // Update player position
    player.style.transform = `translate(${playerX}px, ${playerY}px)`;

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
