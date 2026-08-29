/* teacher.js — PIN-protected class view, exports and card removal.
   The PIN keeps children out of each other's records on a shared computer.
   It is not real security: anyone with the device can clear browser storage. */

const Teacher = (() => {
  const $ = s => document.querySelector(s);

  function open() {
    const settings = Store.getSettings();
    $('#teacher-body').hidden = true;
    $('#pin-gate').hidden = false;
    $('#t-pin').value = '';
    $('#pin-hint').textContent = settings.teacherPin
      ? 'Enter the PIN you set earlier.'
      : 'First time here? Type any 4 digits to set the PIN.';
  }

  function checkPin() {
    const entered = $('#t-pin').value.trim();
    const settings = Store.getSettings();
    if (!settings.teacherPin) {
      if (entered.length < 4) return flash('Choose a PIN of at least 4 digits.');
      Store.saveSettings({ ...settings, teacherPin: entered });
      return unlock();
    }
    if (entered !== settings.teacherPin) return flash('That PIN does not match.');
    unlock();
  }

  function flash(msg) {
    const el = document.querySelector('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    setTimeout(() => el.classList.remove('is-on'), 2400);
  }

  function unlock() {
    $('#pin-gate').hidden = true;
    $('#teacher-body').hidden = false;
    $('#t-school').value = Store.getSettings().schoolName || '';
    renderTable();
    renderDeleteList();
  }

  function renderTable() {
    const table = $('#class-table');
    const profiles = Store.getProfiles();
    if (!profiles.length) {
      table.innerHTML = '<tr><td>No student cards on this device yet.</td></tr>';
      return;
    }
    const window30 = Store.daysBack(30);
    const head = ['Roll', 'Name', 'Class', 'Days logged', 'Fruit/veg days', 'Water 6+ days', 'Homework days', 'Avg read (min)'];
    const rows = profiles.map(p => {
      const log = Store.getLog(p.id);
      let logged = 0, produce = 0, water = 0, hw = 0, readTotal = 0;
      window30.forEach(k => {
        const d = log[k];
        if (!d) return;
        logged++;
        const groups = (d.foods || []).map(id => FOOD_BY_ID[id] && FOOD_BY_ID[id].group);
        if (groups.includes('fruit') || groups.includes('veg')) produce++;
        if ((d.water || 0) >= 6) water++;
        if (d.study && d.study.homework) hw++;
        readTotal += (d.study && d.study.read) || 0;
      });
      return [p.roll || '—', p.firstName, p.classSec, logged, produce, water, hw,
        logged ? Math.round(readTotal / logged) : 0];
    });

    table.innerHTML =
      '<thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead>' +
      '<tbody>' + rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody>';
  }

  function renderDeleteList() {
    const box = $('#delete-list');
    const profiles = Store.getProfiles();
    box.innerHTML = '';
    if (!profiles.length) { box.innerHTML = '<p class="empty">Nothing to remove.</p>'; return; }
    profiles.forEach(p => {
      const b = document.createElement('button');
      b.className = 'pill';
      b.innerHTML = `<b>${p.firstName}</b> · ${p.classSec} <span class="x">✕</span>`;
      b.onclick = () => {
        if (!confirm(`Remove ${p.firstName}'s card and all of their entries from this device?`)) return;
        Store.deleteProfile(p.id);
        renderTable(); renderDeleteList();
        App.renderWelcome();
        flash('Card removed.');
      };
      box.appendChild(b);
    });
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function wire() {
    $('#btn-pin').onclick = checkPin;
    $('#t-pin').addEventListener('keydown', e => { if (e.key === 'Enter') checkPin(); });

    $('#btn-save-school').onclick = () => {
      Store.saveSettings({ ...Store.getSettings(), schoolName: $('#t-school').value.trim() });
      App.renderWelcome();
      flash('School name saved.');
    };

    $('#btn-csv').onclick = () =>
      download(`class-summary-${Store.todayKey()}.csv`, Store.exportClassCsv(), 'text/csv');

    $('#btn-backup').onclick = () =>
      download(`dashboard-backup-${Store.todayKey()}.json`, Store.exportBackup(), 'application/json');

    $('#file-restore').onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          Store.importBackup(reader.result);
          unlock(); App.renderWelcome();
          flash('Backup restored.');
        } catch (err) {
          flash('That file could not be read.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    };
  }

  document.addEventListener('DOMContentLoaded', wire);
  if (document.readyState !== 'loading') wire();

  return { open };
})();
