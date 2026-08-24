(() => {
  'use strict';

  const CHUNKS = Array.from({ length: 7 }, (_, i) => `./assets/symbols/chunk-${String(i).padStart(2, '0')}.txt`);
  const loadingText = document.getElementById('loading-text');
  const loadingProgress = document.getElementById('loading-progress');
  let atlasUrl = null;

  function fail(error) {
    console.error('[Royal Arc] Symbol atlas bootstrap failed', error);
    if (loadingText) loadingText.textContent = 'Błąd atlasu symboli';
  }

  async function loadAtlas() {
    try {
      if (loadingText) loadingText.textContent = 'Przygotowanie symboli…';
      if (loadingProgress) loadingProgress.style.width = '12%';

      const texts = await Promise.all(CHUNKS.map(async (url, index) => {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Chunk ${index} HTTP ${response.status}`);
        return (await response.text()).trim();
      }));

      if (loadingProgress) loadingProgress.style.width = '36%';
      const base64 = texts.join('');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      atlasUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
      window.__ROYAL_ARC_ATLAS_URL = atlasUrl;

      if (!window.Phaser?.Loader?.LoaderPlugin) throw new Error('Phaser LoaderPlugin unavailable');
      const originalSpritesheet = window.Phaser.Loader.LoaderPlugin.prototype.spritesheet;
      window.Phaser.Loader.LoaderPlugin.prototype.spritesheet = function patchedSpritesheet(key, url, config, ...rest) {
        const resolvedUrl = key === 'symbols' && window.__ROYAL_ARC_ATLAS_URL
          ? window.__ROYAL_ARC_ATLAS_URL
          : url;
        return originalSpritesheet.call(this, key, resolvedUrl, config, ...rest);
      };

      if (loadingProgress) loadingProgress.style.width = '42%';
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './slot.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('slot.js failed to load'));
        document.body.appendChild(script);
      });
    } catch (error) {
      fail(error);
    }
  }

  window.addEventListener('beforeunload', () => {
    if (atlasUrl) URL.revokeObjectURL(atlasUrl);
  }, { once: true });

  loadAtlas();
})();
