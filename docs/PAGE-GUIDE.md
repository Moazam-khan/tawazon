# Tawazon Plus — how to build a page

Read this fully before writing a page. Every page must feel like the same app.

## 1. The product in one breath

Tawazon Plus (توازن بلس) is a personal finance app for **simple, non-technical,
possibly low-literacy users in Saudi Arabia**. The user enters salary, salary day
and fixed payments once. The app shows ONE number: **"You can spend today: 200 SAR"**.
No daily expense tracking. Tone: friendly, warm, short sentences, no guilt,
no scary red numbers. Think "a kind older sibling who is good with money".

## 2. Hard rules (from the brief — never break)

1. Pure HTML + CSS + vanilla JS. No frameworks, no build step, no CDN except Google Fonts. Opens by double-click.
2. Mobile-first at 390×844. On desktop the page shows inside a phone frame (`.phone`, already styled).
3. English (LTR) + Arabic (RTL). **Every visible string comes from translation keys.** Never hardcode text
   in HTML or JS (numbers are formatted with `TZ.fmt`, not typed). A language switch is on every page (the header adds it).
4. CSS logical properties only: `margin-inline-start`, `padding-inline`, `inset-inline-end`, `text-align: start`.
   **Never** `left`/`right`. Directional icons use `TZ.icons.icon('chevron', { dir: true })`, which mirrors in RTL.
5. Page lives in `pages/<name>/index.html`, `style.css`, `script.js`. Shared code lives in `assets/` — **do not edit shared files**.
6. Simple words only. **Never** use: commitments, liabilities, cycle, available (Arabic: التزامات، متاح، دورة، الخصوم).
   Use: "fixed payments", "money I owe", "money people owe me", "money I can use", "from salary to salary".
7. Accessibility: tap targets ≥ 48px, text ≥ 16px (1rem), WCAG AA contrast, visible focus, aria-labels on icon buttons,
   respects reduced motion (already global), works at the largest text size without breaking (`?size=xlarge`).
8. Kind tone. Problems are "Let's look at it together", never "Error!" / "Overspent!".
9. Numbers come from `TZ.data` (assets/js/mock-data.js). Never type 200, 4000, etc. into a page.

## 3. Money decisions (all pages agree on these)

- Salary 8,000 · salary day 27 · today = 7 Oct 2026 · 20 days until salary (today counts).
- Set aside: Rent 2,500 (paid 1st, already paid) + Bills 600 (15th) + Car loan payment 900 (20th) = 4,000.
- Money I can use = 4,000 → 4,000 ÷ 20 days = **200 a day**. Status: good.
- The daily number is never negative. If payments are bigger than salary, show 0 and a kind message.
- **Changes the number:** adding to savings (−), an extra debt payment beyond the planned one (−),
  money received (+), "Can I spend X?" preview (−), "Update my money" check (sets money I can use).
- **Does NOT change it:** marking a planned fixed/debt payment as paid (it was already set aside), goals.
- Debt payments live only in "Money I owe", never also in fixed payments.
- Yearly payments are spread over 12 months automatically.
- Free forever: the daily number, how it's calculated, My money, the question cards in Ask.
  Paid (after a 3-day trial): smart answers (AI) and data export.
- Example results (from `TZ.data`): spend 300 today → tomorrow ≈ 194/day · add 300 to savings → 185/day ·
  Ahmed pays 300 → 215/day · car loan ends Jan 2027 (4 payments, last one 800) · Umrah goal → save about 600/month.

## 4. Start from the template

Copy `pages/_template/` (index.html, style.css, script.js). The index.html has the correct `<link>` and
`<script>` order. For a nested page (e.g. `pages/my-money/debt-details/`) add one more `../` to every path.

Strings for your page go in **two new files** (never edit en.js / ar.js directly — they are merged later):

