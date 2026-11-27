/**
 * TerraFauna // Living Scroll-Driven Botanical Tree & Canopy Motion Engine
 *
 * High-performance scroll-scrubbed evolutionary tree (Tab 1) & harmonic bio-vine (Tab 2):
 *  - Zero forced layout reads inside animation frames (geometry cached per layout pass)
 *  - Zero SVG GaussianBlur filters over full-page stems (soft vector stroke halo instead)
 *  - Incremental leaf DOM updates (mutates only actively sprouting leaves near tip)
 *  - Instantaneous in-place theme palette recoloring without rebuilding SVG geometry
 */

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function lerpHexColor(hexA, hexB, t) {
  const cleanA = hexA.replace('#', '');
  const cleanB = hexB.replace('#', '');
  const a = parseInt(cleanA, 16);
  const b = parseInt(cleanB, 16);
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp(a & 255, b & 255, t));
  return `rgb(${r}, ${g}, ${bl})`;
}

function readCssColor(style, varName, fallback) {
  const val = style.getPropertyValue(varName).trim();
  return /^#[0-9a-fA-F]{6}$/.test(val) ? val : fallback;
}

function readBasePaletteTokens(isVineMode) {
  const style = getComputedStyle(document.documentElement);
  const isLightMode = document.documentElement.getAttribute('data-mode') === 'light';
  return {
    isLightMode,
    isVineMode,
    barkColor: readCssColor(style, '--tree-bark', isLightMode ? '#5c4033' : '#4a3525'),
    leafYoung: readCssColor(style, '--tree-leaf-young', isLightMode ? '#65a30d' : '#a3e635'),
    leafMature: readCssColor(style, '--tree-leaf-mature', isLightMode ? '#15803d' : '#10b981'),
    sapStart: readCssColor(style, '--tree-sap-start', isLightMode ? '#65a30d' : '#86efac'),
    sapEnd: readCssColor(style, '--tree-sap-end', isLightMode ? '#047857' : '#059669'),
    blossomBase: readCssColor(style, '--tree-blossom', isLightMode ? '#d97706' : '#fbbf24'),
    vineAccent: readCssColor(style, '--cyan-400', isLightMode ? '#0284c7' : '#38bdf8')
  };
}

function computeGreeneryColors(tokens, lushness) {
  const t = clamp(lushness, 0, 1);
  if (tokens.isVineMode) {
    return {
      leafStart: lerpHexColor(tokens.leafYoung, tokens.vineAccent, t * 0.65),
      leafEnd: lerpHexColor(tokens.leafMature, tokens.sapEnd, t),
      sapStart: lerpHexColor(tokens.sapStart, tokens.vineAccent, t),
      sapEnd: lerpHexColor(tokens.leafMature, tokens.sapEnd, t),
      barkColor: lerpHexColor(tokens.barkColor, tokens.sapEnd, 0.55),
      blossomColor: lerpHexColor(tokens.blossomBase, tokens.vineAccent, t)
    };
  }
  return {
    leafStart: lerpHexColor(tokens.leafYoung, tokens.leafMature, t * 0.72),
    leafEnd: lerpHexColor(tokens.leafMature, tokens.sapEnd, t),
    sapStart: lerpHexColor(tokens.sapStart, tokens.leafMature, t * 0.65),
    sapEnd: lerpHexColor(tokens.leafMature, tokens.sapEnd, t),
    barkColor: tokens.barkColor,
    blossomColor: lerpHexColor(tokens.leafYoung, tokens.blossomBase, t)
  };
}

/**
 * Ultra-lightweight canopy spore ambient canvas (~28fps, paused during modals/hidden tabs, zero per-frame CSS reads).
 */
class AmbientCanopyParticles {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.rafId = null;
    this.lushness = 0.1;
    this.scrollVelocity = 0;
    this.lastScrollY = 0;
    this.lastDraw = 0;
    this.paused = false;
    this.moteColor = '#86efac';
    this.moteAlpha = 0.18;
    this.youngCol = '#a3e635';
    this.matureCol = '#10b981';
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    this.canvas = document.getElementById('canopy-pollen-canvas');
    if (!this.canvas || this.reducedMotion) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.seedParticles();
    this.refreshColors();

    window.addEventListener('resize', () => this.resize(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else if (!this.paused) {
        this.start();
      }
    });

