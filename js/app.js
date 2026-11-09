/*
 * DRAPE app – screens and buttons.
 * ---------------------------------------------------------------
 * Plain JavaScript, no build step. Each screen has a "render…" function that
 * returns HTML. Buttons use  data-action="name"  and are handled in ACTIONS.
 *
 * Sections:  helpers · state · shell · auth · home · profile · wardrobe ·
 *            add clothes · extract · try-on · stylist · saved · settings
 */
(function () {
  const DATA = window.DRAPE_DATA;
  const STORE = window.DRAPE_STORE;
  const IMG = window.DRAPE_IMAGES;

  // =================================================================
  // helpers
  // =================================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const values = (obj) => Object.values(obj || {});
  const newest = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
  const subLabel = (id) => DATA.subcategoryLabel(id);
  const firstName = (n) => String(n || '').trim().split(/\s+/)[0];

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    shirt: '<path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
    sparkles: '<path d="M11 3c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6Z"/><path d="M19 14c.3 1.7.9 2.3 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.2 2.2-.8 2.5-2.5Z"/>',
    wand: '<path d="m3 21 12-12M14 4l1.5 1.5M18 8l1.5 1.5M17 3v2M21 7h-2M12 6l6 6"/>',
    bookmark: '<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.7 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    camera: '<path d="M3 8a2 2 0 0 1 2-2h2l2-3h6l2 3h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const HANGER = 'M32 26V21.5a5 5 0 1 0-5-5M32 26 9.5 42.2c-1.9 1.4-.9 3.8 1.4 3.8h42.2c2.3 0 3.3-2.4 1.4-3.8L32 26';
  const SPARKLE = 'M49 6.5c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5 4.1-.7 5.8-2.4 6.5-6.5Z';
  const logoMark = (size = 30, cls = '') => `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true"><g transform="translate(0 6)"><path class="hanger" d="${HANGER}" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path class="sparkle" d="${SPARKLE}" fill="#CDB98F"/></g></svg>`;
  const logo = (tagline = false) => `<span class="logo">${logoMark(30)}<span><span class="logo-word">DRAPE</span>${tagline ? '<span class="logo-tag">Your Wardrobe. Your Style. Your AI.</span>' : ''}</span></span>`;
  const loader = (text) => `<div class="loader">${logoMark(64, 'swing')}<p>${esc(text)}</p></div>`;

  /** <img> that loads its picture from the database when it appears. */
  const pic = (id, alt = '', cls = '') => (id ? `<img data-img="${esc(id)}" alt="${esc(alt)}" class="${cls}">` : `<span class="pic-empty ${cls}"></span>`);

  const imageCache = new Map();
  async function imageData(id) {
    if (!id) return '';
    if (imageCache.has(id)) return imageCache.get(id);
    const p = STORE.get(`images/${id}`).then((v) => v || '');
    imageCache.set(id, p);
    return p;
  }
  function hydrateImages(root = document) {
    root.querySelectorAll('img[data-img]:not([src])').forEach(async (el) => {
      const src = await imageData(el.dataset.img);
      if (src) el.src = src;
      else el.classList.add('missing');
    });
  }

  function toast(message, type = 'info') {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = message;
    box.appendChild(el);
    setTimeout(() => el.remove(), type === 'error' ? 7000 : 4000);
  }

  function openModal(title, body, footer = '') {
    $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon('x')}</button></div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
      </div>`;
    document.body.classList.add('no-scroll');
    hydrateImages($('#modal-root'));
  }
  function closeModal() {
    $('#modal-root').innerHTML = '';
    document.body.classList.remove('no-scroll');
  }

  function download(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function options(list, selected) {
    return list.map(([value, label]) => `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(label)}</option>`).join('');
  }
  const groupOptions = (sel) => options(DATA.GARMENT_GROUPS.map((g) => [g, DATA.GROUP_LABELS[g]]), sel);
  const subOptions = (group, sel) => options(DATA.SUBCATEGORIES[group].map((s) => [s.id, s.label]), sel);
  const colorOptions = (sel) => options(DATA.PALETTE.map((c) => [c.name, c.name]), sel);
  const patternOptions = (sel) => options(DATA.PATTERNS.map((p) => [p, DATA.PATTERN_LABELS[p]]), sel);
  const styleOptions = (sel) => options(DATA.STYLES.map((s) => [s, DATA.STYLE_LABELS[s]]), sel);

  // =================================================================
  // state
  // =================================================================
  const S = {
    user: null,
    mode: null,
    authView: 'login',
    ready: false,
    profile: {},
    photos: {},
    wardrobe: {},
    outfits: {},
    tryons: {},
    settings: {},
    filter: { group: '', q: '', fav: false },
    savedTab: 'outfits',
    savedFilter: { occasion: '', style: '', fav: false },
    addQueue: [],
    addHint: 'auto',
    addUseAi: true,
    extract: { busy: false, status: '', preview: '', items: [], notes: [], error: '' },
    tryon: { photoId: '', mode: 'separates', upperId: '', bottomId: '', onePieceId: '', method: 'ai', editing: false, ov: null, running: false, stage: '', pct: 0, cancelled: false, error: '', resultId: '', compare: 'off' },
    stylist: { occasion: 'office', style: 'smart-casual', colors: [], weather: '', result: null, busy: false },
  };
  let unwatch = [];

  const items = () => values(S.wardrobe).sort(newest);
  const photos = () => values(S.photos).sort(newest);
  const defaultPhoto = () => S.photos[S.profile.defaultPhotoId] || photos()[0] || null;
  const byGroup = (g) => items().filter((i) => i.group === g);

  function startWatching() {
    unwatch.forEach((f) => f());
    imageCache.clear();
    S.ready = false;
    let pending = 6;
    const done = () => {
      if (--pending === 0) S.ready = true;
    };
    const watch = (path, key) => {
      let first = true;
      return STORE.watch(path, (v) => {
        S[key] = v || {};
        if (first) {
          first = false;
          done();
        }
        renderMain();
      });
    };
    unwatch = [watch('profile', 'profile'), watch('photos', 'photos'), watch('wardrobe', 'wardrobe'), watch('outfits', 'outfits'), watch('tryons', 'tryons'), watch('settings', 'settings')];
  }

  // =================================================================
  // shell & routing
  // =================================================================
  const NAV = [
    ['home', 'Home', 'home'],
    ['profile', 'My Profile', 'user'],
    ['wardrobe', 'My Wardrobe', 'shirt'],
    ['extract', 'Extract Clothes', 'scan'],
    ['tryon', 'Virtual Try-On', 'sparkles'],
    ['stylist', 'AI Stylist', 'wand'],
    ['saved', 'Saved Outfits', 'bookmark'],
    ['settings', 'Settings', 'settings'],
  ];
  const screen = () => {
    const s = location.hash.replace(/^#\/?/, '').split('?')[0];
    return NAV.some((n) => n[0] === s) ? s : 'home';
  };
  const go = (s) => {
    if (location.hash === `#/${s}`) renderMain();
    else location.hash = `#/${s}`;
  };

  function renderApp() {
    const app = $('#app');
    if (!S.user) {
      app.innerHTML = renderAuth();
      return;
    }
    const cur = screen();
    const navLinks = NAV.map(([id, label, ic]) => `<a href="#/${id}" class="nav-link ${cur === id ? 'active' : ''}">${icon(ic)}<span>${label}</span></a>`).join('');
    const bottom = (id, label, ic) => `<a href="#/${id}" class="bn ${cur === id ? 'active' : ''}">${icon(ic)}<span>${label}</span></a>`;
    app.innerHTML = `
      <aside class="sidebar">
        <a href="#/home" class="side-logo">${logo(true)}</a>
        <nav class="side-nav" aria-label="Main">${navLinks}</nav>
        <div class="side-user">
          <span class="avatar" data-avatar></span>
          <span class="side-user-text"><strong data-username></strong><small>${esc(S.user.email)}</small></span>
          <button class="icon-btn" data-action="sign-out" aria-label="Log out" title="Log out">${icon('logout')}</button>
        </div>
      </aside>
      <header class="topbar">
        <a href="#/home" class="top-logo">${logoMark(26)}<span class="logo-word">DRAPE</span></a>
        <a href="#/profile" class="avatar" aria-label="My profile" data-avatar></a>
      </header>
      <div id="banners">${renderBanners()}</div>
      <main id="main" class="main"></main>
      <nav class="bottomnav" aria-label="Main">
        ${bottom('home', 'Home', 'home')}
        ${bottom('wardrobe', 'Wardrobe', 'shirt')}
        <a href="#/tryon" class="bn-center ${cur === 'tryon' ? 'active' : ''}" aria-label="Virtual Try-On">${icon('sparkles')}</a>
        ${bottom('saved', 'Saved', 'bookmark')}
        <button class="bn ${['profile', 'extract', 'stylist', 'settings'].includes(cur) ? 'active' : ''}" data-action="more">${icon('menu')}<span>More</span></button>
      </nav>`;
    renderMain();
  }

  function renderBanners() {
    const out = [];
    if (S.mode === 'demo') out.push(`<div class="banner">Demo mode: nothing is saved when you close this tab. <a href="#" data-action="sign-out">Create an account</a> to keep your wardrobe.</div>`);
    if (S.mode === 'firebase' && S.user && S.user.provider === 'password' && !S.user.emailVerified) {
      out.push(`<div class="banner">Please verify your email (we sent a link to ${esc(S.user.email)}). <a href="#" data-action="resend-verify">Resend</a> · <a href="#" data-action="refresh-user">I’ve verified</a></div>`);
    }
    return out.join('');
  }

  const SCREENS = {};
  function renderMain() {
    const main = $('#main');
    if (!main) return;
    const cur = screen();
    document.querySelectorAll('.nav-link, .bn, .bn-center').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#/${cur}`));
    const b = $('#banners');
    if (b) b.innerHTML = renderBanners();
    main.innerHTML = S.ready ? SCREENS[cur]() : loader('Opening your wardrobe…');
    hydrateImages(main);
    // Your photo and name in the menu bar.
    const dp = defaultPhoto();
    document.querySelectorAll('[data-avatar]').forEach((el) => {
      if (el.dataset.shown !== String(dp && dp.id)) {
        el.dataset.shown = String(dp && dp.id);
        el.innerHTML = dp ? pic(dp.id, '') : icon('user');
        hydrateImages(el);
      }
    });
    document.querySelectorAll('[data-username]').forEach((el) => (el.textContent = S.profile.name || S.user.name || 'You'));
    if (cur === 'wardrobe') renderWardrobeGrid();
    if (cur === 'tryon' && S.tryon.editing) initOverlay();
  }

  window.addEventListener('hashchange', () => {
    closeModal();
    renderMain();
    window.scrollTo(0, 0);
  });

  // =================================================================
  // auth screens
  // =================================================================
  function renderAuth() {
    const v = S.authView;
    const notConnected = !STORE.filledIn
      ? `<div class="note">Firebase isn’t connected yet, so accounts can’t be created. Fill in <code>js/config.js</code> (see README, step 2). Meanwhile you can try the demo.</div>`
      : STORE.firebaseError
        ? `<div class="note error">Firebase could not start: ${esc(STORE.firebaseError)}</div>`
        : '';
    const fileNote = STORE.fromFile && STORE.filledIn ? `<div class="note">You opened DRAPE from a file on your computer. Signing in works best from your website link (GitHub Pages). The demo works here.</div>` : '';
    const canAuth = STORE.firebaseReady;
    const head = { login: ['Welcome back', 'Log in to your wardrobe.'], signup: ['Create your closet', 'Your photos and outfits stay private to your account.'], forgot: ['Reset your password', 'We’ll email you a reset link.'] }[v];
    const form =
      v === 'login'
        ? `<form data-form="login" class="stack">
            <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
            <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
            <div class="row-end"><a href="#" data-action="auth-view" data-view="forgot">Forgot password?</a></div>
            <button class="btn btn-primary btn-block" ${canAuth ? '' : 'disabled'}>Log in</button>
          </form>`
        : v === 'signup'
          ? `<form data-form="signup" class="stack">
              <label class="field"><span>Your name</span><input name="name" autocomplete="name" maxlength="60"></label>
              <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
              <label class="field"><span>Password</span><input name="password" type="password" autocomplete="new-password" minlength="8" required><small>At least 8 characters.</small></label>
              <button class="btn btn-primary btn-block" ${canAuth ? '' : 'disabled'}>Create account</button>
            </form>`
          : `<form data-form="forgot" class="stack">
              <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
              <button class="btn btn-primary btn-block" ${canAuth ? '' : 'disabled'}>Send reset link</button>
            </form>`;
    const switcher =
      v === 'login'
        ? `New to DRAPE? <a href="#" data-action="auth-view" data-view="signup">Create an account</a>`
        : `Already have an account? <a href="#" data-action="auth-view" data-view="login">Log in</a>`;
    return `<div class="auth">
      <section class="auth-form">
        <div>${logo()}</div>
        <div class="auth-inner">
          <h1>${head[0]}</h1>
          <p class="muted">${head[1]}</p>
          ${notConnected}${fileNote}
          <div id="auth-error"></div>
          ${form}
          ${v !== 'forgot' ? `<div class="or"><span>or</span></div>
            <button class="btn btn-secondary btn-block" data-action="google" ${canAuth ? '' : 'disabled'}>${googleIcon()} Continue with Google</button>` : ''}
          <button class="btn btn-ghost btn-block" data-action="demo">Try the demo without an account</button>
          <p class="center muted small">${switcher}</p>
        </div>
      </section>
      <section class="auth-art" aria-hidden="true">
        <div class="arch art-arch">${railArt()}</div>
        <p class="auth-quote">Dress from what you already own.</p>
      </section>
    </div>`;
  }

  function googleIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/></svg>`;
  }

  function railArt() {
    const shirt = (fill) => `<svg viewBox="0 0 120 150" class="rail-item"><g transform="translate(28 -4)"><path d="${HANGER}" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/></g><path d="M42 34 60 42l18-8 24 12 12 32-16 6-6-14v78H28V70l-6 14-16-6 12-32Z" fill="${fill}" stroke="#000" stroke-width="2" stroke-linejoin="round"/><path d="M42 34 52 54l8-12 8 12 10-20M60 42v106" stroke="#000" stroke-width="1.5" fill="none"/></svg>`;
    const trousers = `<svg viewBox="0 0 120 170" class="rail-item rail-trousers"><g transform="translate(28 -6)"><path d="${HANGER}" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/></g><path d="M30 40h60l8 124H70L60 80l-10 84H22Z" fill="#E2D8C7" stroke="#000" stroke-width="2" stroke-linejoin="round"/><path d="M30 52h60M60 52v28" stroke="#000" stroke-width="1.5"/></svg>`;
    return `<div class="rail"><div class="rail-bar"></div><div class="rail-items">${shirt('#fff')}${trousers}${shirt('#CDB98F')}</div></div>`;
  }

  // =================================================================
  // HOME
  // =================================================================
  SCREENS.home = () => {
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const name = firstName(S.profile.name || S.user.name) || 'there';
    const all = items();
    const dp = defaultPhoto();
    const tryons = values(S.tryons).sort(newest);
    const steps = [
      [Boolean(dp), 'Add a full-body photo of yourself', 'profile'],
      [byGroup('upperWear').length > 0 && byGroup('bottomWear').length > 0, 'Add at least one top and one bottom', 'wardrobe'],
      [tryons.length > 0, 'Generate your first look', 'tryon'],
    ];
    const occasion = [0, 6].includes(new Date().getDay()) ? 'casual' : 'office';
    const picks = DATA.suggestOutfitsByRules(all, { occasion, style: occasion === 'office' ? 'smart-casual' : 'casual', count: 3 });
    return `
      <section class="hero">
        <div>
          <p class="muted">${greet},</p>
          <h1 class="hero-name">${esc(name)}.</h1>
          <p class="lead">${all.length ? 'Pick a few pieces you own and see them on you before you get dressed.' : 'Start by photographing a few favourite pieces. Your closet builds itself from there.'}</p>
          <div class="btn-row">
            <a href="#/tryon" class="btn btn-primary btn-lg">${icon('sparkles')} Let’s Find Your Look</a>
            <a href="#/extract" class="btn btn-secondary btn-lg">${icon('scan')} Extract clothes</a>
          </div>
        </div>
        <a href="#/profile" class="arch hero-photo">${dp ? pic(dp.id, 'Your photo') : '<span class="arch-empty">Add your photo to see outfits on you</span>'}</a>
      </section>

      ${steps.some((s) => !s[0]) ? `<section class="panel pad"><h2>Get started in three steps</h2><ol class="steps">${steps.map(([done, label, to], i) => `<li><a href="#/${to}" class="step ${done ? 'done' : ''}"><span class="step-num">${done ? icon('check') : i + 1}</span>${label}</a></li>`).join('')}</ol></section>` : ''}

      <section class="ledger" aria-label="Your closet at a glance">
        <a href="#/wardrobe"><small>Wardrobe items</small><strong>${all.length}</strong></a>
        <a href="#/wardrobe" data-action="filter-group" data-group="upperWear"><small>Upper wear</small><strong>${byGroup('upperWear').length}</strong></a>
        <a href="#/wardrobe" data-action="filter-group" data-group="bottomWear"><small>Bottom wear</small><strong>${byGroup('bottomWear').length}</strong></a>
        <a href="#/saved"><small>Saved outfits</small><strong>${values(S.outfits).length}</strong></a>
      </section>

      <section class="quick">
        <a href="#/tryon" class="quick-card dark">${icon('sparkles')}<span><strong>Virtual Try-On</strong><small>See any top and bottom from your closet on you.</small></span></a>
        <a href="#/extract" class="quick-card">${icon('scan')}<span><strong>Extract Clothes</strong><small>Turn a photo of an outfit into separate wardrobe items.</small></span></a>
      </section>

      <section>
        <div class="section-head"><h2>Today’s picks</h2><a href="#/stylist" class="link">${icon('wand')} AI Stylist</a></div>
        ${picks.length ? `<div class="hscroll">${picks.map((p) => outfitPickCard(p)).join('')}</div>` : `<p class="note">Add at least one top and one bottom to get outfit ideas. <a href="#/wardrobe">Add clothes</a></p>`}
      </section>

      ${all.length ? `<section><div class="section-head"><h2>Recently added</h2><a href="#/wardrobe" class="link">View wardrobe</a></div><div class="hscroll">${all.slice(0, 10).map((i) => `<div class="hs-item">${garmentCard(i)}</div>`).join('')}</div></section>` : ''}
      ${tryons.length ? `<section><div class="section-head"><h2>Recently generated</h2><a href="#/saved" data-action="saved-tab" data-tab="history" class="link">All results</a></div><div class="hscroll">${tryons.slice(0, 8).map((t) => `<button class="result-thumb" data-action="open-tryon-result" data-id="${t.id}">${pic(t.id, 'Generated outfit')}</button>`).join('')}</div></section>` : ''}`;
  };

  function outfitPickCard(p) {
    return `<div class="panel pad pick">
      <div class="pieces">${[p.onePieceId, p.upperId, p.bottomId].filter(Boolean).map((id) => `<span class="tile sm">${pic(id, '')}</span>`).join('')}</div>
      <p class="strong">${esc(p.title)}</p>
      <p class="muted small">${esc(p.reason)}</p>
      <button class="btn btn-primary btn-sm" data-action="try-outfit" data-upper="${p.upperId || ''}" data-bottom="${p.bottomId || ''}" data-one="${p.onePieceId || ''}">${icon('sparkles')} Try this outfit</button>
    </div>`;
  }

  function garmentCard(i, action = 'open-item') {
    return `<button class="garment" data-action="${action}" data-id="${i.id}">
      <span class="tile">${pic(i.id, i.name)}${i.favorite ? `<span class="fav">${icon('heart')}</span>` : ''}</span>
      <span class="g-name">${esc(i.name)}</span>
      <span class="g-meta"><span class="dot" style="background:${esc(i.color && i.color.hex)}"></span>${esc(subLabel(i.subcategory))}</span>
    </button>`;
  }

  // =================================================================
  // MY PROFILE
  // =================================================================
  SCREENS.profile = () => {
    const list = photos();
    const dp = defaultPhoto();
    return `
      <header class="page-head"><div><h1>My Profile</h1><p class="lead">Your photos are your digital model. DRAPE dresses the photo, it never reshapes you.</p></div></header>
      <div class="two-col">
        <section>
          <div class="section-head"><h2>Try-on photos</h2>
            <div class="btn-row">
              <label class="btn btn-primary">${icon('image')} Add photo<input type="file" accept="image/*" hidden data-change="photo-file"></label>
              <label class="btn btn-secondary">${icon('camera')} Take photo<input type="file" accept="image/*" capture="user" hidden data-change="photo-file"></label>
            </div>
          </div>
          ${
            list.length
              ? `<div class="photo-grid">${list
                  .map(
                    (p) => `<div class="photo-card">
                  <div class="arch ${dp && dp.id === p.id ? 'selected' : ''}">${pic(p.id, 'Your photo')}${dp && dp.id === p.id ? '<span class="badge">Try-on photo</span>' : ''}</div>
                  ${p.tips && p.tips.length ? `<p class="warn small">${icon('alert')} ${esc(p.tips[0])}</p>` : `<p class="ok small">${icon('check')} Looks good for try-on</p>`}
                  <div class="btn-row">
                    ${dp && dp.id === p.id ? '' : `<button class="btn btn-secondary btn-sm" data-action="default-photo" data-id="${p.id}">Use for try-on</button>`}
                    <button class="icon-btn danger" data-action="delete-photo" data-id="${p.id}" aria-label="Delete photo">${icon('trash')}</button>
                  </div>
                </div>`,
                  )
                  .join('')}</div>`
              : `<div class="panel empty"><div class="arch empty-arch"></div><h2>Add your first photo</h2><p class="muted">A clear, full-body photo of you is all virtual try-on needs.</p></div>`
          }
        </section>
        <aside class="stack">
          <div class="panel pad">
            <h3>What makes a great photo</h3>
            <ul class="ticks">
              <li>Head to toe in the frame, standing straight</li>
              <li>Facing the camera, arms relaxed by your sides</li>
              <li>Fitted, simple clothes</li>
              <li>Bright, even light and a plain background</li>
              <li>Just you in the photo</li>
            </ul>
          </div>
          <form class="panel pad stack" data-form="profile-name">
            <h3>Your details</h3>
            <label class="field"><span>Display name</span><input name="name" maxlength="60" value="${esc(S.profile.name || '')}"></label>
            <p class="muted small">${esc(S.user.email)}</p>
            <button class="btn btn-secondary btn-sm">Save name</button>
          </form>
        </aside>
      </div>`;
  };

  let pendingPhoto = null;
  async function showPhotoPreview(file, rotate = 0) {
    try {
      pendingPhoto = { file, rotate, prepared: await IMG.preparePhoto(file, rotate) };
    } catch (err) {
      toast(err.message, 'error');
      return;
    }
    const p = pendingPhoto.prepared;
    openModal(
      'Check your photo',
      `<div class="preview-wrap"><img src="${p.dataUrl}" alt="Preview" class="preview-img"></div>
       ${p.check.length ? `<div class="note warn">${p.check.map(esc).join('<br>')}</div>` : '<div class="note ok">This photo looks good.</div>'}
       <div class="btn-row center"><button class="btn btn-secondary btn-sm" data-action="rotate-photo" data-dir="-90">${icon('rotate', 'flip')} Rotate left</button><button class="btn btn-secondary btn-sm" data-action="rotate-photo" data-dir="90">${icon('rotate')} Rotate right</button></div>
       <p class="muted small center">Location data is removed before saving.</p>`,
      `<button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-photo">Save photo</button>`,
    );
  }

  // =================================================================
  // MY WARDROBE
  // =================================================================
  SCREENS.wardrobe = () => {
    const all = items();
    const counts = {};
    all.forEach((i) => (counts[i.group] = (counts[i.group] || 0) + 1));
    const chip = (g, label, n) => `<button class="chip ${S.filter.group === g ? 'on' : ''}" data-action="filter-group" data-group="${g}">${label} <span class="dim">${n}</span></button>`;
    return `
      <header class="page-head">
        <div><h1>My Wardrobe</h1><p class="lead">${all.length} ${all.length === 1 ? 'piece' : 'pieces'} in your closet.</p></div>
        <div class="btn-row"><a href="#/extract" class="btn btn-secondary">${icon('scan')} Extract from photo</a><button class="btn btn-primary" data-action="add-clothes">${icon('plus')} Add clothes</button></div>
      </header>
      ${S.addQueue.some((q) => q.status !== 'saved') ? `<button class="panel queue-pill" data-action="add-clothes">${logoMark(32, 'swing')}<span><strong>${S.addQueue.filter((q) => q.status === 'working').length ? 'Processing your photos…' : 'Items ready to review'}</strong><small>Tap to review and save</small></span></button>` : ''}
      <div class="chips">${chip('', 'All', all.length)}${DATA.GARMENT_GROUPS.map((g) => chip(g, DATA.GROUP_LABELS[g], counts[g] || 0)).join('')}</div>
      <div class="toolbar">
        <input type="search" class="input grow" placeholder="Search name, colour, brand" value="${esc(S.filter.q)}" data-input="wardrobe-search" aria-label="Search wardrobe">
        <button class="chip ${S.filter.fav ? 'on' : ''}" data-action="filter-fav">${icon('heart')} Favourites</button>
      </div>
      <div id="wardrobe-grid"></div>`;
  };

  function renderWardrobeGrid() {
    const box = $('#wardrobe-grid');
    if (!box) return;
    const q = S.filter.q.trim().toLowerCase();
    const all = items();
    const list = all.filter(
      (i) => (!S.filter.group || i.group === S.filter.group) && (!S.filter.fav || i.favorite) && (!q || [i.name, i.color && i.color.name, i.brand, i.notes].some((s) => String(s || '').toLowerCase().includes(q))),
    );
    box.innerHTML = !all.length
      ? `<div class="panel empty">${railArt()}<h2>Your closet is empty</h2><p class="muted">Photograph a few favourite tops and bottoms. DRAPE turns each one into a clean product picture.</p><div class="btn-row center"><button class="btn btn-primary" data-action="add-clothes">${icon('plus')} Add clothes</button><a href="#/extract" class="btn btn-secondary">${icon('scan')} Extract from a photo</a></div></div>`
      : !list.length
        ? `<div class="empty"><h2>Nothing matches</h2><p class="muted">Try another search or category.</p></div>`
        : `<div class="grid">${list.map((i) => garmentCard(i)).join('')}</div>`;
    hydrateImages(box);
  }

  function itemForm(f, prefix = '') {
    return `<div class="form-grid" data-item-form="${prefix}">
      <label class="field span2"><span>Name</span><input name="name" maxlength="80" value="${esc(f.name)}"></label>
      <label class="field"><span>Category</span><select name="group" data-change="group-select">${groupOptions(f.group)}</select></label>
      <label class="field"><span>Type</span><select name="subcategory">${subOptions(f.group, f.subcategory)}</select></label>
      <label class="field"><span>Colour</span><select name="color">${colorOptions(f.color && f.color.name)}</select></label>
      <label class="field"><span>Pattern</span><select name="pattern">${patternOptions(f.pattern)}</select></label>
      <label class="field"><span>Style</span><select name="style">${styleOptions(f.style)}</select></label>
      <label class="field"><span>Brand (optional)</span><input name="brand" maxlength="60" value="${esc(f.brand || '')}"></label>
      <label class="field span2"><span>Notes (optional)</span><textarea name="notes" maxlength="500" rows="2">${esc(f.notes || '')}</textarea></label>
    </div>`;
  }

  function readItemForm(root, base) {
    const get = (n) => (root.querySelector(`[name="${n}"]`) || {}).value || '';
    const colorName = get('color');
    const keepHex = base.color && base.color.name === colorName ? base.color.hex : (DATA.paletteByName(colorName) || {}).hex || '#8A8C8F';
    return {
      ...base,
      name: get('name').trim() || 'Untitled garment',
      group: get('group'),
      subcategory: get('subcategory'),
      color: { name: colorName, hex: keepHex },
      pattern: get('pattern'),
      style: get('style'),
      brand: get('brand').trim(),
      notes: get('notes').trim(),
    };
  }

  function openItem(id) {
    const i = S.wardrobe[id];
    if (!i) return;
    const tryable = DATA.TRY_ON_GROUPS.includes(i.group);
    openModal(
      i.name,
      `<div class="detail"><span class="tile big">${pic(i.id, i.name)}</span><div id="item-edit" data-id="${i.id}">${itemForm(i)}</div></div>`,
      `${tryable ? `<button class="btn btn-primary" data-action="try-item" data-id="${i.id}">${icon('sparkles')} Try it on</button>` : ''}
       <button class="btn btn-secondary" data-action="save-item" data-id="${i.id}">Save changes</button>
       <button class="icon-btn" data-action="fav-item" data-id="${i.id}" aria-label="Favourite">${icon('heart', i.favorite ? 'filled' : '')}</button>
       <button class="icon-btn danger" data-action="delete-item" data-id="${i.id}" aria-label="Delete">${icon('trash')}</button>`,
    );
  }

  // ------------------------------------------------------- add clothes
  function openAddClothes() {
    openModal(
      'Add clothes',
      `<div class="note">Lay each garment flat or hang it against a plain wall, one garment per photo. DRAPE’s AI removes the background, then straightens it, evens out the light and places it on a clean white background with a soft shadow, like a shop’s product photo. You can choose several photos at once.</div>
       <div class="form-grid">
         <label class="field"><span>What are you adding?</span><select data-change="add-hint"><option value="auto">Let DRAPE decide</option>${groupOptions(S.addHint)}</select></label>
         <label class="check"><input type="checkbox" data-change="add-useai" ${S.addUseAi ? 'checked' : ''}> Remove the background with AI (recommended)</label>
       </div>
       <div class="btn-row">
         <label class="btn btn-primary">${icon('image')} Choose photos<input type="file" accept="image/*" multiple hidden data-change="add-files"></label>
         <label class="btn btn-secondary">${icon('camera')} Take photo<input type="file" accept="image/*" capture="environment" hidden data-change="add-files"></label>
       </div>
       <p class="muted small">The first time, your browser downloads the free AI model (about 40 MB). After that it’s quick, and your photos never leave your device for this step.</p>
       <div id="add-queue"></div>`,
    );
    renderAddQueue();
  }

  function renderAddQueue() {
    const box = $('#add-queue');
    if (!box) return;
    const q = S.addQueue;
    box.innerHTML = q.length
      ? `<div class="section-head"><h3>${q.filter((e) => e.status === 'review').length} ready to review</h3>${q.filter((e) => e.status === 'review').length > 1 ? '<button class="btn btn-primary btn-sm" data-action="save-all-queue">Save all</button>' : ''}</div>
         <div class="stack">${q.map(queueCard).join('')}</div>`
      : '';
  }

  function queueCard(e) {
    if (e.status === 'working' || e.status === 'waiting') {
      return `<div class="panel q-card"><img src="${e.preview}" alt="" class="q-thumb dim"><div class="q-body">${e.status === 'working' ? logoMark(36, 'swing') : ''}<p class="strong">${esc(e.status === 'working' ? e.stage : 'Waiting…')}</p></div></div>`;
    }
    if (e.status === 'failed') {
      return `<div class="panel q-card"><img src="${e.preview}" alt="" class="q-thumb"><div class="q-body"><p class="error strong">${icon('alert')} Couldn’t process this photo</p><p class="muted small">${esc(e.error)}</p>
        <div class="btn-row"><button class="btn btn-secondary btn-sm" data-action="queue-plain" data-id="${e.id}">Use the photo as it is</button><button class="btn btn-secondary btn-sm" data-action="queue-retry" data-id="${e.id}">Try again</button><button class="icon-btn" data-action="queue-remove" data-id="${e.id}" aria-label="Remove">${icon('trash')}</button></div></div></div>`;
    }
    if (e.status === 'saved') return `<div class="panel q-card"><img src="${e.image}" alt="" class="q-thumb"><div class="q-body"><p class="ok strong">${icon('check')} Added to your wardrobe</p></div></div>`;
    return `<div class="panel q-card review" data-q="${e.id}">
      <img src="${e.image}" alt="Product picture" class="q-thumb product">
      <div class="q-body">
        ${e.warnings.map((w) => `<p class="warn small">${icon('alert')} ${esc(w)}</p>`).join('')}
        ${itemForm(e.fields, e.id)}
        <div class="btn-row"><button class="btn btn-primary btn-sm" data-action="queue-save" data-id="${e.id}">Save to wardrobe</button><button class="btn btn-ghost btn-sm" data-action="queue-remove" data-id="${e.id}">Discard</button></div>
      </div>
    </div>`;
  }

  // A sensible starting point you can correct before saving.
  const DEFAULT_TYPE = { upperWear: 'top', bottomWear: 'formal-trousers' };
  function defaultFields(group, color, subId) {
    const g = DATA.GARMENT_GROUPS.includes(group) ? group : 'upperWear';
    const list = DATA.SUBCATEGORIES[g];
    const sub = list.find((x) => x.id === subId) || list.find((x) => x.id === DEFAULT_TYPE[g]) || list[0];
    return { name: `${color.name} ${sub.label.toLowerCase()}`, group: g, subcategory: sub.id, color, pattern: 'solid', style: 'casual', brand: '', notes: '' };
  }

  async function processQueueEntry(e, plain = false) {
    e.status = 'working';
    e.stage = 'Preparing…';
    e.error = '';
    renderAddQueue();
    try {
      const product = plain || !e.useAi ? await IMG.productWithoutAi(e.file) : await IMG.removeBackground(e.file, (t) => ((e.stage = t), renderAddQueue()));
      e.image = product.dataUrl;
      e.warnings = plain ? ['Background kept as in your photo.'] : [];
      e.fields = defaultFields(e.hint === 'auto' ? 'upperWear' : e.hint, product.color);
      if (IMG.getGeminiKey() && S.settings.aiConsent) {
        e.stage = 'Gemini is writing the product details…';
        renderAddQueue();
        try {
          const tag = await IMG.tagGarment(product.dataUrl, e.hint === 'auto' ? '' : e.hint);
          const f = e.fields;
          if (tag.group && (e.hint === 'auto' || tag.group === e.hint)) {
            f.group = tag.group;
            f.subcategory = tag.subcategory;
          }
          if (tag.name) f.name = tag.name;
          if (tag.color) f.color = tag.color;
          if (tag.pattern) f.pattern = tag.pattern;
          if (tag.style) f.style = tag.style;
          if (!tag.isGarment) e.warnings.push('Gemini isn’t sure this is clothing. Please check.');
        } catch (err) {
          e.warnings.push(`${err.message} Please check the details below.`);
        }
      } else if (e.hint === 'auto') {
        e.warnings.push(IMG.getGeminiKey() ? 'Gemini is set up, but AI permission is off in Settings. Please check the category below.' : 'Please check the category below.');
      }
      e.status = 'review';
    } catch (err) {
      e.status = 'failed';
      e.error = err.message || 'Something went wrong.';
    }
    renderAddQueue();
    if ($('#wardrobe-grid')) renderMain();
  }

  async function runQueue() {
    if (runQueue.busy) return;
    runQueue.busy = true;
    try {
      let next;
      while ((next = S.addQueue.find((e) => e.status === 'waiting'))) await processQueueEntry(next);
    } finally {
      runQueue.busy = false;
    }
  }

  async function saveQueueEntry(id) {
    const e = S.addQueue.find((x) => x.id === id);
    if (!e || e.status !== 'review') return false;
    const card = document.querySelector(`[data-q="${id}"]`);
    if (card) e.fields = readItemForm(card, e.fields);
    const itemId = STORE.newId();
    const item = { id: itemId, ...e.fields, photoType: e.warnings.some((w) => w.startsWith('Background kept')) ? 'model' : 'flat-lay', source: 'upload', favorite: false, createdAt: Date.now() };
    try {
      await STORE.update({ [`wardrobe/${itemId}`]: item, [`images/${itemId}`]: e.image });
      imageCache.set(itemId, Promise.resolve(e.image));
      e.status = 'saved';
      renderAddQueue();
      setTimeout(() => {
        S.addQueue = S.addQueue.filter((x) => x !== e);
        renderAddQueue();
        renderMain();
      }, 1200);
      return true;
    } catch (err) {
      toast(STORE.niceError(err), 'error');
      return false;
    }
  }

  // =================================================================
  // EXTRACT CLOTHES
  // =================================================================
  SCREENS.extract = () => {
    const x = S.extract;
    return `
      <header class="page-head"><div><h1>Extract Clothes</h1><p class="lead">Upload a photo of someone wearing an outfit. DRAPE finds each garment and turns it into its own product picture.</p></div></header>
      <div class="two-col reverse">
        <section class="stack">
          <div class="panel">
            <div class="extract-preview">${x.preview ? `<img src="${x.preview}" alt="Your photo">` : `<div class="center muted pad">${icon('scan', 'big')}<p>A clear, well-lit photo where the whole outfit is visible works best.</p></div>`}</div>
            <div class="pad btn-row">
              <label class="btn btn-primary ${x.busy ? 'disabled' : ''}">${icon('image')} ${x.preview ? 'Use another photo' : 'Upload photo'}<input type="file" accept="image/*" hidden data-change="extract-file" ${x.busy ? 'disabled' : ''}></label>
              <label class="btn btn-secondary ${x.busy ? 'disabled' : ''}">${icon('camera')} Take photo<input type="file" accept="image/*" capture="environment" hidden data-change="extract-file" ${x.busy ? 'disabled' : ''}></label>
            </div>
          </div>
          <div class="note"><strong>What to expect.</strong> Tops, bottoms, dresses and shoes are separated pixel by pixel, not just cropped. Parts hidden by arms, hair or bags can’t be recovered. Everything runs in your browser, so your photo stays on your device.</div>
        </section>
        <section id="extract-results">
          ${
            x.busy
              ? `<div class="panel">${loader(x.status || 'Working…')}</div>`
              : x.error
                ? `<div class="panel pad"><p class="error strong">${icon('alert')} We couldn’t extract clothes from this photo</p><p class="muted">${esc(x.error)}</p></div>`
                : x.items.length
                  ? `<div class="section-head"><div><h2>We found ${x.items.filter((i) => !i.removed).length} ${x.items.length === 1 ? 'garment' : 'garments'}</h2><p class="muted small">Choose the ones to keep.</p></div><button class="btn btn-primary" data-action="extract-add-selected">${icon('plus')} Add selected</button></div>
                     ${x.notes.map((n) => `<p class="note">${esc(n)}</p>`).join('')}
                     <div class="grid wide">${x.items.filter((i) => !i.removed).map(extractCard).join('')}</div>`
                  : `<div class="panel empty">${icon('scan', 'big')}<h2>Your extracted garments appear here</h2><p class="muted">Each garment gets its own card with its category and colour.</p></div>`
          }
        </section>
      </div>`;
  };

  function extractCard(i) {
    return `<div class="panel x-card ${i.selected && !i.saved ? 'selected' : ''}" data-x="${i.id}">
      <button class="tile" data-action="extract-toggle" data-id="${i.id}" aria-pressed="${i.selected}"><img src="${i.image}" alt="${esc(i.title)}"><span class="tick ${i.selected || i.saved ? 'on' : ''}">${icon('check')}</span></button>
      <div class="pad-sm stack-sm">
        <p class="strong">${esc(i.title)}</p>
        <p class="g-meta"><span class="dot" style="background:${esc(i.color.hex)}"></span>${esc(i.color.name)}, ${esc(subLabel(i.subcategory).toLowerCase())}</p>
        ${i.warnings.map((w) => `<p class="warn small">${icon('alert')} ${esc(w)}</p>`).join('')}
        ${
          i.saved
            ? `<p class="ok strong">${icon('check')} In your wardrobe</p>`
            : `<div class="btn-row"><button class="btn btn-primary btn-sm" data-action="extract-add" data-id="${i.id}">Add to wardrobe</button><button class="icon-btn" data-action="extract-edit" data-id="${i.id}" aria-label="Edit">${icon('edit')}</button><button class="icon-btn danger" data-action="extract-remove" data-id="${i.id}" aria-label="Delete">${icon('trash')}</button></div>`
        }
      </div>
    </div>`;
  }

  async function saveExtracted(i) {
    const id = STORE.newId();
    const f = i.fields || defaultFields(i.group, i.color, i.subcategory);
    const item = { id, ...f, photoType: 'model', source: 'extract', favorite: false, createdAt: Date.now() };
    await STORE.update({ [`wardrobe/${id}`]: item, [`images/${id}`]: i.image });
    imageCache.set(id, Promise.resolve(i.image));
    i.saved = true;
  }

  // =================================================================
  // VIRTUAL TRY-ON
  // =================================================================
  SCREENS.tryon = () => {
    const t = S.tryon;
    const ai = t.method === 'ai';
    const dp = S.photos[t.photoId] || defaultPhoto();
    const it = (id) => (id ? S.wardrobe[id] : null);
    const slot = (label, group, item) => `<div class="slot">
      <button class="tile slot-tile" data-action="pick" data-group="${group}" aria-label="Choose ${label}">${item ? pic(item.id, item.name) : `<span class="slot-plus">${icon('plus')}</span>`}</button>
      <div><small class="muted">${label}</small><p class="strong">${item ? esc(item.name) : 'Not selected'}</p>${item ? `<p class="g-meta"><span class="dot" style="background:${esc(item.color.hex)}"></span>${esc(subLabel(item.subcategory))}</p>` : ''}
        <div class="links"><button class="link" data-action="pick" data-group="${group}">${item ? 'Replace' : 'Choose'}</button>${item ? `<button class="link muted" data-action="unpick" data-group="${group}">Remove</button>` : ''}</div></div>
    </div>`;
    const chosen = t.mode === 'onePiece' ? Boolean(it(t.onePieceId)) : Boolean(it(t.upperId) || it(t.bottomId));
    const runs = t.mode === 'onePiece' ? 1 : Number(Boolean(it(t.upperId))) + Number(Boolean(it(t.bottomId)));
    let blocker = '';
    if (!dp) blocker = 'Add a photo of yourself first (My Profile).';
    else if (!chosen) blocker = t.mode === 'onePiece' ? 'Choose a one-piece.' : 'Choose a top, a bottom, or both.';
    const result = t.resultId ? S.tryons[t.resultId] : null;
    const history = values(S.tryons).sort(newest);
    const prev = result ? history.find((h) => h.id !== result.id) : null;
    const methodTag = (r) => `<span class="tag ${r.method === 'overlay' ? '' : 'gold'}">${r.method === 'overlay' ? 'Overlay (not AI)' : 'Free AI'}</span>`;
    let right;
    if (t.running) {
      right = `${loader(t.stage || 'Starting…')}<div class="progress"><span style="width:${Math.max(4, t.pct)}%"></span></div><p class="muted small center pad-sm">Free AI can take 1–3 minutes per garment, longer if many people are using it.</p><div class="center pad-sm"><button class="btn btn-ghost btn-sm" data-action="cancel-tryon">Cancel</button></div>`;
    } else if (t.editing && t.ov.analyzing) {
      right = `${loader(t.ov.status || 'Finding your face and body…')}<p class="muted small center pad-sm">The first time, your browser downloads the free body finder (about 30 MB). It runs on your device.</p>`;
    } else if (t.editing) {
      const ov = t.ov;
      const lay = ov.layers.find((l) => l.gid === ov.sel) || ov.layers[0];
      right = `<div class="ov-wrap"><canvas id="ov-canvas" class="ov-canvas" aria-label="Drag the garment to move it"></canvas></div>
        <div class="pad-sm stack-sm">
          ${ov.fitNote ? `<p class="warn small">${icon('alert')} ${esc(ov.fitNote)}</p>` : `<p class="ok small">${icon('check')} Placed to fit your body. Your face${ov.layers.some((l) => S.wardrobe[l.gid].group !== 'upperWear') ? ', shoes' : ''} and hair stay in front.</p>`}
          <p class="muted small">Drag a garment to adjust it. Use the sliders to size, turn and stretch it.</p>
          ${ov.body ? `<label class="check"><input type="checkbox" data-change="ov-arms" ${ov.arms ? 'checked' : ''}> Show my arms in front of the clothes</label>` : ''}
          ${ov.layers.length > 1 ? `<div class="segmented">${ov.layers.map((l) => `<button class="${lay && l.gid === lay.gid ? 'on' : ''}" data-action="ov-select" data-id="${l.gid}">${esc(DATA.GROUP_LABELS[S.wardrobe[l.gid].group])}</button>`).join('')}</div>` : ''}
          ${lay ? `<label class="field"><span>Size</span><input type="range" min="15" max="110" value="${Math.round(lay.w * 100)}" data-input="ov-size"></label>
          <label class="field"><span>Turn</span><input type="range" min="-30" max="30" value="${lay.rot}" data-input="ov-rot"></label>
          <label class="field"><span>Stretch longer or shorter</span><input type="range" min="60" max="160" value="${Math.round(lay.sy * 100)}" data-input="ov-stretch"></label>` : ''}
          <div class="btn-row"><button class="btn btn-primary btn-sm" data-action="ov-save">${icon('check')} Save this look</button>${ov.body ? '<button class="btn btn-secondary btn-sm" data-action="ov-autofit">Fit to my body again</button>' : ''}<button class="btn btn-ghost btn-sm" data-action="ov-cancel">Cancel</button></div>
        </div>`;
    } else if (result) {
      right = `${t.compare !== 'off' && (t.compare === 'original' || prev) ? compareSlider(t.compare === 'original' ? result.photoId : prev.id, result.id, t.compare === 'original' ? 'Original' : 'Previous') : `<div class="result-img">${pic(result.id, 'You wearing the selected outfit')}</div>`}
         <div class="pad-sm">${methodTag(result)}</div>
         <div class="btn-row pad-sm">
           <button class="btn btn-primary btn-sm" data-action="save-outfit-from-result" data-id="${result.id}">${icon('bookmark')} Save outfit</button>
           <button class="btn btn-secondary btn-sm" data-action="download-result" data-id="${result.id}">${icon('download')} Download</button>
           <button class="btn btn-secondary btn-sm" data-action="try-another">Try another combination</button>
         </div>
         <div class="compare-row"><small class="muted">Compare with</small><div class="segmented">${[['off', 'Off'], ['original', 'Original'], ...(prev ? [['previous', 'Previous']] : [])].map(([k, l]) => `<button class="${t.compare === k ? 'on' : ''}" data-action="compare" data-c="${k}">${l}</button>`).join('')}</div></div>`;
    } else if (t.error) {
      right = `<div class="pad"><p class="error strong">${icon('alert')} The outfit couldn’t be generated</p><p class="muted">${esc(t.error)}</p>${t.error === 'Cancelled.' ? '' : `<div class="btn-row"><button class="btn btn-secondary btn-sm" data-action="generate">Try again</button><button class="btn btn-secondary btn-sm" data-action="use-overlay">Use Overlay instead</button></div>`}</div>`;
    } else {
      right = `<div class="result-empty">${icon('sparkles', 'big gold')}<p class="serif">Your outfit appears here</p><p class="muted small">Every result is saved in Saved Outfits › Try-on history.</p></div>`;
    }
    return `
      <header class="page-head"><div><h1>Virtual Try-On</h1><p class="lead">See clothes from your wardrobe on a photo of you. Both ways are free.</p></div></header>
      <div class="tryon">
        <section><h2 class="panel-title">My profile</h2>
          ${dp ? `<div class="arch tryon-photo">${pic(dp.id, 'Your photo')}</div><div class="center"><button class="btn btn-secondary btn-sm" data-action="change-photo">${icon('rotate')} Change photo</button></div>` : `<div class="arch tryon-photo"><span class="arch-empty">Add a full-body photo of yourself<br><a href="#/profile" class="btn btn-primary btn-sm">Add photo</a></span></div>`}
        </section>
        <section><h2 class="panel-title">My selected outfit</h2>
          <div class="soft-box"><small>How to try it on</small>
            <div class="segmented"><button class="${ai ? 'on' : ''}" data-action="tryon-method" data-m="ai">Free AI</button><button class="${ai ? '' : 'on'}" data-action="tryon-method" data-m="overlay">Overlay</button></div>
            <p class="muted small">${ai ? 'Realistic, made by free public AIs on Hugging Face. Tops, bottoms and dresses. Limited free uses per day, and it can be busy.' : 'DRAPE finds your face and body and places the clothes to fit. Instant, private and unlimited, but it looks like a neat collage, not a photo.'}</p>
          </div>
          ${`<div class="segmented"><button class="${t.mode === 'separates' ? 'on' : ''}" data-action="tryon-mode" data-mode="separates">Top + bottom</button><button class="${t.mode === 'onePiece' ? 'on' : ''}" data-action="tryon-mode" data-mode="onePiece">One-piece</button></div>`}
          <div class="stack-sm">${t.mode === 'onePiece' ? slot('One-piece', 'onePieces', it(t.onePieceId)) : slot('Upper wear', 'upperWear', it(t.upperId)) + slot('Bottom wear', 'bottomWear', it(t.bottomId))}</div>
          <button class="btn btn-primary btn-lg btn-block" data-action="generate" ${blocker || t.running || t.editing ? 'disabled' : ''}>${icon('sparkles')} ${t.running ? 'Generating…' : ai ? 'Generate with free AI' : 'Place on my photo'}</button>
          <p class="muted small center">${esc(blocker || (ai ? `${runs > 1 ? 'Uses two free AI runs: bottom first, then top. ' : ''}Your photo and the garments are sent to Hugging Face.` : 'Nothing leaves your device.'))}</p>
        </section>
        <section><h2 class="panel-title">Result</h2>
          <div class="panel result-panel">${right}</div>
          ${history.length ? `<h3 class="mt">Recent results</h3><div class="hscroll">${history.slice(0, 10).map((h) => `<button class="result-thumb ${result && result.id === h.id ? 'on' : ''}" data-action="view-result" data-id="${h.id}">${pic(h.id, 'Result')}</button>`).join('')}</div>` : ''}
        </section>
      </div>`;
  };

  function compareSlider(beforeId, afterId, beforeLabel) {
    return `<div class="compare" style="--pos:50%">${pic(afterId, 'New')}<div class="compare-before">${pic(beforeId, beforeLabel)}</div><span class="c-label left">${beforeLabel}</span><span class="c-label right">New</span><span class="c-line"></span><input type="range" min="0" max="100" value="50" data-input="compare" aria-label="Comparison divider"></div>`;
  }

  async function saveResult(dataUrl, method) {
    const t = S.tryon;
    const dp = S.photos[t.photoId] || defaultPhoto();
    const one = t.mode === 'onePiece';
    const id = STORE.newId();
    const rec = { id, photoId: dp.id, upperId: one ? '' : t.upperId || '', bottomId: one ? '' : t.bottomId || '', onePieceId: one ? t.onePieceId : '', method, createdAt: Date.now() };
    await STORE.update({ [`tryons/${id}`]: rec, [`images/${id}`]: dataUrl });
    imageCache.set(id, Promise.resolve(dataUrl));
    t.resultId = id;
  }

  // ------------------------------------------------------- free AI try-on
  const KIND = { upperWear: 'upper', bottomWear: 'lower', onePieces: 'overall' };
  async function generateAi() {
    const t = S.tryon;
    if (!S.settings.aiConsent) return askConsent(generateAi);
    const dp = S.photos[t.photoId] || defaultPhoto();
    const ids = t.mode === 'onePiece' ? [t.onePieceId] : [t.bottomId, t.upperId];
    const chosen = ids.filter((id) => id && S.wardrobe[id]).map((id) => S.wardrobe[id]);
    Object.assign(t, { running: true, cancelled: false, error: '', resultId: '', compare: 'off', stage: 'Starting…', pct: 4 });
    renderMain();
    showResult();
    try {
      const garments = [];
      for (const g of chosen) garments.push({ image: await imageData(g.id), kind: KIND[g.group], description: `${g.color.name} ${subLabel(g.subcategory)}`.toLowerCase() });
      const result = await IMG.aiTryOn(
        await imageData(dp.id),
        garments,
        (stage, pct) => {
          t.stage = stage;
          t.pct = pct;
          if (screen() === 'tryon') renderMain();
        },
        () => t.cancelled,
      );
      await saveResult(result, 'ai');
      toast('Your outfit is ready.', 'success');
    } catch (err) {
      t.error = err.message || 'Something went wrong.';
    } finally {
      t.running = false;
      renderMain();
    }
  }

  // ------------------------------------------------------ overlay editor
  const OV_START = { upperWear: { cx: 0.5, cy: 0.36, w: 0.5 }, bottomWear: { cx: 0.5, cy: 0.68, w: 0.36 }, onePieces: { cx: 0.5, cy: 0.52, w: 0.52 } };
  const ovCache = new Map(); // garment id -> see-through canvas
  const bodyCache = new Map(); // photo id -> body finder result
  let ovPhoto = null;

  // On phones the result is below the fold: bring it into view.
  const showResult = () => {
    const r = $('.result-panel');
    if (r && window.innerWidth < 1100) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function startOverlay() {
    const t = S.tryon;
    const ids = t.mode === 'onePiece' ? [t.onePieceId] : [t.bottomId, t.upperId];
    const layers = ids
      .filter((id) => id && S.wardrobe[id])
      .map((gid) => ({ gid, ...OV_START[S.wardrobe[gid].group], rot: 0, sy: 1 }));
    const hasTop = layers.some((l) => S.wardrobe[l.gid].group === 'upperWear');
    const ov = { layers, sel: layers[layers.length - 1].gid, photoId: (S.photos[t.photoId] || defaultPhoto()).id, analyzing: true, status: '', arms: !hasTop, body: null, fitNote: '' };
    Object.assign(t, { editing: true, error: '', resultId: '', compare: 'off', ov });
    renderMain();
    showResult();
    fitOverlay(ov);
  }

  async function fitOverlay(ov) {
    try {
      if (!ovPhoto || ovPhoto.id !== ov.photoId) ovPhoto = { id: ov.photoId, img: await IMG.loadImage(await imageData(ov.photoId)) };
      for (const l of ov.layers) if (!ovCache.has(l.gid)) ovCache.set(l.gid, await IMG.cutoutForOverlay(await imageData(l.gid)));
      let body = bodyCache.get(ov.photoId);
      if (!body) {
        body = await IMG.analyzeBody(await imageData(ov.photoId), (txt) => {
          ov.status = txt;
          if (S.tryon.ov === ov && screen() === 'tryon') renderMain();
        });
        bodyCache.set(ov.photoId, body);
      }
      ov.body = body;
      autoPlace(ov);
      if (!body.boxes.Face) ov.fitNote = 'Your face wasn’t found clearly, so the fit is a best guess. Drag the clothes to adjust.';
    } catch (err) {
      ov.body = null;
      ov.fitNote = `Couldn’t find your body automatically (${err.message}). Drag the clothes into place.`;
    }
    ov.analyzing = false;
    if (S.tryon.ov === ov) renderMain();
  }

  /** Places each garment using your face, body and current clothes found in the photo. */
  function autoPlace(ov) {
    const B = ov.body.boxes;
    const union = (...bs) => {
      const v = bs.filter(Boolean);
      return v.length ? { x0: Math.min(...v.map((b) => b.x0)), y0: Math.min(...v.map((b) => b.y0)), x1: Math.max(...v.map((b) => b.x1)), y1: Math.max(...v.map((b) => b.y1)) } : null;
    };
    const aspect = ovPhoto.img.height / ovPhoto.img.width; // height in widths
    const face = B.Face;
    const upper = B['Upper-clothes'];
    const dress = B.Dress;
    const lowerC = union(B.Pants, B.Skirt);
    const legs = union(B['Left-leg'], B['Right-leg']);
    const shoes = union(B['Left-shoe'], B['Right-shoe']);
    const all = union(...Object.values(B)) || { x0: 0.3, y0: 0.05, x1: 0.7, y1: 0.95 };
    const faceH = face ? face.y1 - face.y0 : (all.y1 - all.y0) * 0.12;
    const faceW = face ? face.x1 - face.x0 : (faceH * aspect) * 0.8;
    const cx = face ? (face.x0 + face.x1) / 2 : (all.x0 + all.x1) / 2;
    const neck = face ? face.y1 + faceH * 0.12 : upper ? upper.y0 : all.y0 + (all.y1 - all.y0) * 0.15;
    const feet = shoes ? shoes.y0 + (shoes.y1 - shoes.y0) * 0.3 : legs ? legs.y1 : all.y1;
    const waist = lowerC ? lowerC.y0 : upper ? upper.y1 - (upper.y1 - upper.y0) * 0.06 : dress ? dress.y0 + (dress.y1 - dress.y0) * 0.38 : neck + (feet - neck) * 0.38;
    const shoulderW = upper ? upper.x1 - upper.x0 : dress ? (dress.x1 - dress.x0) * 1.1 : faceW * 3.4;
    const place = (l, box, widen) => {
      const g = ovCache.get(l.gid);
      l.w = Math.min(1.2, Math.max(0.1, (box.x1 - box.x0) * widen));
      l.cx = (box.x0 + box.x1) / 2;
      const natural = (l.w / aspect) * (g.height / g.width);
      l.sy = Math.min(1.45, Math.max(0.7, (box.y1 - box.y0) / natural));
      l.cy = box.y0 + (natural * l.sy) / 2;
      l.rot = 0;
    };
    for (const l of ov.layers) {
      const item = S.wardrobe[l.gid];
      if (item.group === 'upperWear') {
        const xs = upper || { x0: cx - shoulderW / 2, x1: cx + shoulderW / 2 };
        place(l, { x0: xs.x0, x1: xs.x1, y0: neck - faceH * 0.15, y1: waist + (feet - waist) * 0.08 }, 1.12);
      } else if (item.group === 'bottomWear') {
        const short = ['shorts', 'skirt'].includes(item.subcategory);
        const xs = union(lowerC, legs) || { x0: cx - shoulderW * 0.42, x1: cx + shoulderW * 0.42 };
        place(l, { x0: xs.x0, x1: xs.x1, y0: waist, y1: short ? waist + (feet - waist) * 0.45 : feet }, short ? 1.15 : 1.05);
      } else {
        const xs = union(upper, dress) || { x0: cx - shoulderW / 2, x1: cx + shoulderW / 2 };
        place(l, { x0: xs.x0, x1: xs.x1, y0: neck - faceH * 0.15, y1: dress ? dress.y1 : waist + (feet - waist) * 0.55 }, 1.1);
      }
    }
    ov.parts = null;
  }

  /** Your face and hair (and shoes, and arms if chosen) from the photo, to put back in front of the clothes. */
  function bodyFront(ov) {
    if (!ov.body) return null;
    const names = ['Face', 'Hair', 'Hat', 'Sunglasses'];
    if (ov.layers.some((l) => S.wardrobe[l.gid].group !== 'upperWear')) names.push('Left-shoe', 'Right-shoe');
    if (ov.arms) names.push('Left-arm', 'Right-arm');
    const key = names.join();
    if (!ov.parts || ov.parts.key !== key) ov.parts = { key, canvas: IMG.bodyPartsLayer(ov.body, ovPhoto.img, names) };
    return ov.parts.canvas;
  }

  async function initOverlay() {
    const c = $('#ov-canvas');
    const ov = S.tryon.ov;
    if (!c || !ov || ov.analyzing) return;
    try {
      if (!ovPhoto || ovPhoto.id !== ov.photoId) ovPhoto = { id: ov.photoId, img: await IMG.loadImage(await imageData(ov.photoId)) };
      for (const l of ov.layers) if (!ovCache.has(l.gid)) ovCache.set(l.gid, await IMG.cutoutForOverlay(await imageData(l.gid)));
    } catch (err) {
      toast(err.message, 'error');
      return;
    }
    if (!document.body.contains(c)) return;
    const img = ovPhoto.img;
    c.width = img.width;
    c.height = img.height;
    drawOverlay(c);
    let drag = null;
    const toImg = (ev) => {
      const r = c.getBoundingClientRect();
      return { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height };
    };
    c.onpointerdown = (ev) => {
      const p = toImg(ev);
      // Pick the top-most garment under the finger, otherwise the selected one.
      const hit = [...ov.layers].reverse().find((l) => {
        const g = ovCache.get(l.gid);
        const hw = l.w / 2;
        const hh = (l.w * c.width * (g.height / g.width) * l.sy) / c.height / 2;
        return Math.abs(p.x - l.cx) < hw && Math.abs(p.y - l.cy) < hh;
      });
      if (hit && hit.gid !== ov.sel) {
        ov.sel = hit.gid;
        renderMain();
        return;
      }
      const l = ov.layers.find((x) => x.gid === ov.sel);
      drag = { l, sx: p.x, sy: p.y, cx: l.cx, cy: l.cy };
      c.setPointerCapture(ev.pointerId);
    };
    c.onpointermove = (ev) => {
      if (!drag) return;
      const p = toImg(ev);
      drag.l.cx = Math.min(1, Math.max(0, drag.cx + p.x - drag.sx));
      drag.l.cy = Math.min(1, Math.max(0, drag.cy + p.y - drag.sy));
      drawOverlay(c);
    };
    c.onpointerup = c.onpointercancel = () => (drag = null);
  }

  function drawOverlay(c, forSaving = false) {
    const ctx = c.getContext('2d');
    const ov = S.tryon.ov;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(ovPhoto.img, 0, 0, c.width, c.height);
    const boxes = [];
    for (const l of ov.layers) {
      const g = ovCache.get(l.gid);
      if (!g) continue;
      const w = l.w * c.width;
      const h = w * (g.height / g.width) * l.sy;
      ctx.save();
      ctx.translate(l.cx * c.width, l.cy * c.height);
      ctx.rotate((l.rot * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = c.width * 0.01;
      ctx.drawImage(g, -w / 2, -h / 2, w, h);
      ctx.restore();
      boxes.push({ l, w, h });
    }
    const front = bodyFront(ov);
    if (front) ctx.drawImage(front, 0, 0, c.width, c.height);
    if (!forSaving && ov.layers.length > 1) {
      const sel = boxes.find((b) => b.l.gid === ov.sel);
      if (sel) {
        ctx.save();
        ctx.setLineDash([c.width * 0.012, c.width * 0.012]);
        ctx.strokeStyle = '#CDB98F';
        ctx.lineWidth = Math.max(2, c.width * 0.004);
        ctx.strokeRect(sel.l.cx * c.width - sel.w / 2, sel.l.cy * c.height - sel.h / 2, sel.w, sel.h);
        ctx.restore();
      }
    }
  }

  async function saveOverlay() {
    const c = document.createElement('canvas');
    c.width = ovPhoto.img.width;
    c.height = ovPhoto.img.height;
    drawOverlay(c, true);
    await saveResult(IMG.toJpeg(c, 0.88), 'overlay');
    S.tryon.editing = false;
    toast('Look saved.', 'success');
    renderMain();
  }

  function openPicker(group) {
    const list = byGroup(group);
    openModal(
      `Choose ${DATA.GROUP_LABELS[group].toLowerCase()}`,
      list.length ? `<div class="grid">${list.map((i) => garmentCard(i, 'picked').replace('data-action="picked"', `data-action="picked" data-group="${group}"`)).join('')}</div>` : `<div class="empty"><h2>Nothing here yet</h2><p class="muted">Add some ${DATA.GROUP_LABELS[group].toLowerCase()} to your wardrobe first.</p><a href="#/wardrobe" class="btn btn-primary">Go to My Wardrobe</a></div>`,
    );
  }

  // =================================================================
  // AI STYLIST
  // =================================================================
  SCREENS.stylist = () => {
    const st = S.stylist;
    const hasCore = byGroup('onePieces').length || (byGroup('upperWear').length && byGroup('bottomWear').length);
    if (!hasCore) {
      return `<header class="page-head"><div><h1>AI Stylist</h1><p class="lead">Outfit ideas built only from clothes you own.</p></div></header>
        <div class="panel empty">${icon('wand', 'big')}<h2>Add a few more pieces first</h2><p class="muted">The stylist needs at least one top and one bottom (or a dress).</p><a href="#/wardrobe" class="btn btn-primary">Add clothes</a></div>`;
    }
    const chips = (list, key, labels) => list.map((v) => `<button class="chip ${st[key] === v ? 'on' : ''}" data-action="stylist-set" data-key="${key}" data-value="${v}">${labels[v]}</button>`).join('');
    const colors = DATA.PALETTE.filter((c) => ['White', 'Black', 'Navy', 'Grey', 'Beige', 'Olive', 'Light blue', 'Blue', 'Brown', 'Maroon', 'Green', 'Pink'].includes(c.name));
    const r = st.result;
    return `
      <header class="page-head"><div><h1>AI Stylist</h1><p class="lead">Tell us where you’re going. We’ll put together outfits using only clothes you own.</p></div></header>
      <div class="two-col reverse">
        <section class="panel pad stack">
          <div><span class="label">Occasion</span><div class="chips wrap">${chips([...DATA.OCCASIONS], 'occasion', DATA.OCCASION_LABELS)}</div></div>
          <div><span class="label">Style</span><div class="chips wrap">${chips([...DATA.STYLIST_STYLES], 'style', DATA.STYLE_LABELS)}</div></div>
          <div><span class="label">Preferred colours (optional)</span><div class="chips wrap">${colors.map((c) => `<button class="chip ${st.colors.includes(c.name) ? 'on' : ''}" data-action="stylist-color" data-value="${c.name}"><span class="dot" style="background:${c.hex}"></span>${c.name}</button>`).join('')}</div></div>
          <label class="field"><span>Weather (optional)</span><select data-change="stylist-weather"><option value="">Any</option>${options(DATA.WEATHER.map((w) => [w, DATA.WEATHER_LABELS[w]]), st.weather)}</select></label>
          <button class="btn btn-primary btn-lg btn-block" data-action="stylist-run">${icon('wand')} Suggest outfits</button>
          <p class="muted small">Suggestions come from DRAPE’s built-in styling rules (colour harmony, occasion and weather). It runs on your device and is free.</p>
        </section>
        <section>
          ${
            r
              ? `<div class="section-head"><h2>${esc(DATA.OCCASION_LABELS[r.occasion])} ideas</h2><span class="tag">${r.source === 'ai' ? 'AI stylist' : 'Styling rules'}</span></div>
                 ${r.note ? `<p class="note">${esc(r.note)}</p>` : ''}
                 <div class="stack">${r.suggestions
                   .map(
                     (s, i) => `<div class="panel pad suggestion">
                   <div class="pieces">${[s.onePieceId, s.upperId, s.bottomId, s.shoesId].filter(Boolean).map((id) => `<span class="tile md">${pic(id, '')}</span>`).join('')}</div>
                   <div><small class="gold">Outfit ${i + 1}</small><h3>${esc(s.title)}</h3><p class="strong small">${esc(s.look)}</p><p class="muted">${esc(s.reason)}</p>
                   <div class="btn-row"><button class="btn btn-primary btn-sm" data-action="try-outfit" data-upper="${s.upperId || ''}" data-bottom="${s.bottomId || ''}" data-one="${s.onePieceId || ''}">${icon('sparkles')} Try this outfit</button><button class="btn btn-secondary btn-sm" data-action="save-combo" data-i="${i}">${icon('bookmark')} Save combination</button></div></div>
                 </div>`,
                   )
                   .join('')}</div>`
              : `<div class="panel empty">${icon('wand', 'big')}<h2>Your outfit ideas appear here</h2><p class="muted">Pick an occasion and a style, then tap Suggest outfits.</p></div>`
          }
        </section>
      </div>`;
  };

  const stylistItems = () => items().map((i) => ({ id: i.id, group: i.group, subcategory: i.subcategory, name: i.name, color: i.color, pattern: i.pattern, style: i.style }));

  // =================================================================
  // SAVED OUTFITS
  // =================================================================
  SCREENS.saved = () => {
    const tab = S.savedTab;
    const f = S.savedFilter;
    const outfits = values(S.outfits).sort(newest).filter((o) => (!f.occasion || o.occasion === f.occasion) && (!f.style || o.style === f.style) && (!f.fav || o.favorite));
    const history = values(S.tryons).sort(newest);
    const head = `<header class="page-head"><div><h1>Saved Outfits</h1><p class="lead">Looks you’ve kept, and every outfit you’ve generated.</p></div></header>
      <div class="segmented inline"><button class="${tab === 'outfits' ? 'on' : ''}" data-action="saved-tab" data-tab="outfits">Saved outfits</button><button class="${tab === 'history' ? 'on' : ''}" data-action="saved-tab" data-tab="history">Try-on history</button></div>`;
    if (tab === 'history') {
      return `${head}${
        history.length
          ? `<div class="grid">${history.map((h) => `<div class="hist"><button class="result-thumb big" data-action="open-tryon-result" data-id="${h.id}">${pic(h.id, 'Result')}</button><div class="row-between"><small class="muted">${new Date(h.createdAt).toLocaleDateString()}</small><span><button class="icon-btn" data-action="save-outfit-from-result" data-id="${h.id}" aria-label="Save outfit">${icon('bookmark')}</button><button class="icon-btn" data-action="download-result" data-id="${h.id}" aria-label="Download">${icon('download')}</button><button class="icon-btn danger" data-action="delete-result" data-id="${h.id}" aria-label="Delete">${icon('trash')}</button></span></div></div>`).join('')}</div>`
          : `<div class="panel empty">${icon('sparkles', 'big')}<h2>No generated outfits yet</h2><a href="#/tryon" class="btn btn-primary">Generate your first look</a></div>`
      }`;
    }
    return `${head}
      <div class="toolbar">
        <select class="input" data-change="saved-occasion" aria-label="Occasion"><option value="">All occasions</option>${options(DATA.OCCASIONS.map((o) => [o, DATA.OCCASION_LABELS[o]]), f.occasion)}</select>
        <select class="input" data-change="saved-style" aria-label="Style"><option value="">All styles</option>${options(DATA.STYLIST_STYLES.map((s) => [s, DATA.STYLE_LABELS[s]]), f.style)}</select>
        <button class="chip ${f.fav ? 'on' : ''}" data-action="saved-fav">${icon('heart')} Favourites</button>
        <button class="btn btn-secondary btn-sm push" data-action="new-combo">${icon('plus')} New combination</button>
      </div>
      ${
        !values(S.outfits).length
          ? `<div class="panel empty">${icon('bookmark', 'big')}<h2>No saved outfits yet</h2><p class="muted">Save a look after generating it, or keep a combination from the stylist.</p><div class="btn-row center"><a href="#/tryon" class="btn btn-primary">Open Virtual Try-On</a><a href="#/stylist" class="btn btn-secondary">Ask the stylist</a></div></div>`
          : !outfits.length
            ? `<div class="empty"><h2>No outfits match these filters</h2></div>`
            : `<div class="grid wide">${outfits
                .map(
                  (o) => `<div class="panel outfit">
                <div class="outfit-img">${o.tryonId && S.tryons[o.tryonId] ? pic(o.tryonId, o.name) : `<div class="pieces center-pieces">${[o.onePieceId, o.upperId, o.bottomId, o.shoesId].filter(Boolean).map((id) => `<span class="tile md">${S.wardrobe[id] ? pic(id, '') : '<span class="missing-text">Removed</span>'}</span>`).join('')}</div>`}</div>
                <div class="pad-sm stack-sm">
                  <div class="row-between"><h3>${esc(o.name)}</h3><button class="icon-btn" data-action="outfit-fav" data-id="${o.id}" aria-label="Favourite">${icon('heart', o.favorite ? 'filled' : '')}</button></div>
                  <div class="tags">${o.occasion ? `<span class="tag">${DATA.OCCASION_LABELS[o.occasion]}</span>` : ''}${o.style ? `<span class="tag">${DATA.STYLE_LABELS[o.style]}</span>` : ''}${o.tryonId ? '' : '<span class="tag gold">Not generated yet</span>'}</div>
                  ${o.notes ? `<p class="muted small">${esc(o.notes)}</p>` : ''}
                  <div class="btn-row"><button class="btn btn-primary btn-sm" data-action="try-outfit" data-upper="${o.upperId || ''}" data-bottom="${o.bottomId || ''}" data-one="${o.onePieceId || ''}">${icon('sparkles')} ${o.tryonId ? 'Try again' : 'Try it on'}</button><button class="icon-btn" data-action="edit-outfit" data-id="${o.id}" aria-label="Edit">${icon('edit')}</button><button class="icon-btn danger" data-action="delete-outfit" data-id="${o.id}" aria-label="Delete">${icon('trash')}</button></div>
                </div>
              </div>`,
                )
                .join('')}</div>`
      }`;
  };

  function outfitForm(draft) {
    const names = [draft.onePieceId, draft.upperId, draft.bottomId].filter(Boolean).map((id) => (S.wardrobe[id] || {}).name).filter(Boolean);
    return `<form data-form="outfit" class="stack">
      <div class="pieces">${draft.tryonId ? `<span class="tile md">${pic(draft.tryonId, '')}</span>` : ''}${[draft.onePieceId, draft.upperId, draft.bottomId, draft.shoesId].filter(Boolean).map((id) => `<span class="tile md">${pic(id, '')}</span>`).join('')}</div>
      <label class="field"><span>Name</span><input name="name" maxlength="80" required value="${esc(draft.name || names.join(' with ') || 'My outfit')}"></label>
      <div class="form-grid">
        <label class="field"><span>Occasion</span><select name="occasion"><option value="">Not set</option>${options(DATA.OCCASIONS.map((o) => [o, DATA.OCCASION_LABELS[o]]), draft.occasion || '')}</select></label>
        <label class="field"><span>Style</span><select name="style"><option value="">Not set</option>${options(DATA.STYLIST_STYLES.map((s) => [s, DATA.STYLE_LABELS[s]]), draft.style || '')}</select></label>
      </div>
      <label class="field"><span>Notes</span><textarea name="notes" rows="2" maxlength="500">${esc(draft.notes || '')}</textarea></label>
      <button class="btn btn-primary btn-block">Save outfit</button>
    </form>`;
  }
  let outfitDraft = null;
  function openOutfitForm(draft, title = 'Save outfit') {
    outfitDraft = draft;
    openModal(title, outfitForm(draft));
  }

  // =================================================================
  // SETTINGS
  // =================================================================
  SCREENS.settings = () => {
    const token = IMG.getHfToken();
    return `
      <header class="page-head"><div><h1>Settings</h1></div></header>
      <div class="settings">
        <section class="panel pad stack">
          <h3>${icon('user')} Account</h3>
          <div class="kv"><span>Name</span><strong>${esc(S.profile.name || '—')}</strong></div>
          <div class="kv"><span>Email</span><strong>${esc(S.user.email)}</strong></div>
          <div class="kv"><span>Account type</span><strong>${S.mode === 'demo' ? 'Demo (not saved)' : S.user.provider === 'google.com' ? 'Google' : 'Email and password'}</strong></div>
          ${S.mode === 'firebase' && S.user.provider === 'password' ? `<div class="kv"><span>Email verified</span><strong>${S.user.emailVerified ? 'Yes' : '<a href="#" data-action="refresh-user">Not yet – refresh</a>'}</strong></div>` : ''}
          <div class="btn-row"><a href="#/profile" class="btn btn-secondary btn-sm">Edit profile</a>${S.mode === 'firebase' && S.user.provider === 'password' ? '<button class="btn btn-secondary btn-sm" data-action="reset-password">Change password</button>' : ''}<button class="btn btn-secondary btn-sm" data-action="sign-out">${icon('logout')} Log out</button></div>
        </section>
        <section class="panel pad stack">
          <h3>${icon('sparkles')} Free AI & privacy</h3>
          <label class="switch-row"><span><strong>Allow sending photos to the free AI</strong><small class="muted">For “Free AI” try-on, your photo and the chosen garments go to public demos on Hugging Face (${esc(IMG.tryOnSpace())} for tops, ${esc(IMG.tryOnSpaceBottoms())} for bottoms and dresses). If you add a Gemini key, garment pictures go to Google Gemini. Overlay, background removal and Extract Clothes always stay on your device.</small></span><input type="checkbox" class="switch" data-change="consent" ${S.settings.aiConsent ? 'checked' : ''}></label>
          <form class="stack-sm" data-form="hf-token">
            <label class="field"><span>Hugging Face token (optional, for more free uses per day)</span><input name="token" type="password" autocomplete="off" placeholder="hf_…" value="${esc(token)}"><small>Without a token you get about 2 minutes of free AI time a day (about 2 tops, or 1 bottom or dress). A free Hugging Face account’s token gives about 5 minutes, enough for a top and a bottom together. Kept only in this browser. See README, “More free AI tries”.</small></label>
            <div class="btn-row"><button class="btn btn-secondary btn-sm">Save token</button>${token ? '<button type="button" class="btn btn-ghost btn-sm" data-action="clear-token">Remove token</button>' : ''}</div>
          </form>
          <form class="stack-sm" data-form="gemini-key">
            <label class="field"><span>Gemini API key (optional, free): writes product names, categories and colours for new clothes</span><input name="key" type="password" autocomplete="off" placeholder="AIza…" value="${esc(IMG.getGeminiKey())}"><small>Only garment pictures are sent, never your own photo. Kept only in this browser. See README, “Gemini”.</small></label>
            <div class="btn-row"><button class="btn btn-secondary btn-sm">Save Gemini key</button>${IMG.getGeminiKey() ? '<button type="button" class="btn btn-ghost btn-sm" data-action="clear-gemini">Remove key</button>' : ''}</div>
          </form>
        </section>
        <section class="panel pad stack">
          <h3>${icon('download')} Your data</h3>
          <p class="muted small">Download a copy of everything, or clear generated pictures you no longer need.</p>
          <div class="btn-row"><button class="btn btn-secondary btn-sm" data-action="export">Export my data</button><button class="btn btn-secondary btn-sm" data-action="clear-history" ${values(S.tryons).length ? '' : 'disabled'}>Clear try-on history (${values(S.tryons).length})</button></div>
        </section>
        <section class="panel pad stack">
          <h3>${icon('image')} Install on your phone</h3>
          <p class="muted small">iPhone: tap Share › Add to Home Screen. Android: open the browser menu › Install app (or Add to Home screen).</p>
        </section>
        <section class="panel pad stack danger-box">
          <h3 class="error">${icon('trash')} Delete account</h3>
          <p class="muted small">Permanently deletes your account and everything in it: photos, garments, outfits and results.</p>
          <div><button class="btn btn-danger btn-sm" data-action="delete-account">Delete my account</button></div>
        </section>
      </div>`;
  };

  function askConsent(then) {
    openModal(
      'Before using the free AI',
      `<p><strong>Free AI</strong> try-on sends your photo and the chosen garments to public demos on <strong>Hugging Face</strong> (${esc(IMG.tryOnSpace())} and ${esc(IMG.tryOnSpaceBottoms())}), run by their researchers. If you add a Gemini key, garment pictures (never your photo) go to <strong>Google Gemini</strong>, which may use free-tier data to improve its products. DRAPE doesn’t control how long they keep it.</p>
       <ul class="ticks">
         <li>Only use photos you’re comfortable sharing with these services.</li>
         <li><strong>Overlay</strong>, background removal and Extract Clothes stay on your device. Nothing is sent.</li>
         <li>Your pictures in DRAPE stay private in your account. You can switch this off in Settings.</li>
       </ul>`,
      `<button class="btn btn-secondary" data-action="close-modal">Not now</button><button class="btn btn-primary" data-action="accept-consent">I agree</button>`,
    );
    askConsent.then = then;
  }

  // =================================================================
  // actions (buttons)
  // =================================================================
  const ACTIONS = {
    'close-modal': () => closeModal(),
    more: () =>
      openModal(
        'More',
        `<div class="more-grid">${NAV.filter((n) => ['profile', 'extract', 'stylist', 'settings'].includes(n[0])).map(([id, label, ic]) => `<a href="#/${id}" class="more-item">${icon(ic)}<span>${label}</span></a>`).join('')}</div>
         <button class="btn btn-ghost btn-block" data-action="sign-out">${icon('logout')} Log out</button>`,
      ),
    'auth-view': (el) => {
      S.authView = el.dataset.view;
      renderApp();
    },
    demo: () => STORE.startDemo(),
    google: async () => {
      try {
        await STORE.signInWithGoogle();
      } catch (err) {
        $('#auth-error').innerHTML = `<div class="note error">${esc(STORE.niceError(err))}</div>`;
      }
    },
    'sign-out': async () => {
      closeModal();
      await STORE.signOut();
    },
    'resend-verify': async () => {
      try {
        await STORE.resendVerification();
        toast('Verification email sent.', 'success');
      } catch (err) {
        toast(STORE.niceError(err), 'error');
      }
    },
    'refresh-user': async () => {
      await STORE.refreshUser().catch(() => {});
      S.user = STORE.user;
      renderMain();
      toast(S.user.emailVerified ? 'Email verified. Thank you!' : 'Not verified yet. Click the link in the email first.');
    },
    'reset-password': async () => {
      try {
        await STORE.resetPassword(S.user.email);
        toast('Password reset email sent.', 'success');
      } catch (err) {
        toast(STORE.niceError(err), 'error');
      }
    },

    // wardrobe
    'filter-group': (el) => {
      S.filter.group = el.dataset.group || '';
      if (screen() !== 'wardrobe') go('wardrobe');
      else renderMain();
    },
    'filter-fav': () => {
      S.filter.fav = !S.filter.fav;
      renderMain();
    },
    'add-clothes': () => openAddClothes(),
    'open-item': (el) => openItem(el.dataset.id),
    'save-item': async (el) => {
      const base = S.wardrobe[el.dataset.id];
      const updated = readItemForm($('#item-edit'), base);
      try {
        await STORE.set(`wardrobe/${base.id}`, updated);
        closeModal();
        toast('Changes saved.', 'success');
      } catch (err) {
        toast(STORE.niceError(err), 'error');
      }
    },
    'fav-item': async (el) => {
      const i = S.wardrobe[el.dataset.id];
      await STORE.set(`wardrobe/${i.id}/favorite`, !i.favorite).catch((e) => toast(STORE.niceError(e), 'error'));
      openItem(i.id);
    },
    'delete-item': async (el) => {
      const i = S.wardrobe[el.dataset.id];
      if (!confirm(`Delete “${i.name}” from your wardrobe?`)) return;
      await STORE.update({ [`wardrobe/${i.id}`]: null, [`images/${i.id}`]: null }).catch((e) => toast(STORE.niceError(e), 'error'));
      imageCache.delete(i.id);
      closeModal();
      toast('Garment deleted.');
    },
    'try-item': (el) => {
      const i = S.wardrobe[el.dataset.id];
      const t = S.tryon;
      if (i.group === 'onePieces') {
        t.mode = 'onePiece';
        t.onePieceId = i.id;
      } else {
        t.mode = 'separates';
        if (i.group === 'upperWear') t.upperId = i.id;
        else t.bottomId = i.id;
      }
      closeModal();
      go('tryon');
    },
    'queue-save': (el) => saveQueueEntry(el.dataset.id).then((ok) => ok && toast('Added to your wardrobe.', 'success')),
    'save-all-queue': async () => {
      let n = 0;
      for (const e of S.addQueue.filter((x) => x.status === 'review')) if (await saveQueueEntry(e.id)) n++;
      if (n) toast(`${n} items added to your wardrobe.`, 'success');
    },
    'queue-remove': (el) => {
      S.addQueue = S.addQueue.filter((e) => e.id !== el.dataset.id);
      renderAddQueue();
    },
    'queue-retry': (el) => {
      const e = S.addQueue.find((x) => x.id === el.dataset.id);
      e.status = 'waiting';
      runQueue();
    },
    'queue-plain': (el) => processQueueEntry(S.addQueue.find((x) => x.id === el.dataset.id), true),

    // profile
    'rotate-photo': (el) => pendingPhoto && showPhotoPreview(pendingPhoto.file, (pendingPhoto.rotate + Number(el.dataset.dir) + 360) % 360),
    'save-photo': async () => {
      if (!pendingPhoto) return;
      const p = pendingPhoto.prepared;
      const id = STORE.newId();
      const values_ = { [`photos/${id}`]: { id, w: p.w, h: p.h, tips: p.check, createdAt: Date.now() }, [`images/${id}`]: p.dataUrl };
      if (!defaultPhoto()) values_['profile/defaultPhotoId'] = id;
      try {
        await STORE.update(values_);
        imageCache.set(id, Promise.resolve(p.dataUrl));
        closeModal();
        toast('Photo saved.', 'success');
      } catch (err) {
        toast(STORE.niceError(err), 'error');
      }
    },
    'default-photo': (el) => STORE.set('profile/defaultPhotoId', el.dataset.id).then(() => toast('Try-on photo updated.', 'success')),
    'delete-photo': async (el) => {
      if (!confirm('Delete this photo?')) return;
      const id = el.dataset.id;
      const vals = { [`photos/${id}`]: null, [`images/${id}`]: null };
      if (S.profile.defaultPhotoId === id) vals['profile/defaultPhotoId'] = (photos().find((p) => p.id !== id) || {}).id || null;
      await STORE.update(vals).catch((e) => toast(STORE.niceError(e), 'error'));
      imageCache.delete(id);
    },

    // extract
    'extract-toggle': (el) => {
      const i = S.extract.items.find((x) => x.id === el.dataset.id);
      if (i && !i.saved) i.selected = !i.selected;
      renderMain();
    },
    'extract-add': async (el) => {
      const i = S.extract.items.find((x) => x.id === el.dataset.id);
      try {
        await saveExtracted(i);
        toast('Added to your wardrobe.', 'success');
      } catch (err) {
        toast(STORE.niceError(err), 'error');
      }
      renderMain();
    },
    'extract-add-selected': async () => {
      const chosen = S.extract.items.filter((i) => i.selected && !i.saved && !i.removed);
      if (!chosen.length) return toast('Select at least one garment first.');
      try {
        for (const i of chosen) await saveExtracted(i);
        toast(`${chosen.length} added to your wardrobe.`, 'success');
      } catch (err) {
        toast(STORE.niceError(err), 'error');
      }
      renderMain();
    },
    'extract-remove': (el) => {
      const i = S.extract.items.find((x) => x.id === el.dataset.id);
      i.removed = true;
      i.selected = false;
      renderMain();
    },
    'extract-edit': (el) => {
      const i = S.extract.items.find((x) => x.id === el.dataset.id);
      i.fields = i.fields || defaultFields(i.group, i.color, i.subcategory);
      openModal('Edit details', `<div class="detail"><span class="tile big"><img src="${i.image}" alt=""></span><div id="extract-edit" data-id="${i.id}">${itemForm(i.fields)}</div></div>`, `<button class="btn btn-primary" data-action="extract-edit-done" data-id="${i.id}">Done</button>`);
    },
    'extract-edit-done': (el) => {
      const i = S.extract.items.find((x) => x.id === el.dataset.id);
      i.fields = readItemForm($('#extract-edit'), i.fields);
      i.title = i.fields.name;
      i.color = i.fields.color;
      i.subcategory = i.fields.subcategory;
      closeModal();
      renderMain();
    },

    // try-on
    pick: (el) => openPicker(el.dataset.group),
    picked: (el) => {
      S.tryon.editing = false;
      const g = el.dataset.group;
      const t = S.tryon;
      if (g === 'upperWear') t.upperId = el.dataset.id;
      else if (g === 'bottomWear') t.bottomId = el.dataset.id;
      else t.onePieceId = el.dataset.id;
      closeModal();
      renderMain();
    },
    unpick: (el) => {
      S.tryon.editing = false;
      const g = el.dataset.group;
      if (g === 'upperWear') S.tryon.upperId = '';
      else if (g === 'bottomWear') S.tryon.bottomId = '';
      else S.tryon.onePieceId = '';
      renderMain();
    },
    'tryon-mode': (el) => {
      S.tryon.editing = false;
      S.tryon.mode = el.dataset.mode;
      renderMain();
    },
    'tryon-method': (el) => {
      Object.assign(S.tryon, { method: el.dataset.m, editing: false, error: '' });
      renderMain();
    },
    'use-overlay': () => {
      Object.assign(S.tryon, { method: 'overlay', error: '' });
      renderMain();
    },
    'ov-select': (el) => {
      S.tryon.ov.sel = el.dataset.id;
      renderMain();
    },
    'ov-cancel': () => {
      S.tryon.editing = false;
      renderMain();
    },
    'ov-save': () => saveOverlay(),
    'ov-autofit': () => {
      autoPlace(S.tryon.ov);
      renderMain();
    },
    'clear-gemini': () => {
      IMG.setGeminiKey('');
      toast('Gemini key removed from this browser.');
      renderMain();
    },
    'clear-token': () => {
      IMG.setHfToken('');
      toast('Token removed from this browser.');
      renderMain();
    },
    'change-photo': () =>
      openModal('Choose a photo', `<div class="photo-grid">${photos().map((p) => `<button class="arch pick-photo" data-action="set-tryon-photo" data-id="${p.id}">${pic(p.id, 'Your photo')}</button>`).join('')}</div><a href="#/profile" class="btn btn-secondary btn-sm">${icon('plus')} Add a new photo</a>`),
    'set-tryon-photo': (el) => {
      S.tryon.photoId = el.dataset.id;
      closeModal();
      renderMain();
    },
    generate: () => (S.tryon.method === 'ai' ? generateAi() : startOverlay()),
    'cancel-tryon': () => {
      S.tryon.cancelled = true;
      S.tryon.stage = 'Cancelling…';
      renderMain();
    },
    'view-result': (el) => {
      S.tryon.editing = false;
      const r = S.tryons[el.dataset.id];
      Object.assign(S.tryon, { resultId: r.id, compare: 'off', error: '' });
      if (r.onePieceId) Object.assign(S.tryon, { mode: 'onePiece', onePieceId: r.onePieceId });
      else Object.assign(S.tryon, { mode: 'separates', upperId: r.upperId || '', bottomId: r.bottomId || '' });
      renderMain();
    },
    'open-tryon-result': (el) => {
      ACTIONS['view-result'](el);
      go('tryon');
    },
    compare: (el) => {
      S.tryon.compare = el.dataset.c;
      renderMain();
    },
    'try-another': () => {
      S.tryon.editing = false;
      S.tryon.resultId = '';
      renderMain();
    },
    'download-result': async (el) => download(await imageData(el.dataset.id), `drape-outfit-${el.dataset.id}.jpg`),
    'save-outfit-from-result': (el) => {
      const r = S.tryons[el.dataset.id];
      openOutfitForm({ upperId: r.upperId, bottomId: r.bottomId, onePieceId: r.onePieceId, tryonId: r.id });
    },
    'delete-result': async (el) => {
      if (!confirm('Delete this generated picture?')) return;
      const id = el.dataset.id;
      const vals = { [`tryons/${id}`]: null, [`images/${id}`]: null };
      values(S.outfits).filter((o) => o.tryonId === id).forEach((o) => (vals[`outfits/${o.id}/tryonId`] = null));
      await STORE.update(vals).catch((e) => toast(STORE.niceError(e), 'error'));
      imageCache.delete(id);
      if (S.tryon.resultId === id) S.tryon.resultId = '';
    },
    'try-outfit': (el) => {
      const t = S.tryon;
      if (el.dataset.one) Object.assign(t, { mode: 'onePiece', onePieceId: el.dataset.one });
      else Object.assign(t, { mode: 'separates', upperId: el.dataset.upper, bottomId: el.dataset.bottom });
      t.resultId = '';
      t.error = '';
      closeModal();
      go('tryon');
    },

    // stylist
    'stylist-set': (el) => {
      S.stylist[el.dataset.key] = el.dataset.value;
      renderMain();
    },
    'stylist-color': (el) => {
      const c = S.stylist.colors;
      const v = el.dataset.value;
      S.stylist.colors = c.includes(v) ? c.filter((x) => x !== v) : [...c, v];
      renderMain();
    },
    'stylist-run': () => {
      const st = S.stylist;
      const req = { occasion: st.occasion, style: st.style, colors: st.colors, weather: st.weather || null, count: 3 };
      st.result = { source: 'rules', occasion: st.occasion, style: st.style, suggestions: DATA.suggestOutfitsByRules(stylistItems(), req) };
      if (!st.result.suggestions.length) st.result.note = 'Nothing fits this brief yet. Try another occasion or add more pieces.';
      renderMain();
    },
    'save-combo': (el) => {
      const s = S.stylist.result.suggestions[Number(el.dataset.i)];
      openOutfitForm({ upperId: s.upperId, bottomId: s.bottomId, onePieceId: s.onePieceId, shoesId: s.shoesId, name: s.title, occasion: S.stylist.result.occasion, style: S.stylist.result.style });
    },

    // saved
    'saved-tab': (el) => {
      S.savedTab = el.dataset.tab;
      if (screen() !== 'saved') go('saved');
      else renderMain();
    },
    'saved-fav': () => {
      S.savedFilter.fav = !S.savedFilter.fav;
      renderMain();
    },
    'outfit-fav': (el) => STORE.set(`outfits/${el.dataset.id}/favorite`, !S.outfits[el.dataset.id].favorite),
    'edit-outfit': (el) => openOutfitForm({ ...S.outfits[el.dataset.id] }, 'Edit outfit'),
    'delete-outfit': async (el) => {
      if (!confirm('Delete this saved outfit? The garments stay in your wardrobe.')) return;
      await STORE.remove(`outfits/${el.dataset.id}`).catch((e) => toast(STORE.niceError(e), 'error'));
    },
    'new-combo': () => {
      openOutfitForm({ upperId: '', bottomId: '' }, 'New combination');
      const form = $('form[data-form="outfit"]');
      form.insertAdjacentHTML(
        'afterbegin',
        `<div class="form-grid"><label class="field"><span>Top</span><select name="upperId" required><option value="">Choose…</option>${options(byGroup('upperWear').map((i) => [i.id, i.name]), '')}</select></label>
         <label class="field"><span>Bottom</span><select name="bottomId" required><option value="">Choose…</option>${options(byGroup('bottomWear').map((i) => [i.id, i.name]), '')}</select></label></div>`,
      );
    },

    // settings
    'accept-consent': async () => {
      await STORE.set('settings', { ...S.settings, aiConsent: true, consentAt: Date.now() }).catch((e) => toast(STORE.niceError(e), 'error'));
      S.settings.aiConsent = true;
      closeModal();
      const then = askConsent.then;
      askConsent.then = null;
      if (then) then();
    },
    export: async () => {
      const everything = {};
      for (const key of ['profile', 'photos', 'wardrobe', 'outfits', 'tryons', 'settings', 'images']) everything[key] = await STORE.get(key);
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...everything }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      download(url, `drape-data-${new Date().toISOString().slice(0, 10)}.json`);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    },
    'clear-history': async () => {
      if (!confirm('Delete all generated try-on pictures?')) return;
      const vals = {};
      values(S.tryons).forEach((t) => {
        vals[`tryons/${t.id}`] = null;
        vals[`images/${t.id}`] = null;
      });
      values(S.outfits).forEach((o) => o.tryonId && (vals[`outfits/${o.id}/tryonId`] = null));
      await STORE.update(vals).catch((e) => toast(STORE.niceError(e), 'error'));
      toast('Try-on history cleared.');
    },
    'delete-account': () =>
      openModal(
        'Delete your account?',
        `<p class="note error">Everything in your DRAPE account is deleted immediately and permanently.</p>
         ${S.user.provider === 'password' ? '<label class="field"><span>Your password</span><input type="password" id="del-pw" autocomplete="current-password"></label>' : '<p class="muted">You’ll be asked to sign in with Google again to confirm.</p>'}
         <label class="field"><span>Type DELETE to confirm</span><input id="del-confirm" autocapitalize="characters"></label>`,
        `<button class="btn btn-secondary" data-action="close-modal">Keep my account</button><button class="btn btn-danger" data-action="confirm-delete">Delete permanently</button>`,
      ),
    'confirm-delete': async () => {
      if (($('#del-confirm').value || '').trim().toUpperCase() !== 'DELETE') return toast('Type DELETE to confirm.', 'error');
      try {
        await STORE.deleteAccount(($('#del-pw') || {}).value || '');
        closeModal();
        toast('Your account has been deleted.');
      } catch (err) {
        toast(STORE.niceError(err), 'error');
      }
    },
  };

  // =================================================================
  // events
  // =================================================================
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (!fn) return;
    if (el.tagName === 'A' || el.tagName === 'BUTTON') ev.preventDefault();
    if (el.disabled) return;
    Promise.resolve(fn(el, ev)).catch((err) => toast(STORE.niceError(err), 'error'));
  });

  // Keep edits in "ready to review" cards, so they survive the list redrawing.
  function rememberQueueEdits(el) {
    const card = el.closest && el.closest('[data-q]');
    if (!card) return;
    const e = S.addQueue.find((x) => x.id === card.dataset.q);
    if (e && e.status === 'review') e.fields = readItemForm(card, e.fields);
  }

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    rememberQueueEdits(el);
    const kind = el.dataset && el.dataset.change;
    if (!kind) return;
    if (kind === 'photo-file' && el.files[0]) {
      showPhotoPreview(el.files[0]);
      el.value = '';
    } else if (kind === 'add-files') {
      const files = [...el.files].slice(0, 20);
      el.value = '';
      files.forEach((file) => S.addQueue.push({ id: STORE.newId(), file, preview: URL.createObjectURL(file), hint: S.addHint, useAi: S.addUseAi, status: 'waiting', stage: 'Waiting…', warnings: [] }));
      renderAddQueue();
      runQueue();
    } else if (kind === 'add-hint') S.addHint = el.value;
    else if (kind === 'add-useai') S.addUseAi = el.checked;
    else if (kind === 'group-select') {
      const form = el.closest('[data-item-form]');
      form.querySelector('[name="subcategory"]').innerHTML = subOptions(el.value);
      rememberQueueEdits(el);
    } else if (kind === 'extract-file' && el.files[0]) {
      const file = el.files[0];
      el.value = '';
      runExtract(file);
    } else if (kind === 'stylist-weather') S.stylist.weather = el.value;
    else if (kind === 'saved-occasion') {
      S.savedFilter.occasion = el.value;
      renderMain();
    } else if (kind === 'saved-style') {
      S.savedFilter.style = el.value;
      renderMain();
    } else if (kind === 'ov-arms') {
      S.tryon.ov.arms = el.checked;
      const c = $('#ov-canvas');
      if (c && ovPhoto) drawOverlay(c);
    } else if (kind === 'consent') {
      if (el.checked) {
        el.checked = false;
        askConsent(() => renderMain());
      } else {
        STORE.set('settings/aiConsent', false).then(() => toast('AI processing switched off.'));
      }
    }
  });

  document.addEventListener('input', (ev) => {
    const el = ev.target;
    rememberQueueEdits(el);
    if (el.dataset.input === 'wardrobe-search') {
      S.filter.q = el.value;
      renderWardrobeGrid();
    } else if (/^ov-/.test(el.dataset.input || '')) {
      const ov = S.tryon.ov;
      const l = ov && ov.layers.find((x) => x.gid === ov.sel);
      if (!l) return;
      const v = Number(el.value);
      if (el.dataset.input === 'ov-size') l.w = v / 100;
      if (el.dataset.input === 'ov-rot') l.rot = v;
      if (el.dataset.input === 'ov-stretch') l.sy = v / 100;
      const c = $('#ov-canvas');
      if (c && ovPhoto) drawOverlay(c);
    } else if (el.dataset.input === 'compare') {
      el.closest('.compare').style.setProperty('--pos', `${el.value}%`);
    }
  });

  document.addEventListener('submit', async (ev) => {
    const form = ev.target;
    const kind = form.dataset.form;
    if (!kind) return;
    ev.preventDefault();
    const fd = Object.fromEntries(new FormData(form).entries());
    const btn = form.querySelector('button:not([type="button"])');
    const showError = (err) => {
      const box = $('#auth-error');
      if (box) box.innerHTML = `<div class="note error">${esc(STORE.niceError(err))}</div>`;
      else toast(STORE.niceError(err), 'error');
    };
    if (btn) btn.disabled = true;
    try {
      if (kind === 'login') await STORE.signIn(fd.email, fd.password);
      else if (kind === 'signup') await STORE.signUp(fd.name || '', fd.email, fd.password);
      else if (kind === 'forgot') {
        await STORE.resetPassword(fd.email);
        $('#auth-error').innerHTML = '<div class="note ok">If an account exists for this email, a reset link is on its way. Check your spam folder too.</div>';
      } else if (kind === 'gemini-key') {
        const k = String(fd.key || '').trim();
        if (k && !/^[A-Za-z0-9_\-]{30,}$/.test(k)) throw new Error('That doesn’t look like a Gemini API key. Copy it again from Google AI Studio.');
        IMG.setGeminiKey(k);
        toast(k ? 'Gemini key saved in this browser.' : 'Gemini key removed.', 'success');
        renderMain();
      } else if (kind === 'hf-token') {
        const tok = String(fd.token || '').trim();
        if (tok && !/^hf_[A-Za-z0-9]{10,}$/.test(tok)) throw new Error('That doesn’t look like a Hugging Face token. It starts with hf_.');
        IMG.setHfToken(tok);
        toast(tok ? 'Token saved in this browser.' : 'Token removed.', 'success');
        renderMain();
      } else if (kind === 'profile-name') {
        await STORE.set('profile/name', String(fd.name || '').trim().slice(0, 60));
        toast('Name saved.', 'success');
      } else if (kind === 'outfit') {
        const d = outfitDraft || {};
        const id = d.id || STORE.newId();
        const record = {
          id,
          name: String(fd.name || 'My outfit').slice(0, 80),
          upperId: fd.upperId || d.upperId || '',
          bottomId: fd.bottomId || d.bottomId || '',
          onePieceId: d.onePieceId || '',
          shoesId: d.shoesId || '',
          tryonId: d.tryonId || '',
          occasion: fd.occasion || '',
          style: fd.style || '',
          notes: String(fd.notes || '').slice(0, 500),
          favorite: Boolean(d.favorite),
          createdAt: d.createdAt || Date.now(),
        };
        await STORE.set(`outfits/${id}`, record);
        closeModal();
        toast('Outfit saved.', 'success');
      }
    } catch (err) {
      showError(err);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  async function runExtract(file) {
    const x = S.extract;
    x.busy = true;
    x.error = '';
    x.items = [];
    x.notes = [];
    x.preview = URL.createObjectURL(file);
    x.status = 'Preparing your photo…';
    renderMain();
    try {
      const res = await IMG.extractClothes(file, (t) => {
        x.status = t;
        if (screen() === 'extract') renderMain();
      });
      x.items = res.items.map((i) => ({ ...i, selected: true }));
      x.notes = res.notes;
    } catch (err) {
      x.error = err.message || 'Something went wrong.';
    } finally {
      x.busy = false;
      renderMain();
      const r = $('#extract-results');
      if (r && window.innerWidth < 900) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // =================================================================
  // start
  // =================================================================
  STORE.onAuth((user, mode) => {
    const was = S.user && S.user.uid;
    S.user = user;
    S.mode = mode;
    if (user && user.uid !== was) startWatching();
    if (!user && was) S.authView = 'login';
    if (!user) {
      unwatch.forEach((f) => f());
      unwatch = [];
      S.ready = false;
      Object.assign(S, { profile: {}, photos: {}, wardrobe: {}, outfits: {}, tryons: {}, settings: {}, addQueue: [] });
    }
    renderApp();
  });
})();
