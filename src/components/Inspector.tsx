import { useEffect, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Diamond,
  FlipHorizontal2,
  FlipVertical2,
  Image,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  Type,
  Volume2,
  WandSparkles,
} from "lucide-react";
import type { Clip, Keyframe, Project } from "../core/types";
import { DEFAULT_TRANSFORM, DEFAULT_ADJUSTMENTS } from "../core/defaults";
import { evaluateKeyframes, formatTime, id } from "../core/model";
import VisualTools from "./VisualTools";
import "./Inspector.css";
import { useEditorStore } from "../editor/store";
interface Props {
  project: Project;
  clip?: Clip;
  playhead: number;
  onUpdate: (patch: Partial<Clip>) => void;
  onProjectUpdate: (patch: Partial<Project>) => void;
}
function NumberField({
  label,
  value,
  min = -100000,
  max = 100000,
  step = 1,
  onChange,
  suffix,
  diamond,
  range = false,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  diamond?: () => void;
  range?: boolean;
}) {
  return (
    <label className="property-row">
      <span>{label}</span>
      {range && (
        <input
          className="property-range"
          aria-label={`${label} kaydırıcı`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onPointerDown={() => useEditorStore.getState().beginTransaction()}
          onPointerUp={() => useEditorStore.getState().endTransaction()}
          onPointerCancel={() => useEditorStore.getState().endTransaction()}
          onKeyDown={() => useEditorStore.getState().beginTransaction()}
          onKeyUp={() => useEditorStore.getState().endTransaction()}
          onBlur={() => useEditorStore.getState().endTransaction()}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      )}
      <div className="numeric-field">
        <input
          aria-label={label}
          type="number"
          value={Number(value.toFixed(3))}
          min={min}
          max={max}
          step={step}
          onFocus={() => useEditorStore.getState().beginTransaction()}
          onBlur={() => useEditorStore.getState().endTransaction()}
          onChange={(e) => {
            if (e.target.value === "") return;
            const v = Number(e.target.value);
            if (Number.isFinite(v) && v >= min && v <= max) onChange(v);
          }}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {diamond && (
        <button
          className="diamond-btn"
          title={`${label} için anahtar kare ekle`}
          onClick={(e) => {
            e.preventDefault();
            diamond();
          }}
        >
          <Diamond size={12} />
        </button>
      )}
    </label>
  );
}
function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="slider-property">
      <div>
        <label>{label}</label>
        <span>{format ? format(value) : value.toFixed(2)}</span>
      </div>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={() => useEditorStore.getState().beginTransaction()}
        onPointerUp={() => useEditorStore.getState().endTransaction()}
        onPointerCancel={() => useEditorStore.getState().endTransaction()}
        onKeyDown={() => useEditorStore.getState().beginTransaction()}
        onKeyUp={() => useEditorStore.getState().endTransaction()}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
export default function Inspector({
  project,
  clip,
  playhead,
  onUpdate,
  onProjectUpdate,
}: Props) {
  const [tab, setTab] = useState("Görüntü"),
    [fonts, setFonts] = useState<string[]>([
      "Noto Sans SC",
      "sans-serif",
      "PingFang SC",
      "Arial",
      "Georgia",
    ]);
  useEffect(() => {
    void window.editorAPI
      ?.getFontFamilies()
      .then((fonts) => setFonts(fonts))
      .catch(() => {});
  }, []);
  useEffect(() => {
    setTab(
      clip?.text
        ? "Metin"
        : project.assets.find((a) => a.id === clip?.assetId)?.kind === "audio"
          ? "Ses"
          : "Görüntü",
    );
  }, [clip?.id, !!clip?.text]);
  if (!clip)
    return (
      <aside className="inspector panel">
        <div className="panel-heading">
          <span>Proje Özellikleri</span>
          <SlidersHorizontal size={16} />
        </div>
        <div className="inspector-content">
          <h3>Tuval Ayarları</h3>
          <label className="stacked-label">
            Proje Adı
            <input
              value={project.name}
              onFocus={() => useEditorStore.getState().beginTransaction()}
              onBlur={() => useEditorStore.getState().endTransaction()}
              onChange={(e) => onProjectUpdate({ name: e.target.value })}
            />
          </label>
          <label className="property-row">
            <span>Görüntü Oranı</span>
            <select
              aria-label="Görüntü Oranı"
              value={`${project.width}:${project.height}`}
              onChange={(e) => {
                const [width, height] = e.target.value.split(":").map(Number);
                onProjectUpdate({ width, height });
              }}
            >
              {![
                "1920:1080",
                "1080:1920",
                "1080:1080",
                "1440:1080",
                "2560:1440",
                "3840:2160",
              ].includes(`${project.width}:${project.height}`) && (
                <option value={`${project.width}:${project.height}`}>
                  Özel
                </option>
              )}
              <option value="1920:1080">16:9 · Yatay</option>
              <option value="1080:1920">9:16 · Dikey</option>
              <option value="1080:1080">1:1 · Kare</option>
              <option value="1440:1080">4:3 · Klasik</option>
              <option value="2560:1440">16:9 · 2K</option>
              <option value="3840:2160">16:9 · 4K</option>
            </select>
          </label>
          <NumberField
            label="Genişlik"
            value={project.width}
            min={16}
            max={7680}
            step={2}
            suffix="px"
            onChange={(width) => onProjectUpdate({ width })}
          />
          <NumberField
            label="Yükseklik"
            value={project.height}
            min={16}
            max={7680}
            step={2}
            suffix="px"
            onChange={(height) => onProjectUpdate({ height })}
          />
          <label className="property-row">
            <span>Kare Hızı</span>
            <select
              aria-label="Kare Hızı"
              value={project.fps}
              onChange={(e) => onProjectUpdate({ fps: Number(e.target.value) })}
            >
              {[24, 25, 30, 50, 60].map((fps) => (
                <option key={fps} value={fps}>
                  {fps} fps
                </option>
              ))}
            </select>
          </label>
          <label className="property-row">
            <span>Arka Plan Rengi</span>
            <input
              aria-label="Arka Plan Rengi"
              type="color"
              value={project.background}
              onChange={(e) => onProjectUpdate({ background: e.target.value })}
            />
            <code>{project.background}</code>
          </label>
          <div className="inspector-guide">
            <Image size={30} />
            <p>Bir klip seçin</p>
            <span>Burada görüntü, ses, metin ve animasyonları düzenleyebilirsiniz</span>
          </div>
          <div className="offline-note">
            <span className="status-dot" />
            Dosyalar yerel olarak saklanır, %100 çevrimdışı
          </div>
        </div>
      </aside>
    );
  const track = project.tracks.find((t) => t.id === clip.trackId)!,
    asset = project.assets.find((a) => a.id === clip.assetId);
  const local = Math.max(0, Math.min(clip.duration, playhead - clip.start)),
    evaluated = evaluateKeyframes(clip, local),
    locked = track.locked;
  const key = (property: Keyframe["property"], value: number) => {
    const at = Math.min(
      clip.duration,
      Math.round(local * project.fps) / project.fps,
    );
    const existing = clip.keyframes.find(
      (k) =>
        k.property === property && Math.abs(k.time - at) < 0.5 / project.fps,
    );
    onUpdate({
      keyframes: existing
        ? clip.keyframes.filter((k) => k.id !== existing.id)
        : [
            ...clip.keyframes,
            { id: id(), property, time: at, value, easing: "linear" },
          ],
    });
  };
  const animate = (property: Keyframe["property"], value: number) => {
    if (clip.keyframes.some((k) => k.property === property)) {
      const at = Math.min(
          clip.duration,
          Math.round(local * project.fps) / project.fps,
        ),
        existing = clip.keyframes.find(
          (k) =>
            k.property === property &&
            Math.abs(k.time - at) < 0.5 / project.fps,
        );
      onUpdate({
        keyframes: existing
          ? clip.keyframes.map((k) =>
              k.id === existing.id ? { ...k, value } : k,
            )
          : [
              ...clip.keyframes,
              { id: id(), property, time: at, value, easing: "linear" },
            ],
      });
    } else if (property === "volume") onUpdate({ volume: value });
    else onUpdate({ transform: { ...clip.transform, [property]: value } });
  };
  const visual = asset?.kind !== "audio";
  const pictureTabs = ["Görüntü", "Kırpma", "Chroma Key", "Maske"];
  const pictureActive = pictureTabs.includes(tab);
  const tabs = clip.text
    ? ["Metin", "Görüntü", "Animasyon", "Hız"]
    : visual
      ? ["Görüntü", "Ses", "Hız", "Animasyon", "Renk"]
      : ["Ses", "Hız", "Animasyon"];
  const tabLabel = (value: string) =>
    value === "Hız" ? "Hız" : value === "Renk" ? "Renk" : value;
  return (
    <aside className="inspector panel">
      <div className="inspector-tabs">
        <nav className="inspector-main-tabs" aria-label="Klip Özellikleri">
          {tabs.map((t) => (
            <button
              key={t}
              aria-label={t}
              aria-pressed={tab === t || (t === "Görüntü" && pictureActive)}
              className={tab === t || (t === "Görüntü" && pictureActive) ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {tabLabel(t)}
            </button>
          ))}
        </nav>
        {visual && !clip.text && (
          <nav className="inspector-picture-tabs" aria-label="Görüntü Araçları" hidden={!pictureActive}>
            {pictureTabs.map((t) => (
              <button
                key={t}
                aria-label={t === "Görüntü" ? "Temel Görüntü" : t}
                aria-pressed={tab === t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t === "Görüntü" ? "Temel" : t}
              </button>
            ))}
          </nav>
        )}
      </div>
      <div className="inspector-content">
        <div className="clip-info">
          <strong>{clip.name}</strong>
          <span>
            {track.name} · {formatTime(clip.duration, project.fps)}
          </span>
        </div>
        {locked && (
          <div className="inline-warning">Kanal kilitli, düzenlemek için kilidi açın</div>
        )}
        <fieldset disabled={locked}>
          {["Kırpma", "Chroma Key", "Maske"].includes(tab) && (
            <VisualTools
              mode={
                tab === "Kırpma" ? "crop" : tab === "Chroma Key" ? "chroma" : "mask"
              }
              clip={clip}
              asset={asset}
              onUpdate={onUpdate}
              locked={locked}
            />
          )}
          {tab === "Görüntü" && (
            <>
              <div className="section-title">
                <h3>Konum ve Boyut</h3>
                <button
                  title="Dönüşümü Sıfırla"
                  onClick={() =>
                    onUpdate({
                      transform: { ...DEFAULT_TRANSFORM },
                      keyframes: clip.keyframes.filter(
                        (k) => k.property === "volume",
                      ),
                    })
                  }
                >
                  <RotateCcw size={13} />
                </button>
              </div>
              <NumberField
                label="Ölçek"
                range
                value={evaluated.transform.scale * 100}
                min={1}
                max={1000}
                suffix="%"
                onChange={(v) => animate("scale", v / 100)}
                diamond={() => key("scale", evaluated.transform.scale)}
              />
              <div className="position-fields">
              <NumberField
                label="Konum X"
                value={evaluated.transform.x}
                onChange={(v) => animate("x", v)}
                diamond={() => key("x", evaluated.transform.x)}
              />
              <NumberField
                label="Konum Y"
                value={evaluated.transform.y}
                onChange={(v) => animate("y", v)}
                diamond={() => key("y", evaluated.transform.y)}
              />
              </div>
              <NumberField
                label="Döndürme"
                value={evaluated.transform.rotation}
                min={-3600}
                max={3600}
                suffix="°"
                onChange={(v) => animate("rotation", v)}
                diamond={() => key("rotation", evaluated.transform.rotation)}
              />
              <NumberField
                label="Opaklık"
                value={evaluated.transform.opacity * 100}
                min={0}
                max={100}
                suffix="%"
                onChange={(v) => animate("opacity", v / 100)}
                diamond={() => key("opacity", evaluated.transform.opacity)}
              />
              <div className="property-row">
                <span>Çevir</span>
                <div className="segmented">
                  <button
                    className={clip.transform.flipX ? "active" : ""}
                    title="Yatay Çevir"
                    onClick={() =>
                      onUpdate({
                        transform: {
                          ...clip.transform,
                          flipX: !clip.transform.flipX,
                        },
                      })
                    }
                  >
                    <FlipHorizontal2 size={17} />
                  </button>
                  <button
                    className={clip.transform.flipY ? "active" : ""}
                    title="Dikey Çevir"
                    onClick={() =>
                      onUpdate({
                        transform: {
                          ...clip.transform,
                          flipY: !clip.transform.flipY,
                        },
                      })
                    }
                  >
                    <FlipVertical2 size={17} />
                  </button>
                </div>
              </div>
              <h3>Görüntü Belirme / Kararma</h3>
              <NumberField
                label="Belirme (Fade In)"
                value={clip.fadeIn}
                min={0}
                max={clip.duration}
                step={0.1}
                suffix="s"
                onChange={(fadeIn) => onUpdate({ fadeIn })}
              />
              <NumberField
                label="Kararma (Fade Out)"
                value={clip.fadeOut}
                min={0}
                max={clip.duration}
                step={0.1}
                suffix="s"
                onChange={(fadeOut) => onUpdate({ fadeOut })}
              />
            </>
          )}
          {tab === "Ses" && (
            <>
              <h3>Ses Düzeyi</h3>
              <NumberField
                label="Ses"
                value={evaluated.volume * 100}
                min={0}
                max={400}
                suffix="%"
                onChange={(v) => animate("volume", v / 100)}
                diamond={() => key("volume", evaluated.volume)}
              />
              <label className="toggle-property">
                <span>Klibi Sustur</span>
                <input
                  aria-label="Klibi Sustur"
                  type="checkbox"
                  checked={clip.muted}
                  onChange={(e) => onUpdate({ muted: e.target.checked })}
                />
              </label>
              <h3>Ses Belirme / Azalma</h3>
              <NumberField
                label="Ses Belirme"
                value={clip.audioFadeIn}
                min={0}
                max={clip.duration}
                step={0.1}
                suffix="s"
                onChange={(audioFadeIn) => onUpdate({ audioFadeIn })}
              />
              <NumberField
                label="Ses Azalma"
                value={clip.audioFadeOut}
                min={0}
                max={clip.duration}
                step={0.1}
                suffix="s"
                onChange={(audioFadeOut) => onUpdate({ audioFadeOut })}
              />
              {!asset?.hasAudio && (
                <p className="muted">Bu klibin ses kanalı bulunmuyor.</p>
              )}
            </>
          )}
          {tab === "Renk" && (
            <>
              <div className="section-title">
                <h3>Temel Renk Ayarları</h3>
                <button
                  title="Renkleri Sıfırla"
                  onClick={() =>
                    onUpdate({ adjustments: { ...DEFAULT_ADJUSTMENTS } })
                  }
                >
                  <RotateCcw size={13} />
                </button>
              </div>
              <Slider
                label="Parlaklık"
                value={clip.adjustments.brightness}
                min={-1}
                max={1}
                onChange={(v) =>
                  onUpdate({
                    adjustments: { ...clip.adjustments, brightness: v },
                  })
                }
              />
              <Slider
                label="Kontrast"
                value={clip.adjustments.contrast}
                min={0}
                max={3}
                onChange={(v) =>
                  onUpdate({
                    adjustments: { ...clip.adjustments, contrast: v },
                  })
                }
              />
              <Slider
                label="Doygunluk"
                value={clip.adjustments.saturation}
                min={0}
                max={3}
                onChange={(v) =>
                  onUpdate({
                    adjustments: { ...clip.adjustments, saturation: v },
                  })
                }
              />
              <Slider
                label="Renk Sıcaklığı"
                value={clip.adjustments.temperature}
                min={-1}
                max={1}
                onChange={(v) =>
                  onUpdate({
                    adjustments: { ...clip.adjustments, temperature: v },
                  })
                }
              />
              <Slider
                label="Bulanıklık"
                value={clip.adjustments.blur}
                min={0}
                max={100}
                step={1}
                onChange={(v) =>
                  onUpdate({ adjustments: { ...clip.adjustments, blur: v } })
                }
              />
              <p className="field-hint">
                Önizleme ve dışa aktarma aynı renk modelini kullanır.
                Renk dönüşümü ve kodlama sırasında ufak farklılıklar olabilir.
              </p>
            </>
          )}
          {tab === "Metin" && clip.text && (
            <>
              <h3>Metin İçeriği</h3>
              <textarea
                aria-label="Metin İçeriği"
                value={clip.text.text}
                rows={4}
                onFocus={() => useEditorStore.getState().beginTransaction()}
                onBlur={() => useEditorStore.getState().endTransaction()}
                onChange={(e) =>
                  onUpdate({
                    name: e.target.value.slice(0, 30) || "Metin",
                    text: { ...clip.text!, text: e.target.value },
                  })
                }
              />
              <label className="property-row">
                <span>Yazı Tipi</span>
                <select
                  aria-label="Yazı Tipi"
                  value={clip.text.fontFamily}
                  onChange={(e) =>
                    onUpdate({
                      text: { ...clip.text!, fontFamily: e.target.value },
                    })
                  }
                >
                  <option value="sans-serif">Sistem Varsayılanı</option>
                  {fonts
                    .filter((f) => f !== "sans-serif")
                    .map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                </select>
              </label>
              <NumberField
                label="Boyut"
                value={clip.text.fontSize}
                min={1}
                max={1000}
                suffix="px"
                onChange={(fontSize) =>
                  onUpdate({ text: { ...clip.text!, fontSize } })
                }
              />
              <label className="property-row">
                <span>Metin Rengi</span>
                <input
                  aria-label="Metin Rengi"
                  type="color"
                  value={clip.text.color}
                  onChange={(e) =>
                    onUpdate({ text: { ...clip.text!, color: e.target.value } })
                  }
                />
                <button
                  className={clip.text.bold ? "active" : ""}
                  title="Kalın"
                  onClick={() =>
                    onUpdate({
                      text: { ...clip.text!, bold: !clip.text!.bold },
                    })
                  }
                >
                  <b>B</b>
                </button>
              </label>
              <div className="property-row">
                <span>Hizalama</span>
                <div className="segmented">
                  {(["left", "center", "right"] as const).map((align, i) => (
                    <button
                      key={align}
                      title={["Sola Hizala", "Ortala", "Sağa Hizala"][i]}
                      className={clip.text!.align === align ? "active" : ""}
                      onClick={() =>
                        onUpdate({ text: { ...clip.text!, align } })
                      }
                    >
                      {i === 0 ? (
                        <AlignLeft size={16} />
                      ) : i === 1 ? (
                        <AlignCenter size={16} />
                      ) : (
                        <AlignRight size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <h3>Kenarlık ve Arka Plan</h3>
              <label className="property-row">
                <span>Kenarlık Rengi</span>
                <input
                  aria-label="Kenarlık Rengi"
                  type="color"
                  value={clip.text.stroke}
                  onChange={(e) =>
                    onUpdate({
                      text: { ...clip.text!, stroke: e.target.value },
                    })
                  }
                />
              </label>
              <NumberField
                label="Kenarlık Kalınlığı"
                value={clip.text.strokeWidth}
                min={0}
                max={100}
                onChange={(strokeWidth) =>
                  onUpdate({ text: { ...clip.text!, strokeWidth } })
                }
              />
              <label className="toggle-property">
                <span>Metin Arka Planı</span>
                <input
                  type="checkbox"
                  aria-label="Metin Arka Planı"
                  checked={clip.text.background !== "transparent"}
                  onChange={(e) =>
                    onUpdate({
                      text: {
                        ...clip.text!,
                        background: e.target.checked
                          ? "#15151c"
                          : "transparent",
                      },
                    })
                  }
                />
              </label>
              {clip.text.background !== "transparent" && (
                <input
                  type="color"
                  aria-label="Metin Arka Plan Rengi"
                  value={clip.text.background}
                  onChange={(e) =>
                    onUpdate({
                      text: { ...clip.text!, background: e.target.value },
                    })
                  }
                />
              )}
            </>
          )}
          {tab === "Hız" && (
            <>
              <h3>Oynatma Hızı</h3>
              <NumberField
                label="Hız"
                value={clip.speed}
                min={0.1}
                max={8}
                step={0.1}
                suffix="×"
                onChange={(speed) => onUpdate({ speed })}
              />
              <div className="speed-presets">
                {[0.25, 0.5, 1, 1.5, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    className={clip.speed === speed ? "active" : ""}
                    onClick={() => onUpdate({ speed })}
                  >
                    {speed}×
                  </button>
                ))}
              </div>
              <p className="field-hint">
                Hız değiştiğinde ses tonu korunur.
              </p>
              <h3>Zaman Aralığı</h3>
              <NumberField
                label="Başlangıç Zamanı"
                value={clip.start}
                min={0}
                step={1 / project.fps}
                suffix="s"
                onChange={(start) => onUpdate({ start })}
              />
              <NumberField
                label="Kaynak Başlangıç"
                value={clip.sourceIn}
                min={0}
                max={Math.max(
                  0,
                  (asset?.duration ?? 0) - clip.duration * clip.speed,
                )}
                step={1 / project.fps}
                suffix="s"
                onChange={(sourceIn) => onUpdate({ sourceIn })}
              />
              <p className="muted small">
                Zaman çizelgesinde klip kenarlarını sürükleyerek kırpabilirsiniz.
              </p>
            </>
          )}
          {tab === "Animasyon" && (
            <>
              <h3>Anahtar Kareler (Keyframes)</h3>
              <p className="field-hint">
                İmleci hedef zamana getirin ve özelliğin yanındaki ◇ simgesine
                tıklayarak anahtar kare ekleyin.
              </p>
              <div className="keyframe-add">
                {(["x", "y", "scale", "rotation", "opacity", "volume"] as const)
                  .filter((property) => visual || property === "volume")
                  .map((property) => (
                    <button
                      key={property}
                      onClick={() =>
                        key(
                          property,
                          property === "volume"
                            ? evaluated.volume
                            : evaluated.transform[property],
                        )
                      }
                    >
                      <Diamond size={11} />
                      {
                        {
                          x: "Konum X",
                          y: "Konum Y",
                          scale: "Ölçek",
                          rotation: "Döndürme",
                          opacity: "Opaklık",
                          volume: "Ses Düzeyi",
                        }[property]
                      }
                    </button>
                  ))}
              </div>
              {!clip.keyframes.length && (
                <div className="quiet-empty">Henüz anahtar kare yok</div>
              )}
              {[...clip.keyframes]
                .sort((a, b) => a.time - b.time)
                .map((k) => (
                  <div key={k.id} className="keyframe-row">
                    <button
                      className="keyframe-time"
                      onClick={() =>
                        useEditorStore.getState().seek(clip.start + k.time)
                      }
                    >
                      {formatTime(k.time, project.fps)}
                    </button>
                    <span>{k.property}</span>
                    <input
                      aria-label={`Anahtar kare ${k.property} değeri`}
                      type="number"
                      step={0.01}
                      value={k.value}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (
                          Number.isFinite(value) &&
                          !(
                            k.property === "opacity" &&
                            (value < 0 || value > 1)
                          ) &&
                          !(
                            k.property === "scale" &&
                            (value <= 0 || value > 10)
                          ) &&
                          !(k.property === "volume" && (value < 0 || value > 4))
                        )
                          onUpdate({
                            keyframes: clip.keyframes.map((key) =>
                              key.id === k.id ? { ...key, value } : key,
                            ),
                          });
                      }}
                    />
                    <select
                      aria-label="Geçiş Türü"
                      value={k.easing}
                      onChange={(e) =>
                        onUpdate({
                          keyframes: clip.keyframes.map((key) =>
                            key.id === k.id
                              ? {
                                  ...key,
                                  easing: e.target.value as Keyframe["easing"],
                                  easingWindow: undefined,
                                }
                              : key,
                          ),
                        })
                      }
                    >
                      <option value="linear">Doğrusal</option>
                      <option value="easeInOut">Yumuşak Geçiş (Ease In/Out)</option>
                    </select>
                    <button
                      aria-label="Anahtar Kareyi Sil"
                      onClick={() =>
                        onUpdate({
                          keyframes: clip.keyframes.filter(
                            (key) => key.id !== k.id,
                          ),
                        })
                      }
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
            </>
          )}
        </fieldset>
      </div>
    </aside>
  );
}
