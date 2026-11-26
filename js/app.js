/**
 * TerraFauna // Global Zoological Atlas - Main Application Controller
 * Orchestrates biodiversity exploration and verified wildlife bioacoustics.
 */

import { VERIFIED_SPECIES_CATALOG } from './speciesData.js';
import { bioService } from './gbifService.js';
import { bioacoustics } from './bioacoustics.js';
import { motionEffects } from './motionEffects.js';
import { DECODED_BIOACOUSTIC_DICTIONARY, getUniversalDecodedBioacoustics } from './bioacousticDecoder.js';
import {
  customSpeciesStore,
  escapeHtml,
  sanitizeHttpUrl,
  sanitizeImageSource,
  sanitizeAudioSource,
  compressImageFileToDataUrl,
  validateAudioFile,
  resolvePlayableAudioSource,
  getFallbackEmojiForCategory
} from './customSpeciesStore.js';

export const IUCN_STATUS_MAP = {
  CR: { code: "CR", name: "Critically Endangered", desc: "Facing an extremely high risk of extinction in the wild.", class: "status-CR" },
  EN: { code: "EN", name: "Endangered", desc: "Facing a very high risk of extinction in the wild.", class: "status-EN" },
  VU: { code: "VU", name: "Vulnerable", desc: "Facing a high risk of endangerment in the wild.", class: "status-VU" },
  NT: { code: "NT", name: "Near Threatened", desc: "Close to qualifying for or likely to qualify for a threatened category in the near future.", class: "status-NT" },
  LC: { code: "LC", name: "Least Concern", desc: "Widespread and abundant taxa evaluated at lowest risk of extinction.", class: "status-LC" },
  DD: { code: "DD", name: "Data Deficient", desc: "Inadequate empirical information to make a direct assessment of extinction risk.", class: "status-DD" }
};

class TerraFaunaApp {
  constructor() {
    this.customSpeciesList = customSpeciesStore.loadAll();
    this.customUploadedImageData = '';
    this.pendingAudioFile = null;
    this.pendingAudioPreviewUrl = '';
    this.keptExistingAudioSource = '';
    this.keptExistingAudioName = '';
    this.activeAudioBlobUrl = '';
    this._audioRequestSeq = 0;
    this.currentSpeciesList = this.getCombinedCatalog();
    this.activeFilter = 'all';
    this.activeIucnFilter = null;
    this.lastLanguagePrediction = null;
    this.activeDecodedSpecies = VERIFIED_SPECIES_CATALOG[0];
    this.decodingAnimationTimer = null;
  }

  getCombinedCatalog() {
    return [...this.customSpeciesList, ...VERIFIED_SPECIES_CATALOG];
  }

  init() {
    this.setupThemeSwitcher();
    this.setupAudioTransportControls();
    this.setupTabs();
    this.setupFaunaExplorer();
    this.setupBioacousticsLab();
    this.setupCustomSpeciesManager();
    this.setupModals();

    motionEffects.init();

    console.log("TerraFauna initialized successfully.");
  }