```
assets/lang/_parts/<namespace>.en.js     TZ.LANGS.en.<namespace> = { title: '…', … };
assets/lang/_parts/<namespace>.ar.js     TZ.LANGS.ar.<namespace> = { title: '…', … };
```

Include both right after en.js / ar.js:

```html
<script src="../../assets/lang/_parts/<namespace>.en.js"></script><!-- lang-part -->
<script src="../../assets/lang/_parts/<namespace>.ar.js"></script><!-- lang-part -->
```

When the page is done, `node tools/merge-lang.js` moves the strings into en.js / ar.js and removes these tags.

Namespace = page name in camelCase
(`welcome`, `setup`, `reveal`, `howCalculated`, `myMoney`, `debtDetails`, `ask`, `states`, `paywall`, `login`, `settings`).
`home` already exists, so the home page uses `TZ.LANGS.en.home = Object.assign(TZ.LANGS.en.home, { … });`.
Nested objects are fine (`myMoney.owe.title`). Keys must be identical in EN and AR, with the same `{placeholders}`.

### Writing Arabic
Modern Standard Arabic that is warm and natural for Saudi readers — not a literal translation. Read
`assets/lang/ar.js` first and match its voice (e.g. "تقدر تصرف اليوم", "تراجع", "أبقِه"). Short sentences.
Currency is `ر.س` (added by `TZ.i18n.money`). Use "الراتب", "الدفعات الثابتة", "فلوس علي", "فلوس لي عند الناس"
style plain words. Never the banned words above.

## 5. Shared APIs you must use

| Need | Use |
|---|---|
| Start the page | `TZ.page.boot({ titleKey: 'ns.title', render })`. `render()` rebuilds your markup; it runs on load and on every language/digit change, then translations are applied automatically. Keep state in JS variables so a re-render keeps it. |
| Header | `TZ.page.header({ titleKey, back: 'home' \| true \| null, settings: true })` — includes the language switch |
| Tab bar (Home · My money · Ask) | `TZ.page.tabbar('home' \| 'my-money' \| 'ask')` — only on those three pages |
| Links | `TZ.page.url('setup')` / `TZ.page.go('reveal')` (works from any folder depth). `'gallery'` = root index |
| Text in markup | `data-i18n="ns.key"`, `data-i18n-vars='{"n":"20"}'` via `TZ.page.vars({ n: TZ.fmt.num(20) })`, `data-i18n-aria`, `data-i18n-placeholder` |
| Text in JS | `TZ.i18n.t('ns.key', { amount: TZ.fmt.money(300) })` |
| Numbers / money / dates | `TZ.fmt.num(n)`, `TZ.fmt.money(n)` ("200 SAR"), `TZ.fmt.moneyHtml(n)` (wrapped in `<bdi>`), `TZ.fmt.date('2026-10-20', 'short' \| 'long' \| 'month')` |
| Amount in words | `TZ.i18n.words(n)` |
| Data | `const d = TZ.data.get(); const r = TZ.data.calculate(d);` → `{ daily, moneyICanUse, daysLeft, periodDays, status, plan, setAside, fixedMonthly, debtMonthly, nextSalary, badMonth, shortBy }`. Also `TZ.data.previewSpend(d, 300)`, `debtPlan(debt, d.today)`, `goalPlan(goal, d.today)`, `monthly(item)`, `name(item)` (translated name), `save(d)`. |
| Enter an amount (sheet) | `TZ.keypad.sheet({ titleKey, labelKey, value, check, extraHtml, onSave(n, el) })` — bottom sheet with big keypad, amount in words, kind check, Save/Cancel |
| Enter an amount (inline, e.g. setup) | `TZ.keypad.create(container, { labelKey, value, check, onChange })` |
| Toast with Undo | `TZ.ui.toast(document.querySelector('.phone'), { message, undoLabel: TZ.i18n.t('common.undo'), onUndo })` |
| Confirm | `TZ.page.confirm({ title, text, yes, no, icon, tone: 'calm' })` → Promise<boolean>. Plain words: "Remove rent?" / "Keep it" |
| Your own sheet | `<div class="overlay" data-sheet="x" aria-hidden="true"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="…">…</div></div>` then `TZ.page.openSheet('x', btn)` / `closeSheet('x')`; any `[data-close]` inside closes it |
| Count-up number | `TZ.ui.countUp(el, 200, { format: TZ.fmt.num })` |
| Design states (reviewers switch between states) | `TZ.page.demoBar([{ id: 'on', labelKey: 'ask.demo.on' }, …], function (id) { state = id; render(); TZ.i18n.apply(document); })` — sits outside the phone; `#id` in the URL opens that state |
| Icons | `TZ.icons.icon(name)`. Names: home wallet chat rent electricity internet phone subscription other person debt plus chevron arrow check close undo backspace mic sun moon bell trash edit info alert sparkle globe back settings calendar bills car water school jar goal moneyIn moneyOut lock fingerprint download logout shield doc star crown clock replay wifiOff party heart question send minus equals list eye gift trendDown google apple |
| Mascot / logo | `TZ.icons.mascot(mood, 'mascot--lg', TZ.i18n.t('brand.short'))` moods: happy calm celebrate think resting care · `TZ.icons.logo('logo--lg')` · status face `TZ.icons.face('good')` |

