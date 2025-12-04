import React, { useEffect, useRef, useState, useCallback } from 'react';

const DinoGame = () => {
    const canvasRef = useRef(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isNight, setIsNight] = useState(false);
    const [theme, setTheme] = useState('dino'); // 'dino' or 'minecraft'
    const gameStateRef = useRef(null);

    // Difficulty settings
    const [difficulty, setDifficulty] = useState({
        initialSpeed: 5,
        acceleration: 0.3,
        obstacleFrequency: 1,
        pterodactylScore: 200,
    });

    // Preset difficulties
    const presets = {
        easy: { initialSpeed: 4, acceleration: 0.2, obstacleFrequency: 0.7, pterodactylScore: 300 },
        normal: { initialSpeed: 5, acceleration: 0.3, obstacleFrequency: 1, pterodactylScore: 200 },
        hard: { initialSpeed: 6, acceleration: 0.4, obstacleFrequency: 1.3, pterodactylScore: 150 },
        extreme: { initialSpeed: 7, acceleration: 0.5, obstacleFrequency: 1.6, pterodactylScore: 100 },
    };

    const startGame = useCallback(() => {
        setIsStarted(true);
        setIsGameOver(false);
        setScore(0);
        setIsNight(false);
        setShowSettings(false);
    }, []);

    useEffect(() => {
        if (!isStarted) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const currentTheme = theme;

        // Game constants
        const GRAVITY = 0.6;
        const JUMP_FORCE = -12;
        const GROUND_HEIGHT = 50;
        const DINO_WIDTH = 44;
        const DINO_HEIGHT = 47;
        const DINO_DUCK_HEIGHT = 30;
        const PTERODACTYL_WIDTH = 46;
        const PTERODACTYL_HEIGHT = 40;
        const DAY_NIGHT_CYCLE = 500;

        // Game state
        let dino = {
            x: 60,
            y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
            dy: 0,
            grounded: true,
            ducking: false,
            width: DINO_WIDTH,
            height: DINO_HEIGHT,
            legFrame: 0,
        };

        let obstacles = [];
        let clouds = [];
        let stars = [];
        let frameCount = 0;
        let currentGameSpeed = difficulty.initialSpeed;
        let currentScore = 0;
        let gameRunning = true;
        let nextSpawnFrame = 60;
        let nightMode = false;
        let transitionProgress = currentTheme === 'minecraft' ? 1 : 0;
        let lastCycleScore = 0;

        // Initialize clouds
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * canvas.width,
                y: 30 + Math.random() * 60,
                width: 40 + Math.random() * 30,
                speed: 0.5 + Math.random() * 0.5,
            });
        }

        // Initialize stars
        for (let i = 0; i < 30; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height - GROUND_HEIGHT - 50),
                size: 1 + Math.random() * 2,
                twinkle: Math.random() * Math.PI * 2,
            });
        }

        gameStateRef.current = { gameRunning };

        const handleKeyDown = (e) => {
            if (!gameStateRef.current?.gameRunning) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    restartGame();
                }
                return;
            }

            if ((e.code === 'Space' || e.code === 'ArrowUp') && dino.grounded && !dino.ducking) {
                e.preventDefault();
                dino.dy = JUMP_FORCE;
                dino.grounded = false;
            }

            if (e.code === 'ArrowDown') {
                e.preventDefault();
                if (!dino.ducking) {
                    dino.ducking = true;
                    dino.height = DINO_DUCK_HEIGHT;
                    if (dino.grounded) {
                        dino.y = canvas.height - GROUND_HEIGHT - DINO_DUCK_HEIGHT;
                    }
                }
                if (!dino.grounded) {
                    dino.dy = Math.max(dino.dy, 10);
                }
            }
        };

        const handleKeyUp = (e) => {
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
                legFrame: 0,
            };
            obstacles = [];
            frameCount = 0;
            currentGameSpeed = difficulty.initialSpeed;
            currentScore = 0;
            gameRunning = true;
            nextSpawnFrame = 60;
            nightMode = currentTheme === 'minecraft';
            transitionProgress = currentTheme === 'minecraft' ? 1 : 0;
            lastCycleScore = 0;
            gameStateRef.current = { gameRunning };
            setIsGameOver(false);
            setScore(0);
            setIsNight(currentTheme === 'minecraft');
            loop();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const spawnObstacle = () => {
            if (frameCount < nextSpawnFrame) return;

            const dayMultiplier = nightMode ? 1 : 1.3;
            const freqMultiplier = difficulty.obstacleFrequency;

            const minGapFrames = Math.floor((90 * dayMultiplier) / freqMultiplier);
            const maxGapFrames = Math.floor((180 * dayMultiplier) / freqMultiplier);
            nextSpawnFrame = frameCount + minGapFrames + Math.floor(Math.random() * (maxGapFrames - minGapFrames));

            const canSpawnFlying = currentScore > difficulty.pterodactylScore;
            const flyingChance = nightMode ? 0.4 : 0.25;
            const spawnFlying = canSpawnFlying && Math.random() < flyingChance;

            if (spawnFlying) {
                const heights = [
                    canvas.height - GROUND_HEIGHT - 75,
                    canvas.height - GROUND_HEIGHT - 55,
                    canvas.height - GROUND_HEIGHT - 95,
                ];
                obstacles.push({
                    x: canvas.width,
                    y: heights[Math.floor(Math.random() * 3)],
                    width: PTERODACTYL_WIDTH,
                    height: PTERODACTYL_HEIGHT,
                    type: 'flying',
                    wingUp: true,
                });
            } else {
                const variations = nightMode ? [
                    { width: 25, height: 50 },
                    { width: 30, height: 55 },
                    { width: 50, height: 45 },
                    { width: 17, height: 35, count: 3 },
                ] : [
                    { width: 17, height: 35 },
                    { width: 25, height: 45 },
                    { width: 34, height: 50 },
                    { width: 17, height: 35, count: 2 },
                ];
                const variation = variations[Math.floor(Math.random() * variations.length)];

                if (variation.count) {
                    const spacing = variation.width + 3;
                    for (let i = 0; i < variation.count; i++) {
                        obstacles.push({
                            x: canvas.width + i * spacing,
                            y: canvas.height - GROUND_HEIGHT - variation.height,
                            width: variation.width,
                            height: variation.height,
                            type: 'ground',
                        });
                    }
                } else {
                    obstacles.push({
                        x: canvas.width,
                        y: canvas.height - GROUND_HEIGHT - variation.height,
                        width: variation.width,
                        height: variation.height,
                        type: 'ground',
                    });
                }
            }
        };

        const update = () => {
            if (!gameRunning) return;

            dino.dy += GRAVITY;
            dino.y += dino.dy;

            const groundY = canvas.height - GROUND_HEIGHT - dino.height;
            if (dino.y > groundY) {
                dino.y = groundY;
                dino.dy = 0;
                dino.grounded = true;
            } else {
                dino.grounded = false;
            }

            if (dino.grounded && !dino.ducking) {
                dino.legFrame = Math.floor(frameCount / 5) % 2;
            }

            // Day/Night cycle (only for dino theme)
            if (currentTheme === 'dino') {
                const cycleNumber = Math.floor(currentScore / DAY_NIGHT_CYCLE);
                if (cycleNumber > lastCycleScore / DAY_NIGHT_CYCLE) {
                    lastCycleScore = cycleNumber * DAY_NIGHT_CYCLE;
                    nightMode = !nightMode;
                    setIsNight(nightMode);
                }

                if (nightMode && transitionProgress < 1) {
                    transitionProgress = Math.min(1, transitionProgress + 0.02);
                } else if (!nightMode && transitionProgress > 0) {
                    transitionProgress = Math.max(0, transitionProgress - 0.02);
                }
            }

            clouds.forEach(cloud => {
                cloud.x -= cloud.speed * (currentGameSpeed / 5);
                if (cloud.x + cloud.width < 0) {
                    cloud.x = canvas.width + Math.random() * 100;
                    cloud.y = 30 + Math.random() * 60;
                }
            });

            stars.forEach(star => {
                star.twinkle += 0.1;
            });

            spawnObstacle();

            for (let i = obstacles.length - 1; i >= 0; i--) {
                let obs = obstacles[i];
                obs.x -= currentGameSpeed;

                if (obs.type === 'flying' && frameCount % 8 === 0) {
                    obs.wingUp = !obs.wingUp;
                }

                const hitBoxPadding = 8;
                const dinoLeft = dino.x + hitBoxPadding;
                const dinoRight = dino.x + dino.width - hitBoxPadding;
                const dinoTop = dino.y + hitBoxPadding;
                const dinoBottom = dino.y + dino.height - hitBoxPadding;

                const obsLeft = obs.x + 4;
                const obsRight = obs.x + obs.width - 4;
                const obsTop = obs.y + 4;
                const obsBottom = obs.y + obs.height - 4;

                if (dinoLeft < obsRight && dinoRight > obsLeft && dinoTop < obsBottom && dinoBottom > obsTop) {
                    gameRunning = false;
                    gameStateRef.current = { gameRunning };
                    setIsGameOver(true);
                    setHighScore(prev => Math.max(prev, Math.floor(currentScore)));
                }

                if (obs.x + obs.width < 0) {
                    obstacles.splice(i, 1);
                }
            }

            frameCount++;
            currentScore += 0.15;
            setScore(Math.floor(currentScore));

            if (frameCount % 500 === 0 && currentGameSpeed < difficulty.initialSpeed * 2.5) {
                currentGameSpeed += difficulty.acceleration;
            }
        };

        // ==================== DRAW FUNCTIONS ====================

        const drawDinoTheme = () => {
            // Background
            const dayBg = { r: 247, g: 247, b: 247 };
            const nightBg = { r: 13, g: 13, b: 21 };
            const bgR = Math.round(dayBg.r + (nightBg.r - dayBg.r) * transitionProgress);
            const bgG = Math.round(dayBg.g + (nightBg.g - dayBg.g) * transitionProgress);
            const bgB = Math.round(dayBg.b + (nightBg.b - dayBg.b) * transitionProgress);
            ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars (night)
            if (transitionProgress > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${transitionProgress})`;
                stars.forEach(star => {
                    const twinkleSize = star.size * (0.5 + 0.5 * Math.sin(star.twinkle));
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, twinkleSize, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Moon
                ctx.fillStyle = `rgba(255, 255, 240, ${transitionProgress})`;
                ctx.beginPath();
                ctx.arc(650, 60, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(200, 200, 190, ${transitionProgress * 0.5})`;
                ctx.beginPath();
                ctx.arc(645, 55, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(660, 65, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Clouds
            const cloudAlpha = 1 - transitionProgress * 0.7;
            ctx.fillStyle = transitionProgress > 0.5
                ? `rgba(60, 60, 80, ${cloudAlpha})`
                : `rgba(200, 200, 200, ${cloudAlpha})`;
            clouds.forEach(cloud => {
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.width * 0.25, cloud.y - 5, cloud.width * 0.25, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.width * 0.5, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
                ctx.fill();
            });

            // Ground
            const groundColor = transitionProgress > 0.5 ? '#00ffcc' : '#535353';
            ctx.fillStyle = groundColor;
            ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 2);

            const groundOffset = (frameCount * currentGameSpeed) % 20;
            ctx.fillStyle = transitionProgress > 0.5 ? 'rgba(0, 255, 204, 0.3)' : 'rgba(83, 83, 83, 0.5)';
            for (let i = -groundOffset; i < canvas.width; i += 20) {
                ctx.fillRect(i, canvas.height - GROUND_HEIGHT + 10, 10, 2);
            }
            for (let i = -groundOffset + 7; i < canvas.width; i += 15) {
                ctx.fillRect(i, canvas.height - GROUND_HEIGHT + 20, 5, 2);
            }

            // T-Rex
            const dinoColor = transitionProgress > 0.5 ? '#4ade80' : '#535353';
            ctx.fillStyle = dinoColor;

            if (dino.ducking) {
                ctx.fillRect(dino.x, dino.y + 5, 44, 20);
                ctx.fillRect(dino.x + 35, dino.y, 15, 15);
                ctx.fillStyle = transitionProgress > 0.5 ? '#000' : '#fff';
                ctx.fillRect(dino.x + 42, dino.y + 3, 4, 4);
                ctx.fillStyle = dinoColor;
                if (dino.legFrame === 0) {
                    ctx.fillRect(dino.x + 5, dino.y + 22, 6, 8);
                    ctx.fillRect(dino.x + 25, dino.y + 22, 6, 8);
                } else {
                    ctx.fillRect(dino.x + 10, dino.y + 22, 6, 8);
                    ctx.fillRect(dino.x + 20, dino.y + 22, 6, 8);
                }
            } else {
                ctx.fillRect(dino.x + 18, dino.y, 26, 22);
                ctx.fillStyle = transitionProgress > 0.5 ? '#000' : '#fff';
                ctx.fillRect(dino.x + 34, dino.y + 4, 6, 6);
                ctx.fillStyle = dinoColor;
                ctx.fillRect(dino.x + 4, dino.y + 18, 32, 20);
                ctx.fillRect(dino.x, dino.y + 20, 10, 12);
                ctx.fillRect(dino.x + 28, dino.y + 25, 8, 5);
                if (!dino.grounded) {
                    ctx.fillRect(dino.x + 8, dino.y + 36, 8, 11);
                    ctx.fillRect(dino.x + 20, dino.y + 36, 8, 11);
                } else if (dino.legFrame === 0) {
                    ctx.fillRect(dino.x + 8, dino.y + 36, 8, 11);
                    ctx.fillRect(dino.x + 24, dino.y + 36, 8, 6);
                } else {
                    ctx.fillRect(dino.x + 8, dino.y + 36, 8, 6);
                    ctx.fillRect(dino.x + 24, dino.y + 36, 8, 11);
                }
            }

            // Obstacles
            obstacles.forEach(obs => {
                if (obs.type === 'flying') {
                    // Pterodactyl
                    const birdColor = transitionProgress > 0.5 ? '#a855f7' : '#535353';
                    ctx.fillStyle = birdColor;
                    ctx.fillRect(obs.x + 8, obs.y + 18, 30, 10);
                    ctx.fillRect(obs.x + 32, obs.y + 14, 14, 14);
                    ctx.fillStyle = transitionProgress > 0.5 ? '#fbbf24' : '#888';
                    ctx.fillRect(obs.x + 40, obs.y + 18, 8, 5);
                    ctx.fillStyle = birdColor;
                    if (obs.wingUp) {
                        ctx.fillRect(obs.x + 10, obs.y, 24, 18);
                        ctx.fillRect(obs.x + 14, obs.y - 6, 16, 8);
                    } else {
                        ctx.fillRect(obs.x + 10, obs.y + 28, 24, 14);
                    }
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(obs.x + 36, obs.y + 17, 5, 5);
                } else {
                    // Cactus
                    const cactusColor = transitionProgress > 0.5 ? '#22c55e' : '#535353';
                    ctx.fillStyle = cactusColor;
                    ctx.fillRect(obs.x + obs.width * 0.3, obs.y, obs.width * 0.4, obs.height);
                    if (obs.height > 40) {
                        ctx.fillRect(obs.x, obs.y + obs.height * 0.3, obs.width * 0.35, obs.height * 0.15);
                        ctx.fillRect(obs.x, obs.y + obs.height * 0.15, obs.width * 0.15, obs.height * 0.3);
                        ctx.fillRect(obs.x + obs.width * 0.65, obs.y + obs.height * 0.5, obs.width * 0.35, obs.height * 0.12);
                        ctx.fillRect(obs.x + obs.width * 0.85, obs.y + obs.height * 0.35, obs.width * 0.15, obs.height * 0.27);
                    }
                    ctx.fillStyle = transitionProgress > 0.5 ? '#15803d' : '#333';
                    for (let i = 0; i < 4; i++) {
                        ctx.fillRect(obs.x + obs.width * 0.25, obs.y + 5 + i * 12, 2, 2);
                        ctx.fillRect(obs.x + obs.width * 0.7, obs.y + 8 + i * 12, 2, 2);
                    }
                }
            });

            // Day/Night indicator
            ctx.fillStyle = transitionProgress > 0.5 ? '#00ffcc' : '#535353';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(transitionProgress > 0.5 ? 'NIGHT' : 'DAY', 10, 20);
        };

        const drawMinecraftTheme = () => {
            // Cyberpunk dark background
            ctx.fillStyle = '#0d0d15';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            stars.forEach(star => {
                const twinkleSize = star.size * (0.5 + 0.5 * Math.sin(star.twinkle));
                ctx.beginPath();
                ctx.arc(star.x, star.y, twinkleSize, 0, Math.PI * 2);
                ctx.fill();
            });

            // Cyberpunk grid ground
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 1;

            for (let i = 0; i < GROUND_HEIGHT; i += 10) {
                let y = canvas.height - GROUND_HEIGHT + i;
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }

            const gridOffset = (frameCount * currentGameSpeed) % 40;
            for (let i = 0; i < canvas.width + 40; i += 40) {
                let x = i - gridOffset;
                ctx.moveTo(x, canvas.height - GROUND_HEIGHT);
                ctx.lineTo(x - 20, canvas.height);
            }
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 2);

            // Creeper
            ctx.fillStyle = '#4ade80';
            const creeperW = 40;
            const creeperH = dino.ducking ? 26 : 44;
            ctx.fillRect(dino.x, dino.y, creeperW, creeperH);

            // Creeper face
            ctx.fillStyle = '#000';
            if (dino.ducking) {
                // Squished face
                ctx.fillRect(dino.x + 6, dino.y + 4, 6, 6);
                ctx.fillRect(dino.x + 28, dino.y + 4, 6, 6);
                ctx.fillRect(dino.x + 16, dino.y + 12, 8, 10);
            } else {
                // Normal face
                ctx.fillRect(dino.x + 8, dino.y + 8, 8, 8);
                ctx.fillRect(dino.x + 24, dino.y + 8, 8, 8);
                ctx.fillRect(dino.x + 16, dino.y + 20, 8, 12);
                ctx.fillRect(dino.x + 12, dino.y + 26, 4, 6);
                ctx.fillRect(dino.x + 24, dino.y + 26, 4, 6);
            }

            // Obstacles
            obstacles.forEach(obs => {
                if (obs.type === 'flying') {
                    // Ghast (flying white block)
                    ctx.fillStyle = '#e5e5e5';
                    ctx.fillRect(obs.x + 5, obs.y + 5, 36, 30);

                    // Ghast face
                    ctx.fillStyle = '#333';
                    // Closed/open eyes based on wing animation
                    if (obs.wingUp) {
                        ctx.fillRect(obs.x + 12, obs.y + 12, 6, 8);
                        ctx.fillRect(obs.x + 28, obs.y + 12, 6, 8);
                    } else {
                        ctx.fillRect(obs.x + 12, obs.y + 14, 6, 4);
                        ctx.fillRect(obs.x + 28, obs.y + 14, 6, 4);
                    }
                    // Mouth
                    ctx.fillRect(obs.x + 18, obs.y + 24, 10, 6);

                    // Tentacles
                    ctx.fillStyle = '#ccc';
                    const tentacleOffset = obs.wingUp ? 0 : 3;
                    ctx.fillRect(obs.x + 8, obs.y + 35, 4, 8 + tentacleOffset);
                    ctx.fillRect(obs.x + 18, obs.y + 35, 4, 10 + tentacleOffset);
                    ctx.fillRect(obs.x + 28, obs.y + 35, 4, 6 + tentacleOffset);
                    ctx.fillRect(obs.x + 38, obs.y + 35, 4, 9 + tentacleOffset);
                } else {
                    // TNT block
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

                    // White band
                    ctx.fillStyle = '#fff';
                    const bandY = obs.y + obs.height * 0.3;
                    const bandHeight = obs.height * 0.35;
                    ctx.fillRect(obs.x, bandY, obs.width, bandHeight);

                    // TNT text
                    ctx.fillStyle = '#000';
                    ctx.font = `bold ${Math.min(12, obs.width / 2.5)}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.fillText('TNT', obs.x + obs.width / 2, bandY + bandHeight * 0.75);

                    // Top/bottom dark bands
                    ctx.fillStyle = '#991b1b';
                    ctx.fillRect(obs.x, obs.y, obs.width, 4);
                    ctx.fillRect(obs.x, obs.y + obs.height - 4, obs.width, 4);
                }
            });

            // Ducking indicator
            if (dino.ducking) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('DUCK!', dino.x + 20, dino.y - 5);
            }

            // Theme indicator
            ctx.fillStyle = '#00ffcc';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('MINECRAFT', 10, 20);
        };

        const draw = () => {
            if (currentTheme === 'minecraft') {
                drawMinecraftTheme();
            } else {
                drawDinoTheme();
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
    }, [isStarted, difficulty, theme]);

    const DifficultySlider = ({ label, value, min, max, step, onChange, description }) => (
        <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{label}</span>
                <span className="text-cyan-400 font-mono">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Settings Panel */}
            {!isStarted && (
                <div className="mb-6 p-4 bg-gray-900/80 rounded-lg border border-cyan-500/30 w-full max-w-md">
                    <h3 className="text-cyan-400 font-mono mb-4 text-center text-lg">GAME SETTINGS</h3>

                    {/* Theme Selection */}
                    <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Theme:</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setTheme('dino')}
                                className={`px-3 py-2 font-mono text-sm rounded transition-all flex items-center justify-center gap-2 ${
                                    theme === 'dino'
                                        ? 'bg-green-500 text-black'
                                        : 'bg-gray-800 text-green-400 hover:bg-gray-700'
                                }`}
                            >
                                <span>🦖</span> T-Rex
                            </button>
                            <button
                                onClick={() => setTheme('minecraft')}
                                className={`px-3 py-2 font-mono text-sm rounded transition-all flex items-center justify-center gap-2 ${
                                    theme === 'minecraft'
                                        ? 'bg-green-500 text-black'
                                        : 'bg-gray-800 text-green-400 hover:bg-gray-700'
                                }`}
                            >
                                <span>💥</span> Creeper
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            {theme === 'dino' ? 'Chrome-style with day/night cycle' : 'Minecraft-style with TNT & Ghasts'}
                        </p>
                    </div>

                    {/* Preset Buttons */}
                    <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Difficulty:</p>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(presets).map(([name, preset]) => (
                                <button
                                    key={name}
                                    onClick={() => setDifficulty(preset)}
                                    className={`px-2 py-1.5 font-mono text-xs rounded transition-all capitalize ${
                                        JSON.stringify(difficulty) === JSON.stringify(preset)
                                            ? 'bg-cyan-500 text-black'
                                            : 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggle Advanced Settings */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="w-full mb-4 py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                        {showSettings ? '▼ Hide Advanced Settings' : '▶ Show Advanced Settings'}
                    </button>

                    {/* Advanced Settings */}
                    {showSettings && (
                        <div className="mb-4 p-3 bg-gray-800/50 rounded">
                            <DifficultySlider
                                label="Initial Speed"
                                value={difficulty.initialSpeed}
                                min={3}
                                max={8}
                                step={0.5}
                                onChange={(v) => setDifficulty(d => ({ ...d, initialSpeed: v }))}
                                description="Starting game speed"
                            />
                            <DifficultySlider
                                label="Acceleration"
                                value={difficulty.acceleration}
                                min={0.1}
                                max={0.6}
                                step={0.1}
                                onChange={(v) => setDifficulty(d => ({ ...d, acceleration: v }))}
                                description="How fast speed increases"
                            />
                            <DifficultySlider
                                label="Obstacle Frequency"
                                value={difficulty.obstacleFrequency}
                                min={0.5}
                                max={2}
                                step={0.1}
                                onChange={(v) => setDifficulty(d => ({ ...d, obstacleFrequency: v }))}
                                description="How often obstacles appear"
                            />
                            <DifficultySlider
                                label="Flying Enemy Threshold"
                                value={difficulty.pterodactylScore}
                                min={100}
                                max={500}
                                step={50}
                                onChange={(v) => setDifficulty(d => ({ ...d, pterodactylScore: v }))}
                                description="Score when flying enemies appear"
                            />
                        </div>
                    )}

                    <button
                        onClick={startGame}
                        className="w-full px-6 py-3 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 transition-all text-lg"
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
                    className={`rounded-lg shadow-lg transition-all duration-500 ${
                        theme === 'minecraft' || isNight
                            ? 'border-4 border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                            : 'border-4 border-gray-400 shadow-[0_0_10px_rgba(0,0,0,0.2)]'
                    }`}
                    style={{ imageRendering: 'pixelated' }}
                />

                {/* Start overlay */}
                {!isStarted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                        <div className="text-center font-mono">
                            <h2 className="text-4xl font-bold mb-2 text-cyan-400" style={{ textShadow: '0 0 10px cyan' }}>
                                {theme === 'dino' ? 'DINO RUN' : 'CREEPER RUN'}
                            </h2>
                            <p className="text-2xl mb-4">{theme === 'dino' ? '🦖' : '💥'}</p>
                            <p className="text-gray-400 text-sm">Configure settings above</p>
                        </div>
                    </div>
                )}

                {/* Game over */}
                {isGameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg backdrop-blur-sm">
                        <div className="text-white text-center font-mono">
                            <h2 className="text-4xl font-bold mb-2 text-red-500 animate-pulse" style={{ textShadow: '0 0 10px red' }}>
                                GAME OVER
                            </h2>
                            <p className="text-2xl mb-4 text-cyan-400">SCORE: {score}</p>
                            <p className="text-sm text-gray-300 animate-bounce">Press Space to Restart</p>
                        </div>
                    </div>
                )}

                {/* Score */}
                {isStarted && (
                    <div className={`absolute top-4 right-4 font-mono font-bold text-xl tracking-widest transition-colors duration-500 ${
                        theme === 'minecraft' || isNight ? 'text-cyan-400' : 'text-gray-700'
                    }`}>
                        <div className={theme === 'minecraft' || isNight ? 'text-cyan-600' : 'text-gray-500'}>
                            HI: {highScore.toString().padStart(5, '0')}
                        </div>
                        <div>SCORE: {score.toString().padStart(5, '0')}</div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className={`mt-6 font-mono text-sm space-y-1 text-center transition-colors duration-500 ${
                theme === 'minecraft' || isNight ? 'text-cyan-400' : 'text-gray-600'
            }`}>
                <p>[↑] or [SPACE] - JUMP</p>
                <p>[↓] - DUCK (hold to stay down)</p>
                <p className="text-xs mt-2 opacity-60">
                    {theme === 'dino'
                        ? 'Day/Night changes every 500 points - Night is harder!'
                        : 'Avoid TNT blocks and Ghasts!'}
                </p>
            </div>
        </div>
    );
};

export default DinoGame;
