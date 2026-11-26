/**
 * TerraFauna // Motion & Interaction Engine
 * Coordinates scroll-scrubbed Living Tree / Bio-Vine mechanics, radial cursor glow,
 * sound-effects toggle, and lightweight micro-interactions.
 */

import { livingTreeEngine } from './livingTreeMotion.js';

class MotionEffectsEngine {
  constructor() {
    this.audioCtx = null;
    this.soundFxEnabled = localStorage.getItem('terrafauna_sound_fx') !== 'false';
  }

  init() {
    this.setupSoundFxToggle();
    this.setupButtonSquish();
    this.attachCardEffects();
    livingTreeEngine.init({
      onCrownBloom: () => {
        this.playSparkleChime();
      }
    });
  }

  /* -------------------------------------------------------------
     1. SUBTLE UI AUDIO FEEDBACK (Web Audio API)
  ------------------------------------------------------------- */
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setupSoundFxToggle() {
    const btn = document.getElementById('btn-toggle-sound-fx');
    const icon = document.getElementById('sound-fx-icon');
    if (!btn) return;

    const updateBtn = () => {
      if (icon) icon.textContent = this.soundFxEnabled ? '🔊' : '🔇';
      btn.classList.toggle('muted', !this.soundFxEnabled);
      btn.title = this.soundFxEnabled ? 'Sound FX: Active (Click to mute)' : 'Sound FX: Muted (Click to enable)';
    };

    updateBtn();

    btn.addEventListener('click', () => {
      this.soundFxEnabled = !this.soundFxEnabled;
      localStorage.setItem('terrafauna_sound_fx', this.soundFxEnabled ? 'true' : 'false');
      updateBtn();
      if (this.soundFxEnabled) {
        this.playPop(750, 0.08);
      }
    });
  }

  playPop(freq = 640, duration = 0.05) {
    if (!this.soundFxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay restriction fallback
    }
  }

  playChime(note = 523.25) {
    if (!this.soundFxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio autoplay restriction fallback
    }
  }

  playSparkleChime() {
    if (!this.soundFxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playChime(freq), idx * 75);
    });
  }

  mascotReact(event) {
    if (event === 'tab_switch') {
      this.playPop(600, 0.04);
    }
  }

  /* -------------------------------------------------------------
     3. CURSOR RADIAL SPOTLIGHT GLOW (ZERO CARD BENDING / STUTTER)
  ------------------------------------------------------------- */
  attachCardEffects() {
    const cards = document.querySelectorAll('.species-card, .sound-card, .hud-stat-tile, .prediction-result-card');
    cards.forEach(card => {
      if (card.dataset.glowAttached === 'true') return;
      card.dataset.glowAttached = 'true';
      this.attachCursorGlow(card);
    });
  }

  attachCursorGlow(card) {
    let glare = card.querySelector('.card-glare-effect');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'card-glare-effect';
      card.appendChild(glare);
    }

    // Clear any stale inline transform so CSS hover transitions remain uninterrupted
    card.classList.remove('is-tilting');
    card.style.transform = '';

    let pendingGlowRaf = false;
    let lastClientX = 0;
    let lastClientY = 0;

    card.addEventListener('mouseenter', () => {
      card._glowRect = card.getBoundingClientRect();
      card.classList.add('has-cursor-glow');
    }, { passive: true });

    card.addEventListener('mousemove', (e) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      if (pendingGlowRaf) return;
      pendingGlowRaf = true;
      requestAnimationFrame(() => {
        pendingGlowRaf = false;
        const rect = card._glowRect || card.getBoundingClientRect();
        const percentX = ((lastClientX - rect.left) / Math.max(1, rect.width)) * 100;
        const percentY = ((lastClientY - rect.top) / Math.max(1, rect.height)) * 100;
        card.style.setProperty('--glow-x', `${percentX.toFixed(1)}%`);
        card.style.setProperty('--glow-y', `${percentY.toFixed(1)}%`);
        if (!card.classList.contains('has-cursor-glow')) {
          card.classList.add('has-cursor-glow');
        }
      });
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card._glowRect = null;
      pendingGlowRaf = false;
      card.classList.remove('has-cursor-glow');
    });
  }

  /* -------------------------------------------------------------
     7. TACTILE BUTTON SQUISH PHYSICS
  ------------------------------------------------------------- */
  setupButtonSquish() {
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-cyan, .tag-btn, .status-pill-btn, .nav-btn, .card-audio-pill');
      if (btn) btn.classList.add('btn-squished');
    });

    document.addEventListener('pointerup', (e) => {
      const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-cyan, .tag-btn, .status-pill-btn, .nav-btn, .card-audio-pill');
      if (btn) btn.classList.remove('btn-squished');
    });
  }

  /* -------------------------------------------------------------
     8. MODAL / SCROLL / THEME HOOKS
  ------------------------------------------------------------- */
  triggerSparklePoof() {
    // Intentionally kept clean — subtle chimes & tree reactions without confetti explosions
  }

  setupScrollObserver() {
    this.attachCardEffects();
    livingTreeEngine.setupSectionScrollReveals();
  }

  refreshTreeLayout(target = 'all') {
    livingTreeEngine.refresh(target);
  }

  onTabChanged(tabId) {
    livingTreeEngine.onTabChanged(tabId);
  }

  onThemeChanged() {
    livingTreeEngine.onThemeChanged();
  }

  setModalPaused(paused) {
    livingTreeEngine.setPaused(paused);
  }
}

export const motionEffects = new MotionEffectsEngine();
