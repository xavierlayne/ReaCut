/** Original, offline editing recipes. MIT; no third-party templates or media. */
import type { Clip, Keyframe, Project, TextStyle } from "./types";
import { CAPCUT_TRANSITIONS } from "./capcutTransitions";
import {
  createClip,
  createTrack,
  evaluateKeyframes,
  id,
  snapToFrame,
} from "./model";

export interface TextPreset {
  id: string;
  name: string;
  category: "Başlık" | "Altyazı" | "Etiket" | "Animasyonlu" | "CapCut Trend" | "WordArt";
  style: Partial<TextStyle> & { text: string };
  y?: number;
  motion?: "rise" | "pop" | "fade";
  badge?: string;
}
export const TEXT_PRESETS: readonly TextPreset[] = [
  {
    id: "tiktok-yellow",
    name: "TikTok Dinamik Sarı",
    category: "CapCut Trend",
    badge: "Viral",
    y: 0.1,
    style: {
      text: "VİDEOYU BEĞENMEYİ UNUTMAYIN!",
      fontSize: 84,
      color: "#ffeb3b",
      stroke: "#000000",
      strokeWidth: 8,
      bold: true,
    },
  },
  {
    id: "neon-green",
    name: "Neon Yeşil Parıltı",
    category: "WordArt",
    badge: "CapCut",
    style: {
      text: "GECE IŞILTISI",
      fontSize: 80,
      color: "#39ff14",
      stroke: "#093806",
      strokeWidth: 5,
      bold: true,
      background: "#08160a",
    },
  },
  {
    id: "cyber-pink",
    name: "Siber Pembe Neon",
    category: "CapCut Trend",
    badge: "Trend",
    style: {
      text: "CYBERPUNK 2077",
      fontSize: 82,
      color: "#ff007f",
      stroke: "#4a0026",
      strokeWidth: 6,
      bold: true,
    },
  },
  {
    id: "gold-luxury",
    name: "Altın Lüks Manşet",
    category: "WordArt",
    badge: "Lüks",
    style: {
      text: "ÖZEL KOLEKSİYON",
      fontSize: 78,
      color: "#ffe066",
      stroke: "#594000",
      strokeWidth: 3,
      bold: true,
    },
  },
  {
    id: "cinema-box",
    name: "Sinematik Şeffaf Kutu",
    category: "CapCut Trend",
    badge: "CapCut",
    y: 0.35,
    style: {
      text: "Her an kaydetmeye değer yeni bir hikayedir.",
      fontSize: 50,
      color: "#ffffff",
      background: "#12141acc",
      bold: false,
      strokeWidth: 0,
    },
  },
  {
    id: "retro-vhs",
    name: "Retro 90'lar VHS",
    category: "WordArt",
    badge: "Retro",
    style: {
      text: "PLAY ► 00:19:94",
      fontSize: 66,
      color: "#00ffff",
      stroke: "#ff007f",
      strokeWidth: 4,
      bold: true,
    },
  },
  {
    id: "news-breaking",
    name: "Kırmızı Canlı Manşet",
    category: "Etiket",
    badge: "Canlı",
    y: -0.32,
    style: {
      text: "SON DAKİKA GELİŞMESİ",
      fontSize: 58,
      color: "#ffffff",
      background: "#d90429",
      bold: true,
      strokeWidth: 0,
    },
  },
  {
    id: "vlog-outline",
    name: "Vlog Beyaz Kontur",
    category: "Altyazı",
    badge: "Vlog",
    y: 0.34,
    style: {
      text: "Bugün yeni bir macera başlıyor",
      fontSize: 54,
      color: "#ffffff",
      stroke: "#000000",
      strokeWidth: 5,
      bold: true,
    },
  },
  {
    id: "pop-3d",
    name: "3D Pop Kabartma",
    category: "Animasyonlu",
    badge: "3D",
    motion: "pop",
    style: {
      text: "İNANILMAZ!",
      fontSize: 98,
      color: "#ff7b00",
      stroke: "#1b2033",
      strokeWidth: 8,
      bold: true,
    },
  },
  {
    id: "fire-red",
    name: "Ateşli Kırmızı Manşet",
    category: "CapCut Trend",
    badge: "Trend",
    style: {
      text: "DİKKAT! MUTLAKA İZLEYİN",
      fontSize: 82,
      color: "#ff1e27",
      stroke: "#000000",
      strokeWidth: 8,
      bold: true,
    },
  },
  {
    id: "bubble-blue",
    name: "Balon Mavi 3D",
    category: "WordArt",
    badge: "3D",
    style: {
      text: "BOMBA HABER",
      fontSize: 88,
      color: "#00f2fe",
      stroke: "#051329",
      strokeWidth: 7,
      bold: true,
    },
  },
  {
    id: "game-arcade",
    name: "8-Bit Arcade Neon",
    category: "WordArt",
    badge: "Oyun",
    style: {
      text: "LEVEL UP! OYUN BAŞLADI",
      fontSize: 76,
      color: "#b000ff",
      stroke: "#39ff14",
      strokeWidth: 5,
      bold: true,
    },
  },
  {
    id: "glossy-silver",
    name: "Metalik Gümüş Yansıma",
    category: "WordArt",
    badge: "Lüks",
    style: {
      text: "PREMIUM EDITION",
      fontSize: 80,
      color: "#ffffff",
      stroke: "#4a5568",
      strokeWidth: 4,
      bold: true,
    },
  },
  {
    id: "classic",
    name: "Klasik Başlık",
    category: "Başlık",
    style: { text: "Fikirlerinizi Videoya Dönüştürün", fontSize: 80 },
  },
  {
    id: "chapter",
    name: "Bölüm Başlığı",
    category: "Başlık",
    style: {
      text: "BÖLÜM 01\nBenim Hikayem",
      fontSize: 66,
      color: "#ffd69a",
      strokeWidth: 0,
    },
  },
  {
    id: "cinema",
    name: "Sinema Başlığı",
    category: "Başlık",
    style: {
      text: "YOLDA\nBİR YOLCULUK",
      fontSize: 90,
      color: "#fff0d5",
      strokeWidth: 0,
    },
  },
  {
    id: "editorial",
    name: "Minimal Manşet",
    category: "Başlık",
    style: {
      text: "GÜNLÜK NOTLAR\nSAYI 01",
      fontSize: 70,
      bold: false,
      strokeWidth: 0,
    },
  },
  {
    id: "subtitle",
    name: "Altyazı Çubuğu",
    category: "Altyazı",
    y: 0.36,
    style: {
      text: "Her an kaydetmeye değer",
      fontSize: 52,
      bold: false,
      background: "#11151c",
      strokeWidth: 0,
    },
  },
  {
    id: "outline",
    name: "Belirgin Kenarlık",
    category: "Altyazı",
    y: 0.36,
    style: { text: "Güne biraz ışık kat", fontSize: 54, strokeWidth: 4 },
  },
  {
    id: "warm-caption",
    name: "Sıcak Altyazı",
    category: "Altyazı",
    y: 0.32,
    style: {
      text: "Yavaşça ilerle, manzaranın tadını çıkar",
      fontSize: 48,
      bold: false,
      color: "#fff0d5",
      background: "#493b32",
      strokeWidth: 0,
    },
  },
  {
    id: "quote",
    name: "Röportaj Alıntısı",
    category: "Altyazı",
    style: {
      text: "“Tutkunu her güne dahil et.”",
      fontSize: 64,
      color: "#a0f1df",
      strokeWidth: 0,
    },
  },
  {
    id: "mint",
    name: "Modern Etiket",
    category: "Etiket",
    style: { text: "REACUT", fontSize: 104, color: "#62ead1", strokeWidth: 0 },
  },
  {
    id: "comic",
    name: "Çizgi Vurgu",
    category: "Etiket",
    style: {
      text: "HARİKA ANLAR!",
      fontSize: 100,
      color: "#ffd176",
      stroke: "#382637",
      strokeWidth: 7,
    },
  },
  {
    id: "label",
    name: "İsim Etiketi",
    category: "Etiket",
    y: 0.3,
    style: {
      text: "Ahmet · İçerik Üreticisi",
      fontSize: 52,
      color: "#15252c",
      background: "#62ead1",
      strokeWidth: 0,
    },
  },
  {
    id: "rise",
    name: "Yükselen Başlık",
    category: "Animasyonlu",
    motion: "rise",
    style: { text: "Yeni Hikaye Başlıyor", fontSize: 74, strokeWidth: 0 },
  },
  {
    id: "pop",
    name: "Zıplayan Başlık",
    category: "Animasyonlu",
    motion: "pop",
    style: { text: "MERHABA!", fontSize: 108, color: "#ffd176", strokeWidth: 4 },
  },
  {
    id: "fade",
    name: "Yumuşak Açılış",
    category: "Animasyonlu",
    motion: "fade",
    style: {
      text: "Güzel Anlarla Buluşma",
      fontSize: 72,
      bold: false,
      color: "#fff0d5",
      strokeWidth: 0,
    },
  },
  {
    id: "end",
    name: "Kapanış",
    category: "Animasyonlu",
    motion: "fade",
    style: {
      text: "İzlediğiniz İçin Teşekkürler\nTekrar Görüşmek Üzere",
      fontSize: 76,
      color: "#a0f1df",
      strokeWidth: 0,
    },
  },
];
type VisualProperty = Exclude<Keyframe["property"], "volume">;
function keys(
  property: VisualProperty,
  points: [number, number][],
): Keyframe[] {
  return points.map(([time, value]) => ({
    id: id(),
    property,
    time,
    value,
    easing: "easeInOut",
  }));
}
function replaceKeys(clip: Clip, additions: Keyframe[]): Keyframe[] {
  const properties = new Set(additions.map((k) => k.property));
  return [
    ...clip.keyframes.filter((k) => !properties.has(k.property)),
    ...additions,
  ];
}
export function makeTextPreset(
  preset: TextPreset,
  trackId: string,
  start: number,
  project: Pick<Project, "width" | "height" | "fps">,
): Clip {
  const clip = createClip(undefined, trackId, start, project.fps);
  const scale = Math.min(project.width / 1920, project.height / 1080);
  clip.text = {
    ...clip.text!,
    ...preset.style,
    fontSize: Math.min(
      1000,
      Math.max(8, (preset.style.fontSize ?? 72) * scale),
    ),
    strokeWidth: (preset.style.strokeWidth ?? 2) * scale,
  };
  clip.name = preset.style.text.replaceAll("\n", " · ");
  clip.transform.y = (preset.y ?? 0) * project.height;
  if (preset.motion) {
    clip.fadeIn = 0.5;
    clip.fadeOut = 0.5;
  }
  if (preset.motion === "rise")
    clip.keyframes = keys("y", [
      [0, clip.transform.y + project.height * 0.12],
      [0.65, clip.transform.y],
    ]);
  if (preset.motion === "pop")
    clip.keyframes = keys("scale", [
      [0, 0.45],
      [0.4, 1.1],
      [0.65, 1],
    ]);
  return clip;
}
export function addTextPreset(
  project: Project,
  preset: TextPreset,
  start: number,
): { project: Project; clip: Clip } {
  const track =
    project.tracks.find((t) => t.kind === "text" && !t.locked) ??
    createTrack("text");
  const clip = makeTextPreset(preset, track.id, start, project);
  return {
    project: {
      ...project,
      tracks: project.tracks.includes(track)
        ? project.tracks
        : [track, ...project.tracks],
      clips: [...project.clips, clip],
    },
    clip,
  };
}
export const MOTION_PRESETS = [
  { id: "push", name: "Yavaş Yakınlaşma", description: "Ana konuya doğru yavaşça yakınlaşır" },
  { id: "pull", name: "Uzaklaşma", description: "Geniş açıya doğru yavaşça uzaklaşır" },
  { id: "pan-left", name: "Sola Kaydırma", description: "Fotoğraf ve manzaralar için sola yumuşak kayma" },
  {
    id: "pan-right",
    name: "Sağa Kaydırma",
    description: "Fotoğraf ve manzaralar için sağa yumuşak kayma",
  },
  { id: "float", name: "Hafif Dalgalanma", description: "Aşağı yukarı nazikçe süzülür" },
  { id: "pulse", name: "Nefes Alma (Pulse)", description: "Yumuşakça büyüyüp küçülür" },
  { id: "sway", name: "Hafif Sallanma", description: "Sağa sola hafifçe sallanır" },
  { id: "shake", name: "Ritmik Titreme", description: "Kısa ve dinamik sarsıntı efekti" },
  { id: "zoom-in", name: "Hızlı Yakınlaşma", description: "CapCut pop: Dinamik odaklanma ve yaklaşma" },
  { id: "zoom-out", name: "Hızlı Uzaklaşma", description: "Geniş plana doğru dinamik geri çekilme" },
  { id: "spin", name: "Akışkan Spin", description: "Dönerek dinamik geçiş sağlayan hareket" },
  { id: "bounce", name: "Yaylanma (Bounce)", description: "Dikey eksende esnek yaylanma hareketi" },
  { id: "flash", name: "Flaş Vurgu", description: "Kısa ve ritmik opaklık parlaması" },
] as const;
export type MotionId = (typeof MOTION_PRESETS)[number]["id"];
export function motionPatch(
  clip: Clip,
  motion: MotionId,
  project: Pick<Project, "width" | "height">,
): Partial<Clip> {
  const d = clip.duration,
    t = clip.transform;
  const scale = (v: number) => Math.max(0.01, Math.min(10, v));
  let frames: Keyframe[];
  switch (motion) {
    case "push":
      frames = keys("scale", [
        [0, t.scale],
        [d, scale(t.scale * 1.18)],
      ]);
      break;
    case "pull":
      frames = keys("scale", [
        [0, scale(t.scale * 1.18)],
        [d, t.scale],
      ]);
      break;
    case "pan-left":
    case "pan-right": {
      const delta = project.width * 0.06 * (motion === "pan-left" ? -1 : 1);
      frames = keys("x", [
        [0, t.x - delta],
        [d, t.x + delta],
      ]);
      break;
    }
    case "float":
      frames = keys("y", [
        [0, t.y],
        [d * 0.25, t.y - project.height * 0.025],
        [d * 0.75, t.y + project.height * 0.025],
        [d, t.y],
      ]);
      break;
    case "pulse":
      frames = keys("scale", [
        [0, t.scale],
        [d * 0.25, scale(t.scale * 1.08)],
        [d * 0.5, t.scale],
        [d * 0.75, scale(t.scale * 1.08)],
        [d, t.scale],
      ]);
      break;
    case "sway":
      frames = keys("rotation", [
        [0, t.rotation],
        [d * 0.25, t.rotation - 3],
        [d * 0.75, t.rotation + 3],
        [d, t.rotation],
      ]);
      break;
    case "shake":
      frames = keys("x", [
        [0, t.x],
        ...Array.from(
          { length: 6 },
          (_, i) =>
            [
              (d * (i + 1)) / 12,
              t.x + project.width * 0.014 * (i % 2 ? 1 : -1),
            ] as [number, number],
        ),
        [d * 0.65, t.x],
        [d, t.x],
      ]);
      break;
    case "zoom-in":
      frames = keys("scale", [
        [0, t.scale],
        [d * 0.45, scale(t.scale * 1.25)],
        [d, scale(t.scale * 1.25)],
      ]);
      break;
    case "zoom-out":
      frames = keys("scale", [
        [0, scale(t.scale * 1.25)],
        [d * 0.45, t.scale],
        [d, t.scale],
      ]);
      break;
    case "spin":
      frames = keys("rotation", [
        [0, t.rotation],
        [d, t.rotation + 360],
      ]);
      break;
    case "bounce":
      frames = keys("y", [
        [0, t.y],
        [d * 0.25, t.y - project.height * 0.06],
        [d * 0.5, t.y],
        [d * 0.75, t.y - project.height * 0.025],
        [d, t.y],
      ]);
      break;
    case "flash":
      frames = keys("opacity", [
        [0, 1],
        [d * 0.2, 0.4],
        [d * 0.4, 1],
        [d * 0.6, 0.4],
        [d * 0.8, 1],
        [d, 1],
      ]);
      break;
  }
  return { keyframes: replaceKeys(clip, frames) };
}
export interface TransitionPresetItem {
  id: string;
  name: string;
  description: string;
  category: string;
  badge?: string;
  cover?: string;
  cdnCover?: string;
}

