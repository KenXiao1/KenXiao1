import React, { useEffect, useRef, useState } from 'react';

const DinoGame = () => {
    const canvasRef = useRef(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Game constants
        const GRAVITY = 0.6;
        const JUMP_FORCE = -11; // Slightly higher jump
        const GROUND_HEIGHT = 40; // Taller ground for grid effect
        const DINO_WIDTH = 40;
        const DINO_HEIGHT = 40;
        const OBSTACLE_WIDTH = 30;
        const OBSTACLE_HEIGHT = 40;
        const GAME_SPEED_START = 4; // Slower start speed

        // Game state
        let dino = {
            x: 50,
            y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
            dy: 0,
            grounded: true,
        };

        let obstacles = [];
        let frameCount = 0;
        let gameSpeed = GAME_SPEED_START;
        let currentScore = 0;
        let gameRunning = true;

        const handleKeyDown = (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && dino.grounded && gameRunning) {
                dino.dy = JUMP_FORCE;
                dino.grounded = false;
            }
            if (!gameRunning && (e.code === 'Space' || e.code === 'Enter')) {
                restartGame();
            }
        };

        const restartGame = () => {
            dino = {
                x: 50,
                y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
                dy: 0,
                grounded: true,
            };
            obstacles = [];
            frameCount = 0;
            gameSpeed = GAME_SPEED_START;
            currentScore = 0;
            gameRunning = true;
            setIsGameOver(false);
            setScore(0);
            loop();
        }

        window.addEventListener('keydown', handleKeyDown);

        const spawnObstacle = () => {
            // Increased spawn interval for easier difficulty
            // Minimum 120 frames (approx 2 seconds at 60fps) between obstacles
            if (frameCount % Math.floor(Math.random() * 60 + 120) === 0) {
                obstacles.push({
                    x: canvas.width,
                    y: canvas.height - GROUND_HEIGHT - OBSTACLE_HEIGHT,
                    width: OBSTACLE_WIDTH,
                    height: OBSTACLE_HEIGHT,
                });
            }
        };

        const update = () => {
            if (!gameRunning) return;

            // Dino physics
            dino.dy += GRAVITY;
            dino.y += dino.dy;

            // Ground collision
            if (dino.y + DINO_HEIGHT > canvas.height - GROUND_HEIGHT) {
                dino.y = canvas.height - GROUND_HEIGHT - DINO_HEIGHT;
                dino.dy = 0;
                dino.grounded = true;
            }

            // Obstacles
            spawnObstacle();

            for (let i = obstacles.length - 1; i >= 0; i--) {
                let obs = obstacles[i];
                obs.x -= gameSpeed;

                // Collision detection
                // Shrink hit box slightly to be more forgiving
                const hitBoxPadding = 5;
                if (
                    dino.x + hitBoxPadding < obs.x + obs.width - hitBoxPadding &&
                    dino.x + DINO_WIDTH - hitBoxPadding > obs.x + hitBoxPadding &&
                    dino.y + hitBoxPadding < obs.y + obs.height - hitBoxPadding &&
                    dino.y + DINO_HEIGHT - hitBoxPadding > obs.y + hitBoxPadding
                ) {
                    gameRunning = false;
                    setIsGameOver(true);
                    setHighScore(prev => Math.max(prev, Math.floor(currentScore)));
                }

                // Remove off-screen obstacles
                if (obs.x + obs.width < 0) {
                    obstacles.splice(i, 1);
                }
            }

            // Score and Speed
            frameCount++;
            currentScore += 0.1;
            setScore(Math.floor(currentScore));
            // Increase speed much slower
            if (frameCount % 1000 === 0) {
                gameSpeed += 0.2;
            }
        };

        const draw = () => {
            // Clear canvas with Cyberpunk Dark Background
            ctx.fillStyle = '#0d0d15'; // Very dark blue/black
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Cyberpunk Grid (Perspective effect on ground)
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = '#00ffcc'; // Neon Cyan
            ctx.lineWidth = 1;

            // Horizontal grid lines
            for (let i = 0; i < GROUND_HEIGHT; i += 10) {
                let y = canvas.height - GROUND_HEIGHT + i;
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }

            // Vertical grid lines (moving with game speed to create illusion of speed)
            const gridOffset = (frameCount * gameSpeed) % 40;
            for (let i = 0; i < canvas.width + 40; i += 40) {
                let x = i - gridOffset;
                ctx.moveTo(x, canvas.height - GROUND_HEIGHT);
                ctx.lineTo(x - 20, canvas.height); // Slanted for perspective
            }
            ctx.stroke();
            ctx.restore();

            // Draw Ground Line
            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 2);

            // Draw Dino (Minecraft Creeper Style)
            // Body
            ctx.fillStyle = '#4ade80'; // Bright Green
            ctx.fillRect(dino.x, dino.y, DINO_WIDTH, DINO_HEIGHT);
            // Face (Pixelated)
            ctx.fillStyle = '#000';
            // Eyes
            ctx.fillRect(dino.x + 8, dino.y + 8, 8, 8);
            ctx.fillRect(dino.x + 24, dino.y + 8, 8, 8);
            // Mouth
            ctx.fillRect(dino.x + 16, dino.y + 20, 8, 12);
            ctx.fillRect(dino.x + 12, dino.y + 26, 4, 6);
            ctx.fillRect(dino.x + 24, dino.y + 26, 4, 6);

            // Draw Obstacles (Minecraft TNT Style)
            obstacles.forEach(obs => {
                // Red block
                ctx.fillStyle = '#ef4444'; // Red
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                // White band
                ctx.fillStyle = '#fff';
                ctx.fillRect(obs.x, obs.y + 12, obs.width, 16);
                // "TNT" Text (Simplified as black dots/lines)
                ctx.fillStyle = '#000';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('TNT', obs.x + obs.width / 2, obs.y + 24);
            });
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
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="border-4 border-cyan-500 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                    style={{ imageRendering: 'pixelated' }}
                />
                {isGameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg backdrop-blur-sm">
                        <div className="text-white text-center font-mono">
                            <h2 className="text-4xl font-bold mb-2 text-red-500 animate-pulse" style={{ textShadow: '0 0 10px red' }}>GAME OVER</h2>
                            <p className="text-2xl mb-4 text-cyan-400">SCORE: {score}</p>
                            <p className="text-sm text-gray-300 animate-bounce">Press Space to Respawn</p>
                        </div>
                    </div>
                )}
                <div className="absolute top-4 right-4 font-mono font-bold text-xl tracking-widest" style={{ textShadow: '0 0 5px cyan' }}>
                    <div className="text-cyan-600">HI: {highScore.toString().padStart(5, '0')}</div>
                    <div className="text-cyan-400">SCORE: {score.toString().padStart(5, '0')}</div>
                </div>
            </div>
            <div className="mt-6 text-cyan-700 dark:text-cyan-400 font-mono text-sm">
                <p>[SPACE] to JUMP // Avoid the TNT</p>
            </div>
        </div>
    );
};

export default DinoGame;
