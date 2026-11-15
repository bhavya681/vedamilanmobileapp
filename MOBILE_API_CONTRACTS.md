# VedaMilan Mobile — API Contracts

Base URL: `EXPO_PUBLIC_API_URL` (production `https://vedamilan-lihn.vercel.app`).
All paths below are prefixed with `/api`.

## 0. Envelope

Success:

```json
{ "success": true, "data": <T>, "meta"?: { ... } }
```

Failure:

```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "…", "details"?: ... } }
```

Status codes used by the platform: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `402 PAYMENT_REQUIRED`,
`403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT`, `429` rate limit, `500 INTERNAL_ERROR`,
`503 SERVICE_UNAVAILABLE`.

The mobile client unwraps `data`, and throws a typed `ApiError` otherwise.
`details` is only trusted for `400/409/429` (server contract).

## 1. Authentication

Better Auth handler: **all methods** `/api/auth/[...all]`. Mobile additionally requires the backend
`bearer()` plugin (applied in this workspace). `EXPO_PUBLIC_API_URL` is the host only; the client
appends `/api`.

| Flow | Request | Notes |
| --- | --- | --- |
| Register | `POST /api/auth/sign-up/email` `{ name, email, password, phone?, displayName? }` | 8-char min password. Response sets session; `set-auth-token` header carries the token. |
| Login | `POST /api/auth/sign-in/email` `{ email, password }` | Read `set-auth-token`. |
| Logout | `POST /api/auth/sign-out` | Always clears local session even if this fails. |
| Session | `GET /api/auth/me` | `{ authenticated, user{id,name,email,image,emailVerified,role,roles,isAdmin,phone}, session{expiresAt} }`; `401` when anonymous. |
| Verify email OTP | `POST /api/auth/email-otp/send-verification-otp` `{ email, type:"email-verification" }` → `POST /api/auth/email-otp/verify-email` `{ email, otp }` | 6 digits, 10 min. |
| Request reset OTP | `POST /api/auth/email-otp/request-password-reset` `{ email }` | Email OTP path (works natively). |
| Reset with OTP | `POST /api/auth/email-otp/reset-password` `{ email, otp, password }` | |
| Google | — | **Not enabled natively.** Web-only fallback; see architecture §10. |

Auth header for every API call:

```
Authorization: Bearer <token>
```

`/api/auth/me` also works with cookie auth, so the web app is unaffected.

## 2. Profile & onboarding

| Method | Path | Request | Response `data` |
| --- | --- | --- | --- |
| GET | `/profile` | — | `{ profile, preferences, birthDetails, user }`; `profile.completion` = `{ score, isComplete, ... }`, `profile.age` |
| PATCH/PUT | `/profile` | `ProfileUpdate` (below) | updated profile |
| GET/PUT/PATCH | `/birth-details` | see below | birth details |
| GET/PUT/PATCH | `/preferences` | see below | preferences |
| POST | `/profile/photos` | `{ dataUrl?, imageUrl?, makePrimary? }` | upload result |
| DELETE | `/profile/photos?publicId=` | — | result |
| GET/PATCH | `/appearance` | appearance prefs | appearance |
| GET/PATCH | `/settings/locale` | `{ language, region, timezone, dateFormat, timeFormat, currency, aiLanguage? }` | `{ localization }` |

`ProfileUpdate` (strict; unknown keys rejected):
`name, headline, about, gender(MALE|FEMALE|OTHER|UNDISCLOSED), dateOfBirth(YYYY-MM-DD),
heightCm, maritalStatus, religion, community, motherTongue, languages[], education, profession,
company, incomeRange, city, state, country, lifestyle{diet,smoking,drinking},
visibility(PUBLIC|MEMBERS|HIDDEN), privacy{showAge,showMoonSign,showLagna,showManglik,showNakshatra,
acceptInterests,showOnlineStatus}, completeOnboarding`.

`BirthDetails`:
`{ birthDate:"YYYY-MM-DD", birthTime:"HH:mm(:ss)?", birthTimeUnknown?, placeName, latitude,
longitude, timezone (default Asia/Kolkata), ayanamsha?, chartStylePreference?:NORTH|SOUTH|EAST }`.

`PartnerPreferences`:
`ageMin/ageMax (18–80), heightMinCm/heightMaxCm, religions[], communities[], motherTongues[],
countries[], cities[], educations[], professions[], maritalStatuses[], diet[], manglikPreference,
minCompatibilityScore (0–36), maxDistanceKm, requireSituationalAlignment, notes`.

## 3. Astrology

There is **no `/api/kundli/*`**. Kundli data sources are:

