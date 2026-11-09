/*
 * DRAPE store – sign-in and saving data.
 * ---------------------------------------------------------------
 * Uses Firebase (Authentication + Realtime Database) when js/config.js is
 * filled in. Without it, "Demo mode" keeps everything in memory only, so you
 * can try the app – nothing is saved when you close the tab.
 *
 * Everything a user saves lives under  users/<their id>/…  in the database,
 * and the security rules (firebase-rules.json) make it private to them.
 */
window.DRAPE_STORE = (function () {
  const cfg = window.DRAPE_CONFIG || { firebase: {} };
  const fb = cfg.firebase || {};
  const filledIn = Boolean(fb.apiKey && !/^PASTE/i.test(fb.apiKey) && fb.databaseURL && fb.projectId && fb.appId && !/^PASTE/i.test(fb.appId));
  const fromFile = location.protocol === 'file:';

  let auth = null;
  let db = null;
  let firebaseError = '';
  if (filledIn) {
    try {
      if (!window.firebase) throw new Error('Firebase could not be loaded – check your internet connection.');
      window.firebase.initializeApp(fb);
      auth = window.firebase.auth();
      db = window.firebase.database();
    } catch (err) {
      firebaseError = err.message || String(err);
      auth = null;
      db = null;
    }
  }

  let mode = null; // 'firebase' | 'demo'
  let user = null;
  let authKnown = !auth; // becomes true once Firebase has said whether someone is signed in
  let signingUp = false;
  const authListeners = new Set();
  const emit = () => authListeners.forEach((cb) => cb(user, mode));

  // ------------------------------------------------------------- demo store
  const demo = { data: {}, watchers: new Map() };
  const parts = (p) => String(p).split('/').filter(Boolean);
  function demoGet(path) {
    let cur = demo.data;
    for (const k of parts(path)) {
      if (cur == null || typeof cur !== 'object') return null;
      cur = cur[k];
    }
    return cur === undefined ? null : JSON.parse(JSON.stringify(cur));
  }
  function demoSet(path, value) {
    const p = parts(path);
    let cur = demo.data;
    for (const k of p.slice(0, -1)) {
      if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
      cur = cur[k];
    }
    if (value === null || value === undefined) delete cur[p[p.length - 1]];
    else cur[p[p.length - 1]] = JSON.parse(JSON.stringify(value));
  }
  const demoLast = new Map();
  function demoNotify() {
    demo.watchers.forEach((cbs, path) => {
      const v = demoGet(path);
      const json = JSON.stringify(v);
      if (demoLast.get(path) === json) return; // only tell screens about real changes
      demoLast.set(path, json);
      cbs.forEach((cb) => cb(v));
    });
  }

  // ----------------------------------------------------------------- helpers
  const userPath = (path) => `users/${user.uid}/${path}`;
  function niceError(err) {
    const code = err && err.code;
    const map = {
      'auth/invalid-credential': 'That email and password don’t match.',
      'auth/wrong-password': 'That email and password don’t match.',
      'auth/user-not-found': 'No account uses that email.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/email-already-in-use': 'An account already uses this email. Log in instead.',
      'auth/weak-password': 'Use at least 8 characters for your password.',
      'auth/missing-password': 'Please enter your password.',
      'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
      'auth/network-request-failed': 'No internet connection. Check it and try again.',
      'auth/popup-closed-by-user': 'The Google window was closed before finishing.',
      'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site.',
      'auth/unauthorized-domain': 'This website address is not allowed yet. In Firebase › Authentication › Settings › Authorised domains, add it.',
      'auth/operation-not-allowed': 'This sign-in method is switched off. Turn it on in Firebase › Authentication › Sign-in method.',
      'auth/operation-not-supported-in-this-environment': 'Sign-in does not work when the page is opened from a file. Open your website link instead, or use Demo mode.',
      'auth/requires-recent-login': 'For your safety, please enter your password again.',
      PERMISSION_DENIED: 'Saving was blocked by the database rules. Paste firebase-rules.json into Firebase › Realtime Database › Rules.',
    };
    if (code && map[code]) return map[code];
    if (String(err && err.message).includes('PERMISSION_DENIED')) return map.PERMISSION_DENIED;
    return (err && err.message) || 'Something went wrong. Please try again.';
  }

  if (auth) {
    auth.onAuthStateChanged(async (u) => {
      if (mode === 'demo') return;
      user = u ? { uid: u.uid, email: u.email || '', name: u.displayName || '', emailVerified: u.emailVerified, provider: (u.providerData[0] || {}).providerId || '' } : null;
      mode = u ? 'firebase' : null;
      if (u && !signingUp) {
        // Create the profile the first time someone signs in.
        const ref = db.ref(userPath('profile'));
        const snap = await ref.get().catch(() => null);
        if (snap && !snap.exists()) {
          await ref.set({ name: user.name || user.email.split('@')[0], email: user.email, createdAt: Date.now() }).catch(() => {});
        }
      }
      authKnown = true;
      emit();
    });
  }

  return {
    filledIn,
    fromFile,
    firebaseReady: Boolean(auth),
    firebaseError,
    get mode() {
      return mode;
    },
    get user() {
      return user;
    },
    niceError,

    onAuth(cb) {
      authListeners.add(cb);
      if (authKnown || mode === 'demo') cb(user, mode);
      return () => authListeners.delete(cb);
    },

    startDemo() {
      mode = 'demo';
      user = { uid: 'demo', email: 'demo@drape.app', name: 'Guest', emailVerified: true, provider: 'demo' };
      demoLast.clear();
      demo.data = { users: { demo: { profile: { name: 'Guest', email: 'demo@drape.app', createdAt: Date.now() } } } };
      emit();
    },

    async signUp(name, email, password) {
      signingUp = true; // this function writes the profile itself, with the right name
      try {
        const cred = await auth.createUserWithEmailAndPassword(email.trim(), password);
        if (name) await cred.user.updateProfile({ displayName: name.trim() });
        await db.ref(`users/${cred.user.uid}/profile`).set({ name: name.trim() || email.split('@')[0], email: email.trim(), createdAt: Date.now() });
        await cred.user.sendEmailVerification().catch(() => {});
        if (user) user.name = name.trim();
      } finally {
        signingUp = false;
      }
      emit();
    },
    signIn: (email, password) => auth.signInWithEmailAndPassword(email.trim(), password),
    async signInWithGoogle() {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await auth.signInWithPopup(provider);
    },
    resetPassword: (email) => auth.sendPasswordResetEmail(email.trim()),
    resendVerification: () => auth.currentUser && auth.currentUser.sendEmailVerification(),
    async refreshUser() {
      if (!auth || !auth.currentUser) return;
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      user.emailVerified = auth.currentUser.emailVerified;
      emit();
    },
    async signOut() {
      if (mode === 'demo') {
        mode = null;
        user = null;
        demo.data = {};
        emit();
        return;
      }
      await auth.signOut();
    },
    async getIdToken() {
      if (mode !== 'firebase' || !auth.currentUser) return '';
      return auth.currentUser.getIdToken();
    },
    async deleteAccount(password) {
      if (mode === 'demo') return this.signOut();
      const current = auth.currentUser;
      if (password && current.email) {
        const credential = window.firebase.auth.EmailAuthProvider.credential(current.email, password);
        await current.reauthenticateWithCredential(credential);
      } else {
        await current.reauthenticateWithPopup(new window.firebase.auth.GoogleAuthProvider());
      }
      await db.ref(`users/${current.uid}`).remove();
      await current.delete();
    },

    // ------------------------------------------------------ data (per user)
    watch(path, cb) {
      if (mode === 'demo') {
        const full = userPath(path);
        if (!demo.watchers.has(full)) demo.watchers.set(full, new Set());
        demo.watchers.get(full).add(cb);
        demoLast.set(full, JSON.stringify(demoGet(full)));
        cb(demoGet(full));
        return () => demo.watchers.get(full) && demo.watchers.get(full).delete(cb);
      }
      const ref = db.ref(userPath(path));
      const handler = (snap) => cb(snap.val());
      ref.on('value', handler, () => cb(null));
      return () => ref.off('value', handler);
    },
    async get(path) {
      if (mode === 'demo') return demoGet(userPath(path));
      const snap = await db.ref(userPath(path)).get();
      return snap.val();
    },
    async set(path, value) {
      if (mode === 'demo') {
        demoSet(userPath(path), value);
        demoNotify();
        return;
      }
      await db.ref(userPath(path)).set(value);
    },
    async update(values) {
      // values: { 'wardrobe/abc': {...}, 'images/abc': 'data:…' } – saved together.
      if (mode === 'demo') {
        Object.entries(values).forEach(([p, v]) => demoSet(userPath(p), v));
        demoNotify();
        return;
      }
      await db.ref(`users/${user.uid}`).update(values);
    },
    async remove(path) {
      return this.set(path, null);
    },
    newId() {
      const t = Date.now().toString(36);
      const r = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, '0')).join('');
      return `${t}${r}`.slice(0, 20);
    },
  };
})();
