/* storage.js — everything lives in this browser. Nothing is sent anywhere.
   Keys:
     shd.settings          { schoolName, teacherPin }
     shd.profiles          [ {id, firstName, roll, classSec, dobYM, heights:[{ym, cm}]} ]
     shd.active            profile id
     shd.log.<profileId>   { "YYYY-MM-DD": { foods:[], water:0, study:{}, } }
*/

const Store = (() => {
  const K = {
    settings: 'shd.settings',
    profiles: 'shd.profiles',
    active: 'shd.active',
    log: id => 'shd.log.' + id
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('Could not read', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      alert('This device has no space left to save. Ask your teacher for help.');
      return false;
    }
  }

  /* ---------- dates ---------- */
  function todayKey(d = new Date()) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function daysBack(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(todayKey(d));
    }
    return out;
  }

  function prettyDate(key) {
    const [y, m, d] = key.split('-').map(Number);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d} ${months[m - 1]}`;
  }

  /* ---------- settings ---------- */
  const getSettings = () => read(K.settings, { schoolName: '', teacherPin: '' });
  const saveSettings = s => write(K.settings, s);

  /* ---------- profiles ---------- */
  const getProfiles = () => read(K.profiles, []);

  function addProfile(p) {
    const profiles = getProfiles();
    const profile = {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      firstName: p.firstName.trim(),
      roll: (p.roll || '').trim(),
      classSec: p.classSec,
      dobYM: p.dobYM || '',
      heights: p.heightCm ? [{ ym: currentYM(), cm: Number(p.heightCm) }] : [],
      createdAt: todayKey()
    };
    profiles.push(profile);
    write(K.profiles, profiles);
    return profile;
  }

  function updateProfile(id, patch) {
    const profiles = getProfiles();
    const i = profiles.findIndex(p => p.id === id);
    if (i === -1) return null;
    profiles[i] = { ...profiles[i], ...patch };
    write(K.profiles, profiles);
    return profiles[i];
  }

  function deleteProfile(id) {
    write(K.profiles, getProfiles().filter(p => p.id !== id));
    localStorage.removeItem(K.log(id));
    if (getActiveId() === id) localStorage.removeItem(K.active);
  }

  const getActiveId = () => localStorage.getItem(K.active);
  const setActiveId = id => localStorage.setItem(K.active, id);
  const clearActive = () => localStorage.removeItem(K.active);
  const getActive = () => getProfiles().find(p => p.id === getActiveId()) || null;

  function currentYM(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function ageFromDobYM(dobYM) {
    if (!dobYM) return null;
    const [y, m] = dobYM.split('-').map(Number);
    const now = new Date();
    let years = now.getFullYear() - y;
    let months = now.getMonth() + 1 - m;
    if (months < 0) { years -= 1; months += 12; }
    return { years, months };
  }

  /* ---------- daily log ---------- */
  const blankDay = () => ({
    foods: [],
    water: 0,
    study: { homework: false, read: 0, play: 0, bedtime: false }
  });

  const getLog = id => read(K.log(id), {});

  function getDay(id, dateKey = todayKey()) {
    const log = getLog(id);
    return { ...blankDay(), ...(log[dateKey] || {}) };
  }

  function saveDay(id, dateKey, day) {
    const log = getLog(id);
    log[dateKey] = day;
    write(K.log(id), log);
  }

  function toggleFood(id, foodId, dateKey = todayKey()) {
    const day = getDay(id, dateKey);
    const i = day.foods.indexOf(foodId);
    if (i === -1) day.foods.push(foodId); else day.foods.splice(i, 1);
    saveDay(id, dateKey, day);
    return day;
  }

  function setWater(id, n, dateKey = todayKey()) {
    const day = getDay(id, dateKey);
    day.water = Math.max(0, Math.min(12, n));
    saveDay(id, dateKey, day);
    return day;
  }

  function setStudy(id, patch, dateKey = todayKey()) {
    const day = getDay(id, dateKey);
    day.study = { ...day.study, ...patch };
    saveDay(id, dateKey, day);
    return day;
  }

  /* ---------- height ---------- */
  function addHeight(id, cm) {
    const p = getProfiles().find(x => x.id === id);
    if (!p) return;
    const heights = (p.heights || []).filter(h => h.ym !== currentYM());
    heights.push({ ym: currentYM(), cm: Number(cm) });
    heights.sort((a, b) => a.ym.localeCompare(b.ym));
    updateProfile(id, { heights });
  }

  /* ---------- export ---------- */
  function exportClassCsv() {
    const rows = [['Roll', 'Name', 'Class', 'Days logged (30)', 'Days with fruit or veg', 'Days water 6+', 'Days homework done', 'Avg reading min']];
    const window30 = daysBack(30);
    getProfiles().forEach(p => {
      const log = getLog(p.id);
      let logged = 0, produce = 0, hydrated = 0, hw = 0, readTotal = 0;
      window30.forEach(k => {
        const d = log[k];
        if (!d) return;
        logged++;
        const groups = (d.foods || []).map(f => (FOOD_BY_ID[f] ? FOOD_BY_ID[f].group : null));
        if (groups.includes('fruit') || groups.includes('veg')) produce++;
        if ((d.water || 0) >= 6) hydrated++;
        if (d.study && d.study.homework) hw++;
        readTotal += (d.study && d.study.read) || 0;
      });
      rows.push([p.roll, p.firstName, p.classSec, logged, produce, hydrated, hw, logged ? Math.round(readTotal / logged) : 0]);
    });
    return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  function exportBackup() {
    const dump = { settings: getSettings(), profiles: getProfiles(), logs: {} };
    getProfiles().forEach(p => { dump.logs[p.id] = getLog(p.id); });
    return JSON.stringify(dump, null, 2);
  }

  function importBackup(json) {
    const dump = JSON.parse(json);
    if (!dump.profiles) throw new Error('This file is not a dashboard backup.');
    write(K.settings, dump.settings || {});
    write(K.profiles, dump.profiles);
    Object.entries(dump.logs || {}).forEach(([id, log]) => write(K.log(id), log));
  }

  return {
    todayKey, daysBack, prettyDate, currentYM, ageFromDobYM,
    getSettings, saveSettings,
    getProfiles, addProfile, updateProfile, deleteProfile,
    getActiveId, setActiveId, clearActive, getActive,
    getLog, getDay, saveDay, toggleFood, setWater, setStudy, addHeight,
    exportClassCsv, exportBackup, importBackup
  };
})();
