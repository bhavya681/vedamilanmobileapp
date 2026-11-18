const KNOWN_SAGES: Record<string, string> = {
  vyasa: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Vyasa.jpg/240px-Vyasa.jpg",
  vedavyasa: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Vyasa.jpg/240px-Vyasa.jpg",
  valmiki: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Valmiki.jpg/240px-Valmiki.jpg",
  vasistha: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Vashista.jpg/240px-Vashista.jpg",
  vashistha: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Vashista.jpg/240px-Vashista.jpg",
  vishwamitra: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vishvamitra.jpg/240px-Vishvamitra.jpg",
  vishvamitra: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vishvamitra.jpg/240px-Vishvamitra.jpg",
  agastya: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Agastya.jpg/240px-Agastya.jpg",
  agasthya: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Agastya.jpg/240px-Agastya.jpg",
  yajnavalkya: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Yajnavalkya_and_Janaka.jpg/320px-Yajnavalkya_and_Janaka.jpg",
  patanjali: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Patanjali.jpg/240px-Patanjali.jpg",
  kapila: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Kapila.jpg/240px-Kapila.jpg",
  narada: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Narada.jpg/240px-Narada.jpg",
  parashara: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Parasara.jpg/240px-Parasara.jpg",
  bhrigu: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Maharishi_Bhrigu.jpg/240px-Maharishi_Bhrigu.jpg",
  gautama: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Gautama_Maharishi.jpg/240px-Gautama_Maharishi.jpg",
  atri: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Atri_maharshi.jpg/240px-Atri_maharshi.jpg",
  kashyapa: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kashyapa.jpg/240px-Kashyapa.jpg",
  jamadagni: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Jamadagni.jpg/240px-Jamadagni.jpg",
};

const FALLBACK_SAGES: string[] = [
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=240&h=240&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=240&h=240&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=240&h=240&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=240&h=240&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=240&h=240&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=240&h=240&fit=crop&crop=faces",
];

function hashKey(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getSageImage(guide: { id?: string; displayName?: string; sanskritName?: string } | null | undefined): string | undefined {
  if (!guide) return undefined;
  const key = `${guide.id ?? ""} ${guide.displayName ?? ""} ${guide.sanskritName ?? ""}`.toLowerCase();
  const normalized = key.replace(/[^a-z0-9]+/g, "");
  for (const [name, url] of Object.entries(KNOWN_SAGES)) {
    if (normalized.includes(name)) return url;
  }
  const seed = hashKey(guide.id || guide.displayName || "sage");
  return FALLBACK_SAGES[seed % FALLBACK_SAGES.length];
}

export const COUNCIL_IMAGE =
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=240&h=240&fit=crop";

export const AI_GURU_IMAGE =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=240&h=240&fit=crop&crop=faces";

export const MARRIAGE_GURU_IMAGE =
  "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=240&h=240&fit=crop&crop=faces";
