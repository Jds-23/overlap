# overlap — product requirements document

**Version:** 1.0  
**Status:** MVP  
**Owner:** Joydeep  
**Last updated:** March 2026

---

## overview

**overlap** is a minimal web app for async teams to instantly see what time it is across multiple cities and find windows where everyone is working. the core insight: most timezone tools are cluttered with chrome that gets in the way. overlap strips everything back to place, time, and the overlap window.

---

## problem

scheduling across timezones is painful. existing tools (worldtimebuddy, etc.) are:

- visually cluttered with colour-coded cell grids that require interpretation
- hard to answer "when can we all meet?" at a glance
- bad at communicating day boundaries (the +1d/-1d problem)
- not designed for pinning a hypothetical time and seeing it reflected everywhere

---

## target user

async-first teams with members across 3+ timezones — engineers, product managers, and founders who schedule cross-region standups, syncs, and reviews daily.

---

## goals

1. show what time it is right now in every zone you care about — no visual noise
2. surface the overlap window (shared working hours) instantly
3. let you pin a time in any zone and see it reflected across all others
4. support date navigation for future/past scheduling

---

## non-goals

- native mobile app (web-first for MVP)
- calendar integration
- user accounts or persistence beyond session
- notifications or reminders

---

## features

### core

| feature | description |
|---|---|
| zone list | place name, UTC offset, local date, live clock — no bars or cells |
| live clocks | update every second, display as `HH:MM am/pm` |
| status label | each zone shows `overlap window`, `working`, or `asleep` in real time |
| overlap panel | footer panel showing hours where all zones are simultaneously in 9–18, with per-zone times displayed |
| add timezone | search by city name or abbreviation (`PT`, `IST`, `GMT`, `KST`, etc.) with alias matching |
| remove timezone | hover a zone row to reveal × remove button |

### time pinning

| feature | description |
|---|---|
| clock picker | click any zone's clock to open a time picker (hour / minute / AM·PM) |
| cross-zone sync | setting a time in one zone instantly updates all clocks to show that moment |
| pinned banner | accent bar at top showing all zones' times for the pinned moment |
| day boundary labels | `+1d` / `-1d` shown in amber when the pinned time crosses midnight in a zone |
| clear pin | × button dismisses the pinned time and returns all clocks to live |

### date navigation

| feature | description |
|---|---|
| day arrows | ‹ › step forward/back one day |
| calendar picker | click the date label to open a month calendar and jump to any date |
| back to today | shown when viewing a non-today date; resets to live |
| overlap recalculation | overlap window recalculates correctly for the selected date, respecting weekends |

---

## design principles

- **place and time only** — no bars, no cells, no colour grids
- **dark, calm, spacious** — `#0d0d0f` background, generous row padding, hairline dividers
- **monospaced clocks** — `DM Mono` for all time values; `DM Sans` for labels
- **accent = action** — `#5b5ef4` (indigo) used only for home zone, pinned state, and interactive focus
- **status through text, not colour blocks** — `overlap window` / `working` / `asleep` as small labels under each clock

---

## time math

- all time conversion goes through UTC as the canonical reference
- offsets computed via `Intl.DateTimeFormat` against a noon UTC anchor on the selected date (avoids DST midnight-crossing bugs)
- half-hour offsets (IST +5:30, etc.) handled correctly
- overlap window defined as UTC hours where every zone's local hour is within 09:00–17:59 and the local day is not Saturday/Sunday

---

## tech stack

| layer | choice |
|---|---|
| runtime | vanilla HTML + CSS + JS (zero dependencies) |
| fonts | DM Sans, DM Mono via Google Fonts |
| time API | `Intl.DateTimeFormat` (native browser) |
| deployment | any static host (single `.html` file) |

---

## mvp scope

**in:**
- zone list with live clocks
- time picker per zone
- date navigation + calendar
- overlap panel
- add/remove zones with alias search

**out for v1:**
- shareable URL state
- copy-to-clipboard for meeting slots
- user preferences / saved zone sets
- mobile-optimised layout

---

## success metrics

- time to find overlap window: < 3 seconds
- zero onboarding required — useful on first open
- works correctly across DST transitions and half-hour offset zones (IST, NST, etc.)
