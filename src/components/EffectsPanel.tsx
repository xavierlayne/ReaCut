import { useState } from "react";
import {
  Check,
  ChevronRight,
  Film,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Waves,
} from "lucide-react";
import type { Adjustments, Clip, TrackKind, Project } from "../core/types";
import { DEFAULT_ADJUSTMENTS } from "../core/defaults";
import "./EffectsPanel.css";
import { MotionLibrary } from "./CreativeLibrary";
import { motionPatch } from "../core/creativePresets";
import PresetPreview from "./PresetPreview";

export interface EffectsPanelProps {
  clip?: Clip;
  project?: Pick<Project, "width" | "height">;
  kind?: TrackKind;
  locked?: boolean;
  onApply: (patch: Partial<Clip>) => void;
}
export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  colors: string;
  category?: "CapCut Trend" | "Sinematik" | "Retro & VHS" | "Işık & Parıltı" | "Temel";
  badge?: string;
  adjustments: Partial<Adjustments>;
}
export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "original",
    name: "Doğal",
    description: "Medyaların doğal renk dengesi",
    colors: "#526658,#baac84,#65828d",
    category: "Temel",
    adjustments: { ...DEFAULT_ADJUSTMENTS },
  },
  {
    id: "deep-glow",
    name: "Deep Glow (Neon Işıltı)",
    description: "CapCut klasiği: Parlak vurgular ve yüksek kontrastlı canlılık",
    colors: "#00f2fe,#4facfe,#ff0844",
    category: "CapCut Trend",
    badge: "CapCut",
    adjustments: {
      brightness: 0.1,
      contrast: 1.25,
      saturation: 1.35,
      temperature: 0.05,
      blur: 0,
    },
  },
  {
    id: "cinema",
    name: "Sinematik Teal & Orange",
    description: "Derin kontrast ve sinematik gişe filmi atmosferi",
    colors: "#243744,#b49868,#406d7a",
    category: "Sinematik",
    badge: "Sinema",
    adjustments: {
      brightness: -0.04,
      contrast: 1.25,
      saturation: 0.85,
      temperature: -0.08,
      blur: 0,
    },
  },
  {
    id: "retro-vhs",
    name: "Retro Gren & VHS",
    description: "90'lar analog video kaset dokusu ve nostaljik ton",
    colors: "#686a4c,#c5b680,#8c987d",
    category: "Retro & VHS",
    badge: "Retro",
    adjustments: {
      brightness: 0.05,
      contrast: 1.15,
      saturation: 0.7,
      temperature: 0.22,
      blur: 0.8,
    },
  },
  {
    id: "focus-blur",
    name: "Odak Bulanıklığı",
    description: "Arka planı ve çevreyi yumuşatan derinlik efekti",
    colors: "#434343,#888888,#000000",
    category: "CapCut Trend",
    badge: "Popüler",
    adjustments: {
      brightness: 0,
      contrast: 1.05,
      saturation: 1.05,
      temperature: 0,
      blur: 4.5,
    },
  },
  {
    id: "light-leak",
    name: "Işık Sızıntısı & Flaş",
    description: "Lens parlaması ve parlak rüya ışığı",
    colors: "#ff9a9e,#fecfef,#feada6",
    category: "Işık & Parıltı",
    badge: "Işık",
    adjustments: {
      brightness: 0.18,
      contrast: 1.15,
      saturation: 1.2,
      temperature: 0.15,
      blur: 0,
    },
  },
  {
    id: "cyberpunk",
    name: "Siberpunk Turkuaz & Neon",
    description: "CapCut gece trendi: Zıt neon mor ve elektrik turkuaz",
    colors: "#f857a6,#ff5858,#18ffff",
    category: "CapCut Trend",
    badge: "Trend",
    adjustments: {
      brightness: 0.02,
      contrast: 1.35,
      saturation: 1.55,
      temperature: -0.22,
      blur: 0,
    },
  },
  {
    id: "golden-hour",
    name: "Altın Saat (Golden Hour)",
    description: "Gün batımı ışığı, sıcak güneş parıltısı",
    colors: "#f6d365,#fda085,#f5576c",
    category: "Işık & Parıltı",
    badge: "Viral",
    adjustments: {
      brightness: 0.08,
      contrast: 1.12,
      saturation: 1.28,
      temperature: 0.38,
      blur: 0,
    },
  },
  {
    id: "film-noir",
    name: "Film Şeridi Noir",
    description: "Klasik siyah beyaz, dramatik ışık gölge",
    colors: "#1a1a1a,#e0e0e0,#666666",
    category: "Sinematik",
    badge: "Noir",
    adjustments: {
      brightness: -0.05,
      contrast: 1.4,
      saturation: 0,
      temperature: 0,
      blur: 0,
    },
  },
  {
    id: "vlog-vivid",
    name: "Canlı VLOG",
    description: "TikTok ve Reels için net, canlı ve aydınlık renkler",
    colors: "#00c6ff,#0072ff,#f857a6",
    category: "CapCut Trend",
    badge: "VLOG",
    adjustments: {
      brightness: 0.06,
      contrast: 1.12,
      saturation: 1.4,
      temperature: 0.02,
      blur: 0,
    },
  },
  {
    id: "warm",
    name: "Sıcak Günışığı",
    description: "Sıcak ve canlı tonlar",
    colors: "#927b51,#ead092,#c4a570",
    category: "Işık & Parıltı",
    adjustments: {
      brightness: 0.05,
      contrast: 1.05,
      saturation: 1.1,
      temperature: 0.3,
      blur: 0,
    },
  },
  {
    id: "cool",
    name: "Soğuk Mavi",
    description: "Soğuk ve berrak renkler",
    colors: "#2c5367,#86acbc,#55788e",
    category: "Sinematik",
    adjustments: {
      brightness: 0.015,
      contrast: 1.12,
      saturation: 0.9,
      temperature: -0.35,
      blur: 0,
    },
  },
  {
    id: "mono",
    name: "Siyah & Beyaz",
    description: "Klasik siyah beyaz tonlar",
    colors: "#343839,#bebdb4,#6d7270",
    category: "Sinematik",
    adjustments: {
      brightness: 0,
      contrast: 1.15,
      saturation: 0,
      temperature: 0,
      blur: 0,
    },
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Nostaljik film renkleri",
    colors: "#686a4c,#c5b680,#8c987d",
    category: "Retro & VHS",
    adjustments: {
      brightness: 0.045,
      contrast: 0.86,
      saturation: 0.72,
      temperature: 0.22,
      blur: 0,
    },
  },
  {
    id: "vivid",
    name: "Canlı",
    description: "Yüksek doygunluk ve parlak renkler",
    colors: "#45836b,#f6cf72,#679baa",
    category: "CapCut Trend",
    badge: "Canlı",
    adjustments: {
      brightness: 0.02,
      contrast: 1.1,
      saturation: 1.45,
      temperature: 0,
      blur: 0,
    },
  },
  {
    id: "soft",
    name: "Yumuşak Odak (Soft Dream)",
    description: "Hafif puslu ve rüya gibi yumuşak tonlar",
    colors: "#8d9d9b,#d6c9af,#a4aeb9",
    category: "Işık & Parıltı",
    badge: "Soft",
    adjustments: {
      brightness: 0.05,
      contrast: 0.95,
      saturation: 1.0,
      temperature: 0.05,
      blur: 2.5,
    },
  },
  {
    id: "vogue-90s",
    name: "90'lar Vogue",
    description: "CapCut 90'lar vintage moda dergisi renk tonu",
    colors: "#c2a689,#6d5238,#e4d7c7",
    category: "Retro & VHS",
    badge: "CapCut",
    adjustments: {
      brightness: 0.04,
      contrast: 1.18,
      saturation: 0.82,
      temperature: 0.15,
      blur: 0,
    },
  },
  {
    id: "clean-girl",
    name: "Temiz Kız (Clean Girl)",
    description: "Doğal ışıltı, pürüzsüz açık ten ve pastel zarafet",
    colors: "#fceee9,#e2bbb4,#8a6f69",
    category: "CapCut Trend",
    badge: "Popüler",
    adjustments: {
      brightness: 0.08,
      contrast: 1.05,
      saturation: 1.12,
      temperature: 0.04,
      blur: 0,
    },
  },
  {
    id: "warm-atmosphere",
    name: "Sıcak Atmosfer",
    description: "Gün batımı ve sıcak iç mekan ambiansı",
    colors: "#ff9900,#ff5500,#ffe680",
    category: "Işık & Parıltı",
    badge: "Trend",
    adjustments: {
      brightness: 0.06,
      contrast: 1.15,
      saturation: 1.25,
      temperature: 0.35,
      blur: 0,
    },
  },
  {
    id: "dual-neon",
    name: "Neon Çift Renk",
    description: "CapCut gece trendi: Zıt neon pembe ve elektrik mavi",
    colors: "#ff007f,#00f2fe,#7928ca",
    category: "CapCut Trend",
    badge: "Neon",
    adjustments: {
      brightness: 0.02,
      contrast: 1.35,
      saturation: 1.6,
      temperature: -0.15,
      blur: 0,
    },
  },
  {
    id: "boyfriend",
    name: "Erkek Arkadaş (Boyfriend)",
    description: "Modern, temiz ve derin gri tonlu sinematik görünüm",
    colors: "#3a4750,#303841,#d3e0ea",
    category: "Sinematik",
    badge: "CapCut",
    adjustments: {
      brightness: 0.03,
      contrast: 1.22,
      saturation: 0.95,
      temperature: -0.05,
      blur: 0,
    },
  },
  {
    id: "honey-baby",
    name: "Bal Bebek",
    description: "Sıcak bal rengi parıltı ve yumuşak cilt vurguları",
    colors: "#ffb347,#ffcc33,#ffeaa7",
    category: "Işık & Parıltı",
    badge: "Viral",
    adjustments: {
      brightness: 0.07,
      contrast: 1.08,
      saturation: 1.22,
      temperature: 0.28,
      blur: 0,
    },
  },
  {
    id: "aqua-refraction",
    name: "Suda Geçirgen Işık",
    description: "Havuz ve okyanus berraklığında ferah mavi yansıma",
    colors: "#00c6ff,#0072ff,#24c6dc",
    category: "Sinematik",
    badge: "Işık",
    adjustments: {
      brightness: 0.04,
      contrast: 1.18,
      saturation: 1.3,
      temperature: -0.28,
      blur: 0,
    },
  },
  {
    id: "flash-shake",
    name: "Flaş Titreşim",
    description: "Müzik ritmine uygun sarsıcı parlaklık ve kontrast patlaması",
    colors: "#ffffff,#ff007f,#00f2fe",
    category: "CapCut Trend",
    badge: "Aksiyon",
    adjustments: {
      brightness: 0.14,
      contrast: 1.28,
      saturation: 1.1,
      temperature: 0,
      blur: 2.5,
    },
  },
];
export function presetPatch(preset: ColorPreset, clip?: Clip): Partial<Clip> {
  return {
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      ...clip?.adjustments,
      ...preset.adjustments,
    },
  };
}
export function fadePatch(
  kind: "visual" | "audio",
  direction: "in" | "out" | "both" | "none",
  seconds: number,
  duration = Infinity,
): Partial<Clip> {
  const value = Math.max(
    0,
    Math.min(seconds, duration / (direction === "both" ? 2 : 1)),
  );
  const incoming = direction === "in" || direction === "both" ? value : 0;
  const outgoing = direction === "out" || direction === "both" ? value : 0;
  return kind === "visual"
    ? { fadeIn: incoming, fadeOut: outgoing }
    : { audioFadeIn: incoming, audioFadeOut: outgoing };
}
export default function EffectsPanel({
  clip,
  project = { width: 1920, height: 1080 },
  kind,
  locked = false,
  onApply,
}: EffectsPanelProps) {
  const [tab, setTab] = useState<"color" | "fade" | "motion">("color");
  const [seconds, setSeconds] = useState(0.5);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const active = COLOR_PRESETS.find((p) =>
    Object.entries(p.adjustments).every(
      ([key, value]) =>
        Math.abs(clip?.adjustments[key as keyof Adjustments]! - Number(value)) <
        0.001,
    ),
  );
  const disabled = !clip || locked;
  const colorDisabled = disabled || kind === "audio" || kind === "text";
  const filteredPresets = COLOR_PRESETS.filter(
    (p) =>
      (category === "Tümü" || p.category === category) &&
      (p.name + p.description).toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <section className="effects-panel" aria-label="Efekt Kitaplığı">
      <div className="effects-title">
        <Sparkles size={15} />
        <strong>Efekt Şablonları · {COLOR_PRESETS.length}</strong>
        <span>Yerleşik</span>
      </div>
      <div className="effects-tabs" role="tablist" aria-label="Efekt Türü">
        <button
          role="tab"
          aria-selected={tab === "color"}
          className={tab === "color" ? "is-active" : ""}
          onClick={() => setTab("color")}
        >
          <SlidersHorizontal size={13} /> Renk Şablonları
        </button>
        <button
          role="tab"
          aria-selected={tab === "motion"}
          className={tab === "motion" ? "is-active" : ""}
          onClick={() => setTab("motion")}
        >
          <Sparkles size={13} /> Hareket Efektleri
        </button>
        <button
          role="tab"
          aria-selected={tab === "fade"}
          className={tab === "fade" ? "is-active" : ""}
          onClick={() => setTab("fade")}
        >
          <Waves size={13} /> Fade Geçişleri
        </button>
      </div>
      <div className="effects-content">
        <div className={`effects-selection ${disabled ? "is-empty" : ""}`}>
          <Film size={14} />
          <span>
            {clip
              ? `${clip.name}${locked ? " · Kanal Kilitli" : ""}`
              : "Zaman çizelgesinde bir klip seçin"}
          </span>
          {clip && <ChevronRight size={12} />}
        </div>
        {tab === "motion" ? (
          <MotionLibrary
            disabled={disabled || kind === "audio"}
            onApply={(motion) => {
              if (clip) onApply(motionPatch(clip, motion, project));
            }}
          />
        ) : tab === "color" ? (
          <>
            <p className="effects-help">
              {kind === "audio"
                ? "Ses klipleri için Fade sekmesinden ses belirme/azalma ayarı yapabilirsiniz."
                : kind === "text"
                  ? "Metin stillerini sağ panelden; Fade sekmesinden ise belirme efektini ayarlayabilirsiniz."
                  : "Şablonu seçtiğinizde klibe uygulanır. Sağ panelden ince ayar yapabilirsiniz."}
            </p>
            <label className="creative-search">
              <input
                aria-label="Renk şablonu ara"
                placeholder="Renk şablonu ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="creative-tabs" role="tablist" aria-label="Efekt Kategorileri">
              {["Tümü", "CapCut Trend", "Sinematik", "Retro & VHS", "Işık & Parıltı"].map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="effects-grid">
              {filteredPresets.map((preset) => (
                <article
                  className="creative-card"
                  key={preset.id}
                  data-preset-id={preset.id}
                >
                  {preset.badge && <span className="creative-badge">{preset.badge}</span>}
                  <PresetPreview
                    adjustments={preset.adjustments}
                    label={preset.name}
                  />
                  <div>
                    <span>
                      {preset.name}
                      <small>{preset.description}</small>
                    </span>
                    <button
                      disabled={colorDisabled}
                      onClick={() => onApply(presetPatch(preset, clip))}
                      aria-label={`${preset.name} şablonunu uygula`}
                      aria-pressed={!!clip && active?.id === preset.id}
                    >
                      <Check size={12} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!filteredPresets.length && (
              <p className="creative-empty">Eşleşen efekt şablonu bulunamadı</p>
            )}
            <button
              className="effects-reset"
              disabled={colorDisabled}
              onClick={() =>
                onApply({ adjustments: { ...DEFAULT_ADJUSTMENTS } })
              }
            >
              <RotateCcw size={12} /> Renkleri Sıfırla
            </button>
          </>
        ) : (
          <>
            <p className="effects-help">
              Klip kenarlarına yumuşak geçişler ekler. Görüntü ve ses ayrı ayarlanabilir.
            </p>
            <label className="effects-duration">
              <span>Süre</span>
              <input
                aria-label="Fade Süresi"
                type="number"
                min="0.05"
                max="10"
                step="0.05"
                value={seconds}
                onChange={(event) => {
                  const n = Number(event.target.value);
                  if (Number.isFinite(n))
                    setSeconds(Math.max(0.05, Math.min(10, n)));
                }}
              />
              <span>sn</span>
            </label>
            {(["visual", "audio"] as const)
              .filter((channel) =>
                channel === "visual" ? kind !== "audio" : kind !== "text",
              )
              .map((kind) => (
                <div className="effects-fade-group" key={kind}>
                  <h3>
                    {kind === "visual" ? "Görüntü" : "Ses"}
                    <span>
                      {clip
                        ? `${kind === "visual" ? clip.fadeIn.toFixed(2) : clip.audioFadeIn.toFixed(2)}s / ${kind === "visual" ? clip.fadeOut.toFixed(2) : clip.audioFadeOut.toFixed(2)}s`
                        : "Giriş / Çıkış"}
                    </span>
                  </h3>
                  <div className="effects-fade-grid">
                    {(["in", "out", "both"] as const).map((direction) => (
                      <button
                        key={direction}
                        disabled={disabled}
                        onClick={() =>
                          onApply(
                            fadePatch(kind, direction, seconds, clip?.duration),
                          )
                        }
                      >
                        <span
                          className={`effects-fade-shape shape-${direction}`}
                        />
                        <span>
                          {direction === "in"
                            ? "Belirme (In)"
                            : direction === "out"
                              ? "Kararma (Out)"
                              : "Her İkisi"}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="effects-reset"
                    disabled={disabled}
                    onClick={() => onApply(fadePatch(kind, "none", 0))}
                  >
                    <RotateCcw size={11} /> {kind === "visual" ? "Görüntü" : "Ses"} Geçişini Kaldır
                  </button>
                </div>
              ))}
            <p className="effects-note">
              Geçiş süresi klip uzunluğunu aşamaz.
            </p>
          </>
        )}
      </div>
      <div className="effects-footer">
        <Check size={11} /> Önizleme ve dışa aktarma aynı parametreleri kullanır
      </div>
    </section>
  );
}
