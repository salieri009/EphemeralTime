/**
 * Audio.js - Audio effects manager module (generative synthesis)
 * this is for test run for draft implmentation
 */
class Audio {
    constructor(config) {
        this.config = config;
        this.soundsReady = false;
        this.currentTurbulence = 0; // Track turbulence for audio modulation
        
        // Generative drop sound
        this.dropEnv = null;
        this.dropOsc = null;
        
        // Ambient sound
        this.ambient = null;
        this.ambientFilter = null;
        this.turbulenceOsc = null; // ✨ NEW: Additional layer for high turbulence
        
        // Pause state
        this.isPaused = false;
        
        if (this.config.audio.enabled) {
            this.initGenerativeAudio();
        }
    }

    /**
     * Initialize generative audio system
     */
    initGenerativeAudio() {
        try {
            // Setup drop sound (synthesized oscillator)
            if (this.config.audio.dropSound.useGenerative) {
                this.dropEnv = new p5.Envelope();
                const envConfig = this.config.audio.dropSound.oscillator;
                
                this.dropEnv.setADSR(
                    envConfig.attack,
                    envConfig.decay,
                    envConfig.sustain,
                    envConfig.release
                );
                this.dropEnv.setRange(
                    this.config.audio.dropSound.volume,
                    0
                );
            }
            
            // Setup ambient sound
            if (this.config.audio.ambient.enabled) {
                if (this.config.audio.ambient.useNoise) {
                    this.ambient = new p5.Noise('pink');
                    this.ambient.amp(this.config.audio.ambient.baseVolume);
                    this.ambient.start();
                } else {
                    this.ambient = new p5.Oscillator('sine');
                    this.ambient.freq(200);
                    this.ambient.amp(this.config.audio.ambient.baseVolume);
                    this.ambient.start();
                }
                
                // Setup lowpass filter
                this.ambientFilter = new p5.LowPass();
                this.ambientFilter.freq(this.config.audio.ambient.filter.baseFreq);
                this.ambientFilter.res(this.config.audio.ambient.filter.resonance);
                this.ambient.disconnect();
                this.ambient.connect(this.ambientFilter);
            }
            
            this.soundsReady = true;
        } catch (error) {
            console.log('Audio initialization error:', error);
            this.soundsReady = false;
        }
    }

    /**
     * Called from preload() to load sound files
     */
    loadSounds() {
        // No longer needed for generative approach
        // Files can be loaded here if fallback is needed
    }

    /**
     * Play sound for a new ink drop (synthesized)
     * @param {number} x - drop x position (for panning)
     * @param {number} minute - current minute (for pitch variation)
     */
    playDropSound(x = width / 2, minute = 0) {
        if (!this.soundsReady || !this.config.audio.dropSound.useGenerative) return;
        if (this.isPaused) return;

        try {
            // Debug: check config
            console.log('Audio config:', this.config.audio);
            console.log('DropSound oscillator:', this.config.audio.dropSound.oscillator);
            console.log('PanRange:', this.config.audio.dropSound.oscillator.panRange);
            
            // Create new oscillator for each drop (allows polyphony)
            const osc = new p5.Oscillator(this.config.audio.dropSound.oscillator.type);
            
            // Vary pitch based on minute (subtle time indicator in audio)
            const [minFreq, maxFreq] = this.config.audio.dropSound.oscillator.freqRange;
            const freq = map(minute, 0, 59, minFreq, maxFreq);
            const freqVar = random(-50, 50); // add randomness
            osc.freq(freq + freqVar);
            
            // Pan based on x position
            const [panMin, panMax] = this.config.audio.dropSound.oscillator.panRange;
            const pan = map(x, 0, width, panMin, panMax);
            osc.pan(pan);
            
            // Start oscillator and trigger envelope
            osc.start();
            this.dropEnv.play(osc);
            
            // Stop oscillator after envelope completes
            const totalTime = 
                this.config.audio.dropSound.oscillator.attack +
                this.config.audio.dropSound.oscillator.decay +
                this.config.audio.dropSound.oscillator.release;
            
            setTimeout(() => {
                osc.stop();
            }, totalTime * 1000);
            
        } catch (error) {
            console.log('Error playing drop sound:', error);
        }
    }

