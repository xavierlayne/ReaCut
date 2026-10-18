import { CAPCUT_STICKERS } from "./capcutStickers";

/** Original ReaCut assets + CapCut authentic sticker collection. */
export type BuiltinAssetCategory = "stickers" | "backgrounds" | "titles" | "sounds";
export interface BuiltinAsset {
  id: string;
  name: string;
  category: BuiltinAssetCategory;
  kind: "image" | "audio";
  fileName: string;
  width: number;
  height: number;
  duration: number;
  tags: string[];
  transparent: boolean;
  coverUrl?: string;
  subCategory?: string;
  badge?: string;
}
const image = (id: string, name: string, category: Exclude<BuiltinAssetCategory, "sounds">, tags: string[]): BuiltinAsset => ({
  id, name, category, kind: "image", fileName: `${id}.png`,
  width: category === "stickers" ? 512 : 1920,
  height: category === "stickers" ? 512 : 1080,
  duration: 5, tags, transparent: category !== "backgrounds",
});
const sound = (id: string, name: string, duration: number, tags: string[]): BuiltinAsset => ({
  id, name, category: "sounds", kind: "audio", fileName: `${id}.wav`,
  width: 0, height: 0, duration, tags, transparent: false,
});
const BASE_BUILTIN_ASSETS: readonly BuiltinAsset[] = [
  image("sparkle", "Yıldız Işıltısı", "stickers", ["yıldız", "parıltı", "sparkle"]),
  image("burst", "Patlama Efekti", "stickers", ["patlama", "vurgu", "burst"]),
  image("heart", "Mercan Kalp", "stickers", ["kalp", "sevgi", "heart"]),
  image("arrow-curved", "Kıvrık Ok", "stickers", ["ok", "işaret", "arrow"]),
  image("arrow-left", "Sola Geri Sar", "stickers", ["geri", "ok", "reverse"]),
  image("play", "Oynat Düğmesi", "stickers", ["oynat", "video", "play"]),
  image("check", "Onay İşareti", "stickers", ["onay", "tamam", "check"]),
  image("pin", "Konum İğnesi", "stickers", ["konum", "harita", "pin"]),
  image("speech", "Konuşma Balonu", "stickers", ["konuşma", "balon", "speech"]),
  image("quote", "Alıntı İşareti", "stickers", ["alıntı", "tırnak", "quote"]),
  image("film", "Mini Film Şeridi", "stickers", ["film", "sinema", "film"]),
  image("clap", "Klaket", "stickers", ["klaket", "çekim", "clap"]),
  image("sun", "Güneş", "stickers", ["güneş", "hava", "sun"]),
  image("rainbow", "Gökkuşağı", "stickers", ["gökkuşağı", "renkli", "rainbow"]),
  image("confetti", "Konfeti", "stickers", ["kutlama", "parti", "confetti"]),
  image("focus", "Odak Çerçevesi", "stickers", ["odak", "kamera", "focus"]),
  image("bg-midnight", "Gece Yarısı", "backgrounds", ["koyu mavi", "gradyan", "dark"]),
  image("bg-sunrise", "Gündoğumu Mercan", "backgrounds", ["sıcak", "gradyan", "warm"]),
  image("bg-mint", "Nane Yeşili", "backgrounds", ["taze", "yeşil", "mint"]),
  image("bg-paper", "Kağıt Dokusu", "backgrounds", ["kağıt", "minimal", "paper"]),
  image("bg-grid", "Koyu Izgara", "backgrounds", ["teknoloji", "ızgara", "grid"]),
  image("bg-orbit", "Mavi Mor Yörünge", "backgrounds", ["teknoloji", "halka", "orbit"]),
  image("title-mint", "Yeşil İsim Şeridi", "titles", ["isim", "alt bant", "röportaj"]),
  image("title-coral", "Mercan Altyazı Bandı", "titles", ["altyazı", "alt bant", "başlık"]),
  image("title-glass", "Koyu Bilgi Kartı", "titles", ["bilgi", "kart", "başlık"]),
  image("title-frame", "Sinematik Çerçeve", "titles", ["çerçeve", "sinema", "başlık"]),
  image("title-corner", "Köşe İşareti", "titles", ["köşe", "etiket", "başlık"]),
  image("title-ribbon", "Vurgu Şeridi", "titles", ["vurgu", "şerit", "başlık"]),
  sound("sound-pop", "Baloncuk Pop", 0.25, ["balon", "geçiş", "pop", "转场"]),
  sound("sound-click", "Hafif Tıklama", 0.12, ["tık", "arayüz", "click"]),
  sound("sound-chime", "Melodik Zil", 1.2, ["zil", "bildirim", "chime"]),
  sound("sound-rise", "Yükselen Ton", 0.65, ["yükselen", "geçiş", "rise", "转场"]),
  sound("sound-whoosh", "Hızlı Rüzgar (Whoosh)", 0.8, ["hızlı", "geçiş", "whoosh", "转场"]),
  sound("sound-complete", "Başarı Sesi", 1.4, ["başarı", "tamam", "complete"]),
  image("bolt", "Şimşek", "stickers", ["şimşek", "enerji", "bolt"]),
  image("cloud", "Bulut", "stickers", ["bulut", "hava", "cloud"]),
  image("moon", "Hilal ve Yıldız", "stickers", ["ay", "gece", "moon"]),
  image("leaf", "Yeşil Yaprak", "stickers", ["yaprak", "doğa", "leaf"]),
  image("flame", "Ateş", "stickers", ["ateş", "sıcak", "flame"]),
  image("camera", "Fotoğraf Makinesi", "stickers", ["kamera", "seyahat", "camera"]),
  image("headphones", "Kulaklık", "stickers", ["müzik", "kulaklık", "headphones"]),
  image("microphone", "Mikrofon", "stickers", ["kayıt", "podcast", "microphone"]),
  image("coffee", "Kahve", "stickers", ["kahve", "içecek", "coffee"]),
  image("paw", "Pati İzi", "stickers", ["pati", "evcil", "paw"]),
  image("medal", "Madalya", "stickers", ["ödül", "başarı", "medal"]),
  image("clock", "Saat", "stickers", ["saat", "zaman", "clock"]),
  image("bg-aurora", "Kuzey Işıkları", "backgrounds", ["aurora", "gece", "aurora"]),
  image("bg-ocean", "Okyanus Dalgası", "backgrounds", ["okyanus", "mavi", "ocean"]),
  image("bg-lavender", "Lavanta Işıltısı", "backgrounds", ["mor", "rüya", "lavender"]),
  image("bg-peach", "Şeftali Geometrik", "backgrounds", ["pembe", "geometrik", "peach"]),
  image("bg-sand", "Çöl Kumları", "backgrounds", ["çöl", "doğa", "sand"]),
  image("bg-dots", "Krem Puantiye", "backgrounds", ["nokta", "sevimli", "dots"]),
  image("bg-blueprint", "Mühendislik Çizimi", "backgrounds", ["plan", "teknoloji", "blueprint"]),
  image("bg-comic", "Çizgi Roman Efekti", "backgrounds", ["çizgi", "vurgu", "comic"]),
  image("title-pill", "Oval İsimlik", "titles", ["kişi", "oval", "pill"]),
  image("title-news", "Haber Bandı", "titles", ["haber", "bülten", "news"]),
  image("title-split", "İki Renkli Bölüm Kartı", "titles", ["bölüm", "kart", "split"]),
  image("title-subtitle", "Karanlık Altyazı Bandı", "titles", ["altyazı", "gradyan", "subtitle"]),
  image("title-tape", "Bantlı Not", "titles", ["not", "bant", "tape"]),
  image("title-chapter", "Minimal Bölüm Çizgisi", "titles", ["bölüm", "minimal", "chapter"]),
  sound("sound-shutter", "Kamera Deklanşörü", 0.22, ["fotoğraf", "deklanşör", "shutter"]),
  sound("sound-impact", "Derin Vuruş (Impact)", 0.5, ["davul", "vurgu", "impact"]),
  sound("sound-twinkle", "Pırıltı Sesi", 1.5, ["bildirim", "yıldız", "twinkle"]),
  sound("sound-fall", "Düşen Ton", 0.65, ["düşüş", "geçiş", "fall", "转场"]),
];

