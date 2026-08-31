# 100 a Day

Product spec for the 365-day, 100-push-up challenge tracker.

## Design read

Reading this as a mobile-first daily check-in for a friend-group
fitness challenge, with locker-room scoreboard energy, not a SaaS
dashboard.

## One-sentence pitch

A web app anyone can join from a link. Log push-up sets through
the day, hit a floor of 100, watch a 365-day leaderboard.

## Challenge rules (source of truth)

Copied from Ahmed's brief, then made operational:

1. **Floor is 100.** You can do more. Extra reps count on the
   surplus board. They do not replace a missed day.
2. **The unit is a local calendar day.** Sets may be spread across
   hours. The day is won when the sum of that day's sets is at
   least 100.
3. **The window is 365 consecutive days** from a shared start
   date of **2026-08-31**. Late joiners play the remaining days. Their score is
   `days hit / 365`, not a personal rolling year.
4. **Honor system.** No camera, no AI counter, no photo proof in
   v1. The social board is the accountability.
5. **Open join.** Anyone with the site URL creates an account
   with email and password and starts tracking. One shared
   challenge.

These five are frozen for v1. Changing any of them is a product
change, not a polish pass.

## Who it is for

Primary: anyone Ahmed (or a friend) sends the site link to.

Job to be done: "When I finish a set, I want to dump the number
in under five seconds so the group can see I showed up, and I
can see who is still short today."

Not for: training plans, form coaching, gym programming, selling
subscriptions.

## Success metric

**Outcome:** by day 30, at least 70% of joined members have a
check-in on 20 or more days.

**Guardrails:** check-in p95 under 2 seconds on a phone; zero
auth lockouts from a broken magic-link flow; axe-core clean on
the four primary screens.

## v1 in, v1 out

### In

- Email and password sign up / log in
- Display name + IANA timezone on first login
- Sign up from the site link (email + password)
- Auto-join the shared 365-day challenge after profile setup
- Log a set (presets 10 / 20 / 25 / 50 plus custom)
- Today's total, remaining to 100, and a yes/no "hit"
- Edit or delete a set logged today (fat-finger, not history
  rewrite)
- 365-day heatmap for yourself
- Leaderboard among members: days hit, current streak, total
  reps, surplus over 100
- Today board: who has hit 100, who is in progress, who is at 0
- Milestone chips: 7 / 30 / 100 / 365 days hit
- Year recap card (heatmap + days hit + longest streak), downloadable as PNG, SVG, and JPG
- Add to home screen (PWA)
- Today number flips once when you cross 100
- One-shot Day 100 and Day 365 screens
- Board: who has every elapsed day this week (7/7 on Sunday)
- Privacy page: what we store, export, delete account
- Mobile-first layout, WCAG 2.2 AA

### Out (deliberate)

- Camera / pose / AI counting (honor system; no LLM API)
- Native iOS / Android apps
- Push notifications
- Streak freezes and "rest days"
- Logged-out public leaderboard (must have an account to see
  names)
- Multiple concurrent challenges
- Teams, comments, reactions, feed
- Training plans, rest timers, HealthKit
- Payments, ads, accounts for people under 16

Reminder email is on: one mail at local 20:00 if still short of
100, from the verified domain, with unsubscribe. Web push is
still out.

## Core loop

1. Open the site (phone, home-screen bookmark is enough).
2. See today's number and how many are left to 100.
3. Tap a preset or type a count. Confirm.
4. Number ticks up. If it crosses 100, the day chip flips to
   hit.
5. Glance at the today board. Close the tab.

Anything that adds a step between 2 and 4 is a bug.

## Screens

### 1. Landing

Headline: "100 a day. 365 days."

Sub: "Log sets through the day. 100 is the floor."

Primary: "Create an account" → `/signup` (email, password,
confirm). Secondary: "I already have an account" → `/login`.

### 2. Sign up / log in

Email, password (8+ characters), confirm on sign up. If the
project requires email confirm, they open the mail then log in
with the same password. The confirm screen has a Resend button.
Mail comes from Resend on a verified domain. Check spam.

### 3. First-run profile

Fields: display name (required, 2–32 chars, unique ignoring
case), timezone (pre-filled
from the browser, editable).

Copy: "Your day rolls at midnight in this timezone. Pick the
place you actually sleep."