    this.lastScrollY = window.scrollY;
    this.start();
  }

  refreshColors() {
    const isLight = document.documentElement.getAttribute('data-mode') === 'light';
    const style = getComputedStyle(document.documentElement);
    this.youngCol = readCssColor(style, '--tree-leaf-young', isLight ? '#65a30d' : '#86efac');
    this.matureCol = readCssColor(style, '--tree-leaf-mature', isLight ? '#15803d' : '#10b981');
    this.moteAlpha = isLight ? 0.16 : 0.19;
    this.moteColor = lerpHexColor(this.youngCol, this.matureCol, this.lushness);
  }

  setPaused(paused) {
    this.paused = !!paused;
    if (this.paused) {
      this.stop();
    } else if (!document.hidden) {
      this.start();
    }
  }

  start() {
    if (this.reducedMotion || !this.ctx || this.rafId || this.paused) return;
    this.lastDraw = 0;
    this.rafId = requestAnimationFrame((ts) => this.loop(ts));
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  seedParticles() {
    const count = 12;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * (this.width || 1200),
      y: Math.random() * (this.height || 800),
      radius: 1.5 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.15 - Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2
    }));
  }

  setScrollState(lushness) {
    const nextLush = clamp(lushness, 0, 1);
    if (Math.abs(nextLush - this.lushness) > 0.04) {
      this.lushness = nextLush;
      this.moteColor = lerpHexColor(this.youngCol, this.matureCol, this.lushness);
    }
    const dy = window.scrollY - this.lastScrollY;
    this.lastScrollY = window.scrollY;
    this.scrollVelocity = clamp(this.scrollVelocity + dy * 0.08, -10, 10);
  }

  loop(now = 0) {
    if (!this.ctx || document.hidden || this.paused) {
      this.rafId = null;
      return;
    }

    // Cap at ~28fps so ambient canopy spores cost negligible CPU/GPU
    if (now - this.lastDraw < 36) {
      this.rafId = requestAnimationFrame((ts) => this.loop(ts));
      return;
    }
    this.lastDraw = now;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.scrollVelocity *= 0.88;
    const activeCount = Math.floor(7 + this.lushness * 5);

    this.ctx.fillStyle = this.moteColor;
    this.ctx.globalAlpha = this.moteAlpha;

    for (let i = 0; i < activeCount; i++) {
      const p = this.particles[i];
      if (!p) continue;

      p.phase += 0.03;
      p.x += p.vx + Math.sin(p.phase) * 0.22;
      p.y += p.vy - this.scrollVelocity * 0.18;

      if (p.y < -15) p.y = this.height + 15;
      else if (p.y > this.height + 15) p.y = -15;
      if (p.x < -15) p.x = this.width + 15;
      else if (p.x > this.width + 15) p.x = -15;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    this.rafId = requestAnimationFrame((ts) => this.loop(ts));
  }
}

/**
 * Single scroll-driven tree/vine stage bound to a container element (#fauna-grid or #sound-catalog).
 */
class LivingTreeInstance {
  constructor(options) {
    this.containerId = options.containerId;
    this.mode = options.mode || 'tree';
    this.onProgress = options.onProgress || (() => {});
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.containerEl = null;
    this.stageEl = null;
    this.svgEl = null;
    this.nodes = [];
    this.leaves = [];
    this.branches = [];

    this.trunkBarkPath = null;
    this.trunkSapGlowPath = null;
    this.trunkSapPath = null;
    this.trunkVinePath = null;
    this.trunkTotalLen = 0;
    this.vineTotalLen = 0;
    this.trunkSamplePoints = [];
    this.growthTipEl = null;

    this.sapStops = [];
    this.leafStops = [];
    this.barkStops = [];
    this.blossomStops = [];
    this.paletteTokens = null;
    this.lastGradRatio = -1;

    this.stageWidth = 0;
    this.stageHeight = 0;
    this.stageDocTop = 0;
    this.currentTipY = 140;
    this.targetTipY = 140;
    this.lastLoopTs = 0;
    this.rafId = null;
    this.activeNodeIndex = -1;
    this.resizeObserver = null;
    this.resizeDebounceId = null;
  }

