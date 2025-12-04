import React, { useEffect, useRef, useState } from 'react';

const SurfGame = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [theme, setTheme] = useState('surf'); // 'surf', 'lava', 'cyberpunk'
    const [ammo, setAmmo] = useState(10);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Assets refs (Dictionary of themes)
    const assets = useRef({
        surf: { surfer: null, obstacle: null, bg: null },
        lava: { surfer: null, obstacle: null, bg: null },
        cyberpunk: { surfer: null, obstacle: null, bg: null },
        ski: { surfer: null, obstacle: null, bg: null }
    });

    // Game state ref to ensure cleanup has access to latest state
    const gameRunningRef = useRef(false);
    const animationFrameIdRef = useRef(null);
    const keyDownHandlerRef = useRef(null);

    useEffect(() => {
        // Load assets for all themes
        const loadAssets = async () => {
            const loadOne = (src) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve(img);
                    img.onerror = () => {
                        console.warn(`Failed to load ${src}`);
                        resolve(null); // Resolve null on error to avoid blocking
                    };
                });
            };

            const themes = ['surf', 'lava', 'cyberpunk', 'ski'];
            const promises = [];

            themes.forEach(t => {
                const basePath = t === 'surf' ? '/games/surf' : `/games/surf/${t}`;
                // Handle inconsistent naming if necessary, but assuming standard names for now
                // Original surf assets: surfer.png, obstacle.png, water-bg.png
                // New assets: player.png, objects.png, bg.png
                // We'll map them.

                let pImg = t === 'surf' ? 'surfer.png' : 'player.png';
                let oImg = t === 'surf' ? 'obstacle.png' : 'objects.png';
                let bImg = t === 'surf' ? 'water-bg.png' : 'bg.png';

                promises.push(loadOne(`${basePath}/${pImg}`).then(img => assets.current[t].surfer = img));
                promises.push(loadOne(`${basePath}/${oImg}`).then(img => assets.current[t].obstacle = img));
                promises.push(loadOne(`${basePath}/${bImg}`).then(img => assets.current[t].bg = img));
            });

            await Promise.all(promises);
            setAssetsLoaded(true);
        };

        loadAssets();
    }, []);

    useEffect(() => {
        if (!assetsLoaded) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Game constants
        const PLAYER_WIDTH = 50;
        const PLAYER_HEIGHT = 50;
        const OBSTACLE_SIZE = 40;
        const BULLET_WIDTH = 10;
        const BULLET_HEIGHT = 20;
        const NUM_LANES = 5;
        const LANE_WIDTH = canvas.width / NUM_LANES;
        const GAME_SPEED_START = 5;

        // Game state
        let player = {
            x: 0,
            y: canvas.height - PLAYER_HEIGHT - 50,
            lane: 2,
        };

        const getLaneX = (laneIndex) => {
            return (laneIndex * LANE_WIDTH) + (LANE_WIDTH / 2) - (PLAYER_WIDTH / 2);
        }

        player.x = getLaneX(player.lane);

        let obstacles = [];
        let bullets = [];
        let frameCount = 0;
        let gameSpeed = GAME_SPEED_START;
        let currentScore = 0;
        let bgOffsetY = 0;
        let currentAmmo = 10; // Local state for loop

        // Sync local ammo with react state on start
        currentAmmo = ammo;

        // Reset game running state
        gameRunningRef.current = true;

        const handleKeyDown = (e) => {
            if (!gameRunningRef.current) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    restartGame();
                }
                return;
            }

            if (e.code === 'ArrowLeft' && player.lane > 0) {
                player.lane--;
            } else if (e.code === 'ArrowRight' && player.lane < NUM_LANES - 1) {
                player.lane++;
            } else if (e.code === 'Space' || e.code === 'ArrowDown') {
                shoot();
            }
        };

        const shoot = () => {
            if (currentAmmo > 0) {
                currentAmmo--;
                setAmmo(currentAmmo);
                bullets.push({
                    x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
                    y: player.y,
                    width: BULLET_WIDTH,
                    height: BULLET_HEIGHT
                });
            }
        };

        const restartGame = () => {
            // Stop existing loop
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }

            // Reset all game state
            player.lane = 2;
            player.x = getLaneX(2);
            obstacles = [];
            bullets = [];
            frameCount = 0;
            gameSpeed = GAME_SPEED_START;
            currentScore = 0;
            bgOffsetY = 0;
            gameRunningRef.current = true;
            setIsGameOver(false);
            setScore(0);
            currentAmmo = 10;
            setAmmo(10);

            // Start new loop
            loop();
        }

        // Store handler reference for cleanup
        keyDownHandlerRef.current = handleKeyDown;
        window.addEventListener('keydown', handleKeyDown);

        const spawnObstacle = () => {
            if (frameCount % Math.floor(Math.random() * 30 + 40) === 0) {
                const lane = Math.floor(Math.random() * NUM_LANES);
                obstacles.push({
                    x: getLaneX(lane) + (PLAYER_WIDTH - OBSTACLE_SIZE) / 2,
                    y: -OBSTACLE_SIZE,
                    width: OBSTACLE_SIZE,
                    height: OBSTACLE_SIZE,
                    lane: lane
                });
            }
        };

        const update = () => {
            if (!gameRunningRef.current) return;

            // Smooth lane transition
            const targetX = getLaneX(player.lane);
            player.x += (targetX - player.x) * 0.2;

            // Background scroll
            bgOffsetY += gameSpeed * 0.5;
            if (bgOffsetY >= canvas.height) bgOffsetY = 0;

            // Obstacles
            spawnObstacle();

            // Update Bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                let b = bullets[i];
                b.y -= 10; // Bullet speed

                // Remove off-screen bullets
                if (b.y < -50) {
                    bullets.splice(i, 1);
                    continue;
                }

                // Bullet Collision with Obstacles
                for (let j = obstacles.length - 1; j >= 0; j--) {
                    let obs = obstacles[j];
                    if (
                        b.x < obs.x + obs.width &&
                        b.x + b.width > obs.x &&
                        b.y < obs.y + obs.height &&
                        b.y + b.height > obs.y
                    ) {
                        // Hit!
                        obstacles.splice(j, 1);
                        bullets.splice(i, 1);
                        currentScore += 5; // Bonus score
                        break; // Bullet destroyed
                    }
                }
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                let obs = obstacles[i];
                obs.y += gameSpeed;

                // Collision detection (slightly smaller hitbox than sprite)
                const hitboxPadding = 10;
                if (
                    player.x + hitboxPadding < obs.x + obs.width - hitboxPadding &&
                    player.x + PLAYER_WIDTH - hitboxPadding > obs.x + hitboxPadding &&
                    player.y + hitboxPadding < obs.y + obs.height - hitboxPadding &&
                    player.y + PLAYER_HEIGHT - hitboxPadding > obs.y + hitboxPadding
                ) {
                    gameRunningRef.current = false;
                    setIsGameOver(true);
                    setHighScore(prev => Math.max(prev, Math.floor(currentScore)));
                }

                if (obs.y > canvas.height) {
                    obstacles.splice(i, 1);
                }
            }

            frameCount++;
            currentScore += 0.1;
            setScore(Math.floor(currentScore));
            if (frameCount % 600 === 0) {
                gameSpeed += 0.5;
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentAssets = assets.current[theme];

            // Draw Background
            if (currentAssets.bg) {
                const pattern = ctx.createPattern(currentAssets.bg, 'repeat');
                ctx.fillStyle = pattern || '#b2ebf2';
                ctx.save();
                ctx.translate(0, bgOffsetY);
                ctx.fillRect(0, -bgOffsetY, canvas.width, canvas.height + bgOffsetY);
                ctx.restore();
            } else {
                // Fallback colors
                ctx.fillStyle = theme === 'lava' ? '#330000' : (theme === 'cyberpunk' ? '#000033' : (theme === 'ski' ? '#e0f7fa' : '#b2ebf2'));
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw Bullets
            ctx.fillStyle = 'red';
            bullets.forEach(b => {
                ctx.fillRect(b.x, b.y, b.width, b.height);
            });

            // Draw Obstacles
            obstacles.forEach(obs => {
                if (currentAssets.obstacle) {
                    // If using spritesheet (like original objects.png), we need to crop.
                    // For simplicity, assuming single image or drawing full image for now.
                    // If objects.png is a spritesheet, we might need logic to pick a sprite.
                    // Given the previous code just drew the whole image, we'll stick to that unless it looks weird.
                    // Ideally we'd have sprite logic, but for placeholders/simple port, this is okay.
                    ctx.drawImage(currentAssets.obstacle, obs.x, obs.y, obs.width, obs.height);
                } else {
                    ctx.fillStyle = theme === 'lava' ? '#ff0000' : (theme === 'ski' ? '#4fc3f7' : '#795548');
                    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                }
            });

            // Draw Player
            if (currentAssets.surfer) {
                ctx.drawImage(currentAssets.surfer, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
            } else {
                ctx.fillStyle = '#ff9800';
                ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
            }
        };

        const loop = () => {
            try {
                update();
                draw();
                if (gameRunningRef.current) {
                    animationFrameIdRef.current = requestAnimationFrame(loop);
                }
            } catch (e) {
                console.error("Game Loop Error:", e);
                gameRunningRef.current = false;
            }
        };

        loop();

        return () => {
            if (keyDownHandlerRef.current) {
                window.removeEventListener('keydown', keyDownHandlerRef.current);
            }
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            gameRunningRef.current = false;
        };
    }, [assetsLoaded, theme]); // Re-run if theme changes

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="mb-4 flex gap-4">
                <select
                    value={theme}
                    onChange={(e) => {
                        setTheme(e.target.value);
                    }}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                    <option value="surf">Surf</option>
                    <option value="lava">Lava</option>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="ski">Ski</option>
                </select>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded font-mono">
                    Ammo: {ammo}
                </div>
                <button
                    onClick={toggleFullscreen}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                    {isFullscreen ? '🗗' : '⛶'}
                </button>
            </div>

            <div ref={containerRef} className="relative group"
                style={isFullscreen ? {
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: theme === 'lava' ? '#330000' : (theme === 'cyberpunk' ? '#000033' : (theme === 'ski' ? '#e0f7fa' : '#b2ebf2'))
                } : {}}>
                {!assetsLoaded && <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">Loading assets...</div>}
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={600}
                    className={`border-4 rounded-xl shadow-2xl ${theme === 'lava' ? 'border-red-600 bg-red-900' :
                        theme === 'cyberpunk' ? 'border-purple-500 bg-gray-900' :
                            theme === 'ski' ? 'border-cyan-300 bg-cyan-100' :
                                'border-blue-400 bg-blue-200'
                        }`}
                    style={{ imageRendering: 'pixelated' }}
                />
                {isGameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg backdrop-blur-sm">
                        <div className="text-white text-center p-6 bg-white/10 rounded-xl border border-white/20 shadow-xl">
                            <h2 className="text-4xl font-bold mb-2 text-yellow-400 drop-shadow-md">WIPEOUT!</h2>
                            <p className="text-2xl mb-6 font-mono">Score: {score}</p>
                            <button
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { 'code': 'Space' }))}
                                className="px-6 py-2 bg-yellow-400 text-blue-900 font-bold rounded-full hover:bg-yellow-300 transition transform hover:scale-105 active:scale-95 shadow-lg"
                            >
                                TRY AGAIN
                            </button>
                            <p className="text-xs mt-4 opacity-70">Press Space or Enter</p>
                        </div>
                    </div>
                )}
                <div className="absolute top-4 right-4 font-mono font-bold text-white drop-shadow-md text-right">
                    <div className="text-sm opacity-80">HI: {highScore}</div>
                    <div className="text-2xl">{score}</div>
                </div>
            </div>
            <div className="mt-6 text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">←</span>
                <span>DODGE</span>
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">→</span>
                <span className="ml-4 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">SPACE</span>
                <span>SHOOT</span>
            </div>
        </div>
    );
};

export default SurfGame;