const BASE_TRANSITION_PRESETS: readonly TransitionPresetItem[] = [
  {
    id: "fade-black",
    name: "Solarak Silme (Dip)",
    description: "CapCut klasiği: İki klip siyah arka plana solarak pürüzsüz geçer",
    category: "Temel & Silme",
    badge: "CapCut",
  },
  {
    id: "dissolve",
    name: "Çözülme (Dissolve)",
    description: "İki klip birbirine yumuşakça karışır",
    category: "Temel & Silme",
  },
  {
    id: "flash-white",
    name: "Beyaz Flaş (Light Leak)",
    description: "CapCut ışık patlaması: Parlak beyaz flaşla geçiş yapar",
    category: "Işık & Parıltı",
    badge: "Popüler",
  },
  {
    id: "zoom-in",
    name: "Hızlı Yakınlaşma (Zoom In)",
    description: "CapCut kamera: Sonraki klip hızla odaklanarak girer",
    category: "Kamera & Hareket",
    badge: "Trend",
  },
  {
    id: "zoom-out",
    name: "Uzaklaşarak Geçiş (Zoom Out)",
    description: "Önceki klip geri çekilirken yeni klip sahneyi doldurur",
    category: "Kamera & Hareket",
    badge: "CapCut",
  },
  {
    id: "blur-cross",
    name: "Bulanık Geçiş (Blur Cross)",
    description: "Klipler sinematik odak bulanıklığı ile birbirine erir",
    category: "Bulanıklık",
    badge: "Sinema",
  },
  {
    id: "glitch",
    name: "Dijital Arıza (Glitch)",
    description: "CapCut arıza efekti: Yatay sarsıntı ve piksel sıçraması",
    category: "Arıza & Glitch",
    badge: "Viral",
  },
  {
    id: "slide-left",
    name: "Sola Kayma (Slide Left)",
    description: "Sonraki klip sağdan sola kayarak girer",
    category: "Kamera & Hareket",
  },
  {
    id: "slide-right",
    name: "Sağa Kayma (Slide Right)",
    description: "Sonraki klip soldan sağa kayarak girer",
    category: "Kamera & Hareket",
  },
  {
    id: "slide-up",
    name: "Yukarı Kayma (Slide Up)",
    description: "Sonraki klip aşağıdan yukarı kayarak girer",
    category: "Kamera & Hareket",
  },
  {
    id: "slide-down",
    name: "Aşağı Kayma (Slide Down)",
    description: "Sonraki klip yukarıdan aşağı kayarak girer",
    category: "Kamera & Hareket",
  },
  {
    id: "spin",
    name: "Dönerek Geçiş (Spin)",
    description: "Sonraki klip hafif dönüp büyüyerek girer",
    category: "Kamera & Hareket",
    badge: "3D",
  },
  {
    id: "dip",
    name: "Karartma (Dip)",
    description: "Önce arka plana solar, sonra diğer klip belirir",
    category: "Temel & Silme",
  },
  {
    id: "zoom",
    name: "Büyüyerek Geçiş (Zoom)",
    description: "Sonraki klip büyüyerek belirir",
    category: "Kamera & Hareket",
  },
];