  mount() {
    this.containerEl = document.getElementById(this.containerId);
    if (!this.containerEl) return;

    if (!this.resizeObserver && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.isVisible()) return;
        if (this.resizeDebounceId) clearTimeout(this.resizeDebounceId);
        this.resizeDebounceId = setTimeout(() => {
          this.resizeDebounceId = null;
          if (!this.isVisible() || !this.stageEl) return;
          const nextW = Math.max(320, Math.round(this.stageEl.clientWidth));
          const nextH = Math.max(340, Math.round(this.stageEl.scrollHeight));
          if (Math.abs(nextW - this.stageWidth) > 3 || Math.abs(nextH - this.stageHeight) > 20) {
            this.rebuildLayout();
          }
        }, 120);
      });
      this.resizeObserver.observe(this.containerEl);
    }

    this.rebuildLayout();
  }

  isVisible() {
    if (!this.containerEl) return false;
    const tabPane = this.containerEl.closest('.tab-pane');
    return (!tabPane || tabPane.classList.contains('active')) && this.containerEl.offsetParent !== null;
  }

  refreshColors() {
    this.paletteTokens = readBasePaletteTokens(this.mode === 'vine');
    this.lastGradRatio = -1;
    if (this.svgEl && this.nodes.length > 0) {
      const growthRatio = clamp(this.currentTipY / Math.max(1, this.stageHeight), 0, 1);
      const colors = computeGreeneryColors(this.paletteTokens, growthRatio);
      this.applyGradientStops(colors, true);
    }
  }

  applyGradientStops(colors, includeBarkAndBlossom = false) {
    if (this.sapStops.length >= 3) {
      this.sapStops[0].setAttribute('stop-color', colors.sapStart);
      this.sapStops[1].setAttribute('stop-color', colors.leafStart);
      this.sapStops[2].setAttribute('stop-color', colors.sapEnd);
    }
    if (this.leafStops.length >= 2) {
      this.leafStops[0].setAttribute('stop-color', colors.leafStart);
      this.leafStops[1].setAttribute('stop-color', colors.leafEnd);
    }
    if (includeBarkAndBlossom) {
      if (this.barkStops.length >= 3) {
        this.barkStops[0].setAttribute('stop-color', colors.barkColor);
        this.barkStops[1].setAttribute('stop-color', colors.sapEnd);
        this.barkStops[2].setAttribute('stop-color', colors.leafEnd);
      }
      if (this.blossomStops.length >= 3) {
        this.blossomStops[1].setAttribute('stop-color', colors.blossomColor);
        this.blossomStops[2].setAttribute('stop-color', colors.leafEnd);
      }
    }
  }

  rebuildLayout() {
    this.containerEl = document.getElementById(this.containerId);
    if (!this.containerEl || !this.isVisible()) return;

    this.stageEl = this.containerEl.querySelector('.tree-nodes-stage');
    const svgWrap = this.containerEl.querySelector('.tree-svg-backdrop');
    const rowEls = Array.from(this.containerEl.querySelectorAll('.tree-node-row'));

    if (!this.stageEl || !svgWrap || rowEls.length === 0) {
      this.nodes = [];
      this.leaves = [];
      this.branches = [];
      return;
    }

    const stageRect = this.stageEl.getBoundingClientRect();
    if (stageRect.width < 100) {
      requestAnimationFrame(() => {
        if (this.isVisible()) this.rebuildLayout();
      });
      return;
    }

    this.stageDocTop = stageRect.top + window.scrollY;
    this.stageWidth = Math.max(320, Math.round(stageRect.width));
    this.stageHeight = Math.max(340, Math.round(this.stageEl.scrollHeight));

    const isCompact = window.innerWidth <= 820;
    const isNarrow = window.innerWidth <= 440;
    const centerX = isNarrow ? 16 : (isCompact ? 22 : Math.round(this.stageWidth * 0.5));

    this.nodes = rowEls.map((row, idx) => {
      const side = isCompact ? 'right' : (idx % 2 === 0 ? 'left' : 'right');
      const cardAnchor = row.querySelector('.tree-card-anchor');
      const whisperEl = row.querySelector('.tree-branch-whisper');
      const jointEl = row.querySelector('.tree-joint-node');

      const rowTop = row.offsetTop;
      const rowHeight = row.offsetHeight;
      const nodeY = rowTop + Math.round(rowHeight * 0.48);

      const waveAmp = isCompact ? 5 : (this.mode === 'vine' ? 20 : 18);
      const waveFreq = this.mode === 'vine' ? 0.0085 : 0.0052;
      const trunkX = centerX + Math.sin(nodeY * waveFreq + 0.6) * waveAmp;

      if (jointEl) {
        jointEl.style.left = `${trunkX}px`;
      }

      let cardEdgeX = side === 'left' ? centerX - 72 : centerX + 72;
      if (cardAnchor) {
        const anchorLeft = cardAnchor.offsetLeft;
        const anchorWidth = cardAnchor.offsetWidth;
        cardEdgeX = side === 'left' ? anchorLeft + anchorWidth - 6 : anchorLeft + 6;
      }

      return {
        idx,
        row,
        cardAnchor,
        whisperEl,
        jointEl,
        side,
        y: nodeY,
        trunkX,
        cardEdgeX,
        isBloomed: false,
        lastReveal: -1,
        lastParallax: NaN
      };
    });

    this.paletteTokens = readBasePaletteTokens(this.mode === 'vine');
    this.lastGradRatio = -1;
    this.activeNodeIndex = -1;
    this.renderSVGTree(svgWrap, centerX, isCompact);
    this.updateTargetsFromScroll(true);
  }

  buildTrunkSpline(centerX, isCompact) {
    const waveAmp = isCompact ? 5 : (this.mode === 'vine' ? 20 : 18);
    const waveFreq = this.mode === 'vine' ? 0.0085 : 0.0052;
    const stepY = 48;
    const points = [];

    for (let y = 0; y <= this.stageHeight; y += stepY) {
      const x = centerX + Math.sin(y * waveFreq + 0.6) * waveAmp;
      points.push({ x, y });
    }
    if (points[points.length - 1].y < this.stageHeight) {
      const y = this.stageHeight;
      const x = centerX + Math.sin(y * waveFreq + 0.6) * waveAmp;
      points.push({ x, y });
    }

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
    }
    const last = points[points.length - 1];
    d += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

    let vineD = `M ${(centerX + 8).toFixed(1)} 0`;
    for (let y = 36; y <= this.stageHeight; y += 36) {
      const trunkX = centerX + Math.sin(y * waveFreq + 0.6) * waveAmp;
      const braidOffset = Math.cos(y * 0.024) * (isCompact ? 9 : 16);
      const ctrlY = y - 18;
      const ctrlX = centerX + Math.sin(ctrlY * waveFreq + 0.6) * waveAmp + Math.sin(ctrlY * 0.024) * (isCompact ? 11 : 19);
      vineD += ` Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)}, ${(trunkX + braidOffset).toFixed(1)} ${y.toFixed(1)}`;
    }

    return { trunkD: d, vineD, points, waveAmp, waveFreq };
  }

  getTrunkTipPoint(growthRatio) {
    const pts = this.trunkSamplePoints;
    if (!pts.length) return { x: this.stageWidth * 0.5, y: 0 };
    const fIdx = clamp(growthRatio, 0, 1) * (pts.length - 1);
    const i0 = Math.floor(fIdx);
    const i1 = Math.min(pts.length - 1, i0 + 1);
    const frac = fIdx - i0;
    return {
      x: lerp(pts[i0].x, pts[i1].x, frac),
      y: lerp(pts[i0].y, pts[i1].y, frac)
    };
  }

  renderSVGTree(svgWrap, centerX, isCompact) {
    const uid = this.containerId;
    const colors = computeGreeneryColors(this.paletteTokens, 0.2);
    const { trunkD, vineD, points, waveAmp, waveFreq } = this.buildTrunkSpline(centerX, isCompact);
    this.trunkSamplePoints = points;

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'living-tree-svg');
    svg.setAttribute('viewBox', `0 0 ${this.stageWidth} ${this.stageHeight}`);
    svg.setAttribute('width', String(this.stageWidth));
    svg.setAttribute('height', String(this.stageHeight));
    svg.setAttribute('preserveAspectRatio', 'none');

    // Pure vector gradients (no expensive SVG GaussianBlur filters over 10,000px elements)
    svg.innerHTML = `
      <defs>
        <linearGradient id="${uid}-bark-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.barkColor}" stop-opacity="0.92" />
          <stop offset="50%" stop-color="${colors.sapEnd}" stop-opacity="0.72" />
          <stop offset="100%" stop-color="${colors.leafEnd}" stop-opacity="0.88" />
        </linearGradient>
        <linearGradient id="${uid}-sap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.sapStart}" />
          <stop offset="55%" stop-color="${colors.leafStart}" />
          <stop offset="100%" stop-color="${colors.sapEnd}" />
        </linearGradient>
        <linearGradient id="${uid}-leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors.leafStart}" />
          <stop offset="100%" stop-color="${colors.leafEnd}" />
        </linearGradient>
        <radialGradient id="${uid}-blossom-grad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="55%" stop-color="${colors.blossomColor}" />
          <stop offset="100%" stop-color="${colors.leafEnd}" stop-opacity="0.8" />
        </radialGradient>
      </defs>
    `;

    // Layer 1: Faint dormant guide root trace
    const guidePath = document.createElementNS(NS, 'path');
    guidePath.setAttribute('d', trunkD);
    guidePath.setAttribute('class', 'tree-trunk-guide');
    svg.appendChild(guidePath);

    // Layer 2: Organic Bark / Outer Stem Trunk
    const barkPath = document.createElementNS(NS, 'path');
    barkPath.setAttribute('d', trunkD);
    barkPath.setAttribute('class', 'tree-trunk-bark');
    barkPath.setAttribute('stroke', `url(#${uid}-bark-grad)`);
    barkPath.setAttribute('stroke-width', isCompact ? '8' : (this.mode === 'vine' ? '9' : '13'));
    svg.appendChild(barkPath);

    // Layer 3a: Lightweight vector halo underneath chlorophyll sap core (replaces heavy feGaussianBlur)
    const sapGlowPath = document.createElementNS(NS, 'path');
    sapGlowPath.setAttribute('d', trunkD);
    sapGlowPath.setAttribute('class', 'tree-trunk-sap-glow');
    sapGlowPath.setAttribute('stroke', `url(#${uid}-sap-grad)`);
    sapGlowPath.setAttribute('stroke-width', isCompact ? '9' : '12');
    sapGlowPath.setAttribute('opacity', '0.22');
    svg.appendChild(sapGlowPath);

    // Layer 3b: Living Glowing Chlorophyll Sap Core
    const sapPath = document.createElementNS(NS, 'path');
    sapPath.setAttribute('d', trunkD);
    sapPath.setAttribute('class', 'tree-trunk-sap');
    sapPath.setAttribute('stroke', `url(#${uid}-sap-grad)`);
    sapPath.setAttribute('stroke-width', isCompact ? '3.5' : '5.5');
    svg.appendChild(sapPath);

    // Layer 4: Twining Ivy / Harmonic Tendril
    const vinePath = document.createElementNS(NS, 'path');
    vinePath.setAttribute('d', vineD);
    vinePath.setAttribute('class', 'tree-vine-braid');
    vinePath.setAttribute('stroke', `url(#${uid}-leaf-grad)`);
    svg.appendChild(vinePath);

    // Layer 5 & 6: Branches and Leaves
    const branchGroup = document.createElementNS(NS, 'g');
    branchGroup.setAttribute('class', 'tree-branches-layer');
    svg.appendChild(branchGroup);

    const foliageGroup = document.createElementNS(NS, 'g');
    foliageGroup.setAttribute('class', 'tree-foliage-layer');
    svg.appendChild(foliageGroup);

    this.leaves = [];
    this.branches = [];

    this.nodes.forEach((node) => {
      const startX = node.trunkX;
      const startY = node.y;
      const endX = node.cardEdgeX;
      const endY = node.y + (node.idx % 2 === 0 ? -8 : 8);

      const midX = lerp(startX, endX, 0.52);
      const archY = startY - (isCompact ? 22 : 34);
      const branchD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${midX.toFixed(1)} ${archY.toFixed(1)}, ${lerp(startX, endX, 0.78).toFixed(1)} ${(endY + 10).toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      const bPath = document.createElementNS(NS, 'path');
      bPath.setAttribute('d', branchD);
      bPath.setAttribute('class', 'tree-branch-path');
      bPath.setAttribute('stroke', `url(#${uid}-sap-grad)`);
      branchGroup.appendChild(bPath);

      const bLen = bPath.getTotalLength ? bPath.getTotalLength() : 160;
      bPath.style.strokeDasharray = `${bLen}`;
      bPath.style.strokeDashoffset = `${bLen}`;

      let wPath = null;
      let wLen = 0;
      if (!isCompact) {
        const wDir = node.side === 'left' ? 1 : -1;
        const wEndX = startX + wDir * 68;
        const wEndY = startY - 14;
        const wD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${(startX + wDir * 36).toFixed(1)} ${(startY - 22).toFixed(1)}, ${wEndX.toFixed(1)} ${wEndY.toFixed(1)}`;
        wPath = document.createElementNS(NS, 'path');
        wPath.setAttribute('d', wD);
        wPath.setAttribute('class', 'tree-whisper-twig');
        wPath.setAttribute('stroke', `url(#${uid}-leaf-grad)`);
        branchGroup.appendChild(wPath);
        wLen = wPath.getTotalLength ? wPath.getTotalLength() : 75;
        wPath.style.strokeDasharray = `${wLen}`;
        wPath.style.strokeDashoffset = `${wLen}`;

        this.addLeaf(foliageGroup, uid, wEndX - wDir * 12, wEndY + 2, startY - 35, wDir > 0 ? -30 : 210, 0.85, false);
        this.addLeaf(foliageGroup, uid, wEndX, wEndY, startY - 15, wDir > 0 ? 18 : 162, 0.92, node.idx % 3 === 1);
      }

      this.branches.push({
        node,
        bPath,
        bLen,
        wPath,
        wLen,
        lastBProg: -1,
        lastWProg: -1
      });

      const leafCount = isCompact ? 3 : 4;
      for (let k = 1; k <= leafCount; k++) {
        const ratio = k / (leafCount + 0.4);
        const pt = bPath.getPointAtLength ? bPath.getPointAtLength(bLen * ratio) : { x: lerp(startX, endX, ratio), y: lerp(startY, endY, ratio) };
        const dirSign = node.side === 'left' ? -1 : 1;
        const baseAngle = dirSign < 0
          ? (k % 2 === 0 ? -135 : 145)
          : (k % 2 === 0 ? -45 : 35);
        const isBlossom = k === leafCount && (node.idx % 2 === 1 || this.mode === 'tree');
        this.addLeaf(
          foliageGroup,
          uid,
          pt.x,
          pt.y,
          startY - 80 + k * 22,
          baseAngle,
          0.75 + (k % 3) * 0.2,
          isBlossom
        );
      }
    });

    const internodeStep = this.mode === 'vine' ? 86 : 72;
    for (let y = 28; y < this.stageHeight - 30; y += internodeStep) {
      const tx = centerX + Math.sin(y * waveFreq + 0.6) * waveAmp;
      const sideSign = Math.floor(y / internodeStep) % 2 === 0 ? -1 : 1;
      const angle = sideSign < 0 ? -135 + (y % 22) : -45 - (y % 22);
      const scale = 0.66 + ((y % 40) / 40) * 0.34;
      const isBlossom = (Math.floor(y / internodeStep) % 5 === 4);
      this.addLeaf(foliageGroup, uid, tx + sideSign * 6, y, y - 40, angle, scale, isBlossom);
    }

    // Layer 7: Clean Vector Meristem Shoot Tip (no filter blur)
    const tipGroup = document.createElementNS(NS, 'g');
    tipGroup.setAttribute('class', 'tree-growth-tip');
    tipGroup.innerHTML = `
      <circle cx="0" cy="0" r="15" fill="url(#${uid}-sap-grad)" opacity="0.24" />
      <circle cx="0" cy="0" r="9" fill="url(#${uid}-sap-grad)" opacity="0.45" />
      <circle class="tip-core" cx="0" cy="0" r="5" fill="#ffffff" />
      <path d="M 0 0 Q -12 -10 -16 -2 Q -8 4 0 0 Z" fill="url(#${uid}-leaf-grad)" />
      <path d="M 0 0 Q 12 -10 16 -2 Q 8 4 0 0 Z" fill="url(#${uid}-leaf-grad)" />
    `;
    svg.appendChild(tipGroup);
    this.growthTipEl = tipGroup;

    svgWrap.innerHTML = '';
    svgWrap.appendChild(svg);
    this.svgEl = svg;

    // Cache stop NodeLists once per layout
    this.sapStops = Array.from(svg.querySelectorAll(`#${uid}-sap-grad stop`));
    this.leafStops = Array.from(svg.querySelectorAll(`#${uid}-leaf-grad stop`));
    this.barkStops = Array.from(svg.querySelectorAll(`#${uid}-bark-grad stop`));
    this.blossomStops = Array.from(svg.querySelectorAll(`#${uid}-blossom-grad stop`));

    this.trunkBarkPath = barkPath;
    this.trunkSapGlowPath = sapGlowPath;
    this.trunkSapPath = sapPath;
    this.trunkVinePath = vinePath;
    this.trunkTotalLen = barkPath.getTotalLength ? barkPath.getTotalLength() : this.stageHeight;
    this.vineTotalLen = vinePath.getTotalLength ? vinePath.getTotalLength() : this.stageHeight;

    [barkPath, sapGlowPath, sapPath].forEach(p => {
      p.style.strokeDasharray = `${this.trunkTotalLen}`;
      p.style.strokeDashoffset = `${this.trunkTotalLen}`;
    });
    vinePath.style.strokeDasharray = `${this.vineTotalLen}`;
    vinePath.style.strokeDashoffset = `${this.vineTotalLen}`;
  }

  addLeaf(parentGroup, uid, x, y, spawnY, angleDeg, maxScale, isBlossom) {
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', isBlossom ? 'tree-blossom-node' : 'tree-leaf-node');
    g.setAttribute('transform', `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${angleDeg}) scale(0)`);

    if (isBlossom) {
      g.innerHTML = `
        <path d="M 0 0 C 8 -8, 18 -6, 20 0 C 18 6, 8 8, 0 0 Z" fill="url(#${uid}-blossom-grad)" opacity="0.95" />
        <path d="M 0 0 C 4 -11, 14 -12, 16 -5 C 12 -1, 4 0, 0 0 Z" fill="url(#${uid}-leaf-grad)" opacity="0.85" />
        <circle cx="13" cy="0" r="2.2" fill="#ffffff" />
      `;
    } else if (this.mode === 'vine') {
      g.innerHTML = `
        <path d="M 0 0 C 8 -9, 21 -7, 25 0 C 21 7, 8 9, 0 0 Z" fill="url(#${uid}-leaf-grad)" opacity="0.92" />
        <path d="M 2 0 Q 12 -1 21 0" stroke="rgba(255,255,255,0.45)" stroke-width="0.9" fill="none" />
      `;
    } else {
      g.innerHTML = `
        <path d="M 0 0 C 7 -11, 22 -10, 28 0 C 22 10, 7 11, 0 0 Z" fill="url(#${uid}-leaf-grad)" opacity="0.94" />
        <path d="M 1 0 Q 13 -1.2 24 0" stroke="rgba(255,255,255,0.42)" stroke-width="1" fill="none" />
      `;
    }

    parentGroup.appendChild(g);

    this.leaves.push({
      el: g,
      x: x.toFixed(1),
      y: y.toFixed(1),
      spawnY,
      angleDeg,
      maxScale,
      lastScale: 0
    });
  }

  updateTargetsFromScroll(immediate = false) {
    if (!this.stageEl || !this.isVisible() || this.nodes.length === 0) return;

    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    const stageTopInViewport = this.stageDocTop - scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    const docRatio = clamp(scrollY / maxScroll, 0, 1);

    const firstNodeY = this.nodes[0]?.y || 140;
    const minSproutY = Math.min(this.stageHeight, firstNodeY + 35);
    const readTipY = vh * 0.68 - stageTopInViewport;

    const endBoost = docRatio > 0.78
      ? ((docRatio - 0.78) / 0.22) * Math.max(0, this.stageHeight - readTipY)
      : 0;

    this.targetTipY = clamp(readTipY + endBoost, minSproutY, this.stageHeight);

    if (immediate || this.reducedMotion) {
      this.currentTipY = this.targetTipY;
      this.lastLoopTs = 0;
      this.applyVisualFrame();
    } else if (!this.rafId) {
      this.lastLoopTs = 0;
      this.startLoop();
    }
  }

  startLoop() {
    const step = (ts = performance.now()) => {
      const prevTs = this.lastLoopTs || ts;
      this.lastLoopTs = ts;
      const dt = Math.min(34, Math.max(4, ts - prevTs)) / 16.667;
      const alpha = 1 - Math.pow(0.78, dt);

      const diff = this.targetTipY - this.currentTipY;
      if (Math.abs(diff) < 0.45) {
        this.currentTipY = this.targetTipY;
        this.lastLoopTs = 0;
        this.applyVisualFrame();
        this.rafId = null;
        return;
      }
      this.currentTipY += diff * alpha;
      this.applyVisualFrame();
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  applyVisualFrame() {
    if (!this.svgEl || this.nodes.length === 0) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight || 900;
    const growthRatio = clamp(this.currentTipY / Math.max(1, this.stageHeight), 0, 1);

    // 1. Update gradients & chlorophyll sap thickness only on noticeable progress changes
    if (Math.abs(growthRatio - this.lastGradRatio) >= 0.012) {
      this.lastGradRatio = growthRatio;
      this.containerEl.style.setProperty('--tree-lushness', growthRatio.toFixed(3));
      const colors = computeGreeneryColors(this.paletteTokens, growthRatio);
      this.applyGradientStops(colors, false);

      if (this.trunkSapPath) {
        const baseSapWidth = this.stageWidth < 820 ? 3.5 : 5.2;
        this.trunkSapPath.setAttribute('stroke-width', (baseSapWidth + growthRatio * 2.5).toFixed(1));
      }
    }

    // 2. Grow/retract main trunk, glow halo, sap core, and twining vine
    const trunkOffset = `${(this.trunkTotalLen * (1 - growthRatio)).toFixed(1)}`;
    if (this.trunkBarkPath) this.trunkBarkPath.style.strokeDashoffset = trunkOffset;
    if (this.trunkSapGlowPath) this.trunkSapGlowPath.style.strokeDashoffset = trunkOffset;
    if (this.trunkSapPath) this.trunkSapPath.style.strokeDashoffset = trunkOffset;

    const vineRatio = clamp((growthRatio - 0.03) / 0.97, 0, 1);
    if (this.trunkVinePath) {
      this.trunkVinePath.style.strokeDashoffset = `${(this.vineTotalLen * (1 - vineRatio)).toFixed(1)}`;
    }

    // 3. Position meristem shoot tip via pre-sampled O(1) trunk curve points
    if (this.growthTipEl) {
      const pt = this.getTrunkTipPoint(growthRatio);
      const tipScale = growthRatio >= 0.995 ? 0.5 : 1;
      this.growthTipEl.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) scale(${tipScale})`);
    }

    // 4. Incremental leaf sprouting (windowed around active growth front for 60fps on 80+ nodes)
    const lushScaleBoost = 0.85 + growthRatio * 0.20;
    const minLeafY = this.currentTipY - 460;
    const maxLeafY = this.currentTipY + 90;
    for (let i = 0; i < this.leaves.length; i++) {
      const L = this.leaves[i];
      if (L.spawnY > maxLeafY && L.lastScale === 0) continue;
      if (L.spawnY < minLeafY && L.lastScale > 0 && Math.abs(L.maxScale * lushScaleBoost - L.lastScale) < 0.04) continue;
      const localP = clamp((this.currentTipY - L.spawnY) / 115, 0, 1);
      const targetScale = easeOutBack(localP) * L.maxScale * lushScaleBoost;
      if (Math.abs(targetScale - L.lastScale) >= 0.02) {
        L.lastScale = targetScale;
        L.el.setAttribute(
          'transform',
          `translate(${L.x}, ${L.y}) rotate(${L.angleDeg}) scale(${Math.max(0, targetScale).toFixed(2)})`
        );
      }
    }

    // 5. Lateral branches, near-viewport GPU cull & opposing parallax reveals (zero DOM reads!)
    const viewportFocusY = vh * 0.46;
    const nearMinY = -vh * 0.65;
    const nearMaxY = vh * 1.65;
    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < this.branches.length; i++) {
      const b = this.branches[i];
      const node = b.node;
      const rowCenterY = this.stageDocTop + node.y - scrollY;
      const isNearView = rowCenterY >= nearMinY && rowCenterY <= nearMaxY;
      if (isNearView !== node.isNearView) {
        node.isNearView = isNearView;
        node.row.classList.toggle('is-near-view', isNearView);
      }

      const dist = Math.abs(rowCenterY - viewportFocusY);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }

      // Skip vector & CSS var updates for cards well outside the viewport once settled
      if (!isNearView && node.lastReveal >= 0) continue;

      const bProg = easeOutCubic(clamp((this.currentTipY - (node.y - 110)) / 180, 0, 1));
      if (Math.abs(bProg - b.lastBProg) >= 0.01) {
        b.lastBProg = bProg;
        b.bPath.style.strokeDashoffset = `${(b.bLen * (1 - bProg)).toFixed(1)}`;
      }

      if (b.wPath) {
        const wProg = easeOutCubic(clamp((this.currentTipY - (node.y - 70)) / 170, 0, 1));
        if (Math.abs(wProg - b.lastWProg) >= 0.01) {
          b.lastWProg = wProg;
          b.wPath.style.strokeDashoffset = `${(b.wLen * (1 - wProg)).toFixed(1)}`;
        }
      }

      const reveal = easeOutCubic(clamp((this.currentTipY - (node.y - 135)) / 175, 0, 1));
      const normalizedDelta = clamp((rowCenterY - viewportFocusY) / vh, -1, 1);
      const cardParallax = Number((normalizedDelta * -10).toFixed(2));
      const whisperParallax = Number((normalizedDelta * 13).toFixed(2));
      const revealRounded = Math.round(reveal * 200) / 200;

      if (revealRounded !== node.lastReveal || Math.abs(cardParallax - node.lastParallax) >= 0.05) {
        node.lastReveal = revealRounded;
        node.lastParallax = cardParallax;

        if (node.cardAnchor) {
          node.cardAnchor.style.setProperty('--reveal', revealRounded);
          node.cardAnchor.style.setProperty('--parallax-y', `${cardParallax}px`);
        }
        if (node.whisperEl) {
          node.whisperEl.style.setProperty('--reveal', revealRounded);
          node.whisperEl.style.setProperty('--parallax-y', `${whisperParallax}px`);
        }
      }

      const shouldBloom = reveal > 0.35;
      if (shouldBloom !== node.isBloomed) {
        node.isBloomed = shouldBloom;
        node.row.classList.toggle('is-bloomed', shouldBloom);
      }
    }

    if (closestIdx !== this.activeNodeIndex) {
      if (this.activeNodeIndex >= 0 && this.nodes[this.activeNodeIndex]) {
        this.nodes[this.activeNodeIndex].row.classList.remove('is-active-node');
      }
      this.activeNodeIndex = closestIdx;
      if (this.nodes[closestIdx]) {
        this.nodes[closestIdx].row.classList.add('is-active-node');
      }
    }

    const finaleEl = this.containerEl.querySelector('.tree-canopy-finale');
    if (finaleEl) {
      finaleEl.classList.toggle('is-full-bloom', growthRatio > 0.91);
    }

    this.onProgress({
      mode: this.mode,
      growthRatio,
      activeIdx: closestIdx,
      totalNodes: this.nodes.length
    });
  }
}

/**
 * Coordinates the Living Tree Instances, Ambient Pollen Particles, Quick-Jump pill, and Tab 3/4 Reveals.
 */
class LivingTreeMotionCoordinator {
  constructor() {
    this.particles = new AmbientCanopyParticles();
    this.trees = {};
    this.activeTabId = 'tab-fauna';
    this.crownCelebrated = {};
    this.revealObserver = null;
    this.scrollRafPending = false;
    this.quickJumpAtBottom = null;
  }

  init(options = {}) {
    this.onCrownBloom = options.onCrownBloom || null;
    this.particles.init();

    this.trees['tab-fauna'] = new LivingTreeInstance({
      containerId: 'fauna-grid',
      mode: 'tree',
      onProgress: (info) => this.handleTreeProgress('tab-fauna', info)
    });

    this.setupScrollListener();
    this.setupSectionScrollReveals();
    this.refresh('fauna');
  }

  setupScrollListener() {
    window.addEventListener('scroll', () => {
      if (this.scrollRafPending) return;
      this.scrollRafPending = true;
      requestAnimationFrame(() => {
        this.scrollRafPending = false;
        const activeTree = this.trees[this.activeTabId];
        if (activeTree) {
          activeTree.updateTargetsFromScroll(false);
        }
      });
    }, { passive: true });

    window.addEventListener('resize', () => {
      const activeTree = this.trees[this.activeTabId];
      if (activeTree) {
        activeTree.rebuildLayout();
      }
    }, { passive: true });
  }

  setupSectionScrollReveals() {
    if (typeof IntersectionObserver === 'undefined') return;
    if (this.revealObserver) this.revealObserver.disconnect();

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-revealed');
        }
      });
    }, { threshold: 0.12 });

  }

  refresh(target = 'all') {
    if (target === 'fauna' || target === 'all') {
      requestAnimationFrame(() => this.trees['tab-fauna']?.mount());
    }
    this.setupSectionScrollReveals();
  }

  onTabChanged(tabId) {
    this.activeTabId = tabId;
    const activeTree = this.trees[tabId];
    if (activeTree) {
      requestAnimationFrame(() => {
        activeTree.mount();
        activeTree.updateTargetsFromScroll(true);
      });
    }
    this.setupSectionScrollReveals();
  }

  onThemeChanged() {
    this.particles.refreshColors();
    Object.values(this.trees).forEach((tree) => tree.refreshColors());
  }

  setPaused(paused) {
    this.particles.setPaused(paused);
  }

  handleTreeProgress(tabId, info) {
    if (tabId !== this.activeTabId) return;
    this.particles.setScrollState(info.growthRatio);

    if (info.growthRatio > 0.94 && info.totalNodes >= 4 && !this.crownCelebrated[tabId]) {
      this.crownCelebrated[tabId] = true;
      if (this.onCrownBloom) this.onCrownBloom(tabId);
    }
  }
}

export const livingTreeEngine = new LivingTreeMotionCoordinator();
