/**
 * Client-Only Local Custom Species Storage (Browser localStorage + IndexedDB)
 * Entries and uploaded photos/audio stay strictly on the user's current browser & device
 * and never modify or sync to the global catalog.
 */

const STORAGE_KEY = 'terrafauna_custom_species_v1';
const AUDIO_DB_NAME = 'terrafauna_local_audio_v1';
const AUDIO_STORE_NAME = 'audioClips';
const MAX_AUDIO_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const CATEGORY_TAXONOMY_MAP = {
  Mammalia: { class: 'Mammalia', order: 'Custom Mammalia', isDomestic: false, icon: '🐾' },
  Aves: { class: 'Aves', order: 'Custom Aves', isDomestic: false, icon: '🦅' },
  Reptilia: { class: 'Reptilia', order: 'Custom Reptilia', isDomestic: false, icon: '🦎' },
  Serpentes: { class: 'Reptilia', order: 'Squamata', suborder: 'Serpentes', isDomestic: false, icon: '🐍' },
  Amphibia: { class: 'Amphibia', order: 'Custom Amphibia', isDomestic: false, icon: '🐸' },
  Insecta: { class: 'Insecta', order: 'Custom Insecta', isDomestic: false, icon: '🦋' },
  Monotremata: { class: 'Mammalia', order: 'Monotremata', isDomestic: false, icon: '🦆' },
  Marine: { class: 'Actinopterygii', order: 'Marine & Freshwater', isDomestic: false, defaultBiome: 'Oceanic & Riverine Waters', icon: '🐋' },
  Domestic: { class: 'Mammalia', order: 'Domesticated Taxa', isDomestic: true, icon: '🐕' },
  Animalia: { class: 'Animalia', order: 'Custom Entry', isDomestic: false, icon: '🐾' }
};

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHttpUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';

  // Block dangerous schemes explicitly
  if (/^(javascript|data|vbscript|file|blob):/i.test(trimmed)) {
    return null;
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate) && !candidate.startsWith('./') && !candidate.startsWith('/')) {
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else {
      return null;
    }
  }

  try {
    const parsed = new URL(candidate, window.location.origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function sanitizeImageSource(rawImage) {
  const trimmed = String(rawImage || '').trim();
  if (!trimmed) return '';

  // Only allow safe raster image Data URIs (never SVG data URIs)
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  return sanitizeHttpUrl(trimmed);
}

export function sanitizeAudioSource(rawAudio) {
  const trimmed = String(rawAudio || '').trim();
  if (!trimmed) return '';

  if (/^idb-audio:[a-z0-9_-]+$/i.test(trimmed)) {
    return trimmed;
  }

  if (/^data:audio\/(mpeg|mp3|ogg|oga|wav|x-wav|wave|webm|aac|mp4|x-m4a|flac|opus);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  return sanitizeHttpUrl(trimmed);
}

export function getFallbackEmojiForCategory(categoryOrSpecies) {
  if (!categoryOrSpecies) return '🐾';
  if (typeof categoryOrSpecies === 'string') {
    return CATEGORY_TAXONOMY_MAP[categoryOrSpecies]?.icon || '🐾';
  }
  const cat = categoryOrSpecies.customCategory;
  if (cat && CATEGORY_TAXONOMY_MAP[cat]) {
    return CATEGORY_TAXONOMY_MAP[cat].icon;
  }
  if (categoryOrSpecies.isDomestic) return '🐕';
  const cls = String(categoryOrSpecies.taxonomy?.class || '').toLowerCase();
  const sub = String(categoryOrSpecies.taxonomy?.suborder || '').toLowerCase();
  if (sub.includes('serpentes')) return '🐍';
  if (cls.includes('aves')) return '🦅';
  if (cls.includes('amphibia')) return '🐸';
  if (cls.includes('reptilia')) return '🦎';
  if (cls.includes('insecta')) return '🦋';
  if (cls.includes('actinopterygii') || cls.includes('chondrichthyes') || cls.includes('cephalopoda')) return '🐋';
  return '🐾';
}

export async function compressImageFileToDataUrl(file, maxDimension = 480, quality = 0.82) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    throw new Error('Please choose a PNG, JPEG, WEBP, or GIF image file.');
  }
  if (/svg/i.test(file.type)) {
    throw new Error('SVG files are disabled for security. Please choose a JPG, PNG, or WEBP photo.');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image file is larger than 15 MB. Please choose a smaller photo.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode this image file.'));
      el.src = objectUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const width = Math.max(1, Math.round((img.naturalWidth || maxDimension) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || maxDimension) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas image processing is unavailable in this browser.');
    ctx.drawImage(img, 0, 0, width, height);

    let dataUrl = canvas.toDataURL('image/webp', quality);
    if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function validateAudioFile(file) {
  if (!file) {
    throw new Error('Please select an audio file.');
  }
  const type = String(file.type || '').toLowerCase();
  const extMatch = /\.(mp3|ogg|oga|wav|m4a|aac|flac|webm|opus)$/i.test(file.name || '');
  if (!type.startsWith('audio/') && !extMatch) {
    throw new Error('Please select a valid audio file (MP3, OGG, WAV, M4A, AAC, FLAC, or WEBM).');
  }
  if (file.size > MAX_AUDIO_FILE_BYTES) {
    throw new Error('Audio file is larger than 10 MB. Please choose a clip under 10 MB.');
  }
}

function readBlobAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected audio file.'));
    reader.readAsDataURL(file);
  });
}

function openAudioDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(AUDIO_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        db.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open error'));
  });
}

