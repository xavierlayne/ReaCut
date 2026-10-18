import { useState } from "react";
import { Plus, Search, Type } from "lucide-react";
import {
  MOTION_PRESETS,
  TEXT_PRESETS,
  TRANSITION_PRESETS,
  type MotionId,
  type TextPreset,
  type TransitionId,
} from "../core/creativePresets";
import PresetPreview from "./PresetPreview";
import "./CreativeLibrary.css";
function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <label className="creative-search">
      <Search size={14} />
      <input
        aria-label="Şablon Ara"
        placeholder="İsim veya türe göre ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Footer() {
  return (
    <footer className="creative-footer">Açık Kaynak · MIT Lisanslı · Çevrimdışı</footer>
  );
}
export function TextLibrary({
  onAdd,
  onBlank,
}: {
  onAdd: (preset: TextPreset) => void;
  onBlank: () => void;
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Tümü");
  const presets = TEXT_PRESETS.filter(
    (p) =>
      (category === "Tümü" || category === p.category) &&
      (p.name + p.style.text)
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <section className="creative-library" aria-label="Metin Şablonları Kitaplığı">
      <header>
        <strong>
          Metin Şablonları <small>{TEXT_PRESETS.length}</small>
        </strong>
        <button onClick={onBlank}>
          <Type size={12} /> Metin Ekle
        </button>
      </header>
      <SearchBox value={query} onChange={setQuery} />
      <div className="creative-tabs" role="tablist" aria-label="Metin Şablonu Kategorileri">
        {["Tümü", "CapCut Trend", "WordArt", "Başlık", "Altyazı", "Etiket", "Animasyonlu"].map((c) => (
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
      <div className="creative-scroll">
        <p className="creative-help">
          Oynatma konumuna eklenir; metin, yazı tipi, renk ve animasyon düzenlenebilir.
        </p>
        <div className="creative-grid">
          {presets.map((p) => (
            <article className="creative-card" key={p.id} data-preset-id={p.id}>
              {p.badge && <span className="creative-badge">{p.badge}</span>}
              <PresetPreview text={p} label={p.name} />
              <div>
                <span>
                  {p.name}
                  <small>{p.category} · Düzenlenebilir</small>
                </span>
                <button
                  aria-label={`${p.name} şablonunu ekle`}
                  onClick={() => onAdd(p)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!presets.length && (
          <p className="creative-empty">Eşleşen metin şablonu bulunamadı</p>
        )}
      </div>
      <Footer />
    </section>
  );
}
export function MotionLibrary({
  disabled,
  onApply,
}: {
  disabled: boolean;
  onApply: (motion: MotionId) => void;
}) {
  const [query, setQuery] = useState("");
  const presets = MOTION_PRESETS.filter((p) =>
    (p.name + p.description).includes(query.trim()),
  );
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <p className="creative-help">
        Seçili video veya metne uygulanır. Geri alınabilir.
      </p>
      <div className="creative-grid">
        {presets.map((p) => (
          <article className="creative-card" key={p.id} data-preset-id={p.id}>
            <PresetPreview motion={p.id} label={p.name} />
            <div>
              <span title={p.description}>
                {p.name}
                <small>Animasyon</small>
              </span>
              <button
                disabled={disabled}
                aria-label={`${p.name} efektini uygula`}
                onClick={() => onApply(p.id)}
              >
                <Plus size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!presets.length && <p className="creative-empty">Eşleşen animasyon bulunamadı</p>}
    </>
  );
}
export function TransitionLibrary({
  disabled,
  onApply,
}: {
  disabled: boolean;
  onApply: (transition: TransitionId, seconds: number) => void;
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Tümü"),
    [seconds, setSeconds] = useState(0.5);
  const presets = TRANSITION_PRESETS.filter(
    (p) =>
      (category === "Tümü" || category === p.category) &&
      (p.name + p.description).includes(query.trim()),
  );
  return (
    <section className="creative-library" aria-label="Geçiş Kitaplığı">
      <header>
        <strong>
          Video Geçişleri <small>{TRANSITION_PRESETS.length}</small>
        </strong>
        <span>Yerleşik</span>
      </header>
      <SearchBox value={query} onChange={setQuery} />
      <div className="creative-tabs" role="tablist" aria-label="Geçiş Kategorileri">
        {[
          "Tümü",
          "Trend",
          "Kamera & Hareket",
          "Işık & Parıltı",
          "Bulanıklık",
          "Arıza & Glitch",
          "Temel & Silme",
        ].map((c) => (
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
      <label className="creative-duration">
        Geçiş Süresi
        <input
          type="number"
          aria-label="Geçiş Süresi"
          min={0.05}
          max={5}
          step={0.05}
          value={seconds}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (Number.isFinite(value))
              setSeconds(Math.max(0.05, Math.min(5, value)));
          }}
        />
        sn
      </label>
      <div className="creative-scroll">
        <p className="creative-help">
          Bitişik iki klibin arasına uygulanır. Süre klip uzunluğuna göre sınırlandırılır.
        </p>
        <div className="creative-grid">
          {presets.map((p) => {
            const coverUrl =
              "cover" in p && p.cover
                ? p.cover.startsWith("http")
                  ? p.cover
                  : `${import.meta.env.BASE_URL}${p.cover}`
                : null;
            return (
              <article className="creative-card" key={p.id} data-preset-id={p.id}>
                {"badge" in p && p.badge && (
                  <span className="creative-badge">{p.badge as string}</span>
                )}
                {coverUrl ? (
                  <div className="creative-cover-wrap">
                    <img
                      src={coverUrl}
                      alt={p.name}
                      className="creative-cover-img"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <PresetPreview transition={p.id} label={p.name} />
                )}
                <div>
                  <span title={p.description}>
                    {p.name}
                    <small>
                      {p.category} · {p.description}
                    </small>
                  </span>
                  <button
                    disabled={disabled}
                    className="transition-apply"
                    aria-label={`${p.name} geçişini uygula`}
                    onClick={() => onApply(p.id, seconds)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {!presets.length && <p className="creative-empty">Eşleşen geçiş bulunamadı</p>}
      </div>
      <Footer />
    </section>
  );
}
