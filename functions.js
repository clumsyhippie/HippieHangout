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


