import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FolderOpen, LockKeyhole, Search, Subtitles } from "lucide-react";
import { useEditorStore } from "../editor/store";
import { clone } from "../core/model";
import { applySubtitleEdit, prepareSubtitleEdit, type SubtitleEdit, type SubtitleEditPlan } from "../core/subtitleEdits";
import type { Clip, Project } from "../core/types";
import "./SubtitlePanel.css";

interface Props { onImport: () => void | Promise<void>; onExport: () => void | Promise<void> }
interface CueDraft { project: Project; id: string; text: string; start: string; end: string }
const seconds = (value: number) => Number(value.toFixed(6)).toString();
const timeLabel = (value: number) => `${Math.floor(value / 60).toString().padStart(2, "0")}:${(value % 60).toFixed(2).padStart(5, "0")}`;

export default function SubtitlePanel({ onImport, onExport }: Props) {
  const project = useEditorStore(s => s.project);
  const [trackId, setTrackId] = useState("");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [draft, setDraft] = useState<CueDraft | null>(null);
  const [mode, setMode] = useState<"offset" | "replace" | "style">("offset");
  const [offset, setOffset] = useState("0");
  const [find, setFind] = useState("");
  const [replacement, setReplacement] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [plan, setPlan] = useState<SubtitleEditPlan | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const feedback = useRef<HTMLParagraphElement>(null);
  const knownTracks = useRef(new Set(project.tracks.map(t => t.id)));
  const tracks = project.tracks.filter(t => t.kind === "text");
  const activeTrack = tracks.find(t => t.id === trackId);
  const clips = useMemo(() => project.clips.filter(c => c.trackId === trackId && c.text).sort((a, b) => a.start - b.start || a.id.localeCompare(b.id)), [project, trackId]);
  const visible = clips.filter(c => c.text!.text.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const selected = checked.filter(id => clips.some(c => c.id === id));
  const locked = !!activeTrack?.locked;
  const stale = !!plan && plan.base !== JSON.stringify(project);

  useEffect(() => {
    const textTracks = project.tracks.filter(t => t.kind === "text");
    const preferred = textTracks.find(t => (t.name.includes("Altyazı") || t.name.toLowerCase().includes("sub"))) ?? textTracks[0];
    setTrackId(preferred?.id ?? ""); setQuery(""); setChecked([]); setDraft(null); setPlan(null); setError(""); setNotice("");
  }, [project.id]);
  useEffect(() => {
    if (!project.tracks.some(t => t.id === trackId && t.kind === "text")) {
      const preferred = project.tracks.find(t => t.kind === "text" && (t.name.includes("Altyazı") || t.name.toLowerCase().includes("sub"))) ?? project.tracks.find(t => t.kind === "text");
      setTrackId(preferred?.id ?? "");
    }
    // Newly imported cues become selected in the editor; follow their new track.
    const first = project.clips.find(c => c.id === useEditorStore.getState().selectedIds[0] && c.text);
    if (first && first.trackId !== trackId && (!knownTracks.current.has(first.trackId) || !project.clips.some(c => c.trackId === trackId))) setTrackId(first.trackId);
    knownTracks.current = new Set(project.tracks.map(t => t.id));
  }, [project, trackId]);
  useEffect(() => { setChecked([]); setDraft(null); setPlan(null); setError(""); setNotice(""); setReferenceId(""); }, [trackId]);
  useEffect(() => { if (error) feedback.current?.scrollIntoView({ block: "nearest" }); }, [error]);

  function attempt(action: () => void) {
    setError(""); setNotice("");
    try { action(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }
  async function fileAction(action: Props["onImport"]) {
    setError("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }
  function editCue(clip: Clip) {
    useEditorStore.getState().select([clip.id]);
    useEditorStore.getState().seek(clip.start);
    setDraft({ project: clone(project), id: clip.id, text: clip.text!.text, start: seconds(clip.start), end: seconds(clip.start + clip.duration) });
    setReferenceId(clip.id); setPlan(null); setError(""); setNotice("");
  }
  function saveCue() {
    attempt(() => {
      if (!draft) return;
      if (!draft.start.trim() || !draft.end.trim()) throw new Error("Lütfen başlangıç ve bitiş zamanını girin");
      const next = prepareSubtitleEdit(draft.project, [draft.id], { type: "cue", text: draft.text, start: Number(draft.start), end: Number(draft.end) });
      const store = useEditorStore.getState();
      store.commit(applySubtitleEdit(store.project, next));
      setDraft(null); setNotice(next.changedIds.length ? "Altyazı kaydedildi" : "Altyazı değişmedi");
    });
  }
  function prepare() {
    attempt(() => {
      let edit: SubtitleEdit;
      if (mode === "offset") {
        if (!offset.trim()) throw new Error("Lütfen zaman kaydırma miktarını girin");
        edit = { type: "offset", seconds: Number(offset) };
      } else if (mode === "replace") edit = { type: "replace", find, replacement };
      else edit = { type: "style", referenceId };
      const next = prepareSubtitleEdit(useEditorStore.getState().project, selected, edit);
      if (!next.changedIds.length) { setPlan(null); setNotice("Değiştirilecek altyazı yok"); return; }
      setPlan(next);
    });
  }
  function apply() {
    attempt(() => {
      if (!plan) return;
      const store = useEditorStore.getState();
      store.commit(applySubtitleEdit(store.project, plan));
      setNotice(`${plan.changedIds.length} altyazı güncellendi`); setPlan(null); setDraft(null);
    });
  }
  function setSelection(ids: string[]) { setChecked(ids); setPlan(null); }
  const draftStale = draft && JSON.stringify(draft.project) !== JSON.stringify(project);

  return <section className="subtitle-panel" aria-label="Altyazı Düzenleyici">
    <div className="subtitle-heading"><h3>Altyazı Düzenleme</h3><span>{clips.length} Satır</span></div>
    <div className="subtitle-file-actions">
      <button className="small-button" onClick={() => void fileAction(onImport)}><FolderOpen size={14} />Altyazı Dosyası İçe Aktar</button>
      <button className="small-button" onClick={() => void fileAction(onExport)} disabled={!project.clips.some(c => c.text)} title="Tüm altyazıları SRT olarak dışa aktar"><Download size={14} />Tümünü SRT Olarak Aktar</button>
    </div>
    <label className="subtitle-track-label">Metin Kanalı
      <select aria-label="Altyazı Kanalı" value={trackId} onChange={e => setTrackId(e.target.value)}>
        {!tracks.length && <option value="">Metin kanalı yok</option>}
        {tracks.map(t => <option key={t.id} value={t.id}>{t.name}{t.locked ? " · Kilitli" : ""}</option>)}
      </select>
    </label>
    <label className="subtitle-search"><Search size={14} /><input aria-label="Altyazı Ara" placeholder="Bu kanaldaki altyazıları ara..." value={query} onChange={e => setQuery(e.target.value)} /></label>
    <div className="subtitle-selection">
      <label><input type="checkbox" aria-label="Arama Sonuçlarını Seç" disabled={locked || !visible.length} checked={visible.length > 0 && visible.every(c => selected.includes(c.id))} onChange={e => setSelection(e.target.checked ? [...new Set([...selected, ...visible.map(c => c.id)])] : selected.filter(id => !visible.some(c => c.id === id)))} />Arama Sonuçlarını Seç</label>
      <button className="subtitle-clear" disabled={!selected.length} onClick={() => setSelection([])}>Temizle ({selected.length})</button>
    </div>
    {locked && <p className="subtitle-hint"><LockKeyhole size={13} />Bu kanal kilitli, altyazıları görüntüleyebilirsiniz.</p>}
    <div className="subtitle-cues">
      {!visible.length && <div className="subtitle-empty"><Subtitles size={27} /><p>{clips.length ? "Eşleşen altyazı bulunamadı" : "SRT / WebVTT dosyası aktarın veya bir altyazı kanalı seçin"}</p></div>}
      {visible.map((clip) => <div key={clip.id} className={`subtitle-cue ${draft?.id === clip.id ? "active" : ""}`} data-cue-id={clip.id}>
        <div className="subtitle-cue-line">
          <input type="checkbox" aria-label={`Altyazı Seç: ${clip.text!.text.slice(0, 40)}`} checked={selected.includes(clip.id)} disabled={locked} onChange={e => setSelection(e.target.checked ? [...selected, clip.id] : selected.filter(id => id !== clip.id))} />
          <button className="subtitle-cue-content" onClick={() => editCue(clip)} title="Bu altyazıya git ve düzenle"><span className="subtitle-time">{timeLabel(clip.start)} — {timeLabel(clip.start + clip.duration)}</span><span>{clip.text!.text || "(Boş Altyazı)"}</span></button>
        </div>
        {draft?.id === clip.id && <div className="subtitle-cue-form">
          <textarea aria-label="Altyazı Metni" value={draft.text} maxLength={20000} disabled={locked} onChange={e => setDraft({ ...draft, text: e.target.value })} />
          <div className="subtitle-times">
            <label>Başlangıç (sn)<input aria-label="Başlangıç Zamanı" type="number" min="0" max="86400" step={1 / project.fps} value={draft.start} disabled={locked} onChange={e => setDraft({ ...draft, start: e.target.value })} /></label>
            <label>Bitiş (sn)<input aria-label="Bitiş Zamanı" type="number" min="0" max="86400" step={1 / project.fps} value={draft.end} disabled={locked} onChange={e => setDraft({ ...draft, end: e.target.value })} /></label>
          </div>
          {draftStale && <p className="subtitle-warning">Proje değişti, düzenlemek için altyazıya tekrar tıklayın.</p>}
          <div className="subtitle-draft-actions"><button className="small-button" onClick={() => setDraft(null)}>İptal</button><button className="primary small-button" disabled={locked || !!draftStale} onClick={saveCue}>Bu Satırı Kaydet</button></div>
        </div>}
      </div>)}
    </div>
    <div className="subtitle-batch">
      <div className="subtitle-heading"><h4>Toplu Düzenleme</h4><span>{selected.length} seçili</span></div>
      <div className="subtitle-batch-tabs" role="tablist" aria-label="Toplu Altyazı İşlemleri">
        {([['offset', 'Zaman Kaydırma'], ['replace', 'Bul ve Değiştir'], ['style', 'Stili Eşitle']] as const).map(([key, label]) => <button key={key} role="tab" aria-selected={mode === key} className={mode === key ? "active" : ""} onClick={() => { setMode(key); setPlan(null); }}>{label}</button>)}
      </div>
      {mode === "offset" && <label className="subtitle-batch-field">Kaydırma Saniyesi (negatif değerler erkene alır)<input aria-label="Altyazı Kaydırma Saniyesi" type="number" step={1 / project.fps} value={offset} onChange={e => { setOffset(e.target.value); setPlan(null); }} /></label>}
      {mode === "replace" && <div className="subtitle-replace"><input aria-label="Aranacak Metin" placeholder="Aranacak metin" value={find} onChange={e => { setFind(e.target.value); setPlan(null); }} /><input aria-label="Değiştirilecek Metin" placeholder="Yeni metin (boş bırakılabilir)" value={replacement} onChange={e => { setReplacement(e.target.value); setPlan(null); }} /></div>}
      {mode === "style" && <><label className="subtitle-batch-field">Stil Referans Altyazısı<select aria-label="Stil Referansı" value={referenceId} onChange={e => { setReferenceId(e.target.value); setPlan(null); }}><option value="">Referans altyazı seçin</option>{clips.map(c => <option key={c.id} value={c.id}>{timeLabel(c.start)} · {c.text!.text.slice(0, 30) || "Boş Altyazı"}</option>)}</select></label><p className="subtitle-hint">Yazı tipi, boyut, renk, kenarlık ve hizalamayı kopyalar; metinleri korur.</p></>}
      {plan ? <div className="subtitle-plan"><p>{stale ? "Proje değişti, lütfen değişiklikleri tekrar kontrol edin." : `${plan.changedIds.length} altyazı güncellenecek.`}</p><div><button className="small-button" onClick={prepare}>Yeniden Kontrol Et</button><button className="primary small-button" disabled={stale || locked} onClick={apply}>{plan.changedIds.length} Değişikliği Uygula</button></div></div> : <button className="small-button subtitle-check" disabled={!selected.length || locked} onClick={prepare}>Değişiklikleri İncele</button>}
    </div>
    {error && <p ref={feedback} className="subtitle-error" role="alert">{error}</p>}
    {notice && <p className="subtitle-notice" role="status">{notice}</p>}
  </section>;
}