export const TRANSITION_PRESETS: readonly TransitionPresetItem[] = [
  ...BASE_TRANSITION_PRESETS,
  ...CAPCUT_TRANSITIONS.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,
    badge: c.badge,
    cover: c.cover,
    cdnCover: c.cdnCover,
  })),
];
export type TransitionId = string;
/** Make the leading edge meet the existing curve at duration; preserve its later keys. */
function incomingKeys(
  clip: Clip,
  property: VisualProperty,
  value: number,
  duration: number,
): Keyframe[] {
  const target = evaluateKeyframes(clip, duration).transform[property];
  const sorted = clip.keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.time - b.time);
  const curve = sorted.filter(
    (k, i) => i === sorted.length - 1 || sorted[i + 1].time !== k.time,
  );
  const rightIndex = curve.findIndex((k) => k.time > duration);
  const right = curve[rightIndex],
    left = curve[rightIndex - 1];
  // Restrict the first surviving smoothstep segment to its remaining interval.
  // Merely keeping its destination key would restart easing and change later motion.
  const remaining = clip.keyframes
    .filter((k) => k.property !== property || k.time > duration)
    .map((k) => {
      if (
        k.id !== right?.id ||
        !left ||
        left.time >= duration ||
        right.easing !== "easeInOut"
      )
        return k;
      const window = right.easingWindow ?? { start: 0, end: 1 };
      return {
        ...k,
        easingWindow: {
          start:
            window.start +
            ((window.end - window.start) * (duration - left.time)) /
              (right.time - left.time),
          end: window.end,
        },
      };
    });
  return [
    ...remaining,
    ...keys(property, [
      [0, value],
      [duration, target],
    ]),
  ];
}
export function applyTransition(
  project: Project,
  clipId: string,
  transition: TransitionId,
  seconds: number,
): { project: Project; duration: number } {
  if (
    !TRANSITION_PRESETS.some((p) => p.id === transition) ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  )
    throw new Error("Geçiş parametreleri geçersiz");
  const front = project.clips.find((c) => c.id === clipId),
    track = project.tracks.find((t) => t.id === front?.trackId);
  if (!front || !track || front.text || track.kind === "audio")
    throw new Error("Lütfen bir video klibi seçin");
  if (track.locked) throw new Error("Lütfen önce parçanın kilidini açın");
  const siblings = project.clips
    .filter((c) => c.trackId === track.id)
    .sort((a, b) => a.start - b.start);
  const index = siblings.findIndex((c) => c.id === front.id),
    next = siblings[index + 1];
  const end = front.start + front.duration,
    tolerance = 1 / project.fps + 0.00001;
  if (
    !next ||
    next.text ||
    next.start > end + tolerance ||
    next.start < end - front.duration / 2 - 0.00001
  )
    throw new Error("Aynı parçada bitişik iki video klibi gereklidir; lütfen önce boşlukları veya aşırı çakışmayı giderin");
  const limit = Math.min(5, front.duration / 2, next.duration / 2);
  const duration =
    Math.floor(Math.min(seconds, limit) * project.fps + 1e-8) / project.fps;
  if (duration < 1 / project.fps) throw new Error("Klip çok kısa, geçiş eklenemiyor");
  const isDip = transition === "dip";
  const newStart = snapToFrame(
    end - (isDip ? 0 : duration),
    project.fps,
  );
  if (
    siblings[index + 2] &&
    newStart + next.duration > siblings[index + 2].start + 0.00001
  )
    throw new Error("Geçiş sonraki kliple çakışacak; lütfen sonraki klip için yer açın");
  let incoming: Clip = {
    ...next,
    start: newStart,
    fadeIn: duration,
    audioFadeIn: duration,
    videoFadeWindow: undefined,
    audioFadeWindow: undefined,
  };
  const at = evaluateKeyframes(next, duration).transform;
  const tKey = transition.toLowerCase();
  if (transition.startsWith("slide")) {
    const horizontal =
        transition === "slide-left" || transition === "slide-right",
      property = horizontal ? "x" : "y";
    const sign =
      transition === "slide-left" || transition === "slide-up" ? 1 : -1;
    incoming.keyframes = incomingKeys(
      incoming,
      property,
      at[property] + (horizontal ? project.width : project.height) * sign,
      duration,
    );
    incoming.fadeIn = 0;
  } else if (
    tKey.includes("kayma") ||
    tKey.includes("kayd-r") ||
    tKey.includes("kapi") ||
    tKey.includes("supur")
  ) {
    const horizontal =
      !tKey.includes("yukari") &&
      !tKey.includes("asagi") &&
      (tKey.includes("sol") || tKey.includes("sag") || tKey.includes("cevirme"));
    const property = horizontal ? "x" : "y";
    const sign = tKey.includes("sag") || tKey.includes("asagi") ? -1 : 1;
    incoming.keyframes = incomingKeys(
      incoming,
      property,
      at[property] + (horizontal ? project.width : project.height) * sign,
      duration,
    );
    incoming.fadeIn = 0;
  } else if (
    tKey.includes("zoom-out") ||
    tKey.includes("uzaklas") ||
    tKey.includes("cehennem")
  ) {
    incoming.keyframes = incomingKeys(
      incoming,
      "scale",
      Math.max(0.01, at.scale * 1.7),
      duration,
    );
  } else if (
    transition === "zoom" ||
    transition === "spin"
  ) {
    incoming.keyframes = incomingKeys(
      incoming,
      "scale",
      Math.max(0.01, at.scale * 0.3),
      duration,
    );
  } else if (
    tKey.includes("yakinlas") ||
    tKey.includes("acma") ||
    tKey.includes("yankisi")
  ) {
    incoming.keyframes = incomingKeys(
      incoming,
      "scale",
      Math.max(0.01, at.scale * 0.3),
      duration,
    );
  }
  if (transition === "spin") {
    incoming.keyframes = incomingKeys(
      incoming,
      "rotation",
      at.rotation - 35,
      duration,
    );
  } else if (
    tKey.includes("don") ||
    tKey.includes("vinil") ||
    tKey.includes("topu")
  ) {
    incoming.keyframes = incomingKeys(
      incoming,
      "rotation",
      at.rotation - 35,
      duration,
    );
  } else if (
    tKey.includes("glitch") ||
    tKey.includes("ariza") ||
    tKey.includes("hata") ||
    tKey.includes("sok") ||
    tKey.includes("bozuklugu")
  ) {
    incoming.keyframes = incomingKeys(
      incoming,
      "x",
      at.x + project.width * 0.07,
      duration,
    );
  } else if (
    tKey.includes("blur") ||
    tKey.includes("bulanik") ||
    tKey.includes("yayilim")
  ) {
    incoming.keyframes = incomingKeys(
      incoming,
      "scale",
      Math.max(0.01, at.scale * 1.08),
      duration,
    );
  }
  const outgoing: Clip = {
    ...front,
    fadeOut: isDip ? duration : 0,
    videoFadeWindow: front.videoFadeWindow
      ? {
          ...front.videoFadeWindow,
          fadeOut: isDip ? duration : 0,
        }
      : undefined,
    audioFadeOut: duration,
    audioFadeWindow: undefined,
  };
  // A trimmed envelope's original end need not equal this clip's end: materialize the outgoing dip.
  if (isDip) outgoing.videoFadeWindow = undefined;
  return {
    duration,
    project: {
      ...project,
      clips: project.clips.map((c) =>
        c.id === front.id ? outgoing : c.id === next.id ? incoming : c,
      ),
    },
  };
}