  /* -------------------------------------------------------------
     HAMBURGER MENU, AUDIO TRANSPORT, DATABASE DRAWER & PALETTES
  ------------------------------------------------------------- */
  setDrawerOpen(isOpen) {
    const trigger = document.getElementById('hamburger-trigger');
    const drawer = document.getElementById('hamburger-drawer');
    if (!trigger || !drawer) return;
    drawer.classList.toggle('open', isOpen);
    trigger.classList.toggle('open', isOpen);
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  setDrawerView(viewName = 'controls') {
    const drawer = document.getElementById('hamburger-drawer');
    const isDb = viewName === 'database';
    if (drawer) drawer.classList.toggle('is-database-open', isDb);

    document.querySelectorAll('.drawer-view-btn').forEach((btn) => {
      const active = btn.getAttribute('data-drawer-view') === viewName;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const controlsPane = document.getElementById('drawer-pane-controls');
    const dbPane = document.getElementById('drawer-pane-database');
    if (controlsPane) controlsPane.classList.toggle('active', !isDb);
    if (dbPane) dbPane.classList.toggle('active', isDb);
  }

  openDrawerDatabase() {
    this.setDrawerView('database');
    this.setDrawerOpen(true);
  }

  setupAudioTransportControls() {
    const pauseBtn = document.getElementById('drawer-btn-pause-resume');
    const stopBtn = document.getElementById('drawer-btn-stop-audio');
    const tab2PauseBtn = document.getElementById('btn-pause-audio');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        bioacoustics.togglePauseResume();
      });
    }
    if (tab2PauseBtn) {
      tab2PauseBtn.addEventListener('click', () => {
        bioacoustics.togglePauseResume();
      });
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        bioacoustics.stopAudio();
      });
    }

    bioacoustics.onPlaybackStateChange((playback) => {
      this.syncAudioUiState(playback);
    });
  }

  syncAudioUiState({ status, track, hasAudio }) {
    const bar = document.getElementById('drawer-audio-bar');
    const statusEl = document.getElementById('drawer-audio-status');
    const pauseBtn = document.getElementById('drawer-btn-pause-resume');
    const stopBtn = document.getElementById('drawer-btn-stop-audio');
    const tab2PauseBtn = document.getElementById('btn-pause-audio');
    const triggerBtn = document.getElementById('hamburger-trigger');
    const oscEl = document.getElementById('osc-status');
    const decoderStatusEl = document.getElementById('decoder-stream-status');
    const trackLabel = track?.commonName || 'Wildlife Audio';

    if (bar) bar.setAttribute('data-state', status);

    if (triggerBtn) {
      triggerBtn.classList.toggle('is-audio-active', status === 'playing');
      triggerBtn.classList.toggle('is-audio-paused', status === 'paused');
    }

    if (status === 'playing') {
      if (statusEl) statusEl.textContent = `Playing · ${trackLabel}`;
      if (oscEl) oscEl.textContent = `Playing · ${trackLabel}`;
      if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.innerHTML = '<span>⏸</span> Pause';
      }
      if (tab2PauseBtn) {
        tab2PauseBtn.style.display = 'inline-flex';
        tab2PauseBtn.disabled = false;
        tab2PauseBtn.innerHTML = '<span>⏸ Pause</span>';
      }
      if (stopBtn) stopBtn.disabled = false;
    } else if (status === 'paused') {
      if (statusEl) statusEl.textContent = `Paused · ${trackLabel}`;
      if (oscEl) oscEl.textContent = `Paused · ${trackLabel}`;
      if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.innerHTML = '<span>▶</span> Resume';
      }
      if (tab2PauseBtn) {
        tab2PauseBtn.style.display = 'inline-flex';
        tab2PauseBtn.disabled = false;
        tab2PauseBtn.innerHTML = '<span>▶ Resume</span>';
      }
      if (stopBtn) stopBtn.disabled = !hasAudio;
    } else {
      if (statusEl) statusEl.textContent = 'No wildlife audio active';
      if (pauseBtn) {
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<span>⏸</span> Pause';
      }
      if (tab2PauseBtn) {
        tab2PauseBtn.style.display = 'none';
        tab2PauseBtn.disabled = true;
        tab2PauseBtn.innerHTML = '<span>⏸ Pause</span>';
      }
      if (stopBtn) stopBtn.disabled = true;
      document.querySelectorAll('.sound-card, .species-card').forEach(c => c.classList.remove('playing-audio'));
      if (oscEl && (oscEl.textContent.startsWith('Playing') || oscEl.textContent.startsWith('Paused'))) {
        oscEl.textContent = 'Idle';
      }
      if (decoderStatusEl && decoderStatusEl.classList.contains('active-streaming')) {
        decoderStatusEl.textContent = 'Stream Idle';
        decoderStatusEl.classList.remove('active-streaming');
      }
      this.revokeActivePlaybackBlobUrl();
    }
  }

  revokeActivePlaybackBlobUrl() {
    if (this.activeAudioBlobUrl) {
      try {
        URL.revokeObjectURL(this.activeAudioBlobUrl);
      } catch (e) {}
      this.activeAudioBlobUrl = '';
    }
  }

  setupThemeSwitcher() {
    const dock = document.getElementById('floating-menu-dock');
    const trigger = document.getElementById('hamburger-trigger');
    const drawer = document.getElementById('hamburger-drawer');
    const paletteBtns = document.querySelectorAll('#theme-palette-grid .theme-option-btn');
    const modeDarkBtn = document.getElementById('btn-mode-dark');
    const modeLightBtn = document.getElementById('btn-mode-light');
    const surfaceMatteBtn = document.getElementById('btn-surface-matte');
    const surfaceGlossyBtn = document.getElementById('btn-surface-glossy');
    const drawerViewBtns = document.querySelectorAll('.drawer-view-btn');

    // Migrate legacy 'dark'/'light' theme names cleanly into separate mode + accent palette
    let savedTheme = localStorage.getItem('terrafauna_theme') || 'emerald';
    let savedMode = localStorage.getItem('terrafauna_mode');
    const savedSurface = localStorage.getItem('terrafauna_surface') || 'matte';
    if (savedTheme === 'light') {
      savedMode = 'light';
      savedTheme = 'emerald';
    } else if (savedTheme === 'dark') {
      savedMode = 'dark';
      savedTheme = 'slate';
    }
    if (!savedMode) savedMode = 'dark';

    this.applyAppearance(savedTheme, savedMode, savedSurface);

    if (trigger && drawer) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !drawer.classList.contains('open');
        this.setDrawerOpen(isOpen);
      });

      document.addEventListener('click', (e) => {
        if (dock && !dock.contains(e.target)) {
          this.setDrawerOpen(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.setDrawerOpen(false);
        }
      });
    }

    drawerViewBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setDrawerView(btn.getAttribute('data-drawer-view') || 'controls');
      });
    });

    paletteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        const currentMode = document.documentElement.getAttribute('data-mode') || 'dark';
        const currentSurface = document.documentElement.getAttribute('data-surface') || 'matte';
        this.applyAppearance(theme, currentMode, currentSurface);
      });
    });

    if (modeDarkBtn) {
      modeDarkBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        const currentSurface = document.documentElement.getAttribute('data-surface') || 'matte';
        this.applyAppearance(currentTheme, 'dark', currentSurface);
      });
    }

    if (modeLightBtn) {
      modeLightBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        const currentSurface = document.documentElement.getAttribute('data-surface') || 'matte';
        this.applyAppearance(currentTheme, 'light', currentSurface);
      });
    }

    if (surfaceMatteBtn) {
      surfaceMatteBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        const currentMode = document.documentElement.getAttribute('data-mode') || 'dark';
        this.applyAppearance(currentTheme, currentMode, 'matte');
      });
    }

    if (surfaceGlossyBtn) {
      surfaceGlossyBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        const currentMode = document.documentElement.getAttribute('data-mode') || 'dark';
        this.applyAppearance(currentTheme, currentMode, 'glossy');
      });
    }
  }

  applyAppearance(themeName, modeName = 'dark', surfaceName = 'matte') {
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.setAttribute('data-mode', modeName);
    document.documentElement.setAttribute('data-surface', surfaceName);
    localStorage.setItem('terrafauna_theme', themeName);
    localStorage.setItem('terrafauna_mode', modeName);
    localStorage.setItem('terrafauna_surface', surfaceName);

    document.querySelectorAll('#theme-palette-grid .theme-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });

    const modeDarkBtn = document.getElementById('btn-mode-dark');
    const modeLightBtn = document.getElementById('btn-mode-light');
    if (modeDarkBtn) modeDarkBtn.classList.toggle('active', modeName === 'dark');
    if (modeLightBtn) modeLightBtn.classList.toggle('active', modeName === 'light');

    const surfaceMatteBtn = document.getElementById('btn-surface-matte');
    const surfaceGlossyBtn = document.getElementById('btn-surface-glossy');
    if (surfaceMatteBtn) surfaceMatteBtn.classList.toggle('active', surfaceName === 'matte');
    if (surfaceGlossyBtn) surfaceGlossyBtn.classList.toggle('active', surfaceName === 'glossy');

    motionEffects.onThemeChanged();
  }

  /* -------------------------------------------------------------
     TAB NAVIGATION
  ------------------------------------------------------------- */
  switchToTab(targetTab, { closeDrawer = true } = {}) {
    const tabButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === targetTab));
    tabPanes.forEach(p => p.classList.toggle('active', p.id === targetTab));

    if (closeDrawer) {
      this.setDrawerOpen(false);
    }

    motionEffects.attachCardEffects();
    motionEffects.setupScrollObserver();
    motionEffects.onTabChanged(targetTab);
    motionEffects.mascotReact('tab_switch');

    if (targetTab === 'tab-bioacoustics') {
      this.initBioacousticsVisualizer();
    } else {
      bioacoustics.syncVisualizerLoop();
    }
  }

  setupTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchToTab(targetTab, { closeDrawer: true });
      });
    });
  }

  /* -------------------------------------------------------------
     TAB 1: GLOBAL FAUNA EXPLORER (DATABASE IN HAMBURGER DRAWER)
  ------------------------------------------------------------- */
  updateDatabaseStats() {
    const catalog = this.getCombinedCatalog();
    const globalTotal = VERIFIED_SPECIES_CATALOG.length;
    const customTotal = this.customSpeciesList.length;
    const total = catalog.length;
    const withAudio = catalog.filter(sp => !!sp.bioacoustics?.originalAudioUrl).length;

    const allBtn = document.getElementById('filter-btn-all');
    if (allBtn) allBtn.textContent = `All (${total})`;

    const customFilterBtn = document.getElementById('filter-btn-custom');
    if (customFilterBtn) {
      customFilterBtn.style.display = customTotal > 0 ? '' : 'none';
      customFilterBtn.textContent = `My Device (${customTotal})`;
    }

    const dbBadge = document.getElementById('drawer-db-count-badge');
    if (dbBadge) dbBadge.textContent = String(total);

    const specEl = document.getElementById('hud-specimen-count');
    if (specEl) specEl.textContent = `${total} Specimens`;

    const specLabelEl = document.getElementById('hud-specimen-label');
    if (specLabelEl) {
      specLabelEl.textContent = customTotal > 0
        ? `${globalTotal} global + ${customTotal} on this device`
        : 'Verified Cataloged Taxa';
    }

    const diaEl = document.getElementById('hud-dialect-count');
    if (diaEl) diaEl.textContent = `${withAudio} Recordings`;

    const counts = { CR: 0, EN: 0, VU: 0, NT: 0, LC: 0, DD: 0 };
    const biomeSet = new Set();
    catalog.forEach(sp => {
      const code = (sp.iucnStatus || 'LC').toUpperCase();
      if (Object.prototype.hasOwnProperty.call(counts, code)) counts[code] += 1;
      const b = sp.tropicalHabitat?.biomes?.[0];
      if (b) biomeSet.add(b.split('&')[0].trim());
    });

    const biomeEl = document.getElementById('hud-biome-count');
    if (biomeEl) biomeEl.textContent = `${Math.max(6, biomeSet.size)} Habitats`;

    const barEl = document.getElementById('hud-iucn-bar');
    if (barEl && total > 0) {
      barEl.title = `Conservation Distribution: CR (${counts.CR}), EN (${counts.EN}), VU (${counts.VU}), NT (${counts.NT}), LC (${counts.LC}), DD (${counts.DD})`;
      barEl.innerHTML = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD'].map(code => {
        const pct = ((counts[code] / total) * 100).toFixed(1);
        return `<span class="meter-segment status-${code}" style="width: ${pct}%;"></span>`;
      }).join('');
    }

    const lblEl = document.getElementById('hud-iucn-labels');
    if (lblEl) {
      lblEl.innerHTML = `<span>CR: ${counts.CR}</span> • <span>EN: ${counts.EN}</span> • <span>VU: ${counts.VU}</span> • <span>NT: ${counts.NT}</span> • <span>LC: ${counts.LC}</span> • <span>DD: ${counts.DD}</span>`;
    }
  }

  renderDrawerDatabaseResults(speciesList) {
    const listEl = document.getElementById('drawer-db-results-list');
    const lblEl = document.getElementById('drawer-db-results-label');
    if (!listEl) return;

    const fullTotal = this.getCombinedCatalog().length;
    if (lblEl) {
      const isFiltered = speciesList.length !== fullTotal;
      lblEl.textContent = isFiltered
        ? `Matching Taxa (${speciesList.length})`
        : `Species Archive (${speciesList.length})`;
    }

    if (speciesList.length === 0) {
      listEl.innerHTML = `<div style="padding: 0.75rem; text-align: center; font-size: 0.76rem; color: var(--text-dim);">No matching taxa in current filter.</div>`;
      return;
    }

    listEl.innerHTML = speciesList.map((sp) => {
      const iucn = IUCN_STATUS_MAP[(sp.iucnStatus || 'LC').toUpperCase()] || IUCN_STATUS_MAP.LC;
      const hasAudio = Boolean(sp.bioacoustics?.originalAudioUrl);
      const spKey = sp.id || sp.scientificName;
      const safeImg = sanitizeImageSource(sp.wikipediaImage || '');
      const fallbackIcon = getFallbackEmojiForCategory(sp);
      const safeCommon = escapeHtml(sp.commonName);
      const safeSci = escapeHtml(sp.scientificName);
      return `
        <button type="button" class="drawer-db-row" data-species-id="${escapeHtml(spKey)}">
          ${safeImg ? `<img src="${escapeHtml(safeImg)}" alt="${safeCommon}" class="drawer-db-thumb" loading="lazy" onerror="this.style.display='none'">` : `<span class="drawer-db-thumb" aria-hidden="true">${fallbackIcon}</span>`}
          <div class="drawer-db-row-info">
            <div class="drawer-db-row-name">${safeCommon}</div>
            <div class="drawer-db-row-sci">${safeSci}</div>
          </div>
          <div class="drawer-db-row-badges">
            ${sp.isCustomLocal ? `<span class="drawer-db-local-pill" title="Saved in your browser storage only">Local</span>` : ''}
            ${hasAudio ? `<span class="drawer-db-audio-dot" title="Wildlife audio recording">🎙️</span>` : ''}
            <span class="drawer-db-iucn ${iucn.class}">${iucn.code}</span>
          </div>
        </button>
      `;
    }).join('');

    listEl.querySelectorAll('.drawer-db-row').forEach((row) => {
      row.addEventListener('click', () => {
        const spId = row.getAttribute('data-species-id');
        this.setDrawerOpen(false);
        this.openSpeciesModal(spId);
      });
    });
  }

  setupFaunaExplorer() {
    this.updateDatabaseStats();
    this.renderFaunaGrid(this.currentSpeciesList);

    const searchInput = document.getElementById('fauna-search-input');
    const searchBtn = document.getElementById('fauna-search-btn');

    const ensureFaunaTabVisibleInBg = () => {
      const faunaPane = document.getElementById('tab-fauna');
      if (faunaPane && !faunaPane.classList.contains('active')) {
        this.switchToTab('tab-fauna', { closeDrawer: false });
      }
    };

    const handleSearch = async () => {
      const query = searchInput.value.trim();
      ensureFaunaTabVisibleInBg();

      if (!query) {
        this.currentSpeciesList = this.getCombinedCatalog();
        this.applyFaunaFilter();
        return;
      }

      searchBtn.innerHTML = `<span>...</span>`;
      searchBtn.disabled = true;
      motionEffects.mascotReact('searching', query);

      try {
        const qLower = query.toLowerCase();
        // Check for rich matches across local browser cache + curated catalog
        const localMatches = this.getCombinedCatalog().filter(s =>
          s.commonName.toLowerCase().includes(qLower) ||
          s.scientificName.toLowerCase().includes(qLower) ||
          (s.wikipediaSummary && s.wikipediaSummary.toLowerCase().includes(qLower)) ||
          (s.tropicalHabitat?.nativeRegions && s.tropicalHabitat.nativeRegions.some(r => r.toLowerCase().includes(qLower))) ||
          (s.attachedLinks && s.attachedLinks.some(l =>
            l.label.toLowerCase().includes(qLower) || l.url.toLowerCase().includes(qLower)
          )) ||
          (s.biochemicalDrivers && s.biochemicalDrivers.some(b =>
            b.chemicalAgent.toLowerCase().includes(qLower) ||
            b.molecularClass.toLowerCase().includes(qLower) ||
            b.triggerContext.toLowerCase().includes(qLower) ||
            b.behavioralTransformation.toLowerCase().includes(qLower)
          )) ||
          (s.lifeStagesAndBehavior && s.lifeStagesAndBehavior.some(l =>
            l.phase.toLowerCase().includes(qLower) ||
            l.behavior.toLowerCase().includes(qLower) ||
            (l.keyActivities && l.keyActivities.some(a => a.toLowerCase().includes(qLower)))
          )) ||
          (s.huntingStrategy && (
            s.huntingStrategy.tacticalMethod.toLowerCase().includes(qLower) ||
            s.huntingStrategy.executionSteps.toLowerCase().includes(qLower) ||
            s.huntingStrategy.preySpecializationRationale.toLowerCase().includes(qLower) ||
            s.huntingStrategy.primaryPrey.some(p => p.toLowerCase().includes(qLower))
          )) ||
          (s.skeletalBiomechanics && (
            s.skeletalBiomechanics.overallArchitecture.toLowerCase().includes(qLower) ||
            s.skeletalBiomechanics.boneAdaptations.some(bone =>
              bone.boneName.toLowerCase().includes(qLower) ||
              bone.geometricDesign.toLowerCase().includes(qLower) ||
              bone.survivalUtility.toLowerCase().includes(qLower)
            )
          ))
        );

        if (localMatches.length > 0) {
          this.currentSpeciesList = localMatches;
        } else {
          const results = await bioService.searchSpecies(query);
          this.currentSpeciesList = results.length > 0 ? results : [];
        }
        this.renderFaunaGrid(this.currentSpeciesList);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        searchBtn.innerHTML = `<span>Search</span>`;
        searchBtn.disabled = false;
      }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    // Filter tags
    const filterTags = document.querySelectorAll('#fauna-filter-tags .tag-btn');
    filterTags.forEach(btn => {
      btn.addEventListener('click', () => {
        ensureFaunaTabVisibleInBg();
        filterTags.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-filter');
        this.applyFaunaFilter();
      });
    });

    // IUCN Legend Filter items
    const iucnLegendItems = document.querySelectorAll('#iucn-legend-filter [data-iucn]');
    iucnLegendItems.forEach(item => {
      item.addEventListener('click', () => {
        ensureFaunaTabVisibleInBg();
        const status = item.getAttribute('data-iucn');
        if (item.classList.contains('active')) {
          item.classList.remove('active');
          this.activeIucnFilter = null;
        } else {
          iucnLegendItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          this.activeIucnFilter = status;
        }
        this.applyFaunaFilter();
      });
    });

    // Reset Database Filters inside Drawer
    const resetBtn = document.getElementById('drawer-btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.activeFilter = 'all';
        this.activeIucnFilter = null;
        this.currentSpeciesList = this.getCombinedCatalog();
        filterTags.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
        iucnLegendItems.forEach(i => i.classList.remove('active'));
        ensureFaunaTabVisibleInBg();
        this.applyFaunaFilter();
      });
    }

    // View filtered tree directly from Drawer
    const viewTreeBtn = document.getElementById('drawer-btn-view-tree');
    if (viewTreeBtn) {
      viewTreeBtn.addEventListener('click', () => {
        this.switchToTab('tab-fauna', { closeDrawer: true });
        document.getElementById('fauna-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Toggle IUCN quick guide reference drawer
    const toggleGuideBtn = document.getElementById('toggle-iucn-guide');
    const guideDrawer = document.getElementById('iucn-guide-drawer');
    if (toggleGuideBtn && guideDrawer) {
      toggleGuideBtn.addEventListener('click', () => {
        const isOpen = guideDrawer.style.display !== 'none';
        guideDrawer.style.display = isOpen ? 'none' : 'block';
        toggleGuideBtn.classList.toggle('active', !isOpen);
      });
    }
  }

  applyFaunaFilter() {
    let filtered = [...this.currentSpeciesList];

    // 1. Taxon & Habitat filter
    if (this.activeFilter && this.activeFilter !== 'all') {
      const target = this.activeFilter.toLowerCase();
      filtered = filtered.filter(s => {
        const cls = (s.taxonomy.class || "").toLowerCase();
        const ord = (s.taxonomy.order || "").toLowerCase();
        const sub = (s.taxonomy.suborder || "").toLowerCase();
        const fam = (s.taxonomy.family || "").toLowerCase();
        const phylum = (s.taxonomy.phylum || "").toLowerCase();

        if (target === 'custom') {
          return Boolean(s.isCustomLocal);
        }
        if (target === 'domestic') {
          return Boolean(s.isDomestic);
        }
        if (target === 'cetacea') {
          return ord.includes('cetacea') || (s.taxonomy.infraorder && s.taxonomy.infraorder.toLowerCase().includes('cetacea')) || (s.taxonomy.parvorder && s.taxonomy.parvorder.toLowerCase().includes('cetacea'));
        }
        if (target === 'serpentes') {
          return sub.includes('serpentes') || fam.includes('pythonidae') || fam.includes('boidae') || fam.includes('viperidae') || fam.includes('elapidae');
        }
        if (target === 'marine') {
          const biomesText = (s.tropicalHabitat?.biomes || []).join(' ').toLowerCase();
          return s.customCategory === 'Marine' ||
            cls.includes('chondrichthyes') ||
            cls.includes('cephalopoda') ||
            cls.includes('actinopterygii') ||
            cls.includes('teleostei') ||
            ord.includes('cetacea') ||
            ord.includes('sirenia') ||
            ord.includes('testudines') ||
            fam.includes('phocidae') ||
            fam.includes('odobenidae') ||
            fam.includes('lutrinae') ||
            biomesText.includes('river') ||
            biomesText.includes('ocean') ||
            biomesText.includes('marine') ||
            biomesText.includes('kelp') ||
            biomesText.includes('estuar') ||
            s.id === 'enhydra-lutris' ||
            s.id === 'lontra-canadensis';
        }
        return cls.includes(target) || ord.includes(target) || sub.includes(target) || fam.includes(target) || phylum.includes(target);
      });
    }

    // 2. IUCN Status filter
    if (this.activeIucnFilter) {
      filtered = filtered.filter(s => (s.iucnStatus || "").toUpperCase() === this.activeIucnFilter.toUpperCase());
    }

    this.renderFaunaGrid(filtered);
  }

  renderFaunaGrid(speciesList) {
    const grid = document.getElementById('fauna-grid');
    if (!grid) return;

    if (speciesList.length === 0) {
      grid.innerHTML = `
        <div class="tree-empty-state" style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-card);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-title);">No biological records matched your search query.</p>
          <p style="font-size: 0.85rem;">Try searching Linnaean taxon names (e.g. <em>Panthera</em>, <em>Physeter</em>, <em>Loxodonta</em>) or common English names.</p>
        </div>
      `;
      motionEffects.refreshTreeLayout('fauna');
      return;
    }

    const rowsHtml = speciesList.map((sp, idx) => {
      const iucn = IUCN_STATUS_MAP[sp.iucnStatus] || { code: sp.iucnStatus || 'LC', name: sp.iucnStatus || 'Evaluated', desc: 'Evaluated under IUCN criteria', class: 'status-LC' };
      const statusClass = iucn.class;
      const imgUrl = sanitizeImageSource(sp.wikipediaImage || '') || '';
      const fallbackIcon = getFallbackEmojiForCategory(sp);
      const hasAudio = !!sp.bioacoustics?.originalAudioUrl;
      const linksCount = Array.isArray(sp.attachedLinks) ? sp.attachedLinks.length : 0;

      const trophic = escapeHtml(sp.dietAndTrophic?.trophicLevel || sp.dietAndTrophic?.dietCategory || 'Generalist Consumer');
      const biome = escapeHtml((sp.tropicalHabitat?.biomes && sp.tropicalHabitat.biomes[0]) || sp.tropicalHabitat?.nativeRegions?.[0] || 'Terrestrial / Marine');
      const region = escapeHtml((sp.tropicalHabitat?.nativeRegions && sp.tropicalHabitat.nativeRegions[0]) || 'Global Biosphere');
      const vocalFreq = escapeHtml(sp.bioacoustics?.frequencyRangeHz || (sp.bioacoustics?.fundamentalFrequencyHz ? sp.bioacoustics.fundamentalFrequencyHz + ' Hz' : 'Acoustic / Sensory'));
      const specIndex = String(idx + 1).padStart(2, '0');
      const sideClass = idx % 2 === 0 ? 'side-left' : 'side-right';
      const safeCommon = escapeHtml(sp.commonName);
      const safeSci = escapeHtml(sp.scientificName);
      const safeFam = sp.taxonomy.family ? escapeHtml(sp.taxonomy.family) : '';
      const safeCls = escapeHtml(sp.taxonomy.class || 'Vertebrata');
      const safeOrder = escapeHtml(sp.taxonomy.order || 'Taxa');
      const spKey = escapeHtml(sp.id || sp.scientificName);

      return `
        <div class="tree-node-row ${sideClass}" data-node-index="${idx}" data-node-name="${safeCommon}">
          <div class="tree-card-slot">
            <div class="tree-card-anchor">
              <div class="species-card bio-pod-card" data-species-id="${spKey}">
                <div class="card-glare-effect"></div>

                <!-- Pod Top Telemetry Bar -->
                <div class="pod-header">
                  <span class="pod-id-pill">#${specIndex} · ${safeOrder}</span>
                  ${sp.isCustomLocal
                    ? `<span class="pod-stages-pill is-local-pill" title="Saved locally in your browser storage only">💾 On Device</span>`
                    : (sp.lifeStagesAndBehavior ? `<span class="pod-stages-pill" title="Detailed Life Stages & Ethogram available">⏳ ${sp.lifeStagesAndBehavior.length} Stages</span>` : '')}
                  <span class="pod-iucn-circle ${statusClass}" title="IUCN Conservation Status: ${iucn.code} (${iucn.name})">
                    ${iucn.code}
                  </span>
                </div>

                <!-- Centered Circular Specimen Porthole -->
                <div class="pod-porthole-stage">
                  <div class="porthole-halo-ring"></div>
                  <div class="porthole-lens ${imgUrl ? '' : 'is-fallback-only'}">
                    ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" alt="${safeCommon}" class="porthole-img" loading="${idx < 6 ? 'eager' : 'lazy'}" decoding="async" onerror="this.style.display='none';this.parentElement.classList.add('is-fallback-only')">` : ''}
                    <span class="porthole-fallback-glyph" aria-hidden="true">${fallbackIcon}</span>
                    <div class="porthole-glass-reflection"></div>
                  </div>
                  ${hasAudio ? `
                    <button class="pod-audio-circle btn-play-species-audio" data-species-id="${spKey}" title="Play wildlife recording">
                      <span class="audio-sonic-waves">
                        <span class="wave-bar wb-1"></span>
                        <span class="wave-bar wb-2"></span>
                        <span class="wave-bar wb-3"></span>
                      </span>
                    </button>
                  ` : ''}
                </div>

                <!-- Specimen Identity -->
                <div class="pod-identity">
                  <h3 class="pod-common-name">${safeCommon}</h3>
                  <div class="pod-taxa-pill">
                    <span class="taxa-sci"><em>${safeSci}</em></span>
                    ${safeFam ? `<span class="taxa-sep">•</span><span class="taxa-fam">${safeFam}</span>` : ''}
                  </div>
                </div>

                <!-- Circular Bio-Telemetry Bubbles -->
                <div class="pod-bubbles-cluster">
                  <div class="pod-bubble" title="Trophic Guild">
                    <span class="bubble-icon">🥩</span>
                    <span class="bubble-txt">${trophic}</span>
                  </div>
                  <div class="pod-bubble" title="Native Biome Distribution">
                    <span class="bubble-icon">🌍</span>
                    <span class="bubble-txt">${biome}</span>
                  </div>
                  <div class="pod-bubble" title="Acoustic Fundamental">
                    <span class="bubble-icon">🎙️</span>
                    <span class="bubble-txt">${vocalFreq}</span>
                  </div>
                  <div class="pod-bubble" title="Linnaean Class">
                    <span class="bubble-icon">🧬</span>
                    <span class="bubble-txt">${safeCls}</span>
                  </div>
                  ${linksCount > 0 ? `
                    <div class="pod-bubble" title="Attached Reference Links">
                      <span class="bubble-icon">🔗</span>
                      <span class="bubble-txt">${linksCount} ${linksCount === 1 ? 'Link' : 'Links'}</span>
                    </div>
                  ` : ''}
                  ${sp.biochemicalDrivers && sp.biochemicalDrivers.length > 0 ? `
                    <div class="pod-bubble pod-bubble-chem" title="Chemical Reaction Trigger: ${escapeHtml(sp.biochemicalDrivers[0].chemicalAgent)}">
                      <span class="bubble-icon">${sp.biochemicalDrivers[0].icon || '🧪'}</span>
                      <span class="bubble-txt">${escapeHtml(sp.biochemicalDrivers[0].chemicalAgent.split(' ')[0])}</span>
                    </div>
                  ` : ''}
                  ${sp.skeletalBiomechanics && sp.skeletalBiomechanics.boneAdaptations ? `
                    <div class="pod-bubble pod-bubble-bone" title="Skeletal Adaptation: ${escapeHtml(sp.skeletalBiomechanics.boneAdaptations[0].boneName)}">
                      <span class="bubble-icon">🦴</span>
                      <span class="bubble-txt">${escapeHtml(sp.skeletalBiomechanics.boneAdaptations[0].boneName.split(' ')[0])}</span>
                    </div>
                  ` : ''}
                </div>

                <!-- Interactive Action Capsule -->
                <div class="pod-action-wrap">
                  <button class="pod-explore-btn" type="button">
                    <span class="explore-glow-dot"></span>
                    <span>Read Field Dossier</span>
                    <span class="explore-arrow">➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Center Trunk Joint Node -->
          <div class="tree-joint-node" aria-hidden="true">
            <span class="joint-pulse-ring"></span>
            <span class="joint-index">${specIndex}</span>
          </div>

          <!-- Opposite Side Airy Botanical Callout Whisper (Zero Grid Box) -->
          <div class="tree-branch-whisper">
            <div class="whisper-kicker">
              <span class="whisper-leaf-dot">🌿</span>
              <span>${sp.isCustomLocal ? `Local Entry ${specIndex}` : `Branch ${specIndex}`} · ${escapeHtml(sp.taxonomy.class || 'Animalia')}</span>
            </div>
            <div class="whisper-title">${safeCommon}</div>
            <div class="whisper-meta-list">
              <span class="whisper-meta-item">🌍 ${region}</span>
              <span class="whisper-meta-item">🎙️ ${vocalFreq}</span>
              <span class="whisper-meta-item">🛡️ ${iucn.name} (${iucn.code})</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    grid.innerHTML = `
      <div class="tree-nodes-stage">
        <div class="tree-svg-backdrop" aria-hidden="true"></div>
        <div class="tree-nodes-wrap">
          ${rowsHtml}
        </div>
      </div>

      <div class="tree-canopy-finale">
        <div class="finale-bloom-emblem" aria-hidden="true">🌿</div>
        <div class="finale-bloom-title">Canopy Crown Reached • ${speciesList.length} Taxa Illuminated</div>
        <div class="finale-bloom-sub">Use the top-right menu anytime to search, add your own local entries, or pause and stop wildlife audio.</div>
        <div class="finale-actions-row">
          <button type="button" class="finale-pill-btn" id="btn-scroll-top-canopy">↑ Back to Top</button>
          <button type="button" class="finale-pill-btn" id="btn-open-db-from-finale">🌐 Open Database &amp; Filters</button>
        </div>
      </div>
    `;

    const topBtn = grid.querySelector('#btn-scroll-top-canopy');
    if (topBtn) {
      topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    const openDbBtn = grid.querySelector('#btn-open-db-from-finale');
    if (openDbBtn) {
      openDbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDrawerDatabase();
      });
    }

    // Attach click listeners to cards
    grid.querySelectorAll('.species-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-play-species-audio')) {
          e.stopPropagation();
          const spId = e.target.closest('.btn-play-species-audio').getAttribute('data-species-id');
          this.playSpeciesAudioById(spId);
          return;
        }
        const spId = card.getAttribute('data-species-id');
        this.openSpeciesModal(spId);
      });
    });

    this.renderDrawerDatabaseResults(speciesList);

    // Re-bind faux 3D tilt and rebuild scroll-driven living tree
    motionEffects.attachCardEffects();
    motionEffects.refreshTreeLayout('fauna');
  }

  findElementsBySpeciesId(speciesId) {
    return Array.from(document.querySelectorAll('[data-species-id]'))
      .filter((el) => el.getAttribute('data-species-id') === speciesId);
  }

  async openSpeciesModal(speciesId) {
    let species = this.currentSpeciesList.find(s => (s.id === speciesId) || (s.scientificName === speciesId))
               || this.getCombinedCatalog().find(s => (s.id === speciesId) || (s.scientificName === speciesId));
    if (!species) return;

    // Fetch enriched details if it's from live GBIF
    if (species.isFromLiveGbif) {
      species = await bioService.getEnrichedSpeciesProfile(species);
    }

    const titleEl = document.getElementById('modal-species-title');
    const subEl = document.getElementById('modal-species-sub');
    const bodyEl = document.getElementById('modal-species-body');

    titleEl.textContent = species.commonName;
    subEl.textContent = `${species.scientificName} ${species.author || ''}`;

    const habitat = species.tropicalHabitat || {};
    const diet = species.dietAndTrophic || {};
    const anatomy = species.anatomyAndPhysiology || {};
    const acoustics = species.bioacoustics || {};
    const lifeStages = species.lifeStagesAndBehavior || [];
    const biochemDrivers = species.biochemicalDrivers || [];
    const validLinks = Array.isArray(species.attachedLinks)
      ? species.attachedLinks
          .map(link => {
            const safeUrl = sanitizeHttpUrl(link?.url || '');
            return safeUrl ? { label: link?.label || safeUrl, url: safeUrl } : null;
          })
          .filter(Boolean)
      : [];
    const safeImageUrl = sanitizeImageSource(species.wikipediaImage || '');
    const safeAudioUrl = sanitizeAudioSource(acoustics.originalAudioUrl || '');
    const iucnObj = IUCN_STATUS_MAP[species.iucnStatus] || { code: species.iucnStatus || 'LC', name: species.iucnStatus || 'Evaluated', desc: 'Assessed under IUCN Red List criteria.', class: 'status-LC' };
    const decoderProfile = species.isCustomLocal ? null : (DECODED_BIOACOUSTIC_DICTIONARY[species.id] || getUniversalDecodedBioacoustics(species));

    bodyEl.innerHTML = `
      <!-- Conservation Status Banner -->
      <div style="background: var(--bg-panel); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <span class="iucn-legend-pill ${iucnObj.class}" style="font-size: 0.95rem; padding: 0.3rem 0.75rem;">${iucnObj.code}</span>
          <div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-title);">IUCN Status: ${escapeHtml(iucnObj.name)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(iucnObj.desc)}</div>
          </div>
        </div>
        <span style="font-size: 0.92rem; color: var(--text-dim); font-family: var(--font-hand);">
          ${species.isCustomLocal ? 'Saved on This Device Only · Local Browser Cache' : 'Global IUCN Red List Evaluation'}
        </span>
      </div>

      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
        ${safeImageUrl ? `<img src="${escapeHtml(safeImageUrl)}" alt="${escapeHtml(species.commonName)}" style="width: 280px; height: 200px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-card);" onerror="this.style.display='none'">` : ''}
        <div style="flex: 1; min-width: 250px;">
          <h4 style="color: var(--emerald-400); font-family: var(--font-brush); font-size: 1.32rem; font-weight: 400; margin-bottom: 0.5rem;">Taxonomic Classification</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; font-size: 0.92rem; font-family: var(--font-journal);">
            <div><span style="color: var(--text-dim);">Kingdom:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.kingdom || 'Animalia')}</span></div>
            <div><span style="color: var(--text-dim);">Phylum:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.phylum || 'Chordata')}</span></div>
            <div><span style="color: var(--text-dim);">Class:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.class || 'Animalia')}</span></div>
            <div><span style="color: var(--text-dim);">Order:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.order || 'Custom')}</span></div>
            <div><span style="color: var(--text-dim);">Family:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.family || 'N/A')}</span></div>
            <div><span style="color: var(--text-dim);">Genus:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.genus || 'N/A')}</span></div>
          </div>
          <p style="margin-top: 1rem; font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; white-space: pre-line;">
            ${escapeHtml(species.wikipediaSummary || 'Scientific zoological summary loaded from GBIF index.')}
          </p>
          ${species.isCustomLocal ? `
            <div class="modal-local-actions">
              <button type="button" class="btn-secondary btn-modal-edit-local">✏️ Edit Entry</button>
              <button type="button" class="btn-secondary btn-modal-delete-local">🗑️ Remove from This Device</button>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="detail-grid">
        ${validLinks.length > 0 ? `
          <div class="detail-section full-width-section">
            <h4><span>🔗</span> Attached Links &amp; References (${validLinks.length})</h4>
            <div class="modal-attached-links-list">
              ${validLinks.map(link => `
                <a class="modal-attached-link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                  <div style="min-width: 0;">
                    <div class="modal-attached-link-label">${escapeHtml(link.label)}</div>
                    <div class="modal-attached-link-url">${escapeHtml(link.url)}</div>
                  </div>
                  <span aria-hidden="true">↗</span>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Section 1: Habitat & Tropical Range -->
        <div class="detail-section">
          <h4><span>🌴</span> Biome & Tropical Distribution</h4>
          <div class="detail-row">
            <strong>Native Regions:</strong>
            <span>${escapeHtml((habitat.nativeRegions || []).join(', ') || 'Global distribution')}</span>
          </div>
          <div class="detail-row">
            <strong>Biomes:</strong>
            <span>${escapeHtml((habitat.biomes || []).join(', ') || 'Tropical / Temperate ecosystems')}</span>
          </div>
          <div class="detail-row">
            <strong>Thermal Tolerance:</strong>
            <span>${escapeHtml(habitat.temperatureRange || '15°C - 35°C')}</span>
          </div>
          <div class="detail-row">
            <strong>Elevation:</strong>
            <span>${escapeHtml(habitat.elevation || '0 - 2,000m')}</span>
          </div>
        </div>

        <!-- Section 2: Trophic Level & Diet -->
        <div class="detail-section">
          <h4><span>🥩</span> Trophic Ecology & Digestion</h4>
          <div class="detail-row">
            <strong>Trophic Level:</strong>
            <span>${escapeHtml(diet.trophicLevel || 'Primary / Secondary Consumer')}</span>
          </div>
          <div class="detail-row">
            <strong>Dietary Guild:</strong>
            <span>${escapeHtml(diet.dietCategory || 'Generalist')}</span>
          </div>
          <div class="detail-row">
            <strong>Target Forage/Prey:</strong>
            <span>${escapeHtml((diet.preyTypes || []).join(', ') || 'Adapted prey organisms')}</span>
          </div>
          <div class="detail-row">
            <strong>Digestive Mechanism:</strong>
            <span>${escapeHtml(diet.digestiveAdaptation || 'Specialized digestive enzymatic pathways.')}</span>
          </div>
        </div>

        <!-- Section 3: Internal Anatomy & Physiology -->
        <div class="detail-section">
          <h4><span>🫀</span> Anatomy & Internal Physiology</h4>
          <div class="detail-row">
            <strong>Integument:</strong>
            <span>${escapeHtml(anatomy.integument || 'Epidermal covering')}</span>
          </div>
          <div class="detail-row">
            <strong>Respiration:</strong>
            <span>${escapeHtml(anatomy.respiration || 'Pulmonary gas exchange')}</span>
          </div>
          <div class="detail-row">
            <strong>Thermoregulation:</strong>
            <span>${escapeHtml(anatomy.thermoregulation || 'Homeostatic thermal regulation')}</span>
          </div>
          <div class="detail-row">
            <strong>Dentition:</strong>
            <span>${escapeHtml(anatomy.dentition || 'Oral food-intake anatomy')}</span>
          </div>
        </div>

        <!-- Section 4: Bioacoustics & Communication -->
        <div class="detail-section">
          <h4><span>🎙️</span> Bioacoustics & Communication</h4>
          <div class="detail-row">
            <strong>Signal Paradigm:</strong>
            <span>${escapeHtml(acoustics.communicationType || 'Acoustic vocalization')}</span>
          </div>
          <div class="detail-row">
            <strong>Dominant Frequency:</strong>
            <span style="color: var(--cyan-400); font-family: var(--font-mono);">${escapeHtml(acoustics.frequencyRangeHz || `${acoustics.fundamentalFrequencyHz || 440} Hz`)}</span>
          </div>
          <div class="detail-row">
            <strong>Ethological Role:</strong>
            <span>${escapeHtml(acoustics.acousticFunction || 'Conspecific coordination')}</span>
          </div>
          ${acoustics.syntaxProfile ? `
            <div class="detail-row">
              <strong>Syntax Pattern:</strong>
              <span style="font-size: 0.8rem;">${escapeHtml(acoustics.syntaxProfile.pattern)}</span>
            </div>
          ` : ''}
          ${safeAudioUrl || (!species.isCustomLocal && DECODED_BIOACOUSTIC_DICTIONARY[species.id]) ? `
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
              ${safeAudioUrl ? `
                <button class="btn-primary btn-modal-audition" style="flex: 1; min-width: 140px; justify-content: center;">
                  <span>🔊 Play Wildlife Audio</span>
                </button>
              ` : ''}
              ${decoderProfile ? `
                <button class="btn-secondary btn-modal-decode" style="flex: 1; min-width: 140px; justify-content: center;" title="Decode peer-reviewed ethological semantics">
                  <span>⚡</span> Decode Semantics
                </button>
              ` : ''}
            </div>
            ${decoderProfile ? `
              <div class="modal-decoded-preview" id="modal-decoded-preview" style="display: none; margin-top: 0.85rem; background: rgba(6, 182, 212, 0.08); border: 1.5px solid rgba(6, 182, 212, 0.35); border-radius: 20px; padding: 0.85rem 1rem;">
                <div style="font-size: 0.92rem; font-weight: 700; color: var(--cyan-400); font-family: var(--font-hand); letter-spacing: 0.01em; margin-bottom: 0.35rem;">
                  Peer-Reviewed Ethological Semantics (Confidence: ${decoderProfile.confidencePercent}%)
                </div>
                <div style="font-size: 1.06rem; font-weight: 400; color: var(--text-title); font-family: var(--font-ink); margin-bottom: 0.4rem; line-height: 1.5;">
                  ${decoderProfile.headlineTranslation}
                </div>
                <div style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 0.35rem;">
                  <strong>Ethological Context:</strong> ${decoderProfile.ethologicalContext}
                </div>
                <div style="font-size: 0.9rem; color: var(--text-dim); font-family: var(--font-hand); border-top: 1px dashed rgba(6, 182, 212, 0.25); padding-top: 0.35rem;">
                  <strong>Peer-Reviewed Research:</strong> ${decoderProfile.scientificCitation || 'Cornell Macaulay Library of Natural Sounds'}
                </div>
              </div>
            ` : ''}
          ` : ''}
        </div>

        ${lifeStages.length > 0 ? `
          <!-- Section 5: Chronological Life Stages & Behavioral Transitions -->
          <div class="detail-section full-width-section">
            <h4><span>⏳</span> Chronological Life Stages & Behavioral Transitions</h4>
            <p style="font-size: 0.8rem; color: var(--text-dim); margin: -0.2rem 0 0.85rem 0;">
              Ontogenetic milestones, critical seasonal transitions, and age-specific ethological adaptations across the organism's lifespan.
            </p>
            <div class="life-stages-timeline">
              ${lifeStages.map((stage, sIdx) => `
                <div class="life-stage-card">
                  <div class="stage-top-bar">
                    <span class="stage-phase-badge">Phase 0${sIdx + 1}: ${stage.phase}</span>
                    <span class="stage-timeframe-badge">⏳ ${stage.timeframe}</span>
                  </div>
                  <p class="stage-behavior-text">${stage.behavior}</p>
                  <div class="stage-chips-wrap">
                    ${(stage.keyActivities || []).map(act => `<span class="stage-activity-chip">● ${act}</span>`).join('')}
                  </div>
                  ${stage.environmentalResponse ? `
                    <div class="stage-env-note">
                      <strong>Ecosystem Context:</strong> ${stage.environmentalResponse}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${biochemDrivers.length > 0 ? `
          <!-- Section 6: Biochemical Reactions & Neuroendocrine Drivers -->
          <div class="detail-section full-width-section">
            <h4><span>🧪</span> Biochemical Reactions & Neuroendocrine Drivers</h4>
            <p style="font-size: 0.8rem; color: var(--text-dim); margin: -0.2rem 0 0.85rem 0;">
              Endogenous hormones, receptor cascades, and pheromones triggering specific behavioral transformations.
            </p>
            <div class="biochem-grid">
              ${biochemDrivers.map(bio => `
                <div class="biochem-card">
                  <div class="biochem-header">
                    <div class="biochem-icon-bubble">${bio.icon || '🧪'}</div>
                    <div class="biochem-title-wrap">
                      <div class="biochem-agent-name">${bio.chemicalAgent}</div>
                      <div class="biochem-molecular-class">${bio.molecularClass}</div>
                      <div class="biochem-meta-pills">
                        <span class="biochem-pill" title="Endocrine / Glandular Source">🏢 ${bio.sourceOrgan}</span>
                      </div>
                    </div>
                  </div>

                  <div class="biochem-trigger-box">
                    <strong>⚡ Trigger Context:</strong> ${bio.triggerContext}
                  </div>

                  <div class="biochem-cascade-box">
                    <div class="biochem-cascade-title"><span>🧬</span> Molecular Reaction &amp; Cascade Pathway</div>
                    <p style="margin: 0;">${bio.chemicalMechanism}</p>
                  </div>

                  <div class="biochem-behavior-box">
                    <div class="biochem-behavior-title"><span>➔</span> Behavioral Transformation</div>
                    <p style="margin: 0;">${bio.behavioralTransformation}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${species.huntingStrategy ? `
          <!-- Section 7: Predatory Tactics & Specialized Dietary Selection Niche -->
          <div class="detail-section full-width-section">
            <h4><span>🎯</span> Predatory Strategy & Dietary Specialization</h4>
            <p style="font-size: 0.88rem; color: var(--text-dim); margin: -0.2rem 0 0.85rem 0;">
              Biomechanical hunting mechanics, pursuit dynamics, and the physiological/metabolic rationale for specialized prey selection.
            </p>

            <div class="hunting-strategy-card">
              <div class="hunting-method-header">
                <span class="hunting-badge">⚔️ ${species.huntingStrategy.tacticalMethod}</span>
                <span class="trophic-guild-badge">🥩 ${species.huntingStrategy.trophicGuild}</span>
              </div>

              <div class="hunting-execution-box">
                <div class="hunting-subhead"><span>⚡</span> Tactical Hunting &amp; Foraging Mechanics</div>
                <p style="margin: 0; font-size: 0.9rem; line-height: 1.55;">${species.huntingStrategy.executionSteps}</p>
              </div>

              <div class="prey-selection-grid">
                <div class="prey-target-box">
                  <div class="hunting-subhead"><span>🎯</span> Primary Target Prey / Forage</div>
                  <div class="prey-chips-list">
                    ${species.huntingStrategy.primaryPrey.map(p => `<span class="prey-chip">● ${p}</span>`).join('')}
                  </div>
                </div>

                <div class="prey-rationale-box">
                  <div class="hunting-subhead"><span>🔬</span> Why Only These Prey (Specialization Rationale)</div>
                  <p style="margin: 0; font-size: 0.88rem; line-height: 1.55; color: var(--text-muted);">${species.huntingStrategy.preySpecializationRationale}</p>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${species.skeletalBiomechanics ? `
          <!-- Section 8: Functional Osteology & Skeletal Biomechanics -->
          <div class="detail-section full-width-section">
            <h4><span>🦴</span> Functional Osteology & Skeletal Biomechanics</h4>
            <p style="font-size: 0.8rem; color: var(--text-dim); margin: -0.2rem 0 0.85rem 0;">
              Evolutionary bone geometry and mechanical adaptations engineered for force generation, high-speed movement, or survival defense.
            </p>

            <div class="skeletal-architecture-banner">
              <strong>Skeletal Framework:</strong> ${species.skeletalBiomechanics.overallArchitecture}
            </div>

            <div class="bone-spec-grid">
              ${species.skeletalBiomechanics.boneAdaptations.map(bone => `
                <div class="bone-spec-card">
                  <div class="bone-header">
                    <span class="bone-icon">🦴</span>
                    <span class="bone-name">${bone.boneName}</span>
                  </div>
                  <div class="bone-geom-box">
                    <strong>📐 Geometric Architecture:</strong> ${bone.geometricDesign}
                  </div>
                  <div class="bone-utility-box">
                    <strong>🌟 Survival Utility & Advantage:</strong> ${bone.survivalUtility}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Hook local entry management actions if custom entry
    const editLocalBtn = bodyEl.querySelector('.btn-modal-edit-local');
    if (editLocalBtn && species.isCustomLocal) {
      editLocalBtn.addEventListener('click', () => {
        this.setModalOpen(document.getElementById('species-modal'), false);
        this.populateCustomFormForEdit(species.id);
        this.switchToTab('tab-custom', { closeDrawer: true });
      });
    }

    const deleteLocalBtn = bodyEl.querySelector('.btn-modal-delete-local');
    if (deleteLocalBtn && species.isCustomLocal) {
      deleteLocalBtn.addEventListener('click', () => {
        if (deleteLocalBtn.dataset.confirmDelete !== 'true') {
          deleteLocalBtn.dataset.confirmDelete = 'true';
          deleteLocalBtn.textContent = '⚠️ Click again to remove';
          deleteLocalBtn.style.borderColor = 'var(--rose-400)';
          deleteLocalBtn.style.color = 'var(--rose-400)';
          setTimeout(() => {
            if (deleteLocalBtn.isConnected) {
              deleteLocalBtn.dataset.confirmDelete = '';
              deleteLocalBtn.textContent = '🗑️ Remove from This Device';
              deleteLocalBtn.style.borderColor = '';
              deleteLocalBtn.style.color = '';
            }
          }, 3000);
          return;
        }
        this.deleteCustomSpeciesById(species.id);
        this.setModalOpen(document.getElementById('species-modal'), false);
      });
    }

    // Hook modal play button
    const modalAuditionBtn = bodyEl.querySelector('.btn-modal-audition');
    if (modalAuditionBtn && safeAudioUrl) {
      modalAuditionBtn.addEventListener('click', () => {
        this.playSpeciesAudioById(species.id || species.scientificName);
      });
    }

    // Hook modal decode button
    const modalDecodeBtn = bodyEl.querySelector('.btn-modal-decode');
    const modalDecodedPreview = bodyEl.querySelector('#modal-decoded-preview');
    if (modalDecodeBtn && modalDecodedPreview && decoderProfile) {
      modalDecodeBtn.addEventListener('click', () => {
        const isShown = modalDecodedPreview.style.display !== 'none';
        modalDecodedPreview.style.display = isShown ? 'none' : 'block';
        if (!isShown) {
          modalDecodeBtn.innerHTML = `<span>⚡</span> Hide Semantic Analysis`;
          this.playSpeciesAudioById(species.id);
          motionEffects.mascotReact('speaking', species.commonName);
        } else {
          modalDecodeBtn.innerHTML = `<span>⚡</span> Decode Semantics`;
        }
      });
    }

    this.setModalOpen(document.getElementById('species-modal'), true);
  }

  async playSpeciesAudioById(speciesId) {
    const sp = this.getCombinedCatalog().find(s => (s.id === speciesId) || (s.scientificName === speciesId));
    if (sp && sp.bioacoustics) {
      const rawAudioSource = sanitizeAudioSource(sp.bioacoustics.originalAudioUrl || '');

      // Add playing visual animation to corresponding cards
      document.querySelectorAll('.sound-card, .species-card').forEach(c => c.classList.remove('playing-audio'));
      const activeCards = this.findElementsBySpeciesId(speciesId);
      activeCards.forEach(c => c.classList.add('playing-audio'));

      // Update real-time bioacoustic decoder console
      this.updateBioacousticsDecoderConsole(sp);

      motionEffects.mascotReact('listening', sp.commonName);

      if (!rawAudioSource) {
        document.getElementById('osc-status').textContent = `No recording available (${sp.commonName})`;
        setTimeout(() => {
          activeCards.forEach(c => c.classList.remove('playing-audio'));
        }, 1200);
        return;
      }

      // Reserve user activation on audio context synchronously before async IndexedDB read
      this.initBioacousticsVisualizer();
      const requestSeq = ++this._audioRequestSeq;

      const resolved = await resolvePlayableAudioSource(rawAudioSource);
      if (requestSeq !== this._audioRequestSeq) {
        if (resolved.isBlob && resolved.url) {
          try { URL.revokeObjectURL(resolved.url); } catch (e) {}
        }
        return;
      }

      const resetPlaybackUi = (statusLabel) => {
        document.getElementById('osc-status').textContent = statusLabel;
        activeCards.forEach(c => c.classList.remove('playing-audio'));
        const statusEl = document.getElementById('decoder-stream-status');
        if (statusEl) {
          statusEl.textContent = statusLabel === 'Idle' ? 'Stream Idle' : statusLabel;
          statusEl.classList.remove('active-streaming');
        }
        this.revokeActivePlaybackBlobUrl();
      };

      if (!resolved.url) {
        resetPlaybackUi('Audio Unavailable');
        return;
      }

      bioacoustics.stopAudio();
      this.revokeActivePlaybackBlobUrl();
      if (resolved.isBlob) {
        this.activeAudioBlobUrl = resolved.url;
      }

      bioacoustics.playAnimalAudio(
        resolved.url,
        { id: sp.id, commonName: sp.commonName },
        () => resetPlaybackUi('Idle'),
        () => resetPlaybackUi('Audio Unavailable')
      );
    }
  }

  updateBioacousticsDecoderConsole(sp) {
    if (!sp || !sp.bioacoustics) return;
    this.activeDecodedSpecies = sp;
    const bio = sp.bioacoustics;
    const decProfile = DECODED_BIOACOUSTIC_DICTIONARY[sp.id] || getUniversalDecodedBioacoustics(sp);

    const subjectEl = document.getElementById('dec-subject');
    const syntaxEl = document.getElementById('dec-syntax');
    const entropyEl = document.getElementById('dec-entropy');
    const spectrumEl = document.getElementById('dec-spectrum');
    const meaningEl = document.getElementById('dec-meaning');
    const statusEl = document.getElementById('decoder-stream-status');
    const confidenceEl = document.getElementById('dec-confidence');
    const translationTextEl = document.getElementById('dec-translation-text');
    const channelInfoEl = document.getElementById('dec-channel-info');
    const citationEl = document.getElementById('dec-citation');
    const timelineEl = document.getElementById('dec-phoneme-timeline');

    if (subjectEl) subjectEl.innerHTML = `<strong>${escapeHtml(sp.commonName)}</strong> <span style="font-size: 0.96rem; font-family: var(--font-ink); opacity: 0.85;">(${escapeHtml(sp.scientificName)})</span>`;
    if (syntaxEl) syntaxEl.textContent = decProfile.syntaxStructure || bio.communicationType || 'Acoustic Signal';
    if (entropyEl) entropyEl.textContent = `H = ${decProfile.entropyScore ?? (bio.syntaxProfile ? bio.syntaxProfile.entropyScore : '0.64')}`;
    if (spectrumEl) spectrumEl.textContent = `${bio.frequencyRangeHz || (bio.fundamentalFrequencyHz + ' Hz')} • ${bio.amplitudeSpl || 'Conspecific radius'}`;
    if (confidenceEl) confidenceEl.textContent = `Confidence: ${decProfile.confidencePercent || 96.5}%`;
    if (translationTextEl) translationTextEl.textContent = decProfile.headlineTranslation || `“${bio.syntaxProfile?.meaning || bio.acousticFunction}”`;
    if (meaningEl) meaningEl.textContent = decProfile.ethologicalContext || (bio.syntaxProfile ? `${bio.syntaxProfile.pattern} — ${bio.syntaxProfile.meaning}` : bio.acousticFunction);
    if (channelInfoEl) channelInfoEl.innerHTML = `<strong>Channel:</strong> ${decProfile.transmissionChannel || 'Acoustic Medium'} &bull; <strong>Audience:</strong> ${decProfile.audience || 'Conspecifics'}`;
    if (citationEl) {
      citationEl.innerHTML = `<strong>Peer-Reviewed Source:</strong> ${decProfile.scientificCitation || 'Cornell Macaulay Library / Published Zoological Ethology'}`;
    }

    if (statusEl) {
      if (bio.originalAudioUrl) {
        statusEl.textContent = 'Streaming & Decoding';
        statusEl.classList.add('active-streaming');
      } else {
        statusEl.textContent = 'Non-Vocal Empirical Record';
        statusEl.classList.remove('active-streaming');
      }
    }

    // Render extracted phonetic syllables & motifs
    if (timelineEl) {
      const phonemes = decProfile.phonemes || [];
      if (phonemes.length === 0) {
        timelineEl.innerHTML = `<div style="color: var(--text-dim); font-size: 0.8rem; font-style: italic; padding: 0.5rem 0;">Awaiting acoustic pulse decomposition...</div>`;
      } else {
        timelineEl.innerHTML = phonemes.map((ph, idx) => `
          <div class="phoneme-token-card" data-phoneme-index="${idx}" title="Click to audition motif: ${ph.semanticMeaning}">
            <div class="phoneme-token-header">
              <span class="phoneme-tag-type">${ph.type || 'Syllable'}</span>
              <span class="phoneme-tag-time">⏱ ${ph.timeRange}</span>
            </div>
            <div class="phoneme-token-name">${ph.name}</div>
            <div class="phoneme-token-freq">🎵 ${ph.freq}</div>
            <div class="phoneme-token-meaning">“${ph.semanticMeaning}”</div>
          </div>
        `).join('');

        // Attach click handlers to audition isolated phoneme motif
        timelineEl.querySelectorAll('.phoneme-token-card').forEach(tokenCard => {
          tokenCard.addEventListener('click', () => {
            timelineEl.querySelectorAll('.phoneme-token-card').forEach(tc => tc.classList.remove('active-phoneme'));
            tokenCard.classList.add('active-phoneme');
            const pIdx = Number(tokenCard.getAttribute('data-phoneme-index'));
            const ph = phonemes[pIdx];
            if (ph) {
              document.getElementById('osc-status').textContent = `Motif · ${ph.name} (${ph.freq})`;
              motionEffects.mascotReact('click', ph.name);
            }
          });
        });
      }
    }

    // Animate 4-stage pipeline sequentially
    this.animateDecodingPipeline();
  }

  animateDecodingPipeline() {
    const steps = [
      document.getElementById('pipe-step-1'),
      document.getElementById('pipe-step-2'),
      document.getElementById('pipe-step-3'),
      document.getElementById('pipe-step-4')
    ];
    if (!steps[0]) return;

    if (this.decodingAnimationTimer) {
      clearTimeout(this.decodingAnimationTimer);
    }

    steps.forEach(s => {
      if (s) {
        s.classList.remove('active', 'complete');
      }
    });

    // Step 1: Ingestion
    steps[0].classList.add('active');

    setTimeout(() => {
      if (steps[0]) { steps[0].classList.remove('active'); steps[0].classList.add('complete'); }
      if (steps[1]) steps[1].classList.add('active');
    }, 350);

    setTimeout(() => {
      if (steps[1]) { steps[1].classList.remove('active'); steps[1].classList.add('complete'); }
      if (steps[2]) steps[2].classList.add('active');
    }, 700);

    setTimeout(() => {
      if (steps[2]) { steps[2].classList.remove('active'); steps[2].classList.add('complete'); }
      if (steps[3]) steps[3].classList.add('active');
    }, 1050);

    this.decodingAnimationTimer = setTimeout(() => {
      if (steps[3]) { steps[3].classList.remove('active'); steps[3].classList.add('complete'); }
    }, 1450);
  }

  /* -------------------------------------------------------------
     TAB 2: BIOACOUSTICS & ANIMAL LANGUAGE LAB
  ------------------------------------------------------------- */
  setupBioacousticsLab() {
    this.renderSoundCatalog();

    // Visualizer initialization
    this.initBioacousticsVisualizer();

    // Stop audio button
    document.getElementById('btn-stop-audio').addEventListener('click', () => {
      bioacoustics.stopAudio();
      document.querySelectorAll('.sound-card, .species-card').forEach(c => c.classList.remove('playing-audio'));
      document.getElementById('osc-status').textContent = 'Stopped';
    });

    // Wire Decode Active Signal button
    const runDecoderBtn = document.getElementById('btn-run-decoder');
    if (runDecoderBtn) {
      runDecoderBtn.addEventListener('click', () => {
        const targetSpecies = this.activeDecodedSpecies || VERIFIED_SPECIES_CATALOG[0];
        this.playSpeciesAudioById(targetSpecies.id);
        const decoderConsole = document.getElementById('bioacoustic-decoder-console');
        if (decoderConsole) {
          decoderConsole.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          decoderConsole.classList.add('decoder-highlight-pulse');
          setTimeout(() => decoderConsole.classList.remove('decoder-highlight-pulse'), 1800);
        }
      });
    }

    // Parameter sliders for "Predict Unknown Animal Language"
    const freqSlider = document.getElementById('param-freq');
    const freqLabel = document.getElementById('lbl-param-freq');
    freqSlider.addEventListener('input', (e) => {
      freqLabel.textContent = `${e.target.value} Hz`;
    });

    const rateSlider = document.getElementById('param-rate');
    const rateLabel = document.getElementById('lbl-param-rate');
    rateSlider.addEventListener('input', (e) => {
      rateLabel.textContent = `${e.target.value} pulses/sec`;
    });

    // Compute prediction button
    const predictBtn = document.getElementById('btn-predict-language');
    predictBtn.addEventListener('click', () => {
      this.executeLanguagePrediction();
    });

    // Acoustic profile inference only; authentic wildlife playback uses verified field recordings.

    // Run initial prediction calculation
    this.executeLanguagePrediction();

    // Initialize decoder console with default species (Lion)
    this.updateBioacousticsDecoderConsole(VERIFIED_SPECIES_CATALOG[0]);
  }

  initBioacousticsVisualizer() {
    const canvasOsc = document.getElementById('canvas-oscilloscope');
    const canvasSpec = document.getElementById('canvas-spectrogram');
    if (canvasOsc && canvasSpec) {
      bioacoustics.initAudio();
      if (!bioacoustics.canvasOsc) {
        bioacoustics.startVisualizer(canvasOsc, canvasSpec);
      } else {
        bioacoustics.syncVisualizerLoop();
      }
    }
  }

  renderSoundCatalog() {
    const catalogEl = document.getElementById('sound-catalog');
    if (!catalogEl) return;

    const vocalSpecies = this.getCombinedCatalog().filter(
      sp => Boolean(sp.bioacoustics && sanitizeAudioSource(sp.bioacoustics.originalAudioUrl || ''))
    );

    const rowsHtml = vocalSpecies.map((sp, idx) => {
      const bio = sp.bioacoustics;
      const specIndex = String(idx + 1).padStart(2, '0');
      const sideClass = idx % 2 === 0 ? 'side-left' : 'side-right';
      const decProfile = sp.isCustomLocal ? null : (DECODED_BIOACOUSTIC_DICTIONARY[sp.id] || getUniversalDecodedBioacoustics(sp));
      const safeImg = sanitizeImageSource(sp.wikipediaImage || '') || '';
      const safeCommon = escapeHtml(sp.commonName);
      const safeCommType = escapeHtml(bio.communicationType || 'Wildlife Recording');
      const safeFreqRange = escapeHtml(bio.frequencyRangeHz || 'Custom Audio');
      const spKey = escapeHtml(sp.id || sp.scientificName);

      return `
        <div class="tree-node-row ${sideClass}" data-node-index="${idx}" data-node-name="${safeCommon}">
          <div class="tree-card-slot">
            <div class="tree-card-anchor">
              <div class="sound-card sound-pod-card" data-species-id="${spKey}">
                <div class="card-glare-effect"></div>
                <div class="sound-pod-header">
                  <div class="sound-porthole-circle">
                    ${safeImg ? `<img src="${escapeHtml(safeImg)}" alt="${safeCommon}" class="sound-porthole-img" loading="${idx < 6 ? 'eager' : 'lazy'}" decoding="async" onerror="this.style.display='none'">` : ''}
                  </div>
                  <div class="sound-pod-meta">
                    <h4 class="sound-card-title">${safeCommon}</h4>
                    <p class="sound-card-sub">${safeCommType}</p>
                    <span class="badge-live-circle is-real">
                      ${sp.isCustomLocal ? '● Saved on This Device' : '● Verified Field Recording'}
                    </span>
                  </div>
                </div>
                <div class="sound-stat-row">
                  <span>Acoustic Source:</span>
                  <span class="sound-stat-val">${sp.isCustomLocal ? 'Saved Local / User Audio' : escapeHtml(bio.recordingSource || 'Verified Wildlife Archive')}</span>
                </div>
                <div class="sound-stat-row">
                  <span>Frequency Spectrum:</span>
                  <span class="sound-stat-val">${safeFreqRange}</span>
                </div>
                <div class="sound-stat-row">
                  <span>Syntax Entropy:</span>
                  <span class="sound-stat-val">H = ${bio.syntaxProfile ? bio.syntaxProfile.entropyScore : 0.6}</span>
                </div>
                <div class="sound-card-actions" style="display: flex; gap: 0.5rem; margin-top: 0.85rem;">
                  <button class="btn-card-audio btn-play-dialect sound-play-pill" data-species-id="${spKey}" style="flex: 1.1;">
                    <span>🔊 Play Recording</span>
                  </button>
                  ${!sp.isCustomLocal ? `
                    <button class="btn-card-decode btn-decode-dialect sound-decode-pill" data-species-id="${spKey}" style="flex: 1;" title="Decode acoustic syntax & translate to peer-reviewed ethological semantics">
                      <span>⚡</span> Decode
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>

          <div class="tree-joint-node" aria-hidden="true">
            <span class="joint-pulse-ring"></span>
            <span class="joint-index">${specIndex}</span>
          </div>

          <div class="tree-branch-whisper">
            <div class="whisper-kicker">
              <span class="whisper-leaf-dot">🎙️</span>
              <span>Recording ${specIndex} · ${safeFreqRange}</span>
            </div>
            <div class="whisper-title">${safeCommon}</div>
            <p class="whisper-quote">${decProfile ? decProfile.headlineTranslation : escapeHtml(bio.acousticFunction || 'User-attached recording')}</p>
          </div>
        </div>
      `;
    }).join('');

    catalogEl.innerHTML = `
      <div class="tree-nodes-stage">
        <div class="tree-svg-backdrop" aria-hidden="true"></div>
        <div class="tree-nodes-wrap">
          ${rowsHtml}
        </div>
      </div>

      <div class="tree-canopy-finale">
        <div class="finale-bloom-emblem" aria-hidden="true">🌊</div>
        <div class="finale-bloom-title">Acoustic Canopy Complete • ${vocalSpecies.length} Recordings Ready</div>
        <div class="finale-bloom-sub">Tap any recording pod to stream wildlife audio or inspect its syntax.</div>
      </div>
    `;

    catalogEl.querySelectorAll('.btn-play-dialect').forEach(btn => {
      btn.addEventListener('click', () => {
        const spId = btn.getAttribute('data-species-id');
        this.playSpeciesAudioById(spId);
      });
    });

    catalogEl.querySelectorAll('.btn-decode-dialect').forEach(btn => {
      btn.addEventListener('click', () => {
        const spId = btn.getAttribute('data-species-id');
        this.playSpeciesAudioById(spId);
        const decoderConsole = document.getElementById('bioacoustic-decoder-console');
        if (decoderConsole) {
          decoderConsole.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          decoderConsole.classList.add('decoder-highlight-pulse');
          setTimeout(() => decoderConsole.classList.remove('decoder-highlight-pulse'), 1800);
        }
      });
    });

    motionEffects.attachCardEffects();
    motionEffects.refreshTreeLayout('acoustics');
  }

  executeLanguagePrediction() {
    const f0 = Number(document.getElementById('param-freq').value);
    const modulation = document.getElementById('param-modulation').value;
    const rate = Number(document.getElementById('param-rate').value);
    const medium = document.getElementById('param-medium').value;

    const prediction = bioacoustics.predictUnknownLanguage({
      fundamentalFreqHz: f0,
      modulationType: modulation,
      pulseRatePerSec: rate,
      bandwidthHz: f0 * 1.8,
      environmentMedium: medium
    });

    this.lastLanguagePrediction = prediction;

    // Update UI Elements
    document.getElementById('res-pred-mass').textContent = prediction.massCategory;
    document.getElementById('res-pred-entropy').textContent = `H = ${prediction.entropyScore}`;
    document.getElementById('res-pred-range').textContent = `${prediction.maxTransmissionKm} km`;
    document.getElementById('res-pred-f0').textContent = `${prediction.fundamentalFreqHz} Hz`;
    document.getElementById('res-pred-syntax').textContent = prediction.syntaxStructure;
    document.getElementById('res-pred-purpose').textContent = prediction.predictedFunction;
    document.getElementById('res-pred-physics').textContent = prediction.transmissionAcoustics;
  }

  /* -------------------------------------------------------------
     TAB 3: PERSONAL CUSTOM ANIMALS (LOCAL BROWSER STORAGE ONLY)
  ------------------------------------------------------------- */
  addCustomLinkRow(label = '', url = '') {
    const listEl = document.getElementById('custom-links-list');
    if (!listEl) return;

    const row = document.createElement('div');
    row.className = 'custom-link-row';

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'text-input custom-link-label';
    labelInput.placeholder = 'Link Label (e.g. Wikipedia, Video)';
    labelInput.maxLength = 60;
    labelInput.value = label;

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'text-input custom-link-url';
    urlInput.placeholder = 'https://...';
    urlInput.value = url;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'custom-remove-link-btn';
    removeBtn.title = 'Remove link';
    removeBtn.setAttribute('aria-label', 'Remove link');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      if (listEl.children.length > 1) {
        row.remove();
      } else {
        labelInput.value = '';
        urlInput.value = '';
      }
    });

    row.appendChild(labelInput);
    row.appendChild(urlInput);
    row.appendChild(removeBtn);
    listEl.appendChild(row);
    return row;
  }

  setCustomFormFeedback(message = '', isError = false) {
    const fb = document.getElementById('custom-form-feedback');
    if (!fb) return;
    fb.textContent = message;
    fb.classList.toggle('is-error', Boolean(isError));
  }

  updateCustomPhotoPreview(imageSrc = '', sourceLabel = '') {
    const bar = document.getElementById('custom-photo-preview-bar');
    const imgEl = document.getElementById('custom-image-preview');
    const lblEl = document.getElementById('custom-image-source-label');
    if (!bar || !imgEl || !lblEl) return;

    const safeSrc = sanitizeImageSource(imageSrc);
    if (!safeSrc) {
      bar.style.display = 'none';
      imgEl.removeAttribute('src');
      return;
    }

    imgEl.src = safeSrc;
    lblEl.textContent = sourceLabel || (safeSrc.startsWith('data:image/') ? 'Device photo ready (compressed)' : 'Image URL preview');
    bar.style.display = 'flex';
  }

  updateCustomAudioPreview(audioSrc = '', sourceLabel = '', isTempBlob = false) {
    const bar = document.getElementById('custom-audio-preview-bar');
    const player = document.getElementById('custom-audio-preview-player');
    const lblEl = document.getElementById('custom-audio-source-label');
    if (!bar || !player || !lblEl) return;

    if (this.pendingAudioPreviewUrl) {
      try { URL.revokeObjectURL(this.pendingAudioPreviewUrl); } catch (e) {}
      this.pendingAudioPreviewUrl = '';
    }

    try { player.pause(); } catch (e) {}

    const trimmed = String(audioSrc || '').trim();
    const isAllowed = Boolean(trimmed && (
      trimmed.startsWith('blob:') ||
      /^data:audio\//i.test(trimmed) ||
      sanitizeHttpUrl(trimmed)
    ));

    if (!isAllowed) {
      bar.style.display = 'none';
      player.removeAttribute('src');
      player.load();
      return;
    }

    if (isTempBlob || trimmed.startsWith('blob:')) {
      this.pendingAudioPreviewUrl = trimmed;
    }
    player.src = trimmed;
    lblEl.textContent = sourceLabel || 'Audio ready';
    bar.style.display = 'flex';
  }

  resetCustomForm({ preserveFeedback = false } = {}) {
    const form = document.getElementById('custom-animal-form');
    if (!form) return;
    form.reset();
    this.customUploadedImageData = '';
    this.pendingAudioFile = null;
    this.keptExistingAudioSource = '';
    this.keptExistingAudioName = '';
    const fileEl = document.getElementById('custom-image-file');
    if (fileEl) fileEl.value = '';
    const audioFileEl = document.getElementById('custom-audio-file');
    if (audioFileEl) audioFileEl.value = '';
    this.updateCustomPhotoPreview('');
    this.updateCustomAudioPreview('');
    document.getElementById('custom-edit-id').value = '';
    document.getElementById('custom-form-heading').textContent = 'Add New Animal';
    document.getElementById('btn-save-custom-animal').innerHTML = '<span>Save to This Device</span>';
    document.getElementById('custom-category').value = 'Animalia';
    document.getElementById('custom-iucn').value = 'LC';

    const linksList = document.getElementById('custom-links-list');
    if (linksList) {
      linksList.innerHTML = '';
      this.addCustomLinkRow();
    }
    if (!preserveFeedback) {
      this.setCustomFormFeedback('');
    }
  }

  populateCustomFormForEdit(speciesId) {
    const entry = this.customSpeciesList.find((item) => item.id === speciesId);
    if (!entry) return;

    document.getElementById('custom-edit-id').value = entry.id;
    document.getElementById('custom-form-heading').textContent = `Edit Local Animal: ${entry.commonName}`;
    document.getElementById('btn-save-custom-animal').innerHTML = '<span>Update on This Device</span>';

    document.getElementById('custom-common-name').value = entry.commonName || '';
    document.getElementById('custom-scientific-name').value =
      entry.scientificName && entry.scientificName !== 'Custom local entry' ? entry.scientificName : '';
    document.getElementById('custom-category').value = entry.customCategory || 'Animalia';
    document.getElementById('custom-iucn').value = entry.iucnStatus || 'LC';
    document.getElementById('custom-description').value = entry.wikipediaSummary || '';

    const rawHabitat = entry.tropicalHabitat?.nativeRegions?.[0] || '';
    document.getElementById('custom-habitat').value = rawHabitat === 'Saved Locally' ? '' : rawHabitat;

    const rawDiet = entry.dietAndTrophic?.trophicLevel || '';
    document.getElementById('custom-diet').value = rawDiet === 'User-recorded diet' ? '' : rawDiet;

    const savedImg = sanitizeImageSource(entry.wikipediaImage || '') || '';
    if (savedImg.startsWith('data:image/')) {
      this.customUploadedImageData = savedImg;
      document.getElementById('custom-image-url').value = '';
      this.updateCustomPhotoPreview(savedImg, 'Saved device photo');
    } else {
      this.customUploadedImageData = '';
      document.getElementById('custom-image-url').value = savedImg;
      this.updateCustomPhotoPreview(savedImg, savedImg ? 'Saved image URL' : '');
    }

    this.pendingAudioFile = null;
    const savedAudio = sanitizeAudioSource(entry.bioacoustics?.originalAudioUrl || '') || '';
    const savedAudioName = entry.bioacoustics?.audioFileName || 'Device audio';
    if (savedAudio.startsWith('idb-audio:') || savedAudio.startsWith('data:audio/')) {
      this.keptExistingAudioSource = savedAudio;
      this.keptExistingAudioName = savedAudioName;
      document.getElementById('custom-audio-url').value = '';
      if (savedAudio.startsWith('idb-audio:')) {
        resolvePlayableAudioSource(savedAudio).then((resolved) => {
          if (document.getElementById('custom-edit-id')?.value === entry.id && resolved.url) {
            this.updateCustomAudioPreview(resolved.url, `Saved audio: ${resolved.name || savedAudioName}`, resolved.isBlob);
          }
        });
      } else {
        this.updateCustomAudioPreview(savedAudio, `Saved audio: ${savedAudioName}`);
      }
    } else {
      this.keptExistingAudioSource = '';
      this.keptExistingAudioName = '';
      document.getElementById('custom-audio-url').value = savedAudio;
      this.updateCustomAudioPreview(savedAudio, savedAudio ? 'Saved audio URL' : '');
    }

    const rawAudioNotes = entry.bioacoustics?.communicationType || '';
    document.getElementById('custom-audio-notes').value =
      rawAudioNotes === 'Custom acoustic note' || rawAudioNotes.startsWith('Device Audio (') ? '' : rawAudioNotes;

    const linksList = document.getElementById('custom-links-list');
    if (linksList) {
      linksList.innerHTML = '';
      if (Array.isArray(entry.attachedLinks) && entry.attachedLinks.length > 0) {
        entry.attachedLinks.forEach((link) => this.addCustomLinkRow(link.label || '', link.url || ''));
      } else {
        this.addCustomLinkRow();
      }
    }

    this.setCustomFormFeedback(`Editing "${entry.commonName}" (saved locally in this browser).`);
    document.getElementById('custom-common-name')?.focus();
  }

  refreshCustomAndCatalogViews() {
    this.customSpeciesList = customSpeciesStore.loadAll();

    if (this.activeFilter === 'custom' && this.customSpeciesList.length === 0) {
      this.activeFilter = 'all';
      document.querySelectorAll('#fauna-filter-tags .tag-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
      });
    }

    this.currentSpeciesList = this.getCombinedCatalog();
    this.updateDatabaseStats();
    this.applyFaunaFilter();
    this.renderSoundCatalog();
    this.renderCustomSpeciesManager();
  }

  async deleteCustomSpeciesById(speciesId) {
    const editingId = document.getElementById('custom-edit-id')?.value || '';
    const res = await customSpeciesStore.deleteByIdAsync(speciesId);
    if (!res.ok) {
      this.setCustomFormFeedback(res.error || 'Could not remove entry.', true);
      return;
    }
    if (editingId === speciesId) {
      this.resetCustomForm({ preserveFeedback: true });
    }
    this.refreshCustomAndCatalogViews();
    this.setCustomFormFeedback('Entry removed from your local browser storage.');
  }

  setupCustomSpeciesManager() {
    const form = document.getElementById('custom-animal-form');
    if (!form) return;

    this.addCustomLinkRow();

    const uploadBtn = document.getElementById('btn-upload-custom-image');
    const fileInput = document.getElementById('custom-image-file');
    const imgUrlInput = document.getElementById('custom-image-url');
    const clearImgBtn = document.getElementById('btn-clear-custom-image');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        try {
          uploadBtn.disabled = true;
          const compressed = await compressImageFileToDataUrl(file);
          this.customUploadedImageData = compressed;
          if (imgUrlInput) imgUrlInput.value = '';
          const approxKb = Math.max(1, Math.round((compressed.length * 0.75) / 1024));
          this.updateCustomPhotoPreview(compressed, `Uploaded photo ready (~${approxKb} KB)`);
          this.setCustomFormFeedback('');
        } catch (err) {
          this.setCustomFormFeedback(err?.message || 'Could not process selected photo.', true);
        } finally {
          uploadBtn.disabled = false;
          fileInput.value = '';
        }
      });
    }

    if (imgUrlInput) {
      imgUrlInput.addEventListener('input', () => {
        const val = imgUrlInput.value.trim();
        this.customUploadedImageData = '';
        if (val && sanitizeHttpUrl(val)) {
          this.updateCustomPhotoPreview(val, 'Image URL preview');
        } else if (!val) {
          this.updateCustomPhotoPreview('');
        }
      });
    }

    if (clearImgBtn) {
      clearImgBtn.addEventListener('click', () => {
        this.customUploadedImageData = '';
        if (fileInput) fileInput.value = '';
        if (imgUrlInput) imgUrlInput.value = '';
        this.updateCustomPhotoPreview('');
      });
    }

    const uploadAudioBtn = document.getElementById('btn-upload-custom-audio');
    const audioFileInput = document.getElementById('custom-audio-file');
    const audioUrlInput = document.getElementById('custom-audio-url');
    const clearAudioBtn = document.getElementById('btn-clear-custom-audio');

    if (uploadAudioBtn && audioFileInput) {
      uploadAudioBtn.addEventListener('click', () => audioFileInput.click());
      audioFileInput.addEventListener('change', () => {
        const file = audioFileInput.files?.[0];
        if (!file) return;
        try {
          validateAudioFile(file);
          this.pendingAudioFile = file;
          this.keptExistingAudioSource = '';
          this.keptExistingAudioName = file.name || 'Device audio';
          if (audioUrlInput) audioUrlInput.value = '';
          const approxKb = Math.max(1, Math.round(file.size / 1024));
          const previewBlob = URL.createObjectURL(file);
          this.updateCustomAudioPreview(previewBlob, `Audio ready: ${file.name} (${approxKb} KB)`, true);
          this.setCustomFormFeedback('');
        } catch (err) {
          this.setCustomFormFeedback(err?.message || 'Could not attach selected audio file.', true);
        } finally {
          audioFileInput.value = '';
        }
      });
    }

    if (audioUrlInput) {
      audioUrlInput.addEventListener('input', () => {
        const val = audioUrlInput.value.trim();
        this.pendingAudioFile = null;
        this.keptExistingAudioSource = '';
        this.keptExistingAudioName = '';
        if (val && sanitizeHttpUrl(val)) {
          this.updateCustomAudioPreview(val, 'Audio URL ready');
        } else if (!val) {
          this.updateCustomAudioPreview('');
        }
      });
    }

    if (clearAudioBtn) {
      clearAudioBtn.addEventListener('click', () => {
        this.pendingAudioFile = null;
        this.keptExistingAudioSource = '';
        this.keptExistingAudioName = '';
        if (audioFileInput) audioFileInput.value = '';
        if (audioUrlInput) audioUrlInput.value = '';
        this.updateCustomAudioPreview('');
      });
    }

    const addLinkBtn = document.getElementById('btn-add-custom-link');
    if (addLinkBtn) {
      addLinkBtn.addEventListener('click', () => {
        const newRow = this.addCustomLinkRow();
        newRow?.querySelector('.custom-link-label')?.focus();
      });
    }

    const resetFormBtn = document.getElementById('btn-reset-custom-form');
    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        this.resetCustomForm();
      });
    }

    const viewTreeBtn = document.getElementById('btn-custom-view-tree');
    if (viewTreeBtn) {
      viewTreeBtn.addEventListener('click', () => {
        this.switchToTab('tab-fauna', { closeDrawer: true });
        document.getElementById('fauna-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const clearAllBtn = document.getElementById('btn-clear-all-custom');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', async () => {
        if (clearAllBtn.dataset.confirmClear !== 'true') {
          clearAllBtn.dataset.confirmClear = 'true';
          clearAllBtn.textContent = 'Click again to clear all';
          setTimeout(() => {
            if (clearAllBtn.isConnected) {
              clearAllBtn.dataset.confirmClear = '';
              clearAllBtn.textContent = 'Clear All';
            }
          }, 3000);
          return;
        }
        clearAllBtn.dataset.confirmClear = '';
        clearAllBtn.textContent = 'Clear All';
        const res = await customSpeciesStore.clearAllAsync();
        if (res.ok) {
          this.resetCustomForm({ preserveFeedback: true });
          this.refreshCustomAndCatalogViews();
          this.setCustomFormFeedback('Cleared all custom entries from this device.');
        } else {
          this.setCustomFormFeedback(res.error || 'Could not clear entries.', true);
        }
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const editId = document.getElementById('custom-edit-id').value.trim();
      const commonName = document.getElementById('custom-common-name').value.trim();
      const scientificName = document.getElementById('custom-scientific-name').value.trim();
      const category = document.getElementById('custom-category').value;
      const iucnStatus = document.getElementById('custom-iucn').value;
      const description = document.getElementById('custom-description').value.trim();
      const habitat = document.getElementById('custom-habitat').value.trim();
      const diet = document.getElementById('custom-diet').value.trim();
      const imageUrlRaw = document.getElementById('custom-image-url').value.trim();
      const audioUrlRaw = document.getElementById('custom-audio-url').value.trim();
      const audioNotes = document.getElementById('custom-audio-notes').value.trim();

      if (!commonName) {
        this.setCustomFormFeedback('Please enter an animal common name.', true);
        document.getElementById('custom-common-name')?.focus();
        return;
      }
      if (!description) {
        this.setCustomFormFeedback('Please enter a description or notes for this animal.', true);
        document.getElementById('custom-description')?.focus();
        return;
      }

      if (!this.customUploadedImageData && imageUrlRaw && !sanitizeImageSource(imageUrlRaw)) {
        this.setCustomFormFeedback('Image URL must be a valid http:// or https:// web address.', true);
        document.getElementById('custom-image-url')?.focus();
        return;
      }

      const chosenImage = this.customUploadedImageData || imageUrlRaw;

      if (!this.pendingAudioFile && !this.keptExistingAudioSource && audioUrlRaw && !sanitizeHttpUrl(audioUrlRaw)) {
        this.setCustomFormFeedback('Audio URL must be a valid http:// or https:// web address.', true);
        document.getElementById('custom-audio-url')?.focus();
        return;
      }

      const chosenAudio = this.pendingAudioFile ? '' : (this.keptExistingAudioSource || audioUrlRaw);
      const chosenAudioName = this.pendingAudioFile?.name || this.keptExistingAudioName || '';

      const attachedLinks = [];
      const linkRows = Array.from(document.querySelectorAll('#custom-links-list .custom-link-row'));
      for (const row of linkRows) {
        const labelVal = row.querySelector('.custom-link-label')?.value.trim() || '';
        const urlEl = row.querySelector('.custom-link-url');
        const urlVal = urlEl?.value.trim() || '';
        if (!urlVal && !labelVal) continue;
        if (!urlVal) {
          this.setCustomFormFeedback(`Please provide a URL for attached link "${labelVal}".`, true);
          urlEl?.focus();
          return;
        }
        const safeLinkUrl = sanitizeHttpUrl(urlVal);
        if (!safeLinkUrl) {
          this.setCustomFormFeedback(`Attached link "${urlVal}" must use a valid http:// or https:// URL.`, true);
          urlEl?.focus();
          return;
        }
        attachedLinks.push({ label: labelVal, url: safeLinkUrl });
      }

      const saveBtn = document.getElementById('btn-save-custom-animal');
      if (saveBtn) saveBtn.disabled = true;
      try {
        const res = await customSpeciesStore.addOrUpdateAsync(
          {
            commonName,
            scientificName,
            category,
            iucnStatus,
            description,
            habitat,
            diet,
            imageUrl: chosenImage,
            audioUrl: chosenAudio,
            audioFileName: chosenAudioName,
            audioNotes,
            attachedLinks
          },
          editId || null,
          this.pendingAudioFile
        );

        if (!res.ok) {
          this.setCustomFormFeedback(res.error || 'Could not save entry to this browser.', true);
          return;
        }

        this.resetCustomForm({ preserveFeedback: true });
        this.refreshCustomAndCatalogViews();
        this.setCustomFormFeedback(
          editId
            ? `Updated "${res.entry.commonName}" in your local browser storage.`
            : `Saved "${res.entry.commonName}" on this device only. It is now visible in your Tree and Database.`
        );
      } catch (err) {
        this.setCustomFormFeedback(err?.message || 'Could not save audio/entry to browser storage.', true);
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });

    this.renderCustomSpeciesManager();
  }

  renderCustomSpeciesManager() {
    const listEl = document.getElementById('custom-saved-list');
    const headingEl = document.getElementById('custom-saved-heading');
    const clearAllBtn = document.getElementById('btn-clear-all-custom');
    if (!listEl) return;

    const list = this.customSpeciesList;
    if (headingEl) {
      headingEl.textContent = `Saved on This Device (${list.length})`;
    }
    if (clearAllBtn) {
      clearAllBtn.style.display = list.length > 0 ? '' : 'none';
    }

    if (list.length === 0) {
      listEl.innerHTML = `
        <div class="custom-empty-state">
          No custom animals saved on this device yet.<br>
          Use the form on the left to save entries with descriptions and attached links privately in this browser's storage.
        </div>
      `;
      return;
    }

    listEl.innerHTML = list.map((sp) => {
      const safeImg = sanitizeImageSource(sp.wikipediaImage || '');
      const fallbackIcon = getFallbackEmojiForCategory(sp);
      const linkCount = Array.isArray(sp.attachedLinks) ? sp.attachedLinks.length : 0;
      const hasAudio = Boolean(sp.bioacoustics?.originalAudioUrl);
      const spKey = escapeHtml(sp.id);

      return `
        <article class="custom-saved-card" data-custom-id="${spKey}">
          <div class="custom-saved-card-top">
            ${safeImg
              ? `<img src="${escapeHtml(safeImg)}" alt="${escapeHtml(sp.commonName)}" class="custom-saved-thumb" onerror="this.style.display='none'">`
              : `<span class="custom-saved-thumb-fallback" aria-hidden="true">${fallbackIcon}</span>`}
            <div class="custom-saved-meta">
              <div class="custom-saved-name">${escapeHtml(sp.commonName)}</div>
              <div class="custom-saved-submeta">
                ${escapeHtml(sp.taxonomy?.class || 'Animalia')} · ${escapeHtml(sp.iucnStatus || 'LC')} · ${linkCount} ${linkCount === 1 ? 'link' : 'links'}${hasAudio ? ' · 🎙️ audio' : ''}
              </div>
            </div>
          </div>
          <p class="custom-saved-desc">${escapeHtml(sp.wikipediaSummary)}</p>
          <div class="custom-saved-actions">
            <button type="button" class="custom-mini-btn btn-custom-inspect" data-id="${spKey}">👁️ Inspect</button>
            <button type="button" class="custom-mini-btn btn-custom-edit" data-id="${spKey}">✏️ Edit</button>
            <button type="button" class="custom-mini-btn is-danger btn-custom-delete" data-id="${spKey}">🗑️ Delete</button>
          </div>
        </article>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-custom-inspect').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.openSpeciesModal(btn.getAttribute('data-id'));
      });
    });

    listEl.querySelectorAll('.btn-custom-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.populateCustomFormForEdit(btn.getAttribute('data-id'));
      });
    });

    listEl.querySelectorAll('.btn-custom-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.confirmDelete !== 'true') {
          btn.dataset.confirmDelete = 'true';
          btn.textContent = 'Confirm?';
          setTimeout(() => {
            if (btn.isConnected) {
              btn.dataset.confirmDelete = '';
              btn.textContent = '🗑️ Delete';
            }
          }, 2500);
          return;
        }
        this.deleteCustomSpeciesById(btn.getAttribute('data-id'));
      });
    });
  }

  /* -------------------------------------------------------------
     MODALS
  ------------------------------------------------------------- */
  setModalOpen(modalEl, isOpen) {
    if (!modalEl) return;
    modalEl.classList.toggle('open', isOpen);
    if (isOpen) {
      const body = modalEl.querySelector('.modal-body');
      if (body) body.scrollTop = 0;
    }
    const anyOpen = !!document.querySelector('.modal-overlay.open');
    document.body.classList.toggle('modal-open', anyOpen);
    motionEffects.setModalPaused(anyOpen);
  }

  setupModals() {
    const speciesModal = document.getElementById('species-modal');
    const closeSpeciesBtn = document.getElementById('modal-close-x');
    if (closeSpeciesBtn && speciesModal) {
      closeSpeciesBtn.addEventListener('click', () => {
        this.setModalOpen(speciesModal, false);
      });
      speciesModal.addEventListener('click', (e) => {
        if (e.target === speciesModal) this.setModalOpen(speciesModal, false);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (speciesModal?.classList.contains('open')) this.setModalOpen(speciesModal, false);
      }
    });
  }
}

// Instantiate and boot app on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const app = new TerraFaunaApp();
  app.init();
});
