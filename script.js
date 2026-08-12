/* ==========================================================================
   JavaScript Logic - Birthday Greeting & Memories Web
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- State & Configurations ---
    const CONFIG = {
        correctPin: '230726', // Change this to your desired 6-digit PIN code
        balloonColors: [
            '#ff8b94', // Pastel Rose Pink
            '#ffaaa6', // Pastel Peach
            '#ffd3b6', // Pastel Orange
            '#dcedc1', // Pastel Mint
            '#a8e6cf', // Pastel Turquoise
            '#d1c4e9', // Pastel Purple
            '#ffeb3b'  // Gold Yellow
        ],
        memoryPhotos: [
            'assets/image-1.jpeg',
            'assets/image-2.jpeg',
            'assets/image-3.jpg',
            'assets/image-4.jpg',
            'assets/image-5.jpeg',
            'assets/image-6.jpg',
            'assets/image-7.jpeg',
            'assets/image-8.jpg'
        ]
    };

    // --- DOM Elements ---
    const lockOverlay = document.getElementById('lock-overlay');
    const lockCard = document.querySelector('.lock-card');
    const pinInputs = document.querySelectorAll('.pin-digit');
    const unlockBtn = document.getElementById('unlock-btn');
    const errorMsg = document.getElementById('error-msg');
    const mainContent = document.getElementById('main-content');
    
    const bgMusic = document.getElementById('bg-music');
    const musicPlayerPanel = document.getElementById('music-player-panel');
    const musicPanelToggle = document.getElementById('music-panel-toggle');
    
    const birthdayCard = document.getElementById('birthday-card');
    const balloonsContainer = document.getElementById('balloons-container');
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    // Set today's date dynamically on card
    const cardDatePlaceholder = document.getElementById('card-date-placeholder');
    if (cardDatePlaceholder) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        cardDatePlaceholder.textContent = new Date().toLocaleDateString('id-ID', options) + ' ✨';
    }

    // --- Canvas Confetti System ---
    let particles = [];
    let animationFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class ConfettiParticle {
        constructor(x, y, isBurst = false) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.color = CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)];
            
            if (isBurst) {
                // Radial velocity for burst
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 4;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - Math.random() * 3; // slight upward bias
            } else {
                // Falling style
                this.vx = Math.random() * 2 - 1;
                this.vy = Math.random() * 3 + 2;
            }
            
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = Math.random() * 0.1 - 0.05;
            this.opacity = 1;
            this.decay = Math.random() * 0.015 + 0.01;
            this.isBurst = isBurst;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            
            // Gravity or air resistance
            if (this.isBurst) {
                this.vy += 0.15; // gravity pulling down
                this.vx *= 0.98; // air resistance
            } else {
                this.vx += Math.sin(this.y / 30) * 0.02; // sway back and forth
            }

            this.opacity -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    function spawnConfettiBurst(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            particles.push(new ConfettiParticle(x, y, true));
        }
        startConfettiAnimation();
    }

    function spawnConfettiRain() {
        for (let i = 0; i < 2; i++) {
            particles.push(new ConfettiParticle(Math.random() * canvas.width, -10, false));
        }
        startConfettiAnimation();
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles = particles.filter(p => p.opacity > 0);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Continue animation if we have active particles or if rain is triggered
        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(animateConfetti);
        } else {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function startConfettiAnimation() {
        if (!animationFrameId) {
            animateConfetti();
        }
    }

    // --- Floating Balloons & Photos System ---
    function spawnBalloon() {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        
        // Randomize characteristics
        const sizeMultiplier = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
        const width = 60 * sizeMultiplier;
        const height = 75 * sizeMultiplier;
        const color = CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)];
        const left = Math.random() * 85; // percentage (keep away from right edge to prevent overflow)
        const duration = Math.random() * 8 + 12; // 12 to 20 seconds
        const swayX = (Math.random() * 80) - 40; // -40px to 40px
        const swayRotate = (Math.random() * 30) - 15; // -15deg to 15deg
        
        balloon.style.width = `${width}px`;
        balloon.style.height = `${height}px`;
        balloon.style.left = `${left}%`;
        balloon.style.backgroundColor = color;
        balloon.style.color = color; // for border/knot matching
        balloon.style.animationDuration = `${duration}s`;
        balloon.style.setProperty('--sway-x', `${swayX}px`);
        balloon.style.setProperty('--sway-rotate', `${swayRotate}deg`);
        
        balloonsContainer.appendChild(balloon);
        
        // Remove balloon after animation completes
        setTimeout(() => {
            balloon.remove();
        }, duration * 1000);
    }

    function spawnFloatingPhoto() {
        const photoFrame = document.createElement('div');
        photoFrame.classList.add('floating-photo');
        
        // Pick a random photo
        const photoSrc = CONFIG.memoryPhotos[Math.floor(Math.random() * CONFIG.memoryPhotos.length)];
        
        // Create image element
        const img = document.createElement('img');
        img.classList.add('floating-photo-img');
        img.src = photoSrc;
        photoFrame.appendChild(img);
        
        // Randomize characteristics
        const width = Math.random() * 20 + 75; // 75px to 95px wide
        const left = Math.random() * 75; // percentage (keep well away from right edge for sways)
        const duration = Math.random() * 8 + 15; // 15 to 23 seconds (slower than balloons)
        const swayX = (Math.random() * 80) - 40; // -40px to 40px
        const swayRotate = (Math.random() * 40) - 20; // -20deg to 20deg
        
        photoFrame.style.width = `${width}px`;
        photoFrame.style.left = `${left}%`;
        photoFrame.style.animationDuration = `${duration}s`;
        photoFrame.style.setProperty('--sway-x', `${swayX}px`);
        photoFrame.style.setProperty('--sway-rotate', `${swayRotate}deg`);
        
        balloonsContainer.appendChild(photoFrame);
        
        // Remove after animation completes
        setTimeout(() => {
            photoFrame.remove();
        }, duration * 1000);
    }

    // Start spawning balloons and photos periodically
    function initBalloons() {
        // Spawn initial batch
        for(let i = 0; i < 6; i++) {
            setTimeout(() => {
                spawnBalloon();
            }, Math.random() * 4000);
        }
        for(let i = 0; i < 3; i++) {
            setTimeout(() => {
                spawnFloatingPhoto();
            }, Math.random() * 6000 + 1000);
        }
        
        // Keep spawning periodically
        setInterval(spawnBalloon, 2400);
        setInterval(spawnFloatingPhoto, 4200); // spawn a photo every 4.2 seconds
    }

    // --- PIN Entry Actions ---
    // Handle PIN input focus cycling
    pinInputs.forEach((input, index) => {
        // Handle input change
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            // Allow only numbers
            if (value && !/^\d$/.test(value)) {
                e.target.value = '';
                return;
            }

            if (value && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }

            // Auto submit when last input is filled
            if (getEnteredPin().length === pinInputs.length) {
                verifyPin();
            }
        });

        // Handle backspace/navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                pinInputs[index - 1].focus();
                pinInputs[index - 1].value = '';
            }
        });
        
        // Focus first input automatically
        if (index === 0) {
            setTimeout(() => input.focus(), 500);
        }
    });

    function getEnteredPin() {
        let entered = '';
        pinInputs.forEach(input => {
            entered += input.value;
        });
        return entered;
    }

    function clearPinInputs() {
        pinInputs.forEach(input => {
            input.value = '';
        });
        pinInputs[0].focus();
    }

    function verifyPin() {
        const pin = getEnteredPin();
        if (pin === CONFIG.correctPin) {
            unlockSite();
        } else {
            // Trigger failure feedback
            lockCard.classList.add('error-shake');
            errorMsg.style.display = 'block';
            
            // Remove shake class after animation completes
            setTimeout(() => {
                lockCard.classList.remove('error-shake');
            }, 500);
            
            clearPinInputs();
        }
    }

    unlockBtn.addEventListener('click', verifyPin);

    // --- Unlock Site Actions ---
    function unlockSite() {
        // Save to session storage so refresh doesn't lock again
        sessionStorage.setItem('birthday_web_unlocked', 'true');
        
        // Fade out overlay
        lockOverlay.classList.add('fade-out');
        
        // Reveal main content
        mainContent.classList.remove('hide');
        setTimeout(() => {
            mainContent.classList.add('reveal-page');
            
            // Celebrate with fireworks of confetti!
            triggerOpeningConfetti();
        }, 100);
        
        // Initialize interactive modules
        initBalloons();
        
        // Attempt to play music automatically (users clicked/interacted, so it should succeed)
        playMusic();
    }

    function triggerOpeningConfetti() {
        // Shoot confetti from multiple spots
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        spawnConfettiBurst(width * 0.2, height * 0.8, 60);
        spawnConfettiBurst(width * 0.8, height * 0.8, 60);
        
        // Setup a gentle continuous confetti rain for a few seconds
        const rainInterval = setInterval(spawnConfettiRain, 300);
        setTimeout(() => {
            clearInterval(rainInterval);
        }, 6000);
    }

    // Check if previously unlocked
    if (sessionStorage.getItem('birthday_web_unlocked') === 'true') {
        lockOverlay.classList.add('hide'); // hide immediately
        mainContent.classList.remove('hide');
        mainContent.classList.add('reveal-page');
        initBalloons();
    }

    // --- Audio Playlist Player System ---
    const PLAYLIST = [
        { title: 'Kita Usahakan Rumah Itu', src: 'assets/kita-usahakan-rumah-itu.mp3' },
        { title: 'Pastikan Riuh Akhiri Malammu', src: 'assets/pastikan-riuh-akhiri-malammu.mp3' },
        { title: 'Shape of My Heart', src: 'assets/shape-of-my-heart.mp3' }
    ];
    let currentTrackIndex = 0;

    const playerBody = document.getElementById('player-body');
    const playerCloseBtn = document.getElementById('player-close-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentSongTitle = document.getElementById('current-song-title');
    const playlistItems = document.querySelectorAll('.playlist-item');

    function loadTrack(index) {
        currentTrackIndex = index;
        const track = PLAYLIST[index];
        bgMusic.src = track.src;
        currentSongTitle.textContent = track.title;
        
        // Update active class in playlist list
        playlistItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function playMusic() {
        bgMusic.play()
            .then(() => {
                const playIcon = playPauseBtn.querySelector('.play-icon');
                const pauseIcon = playPauseBtn.querySelector('.pause-icon');
                playIcon.classList.add('hide');
                pauseIcon.classList.remove('hide');
            })
            .catch(err => {
                console.log('Autoplay blocked: user interaction required for music.');
            });
    }

    function pauseMusic() {
        bgMusic.pause();
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        playIcon.classList.remove('hide');
        pauseIcon.classList.add('hide');
    }

    function togglePlay() {
        if (bgMusic.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    }

    function nextTrack() {
        let index = (currentTrackIndex + 1) % PLAYLIST.length;
        loadTrack(index);
        playMusic();
    }

    function prevTrack() {
        let index = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
        loadTrack(index);
        playMusic();
    }

    // Toggle player expand / minimize
    musicPanelToggle.addEventListener('click', () => {
        musicPlayerPanel.classList.remove('minimized');
        musicPlayerPanel.classList.add('expanded');
        playerBody.classList.remove('hide');
        
        // Auto play on expand
        playMusic();
    });

    playerCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent panel toggle from triggering
        musicPlayerPanel.classList.remove('expanded');
        musicPlayerPanel.classList.add('minimized');
        playerBody.classList.add('hide');
    });

    playPauseBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // Playlist item clicks
    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            loadTrack(index);
            playMusic();
        });
    });

    // Initialize first track
    loadTrack(0);

    // --- 3D Birthday Card Flip ---
    birthdayCard.addEventListener('click', (e) => {
        birthdayCard.classList.toggle('flipped');
        
        // If flipped open, shoot confetti from the card's center
        if (birthdayCard.classList.contains('flipped')) {
            const cardRect = birthdayCard.getBoundingClientRect();
            const centerX = cardRect.left + (cardRect.width / 2);
            const centerY = cardRect.top + (cardRect.height / 2);
            
            setTimeout(() => {
                spawnConfettiBurst(centerX, centerY, 40);
            }, 300); // delay slightly to align with the flip transition
        }
    });
});
