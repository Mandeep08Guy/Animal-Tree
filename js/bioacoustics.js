/**
 * TerraFauna Bioacoustics Engine & Animal Language Decoder
 * Leverages Web Audio API, real-time Fast Fourier Transform (FFT) Spectrogram analysis,
 * authentic remote wildlife audio streaming, and scientific acoustic allometry.
 */

export class BioacousticsEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.currentAudioEl = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTrackMeta = null;
    this.stateListeners = new Set();
    this.animationFrameId = null;
    this.canvasOsc = null;
    this.canvasSpec = null;
    this.ctxOsc = null;
    this.ctxSpec = null;
    this.spectrogramLut = this.buildSpectrogramLut();
    this.mediaElementSourceMap = new WeakMap();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopVisualizerLoop();
      } else {
        this.syncVisualizerLoop();
      }
    });
  }

  buildSpectrogramLut() {
    const lut = new Array(256);
    for (let value = 0; value < 256; value++) {
      if (value < 20) {
        lut[value] = '#090d16';
      } else if (value < 70) {
        const t = (value - 20) / 50;
        lut[value] = `rgb(10, ${Math.floor(20 + 60 * t)}, ${Math.floor(80 + 120 * t)})`;
      } else if (value < 140) {
        const t = (value - 70) / 70;
        lut[value] = `rgb(${Math.floor(10 + 20 * t)}, ${Math.floor(80 + 140 * t)}, ${Math.floor(200 - 60 * t)})`;
      } else if (value < 200) {
        const t = (value - 140) / 60;
        lut[value] = `rgb(${Math.floor(30 + 210 * t)}, ${Math.floor(220 + 30 * t)}, 50)`;
      } else {
        const t = (value - 200) / 55;
        lut[value] = `rgb(255, ${Math.floor(220 * (1 - t))}, ${Math.floor(40 * (1 - t))})`;
      }
    }
    return lut;
  }

  onPlaybackStateChange(listener) {
    if (typeof listener !== 'function') return () => {};
    this.stateListeners.add(listener);
    listener(this.getPlaybackState());
    return () => this.stateListeners.delete(listener);
  }

  getPlaybackState() {
    let status = 'idle';
    if (this.isPlaying) status = 'playing';
    else if (this.isPaused) status = 'paused';
    return {
      status,
      track: this.currentTrackMeta,
      hasAudio: Boolean(this.currentAudioEl)
    };
  }

  emitState() {
    const snapshot = this.getPlaybackState();
    this.stateListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (e) {}
    });
  }

  /**
   * Initialize or resume Web Audio Context safely on user gesture
   */
  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.85;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Pause the active wildlife audio stream without discarding its track
   */
  pauseAudio() {
    if (this.currentAudioEl && this.isPlaying) {
      try {
        this.currentAudioEl.pause();
      } catch (e) {}
      this.isPlaying = false;
      this.isPaused = true;
      this.emitState();
      this.syncVisualizerLoop();
      return true;
    }
    return false;
  }

  /**
   * Resume a paused wildlife audio stream
   */
  resumeAudio() {
    if (this.currentAudioEl && this.isPaused) {
      this.initAudio();
      this.isPlaying = true;
      this.isPaused = false;
      this.emitState();
      this.syncVisualizerLoop();
      this.currentAudioEl.play().catch((err) => {
        console.warn("Audio resume prevented:", err);
        this.stopAudio();
      });
      return true;
    }
    return false;
  }

  togglePauseResume() {
    if (this.isPlaying) return this.pauseAudio();
    if (this.isPaused) return this.resumeAudio();
    return false;
  }

  /**
   * Stop currently playing or paused streamed audio
   */
  stopAudio() {
    const hadState = this.isPlaying || this.isPaused || Boolean(this.currentAudioEl);
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTrackMeta = null;
    if (this.currentAudioEl) {
      try {
        this.currentAudioEl.onended = null;
        this.currentAudioEl.onerror = null;
        this.currentAudioEl.pause();
        this.currentAudioEl.currentTime = 0;
      } catch (e) {}
      this.currentAudioEl = null;
    }
    if (this.sourceNode) {
      try {
        if (typeof this.sourceNode.stop === 'function') {
          this.sourceNode.stop();
        }
        this.sourceNode.disconnect();
      } catch (e) {}
      this.sourceNode = null;
    }
    if (hadState) {
      this.emitState();
    }
    this.syncVisualizerLoop();
  }

  /**
   * Stream authentic wildlife audio recording through the FFT visualizer.
   * Never generates synthetic / fake animal audio when no recording exists.
   */
  playAnimalAudio(audioUrl, trackMeta = null, onEndedCallback, onErrorCallback) {
    this.initAudio();
    this.stopAudio();

    if (!audioUrl) {
      if (onEndedCallback) onEndedCallback();
      return;
    }

    this.currentTrackMeta = trackMeta && typeof trackMeta === 'object' ? trackMeta : null;
    this.isPlaying = true;
    this.isPaused = false;
    const audioEl = new Audio();
    if (/^https?:\/\//i.test(audioUrl)) {
      audioEl.crossOrigin = "anonymous";
    }
    audioEl.src = audioUrl;
    this.currentAudioEl = audioEl;
    this.emitState();
    this.syncVisualizerLoop();

    try {
      const sourceNode = this.audioCtx.createMediaElementSource(audioEl);
      sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.sourceNode = sourceNode;
    } catch (err) {
      console.warn("Web Audio graph wrapping restricted, playing via HTML5 Audio element:", err);
    }

    audioEl.onended = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentAudioEl = null;
      this.currentTrackMeta = null;
      this.emitState();
      if (onEndedCallback) onEndedCallback();
    };

    audioEl.onerror = (e) => {
      console.warn("Verified audio stream could not load:", audioUrl, e);
      this.stopAudio();
      if (onErrorCallback) onErrorCallback(e);
      else if (onEndedCallback) onEndedCallback();
    };

    audioEl.play().catch(err => {
      console.warn("Audio playback prevented or failed:", audioUrl, err);
      this.stopAudio();
      if (onErrorCallback) onErrorCallback(err);
      else if (onEndedCallback) onEndedCallback();
    });
  }

  /**
   * Bind dual visualizers: Real-time Oscilloscope & Spectrogram Waterfall Canvas
   */
  startVisualizer(canvasOsc, canvasSpectrogram) {
    if (!this.analyser) return;

    this.canvasOsc = canvasOsc || this.canvasOsc;
    this.canvasSpec = canvasSpectrogram || this.canvasSpec;
    this.ctxOsc = this.canvasOsc ? this.canvasOsc.getContext('2d') : null;
    this.ctxSpec = this.canvasSpec ? this.canvasSpec.getContext('2d') : null;

    this.drawIdleBaseline();
    this.syncVisualizerLoop();
  }

  drawIdleBaseline() {
    if (this.ctxOsc && this.canvasOsc) {
      const w = this.canvasOsc.width;
      const h = this.canvasOsc.height;
      this.ctxOsc.fillStyle = '#090d16';
      this.ctxOsc.fillRect(0, 0, w, h);
      this.ctxOsc.strokeStyle = 'rgba(16, 185, 129, 0.16)';
      this.ctxOsc.lineWidth = 1.5;
      this.ctxOsc.beginPath();
      this.ctxOsc.moveTo(0, h / 2);
      this.ctxOsc.lineTo(w, h / 2);
      this.ctxOsc.stroke();
    }
    if (this.ctxSpec && this.canvasSpec && !this.isPlaying && !this.isPaused) {
      this.ctxSpec.fillStyle = '#090d16';
      this.ctxSpec.fillRect(0, 0, this.canvasSpec.width, this.canvasSpec.height);
    }
  }

  stopVisualizerLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  syncVisualizerLoop() {
    if (!this.canvasOsc || !this.analyser) return;
    const isTabVisible = this.canvasOsc.offsetParent !== null && !document.hidden;
    if (this.isPlaying && isTabVisible) {
      if (!this.animationFrameId) {
        this.startVisualizerLoop();
      }
    } else {
      this.stopVisualizerLoop();
      if (!this.isPlaying && !this.isPaused && isTabVisible) {
        this.drawIdleBaseline();
      }
    }
  }

  startVisualizerLoop() {
    if (!this.analyser || !this.canvasOsc) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const render = () => {
      const isTabVisible = this.canvasOsc && this.canvasOsc.offsetParent !== null && !document.hidden;
      if (!this.isPlaying || !isTabVisible) {
        this.animationFrameId = null;
        return;
      }

      this.animationFrameId = requestAnimationFrame(render);

      this.analyser.getByteTimeDomainData(timeData);
      this.analyser.getByteFrequencyData(freqData);

      // 1. Draw Oscilloscope
      if (this.ctxOsc && this.canvasOsc) {
        const width = this.canvasOsc.width;
        const height = this.canvasOsc.height;
        this.ctxOsc.fillStyle = '#090d16';
        this.ctxOsc.fillRect(0, 0, width, height);

        this.ctxOsc.strokeStyle = 'rgba(16, 185, 129, 0.12)';
        this.ctxOsc.lineWidth = 1;
        this.ctxOsc.beginPath();
        this.ctxOsc.moveTo(0, height / 2);
        this.ctxOsc.lineTo(width, height / 2);
        this.ctxOsc.stroke();

        this.ctxOsc.lineWidth = 2;
        this.ctxOsc.strokeStyle = '#10b981';
        this.ctxOsc.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            this.ctxOsc.moveTo(x, y);
          } else {
            this.ctxOsc.lineTo(x, y);
          }
          x += sliceWidth;
        }
        this.ctxOsc.stroke();
      }

      // 2. Draw Waterfall Spectrogram using GPU drawImage shift + precomputed LUT
      if (this.ctxSpec && this.canvasSpec) {
        const sW = this.canvasSpec.width;
        const sH = this.canvasSpec.height;

        this.ctxSpec.drawImage(this.canvasSpec, 2, 0, sW - 2, sH, 0, 0, sW - 2, sH);

        const colX = sW - 2;
        const binStep = Math.floor(bufferLength / sH);

        for (let y = 0; y < sH; y++) {
          const binIndex = Math.min(bufferLength - 1, Math.floor((sH - 1 - y) * binStep));
          const val = freqData[binIndex];
          this.ctxSpec.fillStyle = this.spectrogramLut[val];
          this.ctxSpec.fillRect(colX, y, 2, 1);
        }
      }
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  getSpectrogramColor(value) {
    return this.spectrogramLut[Math.max(0, Math.min(255, Math.floor(value || 0)))];
  }

  predictUnknownLanguage(acousticInput) {
    const {
      fundamentalFreqHz,
      modulationType,
      pulseRatePerSec,
      bandwidthHz,
      environmentMedium
    } = acousticInput;

    const f0 = Math.max(10, Number(fundamentalFreqHz) || 400);
    const bw = Math.max(50, Number(bandwidthHz) || 1200);
    const pr = Math.max(1, Number(pulseRatePerSec) || 6);

    let estimatedMassKg = Math.pow(2500 / f0, 3.2);
    if (estimatedMassKg < 0.001) estimatedMassKg = 0.001;
    if (estimatedMassKg > 150000) estimatedMassKg = 150000;

    let massCategory = "";
    if (estimatedMassKg < 0.1) massCategory = `Micro-fauna (~${(estimatedMassKg * 1000).toFixed(1)} grams, e.g. songbird, frog, insect)`;
    else if (estimatedMassKg < 5) massCategory = `Small Vertebrate (~${estimatedMassKg.toFixed(2)} kg, e.g. rodent, raptor, small canid)`;
    else if (estimatedMassKg < 60) massCategory = `Mesofauna / Medium Mammal (~${estimatedMassKg.toFixed(1)} kg, e.g. wolf, feline, macaque)`;
    else if (estimatedMassKg < 1000) massCategory = `Large Herbivore / Carnivore (~${estimatedMassKg.toFixed(0)} kg, e.g. lion, bear, horse)`;
    else massCategory = `Mega-fauna (~${(estimatedMassKg / 1000).toFixed(1)} metric tonnes, e.g. elephant, cetacean)`;

    let entropyScore = 0.4;
    let syntaxStructure = "";
    let predictedFunction = "";

    if (modulationType === 'discrete_clicks') {
      entropyScore = Math.min(0.95, 0.5 + (pr / 30) + (bw / 10000));
      syntaxStructure = "Combinatorial Temporal Coda (Rhythmic Pulse Packets with Inter-Click Intervals)";
      predictedFunction = "Biosonar Spatial Navigation & Clan Identity Codas (Echolocation + Pod Social Dialect)";
    } 
    else if (modulationType === 'infrasonic_rumble') {
      entropyScore = 0.62;
      syntaxStructure = "Continuous Frequency-Attenuated Seismic Wave with Harmonic Overtones";
      predictedFunction = "Long-Range Seismic Substrate Demarcation, Estrus Broadcast, or Coordinated Herd Movement";
    }
    else if (modulationType === 'frequency_modulated') {
      entropyScore = Math.min(0.92, 0.65 + (bw / 8000));
      syntaxStructure = "Continuous Contour Portamento with Rapid Inflection Points (Phonemic Units)";
      predictedFunction = "Individual Identification (Signature Whistle) or Dimensional Predator Warning";
    }
    else if (modulationType === 'stridulation') {
      entropyScore = 0.38;
      syntaxStructure = "Periodic Amplitude-Gated Carrier Pulse Burst";
      predictedFunction = "High-Cadence Sexual Display or Aggressive Spatial Boundary Warning";
    }
    else {
      entropyScore = 0.55;
      syntaxStructure = "Multi-Harmonic Vocal Stack with Formant Dispersion";
      predictedFunction = "Group Social Contact Call and Territory Boundary Declaration";
    }

    let propagationKm = 1.0;
    let mediumTransmissionNotes = "";

    switch (environmentMedium) {
      case 'deep_ocean':
        propagationKm = f0 < 100 ? 120.0 : (f0 < 10000 ? 15.0 : 3.5);
        mediumTransmissionNotes = "High acoustic impedance matching in saline water; deep SOFAR channel waveguiding.";
        break;
      case 'dense_canopy':
        propagationKm = f0 < 500 ? 2.5 : (f0 < 3000 ? 0.8 : 0.25);
        mediumTransmissionNotes = "Vegetation scattering and humidity dampening; optimal acoustic window located between 350 Hz and 900 Hz.";
        break;
      case 'subterranean':
        propagationKm = f0 < 80 ? 8.0 : 0.05;
        mediumTransmissionNotes = "Rayleigh seismic wave propagation through solid soil/rock; atmospheric frequencies attenuate within meters.";
        break;
      default:
        propagationKm = f0 < 50 ? 12.0 : (f0 < 1000 ? 5.0 : 1.2);
        mediumTransmissionNotes = "Thermal inversion layers during dusk/dawn create atmospheric ducting extending audible radius.";
        break;
    }

    return {
      fundamentalFreqHz: f0,
      bandwidthHz: bw,
      pulseRatePerSec: pr,
      estimatedMassKg,
      massCategory,
      entropyScore: Number(entropyScore.toFixed(3)),
      syntaxStructure,
      predictedFunction,
      environmentMedium,
      maxTransmissionKm: Number(propagationKm.toFixed(1)),
      transmissionAcoustics: mediumTransmissionNotes
    };
  }
}

export const bioacoustics = new BioacousticsEngine();