Shared strings already exist — reuse them, don't duplicate: `common.*` (`common.days` has plural forms — pass `{ n }`; undo, close, save, continue, back,
next, done, add, edit, remove, delete, cancel, keep, yes, no, skip, seeAll, tryAgain, gotIt, today, tomorrow,
perDay, perMonth, perYear, days, oneDay, monthly, yearly, name, amount, loading, saved, removed),
`status.good|careful|tight`, `home.canSpendToday`, `tab.*`, `preset.*` (rent electricity internet phone
subscription other bills water car school family worker loan), `check.zero|high|low|moreThanSalary`,
`mock.carLoan|ahmed|sara|goalUmrah|you`, `brand.name|short`.

## 6. Components already styled (assets/css) — use these classes

`.btn .btn--primary .btn--secondary .btn--text .btn--danger-soft .btn--block` · `.card .card--sand .card--hero .card__eyebrow` ·
`.hero-number .hero-number__value .hero-number__cur` · `.list .row .row__icon(.row__icon--sand) .row__body .row__title .row__sub .row__end .row__chev` ·
`.progress .progress__head .progress__track .progress__fill (--value:40%) .progress--accent` · `.badge .badge--good|careful|tight` (+ face) ·
`.chips .chip [aria-pressed]` · `.toggle-row .toggle [role=switch][aria-checked]` · `.segmented .segmented__btn [role=radio][aria-checked] .segmented--block` ·
`.empty .empty__title .empty__text` · `.bubble-row .bubble` · `.overlay .sheet .sheet__handle .sheet__title .modal …` ·
`.screen` (column, gap 24px) · `.stack-2/3/4/6 .cluster .between .muted .num .sr-only` · `.t-hero .t-title .t-body .t-small` ·
app.css: `.appbar` · `.page-foot` (sticky bottom area for the main button — place after `<main>`) · `.section-title` · `.lead` ·
`.note .note--sand .note--careful` (icon + text) · `.big-num` · `.kv .kv__k .kv__v` · `.field .field__label .field__input .field__error` · `.logo`.

Spacing tokens `--sp-1..8`, radii `--r-sm|md|card|sheet|pill`, colors only via tokens (`--primary`, `--text-muted`,
`--good-bg`…). No hex colors in your CSS. Font sizes in rem, never below 1rem.

Page structure:
```html
<div class="phone" id="app">
  header · <main class="phone__scroll"><div class="screen">…</div></main> · [.page-foot] · [tabbar] · [overlays]
</div>
```

## 7. Navigation map

