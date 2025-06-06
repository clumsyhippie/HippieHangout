document.addEventListener('DOMContentLoaded', function () {
    // Room Navigation
    const rooms = ['living-room', 'kitchen', 'bedroom', 'garden'];
    const roomNames = ['Living Room', 'Kitchen', 'Bedroom', 'Garden'];

    // Door interaction sounds
    const doorbellSound = document.getElementById('doorbell-sound');
    const doorOpenSound = document.getElementById('door-open-sound');

    // Set door open sound volume to 50%
    doorOpenSound.volume = 0.5;

    // Entry sounds
    const roomSounds = {
        'living-room': document.getElementById('living-sound'),
        'kitchen': document.getElementById('kitchen-sound'),
        'bedroom': document.getElementById('bedroom-sound'),
        'garden': document.getElementById('garden-sound')
    };

    // Ambient sounds
    const ambientSounds = {
        'front': document.getElementById('amb-front'),
        'living-room': document.getElementById('amb-living'),
        'kitchen': document.getElementById('amb-kitchen'),
        'bedroom': document.getElementById('amb-bedroom'),
        'garden': document.getElementById('amb-garden')
    };

    let currentRoomIndex = 0;
    let currentAmbientSound = ambientSounds['front'];
    let isMuted = false;
    let doorClicked = false;

    // Force autoplay for ambient sounds
    function forcePlayAudio() {
        // Create a context to unlock audio
        const context = new (window.AudioContext || window.webkitAudioContext)();

        // Start front door ambient sound
        ambientSounds['front'].volume = 0.7;

        // Try to play immediately
        const playPromise = ambientSounds['front'].play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Ambient sound playing successfully");
            }).catch(e => {
                console.log("Autoplay prevented, will try on user interaction:", e);

                // Create a silent buffer to unlock audio on iOS
                const buffer = context.createBuffer(1, 1, 22050);
                const source = context.createBufferSource();
                source.buffer = buffer;
                source.connect(context.destination);
                source.start(0);

                // Try again on first user interaction
                const unlockAudio = () => {
                    ambientSounds['front'].play().catch(e => console.log("Still can't play audio:", e));
                    document.body.removeEventListener('touchstart', unlockAudio);
                    document.body.removeEventListener('touchend', unlockAudio);
                    document.body.removeEventListener('click', unlockAudio);
                    document.body.removeEventListener('keydown', unlockAudio);
                };

                document.body.addEventListener('touchstart', unlockAudio, false);
                document.body.addEventListener('touchend', unlockAudio, false);
                document.body.addEventListener('click', unlockAudio, false);
                document.body.addEventListener('keydown', unlockAudio, false);
            });
        }
    }

    // Call immediately to try autoplay
    forcePlayAudio();

    // Door interaction
    const doorContainer = document.getElementById('door-container');
    const doorStatic = document.getElementById('door-static');
    const doorStaticFallback = document.getElementById('door-static-fallback');
    const doorGif = document.getElementById('door-gif');
    const doorGifFallback = document.getElementById('door-gif-fallback');
    const doorbell = document.getElementById('doorbell');
    const frontDoorPage = document.getElementById('front-door');
    const mainContent = document.getElementById('main-content');
    const exitButton = document.getElementById('exit-button');
    const roomSign = document.getElementById('room-sign');

    // Make sure images are loaded
    const preloadImages = () => {
        // Handle door static image loading
        doorStatic.onerror = () => {
            console.error('Failed to load door static image, showing fallback');
            doorStatic.style.display = 'none';
            doorStaticFallback.style.display = 'block';
        };

        // Handle door gif loading
        doorGif.onerror = () => {
            console.error('Failed to load door gif, showing fallback');
            doorGif.style.display = 'none';
            doorGifFallback.style.display = 'block';
        };
    };

    // Call preload function
    preloadImages();

    // Doorbell button functionality - With longer delay
    doorbell.addEventListener('click', function () {
        // Prevent multiple clicks
        if (doorClicked) return;
        doorClicked = true;

        // Add pressed class to doorbell and play sound immediately
        doorbell.classList.add('pressed');
        doorbellSound.play().catch(e => {
            console.log("Doorbell sound playback prevented: ", e);
        });

        // Add knocking animation to doorbell
        doorbell.classList.add('knocking');

        // After doorbell animation, wait longer before showing door opening
        setTimeout(() => {
            // Remove animations
            doorbell.classList.remove('knocking');
            doorbell.classList.remove('pressed');

            // Longer delay (1 second) before playing door open sound and showing gif
            setTimeout(() => {
                // Play door open sound (volume already set to 50%)
                doorOpenSound.play().catch(e => {
                    console.log("Door open sound playback prevented: ", e);
                });

                // Hide static door image and show animated door gif
                doorStatic.classList.add('hidden');
                doorStaticFallback.classList.add('hidden');
                doorGif.classList.remove('hidden');
                doorGifFallback.classList.remove('hidden');

                // Fade out front door ambient
                fadeOutSound(ambientSounds['front']);

                // After door animation, show main content
                setTimeout(() => {
                    doorContainer.style.opacity = "0";

                    setTimeout(() => {
                        frontDoorPage.classList.add('opacity-0', 'pointer-events-none');
                        mainContent.classList.remove('opacity-0', 'pointer-events-none');
                        exitButton.classList.remove('opacity-0', 'pointer-events-none');

                        // Show room sign with fade-in-out animation
                        roomSign.classList.remove('opacity-0');
                        roomSign.classList.add('fade-in-out');

                        // Start living room ambient
                        currentAmbientSound = ambientSounds['living-room'];
                        if (!isMuted) {
                            fadeInSound(ambientSounds['living-room']);
                        }

                        // Play living room entry sound
                        roomSounds['living-room'].play().catch(e => {
                            console.log("Living room sound playback prevented: ", e);
                        });

                        // Reset door clicked state for when user exits
                        doorClicked = false;
                    }, 500);

                }, 1500);
            }, 1000); // Added 1 second delay before door opens
        }, 100);
    });

    // Exit button functionality
    exitButton.addEventListener('click', function () {
        // Play door open sound (volume already set to 50%)
        doorOpenSound.play().catch(e => {
            console.log("Door open sound playback prevented: ", e);
        });

        // Fade out current ambient sound
        if (currentAmbientSound) {
            fadeOutSound(currentAmbientSound);
        }

        // Hide main content and show front door
        mainContent.classList.add('opacity-0', 'pointer-events-none');
        exitButton.classList.add('opacity-0', 'pointer-events-none');
        roomSign.classList.add('opacity-0');
        roomSign.classList.remove('fade-in-out');

        setTimeout(() => {
            // Reset door - show static image again
            doorStatic.classList.remove('hidden');
            doorStaticFallback.classList.remove('hidden');
            doorGif.classList.add('hidden');
            doorGifFallback.classList.add('hidden');
            doorContainer.style.opacity = "1";

            // Show front door page
            frontDoorPage.classList.remove('opacity-0', 'pointer-events-none');

            // Start front door ambient
            currentAmbientSound = ambientSounds['front'];
            if (!isMuted) {
                fadeInSound(ambientSounds['front']);
            }
        }, 500);
    });

    function showRoom(index) {
        const newRoomId = rooms[index];
        const oldRoomId = rooms[currentRoomIndex];

        // Stop any currently playing entry sounds
        Object.values(roomSounds).forEach(sound => {
            if (!sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
        });

        // Fade out current ambient sound if it exists
        if (currentAmbientSound && !currentAmbientSound.paused) {
            fadeOutSound(currentAmbientSound);
        }

        // Update room visibility
        rooms.forEach((roomId, i) => {
            const room = document.getElementById(roomId);
            if (i === index) {
                room.classList.remove('opacity-0', 'pointer-events-none');

                // Play the entry sound for this room
                roomSounds[roomId].play().catch(e => {
                    console.log("Entry audio playback prevented: ", e);
                });

                // Start the ambient sound for this room
                const ambSound = ambientSounds[roomId];
                if (ambSound) {
                    currentAmbientSound = ambSound;
                    if (!isMuted) {
                        fadeInSound(ambSound);
                    }
                }
            } else {
                room.classList.add('opacity-0', 'pointer-events-none');
            }
        });

        // Update room subtitle and trigger fade-in-out animation
        const roomSubtitle = document.getElementById('room-subtitle');
        roomSubtitle.textContent = roomNames[index];

        // Reset the animation by removing and re-adding the class
        roomSign.classList.remove('fade-in-out');
        void roomSign.offsetWidth; // Force reflow
        roomSign.classList.add('fade-in-out');

        // Update current room index
        currentRoomIndex = index;
    }

    function fadeOutSound(sound) {
        if (!sound || sound.paused || sound.volume === 0) return;

        let vol = sound.volume;
        const fadeOut = setInterval(function () {
            if (vol > 0.1) {
                vol -= 0.1;
                sound.volume = vol;
            } else {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = 0.7; // Reset volume for next time
                clearInterval(fadeOut);
            }
        }, 100);
    }

    function fadeInSound(sound) {
        if (!sound) return;

        sound.volume = 0;
        sound.play().then(() => {
            let vol = 0;
            const fadeIn = setInterval(function () {
                if (vol < 0.6) {
                    vol += 0.1;
                    sound.volume = vol;
                } else {
                    sound.volume = 0.7;
                    clearInterval(fadeIn);
                }
            }, 100);
        }).catch(e => {
            console.log("Ambient audio playback prevented: ", e);
        });
    }

    // Mute button functionality
    const muteButton = document.getElementById('mute-button');
    const soundOnIcon = document.getElementById('sound-on-icon');
    const soundOffIcon = document.getElementById('sound-off-icon');

    muteButton.addEventListener('click', function () {
        isMuted = !isMuted;

        if (isMuted) {
            // Mute all sounds
            Object.values(ambientSounds).forEach(sound => {
                if (!sound.paused) {
                    sound.volume = 0;
                }
            });

            // Show muted icon
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
        } else {
            // Unmute current ambient sound
            if (currentAmbientSound) {
                fadeInSound(currentAmbientSound);
            }

            // Show unmuted icon
            soundOffIcon.classList.add('hidden');
            soundOnIcon.classList.remove('hidden');
        }
    });

    document.getElementById('left-arrow').addEventListener('click', function () {
        const newIndex = (currentRoomIndex - 1 + rooms.length) % rooms.length;
        showRoom(newIndex);
    });

    document.getElementById('right-arrow').addEventListener('click', function () {
        const newIndex = (currentRoomIndex + 1) % rooms.length;
        showRoom(newIndex);
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function (e) {
        // Only work if we're in the main content
        if (mainContent.classList.contains('opacity-0')) return;

        if (e.key === 'ArrowLeft') {
            document.getElementById('left-arrow').click();
        } else if (e.key === 'ArrowRight') {
            document.getElementById('right-arrow').click();
        } else if (e.key === 'Escape') {
            exitButton.click();
        }
    });

});




