# VedaMilan Mobile — Architecture

> Audit date: 2026-11-14. Backend source of truth: the existing Next.js 16 application
> (`NEXT_PUBLIC_APP_URL`, production `https://vedamilan-lihn.vercel.app`).
> This document records what actually exists, not what was assumed.

## 1. Existing platform (audited)

| Layer | Reality on disk |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript |
| API | 69 route handlers under `src/app/api/**` (Node runtime for astrology/AI) |
| Auth | Better Auth 1.6 + MongoDB adapter, cookie sessions, email/password, email OTP, optional Google |
| DB | MongoDB Atlas via Mongoose + raw Mongo client (Better Auth collections are Mongo-owned) |
| Astrology | Swiss Ephemeris (`sweph`) + deterministic TS engines in `src/application/horoscope`, `src/application/rules` |
| AI | Mastra agents — **explain only**, never compute charts |
| Realtime | Pusher (`private-chat-*` channels, `/api/pusher/auth`) |
| Media | Cloudinary (base64 `dataUrl` upload contract) |
| Payments | Stripe Checkout + Razorpay orders, server-side verification only |
| Email/SMS | Resend, Twilio |
| UI | Tailwind 4 + shadcn/Radix, Cormorant Garamond + Plus Jakarta Sans, semantic CSS variables |

### Domain layering (reuse, do not fork)

```
src/domain            ← pure rules (numerology, compatibility types, wisdom content)
src/application       ← services (horoscope, compatibility, matchmaking, chat, ai, billing…)
src/infrastructure    ← Mongo models, Pusher, Swiss Ephemeris wrapper
src/app/api           ← transport (Zod validation, session guard, success/error envelope)
```

The mobile app is a **client of this API only**. No astrology engine, no compatibility scoring,
no matchmaking ranking, and no payment entitlement logic is reimplemented in React Native.

## 2. Authentication strategy (mobile-specific)

### Finding

- Better Auth is configured with `nextCookies()` and httpOnly, secure cookies.
- There is **no bearer plugin** in the inspected backend, so a native client previously had
  no first-class session mechanism.
- `src/lib/security/csrf.ts` (`assertSameOriginMutation`) explicitly allows non-browser clients
  that send neither `Origin` nor `Referer`. React Native fetch sends neither by default, so
  mutating endpoints (photos, blocks, checkout) work for native clients.

### Decision

Add the **official Better Auth `bearer()` plugin** to the backend (already applied in this
workspace at `src/lib/auth/index.ts`). It is additive and cannot affect browser cookie auth:

- Sign-in/sign-up responses emit `set-auth-token` (exposed header).
- Every request can send `Authorization: Bearer <token>`.
- The plugin converts the bearer token into the same session the web app uses, so all existing
  `requireSession()` guards, rate limits, CSRF checks and authorization rules are preserved.

The mobile client:

1. Performs auth calls against `/api/auth/*` with a raw fetch client.
2. Reads `set-auth-token` and persists it in **`expo-secure-store`** (never AsyncStorage).
3. Sends `Authorization: Bearer` on every API request.
4. Restores the session by calling `GET /api/auth/me` with the stored token.
5. On `401`, clears the token and returns to the auth stack.
6. On logout, calls `POST /api/auth/sign-out`, wipes SecureStore and TanStack Query cache.

> Web cookie auth is unchanged. If the backend is deployed without the bearer plugin, mobile
> auth fails closed with a clear error (not silently). See `MOBILE_API_CONTRACTS.md §Auth`.

## 3. Mobile stack

| Concern | Choice | Why |
| --- | --- | --- |
| Runtime | Expo SDK 58 (managed), React Native 0.88, React 19.3 | Existing machine SDK; EAS Build/Update |
| Routing | Expo Router 6 (file based, typed routes) | Native stacks + deep links |
| Language | TypeScript strict | Non-negotiable |
| Server state | TanStack Query 5 | Caching, dedupe, invalidation, pagination |
| Client state | React context (session) + Zustand (small UI prefs) | Minimal |
| HTTP | Central `fetch` client with timeout, retry, typed envelope | One place for auth/errors |
| Validation | Zod 4 + React Hook Form | Mirrors backend schemas |
| UI | **StyleSheet design tokens** (no NativeWind) | One consistent system, zero build plugins |
| Charts | `react-native-svg` | Deterministic geometry supplied by backend |
| Motion | `react-native-reanimated` | Reduced-motion aware |
| Fonts | `expo-font` (Cormorant Garamond + Plus Jakarta Sans) | Brand parity |
| Media | `expo-image`, `expo-image-picker` | Caching + camera/gallery |
| Realtime | `pusher-js/react-native` | Existing Pusher contract |
| Notifications | `expo-notifications` | Push + deep link payloads |
| Storage | `expo-secure-store` (secrets) / Zustand persist (non-secret UI) | Security |

### Why StyleSheet tokens instead of NativeWind

