# VedaMilan Mobile — Implementation Plan

Derived from the audited backend. Phases are ordered so the app is runnable after each one.

## Audit summary

**Reusable as-is:** auth (email/password + email OTP), profile/birth/preferences, horoscope +
Vedic extras, panchanga/muhurta/gochar/numerology, compatibility, matchmaking, chat + Pusher,
AI, wisdom, billing, consultations, notifications.

**Requires minimal backend change (applied):**
- `bearer()` plugin in `src/lib/auth/index.ts` so native clients can hold a session without
  relying on httpOnly browser cookies. Additive; web unaffected.

**Requires backend change before a feature can ship (documented, not faked):**
- Expo push token registration endpoint (not present). Until then: Pusher + in-app notifications.
- Native Google OAuth callback (Better Auth Expo integration). Until then: not offered natively.
- Native RTC for voice consultations (backend exposes lifecycle + TTS only).

**Always a documented web fallback:** web-only OAuth, native store purchase validation (the
current flow is provider-hosted checkout + server verification), and full report downloads.

**Explicitly not built:** any second backend, any astrology math, any payment trust on the client.

## Phase 1 — Foundation ✅

- Expo SDK 58 + TypeScript strict + Expo Router.
- Design token system, typography, light/dark/system, safe areas.
- Central fetch client: base URL from env, bearer token, timeout, 401 handling, typed errors.
- Secure session store + session provider + route guard.
- Shared UI: Button, Card, Text, Input, Screen, ScreenState (loading/empty/error/retry),
  Skeleton, Chip, SectionHeader, Avatar, Divider, Sheet, ScoreRing.
- Bottom tabs (5) + stacks, splash, deep-link scheme.
- Auth screens: login, register, forgot, reset (OTP), verify email.
- Deliverable: app boots, authenticates against the real backend, and routes correctly.

## Phase 2 — Identity ✅

- 10-step onboarding: personal → gender → DOB → birth time → birthplace + timezone →
  accuracy → preferences → photos → privacy/consent → review.
- Saves partial progress via `/profile`, `/birth-details`, `/preferences`.
- Resume logic using `profile.completion` + presence of birth details.
- Profile edit, birth details edit, preferences, photo manager, appearance/localization.
- Deliverable: real user completes onboarding and edits profile.

## Phase 3 — Core astrology ✅

- Home dashboard: greeting, panchanga strip, insights, quick actions, activity.
- Horoscope overview; planetary table; lagna/rashi/nakshatra.
- Interactive North/South/East charts + D9 + divisional selector (SVG).
- Dasha timeline, yogas/doshas categorized accordions, strength (shadbala/planet strength),
  gochar, numerology, Lal Kitab, marriage timing.
- Deliverable: accurate screens fed only by backend calculations.

## Phase 4 — Relationship intelligence ✅

- Compatibility report: score hierarchy, guna breakdown, category scores, strengths/
  considerations, explainability, repeat-compare.
- Discover: recommendations, paginated search + filters, match detail, compatibility preview,
  like/shortlist/interest/connect, visitors, likes, shortlist, connections hub, block/report.
- Deliverable: complete discovery → connection journey.

## Phase 5 — AI & communication ✅

- AI Guide chat (agents incl. Marriage Guru), disclaimer on every astrology answer.
- Wisdom library, guide detail, ask-the-sages, journal.
- Conversations list, chat thread with pagination, optimistic send, typing indicator, Pusher
  realtime, translation action, ice-breakers, image upload, report/block.
- Notifications list + unread badge.
- Deliverable: functional AI and chat.

## Phase 6 — Monetization & advanced

- Billing: plans, subscription status, payment history, provider checkout hand-off, server
  verification polling.
- Consultations: astrologer list/detail, text chat, voice session lifecycle + TTS.
- Advanced astrology entry points (Jaimini, BNN, spiritual journey, past-life, chart comparison,
  celebrity atlas, relationship journey).
- Deliverable: premium journey with honest "not available on mobile yet" states where the
  backend lacks a native contract.

## Phase 7 — Hardening

- Vitest unit tests for client/format/validation/domain helpers.
- Accessibility labels, dynamic font scaling, reduced motion.
- EAS profiles, app identifiers, icons/splash, OTA channels.
- README / SETUP / RELEASE docs.
- Typecheck + lint clean; production builds.

## Acceptance checklist

- [ ] No screen is blank: every remote screen has loading/skeleton/empty/error/retry.
- [ ] No button without an action.
- [ ] No secret or birth detail in logs.
- [ ] `tsc --noEmit` and `expo lint` pass.
- [ ] Web app untouched except the additive bearer plugin.
- [ ] All displayed astrology values originate from the API.