document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const openBtn = document.getElementById('openCustomizer');
    const closeBtn = document.getElementById('closeCustomizer');
    const popup = document.getElementById('customizer');
    const saveBtn = document.getElementById('saveAvatar');
    const buttonSound = document.getElementById('buttonSound');
    const pickupSound = document.getElementById('pickupSound');
    const putdownSound = document.getElementById('putdownSound');
    const chatSound = document.getElementById('chatSound');
    const fittingRoom = document.getElementById('fittingRoom');
    const prevBgBtn = document.getElementById('prevBg');
    const nextBgBtn = document.getElementById('nextBg');
    const bgIndicator = document.getElementById('bgIndicator');
    const mainAvatar = document.getElementById('mainAvatar');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChat');
    const minimizeChatBtn = document.getElementById('minimizeChat');
    const chatHeader = document.getElementById('chatHeader');
    const showHistoryBtn = document.getElementById('showHistory');
    const closeHistoryBtn = document.getElementById('closeHistory');
    const chatHistoryPanel = document.getElementById('chatHistoryPanel');
    const chatHistoryContent = document.getElementById('chatHistoryContent');
    const usernameModal = document.getElementById('usernameModal');
    const usernameInput = document.getElementById('usernameInput');
    const usernameSubmit = document.getElementById('usernameSubmit');
    const userLabel = document.getElementById('userLabel');
    const micButton = document.getElementById('micButton');
    const voiceIndicator = document.getElementById('voiceIndicator');

    // Chat container state
    let isChatMinimized = false;
    const chatContainer = document.querySelector('.chat-container');

    // Username state
    let username = "User";

    // Voice chat state
    let isMicActive = false;
    let voiceAnimationInterval = null;

    // Chat history
    let chatHistory = [];

    // Avatar layers in customizer
    const bodyLayer = document.getElementById('bodyLayer');
    const hairLayer = document.getElementById('hairLayer');
    const eyesLayer = document.getElementById('eyesLayer');

    // Main avatar layers (always visible)
    const mainBodyLayer = document.getElementById('mainBodyLayer');
    const mainHairLayer = document.getElementById('mainHairLayer');
    const mainEyesLayer = document.getElementById('mainEyesLayer');

    // Default avatar settings
    let currentBody = "Default";
    let currentHair = "none";
    let currentEyes = "Eyes";

    // Background settings
    const backgrounds = [
        { name: "Background1", path: "Avatar/Images/Background1.png" },
        { name: "Background2", path: "Avatar/Images/Background2.png" },
        { name: "Background3", path: "Avatar/Images/Background3.png" },
        { name: "Background4", path: "Avatar/Images/Background4.png" },
        { name: "Background5", path: "Avatar/Images/Background5.png" }
    ];
    let currentBgIndex = 0;

    // Simulated other users
    const otherUsers = [
        {
            id: 'user1',
            username: 'CoolCat42',
            body: 'Default_Blue',
            hair: 'Hairstyle1',
            eyes: 'Blue_Eyes',
            position: { x: '20%', y: '60%' }
        },
        {
            id: 'user2',
            username: 'PixelPal',
            body: 'Default_Purple',
            hair: 'Hairstyle2',
            eyes: 'Pink_Eyes',
            position: { x: '70%', y: '70%' }
        },
        {
            id: 'user3',
            username: 'RetroGamer',
            body: 'Default',
            hair: 'none',
            eyes: 'Green_Eyes',
            position: { x: '85%', y: '65%' }
        }
    ];

    // Create other users' avatars
    function createOtherUsers() {
        otherUsers.forEach(user => {
            // Create avatar container
            const avatar = document.createElement('div');
            avatar.id = user.id;
            avatar.className = 'avatar other-user';
            avatar.style.left = user.position.x;
            avatar.style.top = user.position.y;
            avatar.style.transform = 'none';
            avatar.style.bottom = 'auto';

            // Create avatar layers
            const bodyImg = document.createElement('img');
            bodyImg.className = 'avatar-layer';
            bodyImg.src = `Avatar/Images/${user.body}.png`;
            bodyImg.alt = 'Body';

            const eyesImg = document.createElement('img');
            eyesImg.className = 'avatar-layer';
            eyesImg.src = `Avatar/Images/${user.eyes}.png`;
            eyesImg.alt = 'Eyes';

            // Add hair if present
            if (user.hair !== 'none') {
                const hairImg = document.createElement('img');
                hairImg.className = 'avatar-layer';
                hairImg.src = `Avatar/Images/${user.hair}.png`;
                hairImg.alt = 'Hair';
                avatar.appendChild(hairImg);
            }

            // Create username label
            const label = document.createElement('div');
            label.className = 'user-label';
            label.textContent = user.username;

            // Add elements to avatar
            avatar.appendChild(bodyImg);
            avatar.appendChild(eyesImg);
            avatar.appendChild(label);

            // Add avatar to document
            document.querySelector('.avatar-customizer-container').appendChild(avatar);
        });
    }

    // Create background indicator dots
    function createBgIndicators() {
        bgIndicator.innerHTML = '';
        backgrounds.forEach((bg, index) => {
            const dot = document.createElement('div');
            dot.className = `bg-dot ${index === currentBgIndex ? 'active' : ''}`;
            dot.setAttribute('data-index', index);
            dot.addEventListener('click', () => {
                playButtonSound();
                setBackground(index);
            });
            bgIndicator.appendChild(dot);
        });
    }

    // Set background by index
    function setBackground(index) {
        currentBgIndex = index;
        fittingRoom.style.backgroundImage = `url('${backgrounds[index].path}')`;

        // Update indicator dots
        document.querySelectorAll('.bg-dot').forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Save background preference
        localStorage.setItem('avatarBackground', index);
    }

    // Initialize background indicators
    createBgIndicators();

    // Load saved background if exists
    if (localStorage.getItem('avatarBackground')) {
        const savedBgIndex = parseInt(localStorage.getItem('avatarBackground'));
        if (!isNaN(savedBgIndex) && savedBgIndex >= 0 && savedBgIndex < backgrounds.length) {
            setBackground(savedBgIndex);
        }
    }

    // Background navigation
    prevBgBtn.addEventListener('click', () => {
        playButtonSound();
        let newIndex = currentBgIndex - 1;
        if (newIndex < 0) newIndex = backgrounds.length - 1;
        setBackground(newIndex);
    });

    nextBgBtn.addEventListener('click', () => {
        playButtonSound();
        let newIndex = currentBgIndex + 1;
        if (newIndex >= backgrounds.length) newIndex = 0;
        setBackground(newIndex);
    });

    // Load saved avatar settings if they exist
    loadAvatarSettings();

    // Function to load avatar settings from localStorage
    function loadAvatarSettings() {
        // Check if user has saved avatar settings
        if (localStorage.getItem('avatarSettings')) {
            const savedSettings = JSON.parse(localStorage.getItem('avatarSettings'));

            // Apply saved settings
            currentBody = savedSettings.body || "Default";
            currentHair = savedSettings.hair || "none";
            currentEyes = savedSettings.eyes || "Eyes";

            // Update avatar display in customizer
            updateAvatarDisplay();

            // Update main avatar display
            updateMainAvatarDisplay();

            // Update active buttons
            document.querySelectorAll('[data-body]').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-body') === currentBody) {
                    btn.classList.add('active');
                }
            });

            document.querySelectorAll('[data-hair]').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-hair') === currentHair) {
                    btn.classList.add('active');
                }
            });

            document.querySelectorAll('[data-eyes]').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-eyes') === currentEyes) {
                    btn.classList.add('active');
                }
            });
        } else {
            // Set default avatar for new users
            updateAvatarDisplay();
            updateMainAvatarDisplay();
        }

        // Load saved position if exists
        if (localStorage.getItem('avatarPosition')) {
            const position = JSON.parse(localStorage.getItem('avatarPosition'));
            mainAvatar.style.left = position.x + 'px';
            mainAvatar.style.top = position.y + 'px';
            mainAvatar.style.transform = 'none';
            mainAvatar.style.bottom = 'auto';
        } else {
            // Position at bottom center by default
            positionAvatarAtBottom();
        }

        // Load saved username if exists
        if (localStorage.getItem('username')) {
            username = localStorage.getItem('username');
            userLabel.textContent = username;
            // Skip username modal if already set
            usernameModal.style.display = 'none';
        }
    }

    // Function to position avatar at the bottom of the screen
    function positionAvatarAtBottom() {
        // Calculate position to place avatar at the bottom of the screen
        // with just the top portion visible (about 1/3 of the avatar height)
        const avatarHeight = mainAvatar.offsetHeight;
        const visiblePortion = avatarHeight * 0.4; // Show about 40% of the avatar

        mainAvatar.style.bottom = (visiblePortion - avatarHeight) + 'px';
        mainAvatar.style.left = '50%';
        mainAvatar.style.transform = 'translateX(-50%)';
        mainAvatar.style.top = 'auto';
    }

    // Function to update avatar display in customizer
    function updateAvatarDisplay() {
        // Determine which body image to show based on body color and hairstyle
        let bodyImagePath = `Avatar/Images/${currentBody}.png`;

        // If there's a hairstyle and it's not the default body, use the combined image
        if (currentHair !== "none" && currentBody !== "Default") {
            bodyImagePath = `Avatar/Images/${currentHair}_${currentBody.split('_')[1]}.png`;
        } else if (currentHair !== "none") {
            // If there's a hairstyle and it's the default body
            bodyImagePath = `Avatar/Images/${currentHair}.png`;
        }

        // Set the body/hairstyle image
        bodyLayer.src = bodyImagePath;

        // Set the eyes image if not none
        if (currentEyes !== "none") {
            eyesLayer.src = `Avatar/Images/${currentEyes}.png`;
            eyesLayer.style.display = 'block';
        } else {
            eyesLayer.style.display = 'none';
        }
    }

    // Function to update main avatar display
    function updateMainAvatarDisplay() {
        // Determine which body image to show based on body color and hairstyle
        let bodyImagePath = `Avatar/Images/${currentBody}.png`;

        // If there's a hairstyle and it's not the default body, use the combined image
        if (currentHair !== "none" && currentBody !== "Default") {
            bodyImagePath = `Avatar/Images/${currentHair}_${currentBody.split('_')[1]}.png`;
        } else if (currentHair !== "none") {
            // If there's a hairstyle and it's the default body
            bodyImagePath = `Avatar/Images/${currentHair}.png`;
        }

        // Set the body/hairstyle image
        mainBodyLayer.src = bodyImagePath;

        // Set the eyes image if not none
        if (currentEyes !== "none") {
            mainEyesLayer.src = `Avatar/Images/${currentEyes}.png`;
            mainEyesLayer.style.display = 'block';
        } else {
            mainEyesLayer.style.display = 'none';
        }
    }

    // Function to save avatar settings
    function saveAvatarSettings() {
        const settings = {
            body: currentBody,
            hair: currentHair,
            eyes: currentEyes
        };

        localStorage.setItem('avatarSettings', JSON.stringify(settings));
    }

    // Function to save avatar position
    function saveAvatarPosition() {
        const rect = mainAvatar.getBoundingClientRect();
        const position = {
            x: rect.left,
            y: rect.top
        };
        localStorage.setItem('avatarPosition', JSON.stringify(position));
    }

    // Function to play button sound
    function playButtonSound() {
        buttonSound.currentTime = 0;
        buttonSound.play().catch(e => console.log("Audio play failed:", e));
    }

    // Function to play pickup sound
    function playPickupSound() {
        pickupSound.currentTime = 0;
        pickupSound.play().catch(e => console.log("Audio play failed:", e));
    }

    // Function to play putdown sound
    function playPutdownSound() {
        putdownSound.currentTime = 0;
        putdownSound.play().catch(e => console.log("Audio play failed:", e));
    }

    // Function to play chat sound
    function playChatSound() {
        chatSound.currentTime = 0;
        chatSound.play().catch(e => console.log("Audio play failed:", e));
    }

    // Add sound to all buttons with data-sound attribute
    document.querySelectorAll('[data-sound="play"]').forEach(button => {
        button.addEventListener('click', playButtonSound);
    });

    // Open and close popup
    openBtn.addEventListener('click', () => {
        playButtonSound();
        popup.style.display = 'flex';
        // Hide main avatar when customizer is open
        mainAvatar.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        playButtonSound();
        popup.style.display = 'none';
        // Show main avatar when customizer is closed
        mainAvatar.style.display = 'block';
    });

    // Close when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            playButtonSound();
            popup.style.display = 'none';
            // Show main avatar when customizer is closed
            mainAvatar.style.display = 'block';
        }
    });

    // Body color selection
    document.querySelectorAll('[data-body]').forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('[data-body]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update body
            currentBody = button.getAttribute('data-body');

            // Update both avatar displays
            updateAvatarDisplay();
            updateMainAvatarDisplay();
        });
    });

    // Hairstyle selection
    document.querySelectorAll('[data-hair]').forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('[data-hair]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update hair
            currentHair = button.getAttribute('data-hair');

            // Update both avatar displays
            updateAvatarDisplay();
            updateMainAvatarDisplay();
        });
    });

    // Eye color selection
    document.querySelectorAll('[data-eyes]').forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('[data-eyes]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update eyes
            currentEyes = button.getAttribute('data-eyes');

            // Update both avatar displays
            updateAvatarDisplay();
            updateMainAvatarDisplay();
        });
    });

    // Save avatar with retro notification
    saveBtn.addEventListener('click', () => {
        // Save current settings
        saveAvatarSettings();
        saveAvatarPosition();

        // Show notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg z-50 font-["Press_Start_2P"] text-xs';
        notification.style.border = '4px solid #f8e8b0';
        notification.style.backgroundColor = '#6b8e23';
        notification.style.color = '#f8e8b0';
        notification.style.padding = '10px';
        notification.style.zIndex = '10000';
        notification.textContent = 'AVATAR SAVED!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Close the customizer
        popup.style.display = 'none';
        // Show main avatar when customizer is closed
        mainAvatar.style.display = 'block';
    });

    // Make the main avatar draggable
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Always set cursor to pointer for main avatar
    mainAvatar.style.cursor = 'pointer';

    // Mouse events for dragging
    mainAvatar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events for mobile
    mainAvatar.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', endDragTouch);

    function startDrag(e) {
        if (popup.style.display === 'flex') return; // Don't drag if customizer is open

        isDragging = true;
        mainAvatar.classList.add('dragging');

        const rect = mainAvatar.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        playPickupSound();

        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;

        let newX = e.clientX - dragOffsetX;
        let newY = e.clientY - dragOffsetY;

        // Keep avatar within viewport bounds with minimal margins
        // Only add a small margin at the top to protect menu items
        const topMargin = 20; // Reduced top margin

        // Calculate boundaries to ensure avatar is always visible
        // Don't allow avatar to go off-screen
        const minX = 0;
        const maxX = window.innerWidth - mainAvatar.offsetWidth;
        const minY = topMargin;
        const maxY = window.innerHeight - mainAvatar.offsetHeight * 0.25;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        mainAvatar.style.left = newX + 'px';
        mainAvatar.style.top = newY + 'px';
        mainAvatar.style.transform = 'none';
        mainAvatar.style.bottom = 'auto'; // Clear bottom positioning when dragging

        // Update speech bubbles position
        updateSpeechBubblesPosition();

        e.preventDefault();
    }

    function endDrag() {
        if (!isDragging) return;

        isDragging = false;
        mainAvatar.classList.remove('dragging');

        playPutdownSound();
        saveAvatarPosition();
    }

    // Touch event handlers
    function startDragTouch(e) {
        if (popup.style.display === 'flex') return; // Don't drag if customizer is open

        isDragging = true;
        mainAvatar.classList.add('dragging');

        const rect = mainAvatar.getBoundingClientRect();
        const touch = e.touches[0];
        dragOffsetX = touch.clientX - rect.left;
        dragOffsetY = touch.clientY - rect.top;

        playPickupSound();

        e.preventDefault();
    }

    function dragTouch(e) {
        if (!isDragging) return;

        const touch = e.touches[0];
        let newX = touch.clientX - dragOffsetX;
        let newY = touch.clientY - dragOffsetY;

        // Keep avatar within viewport bounds with minimal margins
        // Only add a small margin at the top to protect menu items
        const topMargin = 20; // Reduced top margin

        // Calculate boundaries to ensure avatar is always visible
        // Don't allow avatar to go off-screen
        const minX = 0;
        const maxX = window.innerWidth - mainAvatar.offsetWidth;
        const minY = topMargin;
        const maxY = window.innerHeight - mainAvatar.offsetHeight * 0.25;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        mainAvatar.style.left = newX + 'px';
        mainAvatar.style.top = newY + 'px';
        mainAvatar.style.transform = 'none';
        mainAvatar.style.bottom = 'auto'; // Clear bottom positioning when dragging

        // Update speech bubbles position
        updateSpeechBubblesPosition();

        e.preventDefault();
    }

    function endDragTouch() {
        if (!isDragging) return;

        isDragging = false;
        mainAvatar.classList.remove('dragging');

        playPutdownSound();
        saveAvatarPosition();
    }

    // Chat functionality
    function sendChat() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Play chat sound
        playChatSound();

        // Create speech bubble
        createSpeechBubble(message, username);

        // Add to chat history
        addToChatHistory(username, message);

        // Clear input
        chatInput.value = '';

        // Simulate other users responding occasionally
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
                const randomMessages = [
                    "Hey there!",
                    "Cool avatar!",
                    "How's it going?",
                    "Nice to meet you!",
                    "I like your style!",
                    "What's up?",
                    "Hello everyone!",
                    "This is fun!",
                    "Anyone want to chat?",
                    "I'm new here!"
                ];
                const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

                // Create speech bubble for other user
                createOtherUserSpeechBubble(randomMessage, randomUser);

                // Add to chat history
                addToChatHistory(randomUser.username, randomMessage);

                // Play chat sound
                playChatSound();
            }, Math.random() * 3000 + 1000);
        }
    }

    // Create speech bubble above avatar
    function createSpeechBubble(message, username) {
        // Get existing bubbles
        const existingBubbles = document.querySelectorAll('.speech-bubble[data-user="' + username + '"]');

        // If we already have 3 bubbles, remove the oldest one
        if (existingBubbles.length >= 3) {
            existingBubbles[0].remove();
        }

        // Create new speech bubble
        const bubble = document.createElement('div');
        bubble.className = 'speech-bubble';
        bubble.textContent = message;
        bubble.setAttribute('data-user', username);
        document.body.appendChild(bubble);

        // Position bubble above avatar
        positionSpeechBubble(bubble, mainAvatar, existingBubbles.length);

        // Remove bubble after 5 seconds
        setTimeout(() => {
            bubble.style.animation = 'bubble-disappear 0.3s forwards';
            setTimeout(() => bubble.remove(), 300);
        }, 5000);
    }

    // Create speech bubble for other users
    function createOtherUserSpeechBubble(message, user) {
        const otherAvatar = document.getElementById(user.id);
        if (!otherAvatar) return;

        // Get existing bubbles
        const existingBubbles = document.querySelectorAll('.speech-bubble[data-user="' + user.username + '"]');

        // If we already have 3 bubbles, remove the oldest one
        if (existingBubbles.length >= 3) {
            existingBubbles[0].remove();
        }

        // Create new speech bubble
        const bubble = document.createElement('div');
        bubble.className = 'speech-bubble';
        bubble.textContent = message;
        bubble.setAttribute('data-user', user.username);
        document.body.appendChild(bubble);

        // Position bubble above avatar
        positionSpeechBubble(bubble, otherAvatar, existingBubbles.length);

        // Remove bubble after 5 seconds
        setTimeout(() => {
            bubble.style.animation = 'bubble-disappear 0.3s forwards';
            setTimeout(() => bubble.remove(), 300);
        }, 5000);

        // Simulate voice chat
        if (Math.random() > 0.7) {
            simulateVoiceChat(user.id);
        }
    }

    // Position speech bubble above avatar
    function positionSpeechBubble(bubble, avatar, bubbleIndex) {
        const avatarRect = avatar.getBoundingClientRect();
        const bubbleWidth = bubble.offsetWidth;

        // Position bubble centered above avatar
        // Adjust vertical position based on bubble index (0, 1, or 2)
        // This stacks bubbles from bottom to top
        const left = avatarRect.left + (avatarRect.width / 2) - (bubbleWidth / 2);
        const top = avatarRect.top - bubble.offsetHeight - 20 - (bubbleIndex * (bubble.offsetHeight + 10));

        bubble.style.left = `${left}px`;
        bubble.style.top = `${top}px`;
    }

    // Update all speech bubbles positions
    function updateSpeechBubblesPosition() {
        const bubbles = document.querySelectorAll('.speech-bubble[data-user="' + username + '"]');
        bubbles.forEach((bubble, index) => {
            positionSpeechBubble(bubble, mainAvatar, index);
        });
    }

    // Add message to chat history
    function addToChatHistory(user, message) {
        // Add to chat history array
        chatHistory.push({ user, message, timestamp: new Date() });

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';

        const usernameElement = document.createElement('div');
        usernameElement.className = 'username';
        usernameElement.textContent = user;

        const messageTextElement = document.createElement('div');
        messageTextElement.className = 'message-text';
        messageTextElement.textContent = message;

        messageElement.appendChild(usernameElement);
        messageElement.appendChild(messageTextElement);

        // Add to chat history panel
        chatHistoryContent.appendChild(messageElement);

        // Scroll to bottom
        chatHistoryContent.scrollTop = chatHistoryContent.scrollHeight;
    }

    // Username submission
    usernameSubmit.addEventListener('click', () => {
        const name = usernameInput.value.trim();
        if (name !== '') {
            username = name;
            userLabel.textContent = username;
            localStorage.setItem('username', username);
            usernameModal.style.display = 'none';
            playButtonSound();

            // Create welcome message
            setTimeout(() => {
                addToChatHistory('System', `Welcome to the chat, ${username}!`);
                createSpeechBubble(`Hi, I'm ${username}!`, username);
            }, 500);

            // Create other users
            createOtherUsers();

            // Simulate other users greeting
            setTimeout(() => {
                otherUsers.forEach((user, index) => {
                    setTimeout(() => {
                        const greeting = `Hey ${username}, welcome!`;
                        createOtherUserSpeechBubble(greeting, user);
                        addToChatHistory(user.username, greeting);
                        playChatSound();
                    }, index * 1500);
                });
            }, 2000);
        }
    });

    // Allow Enter key for username submission
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            usernameSubmit.click();
        }
    });

    // Chat event listeners
    sendChatBtn.addEventListener('click', sendChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChat();
    });

    // Make whole chat header clickable for minimize/maximize
    chatHeader.addEventListener('click', (e) => {
        // Don't trigger if clicking on the history button
        if (e.target === showHistoryBtn || e.target.parentNode === showHistoryBtn) {
            return;
        }

        playButtonSound();

        if (isChatMinimized) {
            // Maximize
            chatContainer.style.height = 'auto';
            chatInput.style.display = 'block';
            sendChatBtn.style.display = 'block';
            document.querySelector('.voice-controls').style.display = 'flex';
            minimizeChatBtn.textContent = '_';
        } else {
            // Minimize
            chatContainer.style.height = '40px';
            chatInput.style.display = 'none';
            sendChatBtn.style.display = 'none';
            document.querySelector('.voice-controls').style.display = 'none';
            minimizeChatBtn.textContent = '□';
        }

        isChatMinimized = !isChatMinimized;
    });

    // Chat history panel controls
    showHistoryBtn.addEventListener('click', () => {
        playButtonSound();
        chatHistoryPanel.style.display = (chatHistoryPanel.style.display == 'flex' ? 'none' : 'flex');
    });

    closeHistoryBtn.addEventListener('click', () => {
        playButtonSound();
        chatHistoryPanel.style.display = 'none';
    });

    // Voice chat controls
    micButton.addEventListener('click', () => {
        playButtonSound();
        isMicActive = !isMicActive;

        if (isMicActive) {
            // Activate microphone
            micButton.classList.add('active');
            voiceIndicator.classList.add('speaking');

            // Create speech bubble to indicate voice chat
            createSpeechBubble("🎤 Voice chat active", username);

            // Add system message to chat history
            addToChatHistory('System', `${username} started voice chat`);

            // Simulate voice activity
            simulateVoiceChat('mainAvatar');
        } else {
            // Deactivate microphone
            micButton.classList.remove('active');
            voiceIndicator.classList.remove('speaking');

            // Add system message to chat history
            addToChatHistory('System', `${username} ended voice chat`);

            // Clear any voice animation interval
            if (voiceAnimationInterval) {
                clearInterval(voiceAnimationInterval);
                voiceAnimationInterval = null;
            }
        }
    });

    // Simulate voice chat activity
    function simulateVoiceChat(avatarId) {
        const avatar = document.getElementById(avatarId);
        if (!avatar) return;

        // Create voice indicator if it doesn't exist
        let voiceIcon = avatar.querySelector('.voice-icon');
        if (!voiceIcon) {
            voiceIcon = document.createElement('div');
            voiceIcon.className = 'voice-icon';
            voiceIcon.style.position = 'absolute';
            voiceIcon.style.top = '20px';
            voiceIcon.style.right = '20px';
            voiceIcon.style.width = '40px';
            voiceIcon.style.height = '40px';
            voiceIcon.style.backgroundColor = 'rgba(139, 111, 78, 0.8)';
            voiceIcon.style.borderRadius = '50%';
            voiceIcon.style.border = '2px solid #f8e8b0';
            voiceIcon.style.display = 'flex';
            voiceIcon.style.justifyContent = 'center';
            voiceIcon.style.alignItems = 'center';
            voiceIcon.style.zIndex = '9994';

            // Create speaker icon
            const speakerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            speakerSvg.setAttribute('width', '20');
            speakerSvg.setAttribute('height', '20');
            speakerSvg.setAttribute('viewBox', '0 0 24 24');
            speakerSvg.setAttribute('fill', '#f8e8b0');

            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');

            speakerSvg.appendChild(path1);
            voiceIcon.appendChild(speakerSvg);

            // Create voice bars
            const voiceBars = document.createElement('div');
            voiceBars.className = 'voice-indicator speaking';
            voiceBars.style.position = 'absolute';
            voiceBars.style.bottom = '-15px';
            voiceBars.style.left = '50%';
            voiceBars.style.transform = 'translateX(-50%)';

            for (let i = 0; i < 5; i++) {
                const bar = document.createElement('div');
                bar.className = 'voice-bar';
                voiceBars.appendChild(bar);
            }

            voiceIcon.appendChild(voiceBars);
            avatar.appendChild(voiceIcon);
        }

        // Show voice icon
        voiceIcon.style.display = 'flex';

        // Remove after random time (2-5 seconds)
        const duration = Math.random() * 3000 + 2000;
        setTimeout(() => {
            if (voiceIcon && avatarId !== 'mainAvatar') {
                voiceIcon.style.display = 'none';
            } else if (voiceIcon && avatarId === 'mainAvatar' && !isMicActive) {
                voiceIcon.style.display = 'none';
            }
        }, duration);
    }

    // Set pointer cursor for all interactive elements
    document.querySelectorAll('button, .option-btn, .bg-nav-arrow, .bg-dot').forEach(element => {
        element.style.cursor = 'pointer';
    });

    // Make sure the page stretches to fill the window
    function setFullHeight() {
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
    }

    // Call on load and resize
    setFullHeight();
    window.addEventListener('resize', setFullHeight);

    // Reposition speech bubbles when window is resized
    window.addEventListener('resize', updateSpeechBubblesPosition);

    // Add event listener to update speech bubble position during drag
    document.addEventListener('mousemove', () => {
        if (isDragging) updateSpeechBubblesPosition();
    });

    document.addEventListener('touchmove', () => {
        if (isDragging) updateSpeechBubblesPosition();
    });

    // Simulate occasional chat from other users
    function simulateOtherUserChats() {
        setInterval(() => {
            if (Math.random() > 0.8) {
                const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
                const randomMessages = [
                    "This is so fun!",
                    "I love this chat room!",
                    "Anyone want to play a game?",
                    "How's everyone doing?",
                    "I just updated my avatar!",
                    "The weather is nice today!",
                    "What's everyone up to?",
                    "I'm having a great day!",
                    "This place is awesome!",
                    "Hello everyone!"
                ];
                const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

                // Create speech bubble for other user
                createOtherUserSpeechBubble(randomMessage, randomUser);

                // Add to chat history
                addToChatHistory(randomUser.username, randomMessage);

                // Play chat sound
                playChatSound();
            }
        }, 15000); // Every 15 seconds there's a chance
    }

    // Start simulation after a delay
    setTimeout(simulateOtherUserChats, 5000);
});
