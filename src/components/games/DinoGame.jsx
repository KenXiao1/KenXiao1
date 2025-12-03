import React, { useEffect, useRef, useState, useCallback } from 'react';

const DinoGame = () => {
    const canvasRef = useRef(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameSpeed, setGameSpeed] = useState(1); // 0.5 = slow, 1 = normal, 1.5 = fast
    const [isStarted, setIsStarted] = useState(false);
    const gameStateRef = useRef(null);

    // Speed options
    const speedOptions = [
        { value: 0.6, label: 'Slow' },
        { value: 1, label: 'Normal' },
        { value: 1.5, label: 'Fast' },
    ];

    const startGame = useCallback(() => {
        setIsStarted(true);
        setIsGameOver(false);
        setScore(0);
    }, []);

    useEffect(() => {
        if (!isStarted) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Game constants - adjusted by speed multiplier
        const GRAVITY = 0.6 * gameSpeed;
        const JUMP_FORCE = -12 * Math.sqrt(gameSpeed); // Adjusted for different speeds
        const GROUND_HEIGHT = 40;
        const DINO_WIDTH = 40;
        const DINO_HEIGHT = 44;
        const DINO_DUCK_HEIGHT = 26; // Shorter when ducking
        const OBSTACLE_WIDTH = 25;
        const OBSTACLE_HEIGHT = 40;
        const PTERODACTYL_WIDTH = 42;
        const PTERODACTYL_HEIGHT = 30;
        const BASE_GAME_SPEED = 5 * gameSpeed;

        // Minimum gap between obstacles (in pixels) - ensures player can react
        const MIN_OBSTACLE_GAP = 300 / gameSpeed;

        // Game state
        let dino = {
            x: 60,
            y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
            dy: 0,
            grounded: true,
            ducking: false,
            width: DINO_WIDTH,
            height: DINO_HEIGHT,
        };

        let obstacles = [];
        let frameCount = 0;
        let currentGameSpeed = BASE_GAME_SPEED;
        let currentScore = 0;
        let gameRunning = true;
        let lastObstacleX = canvas.width + 200; // Track last obstacle position

        gameStateRef.current = { gameRunning };

        const handleKeyDown = (e) => {
            if (!gameStateRef.current?.gameRunning) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    restartGame();
                }
                return;
            }

            // Jump - Space or Arrow Up
            if ((e.code === 'Space' || e.code === 'ArrowUp') && dino.grounded && !dino.ducking) {
                e.preventDefault();
                dino.dy = JUMP_FORCE;
                dino.grounded = false;
            }

            // Duck - Arrow Down
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                if (!dino.ducking) {
                    dino.ducking = true;
                    dino.height = DINO_DUCK_HEIGHT;
                    // Adjust y position when ducking while grounded
                    if (dino.grounded) {
                        dino.y = canvas.height - GROUND_HEIGHT - DINO_DUCK_HEIGHT;
                    }
                }
                // Fast fall when in air
                if (!dino.grounded) {
                    dino.dy = Math.max(dino.dy, 8 * gameSpeed);
                }
            }
        };

        const handleKeyUp = (e) => {
            // Stop ducking when Arrow Down is released
            if (e.code === 'ArrowDown' && dino.ducking) {
                dino.ducking = false;
                dino.height = DINO_HEIGHT;
                if (dino.grounded) {
                    dino.y = canvas.height - GROUND_HEIGHT - DINO_HEIGHT;
                }
            }
        };

        const restartGame = () => {
            dino = {
                x: 60,
                y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
                dy: 0,
                grounded: true,
                ducking: false,
                width: DINO_WIDTH,
                height: DINO_HEIGHT,
            };
            obstacles = [];
            frameCount = 0;
            currentGameSpeed = BASE_GAME_SPEED;
            currentScore = 0;
            gameRunning = true;
            lastObstacleX = canvas.width + 200;
            gameStateRef.current = { gameRunning };
            setIsGameOver(false);
            setScore(0);
            loop();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const spawnObstacle = () => {
            // Check if we can spawn a new obstacle
            // Ensure minimum gap from last obstacle
            const minX = lastObstacleX + MIN_OBSTACLE_GAP;

            if (minX > canvas.width) {
                return; // Not enough space yet
            }

            // Random chance to spawn
            const spawnChance = 0.02; // 2% chance per frame when conditions are met
            if (Math.random() > spawnChance) {
                return;
            }

            // Decide obstacle type
            // Pterodactyls appear after score reaches 200
            const canSpawnPterodactyl = currentScore > 200;
            const spawnPterodactyl = canSpawnPterodactyl && Math.random() < 0.35;

            if (spawnPterodactyl) {
                // Flying pterodactyl - three possible heights
                const heights = [
                    canvas.height - GROUND_HEIGHT - 70,  // Low - need to duck
                    canvas.height - GROUND_HEIGHT - 50,  // Medium - can duck or jump
                    canvas.height - GROUND_HEIGHT - 90,  // High - can run under
                ];
                const y = heights[Math.floor(Math.random() * 3)];

                obstacles.push({
                    x: canvas.width,
                    y: y,
                    width: PTERODACTYL_WIDTH,
                    height: PTERODACTYL_HEIGHT,
                    type: 'pterodactyl',
                    wingUp: true,
                });
                lastObstacleX = canvas.width;
            } else {
                // Ground cactus - varying sizes
                const variations = [
                    { width: 20, height: 35 },  // Small
                    { width: 25, height: 45 },  // Medium
                    { width: 30, height: 50 },  // Large
                    { width: 50, height: 35 },  // Wide (double cactus)
                ];
                const variation = variations[Math.floor(Math.random() * variations.length)];

                obstacles.push({
                    x: canvas.width,
                    y: canvas.height - GROUND_HEIGHT - variation.height,
                    width: variation.width,
                    height: variation.height,
                    type: 'cactus',
                });
                lastObstacleX = canvas.width;
            }
        };

        const update = () => {
            if (!gameRunning) return;

            // Dino physics
            dino.dy += GRAVITY;
            dino.y += dino.dy;

            // Ground collision
            const groundY = canvas.height - GROUND_HEIGHT - dino.height;
            if (dino.y > groundY) {
                dino.y = groundY;
                dino.dy = 0;
                dino.grounded = true;
            } else {
                dino.grounded = false;
            }

            // Spawn obstacles
            spawnObstacle();

            // Update obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                let obs = obstacles[i];
                obs.x -= currentGameSpeed;

                // Animate pterodactyl wings
                if (obs.type === 'pterodactyl' && frameCount % 10 === 0) {
                    obs.wingUp = !obs.wingUp;
                }

                // Update last obstacle position tracking
                if (obs.x + obs.width > lastObstacleX - MIN_OBSTACLE_GAP) {
                    lastObstacleX = obs.x + obs.width;
                }

                // Collision detection with forgiving hitbox
                const hitBoxPadding = 6;
                const dinoLeft = dino.x + hitBoxPadding;
                const dinoRight = dino.x + dino.width - hitBoxPadding;
                const dinoTop = dino.y + hitBoxPadding;
                const dinoBottom = dino.y + dino.height - hitBoxPadding;

                const obsLeft = obs.x + hitBoxPadding;
                const obsRight = obs.x + obs.width - hitBoxPadding;
                const obsTop = obs.y + hitBoxPadding;
                const obsBottom = obs.y + obs.height - hitBoxPadding;

                if (
                    dinoLeft < obsRight &&
                    dinoRight > obsLeft &&
                    dinoTop < obsBottom &&
                    dinoBottom > obsTop
                ) {
                    gameRunning = false;
                    gameStateRef.current = { gameRunning };
                    setIsGameOver(true);
                    setHighScore(prev => Math.max(prev, Math.floor(currentScore)));
                }

                // Remove off-screen obstacles
                if (obs.x + obs.width < 0) {
                    obstacles.splice(i, 1);
                }
            }

            // Score and Speed progression
            frameCount++;
            currentScore += 0.15 * gameSpeed;
            setScore(Math.floor(currentScore));

            // Gradual speed increase (slower progression)
            if (frameCount % 500 === 0 && currentGameSpeed < BASE_GAME_SPEED * 2) {
                currentGameSpeed += 0.3 * gameSpeed;
            }
        };

        const draw = () => {
            // Clear canvas with dark background
            ctx.fillStyle = '#0d0d15';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw cyberpunk grid ground
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 1;

            // Horizontal grid lines
            for (let i = 0; i < GROUND_HEIGHT; i += 10) {
                let y = canvas.height - GROUND_HEIGHT + i;
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }

            // Vertical grid lines with movement
            const gridOffset = (frameCount * currentGameSpeed) % 40;
            for (let i = 0; i < canvas.width + 40; i += 40) {
                let x = i - gridOffset;
                ctx.moveTo(x, canvas.height - GROUND_HEIGHT);
                ctx.lineTo(x - 20, canvas.height);
            }
            ctx.stroke();
            ctx.restore();

            // Ground line
            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 2);

            // Draw Dino (Minecraft Creeper style)
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

            // Face - different when ducking
            ctx.fillStyle = '#000';
            if (dino.ducking) {
                // Ducking face (squished)
                ctx.fillRect(dino.x + 8, dino.y + 4, 6, 6);
                ctx.fillRect(dino.x + 26, dino.y + 4, 6, 6);
                ctx.fillRect(dino.x + 16, dino.y + 14, 8, 8);
            } else {
                // Normal face
                ctx.fillRect(dino.x + 8, dino.y + 8, 8, 8);
                ctx.fillRect(dino.x + 24, dino.y + 8, 8, 8);
                ctx.fillRect(dino.x + 16, dino.y + 20, 8, 12);
                ctx.fillRect(dino.x + 12, dino.y + 26, 4, 6);
                ctx.fillRect(dino.x + 24, dino.y + 26, 4, 6);
            }

            // Draw obstacles
            obstacles.forEach(obs => {
                if (obs.type === 'pterodactyl') {
                    // Draw pterodactyl
                    ctx.fillStyle = '#a855f7'; // Purple
                    // Body
                    ctx.fillRect(obs.x + 10, obs.y + 12, 22, 12);
                    // Head
                    ctx.fillRect(obs.x + 32, obs.y + 10, 10, 10);
                    // Beak
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillRect(obs.x + 38, obs.y + 14, 6, 4);
                    // Wings
                    ctx.fillStyle = '#c084fc';
                    if (obs.wingUp) {
                        ctx.fillRect(obs.x + 12, obs.y, 18, 12);
                    } else {
                        ctx.fillRect(obs.x + 12, obs.y + 24, 18, 10);
                    }
                    // Eye
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(obs.x + 34, obs.y + 12, 4, 4);
                } else {
                    // Draw cactus (TNT style)
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                    // White band
                    ctx.fillStyle = '#fff';
                    const bandY = obs.y + obs.height * 0.3;
                    const bandHeight = obs.height * 0.35;
                    ctx.fillRect(obs.x, bandY, obs.width, bandHeight);
                    // TNT text
                    ctx.fillStyle = '#000';
                    ctx.font = `${Math.min(10, obs.width / 3)}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.fillText('TNT', obs.x + obs.width / 2, bandY + bandHeight * 0.7);
                }
            });

            // Draw ducking indicator
            if (dino.ducking) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = '12px monospace';
                ctx.fillText('DUCK!', dino.x + dino.width / 2 - 15, dino.y - 5);
            }
        };

        const loop = () => {
            update();
            draw();
            if (gameRunning) {
                animationFrameId = requestAnimationFrame(loop);
            }
        };

        loop();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isStarted, gameSpeed]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Speed Selection - shown before game starts */}
            {!isStarted && (
                <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-cyan-500/30">
                    <h3 className="text-cyan-400 font-mono mb-3 text-center">SELECT SPEED</h3>
                    <div className="flex gap-3">
                        {speedOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setGameSpeed(opt.value)}
                                className={`px-4 py-2 font-mono rounded transition-all ${
                                    gameSpeed === opt.value
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={startGame}
                        className="mt-4 w-full px-6 py-3 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 transition-all"
                    >
                        START GAME
                    </button>
                </div>
            )}

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="border-4 border-cyan-500 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                    style={{ imageRendering: 'pixelated' }}
                />

                {/* Start screen overlay */}
                {!isStarted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                        <div className="text-center font-mono">
                            <h2 className="text-4xl font-bold mb-4 text-cyan-400" style={{ textShadow: '0 0 10px cyan' }}>
                                DINO RUN
                            </h2>
                            <p className="text-gray-400 mb-2">Select speed above and click START</p>
                        </div>
                    </div>
                )}

                {/* Game over overlay */}
                {isGameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg backdrop-blur-sm">
                        <div className="text-white text-center font-mono">
                            <h2 className="text-4xl font-bold mb-2 text-red-500 animate-pulse" style={{ textShadow: '0 0 10px red' }}>
                                GAME OVER
                            </h2>
                            <p className="text-2xl mb-4 text-cyan-400">SCORE: {score}</p>
                            <p className="text-sm text-gray-300 animate-bounce">Press Space to Respawn</p>
                        </div>
                    </div>
                )}

                {/* Score display */}
                {isStarted && (
                    <div className="absolute top-4 right-4 font-mono font-bold text-xl tracking-widest" style={{ textShadow: '0 0 5px cyan' }}>
                        <div className="text-cyan-600">HI: {highScore.toString().padStart(5, '0')}</div>
                        <div className="text-cyan-400">SCORE: {score.toString().padStart(5, '0')}</div>
                    </div>
                )}

                {/* Speed indicator */}
                {isStarted && (
                    <div className="absolute top-4 left-4 font-mono text-sm text-cyan-600">
                        SPEED: {speedOptions.find(o => o.value === gameSpeed)?.label.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Controls help */}
            <div className="mt-6 text-cyan-700 dark:text-cyan-400 font-mono text-sm space-y-1 text-center">
                <p>[↑] or [SPACE] - JUMP</p>
                <p>[↓] - DUCK (hold to stay down)</p>
                <p className="text-gray-500 text-xs mt-2">Purple birds appear after 200 points - duck to avoid!</p>
            </div>
        </div>
    );
};

export default DinoGame;
