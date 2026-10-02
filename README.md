# Tawazon Plus — design prototype (توازن بلس)

A clickable, bilingual (English + Arabic) design prototype of a personal finance app
for simple users in Saudi Arabia. The user enters salary, salary day and fixed
payments once; the app shows one number: **"You can spend today: 200 SAR"**.

Pure HTML + CSS + vanilla JavaScript. No build step, no install.

---

## Open it

- **Double-click `index.html`** — the **Explorer**: an Overview dashboard (the number, what's inside, the journey,
  the sample person, review progress, decisions), every screen with real previews you can swipe through
  full screen, and a Review checklist to tick each screen in English and Arabic.
- Or open any screen directly: `pages/<screen>/index.html`.
- Review links work on any page: `?lang=ar`, `?theme=dark`, `?size=xlarge`, `?digits=arab`,
  and `#state` for design states — e.g. `pages/ask/index.html?lang=ar#offline`.
- Changes you make (adding a payment, marking money received…) are kept between pages.
  **Explorer → Reset sample data** puts everything back.
- Every screen shows **only the phone**, like a real device (true 390 × 844 proportions with a status bar on a
  laptop, full screen on a phone). Open screens and their states from the Explorer; inside the app, move with
  the app's own buttons and tabs. For your own checking, add `?tools` to a page link to show review tools
  (previous / next screen and the design states).

> Sharing with a client: opened as local files, some browsers (Safari, Firefox) don't keep the
> language choice between pages. Host the folder on any static host (GitHub Pages, Netlify drag-and-drop)
> and send the link — it will also be viewed on a real phone that way.

## Deploy on Vercel

It is a static site: no build step, no install.

1. Check first: `node tools/check.js` and `node tools/check-paths.js` (Vercel is case-sensitive).
2. Push this folder to a GitHub repo (suggested name: `tawazon-plus-prototype`).
3. On vercel.com → **Add New → Project** → import the repo.
4. Framework preset: **Other**. Build command: *empty*. Output directory: `.` (root). Install command: *empty*.
5. Deploy. The Explorer opens at the root URL; every screen is at `/pages/<screen>/index.html`.

`vercel.json` keeps URLs exactly as they are (no clean URLs), caches screenshots for a day, and
`.vercelignore` leaves the developer `tools/` and the page template out of the website.
Share links work with `?lang=ar`, `?theme=dark` and `#state` (e.g. `/pages/ask/index.html?lang=ar#offline`).

## Folder map

```
tawazon-design/
├── index.html                ← the Explorer (dashboard · screens · review)
├── explore/  explore.js  overview.js  viewer.js  explore.css
│             screens.js  ← the list of screens and states (one place)
│             shots/en  shots/ar  ← screenshots, made by tools/capture-all.js
├── assets/
│   ├── css/  tokens.css      colors, type, spacing, light + dark
│   │         base.css        reset, type scale, phone frame, motion
│   │         components.css  buttons, keypad, cards, rows, sheets, toast…
│   │         app.css         header, language switch, notes, amount sheet, demo bar
│   │         rtl.css         the few Arabic-only adjustments
│   ├── js/   i18n.js         translations, number / money / words formatting
│   │         common.js       theme, text size, toast with Undo, sheets, count-up
│   │         shell.js        page start-up, header, tab bar, links, confirm, formatting
│   │         keypad.js       big keypad + amount in words + amount sheet
│   │         icons.js        icons, status faces, mascot, logo
│   │         mock-data.js    sample person + calculate()  (DESIGN MOCK ONLY)
│   └── lang/ en.js  ar.js    every visible word, same keys in both
├── pages/
│   ├── _design-system/       every component, English and Arabic side by side
│   ├── _template/            copy this to start a new page
│   ├── welcome/  setup/  reveal/
│   ├── home/  how-calculated/  ask/
│   ├── my-money/  my-money/debt-details/
│   ├── paywall/  login/  settings/
│   └── states/               bad month, salary day, debt paid, offline, tour, notifications…
├── docs/PAGE-GUIDE.md        rules + APIs for building a page (read before changing anything)
└── tools/  check.js  check-paths.js  shot.js  capture-all.js  merge-lang.js  import-copy.js
```

## Decisions (what a developer building the real app needs)

