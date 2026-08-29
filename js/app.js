/* app.js — screens, the thali, the food picker, week graphs, badges, growth. */

(() => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  let state = { profile: null, day: null, filter: 'all', search: '', seenBadges: [] };

  /* ---------------- helpers ---------------- */
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  function show(name) {
    $$('.screen').forEach(s => s.classList.remove('is-on'));
    $('#screen-' + name).classList.add('is-on');
    window.scrollTo(0, 0);
  }

  function classOptions() {
    const sel = $('#f-class');
    ['3', '4', '5'].forEach(c => ['A', 'B', 'C', 'D'].forEach(s => {
      const o = document.createElement('option');
      o.value = `${c}-${s}`;
      o.textContent = `Class ${c} ${s}`;
      sel.appendChild(o);
    }));
  }

  /* ---------------- welcome ---------------- */
  function renderWelcome() {
    const list = $('#profile-list');
    const profiles = Store.getProfiles();
    const school = Store.getSettings().schoolName;
    $('#welcome-school').textContent = school || 'A daily card for Classes 3–5';
    list.innerHTML = '';

    if (!profiles.length) {
      list.innerHTML = '<p class="empty">No cards yet. Make the first one below.</p>';
      return;
    }
    profiles
      .slice()
      .sort((a, b) => a.classSec.localeCompare(b.classSec) || a.firstName.localeCompare(b.firstName))
      .forEach(p => {
        const b = document.createElement('button');
        b.className = 'profile-btn';
        b.innerHTML = `<span class="avatar">${p.firstName[0].toUpperCase()}</span>
          <span><b>${p.firstName}</b><small>Class ${p.classSec}${p.roll ? ' · Roll ' + p.roll : ''}</small></span>`;
        b.onclick = () => openProfile(p.id);
        list.appendChild(b);
      });
  }

  function openProfile(id) {
    Store.setActiveId(id);
    state.profile = Store.getProfiles().find(p => p.id === id);
    state.seenBadges = Rewards.evaluate(state.profile).unlockedIds;
    state.day = Store.getDay(id);
    show('main');
    renderAll();
  }

  /* ---------------- setup ---------------- */
  function saveProfile() {
    const firstName = $('#f-name').value.trim();
    const classSec = $('#f-class').value;
    if (!firstName) return toast('Please write your first name.');
    if (!classSec) return toast('Please choose your class and section.');

    const heightVal = Number($('#f-height').value);
    if ($('#f-height').value && (heightVal < 80 || heightVal > 200)) {
      return toast('Height should be between 80 and 200 cm. Please measure again.');
    }

    const p = Store.addProfile({
      firstName,
      roll: $('#f-roll').value,
      classSec,
      dobYM: $('#f-dob').value,
      heightCm: $('#f-height').value ? heightVal : null
    });
    ['#f-name', '#f-roll', '#f-dob', '#f-height'].forEach(s => ($(s).value = ''));
    $('#f-class').value = '';
    toast('Card made. Welcome, ' + p.firstName + '!');
    openProfile(p.id);
  }

  /* ---------------- the thali ---------------- */
  const CENTER = 110, RADIUS = 86, INNER = 30;

  function buildThali() {
    const svg = $('#thali');
    svg.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';

    const rim = document.createElementNS(ns, 'circle');
    rim.setAttribute('cx', CENTER); rim.setAttribute('cy', CENTER);
    rim.setAttribute('r', RADIUS + 12);
    rim.setAttribute('fill', 'var(--steel)');
    svg.appendChild(rim);

    PLATE_GROUPS.forEach((g, i) => {
      const a0 = (-90 + i * 72) * Math.PI / 180;
      const a1 = (-90 + (i + 1) * 72) * Math.PI / 180;
      const gap = 0.02;
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', sector(a0 + gap, a1 - gap));
      p.setAttribute('class', 'wedge');
      p.setAttribute('fill', '#fff');
      p.dataset.group = g;
      svg.appendChild(p);

      const mid = (a0 + a1) / 2;
      const r = (RADIUS + INNER) / 2;
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', CENTER + Math.cos(mid) * r);
      t.setAttribute('y', CENTER + Math.sin(mid) * r + 8);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'wedge-icon');
      t.dataset.icon = g;
      t.textContent = FOOD_GROUPS[g].icon;
      t.setAttribute('opacity', '.25');
      svg.appendChild(t);
    });

    const hole = document.createElementNS(ns, 'circle');
    hole.setAttribute('cx', CENTER); hole.setAttribute('cy', CENTER);
    hole.setAttribute('r', INNER - 4);
    hole.setAttribute('fill', 'var(--card)');
    svg.appendChild(hole);

    const score = document.createElementNS(ns, 'text');
    score.setAttribute('id', 'plate-score');
    score.setAttribute('x', CENTER); score.setAttribute('y', CENTER + 7);
    score.setAttribute('text-anchor', 'middle');
    score.setAttribute('font-family', "'Baloo 2', sans-serif");
    score.setAttribute('font-size', '22');
    score.setAttribute('font-weight', '700');
    score.setAttribute('fill', 'var(--ink)');
    score.textContent = '0/5';
    svg.appendChild(score);
  }

  function sector(a0, a1) {
    const p = (r, a) => [CENTER + Math.cos(a) * r, CENTER + Math.sin(a) * r];
    const [x0, y0] = p(RADIUS, a0), [x1, y1] = p(RADIUS, a1);
    const [x2, y2] = p(INNER, a1), [x3, y3] = p(INNER, a0);
    return `M${x0},${y0} A${RADIUS},${RADIUS} 0 0 1 ${x1},${y1} L${x2},${y2} A${INNER},${INNER} 0 0 0 ${x3},${y3} Z`;
  }

  const PLATE_MSG = [
    'Tap a food below to start filling your plate.',
    'Good start. What else did you eat?',
    'Two parts filled. Try adding a vegetable or a fruit.',
    'Three parts. Your plate is getting colourful.',
    'Four parts filled — that is a Rainbow Plate!',
    'All five parts. A complete thali today!'
  ];

  function renderPlate() {
    const groups = new Set();
    let sometimes = 0;
    state.day.foods.forEach(id => {
      const f = FOOD_BY_ID[id];
      if (!f) return;
      if (f.group === 'sometimes') sometimes++; else groups.add(f.group);
    });

    PLATE_GROUPS.forEach(g => {
      const wedge = $(`#thali .wedge[data-group="${g}"]`);
      const icon = $(`#thali .wedge-icon[data-icon="${g}"]`);
      const on = groups.has(g);
      wedge.setAttribute('fill', on ? FOOD_GROUPS[g].color : '#fff');
      wedge.setAttribute('opacity', on ? '1' : '.9');
      icon.setAttribute('opacity', on ? '1' : '.25');
    });

    const score = $('#plate-score');
    if (score) score.textContent = groups.size + '/5';
    $('#plate-msg').textContent = PLATE_MSG[groups.size];

    const katori = $('#katori');
    katori.hidden = sometimes === 0;
    katori.querySelector('.katori__count').textContent = sometimes;

    const legend = $('#legend');
    legend.innerHTML = '';
    PLATE_GROUPS.forEach(g => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="dot" style="background:${FOOD_GROUPS[g].color}"></span>
        ${FOOD_GROUPS[g].label}
        <span class="done">${groups.has(g) ? '✓ done' : '—'}</span>`;
      legend.appendChild(li);
    });
  }

  /* ---------------- water & study ---------------- */
  function renderWater() {
    const box = $('#glasses');
    box.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const g = document.createElement('div');
      g.className = 'glass' + (i < state.day.water ? ' is-full' : '');
      box.appendChild(g);
    }
    $('#water-count').textContent = state.day.water;
  }

  function renderStudy() {
    const s = state.day.study;
    $('#s-homework').classList.toggle('is-on', !!s.homework);
    $('#s-bedtime').classList.toggle('is-on', !!s.bedtime);
    $('#s-read').textContent = s.read || 0;
    $('#s-play').textContent = s.play || 0;
  }

  /* ---------------- food picker ---------------- */
  function renderGroupFilter() {
    const box = $('#group-filter');
    box.innerHTML = '';
    const make = (key, label, color) => {
      const b = document.createElement('button');
      b.className = 'chip' + (state.filter === key ? ' is-on' : '');
      b.textContent = label;
      if (state.filter === key) b.style.background = color, b.style.borderColor = color;
      b.onclick = () => { state.filter = key; renderGroupFilter(); renderFoodGrid(); };
      box.appendChild(b);
    };
    make('all', 'All', 'var(--ink)');
    Object.entries(FOOD_GROUPS).forEach(([k, g]) => make(k, g.icon + ' ' + g.short, g.color));
  }

  function renderFoodGrid() {
    const grid = $('#food-grid');
    const q = state.search.toLowerCase();
    grid.innerHTML = '';
    const list = FOODS.filter(f =>
      (state.filter === 'all' || f.group === state.filter) &&
      (!q || f.name.toLowerCase().includes(q))
    );
    if (!list.length) {
      grid.innerHTML = '<p class="empty">No food found. Try another word.</p>';
      return;
    }
    list.forEach(f => {
      const on = state.day.foods.includes(f.id);
      const b = document.createElement('button');
      b.className = 'food' + (on ? ' is-on' : '');
      b.style.borderColor = on ? FOOD_GROUPS[f.group].color : '';
      b.innerHTML = `<span class="food__icon">${f.icon}</span><span>${f.name}</span>`;
      b.onclick = () => {
        state.day = Store.toggleFood(state.profile.id, f.id);
        if (!on) toast(`${f.icon} ${f.name} — ${f.fact}`);
        renderToday();
        checkNewBadges();
      };
      grid.appendChild(b);
    });
  }

  function renderChosen() {
    const box = $('#chosen');
    box.innerHTML = '';
    if (!state.day.foods.length) {
      box.innerHTML = '<p class="empty">Nothing added yet today.</p>';
      return;
    }
    state.day.foods.forEach(id => {
      const f = FOOD_BY_ID[id];
      if (!f) return;
      const b = document.createElement('button');
      b.className = 'pill';
      b.style.borderColor = FOOD_GROUPS[f.group].color;
      b.innerHTML = `${f.icon} <b>${f.name}</b> <span class="x">✕</span>`;
      b.title = 'Remove ' + f.name;
      b.onclick = () => { state.day = Store.toggleFood(state.profile.id, id); renderToday(); };
      box.appendChild(b);
    });
  }

  /* ---------------- week ---------------- */
  function renderWeek() {
    const log = Store.getLog(state.profile.id);
    const week = Store.daysBack(7);
    const dayLabel = k => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(k + 'T00:00:00').getDay()];

    const groupData = Object.entries(FOOD_GROUPS).map(([key, g]) => {
      let days = 0;
      week.forEach(k => {
        const foods = (log[k] && log[k].foods) || [];
        if (foods.some(id => FOOD_BY_ID[id] && FOOD_BY_ID[id].group === key)) days++;
      });
      return { label: g.short, value: days, color: g.color };
    });
    Charts.bars($('#chart-groups'), groupData, { min: 7 });

    Charts.bars($('#chart-water'),
      week.map(k => ({ label: dayLabel(k), value: (log[k] && log[k].water) || 0, color: 'var(--water)' })),
      { min: 8 });

    Charts.bars($('#chart-read'),
      week.map(k => ({ label: dayLabel(k), value: (log[k] && log[k].study && log[k].study.read) || 0, color: 'var(--study)' })),
      { min: 30 });

    const veg = groupData.find(g => g.label === 'Veg').value;
    const fruit = groupData.find(g => g.label === 'Fruit').value;
    const qs = [
      'Which bar is the tallest? Which is the shortest?',
      `You ate a vegetable on ${veg} day${veg === 1 ? '' : 's'} and a fruit on ${fruit}. Which one can you raise next week?`,
      'On how many days did you drink 6 glasses or more?',
      'Draw this week\'s water graph in your Maths notebook and show it to a friend.'
    ];
    $('#week-questions').innerHTML = qs.map(q => `<li>${q}</li>`).join('');
  }

  /* ---------------- badges ---------------- */
  function renderBadges() {
    const { badges } = Rewards.evaluate(state.profile);
    const box = $('#badges');
    box.innerHTML = '';
    badges.forEach(b => {
      const d = document.createElement('div');
      d.className = 'badge' + (b.unlocked ? ' is-on' : '');
      d.innerHTML = `<span class="badge__icon">${b.icon}</span>
        <span class="badge__name">${b.name}</span>
        <span class="badge__how">${b.how}</span>`;
      box.appendChild(d);
    });
    $('#badge-count').textContent =
      `${badges.filter(b => b.unlocked).length} of ${badges.length} collected`;
  }

  function checkNewBadges() {
    const { unlockedIds, ctx } = Rewards.evaluate(state.profile);
    $('#streak-chip').innerHTML = `🔥 <b>${ctx.currentStreak}</b>`;
    const fresh = unlockedIds.filter(id => !state.seenBadges.includes(id));
    state.seenBadges = unlockedIds;
    if (fresh.length) {
      const b = Rewards.BADGES.find(x => x.id === fresh[0]);
      setTimeout(() => toast(`New badge! ${b.icon} ${b.name}`), 900);
    }
  }

  /* ---------------- growth ---------------- */
  function renderGrow() {
    const heights = (state.profile.heights || []).slice().sort((a, b) => a.ym.localeCompare(b.ym));
    const canvas = $('#chart-height');
    const empty = $('#grow-empty');
    const summary = $('#grow-summary');

    if (heights.length < 2) {
      canvas.hidden = true;
      empty.hidden = false;
      empty.textContent = heights.length
        ? `You have one measurement: ${heights[0].cm} cm. Measure again next month to see your line.`
        : 'Add your height once a month and a line will appear here.';
      summary.textContent = '';
    } else {
      empty.hidden = true;
      canvas.hidden = false;
      const short = ym => {
        const [y, m] = ym.split('-');
        return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1] + ' ' + y.slice(2);
      };
      Charts.line(canvas, heights.map(h => ({ label: short(h.ym), value: h.cm })));
      const grown = heights[heights.length - 1].cm - heights[0].cm;
      summary.textContent = grown > 0
        ? `You have grown ${grown.toFixed(1)} cm since you started measuring. Well done, scientist!`
        : 'Keep measuring every month — growing takes time.';
    }

    const age = Store.ageFromDobYM(state.profile.dobYM);
    const last = heights[heights.length - 1];
    $('#g-height').value = '';
    $('#g-height').placeholder = last ? last.cm : '';
    if (age) $('#who-meta').textContent = `Class ${state.profile.classSec} · ${age.years} years ${age.months} months`;
  }

  /* ---------------- learn ---------------- */
  function renderLearn() {
    const plant = $('#from-plant'), animal = $('#from-animal');
    plant.innerHTML = ''; animal.innerHTML = '';
    const seen = new Set();
    state.day.foods.forEach(id => {
      const f = FOOD_BY_ID[id];
      if (!f || seen.has(id)) return;
      seen.add(id);
      const add = target => {
        const s = document.createElement('span');
        s.className = 'pill pill--static';
        s.innerHTML = `${f.icon} <b>${f.name}</b>`;
        target.appendChild(s);
      };
      if (f.source === 'plant' || f.source === 'both') add(plant);
      if (f.source === 'animal' || f.source === 'both') add(animal);
    });
    if (!plant.children.length) plant.innerHTML = '<p class="empty">Add today\'s food first.</p>';
    if (!animal.children.length) animal.innerHTML = '<p class="empty">Nothing here today.</p>';

    const grid = $('#learn-groups');
    if (!grid.children.length) {
      const notes = {
        grain: 'Roti, rice and millets. They give your body energy to run and think.',
        protein: 'Dal, beans, egg, paneer. They build muscles and help cuts heal.',
        veg: 'All the colours. They protect you from falling ill.',
        fruit: 'Sweet and full of water and vitamins.',
        dairy: 'Milk, curd, paneer. Strong bones and teeth.',
        sometimes: 'Sweets, fried snacks, cold drinks. Made for festivals and treats.'
      };
      Object.entries(FOOD_GROUPS).forEach(([k, g]) => {
        const d = document.createElement('div');
        d.className = 'learn-item';
        d.style.background = g.color;
        d.innerHTML = `<h3>${g.icon} ${g.label}</h3><p>${notes[k]}</p>`;
        grid.appendChild(d);
      });
    }
  }

  /* ---------------- render orchestration ---------------- */
  function renderToday() {
    renderPlate();
    renderWater();
    renderStudy();
    renderFoodGrid();
    renderChosen();
  }

  function renderAll() {
    const p = state.profile;
    $('#who-avatar').textContent = p.firstName[0].toUpperCase();
    $('#who-name').textContent = p.firstName;
    const age = Store.ageFromDobYM(p.dobYM);
    $('#who-meta').textContent = 'Class ' + p.classSec + (age ? ` · ${age.years} years ${age.months} months` : '');

    const d = new Date();
    $('#datestamp').textContent = d.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const { ctx } = Rewards.evaluate(p);
    $('#streak-chip').innerHTML = `🔥 <b>${ctx.currentStreak}</b>`;

    renderGroupFilter();
    renderToday();
    renderWeek();
    renderBadges();
    renderGrow();
    renderLearn();
  }

  /* ---------------- events ---------------- */
  function wire() {
    classOptions();
    buildThali();

    $('#btn-new-profile').onclick = () => show('setup');
    $('#btn-save-profile').onclick = saveProfile;
    $('#btn-open-teacher').onclick = () => { Teacher.open(); show('teacher'); };
    $('#btn-open-teacher-2').onclick = () => { Teacher.open(); show('teacher'); };
    $('#who').onclick = () => { renderWelcome(); show('welcome'); };

    $$('[data-go]').forEach(b => b.onclick = () => {
      if (b.dataset.go === 'welcome') { renderWelcome(); }
      show(b.dataset.go);
    });

    $$('.tab').forEach(t => t.onclick = () => {
      $$('.tab').forEach(x => x.classList.remove('is-on'));
      $$('.panel').forEach(x => x.classList.remove('is-on'));
      t.classList.add('is-on');
      $('#panel-' + t.dataset.tab).classList.add('is-on');
      if (t.dataset.tab === 'week') renderWeek();
      if (t.dataset.tab === 'grow') renderGrow();
      if (t.dataset.tab === 'badges') renderBadges();
      if (t.dataset.tab === 'learn') renderLearn();
    });

    $('#food-search').oninput = e => { state.search = e.target.value; renderFoodGrid(); };

    const bumpWater = by => {
      state.day = Store.setWater(state.profile.id, state.day.water + by);
      renderWater();
      if (by > 0 && state.day.water === 6) toast('💧 Six glasses. Your body says thank you.');
      checkNewBadges();
    };
    $('#water-plus').onclick = () => bumpWater(1);
    $('#water-minus').onclick = () => bumpWater(-1);

    $('#s-homework').onclick = () => {
      state.day = Store.setStudy(state.profile.id, { homework: !state.day.study.homework });
      renderStudy(); checkNewBadges();
    };
    $('#s-bedtime').onclick = () => {
      state.day = Store.setStudy(state.profile.id, { bedtime: !state.day.study.bedtime });
      renderStudy(); checkNewBadges();
    };
    $$('[data-step]').forEach(b => b.onclick = () => {
      const key = b.dataset.step;
      const next = Math.max(0, Math.min(240, (state.day.study[key] || 0) + Number(b.dataset.by)));
      state.day = Store.setStudy(state.profile.id, { [key]: next });
      renderStudy(); checkNewBadges();
    });

    $('#btn-add-height').onclick = () => {
      const cm = Number($('#g-height').value);
      if (!cm || cm < 80 || cm > 200) return toast('Please enter a height between 80 and 200 cm.');
      Store.addHeight(state.profile.id, cm);
      state.profile = Store.getProfiles().find(p => p.id === state.profile.id);
      renderGrow();
      toast('Measurement saved for this month.');
      checkNewBadges();
    };

    window.addEventListener('resize', () => {
      if ($('#panel-week').classList.contains('is-on')) renderWeek();
      if ($('#panel-grow').classList.contains('is-on')) renderGrow();
    });
  }

  /* ---------------- start ---------------- */
  wire();
  renderWelcome();
  show('welcome');

  window.App = { renderWelcome, show };
})();
