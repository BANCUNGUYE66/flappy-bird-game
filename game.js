// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Game variables
let gameRunning = false;
let score = 0;
let frames = 0;

// Bird object
const bird = {
    x: 80,
    y: 250,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    rotation: 0
};

// Pipes array
let pipes = [];
const pipeGap = 150;
const pipeWidth = 60;
const pipeSpeed = 2;

// Ground
const ground = {
    x: 0,
    y: 550,
    height: 50
};

// Initialize game
function init() {
    pipes = [];
    score = 0;
    frames = 0;
    bird.y = 250;
    bird.velocity = 0;
    scoreBoard.textContent = score;
}

// Start game
function startGame() {
    init();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    gameLoop();
}

// Restart game
function restartGame() {
    startGame();
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        e.preventDefault();
        bird.velocity = bird.jump;
    }
});

canvas.addEventListener('click', () => {
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
});

// Update bird
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Calculate rotation based on velocity
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90);

    // Check ground collision
    if (bird.y + bird.height >= ground.y) {
        gameOver();
    }

    // Check ceiling collision
    if (bird.y <= 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

// Draw bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    // Bird body (yellow rectangle)
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    // Bird outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(bird.width / 4 - bird.width / 2, -bird.height / 4 - bird.height / 2, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(bird.width / 4 - bird.width / 2 + 2, -bird.height / 4 - bird.height / 2 + 2, 4, 4);
    
    // Beak
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(bird.width / 2, -3 - bird.height / 2, 8, 6);
    ctx.strokeRect(bird.width / 2, -3 - bird.height / 2, 8, 6);
    
    ctx.restore();
}

// Create pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = ground.y - pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        scored: false
    });
}

// Update pipes
function updatePipes() {
    if (frames % 90 === 0) {
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;

        // Check collision with bird
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                gameOver();
            }
        }

        // Update score
        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            pipe.scored = true;
            score++;
            scoreBoard.textContent = score;
        }

        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Draw pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Top pipe cap
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, pipeWidth + 6, 20);
        ctx.strokeRect(pipe.x - 3, pipe.topHeight - 20, pipeWidth + 6, 20);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, ground.y - pipe.bottomY);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipeWidth, ground.y - pipe.bottomY);
        
        // Bottom pipe cap
        ctx.fillRect(pipe.x - 3, pipe.bottomY, pipeWidth + 6, 20);
        ctx.strokeRect(pipe.x - 3, pipe.bottomY, pipeWidth + 6, 20);
    });
}

// Draw ground
function drawGround() {
    ctx.fillStyle = '#d35400';
    ctx.fillRect(0, ground.y, canvas.width, ground.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, ground.y, canvas.width, ground.height);
    
    // Ground pattern
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i, ground.y);
        ctx.lineTo(i + 10, ground.y + 10);
        ctx.lineTo(i + 20, ground.y);
        ctx.stroke();
    }
}

// Draw background
function drawBackground() {
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(100 + (frames % 400), 80, 60, 30);
    ctx.fillRect(300 + (frames % 500), 120, 80, 40);
    
    // Sun
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(350, 70, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Game over
function gameOver() {
    gameRunning = false;
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawPipes();
    drawGround();
    drawBird();
    
    updateBird();
    updatePipes();
    
    frames++;
    requestAnimationFrame(gameLoop);
}
