// Simple Sound System (using Web Audio API to generate sounds)
const SoundSystem = {
    audioContext: null,
    lastHitTime: 0,
    hitThrottle: 50, // Minimum ms between hit sounds

    init() {
        // Create AudioContext on first user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playHit(type = 'normal') {
        // TEMPORARILY DISABLED FOR PERFORMANCE
        return;

        // Throttle hit sounds to prevent audio overload
        const now = Date.now();
        if (now - this.lastHitTime < this.hitThrottle) {
            return; // Skip this sound
        }
        this.lastHitTime = now;

        this.init();
        const ctx = this.audioContext;
        const audioNow = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Different sounds for different hit types
        switch(type) {
            case 'normal':
                oscillator.frequency.setValueAtTime(800, audioNow);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioNow + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioNow);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioNow + 0.1);
                break;
            case 'critical':
                oscillator.frequency.setValueAtTime(1200, audioNow);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioNow + 0.15);
                gainNode.gain.setValueAtTime(0.25, audioNow);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioNow + 0.15);
                break;
            case 'magic':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, audioNow);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioNow + 0.05);
                oscillator.frequency.exponentialRampToValueAtTime(300, audioNow + 0.1);
                gainNode.gain.setValueAtTime(0.15, audioNow);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioNow + 0.1);
                break;
            case 'explosion':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, audioNow);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioNow + 0.3);
                gainNode.gain.setValueAtTime(0.3, audioNow);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioNow + 0.3);
                break;
        }

        oscillator.start(audioNow);
        oscillator.stop(audioNow + 0.3);
    },

    playShoot(weaponType = 'magic_missile') {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }
};