welcome → setup (3 questions) → reveal → paywall → home.  welcome "I already have an account" → login.
Tab pages: home · my-money · ask (each has the tab bar and a settings gear in the header).
home hero "How is this calculated?" → how-calculated. my-money debt row → my-money/debt-details.
settings → login (Save your data) · paywall (plan). states = standalone gallery of special screens.

## 8. Quality bar — do this before you finish

1. `node tools/check.js` — must pass for your files (no missing keys, no left/right, no hardcoded text).
2. Screenshots, and **look at them**, fix anything ugly, clipped, misaligned or confusing:
   `node tools/shot.js "pages/<name>/index.html" <out.png>` and also `?lang=ar`, `?theme=dark`, `?lang=ar&size=xlarge`.
   For a design state add `#stateId`. Save screenshots to your scratchpad, not the project.
   Long pages: add a tall height, e.g. `node tools/shot.js "<page>" out.png 430 1800`.
3. Arabic layout mirrored, amounts like "200 ر.س" in `<bdi>`, no text overflow at xlarge size.
4. Keyboard: every action reachable with Tab, Enter/Space work, sheets trap focus and close with Esc.
5. Files: keep each `script.js` under ~400 lines — split into extra files in your folder (e.g. `sections.js`) if needed.

## 9. Colour roles

Every colour has one job, and it does that job on every screen, in light and dark. Use tokens only.

| Role | Tokens | Use it for | Never for |
|---|---|---|---|
| **Brand teal** | `--primary` `--primary-soft` `--primary-text` `--on-primary-soft`, `.card--hero` gradient | The daily number and its hero card · primary buttons · selected / switched-on states (chips, plans, toggles, tabs) · links and text buttons · time (days until salary, due dates, next salary) · row icons for **things you pay** (fixed payments, debts, bills) · info notes that explain the number (`.note`) | Money coming in or kept |
| **Sand** | `--accent` `--accent-soft` `--on-accent-soft` `--accent-text` | Warmth: **money coming in or kept** — savings, goals, people owe me, money received, big months (seasons), money freed up (debt finishing) · celebrations · "For example" tags · gentle tips (`.note--sand`, `.card--sand`) · the Plus crown | Primary actions, selected states, status |
| **Status** | `--good-*` `--careful-*` `--tight-*` | Only meaning: the status badge (face + word), a careful/tight note or line (`.note--careful`, "Short by"), success ticks ("Paid", payment made), a gentle destructive action | Decoration, money-in, "you save" tags |
| **Neutrals** | `--bg` `--surface` `--surface-2` `--bg-sunken` `--border` `--text` `--text-muted` | Everything else: cards, lists, plain labels, totals that are not the daily number | — |

Rules:
- **One hero gradient per screen** at most (the daily number, or the debt ring). On the hero, progress is drawn in `--on-hero` (white), never teal or sand.
- **Row icons:** `.row__icon` (teal) for payments and time; `.row__icon--sand` for money in / saved / seasons. Same thing, same colour, on every screen.
- **Progress bars:** teal = time and paying a debt down; `.progress--accent` (sand) = saving up for a goal.
- **Notes:** `.note` (teal) explains · `.note--sand` encourages · `.note--careful` asks for a look. Offline / system messages are `.note`.
- **Sand text or icons on a plain surface** use `--accent-text` (≥ 4.5:1). `--accent` is a fill only — it is too light for text on light backgrounds.
- **Charts of the salary split:** payments `--split-1/2/3` (lighter teals), money I can use `--primary`.
- **Careful vs sand:** careful is a clear amber, sand is a soft gold. They must never stand in for each other.
- No hex or `rgba(255,255,255,…)` in page CSS: use tokens, or `color-mix(in srgb, var(--on-hero) 20%, transparent)` for tints on the hero.
- Check contrast in both themes: text ≥ 4.5:1 on its tint (`--on-accent-soft` on `--accent-soft`, `--on-primary-soft` on `--primary-soft`, `--careful-fg` on `--careful-bg` all pass).
