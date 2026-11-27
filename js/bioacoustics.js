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
    this.idleBgColor = '#090d16';
    this.waveColor = '#10b981';
    this.gridLineColor = 'rgba(16, 185, 129, 0.16)';
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

  refreshTheme() {
    const isLight = document.documentElement.getAttribute('data-mode') === 'light';
    const styles = getComputedStyle(document.documentElement);
    const bgCandidate = styles.getPropertyValue('--bg-input').trim() || styles.getPropertyValue('--bg-card').trim();
    const accentCandidate = styles.getPropertyValue('--emerald-500').trim();
    const brightCandidate = styles.getPropertyValue('--emerald-400').trim();

    this.idleBgColor = bgCandidate || (isLight ? '#e1f4eb' : '#0b1115');
    this.waveColor = isLight ? (accentCandidate || '#059669') : (brightCandidate || '#34d399');
    this.gridLineColor = isLight ? 'rgba(15, 23, 42, 0.10)' : 'rgba(148, 163, 184, 0.16)';
    this.spectrogramLut = this.buildSpectrogramLut(isLight);

    if (!this.isPlaying && !this.isPaused) {
      this.drawIdleBaseline();
    }
  }

  buildSpectrogramLut(isLight = document.documentElement.getAttribute('data-mode') === 'light') {
    const lut = new Array(256);
    for (let value = 0; value < 256; value++) {
      if (value < 20) {
        lut[value] = this.idleBgColor || (isLight ? '#e1f4eb' : '#0b1115');
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
  playAnimalAudio(audioUrl, trackMeta = null, onEndedCallback, onErrorCallback, allowCorsFallback = true) {
    this.initAudio();
    this.stopAudio();

    if (!audioUrl) {
      if (onEndedCallback) onEndedCallback();
      return;
    }

    let isCrossOriginHttp = false;
    try {
      const baseHref = (typeof document !== 'undefined' && document.baseURI)
        ? document.baseURI
        : window.location.href;
      const parsedUrl = new URL(audioUrl, baseHref);
      isCrossOriginHttp = /^https?:$/i.test(parsedUrl.protocol) && parsedUrl.origin !== window.location.origin;
    } catch {}

    this.currentTrackMeta = trackMeta && typeof trackMeta === 'object' ? trackMeta : null;
    this.isPlaying = true;
    this.isPaused = false;
    const audioEl = new Audio();
    const useAnonymousCors = isCrossOriginHttp && allowCorsFallback;
    if (useAnonymousCors) {
      audioEl.crossOrigin = "anonymous";
    }
    audioEl.src = audioUrl;
    this.currentAudioEl = audioEl;
    this.emitState();
    this.syncVisualizerLoop();

    if (!isCrossOriginHttp || useAnonymousCors) {
      try {
        const sourceNode = this.audioCtx.createMediaElementSource(audioEl);
        sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.sourceNode = sourceNode;
      } catch (err) {
        console.warn("Web Audio graph wrapping restricted, playing via HTML5 Audio element:", err);
      }
    }

    let settled = false;
    const handleFailure = (err) => {
      if (settled) return;
      settled = true;
      if (err && err.name === 'AbortError') return;
      if (useAnonymousCors) {
        console.warn("Cross-origin CORS audio failed, retrying without CORS:", audioUrl);
        this.playAnimalAudio(audioUrl, trackMeta, onEndedCallback, onErrorCallback, false);
        return;
      }
      console.warn("Verified audio stream could not load:", audioUrl, err);
      this.stopAudio();
      if (onErrorCallback) onErrorCallback(err);
      else if (onEndedCallback) onEndedCallback();
    };

    audioEl.onended = () => {
      if (settled) return;
      settled = true;
      this.isPlaying = false;
      this.isPaused = false;
      this.currentAudioEl = null;
      this.currentTrackMeta = null;
      this.emitState();
      if (onEndedCallback) onEndedCallback();
    };

    audioEl.onerror = (e) => {
      handleFailure(e);
    };

    audioEl.play().catch(err => {
      handleFailure(err);
    });
  }

  /**
   * Attach dual visualizer canvases for idle theme rendering without triggering AudioContext autoplay warnings.
   */
  attachCanvases(canvasOsc, canvasSpectrogram) {
    this.canvasOsc = canvasOsc || null;
    this.canvasSpec = canvasSpectrogram || null;
    this.ctxOsc = this.canvasOsc ? this.canvasOsc.getContext('2d') : null;
    this.ctxSpec = this.canvasSpec ? this.canvasSpec.getContext('2d') : null;
    if (!this.canvasOsc && !this.canvasSpec) {
      this.stopVisualizerLoop();
      return;
    }
    this.refreshTheme();
    this.syncVisualizerLoop();
  }

  doesCanvasMatchCurrentTrack() {
    if (!this.canvasOsc) return false;
    const canvasSpeciesId = this.canvasOsc.dataset?.speciesId || '';
    if (!canvasSpeciesId) return true;
    return Boolean(this.currentTrackMeta?.id && this.currentTrackMeta.id === canvasSpeciesId);
  }

  /**
   * Bind dual visualizers & begin animation when AudioContext is active
   */
  startVisualizer(canvasOsc, canvasSpectrogram) {
    this.attachCanvases(canvasOsc, canvasSpectrogram);
    if (!this.analyser) return;
    this.syncVisualizerLoop();
  }

  drawIdleBaseline() {
    if (this.ctxOsc && this.canvasOsc) {
      const w = this.canvasOsc.width;
      const h = this.canvasOsc.height;
      this.ctxOsc.fillStyle = this.idleBgColor;
      this.ctxOsc.fillRect(0, 0, w, h);
      this.ctxOsc.strokeStyle = this.gridLineColor;
      this.ctxOsc.lineWidth = 1.5;
      this.ctxOsc.beginPath();
      this.ctxOsc.moveTo(0, h / 2);
      this.ctxOsc.lineTo(w, h / 2);
      this.ctxOsc.stroke();
    }
    if (this.ctxSpec && this.canvasSpec && !this.isPlaying && !this.isPaused) {
      this.ctxSpec.fillStyle = this.idleBgColor;
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
    if (!this.canvasOsc) return;
    const isVisible = this.canvasOsc.offsetParent !== null && !document.hidden;
    const matchesTrack = this.doesCanvasMatchCurrentTrack();
    if (this.isPlaying && this.analyser && isVisible && matchesTrack) {
      if (!this.animationFrameId) {
        this.startVisualizerLoop();
      }
    } else {
      this.stopVisualizerLoop();
      if (isVisible && (!matchesTrack || (!this.isPlaying && !this.isPaused))) {
        this.drawIdleBaseline();
      }
    }
  }

  startVisualizerLoop() {
    if (!this.analyser || !this.canvasOsc || !this.doesCanvasMatchCurrentTrack()) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const render = () => {
      const isVisible = this.canvasOsc && this.canvasOsc.offsetParent !== null && !document.hidden;
      if (!this.isPlaying || !isVisible || !this.doesCanvasMatchCurrentTrack()) {
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
        this.ctxOsc.fillStyle = this.idleBgColor;
        this.ctxOsc.fillRect(0, 0, width, height);

        this.ctxOsc.strokeStyle = this.gridLineColor;
        this.ctxOsc.lineWidth = 1;
        this.ctxOsc.beginPath();
        this.ctxOsc.moveTo(0, height / 2);
        this.ctxOsc.lineTo(width, height / 2);
        this.ctxOsc.stroke();

        this.ctxOsc.lineWidth = 2;
        this.ctxOsc.strokeStyle = this.waveColor;
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