| Topic | Decision |
|---|---|
| Sample person | Salary 8,000 SAR, paid on the 27th. Today = 7 Oct 2026, 20 days until salary (today counts). |
| Set aside each month | Rent 2,500 + Bills 600 + Car loan payment 900 = 4,000 → money I can use 4,000 → **200 a day**. |
| Daily number | `money I can use ÷ days until salary`, rounded down, **never below 0**. |
| Money check | Optional "How much money do you have now?" (Home → Update my money) replaces the estimate. This is how the app stays right without tracking every expense. |
| Status | Compared with a normal day this month (plan ÷ days in the month): **good** ≥ 80%, **careful** 50–80%, **tight** < 50%. Always face + word, never color alone. |
| Changes the number | Money added to savings (−), an extra debt payment beyond the planned one (−), money received (+), "Can I spend X?" preview (−), money check (sets it). |
| Does NOT change it | Marking a planned fixed or debt payment as paid (already set aside), goals. |
| Debts | The monthly debt payment lives only in **Money I owe**, never also in fixed payments (no double counting). The setup "Loan payment" chip creates a debt. |
| Yearly payments | Spread over 12 months automatically. |
| Short months | Salary day 31 in a 30-day month = the last day of the month. |
| Bad month | Payments bigger than salary → number shows 0 with "Let's look at it together" and one concrete suggestion. |
| Role of AI | The daily number always comes from exact rules (`TZ.data.calculate`), never from AI. AI (smart answers, optional) only explains, answers questions in your own words and suggests a plan. The app works fully when AI is off or offline. |
| Spending more than planned | After "Update my money", if there is less than expected: a kind sheet offers (a) spread it over the days left, (b) cover it from savings, (c) ask Tawazon for a plan. If the money runs out: "Let's get you to salary day" with real options (savings, money people owe you, moving a payment). |
| Free vs paid | Free forever: the daily number, how it's calculated, My money, Ask question cards. Paid after a 3-day trial: smart answers (AI), data export. |
| Prices | Monthly 29 SAR · Yearly 99 SAR (≈ 8.25 a month, saves 249). The billed amount is always the most prominent price (App Store guideline 3.1.2). |
| Dates | Gregorian calendar in both languages (salaries are paid by Gregorian date). |
| Words never used | commitments, liabilities, cycle, available · التزامات، متاح، دورة، الخصوم |

## Add a new page

1. Copy `pages/_template/` to `pages/<name>/`.
2. Put its words in `assets/lang/_parts/<name>.en.js` and `<name>.ar.js` (see the template) and include
   both after `en.js` / `ar.js` with `<!-- lang-part -->`.
3. Build with the shared APIs in `docs/PAGE-GUIDE.md` (header, keypad, sheets, toast, `TZ.data`).
4. `node tools/check.js` and screenshots with `node tools/shot.js` in English, Arabic, dark and extra-large text.
5. `node tools/merge-lang.js` folds the words into `en.js` / `ar.js`. Add the page to `explore/screens.js`
   and to `SCREENS` in `assets/js/shell.js`, then `node tools/capture-all.js` for its previews.

## Add a new string

Add the same key to `assets/lang/en.js` **and** `ar.js` (same `{placeholders}`), then use it:
`data-i18n="home.title"` in HTML or `TZ.i18n.t('home.title')` in JS. `node tools/check.js` fails if
a key is missing in either language.

## Add a language

1. Create `assets/lang/<code>.js` with `TZ.LANGS.<code> = { … }` — same keys as `en.js`.
2. In `assets/js/i18n.js` add the code to `DIR` (`'ltr'` or `'rtl'`) and `CURRENCY`.
3. Add a font for it in `tokens.css` and a `[lang="<code>"]` rule in `base.css` if needed.
4. Include the script on each page and add it to the language switch / Settings.

## Quality checks

```
node tools/check.js            # keys in both languages, no left/right CSS, no text under 16px,
                               # banned words, no hardcoded text, file sizes
node tools/shot.js "pages/home/index.html?lang=ar" out.png          # screenshot (Edge/Chrome)
```

## Screens ready for client approval

Tick each after the client approves it in **both** languages.

| # | Screen | Folder | States to review | EN | AR |
|---|---|---|---|---|---|
| 1 | Welcome | `pages/welcome/` | — | ☐ | ☐ |
| 2 | Setup (3 questions + live preview) | `pages/setup/` | #step1 #step2 #step3 #step3-filled | ☐ | ☐ |
| 3 | Your number (reveal) | `pages/reveal/` | #play #math #result | ☐ | ☐ |
| 4 | Home | `pages/home/` | #good #careful #tight #check | ☐ | ☐ |
| 5 | How it's calculated | `pages/how-calculated/` | — | ☐ | ☐ |
| 6 | Ask | `pages/ask/` | #on #resting #offline #limit #consent #unclear | ☐ | ☐ |
| 7 | My money (5 sections) | `pages/my-money/` | #owe #fixed #owed #savings #goals | ☐ | ☐ |
| 8 | Debt details | `pages/my-money/debt-details/` | #plan #last #done | ☐ | ☐ |
| 9 | Free trial | `pages/paywall/` | — | ☐ | ☐ |
| 10 | Save my data (login) | `pages/login/` | — | ☐ | ☐ |
| 11 | Settings | `pages/settings/` | — | ☐ | ☐ |
| 12 | Special moments | `pages/states/` | #bad-month #salary-day #debt-paid #money-received #offline #error #empty-home #tour #notifications | ☐ | ☐ |
| — | Design system | `pages/_design-system/` | — | ☐ | ☐ |

## Before launch (not done in this prototype)

- Arabic copy reviewed by a native Saudi copywriter.
- 3–5 sessions with real target users (4 tasks: set up, find today's number, add a payment, "can I spend 300?").
- The real calculation engine, accounts, purchases and AI — this prototype only mocks them.