### 4. Home (today)

The product. Everything else is secondary.

- Big number: today's reps
- Under it: `{remaining} left` or `Hit. Surplus {n}`
- Preset row: 10, 20, 25, 50, Custom
- Today's sets as a short list with edit / delete. The number
  is the set. Save count appears only after you change it, and
  writes that number over the set. Delete asks first.
- Streak count
- Compact today board (first 8 names, "see all")
- Challenge day index: "Day 47 of 365"

Zero state, morning: "Nothing logged. Floor is 100."
Zero state, evening (local hour ≥ 20 and total < 100):
"Still {n} short before midnight."

### 5. Leaderboard

Default sort: **days hit** descending, then current streak, then
total reps.

Columns: rank, name, days hit, streak, total, surplus.

Highlight the signed-in row. Filter chips: Days / Streak /
Total. No pagination needed under ~200 members.

### 6. You (history)

GitHub-style 365 heatmap. Tap a day to see that day's sets.
Cannot add sets to a past day in v1 (keeps the honor honest).
Cannot add sets to a future day.

### 7. Settings

Display name, timezone (warns: "Past days stay on the timezone
they were logged in"), sign out, export my data (JSON), delete
my account.

## Copy voice

Match Ahmed: short, concrete, no hype.

- Buttons are verbs: "Log 25", "Send link", "Save count",
  "Delete set"
- Errors name the fix: "Enter a whole number between 1 and 1000"
- Never "Great job!!!" Never streaks-as-guilt beyond the evening
  remaining line
- Numbers are digits, not words, once they are counts

## Accessibility (WCAG 2.2 AA)

Every interactive control is reachable by keyboard. Preset
buttons are at least 44×44 CSS px on the home screen (above the
24px floor). Today's total uses a live region so a screen reader
hears the new sum after log. Contrast 4.5:1 for body text.
`prefers-reduced-motion` disables the ring animation. Focus
visible. Form errors are text, not color alone.

## Data the user sees vs data we keep

Visible to other members: display name, daily totals, whether
today is a hit, streak, lifetime reps.

Visible only to you: individual set timestamps and any optional
note.

Not collected: precise GPS, photos, heart rate, real name,
phone.

## Open decisions (defaults locked, override before build)

| Topic | Default | Why |
| --- | --- | --- |
| Start date | 2026-08-31 (`starts_on` on `hundred-2026`) | Shared 365, not rolling |
| Join | Open: site URL + email/password | Ahmed 2026-08-31 |
| Auth | Email + password | Ahmed 2026-08-31 |
| Past-day edits | Forbidden in v1 | Stops silent score repair |
| Same-day edits | Allowed | Fat-finger |
| Streak freeze | None | The challenge is the chain |
| Timezone source | Browser IANA, user-confirm | DST-safe local day |

If a default is wrong, say so before Phase 1 of
[implementation](implementation.md). Changing them after schema
lands costs a migration.

## Coming soon (frozen enough to build later)

Do not start these until the daily loop is boring in a good way.
Nothing here may sit between "see today's number" and "log a set".

### Year-end purse (points to redeem)

Own tab at `/app/purse`. Scores are computed live, then blurred
with "Coming soon" until the window ends. No catalog, no
payments, no shop in the app.

**Earn:** +10 the local day you hit 100.

**Miss:** that day is 0, then every later hit is **+5** until you
string **5 hits in a row**. Those five makeup days stay at 5.
The next hit after that is +10 again. A miss during recovery
restarts the five and stays at 5.

**Surplus reps do not buy points.** A 200-rep day is +10 or +5,
same as 100, depending on whether you are in half-rate.

**Redeem:** purse locks when the shared window ends. Ahmed pays
**top 10** offline: cash, airtime, merch. Ties break the same
as the board (days hit, then streak, then total reps). The app
ranks. It does not take card details.

Perfect year: 365 × 10 = 3650. One miss then five makeup days
costs 10 (the miss) + 25 (five days at 5 instead of 10) = 35.

### Other juice (ranked)

Shipped: recap card, PWA, hit flip, day 100/365 ceremony, weekly
perfect list. Purse stays coming soon.

Leave in the out list: camera counting, rest-day freezes,
comments, native apps, HealthKit. Those fight the frozen
rules.