The web app already encodes brand decisions in CSS custom properties. Mobile mirrors those
values as a typed token module (`src/theme/tokens`). This keeps one visual language, avoids a
second styling compiler in the native pipeline, and makes dark mode explicit rather than
class-driven. Custom-property parity is documented in `MOBILE_ARCHITECTURE.md §Brand`.

## 4. Project structure

```
mobile/
  app/                       # Expo Router routes only
    (auth)/                  # login, register, forgot, reset, otp, verify
    (onboarding)/            # 10-step wizard
    (tabs)/                  # home, discover, kundli, ai, profile
    (app)/                   # secondary stacks (chat, compatibility, wisdom…)
    _layout.tsx              # providers + guard
  src/
    api/client/              # fetch client, envelope parsing, error taxonomy
    api/endpoints/           # one typed module per backend domain
    api/types/               # DTO types + Zod schemas
    features/                # feature UI + hooks (auth, home, kundli, …)
    components/ui|carts|charts|navigation|feedback
    hooks/                   # shared hooks (query helpers, safe area, motion)
    domain/                  # formatting/selection helpers only (no astrology math)
    lib/auth|storage|analytics|notifications
    theme/tokens|typography
    assets/
  tests/
```

## 5. Navigation map

Bottom tabs (5, no more):

1. **Home** → dashboard, notifications, panchanga detail, activity
2. **Discover** → recommendations, search/filters, match profile, shortlist, likes,
   visitors, connections
3. **Kundli** → overview, charts, dasha, yogas/doshas, gochar, numerology, strength
4. **AI Guide** → AI chat, marriage guru, wisdom library, journal
5. **Profile** → profile, birth details, preferences, photos, premium, settings, privacy

Secondary screens are pushed stacks or modal sheets from these roots. No feature is placed in
the tab bar beyond these five.

## 6. Brand system

The brief supplies a palette; the live web product uses its own semantic variables. Both are
recorded, with the **repository values as the visual source of truth** so the mobile app looks
like VedaMilan rather than a lookalike.

| Role | Brief | Live web variable | Mobile token |
| --- | --- | --- | --- |
| Royal gold | `#C89B3C` | `--gold: #D4AF37` | `brand.gold` |
| Deep saffron | `#E88A14` | `--saffron: #C47A1A` | `brand.saffron` |
| Temple blue | `#1D4ED8` | `--cosmic: #1F3A5F` | `brand.temple` |
| Warm ivory | `#FAF8F4` | `--background: #F7F1E3` | `surface.canvas` |
| Midnight navy | `#071120` | `--background` dark `#0C0A08` | `surface.canvas` (dark) |
| Soft white | — | `--card: #FAF6EE` | `surface.raised` |

Typography: Plus Jakarta Sans for UI, Cormorant Garamond for editorial display, Noto Sans
Devanagari loaded for Sanskrit/Devanagari strings.

## 7. Data flow

```
Screen → feature hook → TanStack Query → api/endpoints → fetch client
      → https://<API_URL>/api/...   (Bearer token, JSON envelope)
      → { success, data } | { success:false, error:{code,message,details} }
```

- Backend envelope is unwrapped once, centrally.
- Errors become a typed `ApiError` with `code`, `status`, `message`, `details`, `isNetwork`.
- Zod validates critical payloads (auth, profile, birth details) at the boundary; other
  payloads are typed structurally and rendered defensively (partial-data handling).
- Mutations invalidate the exact query keys they affect.

## 8. Offline / resilience

- Query cache persists auth-independent screens for a short time (`staleTime` per domain).
- All screens implement loading → skeleton, empty, error+retry, partial data.
- Chat supports optimistic send with rollback and a retry affordance.
- No screen can render a blank state: the shared `ScreenState` component is mandatory.

## 9. Security posture

- Token: SecureStore only; never logged, never in analytics, never in URLs.
- Birth details/conversation text are never logged. Error logging records codes, not payloads.
- Media upload uses the backend's Cloudinary contract; no Cloudinary secret in the app.
- Payments: the app only opens provider checkout and then **asks the backend** for verified
  status. Client callbacks never grant entitlement.
- Logout and account switch purge SecureStore and the Query cache.
- `privacy` and visibility settings are respected by rendering server-provided fields only.

## 10. Known backend gaps (documented, not invented)

| Gap | Reality | Decision |
| --- | --- | --- |
| `/api/kundli/*` | Does not exist | Use `/api/horoscope` + `/api/horoscope/vedic-extras` + `/api/astrology/*` |
| Native Google OAuth | Requires Expo/bearer OAuth callback support not present | Not shown unless enabled; documented web fallback |
| Password reset link | Link targets the web app | Use the supported email-OTP reset endpoints in-app |
| Push device registration | No endpoint to persist Expo push tokens | Local notifications + Pusher realtime now; token registration documented as required backend addition |
| Native voice consultations | Backend exposes session lifecycle + TTS, not an RTC provider | In-app lifecycle + TTS + documented secure web fallback |
| Streaming AI tokens | `/api/ai/chat` returns a complete response | Non-streaming UI with typing indicator |

These are the only non-web-fallback areas. No parallel API was created.
