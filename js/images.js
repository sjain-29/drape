/*
 * DRAPE images & AI
 * ---------------------------------------------------------------
 * - Shrinks photos before saving (also removes location data).
 * - Removes backgrounds and finds clothes INSIDE YOUR BROWSER using free
 *   open-source AI models (downloaded once, then cached by the browser).
 * - Virtual try-on: either the free AI demo on Hugging Face (tops), or
 *   an overlay you arrange yourself (any garment, no AI).
 */
window.DRAPE_IMAGES = (function () {
  const DATA = window.DRAPE_DATA;
  const STORE = window.DRAPE_STORE;
  const cfg = window.DRAPE_CONFIG || {};

  // Pinned library versions (loaded from the jsDelivr CDN only when needed).
  const BG_REMOVAL_URL = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm';
  const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
  const CLOTHES_MODEL = 'Xenova/segformer_b2_clothes';

  const PRODUCT_W = 900;
  const PRODUCT_H = 1125;
  const MARGIN = 0.08;

  // ------------------------------------------------------------ basics

  async function loadImage(source) {
    const blob = source instanceof Blob ? source : await (await fetch(source)).blob();
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch (e) {
      const url = URL.createObjectURL(blob);
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        return img;
      } catch (err) {
        throw new Error('This file could not be opened as a photo. Please use a JPG or PNG image.');
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    }
  }

  const sizeOf = (img) => ({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  /** Draws an image scaled so its longest side is at most maxSide. */
  function drawScaled(img, maxSide, rotate = 0) {
    const { w, h } = sizeOf(img);
    const s = Math.min(1, maxSide / Math.max(w, h));
    const sw = w * s;
    const sh = h * s;
    const turned = rotate % 180 !== 0;
    const c = canvas(turned ? sh : sw, turned ? sw : sh);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
    return c;
  }

  const toJpeg = (c, q = 0.86) => c.toDataURL('image/jpeg', q);

  function checkFile(file) {
    if (!file || !/^image\//.test(file.type || 'image/')) throw new Error(`“${file && file.name}” is not a photo.`);
    if (file.size > 20 * 1024 * 1024) throw new Error(`“${file.name}” is larger than 20 MB. Please choose a smaller photo.`);
  }

  /** A profile photo ready to save (max 1024 px, JPEG). */
  async function preparePhoto(file, rotate = 0) {
    checkFile(file);
    const img = await loadImage(file);
    const c = drawScaled(img, 1024, rotate);
    if (Math.min(c.width, c.height) < 250) throw new Error('This photo is too small. Please use a bigger photo.');
    return { dataUrl: toJpeg(c, 0.86), w: c.width, h: c.height, check: checkPhoto(c) };
  }

  /** Simple quality check: brightness, size and shape. */
  function checkPhoto(c) {
    const small = drawScaled(c, 200);
    const d = small.getContext('2d').getImageData(0, 0, small.width, small.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const brightness = sum / (d.length / 4);
    const tips = [];
    if (brightness < 70) tips.push('The photo is quite dark. Stand facing a window or in bright light.');
    if (brightness > 220) tips.push('The photo looks very bright. Avoid direct sunlight or flash.');
    if (c.height < c.width * 1.15) tips.push('A tall (portrait) photo of your whole body works best.');
    if (Math.min(c.width, c.height) < 500) tips.push('This photo is small. A larger photo gives sharper results.');
    return tips;
  }

  // ----------------------------------------------- product image + colour

  /** Crops the visible part of a transparent cut-out and centres it on white. */
  function productFromCutout(cut) {
    const ctx = cut.getContext('2d');
    const { width: w, height: h } = cut;
    const px = ctx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (px[(y * w + x) * 4 + 3] > 40) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) throw new Error('No garment was found in this photo.');
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const out = canvas(PRODUCT_W, PRODUCT_H);
    const o = out.getContext('2d');
    o.fillStyle = '#ffffff';
    o.fillRect(0, 0, PRODUCT_W, PRODUCT_H);
    const innerW = PRODUCT_W * (1 - 2 * MARGIN);
    const innerH = PRODUCT_H * (1 - 2 * MARGIN);
    const s = Math.min(innerW / bw, innerH / bh);
    o.imageSmoothingQuality = 'high';
    o.drawImage(cut, minX, minY, bw, bh, (PRODUCT_W - bw * s) / 2, (PRODUCT_H - bh * s) / 2, bw * s, bh * s);
    return { dataUrl: toJpeg(out, 0.88), color: mainColor(px, w, h), coverage: (bw * bh) / (w * h) };
  }

  /** The garment's main colour (simple clustering of visible pixels). */
  function mainColor(px, w, h) {
    const samples = [];
    const step = Math.max(1, Math.floor((w * h) / 4000));
    for (let i = 0; i < w * h; i += step) {
      if (px[i * 4 + 3] > 200) samples.push([px[i * 4], px[i * 4 + 1], px[i * 4 + 2]]);
    }
    if (!samples.length) return { name: 'Grey', hex: '#8A8C8F' };
    let centers = [samples[0], samples[Math.floor(samples.length / 2)], samples[samples.length - 1]];
    let groups = [];
    for (let it = 0; it < 8; it++) {
      groups = centers.map(() => []);
      for (const s of samples) {
        let best = 0;
        let bestD = Infinity;
        centers.forEach((c, i) => {
          const d = (s[0] - c[0]) ** 2 + (s[1] - c[1]) ** 2 + (s[2] - c[2]) ** 2;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        groups[best].push(s);
      }
      centers = groups.map((g, i) => (g.length ? [0, 1, 2].map((k) => g.reduce((a, s) => a + s[k], 0) / g.length) : centers[i]));
    }
    const biggest = groups.reduce((bi, g, i) => (g.length > groups[bi].length ? i : bi), 0);
    const hex = DATA.rgbToHex(centers[biggest][0], centers[biggest][1], centers[biggest][2]);
    return { name: DATA.nearestPaletteColor(hex).name, hex };
  }

  /** Fallback when background removal is not wanted or fails: centre-crop on white. */
  async function productWithoutAi(file) {
    checkFile(file);
    const img = await loadImage(file);
    const c = drawScaled(img, 1200);
    const out = canvas(PRODUCT_W, PRODUCT_H);
    const o = out.getContext('2d');
    o.fillStyle = '#fff';
    o.fillRect(0, 0, PRODUCT_W, PRODUCT_H);
    const s = Math.min(PRODUCT_W / c.width, PRODUCT_H / c.height);
    o.drawImage(c, (PRODUCT_W - c.width * s) / 2, (PRODUCT_H - c.height * s) / 2, c.width * s, c.height * s);
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    return { dataUrl: toJpeg(out, 0.88), color: mainColor(d, c.width, c.height), coverage: 1 };
  }

  // --------------------------------------------- in-browser AI: background

  let bgLib = null;
  async function removeBackground(file, onProgress) {
    checkFile(file);
    const img = await loadImage(file);
    const input = drawScaled(img, 1280);
    const inputBlob = await new Promise((r) => input.toBlob(r, 'image/jpeg', 0.92));
    if (!bgLib) {
      onProgress && onProgress('Loading the background remover (first time only)…');
      try {
        bgLib = await import(BG_REMOVAL_URL);
      } catch (e) {
        throw new Error('The background remover could not be downloaded. Check your internet connection.');
      }
    }
    const fn = bgLib.removeBackground || bgLib.default;
    onProgress && onProgress('Removing the background…');
    const resultBlob = await fn(inputBlob, {
      output: { format: 'image/png' },
      progress: (key, current, total) => {
        if (onProgress && /fetch/.test(key) && total) onProgress(`Downloading AI model… ${Math.round((current / total) * 100)}%`);
      },
    });
    const cutImg = await loadImage(resultBlob);
    const cut = drawScaled(cutImg, 1280);
    // drawScaled paints white behind; redraw the cut-out on a clear canvas instead.
    const clear = canvas(cut.width, cut.height);
    clear.getContext('2d').drawImage(cutImg, 0, 0, clear.width, clear.height);
    const product = productFromCutout(clear);
    if (product.coverage > 0.97) throw new Error('The garment could not be separated from the background. Try a plain background.');
    return product;
  }

  // ------------------------------------------ in-browser AI: find clothes

  const REGIONS = [
    { key: 'upper', labels: ['Upper-clothes'], group: 'upperWear', sub: 't-shirt', title: 'Upper wear' },
    { key: 'lower', labels: ['Pants', 'Skirt'], group: 'bottomWear', sub: 'formal-trousers', title: 'Bottom wear' },
    { key: 'full', labels: ['Dress'], group: 'onePieces', sub: 'dress', title: 'One-piece' },
    { key: 'shoes', labels: ['Left-shoe', 'Right-shoe'], group: 'shoes', sub: 'sneakers', title: 'Shoes' },
  ];

  let segmenter = null;
  async function getSegmenter(onProgress) {
    if (segmenter) return segmenter;
    onProgress && onProgress('Loading the clothes finder (first time only, about 30 MB)…');
    let lib;
    try {
      lib = await import(TRANSFORMERS_URL);
    } catch (e) {
      throw new Error('The clothes finder could not be downloaded. Check your internet connection.');
    }
    segmenter = await lib.pipeline('image-segmentation', CLOTHES_MODEL, {
      progress_callback: (p) => {
        if (onProgress && p.status === 'progress' && p.total) onProgress(`Downloading AI model… ${Math.round((p.loaded / p.total) * 100)}%`);
      },
    });
    return segmenter;
  }

  /** Simple 4-neighbour connected regions of a 0/255 mask. */
  function regions(mask, w, h) {
    const label = new Int32Array(w * h);
    const sizes = [0];
    const boxes = [null];
    let next = 1;
    const stack = [];
    for (let i = 0; i < w * h; i++) {
      if (mask[i] < 128 || label[i]) continue;
      let size = 0;
      const box = { x0: w, y0: h, x1: 0, y1: 0 };
      label[i] = next;
      stack.push(i);
      while (stack.length) {
        const p = stack.pop();
        size++;
        const x = p % w;
        const y = (p - x) / w;
        if (x < box.x0) box.x0 = x;
        if (x > box.x1) box.x1 = x;
        if (y < box.y0) box.y0 = y;
        if (y > box.y1) box.y1 = y;
        const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
        for (const q of nb) {
          if (q >= 0 && !label[q] && mask[q] >= 128) {
            label[q] = next;
            stack.push(q);
          }
        }
      }
      sizes.push(size);
      boxes.push(box);
      next++;
    }
    return { label, sizes, boxes };
  }

  /**
   * Finds each garment a person is wearing and returns product images.
   * Real segmentation (pixel by pixel), not a simple crop.
   */
  async function extractClothes(file, onProgress) {
    checkFile(file);
    const img = await loadImage(file);
    const photo = drawScaled(img, 768);
    const w = photo.width;
    const h = photo.height;
    const seg = await getSegmenter(onProgress);
    onProgress && onProgress('Finding the clothes in your photo…');
    const blob = await new Promise((r) => photo.toBlob(r, 'image/jpeg', 0.92));
    const url = URL.createObjectURL(blob);
    let output;
    try {
      output = await seg(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    const photoPx = photo.getContext('2d').getImageData(0, 0, w, h);
    const found = [];
    const notes = [];

    for (const region of REGIONS) {
      const parts = output.filter((o) => region.labels.includes(o.label));
      if (!parts.length) continue;
      const mask = new Uint8Array(w * h);
      for (const part of parts) {
        const m = part.mask;
        const sx = m.width / w;
        const sy = m.height / h;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const v = m.data[Math.floor(y * sy) * m.width + Math.floor(x * sx)];
            if (v >= 128) mask[y * w + x] = 255;
          }
        }
      }
      const { label, sizes, boxes } = regions(mask, w, h);
      const total = sizes.reduce((a, b) => a + b, 0);
      const minArea = region.key === 'shoes' ? 0.004 : 0.015;
      if (total / (w * h) < minArea) continue;
      // Keep the main piece plus any reasonably large pieces (e.g. a sleeve behind an arm).
      const largest = Math.max(...sizes.slice(1));
      const keep = new Set();
      sizes.forEach((s, i) => {
        if (i && s >= largest * 0.05) keep.add(i);
      });
      const kept = [...keep].reduce((a, i) => a + sizes[i], 0);
      const warnings = [];
      if (region.key !== 'shoes' && keep.size > 1 && (kept - largest) / kept > 0.04) {
        warnings.push('Part of this garment is hidden (by an arm, hair or a bag), so the picture has gaps.');
      }
      const touches = [...keep].some((i) => {
        const b = boxes[i];
        return b.x0 <= 1 || b.y0 <= 1 || b.x1 >= w - 2 || b.y1 >= h - 2;
      });
      if (touches && region.key !== 'shoes') warnings.push('The garment is cut off at the edge of the photo.');

      const cut = canvas(w, h);
      const cctx = cut.getContext('2d');
      const out = cctx.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        out.data[i * 4] = photoPx.data[i * 4];
        out.data[i * 4 + 1] = photoPx.data[i * 4 + 1];
        out.data[i * 4 + 2] = photoPx.data[i * 4 + 2];
        out.data[i * 4 + 3] = keep.has(label[i]) ? 255 : 0;
      }
      cctx.putImageData(out, 0, 0);
      // Soften the edge slightly so it doesn't look jagged.
      const soft = canvas(w, h);
      const sctx = soft.getContext('2d');
      sctx.filter = 'blur(0.6px)';
      sctx.drawImage(cut, 0, 0);
      const product = productFromCutout(sctx.filter === 'blur(0.6px)' ? soft : cut);
      const subLabel = region.key === 'lower' && parts.some((p) => p.label === 'Skirt') && !parts.some((p) => p.label === 'Pants') ? 'skirt' : region.sub;
      found.push({ id: STORE.newId(), region: region.key, title: region.title, group: region.group, subcategory: subLabel, image: product.dataUrl, color: product.color, warnings });
    }
    if (!found.length) {
      throw new Error('No clothes could be found in this photo. Use a clear, well-lit photo where the outfit is fully visible.');
    }
    if (found.some((f) => f.region === 'upper')) notes.push('A jacket worn over a shirt comes out as one upper-wear item.');
    return { items: found, notes };
  }

  // ------------------------------------- free AI try-on (Hugging Face)
  //
  // Your browser talks directly to a free public AI demo on Hugging Face
  // (IDM-VTON by default, set in js/config.js). No server of your own.
  // Limits: it changes TOPS only, it can be busy or asleep, and free GPU time
  // is limited per day (more if you add a free Hugging Face token in Settings).

  const GRADIO_URL = 'https://cdn.jsdelivr.net/npm/@gradio/client@2.7.2/dist/browser.js';
  const TOKEN_KEY = 'drape-hf-token';
  const space = () => cfg.tryOnSpace || 'yisol/IDM-VTON';

  // The token is kept only in this browser, never in your GitHub files or database.
  function getHfToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch (e) {
      return '';
    }
  }
  function setHfToken(t) {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  function friendlyAiError(err) {
    const m = String((err && err.message) || err || '');
    if (/quota/i.test(m)) return 'Today’s free AI time on Hugging Face is used up. Try again tomorrow, add a free Hugging Face token in Settings for more, or use Overlay instead.';
    if (/sleep|paused|building|starting/i.test(m)) return 'The free AI is waking up. Wait a minute and try again.';
    if (/runtime error|not found|404|could not resolve app config/i.test(m)) return `The free AI (${space()}) is not available right now. Try later or use Overlay.`;
    if (/fetch|network|connect/i.test(m)) return 'Could not reach Hugging Face. Check your internet connection and try again.';
    return `The free AI could not make this picture${m ? `: ${m}` : '.'}`;
  }

  let gradio = null;
  async function connectSpace(onStage) {
    if (!gradio) {
      try {
        gradio = await import(GRADIO_URL);
      } catch (e) {
        throw new Error('The AI connector could not be downloaded. Check your internet connection.');
      }
    }
    const token = getHfToken();
    try {
      return await gradio.Client.connect(space(), {
        ...(token ? { token } : {}),
        status_callback: (st) => {
          if (st && /sleep|building|starting/i.test(st.status || '')) onStage('The free AI is waking up (this can take a minute)…', 20);
        },
      });
    } catch (e) {
      throw new Error(friendlyAiError(e));
    }
  }

  async function asBlob(dataUrl) {
    return (await fetch(dataUrl)).blob();
  }

  /**
   * Puts a TOP on your photo with the free AI. Returns a JPEG data URL.
   * onStage(text, percent) reports progress. isCancelled() lets you stop.
   */
  async function aiTryOnTop(personDataUrl, garmentDataUrl, description, onStage, isCancelled) {
    onStage('Connecting to the free AI', 8);
    const client = await connectSpace(onStage);
    if (isCancelled()) throw new Error('Cancelled.');
    onStage('Sending your photos', 18);
    const job = client.submit('/tryon', [
      { background: await asBlob(personDataUrl), layers: [], composite: null },
      await asBlob(garmentDataUrl),
      description || 'top',
      true, // find the clothing area automatically
      true, // crop to the person automatically
      30, // quality steps
      42, // seed
    ]);
    let output = null;
    try {
      for await (const msg of job) {
        if (isCancelled()) {
          job.cancel && job.cancel();
          throw new Error('Cancelled.');
        }
        if (msg.type === 'status') {
          if (msg.stage === 'error') throw new Error(friendlyAiError(msg.message || 'error'));
          if (msg.stage === 'pending' && typeof msg.position === 'number' && msg.position > 0) onStage(`Waiting in the free queue (position ${msg.position + 1})`, 30);
          else if (msg.stage === 'pending' || msg.stage === 'generating') onStage('Generating your outfit', 55);
          if (msg.stage === 'complete' && output) break;
        }
        if (msg.type === 'data') {
          output = msg.data && msg.data[0];
          break;
        }
      }
    } catch (e) {
      if (/^Cancelled\.$|^The free AI|^Today|^Could not reach/.test(e.message)) throw e;
      throw new Error(friendlyAiError(e));
    }
    const url = output && (output.url || (typeof output === 'string' ? output : ''));
    if (!url) throw new Error('The free AI finished without a picture. Please try again.');
    onStage('Finalising your result', 90);
    let img;
    try {
      img = await loadImage(url);
    } catch (e) {
      throw new Error('The picture was made but could not be downloaded from Hugging Face. Please try again.');
    }
    return toJpeg(drawScaled(img, 1100), 0.88);
  }

  // -------------------------------------------- overlay (no AI, always free)

  /** Product picture with its white background made see-through (for overlay). */
  async function cutoutForOverlay(dataUrl) {
    const img = await loadImage(dataUrl);
    const c = drawScaled(img, 700);
    const ctx = c.getContext('2d');
    const { width: w, height: h } = c;
    const d = ctx.getImageData(0, 0, w, h);
    const px = d.data;
    const white = (i) => px[i * 4] > 238 && px[i * 4 + 1] > 238 && px[i * 4 + 2] > 238;
    // Flood-fill from the edges so white parts INSIDE the garment are kept.
    const seen = new Uint8Array(w * h);
    const stack = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const i = stack.pop();
      if (seen[i] || !white(i)) continue;
      seen[i] = 1;
      px[i * 4 + 3] = 0;
      const x = i % w;
      if (x > 0) stack.push(i - 1);
      if (x < w - 1) stack.push(i + 1);
      if (i >= w) stack.push(i - w);
      if (i < w * (h - 1)) stack.push(i + w);
    }
    // Trim to the garment.
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3]) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    ctx.putImageData(d, 0, 0);
    if (x1 < 0) return c;
    const out = canvas(x1 - x0 + 1, y1 - y0 + 1);
    out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }

  return {
    preparePhoto,
    productWithoutAi,
    removeBackground,
    extractClothes,
    aiTryOnTop,
    tryOnSpace: space,
    getHfToken,
    setHfToken,
    cutoutForOverlay,
    loadImage,
    toJpeg,
  };
})();
