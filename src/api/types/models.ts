/** DTOs mirroring the audited backend contracts. Fields are optional where the
 * server genuinely varies by entitlement, visibility, or profile completeness. */

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNDISCLOSED";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string | null;
  roles: string[];
  isAdmin: boolean;
  phone: string | null;
};

export type AuthMe = {
  authenticated: true;
  user: SessionUser;
  session: { expiresAt: string };
};

export type ProfilePhoto = {
  publicId?: string;
  url?: string;
  secureUrl?: string;
  isPrimary?: boolean;
};

export type PrivacySettings = {
  showAge?: boolean;
  showMoonSign?: boolean;
  showLagna?: boolean;
  showManglik?: boolean;
  showNakshatra?: boolean;
  acceptInterests?: boolean;
  showOnlineStatus?: boolean;
};

export type Profile = {
  userId: string;
  name: string;
  headline?: string | null;
  about?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  age?: number | null;
  heightCm?: number | null;
  maritalStatus?: string | null;
  religion?: string | null;
  community?: string | null;
  motherTongue?: string | null;
  languages?: string[];
  education?: string | null;
  profession?: string | null;
  company?: string | null;
  incomeRange?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  photos?: ProfilePhoto[];
  visibility?: "PUBLIC" | "MEMBERS" | "HIDDEN";
  privacy?: PrivacySettings;
  isProfileComplete?: boolean;
  profileCompletion?: number;
  completion?: { score: number; isComplete: boolean; missing?: string[] };
  status?: string;
};

export type BirthDetails = {
  birthDate: string;
  birthTime: string;
  birthTimeUnknown?: boolean;
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsha?: string | null;
  chartStylePreference?: "NORTH" | "SOUTH" | "EAST" | null;
};

export type Preferences = {
  ageMin?: number;
  ageMax?: number;
  heightMinCm?: number | null;
  heightMaxCm?: number | null;
  religions?: string[];
  communities?: string[];
  motherTongues?: string[];
  countries?: string[];
  cities?: string[];
  educations?: string[];
  professions?: string[];
  maritalStatuses?: string[];
  diet?: string[];
  manglikPreference?: "ANY" | "NON_MANGLIK" | "MANGLIK" | "PARTIAL_OK";
  minCompatibilityScore?: number;
  maxDistanceKm?: number | null;
  requireSituationalAlignment?: boolean;
  notes?: string;
};

export type ProfileBundle = {
  profile: Profile;
  preferences: Preferences | null;
  birthDetails: BirthDetails | null;
  user: { id: string; name: string; email?: string };
};

export type Planet = {
  planet: string;
  sign: string;
  house: number;
  longitude: number;
  nakshatra?: string;
  dignity?: string | null;
  isRetrograde?: boolean;
  degree?: number;
};

export type YogaInsightDetail = {
  meaning?: string;
  whenActivates?: string;
  watchFor?: string;
  lifeAreas?: string[];
  activationNow?: string;
  engineNote?: string;
  exemplar?: Record<string, unknown>;
};

export type YogaItem = {
  code: string;
  name: string;
  category: string;
  strength?: number;
  description: string;
  insight?: string | YogaInsightDetail;
};

export type DoshaItem = {
  code: string;
  name: string;
  present: boolean;
  severity?: string;
  notes?: string;
  insight?: string;
};

export type HouseChartHouse = {
  house?: number;
  sign?: string;
  planets?: string[] | Array<{ planet: string; degree?: number; retrograde?: boolean }>;
};

export type ChartData = {
  houses?: HouseChartHouse[];
  cells?: unknown;
  lagnaSign?: string;
  [key: string]: unknown;
};

export type DashaPeriod = {
  planet?: string;
  lord?: string;
  startDate?: string;
  endDate?: string;
  startsAt?: string;
  endsAt?: string;
  years?: number;
  subPeriods?: DashaPeriod[];
  [key: string]: unknown;
};

export type DashaBalanceAtBirth = {
  lord?: string;
  yearsRemaining?: number;
  nakshatra?: string;
  [key: string]: unknown;
};

export type DashaLord = string | { lord?: string; planet?: string; [key: string]: unknown };

export type Dasha = {
  system?: string;
  balanceAtBirth?: string | DashaBalanceAtBirth;
  periods?: DashaPeriod[];
  currentMaha?: string | null;
  currentAntar?: string | null;
};

export type Horoscope = {
  lagnaSign: string;
  lagnaDegree?: number;
  lagnaNakshatra?: string;
  moonSign: string;
  sunSign: string;
  planets?: Planet[];
  houseLords?: unknown;
  yogas?: YogaItem[];
  doshas?: DoshaItem[];
  manglikStatus?: string;
  chartNorth?: KundliChart;
  chartSouth?: KundliChart;
  chartEast?: KundliChart;
  calculatedAt?: string;
};

export type HoroscopePayload = {
  horoscope: Horoscope;
  dasha: Dasha;
  manglikNote?: string;
  meta?: Record<string, unknown>;
};


export type ChartPlanetGlyph = {
  planet: string;
  abbr: string;
  label: string;
  degree: string;
  degreeValue: number;
  dignity?: string | null;
  mark?: string;
  isRetrograde?: boolean;
  house?: number;
  signId?: number;
};

export type NorthChartData = {
  style: "NORTH";
  lagnaSignId: number;
  lagnaDegree: number;
  lagnaLabel: string;
  houses: Record<string, ChartPlanetGlyph[]>;
};