| Method | Path | Response `data` (key fields) |
| --- | --- | --- |
| GET | `/horoscope` | latest `{ horoscope, dasha, manglikNote, meta }` or null-ish when absent |
| POST | `/horoscope` | generate + persist; `201` |
| GET | `/horoscope/vedic-extras` | `{ currentMaha, currentAntar, yogas[], rajaYogas[], otherYogas[], doshas[], natalKoota, ashtakavarga, charts{ d1North, moon, sun, navamsa, catalog[], vargas{} } }` |
| GET | `/panchanga?date&latitude&longitude&timezone` | tithi, nakshatra, yoga, karana, muhurta, `location{source}` |
| GET | `/muhurta?date&activity&latitude&longitude&timezone` | `{ windows[], activity, date, panchanga, location }` |
| GET | `/gochar?date` | transit analysis |
| GET | `/numerology` | `{ hasDob, numberCards[], mulank?, bhagyank?, … }` |
| GET | `/lal-kitab` | report + `disclaimer`; `404` until kundli exists |
| GET | `/marriage-timing` | timing windows |
| GET | `/celestial-horizon?mode&at&latitude&longitude` | sky snapshot |
| GET | `/astrology/shadbala` | six-fold strength |
| GET | `/astrology/planet-strength` | per-planet strength |
| GET | `/astrology/jaimini?convention=sapta|ashta&retrograde=direct|remaining` | karakas |
| GET | `/astrology/bnn` | Bhrigu Nandi Nadi |
| GET | `/astrology/marriage-intelligence` | marriage analysis |
| GET | `/astrology/past-life-deeds` | past-life indicators |
| GET | `/astrology/spiritual-journey` | spiritual path |
| GET | `/astrology/chart-comparison?partnerUserId` | two-chart comparison |
| GET | `/astrology/celebrities?id?` | celebrity atlas (list or one) |
| GET | `/matrimony/marriage-precautions` | precautions |
| GET/PATCH | `/graha-katha/progress` | `{ progress }`; PATCH `{exploreGrahaId|completeChapter|toggleBookmark|saveInsight}` |
| GET/PATCH | `/calendar` | life calendar |

`horoscope.horoscope` contains `lagnaSign, lagnaDegree, moonSign, sunSign, planets[],
houseLords, yogas[], doshas[], manglikStatus, chartNorth, chartSouth, chartEast` and
`dasha.periods[]`. Planet rows carry `planet, sign, house, longitude, nakshatra, dignity,
isRetrograde`.

**Mobile must render only these values.** No client-side chart math.

## 4. Compatibility

| Method | Path | Request | Response `data` |
| --- | --- | --- | --- |
| GET | `/compatibility` | — | `{ reports[] }` |
| POST | `/compatibility` | `{ candidateUserId }` | full report: guna breakdown, category scores, strengths, challenges, timing, decision reason, numerology, situational |
| GET | `/situational-alignment?with=` | — | `{ catalog, profile, comparison? }` |
| PUT | `/situational-alignment` | `{ answers }` or `{ clear:true }` | updated profile |
| GET | `/relationship-journey?partnerUserId` | — | journey space |
| POST | `/relationship-journey` | `{ action: upsertLifePath|createNote|markJourneyStage|shareInsight|… }` | action result |

Compatibility requires **both** users to have generated kundli charts; the API returns `404`
with a clear message otherwise. The app surfaces that as an actionable state, not an error toast.

## 5. Matchmaking / discovery

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/matches?q&city&religion&profession&education&language&manglik&minAge&maxAge&minHeightCm&maxHeightCm&minCompatibility&page&limit&applyPreferences&requireSituational` | Paginated `RankedMatch[]` + `self{hasChart,city}` |
| GET | `/search` | Same engine as `/matches`; `prefs=0` disables saved preferences |
| GET | `/recommendations` | Tiered ranked list |
| GET | `/matches/[userId]` | `{ profile }` full candidate |
| GET/POST | `/likes` | POST `{ toUserId, type: LIKE|SUPER_LIKE|INTEREST }` |
| GET/POST | `/shortlist` | POST `{ targetUserId, note? }` |
| GET | `/visitors` | `{ visitors[] }` |
| GET/POST/DELETE | `/interests` | `{ toUserId }` |
| GET | `/connections` / `?with=` | hub or pairwise state |
| POST | `/connections/requests` | `{ toUserId, message? }` |
| POST | `/connections/requests/[id]` | `{ action: accept|decline|withdraw }` |
| DELETE | `/connections` | `{ otherUserId }` |
| GET/POST/DELETE | `/blocks` | POST `{ blockedId, reason? }` |

`RankedMatch` fields used by cards: `userId, name, age, city, profession, education, religion,
languages, heightCm, community, motherTongue, country, maritalStatus, diet, manglik, nakshatra,
compatibilityScore, mindApprox, totalGuna, maxGuna, photo, reasons, about, headline, cardSummary,
gunaBreakdown, rank, recommendationTier, preferenceFit, hasSituationalAlignment, situationalScore,
numerologyScore`.

Discovery is **opposite-gender and photo-required** server-side. The app never bypasses this.

## 6. Messaging

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/chats` | `{ chats[] }` → `{ id, otherUserId, name, photo, preview, lastMessageAt, unread }` |
| POST | `/chats` | `{ otherUserId }`; `403` until Connected |
| GET | `/chats/[chatId]/messages?page&limit` | paginated messages; marks read |
| POST | `/chats/[chatId]/messages` | `{ body?, type?:TEXT|IMAGE|VOICE, mediaUrl?, mediaPublicId?, durationSec?, clientMessageId? }` |
| POST | `/chats/[chatId]/typing` | `{ isTyping }` |
| GET | `/chats/ice-breakers?otherUserId` | `{ replies[] }` |
| POST | `/chats/media` | multipart `file`, `kind=image|voice` → Cloudinary result |
| POST | `/chat/translate` | `{ text, targetLocale, sourceLocale? }` |
| POST | `/pusher/auth` | form `socket_id`, `channel_name` (`private-chat-<id>`) |

