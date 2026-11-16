export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const SIGN_SANSKRIT = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrishchika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
] as const;

export const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

export const HOUSE_THEMES: Record<number, string> = {
  1: "Self, vitality, appearance",
  2: "Wealth, family, speech",
  3: "Courage, siblings, effort",
  4: "Home, mother, inner peace",
  5: "Romance, children, creativity",
  6: "Health, service, obstacles",
  7: "Marriage, partnership",
  8: "Transformation, longevity",
  9: "Dharma, fortune, guru",
  10: "Career, status, karma",
  11: "Gains, networks, fulfilment",
  12: "Release, expenses, moksha",
};

export const GRAHA_LABELS: Record<string, string> = {
  Sun: "Surya",
  Moon: "Chandra",
  Mars: "Mangala",
  Mercury: "Budha",
  Jupiter: "Guru",
  Venus: "Shukra",
  Saturn: "Shani",
  Rahu: "Rahu",
  Ketu: "Ketu",
  Lagna: "Lagna",
  Ascendant: "Lagna",
};

export const DASHA_ORDER = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
] as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "UNDISCLOSED", label: "Prefer not to say" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "NEVER_MARRIED", label: "Never married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "SEPARATED", label: "Separated" },
] as const;

export const RELIGION_OPTIONS = [
  "Hindu",
  "Jain",
  "Sikh",
  "Buddhist",
  "Parsi",
  "Christian",
  "Muslim",
  "Jewish",
  "Spiritual",
  "Other",
] as const;

export const MOTHER_TONGUE_OPTIONS = [
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Sanskrit",
  "English",
  "Other",
] as const;

export const INCOME_RANGE_OPTIONS = [
  "Below ₹5 LPA",
  "₹5–10 LPA",
  "₹10–20 LPA",
  "₹20–35 LPA",
  "₹35–50 LPA",
  "₹50 LPA+",
  "Prefer not to say",
] as const;

export const DIET_OPTIONS = ["Vegetarian", "Eggetarian", "Non-vegetarian", "Vegan", "Jain"] as const;
export const SMOKING_OPTIONS = ["Never", "Occasionally", "Regularly"] as const;
export const DRINKING_OPTIONS = ["Never", "Socially", "Regularly"] as const;

export const HEIGHT_OPTIONS_CM = Array.from({ length: 61 }, (_, i) => 140 + i);

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Sanskrit",
] as const;

export const AI_AGENTS = [
  {
    key: "VIRTUAL_ASTROLOGER",
    title: "Vedic Astrologer",
    blurb: "Ask anything about your chart, timing, or remedies.",
  },
  {
    key: "ASTROLOGER_GURU",
    title: "Astrologer Guru",
    blurb: "Deep Vedic guidance on life, karma, and your birth chart.",
  },
  {
    key: "HOROSCOPE",
    title: "Horoscope Guide",
    blurb: "Understand your lagna, planets, dashas, and daily influences.",
  },
  {
    key: "COMPATIBILITY",
    title: "Compatibility Guide",
    blurb: "Explore guna milan, strengths, and relationship alignment.",
  },
  {
    key: "MARRIAGE_TIMING",
    title: "Marriage Timing",
    blurb: "Discuss marriage windows and timing factors in your chart.",
  },
  {
    key: "MARRIAGE_GURU",
    title: "Marriage Guru",
    blurb: "Readiness, partner fit, and marriage timing guidance.",
  },
  {
    key: "RELATIONSHIP_COACH",
    title: "Relationship Coach",
    blurb: "Practical guidance for the connection you are building.",
  },
  {
    key: "PROFILE_ANALYSIS",
    title: "Profile Analysis",
    blurb: "Get AI feedback on your profile and how to present yourself.",
  },
  {
    key: "SEARCH",
    title: "Match Search Guide",
    blurb: "Refine what to look for in matches based on your preferences.",
  },
  {
    key: "RECOMMENDATION",
    title: "Recommendations",
    blurb: "Understand why certain matches are suggested for you.",
  },
  {
    key: "REPORT",
    title: "Report Guide",
    blurb: "Walk through your astrology and compatibility reports.",
  },
  {
    key: "WISDOM_GUIDE",
    title: "Wisdom Guide",
    blurb: "Reflective guidance drawn from Vedic wisdom.",
  },
  {
    key: "SUPPORT",
    title: "Support Assistant",
    blurb: "Help with using VedaMilan features and your account.",
  },
] as const;

export const WISDOM_CATEGORIES = [
  { key: "love", label: "Love" },
  { key: "marriage", label: "Marriage" },
  { key: "career", label: "Career" },
  { key: "purpose", label: "Purpose" },
  { key: "peace", label: "Peace" },
  { key: "courage", label: "Courage" },
] as const;

export const AYANAMSHA_OPTIONS = [
  { value: "LAHIRI", label: "Lahiri (Chitrapaksha)" },
  { value: "RAMAN", label: "B.V. Raman" },
  { value: "KP", label: "KP (Krishnamurti)" },
  { value: "YUKTESHWAR", label: "Sri Yukteshwar" },
] as const;

export const CHART_STYLE_OPTIONS = [
  { value: "NORTH", label: "North Indian" },
  { value: "SOUTH", label: "South Indian" },
  { value: "EAST", label: "East Indian" },
] as const;

export const DISCLAIMER =
  "Vedic astrology is a traditional guidance system, not a scientific prediction or a substitute for professional advice. Use these insights reflectively.";
