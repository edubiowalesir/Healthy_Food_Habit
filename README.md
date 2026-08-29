# My Plate & My Day

A daily food and study habit card for children in Classes 3–5.

Students tap the foods they ate, the water they drank and what they did after school.
A thali fills up with colour, badges unlock, and the week turns into bar graphs the
children then read in Maths class.

Plain HTML, CSS and JavaScript. No build step, no server, no accounts, no internet
needed after the first load.

---

## What it does

| Screen | What the child sees |
|---|---|
| **Today** | A five-part thali that fills in as they log food, a row of water glasses, four study switches, and a picture grid of 70+ Indian foods |
| **My week** | Bar graphs of food groups, water and reading minutes, plus four questions to answer aloud |
| **Badges** | 16 badges for logging, variety, water, reading, homework, play and sleep |
| **I grow** | Their own height line, month by month |
| **Learn** | Sorting today's food into *from plants* and *from animals*, the five parts of a thali, and what Everyday and Sometimes foods mean |
| **Teacher corner** | PIN-protected class table, CSV summary, full backup, card removal |

---

## Three rules this app is built on

**1. No food is called bad.**
Foods are grouped as *Everyday* (five thali parts) and *Sometimes* (the little side bowl).
Nothing turns red. Nothing frowns. A child who logs jalebi gets the same friendly
response as one who logs dal — the app only tells them what the food is made of.
Telling 9-year-olds that foods are "good" and "bad" teaches food guilt, and it punishes
children whose families cannot afford variety.

**2. The habit is rewarded, never the diet.**
Every badge is earned by *logging*, *trying something new*, *drinking water*, *reading*,
*playing* or *sleeping on time*. No badge is earned by eating less or by avoiding a food.
Nothing is ever subtracted. If points could be lost, children would simply stop
recording the truth.

**3. No weight, no BMI, no calories — anywhere.**
There is no weight field in this app and there never should be. Height is kept only as a
monthly science measurement, and the graph compares a child with nobody except their own
past self. There is no class leaderboard for food or body, and there must not be one.

Please keep these three rules if you fork or extend this project.

---

## Privacy

Everything is stored in `localStorage` on the device that is running the app. There is no
backend, no database, no analytics and no network request after the page loads. Nothing
about any child leaves the machine unless a teacher deliberately downloads the CSV or the
backup file.

The app asks for a first name, a roll number, a class, birth month/year and (optionally)
height. It deliberately does not ask for a surname, a photo, an address, a phone number,
or a weight.

Because the data is tied to one browser on one device:
- Clearing the browser's site data erases everything. Take backups.
- A phone used by one child keeps only that child's card.
- A shared classroom computer or smartboard can hold the whole class — each child taps
  their own name on the first screen.

The teacher PIN keeps children out of each other's records on a shared machine. It is not
real security; anyone with access to the device can clear browser storage.

---

## Run it

### On a computer, straight from the folder
Download or clone the repo and open `index.html` in Chrome, Edge or Firefox. That is all.
It works with no internet.

### Put it online with GitHub Pages
1. Create a new repository on GitHub and upload every file in this folder.
2. Go to **Settings → Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save. After a minute the app is live at `https://<your-username>.github.io/<repo-name>/`.
5. Open that link on a phone and choose *Add to Home screen* — it installs like an app and
   then works offline.

### On the classroom smartboard
Copy the folder to a pen drive, open `index.html`, and press F11 for full screen.

---

## Files

```
index.html          all five screens
css/style.css       palette, layout, print styles
js/foods.js         the food library — 70+ foods with group, plant/animal source, one fact
js/storage.js       localStorage: profiles, daily logs, heights, CSV and backup export
js/rewards.js       badge definitions and streak calculation
js/charts.js        small canvas bar and line graphs (no chart library)
js/teacher.js       PIN gate, class table, downloads
js/app.js           screens, the thali, food picker, week, badges, growth
sw.js               offline cache
manifest.json       install-as-app settings
docs/lesson-plan.md a 40-minute period plan and follow-up ideas
```

---

## Changing things

**Add a food.** Open `js/foods.js` and copy one line:

```js
{ id: 'thepla', name: 'Thepla', icon: '🫓', group: 'grain', source: 'plant',
  fact: 'A soft roti made with methi leaves.' },
```

`group` must be one of `grain`, `protein`, `veg`, `fruit`, `dairy`, `sometimes`.
`source` is `plant`, `animal` or `both`. Keep `fact` to one short sentence a child can read
aloud, and keep it factual rather than warning.

**Add a badge.** Add an entry to `BADGES` in `js/rewards.js`. The `earned` function receives
a context object with counts like `daysLogged`, `uniqueFoods`, `daysWithVeg` and
`bestStreak`. Only ever reward doing something, never avoiding something.

**Change the classes offered.** Edit `classOptions()` near the top of `js/app.js`.

**Change the colours.** Every colour is a CSS variable at the top of `css/style.css`.
Note that there is no red in the palette on purpose.

**After any edit, bump `CACHE` in `sw.js`** (for example `plate-day-v2`) so devices that
already installed the app pick up the new version.

---

## Ideas for version 2

- A Hindi toggle — every label is already a single short string
- Printable weekly certificates straight from the browser's print dialog
- A tiffin-box photo prompt for the class Bulletin board
- Class-level (never child-level) totals displayed on the smartboard each Monday
- A "guess the food group" quiz built from `foods.js`

---

## Licence

MIT — free to use, change and share, including in other schools.
