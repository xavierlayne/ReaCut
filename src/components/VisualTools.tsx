import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Crop,
  Droplets,
  LockKeyhole,
  RotateCcw,
  Scan,
  Square,
} from "lucide-react";
import type {
  ChromaKey,
  Clip,
  CropRect,
  MediaAsset,
  ShapeMask,
} from "../core/types";
import { useEditorStore } from "../editor/store";
import { getCropPixels } from "../core/visual";
import "./VisualTools.css";

export interface VisualToolsProps {
  mode: "crop" | "chroma" | "mask";
  clip: Clip;
  asset?: MediaAsset;
  onUpdate: (patch: Partial<Clip>) => void;
  locked?: boolean;
}
export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };
export const DEFAULT_CHROMA: ChromaKey = {
  enabled: true,
  color: "#00ff00",
  similarity: 0.1,
  blend: 0.05,
};
export const DEFAULT_MASK: ShapeMask = {
  shape: "rectangle",
  width: 1,
  height: 1,
  feather: 0,
  invert: false,
};
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
/** Largest centered source crop matching a pixel aspect ratio. */
export function centeredCrop(
  sourceWidth: number,
  sourceHeight: number,
  ratio: number,
): CropRect {
  if (
    ![sourceWidth, sourceHeight, ratio].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  )
    return { ...FULL_CROP };
  const aspect = sourceWidth / sourceHeight;
  const width = aspect > ratio ? ratio / aspect : 1;
  const height = aspect < ratio ? aspect / ratio : 1;
  return { x: (1 - width) / 2, y: (1 - height) / 2, width, height };
}
export function updateCropField(
  crop: CropRect,
  field: keyof CropRect,
  value: number,
): CropRect {
  if (!Number.isFinite(value)) return crop;
  const next = { ...crop };
  if (field === "x") next.x = clamp(value, 0, 1 - next.width);
  if (field === "y") next.y = clamp(value, 0, 1 - next.height);
  if (field === "width") next.width = clamp(value, 0.01, 1 - next.x);
  if (field === "height") next.height = clamp(value, 0.01, 1 - next.y);
  return next;
}
function useTransaction() {
  const open = useRef(false);
  const begin = () => {
    if (!open.current) {
      useEditorStore.getState().beginTransaction();
      open.current = true;
    }
  };
  const end = () => {
    if (open.current) {
      useEditorStore.getState().endTransaction();
      open.current = false;
    }
  };
  useEffect(
    () => () => {
      if (open.current) useEditorStore.getState().endTransaction();
    },
    [],
  );
  return { begin, end };
}
function NumberControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 0.1,
  suffix = "%",
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const transaction = useTransaction();
  const [draft, setDraft] = useState(String(Number(value.toFixed(3))));
  const focused = useRef(false);
  const draftRef = useRef(draft);
  useEffect(() => {
    if (!focused.current) {
      const next = String(Number(value.toFixed(3)));
      draftRef.current = next;
      setDraft(next);
    }
  }, [value]);
  return (
    <label className="visual-number">
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onFocus={() => {
            focused.current = true;
            const next = String(Number(value.toFixed(3)));
            draftRef.current = next;
            setDraft(next);
            transaction.begin();
          }}
          onChange={(event) => {
            const raw = event.target.value;
            draftRef.current = raw;
            setDraft(raw);
            if (raw.trim() !== "" && Number.isFinite(Number(raw)))
              onChange(clamp(Number(raw), min, max));
          }}
          onBlur={() => {
            focused.current = false;
            const parsed =
              draftRef.current.trim() === "" ? value : Number(draftRef.current);
            const next = Number.isFinite(parsed)
              ? clamp(parsed, min, max)
              : value;
            draftRef.current = String(Number(next.toFixed(3)));
            setDraft(draftRef.current);
            onChange(next);
            transaction.end();
          }}
        />
        {suffix && <span>{suffix}</span>}
      </div>
    </label>
  );
}
function RangeControl({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  percent = true,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  percent?: boolean;
}) {
  const transaction = useTransaction();
  return (
    <label className="visual-range">
      <div>
        <span>{label}</span>
        <output>
          {percent ? `${Math.round(value * 100)}%` : value.toFixed(2)}
        </output>
      </div>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onFocus={transaction.begin}
        onBlur={transaction.end}
        onPointerDown={transaction.begin}
        onPointerUp={transaction.end}
        onPointerCancel={transaction.end}
        onKeyDown={transaction.begin}
        onKeyUp={transaction.end}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
function ColorControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const transaction = useTransaction();
  return (
    <label className="visual-color">
      <span>Hedef Renk</span>
      <input
        aria-label="Hedef Renk"
        type="color"
        value={value}
        onFocus={transaction.begin}
        onBlur={transaction.end}
        onChange={(event) => onChange(event.target.value)}
      />
      <code>{value.toUpperCase()}</code>
    </label>
  );
}
export default function VisualTools({
  mode,
  clip,
  asset,
  onUpdate,
  locked = false,
}: VisualToolsProps) {
  const [preset, setPreset] = useState("custom");
  useEffect(() => setPreset("custom"), [clip.id, mode]);
  const crop = clip.crop ?? FULL_CROP,
    chroma = clip.chromaKey ?? DEFAULT_CHROMA,
    mask = clip.mask ?? DEFAULT_MASK;
  const cropEnabled = !!clip.crop,
    chromaEnabled = !!clip.chromaKey?.enabled,
    maskEnabled = !!clip.mask;
  const updateChroma = (patch: Partial<ChromaKey>) =>
    onUpdate({ chromaKey: { ...chroma, ...patch } });
  const updateMask = (patch: Partial<ShapeMask>) =>
    onUpdate({ mask: { ...mask, ...patch } });
  const cropPixels = asset ? getCropPixels(asset, crop) : undefined;
  const cropHint =
    asset && asset.width > 0 && asset.height > 0
      ? `${cropPixels!.width} × ${cropPixels!.height} px`
      : "Kaynak Medya Alanı";
  const sourceAspect =
    asset && asset.width > 0 && asset.height > 0
      ? asset.width / asset.height
      : 16 / 9;
  const diagramWidth = Math.min(240, 110 * sourceAspect);
  const title =
    mode === "crop"
      ? "Görüntü Kırpma"
      : mode === "chroma"
        ? "Chroma Key"
        : "Şekil Maskesi";
  return (
    <section className="visual-tools" aria-label={title}>
      <div className="visual-tools-heading">
        {mode === "crop" ? (
          <Crop size={14} />
        ) : mode === "chroma" ? (
          <Droplets size={14} />
        ) : (
          <Scan size={14} />
        )}
        <h3>{title}</h3>
        {locked && <LockKeyhole size={12} />}
      </div>
      {locked && <p className="visual-locked">Kanal kilitli, düzenlemek için kilidi açın.</p>}
      <fieldset disabled={locked}>
        {mode === "crop" && (
          <>
            <label className="visual-toggle">
              <span>Kırpmayı Etkinleştir</span>
              <input
                aria-label="Kırpmayı Etkinleştir"
                type="checkbox"
                checked={cropEnabled}
                onChange={(event) =>
                  onUpdate({
                    crop: event.target.checked ? { ...FULL_CROP } : undefined,
                  })
                }
              />
            </label>
            <p className="visual-description">
              Seçilen alanı korur ve tuval oranına sığdırır.
            </p>
            <fieldset disabled={!cropEnabled} className="visual-controls">
              <label className="visual-ratio">
                <span>Oran</span>
                <select
                  aria-label="Kırpma Oranı"
                  value={preset}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreset(value);
                    if (value !== "custom") {
                      const [w, h] = value.split(":").map(Number);
                      onUpdate({
                        crop: centeredCrop(
                          asset?.width ?? 1,
                          asset?.height ?? 1,
                          w / h,
                        ),
                      });
                    }
                  }}
                >
                  <option value="custom">Özel Boyut</option>
                  <option value="1:1">1:1 · Kare</option>
                  <option value="16:9">16:9 · Yatay</option>
                  <option value="4:3">4:3 · Klasik</option>
                  <option value="9:16">9:16 · Dikey</option>
                </select>
              </label>
              <div
                className="visual-crop-diagram"
                aria-hidden="true"
                style={{
                  width: diagramWidth,
                  height: diagramWidth / sourceAspect,
                  aspectRatio: sourceAspect,
                }}
              >
                <div
                  style={{
                    left: `${crop.x * 100}%`,
                    top: `${crop.y * 100}%`,
                    width: `${crop.width * 100}%`,
                    height: `${crop.height * 100}%`,
                  }}
                >
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="visual-numbers-grid">
                {(["width", "height", "x", "y"] as const).map((field) => (
                  <NumberControl
                    key={field}
                    label={
                      {
                        width: "Kırpma Genişliği",
                        height: "Kırpma Yüksekliği",
                        x: "Sol Konum",
                        y: "Üst Konum",
                      }[field]
                    }
                    value={crop[field] * 100}
                    min={field === "width" || field === "height" ? 1 : 0}
                    max={
                      (field === "x"
                        ? 1 - crop.width
                        : field === "y"
                          ? 1 - crop.height
                          : field === "width"
                            ? 1 - crop.x
                            : 1 - crop.y) * 100
                    }
                    onChange={(value) => {
                      setPreset("custom");
                      onUpdate({
                        crop: updateCropField(crop, field, value / 100),
                      });
                    }}
                  />
                ))}
              </div>
              <div className="visual-summary">
                <Crop size={11} />
                <span>{cropHint}</span>
                <span>
                  {(
                    (crop.width * (asset?.width ?? 1)) /
                    (crop.height * (asset?.height ?? 1))
                  ).toFixed(2)}
                  :1
                </span>
              </div>
            </fieldset>
            <button
              className="visual-reset"
              disabled={!cropEnabled}
              onClick={() => {
                setPreset("custom");
                onUpdate({ crop: undefined });
              }}
            >
              <RotateCcw size={12} />
              Tam Görüntüye Sıfırla
            </button>
          </>
        )}
        {mode === "chroma" && (
          <>
            <label className="visual-toggle">
              <span>Chroma Key Etkinleştir</span>
              <input
                aria-label="Chroma Key Etkinleştir"
                type="checkbox"
                checked={chromaEnabled}
                onChange={(event) =>
                  onUpdate({
                    chromaKey: event.target.checked
                      ? { ...chroma, enabled: true }
                      : undefined,
                  })
                }
              />
            </label>
            <p className="visual-description">
              Seçilen rengi şeffaf hale getirerek alttaki katmanı gösterir.
            </p>
            <fieldset disabled={!chromaEnabled} className="visual-controls">
              <div className="visual-color-presets">
                <button
                  className={
                    chroma.color.toLowerCase() === "#00ff00" ? "active" : ""
                  }
                  onClick={() => updateChroma({ color: "#00ff00" })}
                >
                  <i style={{ background: "#00ff00" }} />
                  Yeşil Perde
                </button>
                <button
                  className={
                    chroma.color.toLowerCase() === "#0000ff" ? "active" : ""
                  }
                  onClick={() => updateChroma({ color: "#0000ff" })}
                >
                  <i style={{ background: "#0000ff" }} />
                  Mavi Perde
                </button>
              </div>
              <ColorControl
                value={chroma.color}
                onChange={(color) => updateChroma({ color })}
              />
              <RangeControl
                label="Renk Toleransı"
                value={chroma.similarity}
                min={0.01}
                max={1}
                onChange={(similarity) => updateChroma({ similarity })}
              />
              <RangeControl
                label="Kenar Yumuşatma"
                value={chroma.blend}
                min={0}
                max={1}
                onChange={(blend) => updateChroma({ blend })}
              />
              <p className="visual-tip">
                Arka plan kaybolana kadar toleransı artırın; kenar yumuşatma sınırları yumuşatır.
              </p>
            </fieldset>
            <button
              className="visual-reset"
              disabled={!clip.chromaKey}
              onClick={() => onUpdate({ chromaKey: undefined })}
            >
              <RotateCcw size={12} />
              Chroma Key Sıfırla
            </button>
          </>
        )}
        {mode === "mask" && (
          <>
            <label className="visual-toggle">
              <span>Maskeyi Etkinleştir</span>
              <input
                aria-label="Maskeyi Etkinleştir"
                type="checkbox"
                checked={maskEnabled}
                onChange={(event) =>
                  onUpdate({
                    mask: event.target.checked
                      ? { ...DEFAULT_MASK }
                      : undefined,
                  })
                }
              />
            </label>
            <p className="visual-description">
              Belirtilen şekil içindeki alanı gösterir veya gizler.
            </p>
            <fieldset disabled={!maskEnabled} className="visual-controls">
              <div className="visual-shapes">
                <button
                  className={mask.shape === "rectangle" ? "active" : ""}
                  aria-pressed={mask.shape === "rectangle"}
                  onClick={() => updateMask({ shape: "rectangle" })}
                >
                  <Square size={18} />
                  <span>Dikdörtgen</span>
                </button>
                <button
                  className={mask.shape === "ellipse" ? "active" : ""}
                  aria-pressed={mask.shape === "ellipse"}
                  onClick={() => updateMask({ shape: "ellipse" })}
                >
                  <Circle size={18} />
                  <span>Elips</span>
                </button>
              </div>
              <div className="visual-numbers-grid">
                <NumberControl
                  label="Maske Genişliği"
                  value={mask.width * 100}
                  min={1}
                  onChange={(width) => updateMask({ width: width / 100 })}
                />
                <NumberControl
                  label="Maske Yüksekliği"
                  value={mask.height * 100}
                  min={1}
                  onChange={(height) => updateMask({ height: height / 100 })}
                />
              </div>
              <RangeControl
                label="Kenar Geçişi (Feather)"
                value={mask.feather}
                min={0}
                max={0.5}
                step={0.005}
                onChange={(feather) => updateMask({ feather })}
              />
              <label className="visual-toggle visual-invert">
                <span>Maskeyi Tersine Çevir</span>
                <input
                  aria-label="Maskeyi Tersine Çevir"
                  type="checkbox"
                  checked={mask.invert}
                  onChange={(event) =>
                    updateMask({ invert: event.target.checked })
                  }
                />
              </label>
              <div
                className={`visual-mask-diagram ${mask.invert ? "is-inverted" : ""}`}
                aria-hidden="true"
              >
                <div
                  style={{
                    width: `${mask.width * 100}%`,
                    height: `${mask.height * 100}%`,
                    borderRadius: mask.shape === "ellipse" ? "50%" : "0",
                    filter: `blur(${mask.feather * 12}px)`,
                  }}
                />
              </div>
              <p className="visual-tip">
                Maske boyutu kaynak görüntüye göredir. Yumuşatma değeri kenar geçişini belirler.
              </p>
            </fieldset>
            <button
              className="visual-reset"
              disabled={!maskEnabled}
              onClick={() => onUpdate({ mask: undefined })}
            >
              <RotateCcw size={12} />
              Maskeyi Temizle
            </button>
          </>
        )}
      </fieldset>
    </section>
  );
}