async function putAudioClipInIdb(clipId, file) {
  const db = await openAudioDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE_NAME);
      store.put({
        id: clipId,
        blob: file,
        name: file.name || 'device-audio',
        type: file.type || 'audio/mpeg',
        size: file.size || 0,
        savedAt: Date.now()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('IndexedDB write error'));
    });
  } finally {
    db.close();
  }
}

async function getAudioClipFromIdb(clipId) {
  const db = await openAudioDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readonly');
      const req = tx.objectStore(AUDIO_STORE_NAME).get(clipId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error('IndexedDB read error'));
    });
  } finally {
    db.close();
  }
}

async function deleteAudioClipFromIdb(clipId) {
  if (!clipId || !String(clipId).startsWith('idb-audio:')) return;
  try {
    const db = await openAudioDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
        tx.objectStore(AUDIO_STORE_NAME).delete(clipId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  } catch (err) {
    console.warn('Skipping IndexedDB clip delete:', err);
  }
}

async function clearAllAudioClipsFromIdb() {
  try {
    const db = await openAudioDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
        tx.objectStore(AUDIO_STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  } catch (err) {
    console.warn('Skipping IndexedDB clear:', err);
  }
}

export async function saveUploadedAudioFile(speciesId, file) {
  validateAudioFile(file);
  const clipId = `idb-audio:${speciesId}`;
  try {
    await putAudioClipInIdb(clipId, file);
    return clipId;
  } catch (err) {
    // Fallback to Data URL in localStorage if IndexedDB is blocked in private mode
    if (file.size <= 1.5 * 1024 * 1024) {
      return await readBlobAsDataUrl(file);
    }
    throw new Error('Browser storage unavailable for large audio files. Try a smaller audio clip (< 1.5 MB) or an Audio URL.');
  }
}

export async function resolvePlayableAudioSource(rawSource) {
  const safe = sanitizeAudioSource(rawSource || '');
  if (!safe) return { url: null, isBlob: false, name: '', size: 0 };

  if (safe.startsWith('idb-audio:')) {
    try {
      const record = await getAudioClipFromIdb(safe);
      if (!record || !record.blob) {
        return { url: null, isBlob: false, name: '', size: 0 };
      }
      return {
        url: URL.createObjectURL(record.blob),
        isBlob: true,
        name: record.name || 'Device Audio',
        size: record.size || record.blob.size || 0
      };
    } catch (err) {
      console.warn('Failed to load stored device audio clip:', err);
      return { url: null, isBlob: false, name: '', size: 0 };
    }
  }

  return { url: safe, isBlob: false, name: '', size: 0 };
}

export function deriveLinkLabel(url, explicitLabel = '') {
  const cleanLabel = String(explicitLabel || '').trim();
  if (cleanLabel) return cleanLabel;
  try {
    const host = new URL(url).hostname.replace(/^www\./i, '');
    return host || 'Reference Link';
  } catch {
    return 'Reference Link';
  }
}

function buildNormalizedEntry(formData, existingEntry = null, resolvedId = null) {
  const commonName = String(formData.commonName || '').trim();
  const scientificNameRaw = String(formData.scientificName || '').trim();
  const scientificName = scientificNameRaw || 'Custom local entry';
  const categoryKey = Object.prototype.hasOwnProperty.call(CATEGORY_TAXONOMY_MAP, formData.category)
    ? formData.category
    : 'Animalia';
  const taxTemplate = CATEGORY_TAXONOMY_MAP[categoryKey];
  const validIucn = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD'].includes(String(formData.iucnStatus || '').toUpperCase())
    ? String(formData.iucnStatus).toUpperCase()
    : 'LC';

  const habitatText = String(formData.habitat || '').trim();
  const dietText = String(formData.diet || '').trim();
  const audioNotes = String(formData.audioNotes || '').trim();
  const audioFileName = String(formData.audioFileName || '').trim();
  const description = String(formData.description || '').trim();
  const imageUrl = sanitizeImageSource(formData.imageUrl || '') || '';
  const audioUrl = sanitizeAudioSource(formData.audioUrl || '') || null;

  const attachedLinks = Array.isArray(formData.attachedLinks)
    ? formData.attachedLinks
        .map((item) => {
          const cleanUrl = sanitizeHttpUrl(item?.url || '');
          if (!cleanUrl) return null;
          return {
            label: deriveLinkLabel(cleanUrl, item?.label || ''),
            url: cleanUrl
          };
        })
        .filter(Boolean)
    : [];

  const nowIso = new Date().toISOString();
  const id = resolvedId || existingEntry?.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    isCustomLocal: true,
    customCategory: categoryKey,
    isDomestic: Boolean(taxTemplate.isDomestic),
    createdAt: existingEntry?.createdAt || nowIso,
    updatedAt: nowIso,
    commonName,
    scientificName,
    author: 'Saved on this device',
    taxonomy: {
      kingdom: 'Animalia',
      phylum: categoryKey === 'Insecta' ? 'Arthropoda' : 'Chordata',
      class: taxTemplate.class,
      order: taxTemplate.order,
      ...(taxTemplate.suborder ? { suborder: taxTemplate.suborder } : {}),
      family: 'Local Entry',
      genus: scientificNameRaw ? scientificNameRaw.split(/\s+/)[0] : 'Custom',
      species: scientificName
    },
    iucnStatus: validIucn,
    tropicalHabitat: {
      biomes: habitatText ? [habitatText] : (taxTemplate.defaultBiome ? [taxTemplate.defaultBiome] : ['Local User Observation']),
      nativeRegions: habitatText ? [habitatText] : ['Saved Locally'],
      temperatureRange: 'Device entry',
      elevation: 'Not specified'
    },
    dietAndTrophic: {
      trophicLevel: dietText || 'User-recorded diet',
      dietCategory: dietText || 'Custom Note',
      preyTypes: dietText ? [dietText] : [],
      digestiveAdaptation: 'Recorded in local browser notes.'
    },
    anatomyAndPhysiology: {
      integument: `${taxTemplate.class} taxonomy group`,
      respiration: 'See field notes',
      thermoregulation: 'See field notes',
      dentition: 'See field notes'
    },
    bioacoustics: {
      communicationType: audioNotes || (audioFileName ? `Device Audio (${audioFileName})` : 'Custom acoustic note'),
      frequencyRangeHz: audioNotes || (audioUrl ? 'Attached Audio' : 'Not specified'),
      acousticFunction: audioUrl ? 'User-attached audio recording' : 'Local observation note',
      originalAudioUrl: audioUrl,
      ...(audioFileName ? { audioFileName } : {})
    },
    wikipediaImage: imageUrl,
    wikipediaSummary: description,
    attachedLinks
  };
}

class CustomSpeciesStore {
  loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && typeof item === 'object' && item.commonName && item.wikipediaSummary)
        .map((item) => ({ ...item, isCustomLocal: true }));
    } catch (err) {
      console.warn('Unable to read local custom species cache:', err);
      return [];
    }
  }

  saveAll(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return { ok: true };
    } catch (err) {
      console.error('Unable to write custom species to browser storage:', err);
      return {
        ok: false,
        error: err?.name === 'QuotaExceededError'
          ? 'Browser storage quota is full. Try removing older custom photos/audio or using URLs instead.'
          : 'Browser storage is unavailable in this session.'
      };
    }
  }

  async addOrUpdateAsync(formData, editId = null, uploadedAudioFile = null) {
    const current = this.loadAll();
    const existingIdx = editId ? current.findIndex((item) => item.id === editId) : -1;
    const existing = existingIdx >= 0 ? current[existingIdx] : null;
    const entryId = existing?.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    let finalAudioUrl = formData.audioUrl || '';
    let finalAudioFileName = formData.audioFileName || '';

    if (uploadedAudioFile) {
      finalAudioUrl = await saveUploadedAudioFile(entryId, uploadedAudioFile);
      finalAudioFileName = uploadedAudioFile.name || 'Device audio';
    } else if (existing?.bioacoustics?.originalAudioUrl?.startsWith('idb-audio:') && finalAudioUrl !== existing.bioacoustics.originalAudioUrl) {
      await deleteAudioClipFromIdb(existing.bioacoustics.originalAudioUrl);
    }

    const normalized = buildNormalizedEntry(
      { ...formData, audioUrl: finalAudioUrl, audioFileName: finalAudioFileName },
      existing,
      entryId
    );

    const nextList = [...current];
    if (existingIdx >= 0) {
      nextList[existingIdx] = normalized;
    } else {
      nextList.unshift(normalized);
    }

    const res = this.saveAll(nextList);
    if (!res.ok && uploadedAudioFile && String(finalAudioUrl).startsWith('idb-audio:')) {
      await deleteAudioClipFromIdb(finalAudioUrl);
    }
    return { ...res, entry: normalized, entries: nextList };
  }

  async deleteByIdAsync(id) {
    const current = this.loadAll();
    const victim = current.find((item) => item.id === id);
    const nextList = current.filter((item) => item.id !== id);
    const res = this.saveAll(nextList);
    if (res.ok && victim?.bioacoustics?.originalAudioUrl?.startsWith('idb-audio:')) {
      await deleteAudioClipFromIdb(victim.bioacoustics.originalAudioUrl);
    }
    return { ...res, entries: nextList };
  }

  async clearAllAsync() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      await clearAllAudioClipsFromIdb();
      return { ok: true, entries: [] };
    } catch (err) {
      return { ok: false, error: 'Could not clear browser storage.', entries: this.loadAll() };
    }
  }
}

export const customSpeciesStore = new CustomSpeciesStore();