    /**
     * Update the audio system with current turbulence level.
     * PHILOSOPHY: Audio is the PRIMARY feedback for attention state
     * Visual shows "records" (traces), Audio shows "experience" (now)
     * 
     * @param {number} turbulence - Current turbulence level (0-1).
     */
    updateTurbulence(turbulence) {
        this.currentTurbulence = turbulence;
        
        if (!this.soundsReady) return;
        
        // 1. Ambient filter modulation (calm → chaotic)
        if (this.ambientFilter) {
            // Calm: 200Hz lowpass (meditative, deep)
            // Distracted: 2000Hz (sharp, nervous)
            const filterFreq = map(turbulence, 0, 1, 200, 2000);
            this.ambientFilter.freq(filterFreq);
            
            // Resonance creates "edge" in distracted state
            const resonance = map(turbulence, 0, 1, 1, 15);
            this.ambientFilter.res(resonance);
        }
        
        // 2. Ambient volume increases with turbulence (more action = louder feedback)
        if (this.ambient) {
            const baseVol = this.config.audio.ambient.baseVolume;
            const turbulentVol = baseVol * (1 + turbulence * 2); // up to 3x louder
            this.ambient.amp(turbulentVol, 0.1); // 0.1s smooth transition
        }
        
        // 3. Add second oscillator layer when highly distracted
        if (turbulence > 0.5 && !this.turbulenceOsc && this.config.audio.ambient.enabled) {
            this.turbulenceOsc = new p5.Oscillator('triangle');
            this.turbulenceOsc.freq(440 + turbulence * 200); // rising pitch
            this.turbulenceOsc.amp((turbulence - 0.5) * 0.15); // fade in
            this.turbulenceOsc.start();
        } else if (turbulence <= 0.5 && this.turbulenceOsc) {
            this.turbulenceOsc.stop();
            this.turbulenceOsc = null;
        } else if (this.turbulenceOsc) {
            // Update existing turbulence layer
            this.turbulenceOsc.freq(440 + turbulence * 200);
            this.turbulenceOsc.amp((turbulence - 0.5) * 0.15);
        }
    }

    /**
     * Adjust ambient sound based on hour progress
     * @param {number} progress - hour progress value between 0 and 1
     */
    updateAmbience(progress) {
        if (!this.soundsReady || !this.ambient) return;
        if (this.isPaused) return;

        // Subtle volume modulation based on time
        const vol = this.config.audio.ambient.baseVolume * (0.8 + progress * 0.4);
        this.ambient.amp(vol, 0.5); // smooth transition
    }

    /**
     * Update ambient filter based on ink density (pixel analysis)
     * @param {number} inkDensity - value between 0 (empty) and 1 (full canvas)
     */
    updateAmbientFilter(inkDensity) {
        if (!this.soundsReady || !this.ambientFilter) return;
        if (this.isPaused) return;

        try {
            const [minFreq, maxFreq] = this.config.audio.ambient.filter.freqRange;
            
            // As ink accumulates (density increases), filter frequency decreases
            // This creates a darker, more muffled sound
            const targetFreq = constrain(map(inkDensity, 0, 1, maxFreq, minFreq), minFreq, maxFreq);
            
            // Ensure targetFreq is a valid finite number
            if (isFinite(targetFreq) && targetFreq > 0) {
                this.ambientFilter.freq(targetFreq, 0.5); // smooth transition
            }
            
        } catch (error) {
            console.log('Error updating ambient filter:', error);
        }
    }

    /**
     * Pause or resume audio
     * @param {boolean} shouldPause - true to pause, false to resume
     */
    setPause(shouldPause) {
        this.isPaused = shouldPause;
        
        if (!this.soundsReady || !this.ambient) return;

        if (shouldPause) {
            // Freeze ambient sound (keep it playing but modulate heavily)
            this.ambient.amp(this.config.audio.ambient.baseVolume * 0.3, 0.1);
        } else {
            // Resume normal volume
            this.ambient.amp(this.config.audio.ambient.baseVolume, 0.3);
        }
    }

    /**
     * Update ambient sound based on ink density
     * @param {number} inkDensity - value between 0 (empty) and 1 (full canvas)
     */
    update(inkDensity) {
        this.updateAmbientFilter(inkDensity);
    }

    /**
     * Plays a generative sound for a chime drop.
     * @param {InkDrop} drop - The ink drop that triggered the sound.
     */
    playChimeSound(drop) {
        if (!this.config.audio.chimeSound.useGenerative || !this.audioInitialized) return;

        const settings = this.config.audio.chimeSound;
        const chimeEnv = new p5.Envelope();
        const chimeOsc = new p5.Oscillator(settings.oscillator.type);

        chimeEnv.setADSR(
            settings.oscillator.attack,
            settings.oscillator.decay,
            settings.oscillator.sustain,
            settings.oscillator.release
        );
        chimeEnv.setRange(settings.volume, 0);

        const freq = settings.oscillator.baseFreq;
        chimeOsc.freq(freq);

        chimeOsc.start();
        chimeEnv.play(chimeOsc);
    }
}
