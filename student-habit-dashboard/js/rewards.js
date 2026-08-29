/* rewards.js — badges reward the HABIT, never eating less.
   Nothing here subtracts points. There is no "bad food" penalty anywhere. */

const BADGES = [
  {
    id: 'first-log', icon: '🌱', name: 'First Step',
    how: 'Fill in your card for the first time.',
    earned: ctx => ctx.daysLogged >= 1
  },
  {
    id: 'rainbow', icon: '🌈', name: 'Rainbow Plate',
    how: 'Eat from 4 different food groups in one day.',
    earned: ctx => ctx.bestGroupsInADay >= 4
  },
  {
    id: 'full-plate', icon: '🍽️', name: 'Full Thali',
    how: 'Fill all 5 parts of your plate in one day.',
    earned: ctx => ctx.bestGroupsInADay >= 5
  },
  {
    id: 'water', icon: '💧', name: 'Water Warrior',
    how: 'Drink 6 glasses of water in a day.',
    earned: ctx => ctx.bestWater >= 6
  },
  {
    id: 'water-week', icon: '🌊', name: 'Water Week',
    how: 'Drink 6 glasses on 5 different days.',
    earned: ctx => ctx.daysWater6 >= 5
  },
  {
    id: 'breakfast', icon: '🌅', name: 'Morning Starter',
    how: 'Log something on 3 days in a row.',
    earned: ctx => ctx.bestStreak >= 3
  },
  {
    id: 'week-streak', icon: '🔥', name: '7 Day Streak',
    how: 'Fill your card 7 days in a row.',
    earned: ctx => ctx.bestStreak >= 7
  },
  {
    id: 'explorer', icon: '🧭', name: 'Food Explorer',
    how: 'Try 20 different foods in all.',
    earned: ctx => ctx.uniqueFoods >= 20
  },
  {
    id: 'explorer-40', icon: '🗺️', name: 'Great Explorer',
    how: 'Try 40 different foods in all.',
    earned: ctx => ctx.uniqueFoods >= 40
  },
  {
    id: 'green', icon: '🥬', name: 'Green Friend',
    how: 'Eat a vegetable on 10 days.',
    earned: ctx => ctx.daysWithVeg >= 10
  },
  {
    id: 'fruit', icon: '🍎', name: 'Fruit Fan',
    how: 'Eat a fruit on 10 days.',
    earned: ctx => ctx.daysWithFruit >= 10
  },
  {
    id: 'reader', icon: '📖', name: 'Reader',
    how: 'Read for 20 minutes on 5 days.',
    earned: ctx => ctx.daysRead20 >= 5
  },
  {
    id: 'homework', icon: '✏️', name: 'Homework Hero',
    how: 'Finish homework on 10 days.',
    earned: ctx => ctx.daysHomework >= 10
  },
  {
    id: 'play', icon: '🏃', name: 'Outdoor Player',
    how: 'Play outside 30 minutes on 7 days.',
    earned: ctx => ctx.daysPlay30 >= 7
  },
  {
    id: 'early', icon: '🌙', name: 'Early Sleeper',
    how: 'Sleep on time on 7 days.',
    earned: ctx => ctx.daysBedtime >= 7
  },
  {
    id: 'scientist', icon: '📏', name: 'Growth Scientist',
    how: 'Measure your height in 3 different months.',
    earned: ctx => ctx.heightReadings >= 3
  }
];

const Rewards = (() => {

  function buildContext(profile) {
    const log = Store.getLog(profile.id);
    const keys = Object.keys(log).sort();
    const unique = new Set();
    let bestGroupsInADay = 0, bestWater = 0;
    let daysWater6 = 0, daysWithVeg = 0, daysWithFruit = 0;
    let daysRead20 = 0, daysHomework = 0, daysPlay30 = 0, daysBedtime = 0;
    let daysLogged = 0;

    keys.forEach(k => {
      const d = log[k];
      const foods = d.foods || [];
      const study = d.study || {};
      const hasAnything = foods.length || d.water || study.homework || study.read || study.play || study.bedtime;
      if (!hasAnything) return;
      daysLogged++;

      const groups = new Set();
      foods.forEach(fid => {
        unique.add(fid);
        const f = FOOD_BY_ID[fid];
        if (f && PLATE_GROUPS.includes(f.group)) groups.add(f.group);
      });
      bestGroupsInADay = Math.max(bestGroupsInADay, groups.size);
      if (groups.has('veg')) daysWithVeg++;
      if (groups.has('fruit')) daysWithFruit++;

      bestWater = Math.max(bestWater, d.water || 0);
      if ((d.water || 0) >= 6) daysWater6++;
      if ((study.read || 0) >= 20) daysRead20++;
      if (study.homework) daysHomework++;
      if ((study.play || 0) >= 30) daysPlay30++;
      if (study.bedtime) daysBedtime++;
    });

    return {
      daysLogged,
      bestGroupsInADay,
      bestWater,
      daysWater6, daysWithVeg, daysWithFruit,
      daysRead20, daysHomework, daysPlay30, daysBedtime,
      uniqueFoods: unique.size,
      bestStreak: bestStreak(keys, log),
      currentStreak: currentStreak(log),
      heightReadings: (profile.heights || []).length
    };
  }

  function dayHasEntry(day) {
    if (!day) return false;
    const s = day.study || {};
    return !!((day.foods || []).length || day.water || s.homework || s.read || s.play || s.bedtime);
  }

  function bestStreak(keys, log) {
    let best = 0, run = 0, prev = null;
    keys.forEach(k => {
      if (!dayHasEntry(log[k])) return;
      if (prev && isNextDay(prev, k)) run++; else run = 1;
      prev = k;
      best = Math.max(best, run);
    });
    return best;
  }

  function currentStreak(log) {
    let run = 0;
    const d = new Date();
    for (let i = 0; i < 400; i++) {
      const key = Store.todayKey(d);
      if (dayHasEntry(log[key])) run++;
      else if (i > 0) break;               // today not filled yet is allowed
      d.setDate(d.getDate() - 1);
    }
    return run;
  }

  function isNextDay(a, b) {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000) === 1;
  }

  function evaluate(profile) {
    const ctx = buildContext(profile);
    const badges = BADGES.map(b => ({ ...b, unlocked: !!b.earned(ctx) }));
    return { ctx, badges, unlockedIds: badges.filter(b => b.unlocked).map(b => b.id) };
  }

  return { evaluate, BADGES };
})();
