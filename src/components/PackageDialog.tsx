import { useEffect, useRef, useState } from "react";
import type { ExportProgress, Project } from "../core/types";
import { FolderOpen, Package, X } from "lucide-react";
export default function PackageDialog({ project, onClose }: { project: Project; onClose(): void }) {
  const [progress, setProgress] = useState<ExportProgress | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const job = useRef<string | null>(null);
  const alive = useRef(true), requested = useRef(false);
  useEffect(() => {
    alive.current = true;
    const unsubscribe = window.editorAPI?.onPackageProgress(event => {
    if (!requested.current) return;
    if (job.current && job.current !== event.jobId) return;
    setProgress(event);
    if (["complete", "error", "cancelled"].includes(event.status)) { requested.current = false; setBusy(false); if (event.status === "error") setError(event.message ?? "Paketleme Başarısız"); }
    });
    return () => { alive.current = false; unsubscribe?.(); if (requested.current && job.current) void window.editorAPI?.cancelPackage(job.current); };
  }, []);
  const start = async () => {
    if (!window.editorAPI) { setError("Medya paketleme için masaüstü sürüm gereklidir."); return; }
    if (requested.current) return;
    requested.current = true;
    setBusy(true); setError(""); setProgress(null); job.current = null;
    try {
      const result = await window.editorAPI.packageProject(project);
      if (!alive.current) { if (result) void window.editorAPI.cancelPackage(result.jobId); return; }
      if (result) { job.current = result.jobId; setProgress(current => current ?? { jobId: result.jobId, status: "preparing", progress: 0, message: "Medyalar Kontrol Ediliyor" }); }
      else { requested.current = false; setBusy(false); }
    }
    catch (e) { requested.current = false; if (alive.current) { setBusy(false); setError(String(e)); } }
  };
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label="Proje Medyalarını Paketle"><header><h2><Package size={18} /> Proje Medyalarını Paketle</h2><button aria-label="Paketlemeyi Kapat" disabled={busy} onClick={onClose}><X size={18} /></button></header><div className="modal-body"><h3>{project.name}</h3><p>Projeyi ve {project.assets.length} adet kaynak medyayı tek klasörde toplar; başka yere taşısanız da açıp düzenleyebilirsiniz.</p><p className="muted small">Tüm medyaları içerir, kopyalar tekilleştirilir. Orijinal dosyalarınız yerinde kalır.</p>{progress && <div className="export-progress"><p>{progress.status === "complete" ? "Paketleme Tamamlandı" : progress.status === "cancelled" ? "Paketleme İptal Edildi" : progress.message}</p><progress max={1} value={progress.progress} /><p>{Math.round(progress.progress * 100)}%</p></div>}{error && <p role="alert" className="inline-warning">{error}</p>}</div><footer>{busy ? <button disabled={!job.current} onClick={() => { if (job.current) void window.editorAPI?.cancelPackage(job.current); }}>Paketlemeyi İptal Et</button> : progress?.status === "complete" ? <><button onClick={() => void window.editorAPI?.revealPath(progress.path!)}><FolderOpen size={15}/>Paketi Klasörde Göster</button><button className="primary" onClick={onClose}>Tamam</button></> : <><button onClick={onClose}>İptal</button><button className="primary" onClick={() => void start()}>Klasör Seç ve Paketle</button></>}</footer></section></div>;
}
