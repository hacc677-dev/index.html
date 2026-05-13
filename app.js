(function(){
  // Central app state for the demo: storage, auth, theme, language and shared UI helpers.
  // NOTE: Storage is wrapped in safe helpers so the demo still works even when the browser
  // restricts localStorage/sessionStorage on file:// or private browsing contexts.
  const STORAGE_KEYS = {
    accounts: 'promptpilot_accounts',
    user: 'promptpilot_user',
    lang: 'promptpilot_lang',
    auth: 'promptpilot_auth',
    theme: 'promptpilot_theme',
    loginGate: 'promptpilot_login_gate',
    loginPrefill: 'promptpilot_login_prefill'
  };

  const EMPTY_USER = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    classLevel: '',
    role: '',
    roleKey: '',
    purpose: '',
    avatar: ''
  };

  const memoryStore = window.__promptpilotMemoryStore || (window.__promptpilotMemoryStore = {
    local: {},
    session: {}
  });

  function safeJsonParse(value, fallback){
    if(value === null || value === undefined || value === '') return fallback;
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function normalizeEmail(email){
    return String(email || '').trim().toLowerCase();
  }

  function readStorage(area, key){
    try{
      const store = area === 'session' ? window.sessionStorage : window.localStorage;
      const value = store.getItem(key);
      if(value !== null && value !== undefined) return value;
    }catch(_err){
      // fall back to in-memory storage below
    }
    return Object.prototype.hasOwnProperty.call(memoryStore[area], key) ? memoryStore[area][key] : null;
  }

  function writeStorage(area, key, value){
    const stringValue = String(value);
    try{
      const store = area === 'session' ? window.sessionStorage : window.localStorage;
      store.setItem(key, stringValue);
    }catch(_err){
      memoryStore[area][key] = stringValue;
    }
  }

  function removeStorage(area, key){
    try{
      const store = area === 'session' ? window.sessionStorage : window.localStorage;
      store.removeItem(key);
    }catch(_err){
      delete memoryStore[area][key];
    }
  }

  function getAccounts(){
    return safeJsonParse(readStorage('local', STORAGE_KEYS.accounts), []);
  }

  function setAccounts(accounts){
    writeStorage('local', STORAGE_KEYS.accounts, JSON.stringify(Array.isArray(accounts) ? accounts : []));
  }

  function upsertAccount(user){
    if(!user || !user.email) return;
    const accounts = getAccounts();
    const next = { ...EMPTY_USER, ...user };
    const idx = accounts.findIndex(item => normalizeEmail(item.email) === normalizeEmail(next.email));
    if(idx >= 0){
      accounts[idx] = { ...accounts[idx], ...next };
    }else{
      accounts.unshift(next);
    }
    setAccounts(accounts);
  }

  function updateAccountByEmail(previousEmail, user){
    if(!user || !user.email) return null;
    const accounts = getAccounts();
    const next = { ...EMPTY_USER, ...user };
    const prevKey = normalizeEmail(previousEmail || next.email);
    const idx = accounts.findIndex(item => normalizeEmail(item.email) === prevKey);
    if(idx >= 0){
      accounts[idx] = { ...accounts[idx], ...next };
    }else{
      const fallbackIdx = accounts.findIndex(item => normalizeEmail(item.email) === normalizeEmail(next.email));
      if(fallbackIdx >= 0){
        accounts[fallbackIdx] = { ...accounts[fallbackIdx], ...next };
      }else{
        accounts.unshift(next);
      }
    }
    setAccounts(accounts);
    writeStorage('local', STORAGE_KEYS.user, JSON.stringify(next));
    return next;
  }

  function findAccountByEmail(email){
    return getAccounts().find(item => normalizeEmail(item.email) === normalizeEmail(email));
  }

  function findAccount(email, password){
    return getAccounts().find(item => normalizeEmail(item.email) === normalizeEmail(email) && String(item.password || '') === String(password || '')) || null;
  }

  function getUser(){
    const raw = readStorage('local', STORAGE_KEYS.user);
    return raw ? { ...EMPTY_USER, ...safeJsonParse(raw, EMPTY_USER) } : { ...EMPTY_USER };
  }

  function setUser(user){
    const next = { ...EMPTY_USER, ...user };
    writeStorage('local', STORAGE_KEYS.user, JSON.stringify(next));
    upsertAccount(next);
    return next;
  }

  function ensureDemoSeed(){
    if(!readStorage('local', STORAGE_KEYS.lang)){
      writeStorage('local', STORAGE_KEYS.lang, 'vi');
    }
    if(!readStorage('local', STORAGE_KEYS.theme)){
      writeStorage('local', STORAGE_KEYS.theme, 'light');
    }
  }

  function getLanguage(){
    return readStorage('local', STORAGE_KEYS.lang) || 'vi';
  }

  function setLanguage(lang){
    writeStorage('local', STORAGE_KEYS.lang, lang === 'en' ? 'en' : 'vi');
    document.documentElement.lang = getLanguage();
    if(window.Language && typeof window.Language.apply === 'function'){
      window.Language.apply();
    }
    if(window.Components && typeof window.Components.renderAll === 'function'){
      window.Components.renderAll();
    }
  }

  function getTheme(){
    return readStorage('local', STORAGE_KEYS.theme) === 'dark' ? 'dark' : 'light';
  }

  function setTheme(theme){
    const next = theme === 'dark' ? 'dark' : 'light';
    writeStorage('local', STORAGE_KEYS.theme, next);
    document.body.dataset.theme = next;
    if(window.Settings && typeof window.Settings.syncTheme === 'function'){
      window.Settings.syncTheme();
    }
    if(window.Components && typeof window.Components.syncLanguagePills === 'function'){
      window.Components.syncLanguagePills();
    }
  }

  function isAuthed(){
    return readStorage('session', STORAGE_KEYS.auth) === '1';
  }

  function setAuthed(flag){
    if(flag){
      writeStorage('session', STORAGE_KEYS.auth, '1');
    }else{
      removeStorage('session', STORAGE_KEYS.auth);
    }
  }

  function getLoginGate(){
    return readStorage('session', STORAGE_KEYS.loginGate) === '1';
  }

  function setLoginGate(flag){
    if(flag){
      writeStorage('session', STORAGE_KEYS.loginGate, '1');
    }else{
      removeStorage('session', STORAGE_KEYS.loginGate);
    }
  }

  function getLoginPrefill(){
    const raw = readStorage('session', STORAGE_KEYS.loginPrefill);
    return raw ? safeJsonParse(raw, { email: '', password: '' }) : { email: '', password: '' };
  }

  function setLoginPrefill(payload){
    const next = {
      email: String(payload?.email || '').trim(),
      password: String(payload?.password || '').trim()
    };
    writeStorage('session', STORAGE_KEYS.loginPrefill, JSON.stringify(next));
    return next;
  }

  function clearLoginPrefill(){
    removeStorage('session', STORAGE_KEYS.loginPrefill);
  }

  function resetLoginFlow(){
    removeStorage('session', STORAGE_KEYS.auth);
    removeStorage('session', STORAGE_KEYS.loginGate);
    removeStorage('session', STORAGE_KEYS.loginPrefill);
  }

  function canAttemptLogin(){
    return getLoginGate();
  }

  function initials(name){
    const clean = String(name || '').trim();
    if(!clean) return 'PP';
    if(!clean.includes(' ') && clean.length <= 2) return clean.toUpperCase();
    return clean
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || 'PP';
  }

  function escapeHtml(text){
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderAvatarMarkup(user, className = ''){
    const name = user && user.fullName ? user.fullName : 'PromptPilot';
    if(user && user.avatar){
      return `<img class="avatar-photo ${className}" src="${escapeHtml(user.avatar)}" alt="${escapeHtml(name)}" />`;
    }
    return `<span class="avatar-fallback ${className}">${escapeHtml(initials(name))}</span>`;
  }

  function toast(title, message, type = 'success'){
    const root = document.getElementById('toastRoot');
    if(!root) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>`;
    root.appendChild(el);
    window.setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      window.setTimeout(() => el.remove(), 220);
    }, 2600);
  }

  function showLoading(show){
    const overlay = document.getElementById('loadingOverlay');
    if(!overlay) return;
    overlay.classList.toggle('hidden', !show);
    overlay.setAttribute('aria-hidden', String(!show));
  }

  function openModal(id){
    const el = document.getElementById(id);
    if(el) el.classList.remove('hidden');
  }

  function closeModal(id){
    const el = document.getElementById(id);
    if(el) el.classList.add('hidden');
  }

  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject();
  }

  function setHeaderActiveLinks(){
    const page = document.body.dataset.page;
    document.querySelectorAll('[data-nav-item]').forEach(link => {
      const target = link.getAttribute('data-nav-item');
      link.classList.toggle('active', target === page);
    });
  }

  function fillProfilePreview(targets = {}){
    const user = getUser();
    const nameEl = document.getElementById(targets.name || 'previewName');
    const emailEl = document.getElementById(targets.email || 'previewEmail');
    if(nameEl) nameEl.textContent = user.fullName || '—';
    if(emailEl) emailEl.textContent = user.email || '—';
  }

  function guardAuth(){
    const page = document.body.dataset.page;
    if(page === 'login') return;
    if(!isAuthed()){
      window.location.href = (document.body.dataset.base || '') + 'index.html';
    }
  }

  function bindPageTransitions(){
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if(!link) return;
      if(link.target === '_blank' || link.hasAttribute('download')) return;
      const href = link.getAttribute('href') || '';
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      const resolved = new URL(href, window.location.href);
      if(resolved.origin !== window.location.origin) return;
      if(!resolved.pathname.endsWith('.html')) return;
      event.preventDefault();
      document.body.classList.add('page-leaving');
      window.setTimeout(() => {
        window.location.href = resolved.href;
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 130);
    }, true);
  }

  function ready(fn){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', fn);
    }else{
      fn();
    }
  }

  window.App = {
    STORAGE_KEYS,
    EMPTY_USER,
    readStorage,
    writeStorage,
    removeStorage,
    getAccounts,
    setAccounts,
    upsertAccount,
    updateAccountByEmail,
    findAccountByEmail,
    findAccount,
    ensureDemoSeed,
    getUser,
    setUser,
    getLanguage,
    setLanguage,
    getTheme,
    setTheme,
    isAuthed,
    setAuthed,
    getLoginGate,
    setLoginGate,
    canAttemptLogin,
    getLoginPrefill,
    setLoginPrefill,
    clearLoginPrefill,
    resetLoginFlow,
    initials,
    renderAvatarMarkup,
    toast,
    showLoading,
    openModal,
    closeModal,
    copyText,
    setHeaderActiveLinks,
    guardAuth,
    fillProfilePreview,
    bindPageTransitions,
    ready,
    escapeHtml
  };

  ready(() => {
    ensureDemoSeed();
    document.documentElement.lang = getLanguage();
    document.body.dataset.theme = getTheme();
    setHeaderActiveLinks();
    bindPageTransitions();
    guardAuth();
  });
})();