export type SouthSignRow = {
  sign: string;
  signId: number;
  house: number;
  planets: ChartPlanetGlyph[];
};

export type SouthChartData = {
  style: "SOUTH" | "EAST";
  lagnaSignId: number;
  lagnaDegree: number;
  lagnaLabel: string;
  signs: SouthSignRow[];
};

export type KundliChart = NorthChartData | SouthChartData;

export type VedicExtras = {
  currentMaha: string | null;
  currentAntar: string | null;
  yogas: YogaItem[];
  rajaYogas: YogaItem[];
  otherYogas: YogaItem[];
  doshas: DoshaItem[];
  natalKoota?: Record<string, unknown> | null;
  ashtakavarga?: unknown;
  charts: {
    d1North?: KundliChart;
    moon?: KundliChart;
    sun?: KundliChart;
    navamsa?: KundliChart;
    catalog?: Array<{ id: string; code: string; name: string; theme?: string }>;
    vargas?: Record<string, KundliChart>;
  };
};

export type Panchanga = {
  tithi?: { name?: string; number?: number; paksha?: string };
  nakshatra?: { name?: string; pada?: number };
  yoga?: { name?: string };
  karana?: { name?: string };
  vara?: { name?: string };
  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  [key: string]: unknown;
};

export type PanchangaResponse = Panchanga & {
  location?: { latitude: number; longitude: number; timezone: string; placeName?: string | null; source?: string };
};

export type GunaBreakdown = { koota: string; score: number; max: number; note: string };

export type CompatibilityReport = {
  overallScore?: number;
  totalGuna?: number;
  maxGuna?: number;
  percentage?: number;
  gunaBreakdown?: GunaBreakdown[];
  categoryScores?: Record<string, number>;
  strengths?: string[];
  challenges?: string[];
  decisionReason?: string;
  advice?: string | string[];
  timing?: unknown;
  advancedMarriageDynamics?: unknown;
  numerologyAlignment?: Record<string, unknown> | null;
  situationalAlignment?: Record<string, unknown> | null;
  generatedAt?: string;
  id?: string;
  candidateUserId?: string;
  candidateName?: string;
  [key: string]: unknown;
};

export type RankedMatch = {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  education: string | null;
  religion: string | null;
  languages: string[];
  heightCm: number | null;
  community?: string | null;
  motherTongue?: string | null;
  country?: string | null;
  maritalStatus?: string | null;
  diet?: string | null;
  manglik: string;
  nakshatra: string | null;
  compatibilityScore: number;
  mindApprox: number;
  totalGuna: number;
  maxGuna: number;
  photo: string | null;
  reasons: string[];
  about: string | null;
  headline: string | null;
  cardSummary: string;
  gunaBreakdown: GunaBreakdown[];
  rank: number;
  recommendationTier?: string;
  preferenceFit?: number;
  hasSituationalAlignment?: boolean;
  situationalScore?: number | null;
  numerologyScore?: number | null;
};

export type Paginated<T> = {
  items?: T[];
  data?: T[];
  results?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
};

export type MatchSearchResponse = Paginated<RankedMatch> & {
  self?: { hasChart: boolean; city?: string | null };
};

export type ChatSummary = {
  id: string;
  otherUserId: string;
  name: string;
  photo: string | null;
  preview: string;
  lastMessageAt: string | null;
  unread: number;
};

export type ChatMessage = {
  id?: string;
  _id?: string;
  chatId?: string;
  senderId: string;
  body?: string;
  type?: "TEXT" | "IMAGE" | "VOICE" | "SYSTEM";
  mediaUrl?: string | null;
  durationSec?: number | null;
  createdAt: string;
  readBy?: string[];
  status?: string;
  clientMessageId?: string;
};

export type MessagesResponse = Paginated<ChatMessage>;

export type AiReply = {
  reply?: string;
  message?: string;
  answer?: string;
  conversationId?: string;
  disclaimer?: string;
  agent?: string;
  [key: string]: unknown;
};

export type AiConversation = {
  id: string;
  agent?: string;
  title?: string;
  updatedAt?: string;
};

export type NotificationItem = {
  id?: string;
  _id?: string;
  title?: string;
  body?: string;
  message?: string;
  type?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt?: string;
};

export type BillingPlan = {
  code: string;
  name: string;
  priceInr: number;
  priceUsd?: number | null;
  interval?: string;
  features?: string[];
  isActive?: boolean;
};

export type Subscription = {
  planCode?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
  provider?: string;
  [key: string]: unknown;
};

export type Payment = {
  id?: string;
  _id?: string;
  provider?: string;
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
};

export type BillingSummary = {
  plans: BillingPlan[];
  subscription: Subscription | null;
  payments: Payment[];
};

export type Celebration = {
  id: string;
  name: string;
  category?: string;
  photo?: string | null;
  birthDate?: string;
  sunSign?: string;
  moonSign?: string;
  [key: string]: unknown;
};

export type WisdomBundle = {
  categories?: Array<{ id: string; name: string; description?: string }>;
  guides?: Array<{ id: string; name: string; category?: string; summary?: string; [key: string]: unknown }>;
  featuredSages?: Array<{ id: string; name: string; [key: string]: unknown }>;
  relationshipGuides?: Array<{ id: string; name: string; [key: string]: unknown }>;
  daily?: { title?: string; body?: string; [key: string]: unknown };
  needs?: Array<{ id: string; label?: string; [key: string]: unknown }>;
  alignment?: unknown;
  disclaimer?: string;
};
