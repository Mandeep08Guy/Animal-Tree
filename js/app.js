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
    this.activeSearchQuery = '';
    this.remoteSearchResults = null;
    this.activeFilter = 'all';
    this.activeIucnFilter = null;
    this.activeDecodedSpecies = VERIFIED_SPECIES_CATALOG[0];
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
    const tabPauseBtn = document.getElementById('btn-pause-audio');
    const tabStopBtn = document.getElementById('btn-stop-audio');
    const triggerBtn = document.getElementById('hamburger-trigger');
    const oscEl = document.getElementById('osc-status');
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
        pauseBtn.textContent = 'Pause';
      }
      if (tabPauseBtn) {
        tabPauseBtn.style.display = 'inline-flex';
        tabPauseBtn.disabled = false;
        tabPauseBtn.textContent = 'Pause';
      }
      if (tabStopBtn) {
        tabStopBtn.style.display = 'inline-flex';
        tabStopBtn.disabled = false;
      }
      if (stopBtn) stopBtn.disabled = false;
    } else if (status === 'paused') {
      if (statusEl) statusEl.textContent = `Paused · ${trackLabel}`;
      if (oscEl) oscEl.textContent = `Paused · ${trackLabel}`;
      if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.textContent = 'Resume';
      }
      if (tabPauseBtn) {
        tabPauseBtn.style.display = 'inline-flex';
        tabPauseBtn.disabled = false;
        tabPauseBtn.textContent = 'Resume';
      }
      if (tabStopBtn) {
        tabStopBtn.style.display = hasAudio ? 'inline-flex' : 'none';
        tabStopBtn.disabled = !hasAudio;
      }
      if (stopBtn) stopBtn.disabled = !hasAudio;
    } else {
      if (statusEl) statusEl.textContent = 'No wildlife audio active';
      if (pauseBtn) {
        pauseBtn.disabled = true;
        pauseBtn.textContent = 'Pause';
      }
      if (tabPauseBtn) {
        tabPauseBtn.style.display = 'none';
        tabPauseBtn.disabled = true;
        tabPauseBtn.textContent = 'Pause';
      }
      if (tabStopBtn) {
        tabStopBtn.style.display = 'none';
        tabStopBtn.disabled = true;
      }
      if (stopBtn) stopBtn.disabled = true;
      document.querySelectorAll('.sound-card, .species-card').forEach(c => c.classList.remove('playing-audio'));
      if (oscEl && (oscEl.textContent.startsWith('Playing') || oscEl.textContent.startsWith('Paused'))) {
        oscEl.textContent = 'Idle';
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

    // Migrate legacy 'dark'/'light' theme names cleanly into separate mode preference + accent palette
    let savedTheme = localStorage.getItem('terrafauna_theme') || 'emerald';
    let savedModePref = localStorage.getItem('terrafauna_mode');
    const savedSurface = localStorage.getItem('terrafauna_surface') || 'matte';
    if (savedTheme === 'light') {
      savedModePref = 'light';
      savedTheme = 'emerald';
    } else if (savedTheme === 'dark') {
      savedModePref = 'dark';
      savedTheme = 'slate';
    }
    if (!savedModePref || !['light', 'dark', 'system'].includes(savedModePref)) {
      savedModePref = 'light';
    }

    this.modePref = savedModePref;
    this.applyAppearance(savedTheme, savedModePref, savedSurface, { persist: false });

    const colorSchemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (colorSchemeQuery) {
      const handleSystemChange = () => {
        if (this.modePref === 'system') {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
          const currentSurface = document.documentElement.getAttribute('data-surface') || 'matte';
          this.applyAppearance(currentTheme, 'system', currentSurface, { persist: false });
        }
      };
      if (typeof colorSchemeQuery.addEventListener === 'function') {
        colorSchemeQuery.addEventListener('change', handleSystemChange);
      } else if (typeof colorSchemeQuery.addListener === 'function') {
        colorSchemeQuery.addListener(handleSystemChange);
      }
    }

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
        const currentModePref = this.modePref || 'light';
        const currentSurface = document.documentElement.getAttribute('data-surface') || 'matte';
        this.applyAppearance(theme, currentModePref, currentSurface, { persist: true });
      });
    });

    const modeSystemBtn = document.getElementById('btn-mode-system');
    [
      [modeLightBtn, 'light'],
      [modeDarkBtn, 'dark'],
      [modeSystemBtn, 'system']
    ].forEach(([btn, pref]) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        const currentSurface = document.documentElement.getAttribute('data-surface') || 'matte';
        this.applyAppearance(currentTheme, pref, currentSurface, { persist: true });
      });
    });

    if (surfaceMatteBtn) {
      surfaceMatteBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        this.applyAppearance(currentTheme, this.modePref || 'light', 'matte', { persist: true });
      });
    }

    if (surfaceGlossyBtn) {
      surfaceGlossyBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        this.applyAppearance(currentTheme, this.modePref || 'light', 'glossy', { persist: true });
      });
    }
  }

  applyAppearance(themeName, modePref = 'light', surfaceName = 'matte', { persist = true } = {}) {
    const resolvedPref = ['light', 'dark', 'system'].includes(modePref) ? modePref : 'light';
    const resolvedMode = resolvedPref === 'system'
      ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : resolvedPref;

    this.modePref = resolvedPref;
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.setAttribute('data-mode', resolvedMode);
    document.documentElement.setAttribute('data-mode-pref', resolvedPref);
    document.documentElement.setAttribute('data-surface', surfaceName);

    if (persist) {
      localStorage.setItem('terrafauna_theme', themeName);
      localStorage.setItem('terrafauna_mode', resolvedPref);
      localStorage.setItem('terrafauna_surface', surfaceName);
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', resolvedMode === 'light' ? '#e8f5ee' : '#070b0d');
    }

    document.querySelectorAll('#theme-palette-grid .theme-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });

    const modeDarkBtn = document.getElementById('btn-mode-dark');
    const modeLightBtn = document.getElementById('btn-mode-light');
    const modeSystemBtn = document.getElementById('btn-mode-system');
    if (modeLightBtn) modeLightBtn.classList.toggle('active', resolvedPref === 'light');
    if (modeDarkBtn) modeDarkBtn.classList.toggle('active', resolvedPref === 'dark');
    if (modeSystemBtn) modeSystemBtn.classList.toggle('active', resolvedPref === 'system');

    const surfaceMatteBtn = document.getElementById('btn-surface-matte');
    const surfaceGlossyBtn = document.getElementById('btn-surface-glossy');
    if (surfaceMatteBtn) surfaceMatteBtn.classList.toggle('active', surfaceName === 'matte');
    if (surfaceGlossyBtn) surfaceGlossyBtn.classList.toggle('active', surfaceName === 'glossy');

    motionEffects.onThemeChanged();
    bioacoustics.refreshTheme();
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
    bioacoustics.syncVisualizerLoop();
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
            ${hasAudio ? `<span class="drawer-db-audio-dot" title="Wildlife audio recording"></span>` : ''}
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

  scoreSpeciesMatch(species, terms) {
    if (!terms || terms.length === 0) return 1;
    const tax = species.taxonomy || {};
    const prefixTest = (text, wordRe) => Boolean(text && wordRe.test(String(text)));

    let totalScore = 0;
    const common = String(species.commonName || '').toLowerCase();
    const sci = String(species.scientificName || '').toLowerCase();
    const fullQuery = terms.join(' ');
    if (common === fullQuery || sci === fullQuery) totalScore += 140;
    else if (common.startsWith(fullQuery) || sci.startsWith(fullQuery)) totalScore += 80;

    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordStartRe = new RegExp(`(?:^|[^a-z0-9])${escaped}`, 'i');
      const exactWordRe = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');

      let termScore = 0;
      if (prefixTest(species.commonName, exactWordRe)) termScore = Math.max(termScore, 95);
      else if (prefixTest(species.commonName, wordStartRe)) termScore = Math.max(termScore, 65);
      if (prefixTest(species.scientificName, exactWordRe)) termScore = Math.max(termScore, 80);
      else if (prefixTest(species.scientificName, wordStartRe)) termScore = Math.max(termScore, 58);
      if (
        prefixTest(tax.class, wordStartRe) ||
        prefixTest(tax.order, wordStartRe) ||
        prefixTest(tax.suborder, wordStartRe) ||
        prefixTest(tax.family, wordStartRe) ||
        prefixTest(tax.genus, wordStartRe) ||
        prefixTest(species.customCategory, wordStartRe)
      ) {
        termScore = Math.max(termScore, 50);
      }
      if (
        prefixTest(species.iucnStatus, exactWordRe) ||
        (species.tropicalHabitat?.nativeRegions || []).some(r => prefixTest(r, wordStartRe)) ||
        (species.tropicalHabitat?.biomes || []).some(b => prefixTest(b, wordStartRe)) ||
        prefixTest(species.dietAndTrophic?.trophicLevel, wordStartRe) ||
        prefixTest(species.dietAndTrophic?.dietCategory, wordStartRe) ||
        prefixTest(species.bioacoustics?.communicationType, wordStartRe)
      ) {
        termScore = Math.max(termScore, 32);
      }
      if (
        (species.dietAndTrophic?.preyTypes || []).some(p => prefixTest(p, exactWordRe)) ||
        (species.huntingStrategy?.primaryPrey || []).some(p => prefixTest(p, exactWordRe)) ||
        (species.biochemicalDrivers || []).some(b => prefixTest(b.chemicalAgent, wordStartRe) || prefixTest(b.molecularClass, wordStartRe)) ||
        (species.skeletalBiomechanics?.boneAdaptations || []).some(b => prefixTest(b.boneName, exactWordRe)) ||
        (species.lifeStagesAndBehavior || []).some(l => prefixTest(l.phase, exactWordRe)) ||
        (species.attachedLinks || []).some(l => prefixTest(l.label, wordStartRe))
      ) {
        termScore = Math.max(termScore, 18);
      }
      if (
        term.length >= 3 && (
          prefixTest(species.wikipediaSummary, exactWordRe) ||
          prefixTest(species.bioacoustics?.acousticFunction, exactWordRe) ||
          prefixTest(species.dietAndTrophic?.digestiveAdaptation, exactWordRe)
        )
      ) {
        termScore = Math.max(termScore, 8);
      }

      if (termScore === 0) return 0;
      totalScore += termScore;
    }

    return totalScore;
  }

  clearSearch() {
    const searchInput = document.getElementById('fauna-search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    this.activeSearchQuery = '';
    this.remoteSearchResults = null;
    this.applyFaunaFilter();
    if (searchInput) searchInput.focus();
  }

  clearAllFilters() {
    const searchInput = document.getElementById('fauna-search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';

    this.activeSearchQuery = '';
    this.remoteSearchResults = null;
    this.activeFilter = 'all';
    this.activeIucnFilter = null;

    document.querySelectorAll('#fauna-filter-tags .tag-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
    });
    document.querySelectorAll('#iucn-legend-filter [data-iucn]').forEach(i => i.classList.remove('active'));

    this.applyFaunaFilter();
  }

  setupFaunaExplorer() {
    this.updateDatabaseStats();
    this.applyFaunaFilter();

    const searchInput = document.getElementById('fauna-search-input');
    const searchBtn = document.getElementById('fauna-search-btn');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const clearFiltersStripBtn = document.getElementById('btn-clear-all-filters-strip');
    const exploreClearFiltersBtn = document.getElementById('btn-clear-all-filters-explore');

    const ensureFaunaTabVisibleInBg = () => {
      const faunaPane = document.getElementById('tab-fauna');
      if (faunaPane && !faunaPane.classList.contains('active')) {
        this.switchToTab('tab-fauna', { closeDrawer: false });
      }
    };

    const syncClearSearchVisibility = () => {
      if (clearSearchBtn && searchInput) {
        clearSearchBtn.style.display = searchInput.value.trim().length > 0 ? 'inline-flex' : 'none';
      }
    };

    let searchDebounceId = null;
    const executeLocalSearch = (ensureVisible = true) => {
      this.activeSearchQuery = (searchInput?.value || '').trim();
      this.remoteSearchResults = null;
      syncClearSearchVisibility();
      if (ensureVisible) ensureFaunaTabVisibleInBg();
      return this.applyFaunaFilter();
    };

    const handleSearch = async () => {
      const query = (searchInput?.value || '').trim();
      this.activeSearchQuery = query;
      syncClearSearchVisibility();
      ensureFaunaTabVisibleInBg();

      if (!query) {
        this.remoteSearchResults = null;
        this.applyFaunaFilter();
        return;
      }

      const matched = executeLocalSearch(true);
      if (matched.length === 0 && query.length >= 2 && searchBtn) {
        searchBtn.innerHTML = `<span>...</span>`;
        searchBtn.disabled = true;
        motionEffects.mascotReact('searching', query);
        try {
          const results = await bioService.searchSpecies(query);
          this.remoteSearchResults = results.length > 0 ? results : [];
          this.applyFaunaFilter();
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          searchBtn.innerHTML = `<span>Search</span>`;
          searchBtn.disabled = false;
        }
      }
    };

    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
        if (e.key === 'Escape' && searchInput.value) {
          e.stopPropagation();
          this.clearSearch();
        }
      });
      searchInput.addEventListener('input', () => {
        syncClearSearchVisibility();
        if (searchDebounceId) clearTimeout(searchDebounceId);
        searchDebounceId = setTimeout(() => executeLocalSearch(false), 140);
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearSearch();
      });
    }

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

    // Reset / Clear All Filters buttons (Drawer header, filter strip, and Explore bar)
    [
      document.getElementById('drawer-btn-reset-filters'),
      clearFiltersStripBtn,
      exploreClearFiltersBtn
    ].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        ensureFaunaTabVisibleInBg();
        this.clearAllFilters();
      });
    });

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
    const basePool = (this.remoteSearchResults && this.activeSearchQuery)
      ? this.remoteSearchResults
      : this.getCombinedCatalog();
    let filtered = [...basePool];

    // 0. Word-boundary & relevance-ranked search query
    const q = (this.activeSearchQuery || '').trim().toLowerCase();
    if (q && !this.remoteSearchResults) {
      const terms = q.split(/\s+/).filter(Boolean);
      const scored = [];
      for (const s of filtered) {
        const sc = this.scoreSpeciesMatch(s, terms);
        if (sc > 0) scored.push({ s, sc });
      }
      scored.sort((a, b) => b.sc - a.sc);
      filtered = scored.map(item => item.s);
    }

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

    this.currentSpeciesList = filtered;

    // Sync Clear All Filters visibility across Drawer and Explore bar
    const hasActiveState = Boolean(q || (this.activeFilter && this.activeFilter !== 'all') || this.activeIucnFilter);
    const totalCount = this.getCombinedCatalog().length;
    const stripClearBtn = document.getElementById('btn-clear-all-filters-strip');
    if (stripClearBtn) stripClearBtn.style.display = hasActiveState ? 'inline-flex' : 'none';

    const resetHdrBtn = document.getElementById('drawer-btn-reset-filters');
    if (resetHdrBtn) resetHdrBtn.classList.toggle('is-active', hasActiveState);

    const exploreBar = document.getElementById('explore-filter-status');
    const exploreSummary = document.getElementById('explore-filter-summary');
    if (exploreBar && exploreSummary) {
      if (hasActiveState) {
        const parts = [];
        if (this.activeSearchQuery) parts.push(`"${this.activeSearchQuery}"`);
        if (this.activeFilter && this.activeFilter !== 'all') parts.push(this.activeFilter);
        if (this.activeIucnFilter) parts.push(`IUCN ${this.activeIucnFilter}`);
        exploreSummary.textContent = `Showing ${filtered.length} of ${totalCount} (${parts.join(' · ')})`;
        exploreBar.style.display = 'flex';
      } else {
        exploreBar.style.display = 'none';
      }
    }

    this.renderFaunaGrid(filtered);
    return filtered;
  }

  renderFaunaGrid(speciesList) {
    const grid = document.getElementById('fauna-grid');
    if (!grid) return;

    if (speciesList.length === 0) {
      grid.innerHTML = `
        <div class="tree-empty-state" style="text-align: center; padding: 2.5rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <p style="font-size: 1.05rem; margin-bottom: 0.45rem; color: var(--text-title);">No species matched your search or filters.</p>
          <p style="font-size: 0.85rem; margin-bottom: 1.15rem;">Try a common name or taxon such as <em>Panthera</em>, <em>Loxodonta</em>, or <em>Owl</em>.</p>
          <button type="button" class="btn-secondary" id="btn-clear-filters-empty" style="margin: 0 auto;">Clear All Filters</button>
        </div>
      `;
      const emptyClearBtn = grid.querySelector('#btn-clear-filters-empty');
      if (emptyClearBtn) {
        emptyClearBtn.addEventListener('click', () => this.clearAllFilters());
      }
      this.renderDrawerDatabaseResults(speciesList);
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
                    ? `<span class="pod-stages-pill is-local-pill" title="Saved locally in your browser storage only">On Device</span>`
                    : ''}
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
                  ${linksCount > 0 ? `<div class="pod-links-hint">${linksCount} ${linksCount === 1 ? 'Reference Link' : 'Reference Links'}</div>` : ''}
                </div>

                <!-- Interactive Action Capsule -->
                <div class="pod-action-wrap">
                  <button class="pod-explore-btn" type="button">
                    <span>Explore</span>
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
              <span>${sp.isCustomLocal ? `Local Entry ${specIndex}` : `Branch ${specIndex}`} · ${escapeHtml(sp.taxonomy.class || 'Animalia')}</span>
            </div>
            <div class="whisper-title">${safeCommon}</div>
            <div class="whisper-meta-list">
              <span class="whisper-meta-item">${region}</span>
              <span class="whisper-meta-item">${vocalFreq}</span>
              <span class="whisper-meta-item">${iucn.name} (${iucn.code})</span>
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
        <div class="finale-bloom-title">Canopy Complete · ${speciesList.length} Species</div>
        <div class="finale-actions-row">
          <button type="button" class="finale-pill-btn" id="btn-scroll-top-canopy">↑ Top</button>
          <button type="button" class="finale-pill-btn" id="btn-open-db-from-finale">Browse Archive</button>
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

  async openSpeciesModal(speciesId, { expandDecode = false } = {}) {
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
      <div style="display: flex; gap: 1.4rem; flex-wrap: wrap; margin-bottom: 1.3rem;">
        ${safeImageUrl ? `<img src="${escapeHtml(safeImageUrl)}" alt="${escapeHtml(species.commonName)}" style="width: 260px; height: 190px; object-fit: cover; border-radius: var(--radius-md);" onerror="this.style.display='none'">` : ''}
        <div style="flex: 1; min-width: 240px;">
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.65rem;">
            <span class="iucn-legend-pill ${iucnObj.class}" style="font-size: 0.8rem; padding: 0.2rem 0.6rem;">${iucnObj.code} · ${escapeHtml(iucnObj.name)}</span>
            ${species.isCustomLocal ? `<span class="pod-stages-pill is-local-pill">On This Device</span>` : ''}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem; font-size: 0.9rem; font-family: var(--font-journal);">
            <div><span style="color: var(--text-dim);">Kingdom:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.kingdom || 'Animalia')}</span></div>
            <div><span style="color: var(--text-dim);">Phylum:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.phylum || 'Chordata')}</span></div>
            <div><span style="color: var(--text-dim);">Class:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.class || 'Animalia')}</span></div>
            <div><span style="color: var(--text-dim);">Order:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.order || 'Custom')}</span></div>
            <div><span style="color: var(--text-dim);">Family:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.family || 'N/A')}</span></div>
            <div><span style="color: var(--text-dim);">Genus:</span> <span style="color: var(--text-title);">${escapeHtml(species.taxonomy?.genus || 'N/A')}</span></div>
          </div>
          <p style="margin-top: 0.85rem; font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; white-space: pre-line;">
            ${escapeHtml(species.wikipediaSummary || 'Zoological field summary.')}
          </p>
          ${safeAudioUrl || decoderProfile ? `
            <div style="display: flex; gap: 0.5rem; margin-top: 0.9rem; flex-wrap: wrap;">
              ${safeAudioUrl ? `
                <button class="btn-primary btn-modal-audition" style="min-width: 145px; justify-content: center;">
                  <span>Play Wildlife Audio</span>
                </button>
              ` : ''}
              ${decoderProfile ? `
                <button class="btn-secondary btn-modal-decode" style="min-width: 145px; justify-content: center;" title="Expand bioacoustic call meaning and motifs">
                  Decode Call
                </button>
              ` : ''}
            </div>
          ` : ''}
          ${species.isCustomLocal ? `
            <div class="modal-local-actions">
              <button type="button" class="btn-secondary btn-modal-edit-local">Edit Entry</button>
              <button type="button" class="btn-secondary btn-modal-delete-local">Remove from This Device</button>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="detail-grid" style="gap: 0.7rem; margin-top: 0.5rem;">
        ${validLinks.length > 0 ? `
          <details class="modal-deep-dive">
            <summary class="modal-deep-dive-summary">
              <span>Links &amp; References (${validLinks.length})</span>
              <span class="deep-dive-hint">Expand</span>
            </summary>
            <div class="modal-deep-dive-body">
              <div class="modal-attached-links-list" style="margin-top: 0;">
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
          </details>
        ` : ''}

        <details class="modal-deep-dive">
          <summary class="modal-deep-dive-summary">
            <span>Habitat &amp; Distribution</span>
            <span class="deep-dive-hint">${escapeHtml((habitat.nativeRegions || [])[0] || 'Expand')}</span>
          </summary>
          <div class="modal-deep-dive-body">
            <div class="detail-row"><strong>Regions:</strong> <span>${escapeHtml((habitat.nativeRegions || []).join(', ') || 'Global')}</span></div>
            <div class="detail-row"><strong>Biomes:</strong> <span>${escapeHtml((habitat.biomes || []).join(', ') || 'Temperate / Tropical')}</span></div>
            <div class="detail-row"><strong>Climate:</strong> <span>${escapeHtml(habitat.temperatureRange || '15°C - 35°C')}</span></div>
            <div class="detail-row"><strong>Elevation:</strong> <span>${escapeHtml(habitat.elevation || '0 - 2,000m')}</span></div>
          </div>
        </details>

        <details class="modal-deep-dive">
          <summary class="modal-deep-dive-summary">
            <span>Diet &amp; Ecology</span>
            <span class="deep-dive-hint">${escapeHtml(diet.dietCategory || 'Expand')}</span>
          </summary>
          <div class="modal-deep-dive-body">
            <div class="detail-row"><strong>Trophic Role:</strong> <span>${escapeHtml(diet.trophicLevel || 'Consumer')}</span></div>
            <div class="detail-row"><strong>Guild:</strong> <span>${escapeHtml(diet.dietCategory || 'Generalist')}</span></div>
            <div class="detail-row"><strong>Forage / Prey:</strong> <span>${escapeHtml((diet.preyTypes || []).join(', ') || 'Adapted')}</span></div>
            <div class="detail-row"><strong>Digestion:</strong> <span>${escapeHtml(diet.digestiveAdaptation || 'Specialized enzymatic pathways.')}</span></div>
          </div>
        </details>

        <details class="modal-deep-dive">
          <summary class="modal-deep-dive-summary">
            <span>Anatomy &amp; Physiology</span>
            <span class="deep-dive-hint">Expand</span>
          </summary>
          <div class="modal-deep-dive-body">
            <div class="detail-row"><strong>Integument:</strong> <span>${escapeHtml(anatomy.integument || 'Epidermal covering')}</span></div>
            <div class="detail-row"><strong>Respiration:</strong> <span>${escapeHtml(anatomy.respiration || 'Pulmonary')}</span></div>
            <div class="detail-row"><strong>Thermoregulation:</strong> <span>${escapeHtml(anatomy.thermoregulation || 'Homeostatic')}</span></div>
            <div class="detail-row"><strong>Dentition:</strong> <span>${escapeHtml(anatomy.dentition || 'Adapted oral structure')}</span></div>
          </div>
        </details>

        <details class="modal-deep-dive" id="modal-section-bioacoustics"${expandDecode ? ' open' : ''}>
          <summary class="modal-deep-dive-summary">
            <span>Bioacoustics &amp; Call Semantics</span>
            <span class="deep-dive-hint">${escapeHtml(acoustics.frequencyRangeHz || ((acoustics.fundamentalFrequencyHz || 440) + ' Hz'))}</span>
          </summary>
          <div class="modal-deep-dive-body">
            <div class="detail-row"><strong>Signal Type:</strong> <span>${escapeHtml(acoustics.communicationType || 'Acoustic vocalization')}</span></div>
            <div class="detail-row"><strong>Frequency:</strong> <span style="color: var(--cyan-400); font-family: var(--font-mono);">${escapeHtml(acoustics.frequencyRangeHz || `${acoustics.fundamentalFrequencyHz || 440} Hz`)}</span></div>
            <div class="detail-row"><strong>Role:</strong> <span>${escapeHtml(acoustics.acousticFunction || 'Conspecific coordination')}</span></div>
            ${acoustics.syntaxProfile ? `
              <div class="detail-row"><strong>Syntax:</strong> <span>${escapeHtml(acoustics.syntaxProfile.pattern)}</span></div>
            ` : ''}
            ${decoderProfile ? `
              <div class="modal-decoded-preview" id="modal-decoded-preview" style="display: block; margin-top: 0.35rem;">
                <div class="modal-decode-head">
                  <span>Bioacoustic Decoding</span>
                  <span class="decoder-val">${decoderProfile.confidencePercent || 96.5}% confidence</span>
                </div>
                <div class="modal-decode-quote">${decoderProfile.headlineTranslation}</div>
                <div class="decoder-meta-strip" style="margin-bottom: 0.65rem;">
                  <div class="decoder-meta-item">
                    <span class="decoder-label">Entropy</span>
                    <span class="decoder-val text-emerald">H = ${decoderProfile.entropyScore ?? (acoustics.syntaxProfile ? acoustics.syntaxProfile.entropyScore : '0.64')}</span>
                  </div>
                  <div class="decoder-meta-item">
                    <span class="decoder-label">Spectrum</span>
                    <span class="decoder-val">${escapeHtml(acoustics.frequencyRangeHz || ((acoustics.fundamentalFrequencyHz || 440) + ' Hz'))}</span>
                  </div>
                </div>
                ${(decoderProfile.phonemes && decoderProfile.phonemes.length > 0) ? `
                  <div class="dec-phoneme-timeline" id="modal-phoneme-timeline">
                    ${decoderProfile.phonemes.map((ph, idx) => `
                      <button type="button" class="phoneme-chip-btn${idx === 0 ? ' active-phoneme' : ''}" data-phoneme-index="${idx}">
                        <span class="phoneme-tag-time">${escapeHtml(ph.timeRange)}</span>
                        <span class="phoneme-chip-name">${escapeHtml(ph.name)}</span>
                      </button>
                    `).join('')}
                  </div>
                  <div class="dec-motif-note" id="modal-motif-note">
                    <span class="dec-motif-freq">${escapeHtml(decoderProfile.phonemes[0].freq)}</span> · ${escapeHtml(decoderProfile.phonemes[0].semanticMeaning)}
                  </div>
                ` : ''}
                <p class="modal-decode-context">${decoderProfile.ethologicalContext}</p>
                <div class="dec-source-line">${decoderProfile.scientificCitation || 'Cornell Macaulay Library / Published Zoological Ethology'}</div>
              </div>
            ` : ''}
          </div>
        </details>

        ${lifeStages.length > 0 ? `
          <details class="modal-deep-dive">
            <summary class="modal-deep-dive-summary">
              <span>Life Stages (${lifeStages.length})</span>
              <span class="deep-dive-hint">View timeline</span>
            </summary>
            <div class="modal-deep-dive-body">
              ${lifeStages.map((stage, sIdx) => `
                <div class="deep-dive-item">
                  <div class="deep-dive-item-head">
                    <strong>Phase 0${sIdx + 1}: ${stage.phase}</strong>
                    <span class="deep-dive-meta">${stage.timeframe}</span>
                  </div>
                  <p class="deep-dive-text">${stage.behavior}</p>
                  ${stage.environmentalResponse ? `<p class="deep-dive-sub">Context: ${stage.environmentalResponse}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}

        ${biochemDrivers.length > 0 ? `
          <details class="modal-deep-dive">
            <summary class="modal-deep-dive-summary">
              <span>Biochemistry &amp; Hormones (${biochemDrivers.length})</span>
              <span class="deep-dive-hint">View pathways</span>
            </summary>
            <div class="modal-deep-dive-body">
              ${biochemDrivers.map(bio => `
                <div class="deep-dive-item">
                  <div class="deep-dive-item-head">
                    <strong>${bio.chemicalAgent}</strong>
                    <span class="deep-dive-meta">${bio.sourceOrgan}</span>
                  </div>
                  <p class="deep-dive-text">${bio.chemicalMechanism}</p>
                  <p class="deep-dive-sub">Effect: ${bio.behavioralTransformation}</p>
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}

        ${species.huntingStrategy ? `
          <details class="modal-deep-dive">
            <summary class="modal-deep-dive-summary">
              <span>Hunting &amp; Foraging Strategy</span>
              <span class="deep-dive-hint">${escapeHtml(species.huntingStrategy.tacticalMethod)}</span>
            </summary>
            <div class="modal-deep-dive-body">
              <div class="deep-dive-item">
                <p class="deep-dive-text">${species.huntingStrategy.executionSteps}</p>
                <p class="deep-dive-sub">Target Prey: ${species.huntingStrategy.primaryPrey.join(', ')}</p>
              </div>
            </div>
          </details>
        ` : ''}

        ${species.skeletalBiomechanics ? `
          <details class="modal-deep-dive">
            <summary class="modal-deep-dive-summary">
              <span>Skeletal Biomechanics (${species.skeletalBiomechanics.boneAdaptations.length})</span>
              <span class="deep-dive-hint">View osteology</span>
            </summary>
            <div class="modal-deep-dive-body">
              ${species.skeletalBiomechanics.boneAdaptations.map(bone => `
                <div class="deep-dive-item">
                  <div class="deep-dive-item-head"><strong>${bone.boneName}</strong></div>
                  <p class="deep-dive-text">${bone.geometricDesign}</p>
                  <p class="deep-dive-sub">Utility: ${bone.survivalUtility}</p>
                </div>
              `).join('')}
            </div>
          </details>
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
          deleteLocalBtn.textContent = 'Click again to remove';
          deleteLocalBtn.style.color = 'var(--rose-400)';
          setTimeout(() => {
            if (deleteLocalBtn.isConnected) {
              deleteLocalBtn.dataset.confirmDelete = '';
              deleteLocalBtn.textContent = 'Remove from This Device';
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

    // Hook modal phoneme motif chips
    const modalTimeline = bodyEl.querySelector('#modal-phoneme-timeline');
    const modalMotifNote = bodyEl.querySelector('#modal-motif-note');
    if (modalTimeline && modalMotifNote && decoderProfile && Array.isArray(decoderProfile.phonemes)) {
      modalTimeline.querySelectorAll('.phoneme-chip-btn').forEach(chip => {
        chip.addEventListener('click', () => {
          modalTimeline.querySelectorAll('.phoneme-chip-btn').forEach(c => c.classList.remove('active-phoneme'));
          chip.classList.add('active-phoneme');
          const pIdx = Number(chip.getAttribute('data-phoneme-index'));
          const ph = decoderProfile.phonemes[pIdx];
          if (ph) {
            modalMotifNote.innerHTML = `<span class="dec-motif-freq">${escapeHtml(ph.freq)}</span> · ${escapeHtml(ph.semanticMeaning)}`;
            const oscEl = document.getElementById('osc-status');
            if (oscEl) oscEl.textContent = `Motif · ${ph.name} (${ph.freq})`;
            motionEffects.mascotReact('click', ph.name);
          }
        });
      });
    }

    // Hook modal decode button -> toggles Bioacoustics details section & streams call
    const modalDecodeBtn = bodyEl.querySelector('.btn-modal-decode');
    const bioSection = bodyEl.querySelector('#modal-section-bioacoustics');
    if (modalDecodeBtn && bioSection) {
      const syncDecodeLabel = () => {
        modalDecodeBtn.textContent = bioSection.open ? 'Hide Call Details' : 'Decode Call';
      };
      syncDecodeLabel();
      bioSection.addEventListener('toggle', syncDecodeLabel);
      modalDecodeBtn.addEventListener('click', () => {
        bioSection.open = !bioSection.open;
        syncDecodeLabel();
        if (bioSection.open) {
          if (safeAudioUrl) this.playSpeciesAudioById(species.id || species.scientificName);
          motionEffects.mascotReact('speaking', species.commonName);
          bioSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    this.setModalOpen(document.getElementById('species-modal'), true);
    if (expandDecode && bioSection) {
      requestAnimationFrame(() => {
        bioSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
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
    const statusEl = document.getElementById('decoder-stream-status');
    const confidenceEl = document.getElementById('dec-confidence');
    const translationTextEl = document.getElementById('dec-translation-text');
    const citationEl = document.getElementById('dec-citation');
    const timelineEl = document.getElementById('dec-phoneme-timeline');
    const motifNoteEl = document.getElementById('dec-motif-note');

    if (subjectEl) {
      subjectEl.innerHTML = `<strong>${escapeHtml(sp.commonName)}</strong> <span class="dec-sci">${escapeHtml(sp.scientificName)}</span>`;
    }
    if (syntaxEl) syntaxEl.textContent = decProfile.syntaxStructure || bio.communicationType || 'Acoustic Signal';
    if (entropyEl) entropyEl.textContent = `H = ${decProfile.entropyScore ?? (bio.syntaxProfile ? bio.syntaxProfile.entropyScore : '0.64')}`;
    if (spectrumEl) spectrumEl.textContent = `${bio.frequencyRangeHz || (bio.fundamentalFrequencyHz + ' Hz')} · ${bio.amplitudeSpl || 'Conspecific radius'}`;
    if (confidenceEl) confidenceEl.textContent = `${decProfile.confidencePercent || 96.5}%`;
    if (translationTextEl) translationTextEl.textContent = decProfile.headlineTranslation || `“${bio.syntaxProfile?.meaning || bio.acousticFunction}”`;
    if (citationEl) {
      citationEl.textContent = decProfile.scientificCitation || 'Cornell Macaulay Library / Published Zoological Ethology';
    }

    if (statusEl) {
      if (bio.originalAudioUrl) {
        statusEl.textContent = 'Streaming & Decoding';
        statusEl.classList.add('active-streaming');
      } else {
        statusEl.textContent = 'Empirical Record';
        statusEl.classList.remove('active-streaming');
      }
    }

    const renderMotifNote = (ph) => {
      if (!motifNoteEl) return;
      if (!ph) {
        motifNoteEl.textContent = '';
        return;
      }
      motifNoteEl.innerHTML = `<span class="dec-motif-freq">${escapeHtml(ph.freq)}</span> · ${escapeHtml(ph.semanticMeaning)}`;
    };

    // Render compact clickable phonetic motif pills
    if (timelineEl) {
      const phonemes = decProfile.phonemes || [];
      if (phonemes.length === 0) {
        timelineEl.innerHTML = '';
        renderMotifNote(null);
      } else {
        timelineEl.innerHTML = phonemes.map((ph, idx) => `
          <button type="button" class="phoneme-chip-btn${idx === 0 ? ' active-phoneme' : ''}" data-phoneme-index="${idx}" title="${escapeHtml(ph.semanticMeaning)}">
            <span class="phoneme-tag-time">${escapeHtml(ph.timeRange)}</span>
            <span class="phoneme-chip-name">${escapeHtml(ph.name)}</span>
          </button>
        `).join('');
        renderMotifNote(phonemes[0]);

        timelineEl.querySelectorAll('.phoneme-chip-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            timelineEl.querySelectorAll('.phoneme-chip-btn').forEach(tc => tc.classList.remove('active-phoneme'));
            btn.classList.add('active-phoneme');
            const pIdx = Number(btn.getAttribute('data-phoneme-index'));
            const ph = phonemes[pIdx];
            if (ph) {
              renderMotifNote(ph);
              document.getElementById('osc-status').textContent = `Motif · ${ph.name} (${ph.freq})`;
              motionEffects.mascotReact('click', ph.name);
            }
          });
        });
      }
    }
  }

  animateDecodingPipeline() {}

  /* -------------------------------------------------------------
     TAB 2: BIOACOUSTICS & ANIMAL LANGUAGE LAB
  ------------------------------------------------------------- */
  setupBioacousticsLab() {
    const canvasOsc = document.getElementById('canvas-oscilloscope');
    const canvasSpec = document.getElementById('canvas-spectrogram');
    if (canvasOsc && canvasSpec) {
      bioacoustics.attachCanvases(canvasOsc, canvasSpec);
    }

    const scopesDetails = document.getElementById('explore-scopes-drawer');
    if (scopesDetails) {
      scopesDetails.addEventListener('toggle', () => {
        if (scopesDetails.open) {
          requestAnimationFrame(() => bioacoustics.syncVisualizerLoop());
        } else {
          bioacoustics.stopVisualizerLoop();
        }
      });
    }

    const stopBtn = document.getElementById('btn-stop-audio');
    if (stopBtn) {
      stopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        bioacoustics.stopAudio();
        document.querySelectorAll('.sound-card, .species-card').forEach(c => c.classList.remove('playing-audio'));
        const oscEl = document.getElementById('osc-status');
        if (oscEl) oscEl.textContent = 'Stopped';
      });
    }

    const pauseBtn = document.getElementById('btn-pause-audio');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }
  }

  initBioacousticsVisualizer() {
    const canvasOsc = document.getElementById('canvas-oscilloscope');
    const canvasSpec = document.getElementById('canvas-spectrogram');
    if (canvasOsc && canvasSpec) {
      bioacoustics.initAudio();
      bioacoustics.startVisualizer(canvasOsc, canvasSpec);
    }
  }

  renderSoundCatalog() { return;
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
                  </div>
                </div>
                <div class="sound-stat-row">
                  <span>Frequency:</span>
                  <span class="sound-stat-val">${safeFreqRange}</span>
                </div>
                <div class="sound-stat-row">
                  <span>Entropy:</span>
                  <span class="sound-stat-val">H = ${bio.syntaxProfile ? bio.syntaxProfile.entropyScore : 0.6}</span>
                </div>
                <div class="sound-card-actions" style="display: flex; gap: 0.5rem; margin-top: 0.85rem;">
                  <button class="btn-card-audio btn-play-dialect sound-play-pill" data-species-id="${spKey}" style="flex: 1.1;">
                    <span>Play Recording</span>
                  </button>
                  ${!sp.isCustomLocal ? `
                    <button class="btn-card-decode btn-decode-dialect sound-decode-pill" data-species-id="${spKey}" style="flex: 1;" title="Decode acoustic syntax & translate to peer-reviewed ethological semantics">
                      Decode
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
        this.openSpeciesModal(spId, { expandDecode: true });
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
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('res-pred-mass', prediction.massCategory);
    setTxt('res-pred-entropy', `H = ${prediction.entropyScore}`);
    setTxt('res-pred-range', `${prediction.maxTransmissionKm} km`);
    setTxt('res-pred-f0', `${prediction.fundamentalFreqHz} Hz`);
    setTxt('res-pred-syntax', prediction.syntaxStructure);
    setTxt('res-pred-purpose', prediction.predictedFunction);
    setTxt('res-pred-physics', prediction.transmissionAcoustics);
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

    this.updateDatabaseStats();
    this.applyFaunaFilter();
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
                ${escapeHtml(sp.taxonomy?.class || 'Animalia')} · ${escapeHtml(sp.iucnStatus || 'LC')} · ${linkCount} ${linkCount === 1 ? 'link' : 'links'}${hasAudio ? ' · audio' : ''}
              </div>
            </div>
          </div>
          <p class="custom-saved-desc">${escapeHtml(sp.wikipediaSummary)}</p>
          <div class="custom-saved-actions">
            <button type="button" class="custom-mini-btn btn-custom-inspect" data-id="${spKey}">Inspect</button>
            <button type="button" class="custom-mini-btn btn-custom-edit" data-id="${spKey}">Edit</button>
            <button type="button" class="custom-mini-btn is-danger btn-custom-delete" data-id="${spKey}">Delete</button>
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
              btn.textContent = 'Delete';
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