Realtime: `NEXT_PUBLIC_PUSHER_KEY` + `NEXT_PUBLIC_PUSHER_CLUSTER`; auth endpoint is the
existing `/pusher/auth`. The app reads the key/cluster from `EXPO_PUBLIC_PUSHER_*`.

## 7. AI & wisdom

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/ai/chat?agent` | — | conversations |
| POST | `/ai/chat` | `{ agent, message, conversationId?, candidateUserId?, ui?:false }` | assistant reply (complete, not streamed) |
| GET | `/ai/insights` | — | insight bundle |
| POST | `/ai/guide` | `{ message }` | public product-guide answer (no auth) |
| GET | `/ai/marriage-guru` | — | marriage guru bundle |
| GET | `/wisdom?guideId|need` | — | categories, guides, sages, daily, alignment, disclaimer |
| POST | `/wisdom` | `{ guideId, message, conversationId?, topic?, includeLifeContext? }` | reply |
| GET/POST | `/wisdom/journal` | POST `{ guideId?, guideName?, category, question?, insight, reflection? }` | entries |
| GET/POST/PUT | `/wisdom/voice/session` | POST `{ guideId, language }` | quota + session |
| POST/GET | `/wisdom/voice/tts` | `{ text, voice?, language?, gender? }` | audio stream (`204` when unavailable) |

Every AI astrology surface must display the Vedic disclaimer returned by the backend.

## 8. Consultations

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/consultation/astrologers?id=` | curated virtual astrologers + disclaimer |
| POST | `/consultation/chat` | `{ astrologerId, message, conversationId?, language? }` |
| GET/POST/PUT | `/consultation/voice/session` | quota, start, update |

Native RTC is not provided by the backend. Text is fully supported; voice uses session
lifecycle + TTS with a documented secure web fallback.

## 9. Billing

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/billing` | `{ plans, subscription, payments }` |
| GET | `/billing/invoices` | `{ plans, payments }` |
| POST | `/billing/checkout` | `{ planCode, provider: STRIPE|RAZORPAY }` → hosted/checkout payload |
| POST | `/billing/razorpay/verify` | `{ orderId, paymentId, signature }` — **server verifies** |
| POST | `/billing/webhooks/stripe` | server-only |

Entitlements are always re-read from `/billing` after payment. A client callback never unlocks.

## 10. Notifications, health, misc

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/notifications` | `{ notifications[], unread }` |
| PATCH | `/notifications` | `{ markAll?:true }` or `{ notificationId }` |
| GET | `/health`, `/ready` | liveness (unauthenticated) |
| POST | `/contact` | support/contact |

Push token persistence is **not implemented server-side**; the contract is documented as a
required backend addition. Until then the app uses Pusher for realtime and local notifications
for in-app events.

## 11. Query key & invalidation map (mobile)

| Mutation | Invalidates |
| --- | --- |
| profile update | `profile`, `dashboard`, `discover` |
| birth details save | `birth`, `horoscope`, `kundli:*`, `dashboard` |
| kundli generate | all `kundli:*`, `compatibility:*`, `dashboard` |
| like / shortlist / interest | `likes`, `shortlist`, `interests`, `discover` |
| connection request/accept | `connections`, `chats`, `discover` |
| send message | `chat:<id>`, `chats` |
| checkout verify | `billing`, `entitlements` |
| notification read | `notifications` |