const capcutStickerAssets: BuiltinAsset[] = CAPCUT_STICKERS.map((stk) => ({
  id: stk.id,
  name: stk.name,
  category: "stickers",
  kind: "image",
  fileName: stk.cover.replace("builtin-assets/", ""),
  width: 512,
  height: 512,
  duration: 5,
  tags: [stk.name.toLowerCase(), stk.category.toLowerCase(), "capcut", "çıkartma"],
  transparent: true,
  coverUrl: stk.cover,
  subCategory: stk.category,
  badge: stk.badge,
}));

export const BUILTIN_ASSETS: readonly BuiltinAsset[] = BASE_BUILTIN_ASSETS;

export const CAPCUT_BUILTIN_STICKERS: readonly BuiltinAsset[] = capcutStickerAssets;

export const ALL_CREATIVE_ASSETS: readonly BuiltinAsset[] = [
  ...BASE_BUILTIN_ASSETS,
  ...capcutStickerAssets,
];

export const BUILTIN_CATEGORIES: { id: BuiltinAssetCategory; name: string }[] = [
  { id: "stickers", name: "Çıkartmalar" },
  { id: "backgrounds", name: "Arka Planlar" },
  { id: "titles", name: "Başlık Şablonları" },
  { id: "sounds", name: "Ses Efektleri" },
];
export function findBuiltinAsset(id: string): BuiltinAsset | undefined {
  return ALL_CREATIVE_ASSETS.find((asset) => asset.id === id);
}
export function filterBuiltinAssets(category: BuiltinAssetCategory | "all", query: string): BuiltinAsset[] {
  const text = query.trim().toLocaleLowerCase();
  return ALL_CREATIVE_ASSETS.filter((asset) => (category === "all" || asset.category === category) &&
    `${asset.name} ${asset.tags.join(" ")}`.toLocaleLowerCase().includes(text));
}
export function builtinAssetUrl(asset: BuiltinAsset): string {
  if (asset.coverUrl) {
    return asset.coverUrl.startsWith("http")
      ? asset.coverUrl
      : `${import.meta.env.BASE_URL}${asset.coverUrl}`;
  }
  return `${import.meta.env.BASE_URL}builtin-assets/${asset.fileName}`;
}
