import { version as appVersion } from "../package.json";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Check,
  CheckCircle2,
  ChevronDown,
  CloudOff,
  Download,
  FilePlus2,
  FolderOpen,
  Info,
  Keyboard,
  LoaderCircle,
  Monitor,
  Music2,
  MessageSquare,
  Shapes,
  Play,
  Save,
  Settings2,
  Sparkles,
  Subtitles,
  Type,
  Upload,
  Video,
  WandSparkles,
  X,
  Globe,
} from "lucide-react";
import { useLanguageStore, type SupportedLanguage } from "./core/i18n";
import { useEditorStore } from "./editor/store";
import {
  clone,
  createProject,
  createTrack,
  formatTime,
  id,
  projectDuration,
} from "./core/model";
import type {
  CapcutImportSelection,
  Clip,
  ExportOptions,
  ExportProgress,
  MediaAsset,
  Project,
  RecentProject,
} from "./core/types";
import { parseSubtitles, stringifySubtitles } from "./core/subtitles";
import { importCapcutDraft } from "./core/capcutImport";
import SubtitlePanel from "./components/SubtitlePanel";
import PackageDialog from "./components/PackageDialog";
import { resolveExportRange, selectedClipRange } from "./core/exportRange";
import AssistantPanel from "./components/AssistantPanel";
import AssetLibrary from "./components/AssetLibrary";
import type { BuiltinAsset } from "./core/builtinAssets";
import MediaLibrary from "./components/MediaLibrary";
import SourcePreview from "./components/SourcePreview";
import EditorWorkspace from "./components/EditorWorkspace";
import Timeline from "./components/Timeline";
import EffectsPanel from "./components/EffectsPanel";
import { TextLibrary, TransitionLibrary } from "./components/CreativeLibrary";
import { addTextPreset, applyTransition, type TextPreset, type TransitionId } from "./core/creativePresets";
import Player from "./components/Player";
import Inspector from "./components/Inspector";
import "./styles.css";
type Modal = "package" | "export" | "settings" | "shortcuts" | "about" | "capcut" | null;
type PendingCapcutImport = {
  selection: CapcutImportSelection;
  capturedProject: Project;
};
const shortcuts = [
  ["Oynat / Duraklat", "Space"],
  ["Klibi Böl", "Ctrl + B"],
  ["Klibi Sil", "Delete / Backspace"],
  ["Geri Al / Yinele", "Ctrl + Z / Ctrl + Shift + Z"],
  ["Kopyala / Yapıştır", "Ctrl + C / Ctrl + V"],
  ["Klibi Çoğalt", "Ctrl + D"],
  ["Tümünü Seç", "Ctrl + A"],
  ["Önceki / Sonraki Kare", "← / →"],
  ["Yeni / Aç / Kaydet", "Ctrl + N / O / S"],
  ["İçe Aktar / Dışa Aktar", "Ctrl + I / E"],
  ["Yakınlaştır / Uzaklaştır", "+ / −"],
  ["Başa / Sona Git", "Home / End"],
];
function ModalShell({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal ${wide ? "modal-wide" : ""}`}
      >
        <header>
          <h2>{title}</h2>
          <button aria-label="Kapat" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function ExportDialog({
  project,
  selectedIds,
  onClose,
  notify,
}: {
  project: Project;
  selectedIds: string[];
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const [options, setOptions] = useState<ExportOptions>({
      path: "",
      width: project.width + (project.width % 2),
      height: project.height + (project.height % 2),
      fps: project.fps,
      quality: "standard",
      format: "mp4",
    }),
    [progress, setProgress] = useState<ExportProgress | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [scope, setScope] = useState("all");
  const [rangeStart, setRangeStart] = useState("0"), [rangeEnd, setRangeEnd] = useState(String(projectDuration(project)));
  const selectedRange = selectedClipRange(project, selectedIds);
  const rangeOptions = scope === "all" ? undefined : scope === "selected" ? selectedRange : { start: Number(rangeStart), end: Number(rangeEnd) };
  const exportDuration = rangeOptions ? Math.max(0, rangeOptions.end - rangeOptions.start) : projectDuration(project);
  const job = useRef<string | null>(null);
  const exporting =
    busy &&
    !["complete", "error", "cancelled"].includes(progress?.status ?? "");
  useEffect(
    () =>
      window.editorAPI?.onExportProgress((event) => {
        if (!job.current || event.jobId === job.current) {
          setProgress(event);
          if (["complete", "error", "cancelled"].includes(event.status)) {
            setBusy(false);
            if (event.status === "error") setError(event.message ?? "Dışa aktarma başarısız");
          }
        }
      }),
    [],
  );
  const choose = async () => {
    try {
      const path = await window.editorAPI?.chooseExportPath(
        project.name,
        options.format,
      );
      if (path) setOptions((p) => ({ ...p, path }));
    } catch (error) {
      setError(String(error));
    }
  };
  const exportVideo = async () => {
    if (!window.editorAPI) {
      setError("Video dışa aktarma için FFmpeg gereklidir.");
      return;
    }
    try {
      setError("");
      if (scope === "selected" && !selectedRange) throw new Error("Lütfen bir zaman çizelgesi klibi seçin");
      if (scope === "custom" && (!rangeStart.trim() || !rangeEnd.trim())) throw new Error("Lütfen aralık başlangıç ve bitiş zamanını girin");
      resolveExportRange(project, { ...options, range: rangeOptions });
      let path = options.path;
      if (!path) {
        path =
          (await window.editorAPI.chooseExportPath(
            project.name,
            options.format,
          )) ?? "";
        if (!path) return;
        setOptions((p) => ({ ...p, path }));
      }
      job.current = null;
      setBusy(true);
      setProgress({ jobId: "", progress: 0, status: "preparing" });
      const result = await window.editorAPI.exportProject(clone(project), {
        ...options,
        range: rangeOptions,
        path,
      });
      job.current = result.jobId;
    } catch (error) {
      setBusy(false);
      setError(error instanceof Error ? error.message : String(error));
    }
  };
  const status = progress?.status;
  return (
    <ModalShell
      title="Videoyu Dışa Aktar"
      onClose={() => {
        if (!exporting) onClose();
      }}
    >
      <div className="export-preview">
        <div>
          <Video size={28} />
          <strong>{project.name}</strong>
          <span>
            {formatTime(exportDuration, project.fps)} ·{" "}
            {project.clips.length} Klip
          </span>
        </div>
        <span className="export-badge">Yerel Render</span>
      </div>
      <div className="modal-body">
        <label className="stacked-label">
          Kayıt Konumu
          <div className="file-picker">
            <input
              aria-label="Dışa Aktarma Konumu"
              readOnly
              value={options.path}
              placeholder="Kayıt yerini seçin..."
            />
            <button disabled={exporting} onClick={choose}>
              <FolderOpen size={16} />
            </button>
          </div>
        </label>
        <label className="stacked-label">Dışa Aktarma Aralığı
          <select aria-label="Dışa Aktarma Aralığı" value={scope} disabled={exporting} onChange={e => setScope(e.target.value)}>
            <option value="all">Tüm Zaman Çizelgesi</option><option value="selected" disabled={!selectedRange}>Seçili Kliplerin Aralığı</option><option value="custom">Özel Zaman Aralığı</option>
          </select>
        </label>
        {scope === "custom" && <div className="export-fields"><label>Başlangıç (sn)<input aria-label="Başlangıç Zamanı" type="number" min="0" step={1 / project.fps} disabled={exporting} value={rangeStart} onChange={e => setRangeStart(e.target.value)} /></label><label>Bitiş (sn)<input aria-label="Bitiş Zamanı" type="number" min="0" step={1 / project.fps} disabled={exporting} value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} /></label></div>}
        {scope === "selected" && selectedRange && <p className="field-hint">{selectedRange.start.toFixed(3)}–{selectedRange.end.toFixed(3)} sn aralığındaki tüm görünür video ve sesler.</p>}
        <div className="export-fields">
          <label>
            Çözünürlük
            <select
              aria-label="Çözünürlük"
              disabled={exporting}
              value={`${options.width}:${options.height}`}
              onChange={(e) => {
                const [width, height] = e.target.value.split(":").map(Number);
                setOptions((p) => ({ ...p, width, height }));
              }}
            >
              <option
                value={`${project.width + (project.width % 2)}:${project.height + (project.height % 2)}`}
              >
                Orijinal · {project.width}×{project.height}
              </option>
              {[720, 1080, 1440, 2160].map((height) => {
                const width =
                  Math.round((height * project.width) / project.height / 2) * 2;
                return (
                  <option key={height} value={`${width}:${height}`}>
                    {height}p · {width}×{height}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            Kare Hızı (FPS)
            <select
              aria-label="Kare Hızı"
              value={options.fps}
              disabled={exporting}
              onChange={(e) =>
                setOptions((p) => ({ ...p, fps: Number(e.target.value) }))
              }
            >
              {[24, 25, 30, 50, 60].map((fps) => (
                <option key={fps}>{fps}</option>
              ))}
            </select>
          </label>
          <label>
            Kalite
            <select
              aria-label="Kalite"
              disabled={exporting}
              value={options.quality}
              onChange={(e) =>
                setOptions((p) => ({
                  ...p,
                  quality: e.target.value as ExportOptions["quality"],
                }))
              }
            >
              <option value="draft">Taslak · Hızlı</option>
              <option value="standard">Standart · Önerilen</option>
              <option value="high">Yüksek Kalite</option>
            </select>
          </label>
          <label>
            Format
            <select
              aria-label="Format"
              disabled={exporting}
              value={options.format}
              onChange={(e) => {
                job.current = null;
                setOptions((p) => ({
                  ...p,
                  format: e.target.value as "mp4" | "mov",
                  path: "",
                }));
              }}
            >
              <option value="mp4">MP4 · H.264 / AAC</option>
              <option value="mov">MOV · H.264 / AAC</option>
            </select>
          </label>
        </div>
        <p className="field-hint">
          Tüm video kanallarını ve sesleri yerel olarak birleştirir. İnternet veya hesap gerektirmez.
        </p>
        {progress && (
          <div
            className={`export-progress ${status === "complete" ? "is-complete" : ""}`}
          >
            <div>
              <span>
                {status === "complete"
                  ? "Dışa aktarma tamamlandı"
                  : status === "cancelled"
                    ? "Dışa aktarma iptal edildi"
                    : status === "preparing"
                      ? "Medyalar hazırlanıyor"
                      : status === "error"
                        ? "Dışa aktarma başarısız"
                        : "Video işleniyor (Render)"}
              </span>
              <strong>{Math.round(progress.progress * 100)}%</strong>
            </div>
            <progress value={progress.progress} max={1} />
          </div>
        )}
        {error && (
          <div role="alert" className="inline-warning">
            {error}
          </div>
        )}
      </div>
      <footer>
        {exporting ? (
          <>
            <span className="muted">
              <LoaderCircle size={14} className="spin" />
              İşlem tamamlandığında düzenlemeye devam edebilirsiniz
            </span>
            <button
              onClick={() => {
                if (job.current)
                  void window.editorAPI
                    ?.cancelExport(job.current)
                    .catch((error) => setError(String(error)));
              }}
            >
              İptal Et
            </button>
          </>
        ) : status === "complete" ? (
          <>
            <button
              onClick={() =>
                void window.editorAPI
                  ?.revealPath(progress?.path ?? options.path)
                  .catch((error) => notify(String(error)))
              }
            >
              <FolderOpen size={15} />
              Dosyayı Göster
            </button>
            <button className="primary" onClick={onClose}>
              <Check size={15} />
              Tamam
            </button>
          </>
        ) : (
          <>
            <button onClick={onClose}>İptal</button>
            <button
              className="primary"
              onClick={exportVideo}
              disabled={!project.clips.length}
            >
              <Download size={16} />
              Dışa Aktarımı Başlat
            </button>
          </>
        )}
      </footer>
    </ModalShell>
  );
}
async function browserAssets(files: File[]): Promise<MediaAsset[]> {
  const results: MediaAsset[] = [];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const kind = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
        ? "audio"
        : "video";
    if (kind === "image") {
      const image = new Image();
      image.src = url;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(`${file.name} okunamadı`));
      });
      results.push({
        id: id(),
        name: file.name,
        path: file.name,
        url,
        kind,
        duration: 0,
        width: image.width,
        height: image.height,
        fps: 0,
        hasAudio: false,
        thumbnail: url,
      });
    } else {
      const element = document.createElement(kind);
      element.preload = "metadata";
      element.src = url;
      await new Promise<void>((resolve, reject) => {
        element.onloadedmetadata = () => resolve();
        element.onerror = () => reject(new Error(`${file.name} okunamadı`));
      });
      const video = element instanceof HTMLVideoElement ? element : null;
      results.push({
        id: id(),
        name: file.name,
        path: file.name,
        url,
        kind,
        duration: element.duration,
        width: video?.videoWidth ?? 0,
        height: video?.videoHeight ?? 0,
        fps: 30,
        hasAudio: true,
      });
      element.removeAttribute("src");
      element.load();
    }
  }
  return results;
}
export default function App() {
  const s = useEditorStore();
  const { language, t, setLanguage } = useLanguageStore();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [sourceAssetId, setSourceAssetId] = useState<string | null>(null);
  const sourceAsset = s.project.assets.find(asset => asset.id === sourceAssetId);
  const [addingBuiltin, setAddingBuiltin] = useState<string | null>(null);
  const [tab, setTab] = useState("media"),
    [modal, setModal] = useState<Modal>(null),
    [fileMenu, setFileMenu] = useState(false),
    [toast, setToast] = useState(""),
    [importing, setImporting] = useState(false),
    [system, setSystem] = useState<{
      ffmpeg: boolean;
      version?: string;
      ffmpegVersion?: string;
      ffmpegPath?: string;
    }>({ ffmpeg: false }),
    [recent, setRecent] = useState<RecentProject[]>([]),
    [recover, setRecover] = useState<Project | null>(null),
    [initialized, setInitialized] = useState(false);
  useEffect(() => { setSourceAssetId(null); }, [s.project.id, modal, s.selectedIds]);
  useEffect(() => { if (s.playing) setSourceAssetId(null); }, [s.playing]);
  const [timelineHeight, setTimelineHeight] = useState(() =>
    Math.max(220, Math.min(420, window.innerHeight * 0.34)),
  );
  const timelineResize = useRef<{ y: number; height: number } | null>(null);
  const resizeTimeline = (height: number) =>
    setTimelineHeight(
      Math.max(190, Math.min(window.innerHeight - 290, height)),
    );
  useEffect(() => {
    const clamp = () =>
      setTimelineHeight((height) =>
        Math.max(190, Math.min(window.innerHeight - 290, height)),
      );
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);
  const addBuiltin = async (definition: BuiltinAsset) => {
    if (!window.editorAPI) throw new Error("Hazır medya ekleme için masaüstü sürüm gereklidir.");
    if (addingBuiltin) return;
    const projectId = useEditorStore.getState().project.id;
    setAddingBuiltin(definition.id);
    try {
      const imported = await window.editorAPI.importBuiltinAsset(definition.id);
      const state = useEditorStore.getState();
      if (state.project.id !== projectId) throw new Error("Proje değişti, lütfen medyayı tekrar ekleyin.");
      state.beginTransaction();
      try {
        state.addAssets([imported]);
        const latest = useEditorStore.getState();
        const asset = latest.project.assets.find(a => a.path === imported.path)!;
        const name = definition.category === "backgrounds" ? "Dahili Arka Plan" : definition.kind === "audio" ? "Dahili Ses Efekti" : "Dahili Çıkartma";
        let track = latest.project.tracks.find(t => t.name === name && t.kind === definition.kind && !t.locked);
        if (!track) {
          track = createTrack(definition.kind, name);
          const tracks = [...latest.project.tracks];
          if (definition.category === "backgrounds" || definition.kind === "audio") tracks.push(track);
          else { const at = tracks.findIndex(t => t.kind !== "text"); tracks.splice(at < 0 ? tracks.length : at, 0, track); }
          latest.updateProject({ tracks });
        }
        latest.addAssetClip(asset.id, latest.playhead, track.id);
        const after = useEditorStore.getState();
        if (definition.category === "stickers" && after.selectedIds[0]) after.updateClip(after.selectedIds[0], { transform: { ...after.project.clips.find(c => c.id === after.selectedIds[0])!.transform, scale: .35 } });
      } finally { useEditorStore.getState().endTransaction(); }
    } finally { setAddingBuiltin(null); }
  };
  const saving = useRef(false);
  const [capcutImport, setCapcutImport] =
    useState<PendingCapcutImport | null>(null);
  const [capcutTimelineId, setCapcutTimelineId] = useState("");
  const [capcutBusy, setCapcutBusy] = useState(false);
  const capcutImportRef = useRef<PendingCapcutImport | null>(null);
  const capcutBusyRef = useRef(false);
  useEffect(
    () => () => {
      const token = capcutImportRef.current?.selection.token;
      if (token)
        void window.editorAPI?.discardCapcutProject(token).catch(() => {});
    },
    [],
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subtitleInput = useRef<HTMLInputElement>(null);
  const [subtitleAction, setSubtitleAction] = useState<"import" | "draft">(
    "import",
  );
  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  const safe = useCallback(
    async (action: () => unknown) => {
      try {
        await action();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notify(message.replace(/^Error invoking remote method '[^']+': (?:Error: )?/, ""));
      }
    },
    [notify],
  );
  const active = s.project.clips.find((c) => c.id === s.selectedIds[0]);
  const activeTrack = s.project.tracks.find((t) => t.id === active?.trackId);
  const refreshSystem = async () => {
    if (window.editorAPI) setSystem(await window.editorAPI.getSystemInfo());
  };
  useEffect(() => {
    void safe(async () => {
      await refreshSystem();
      if (window.editorAPI) {
        setRecent(await window.editorAPI.getRecentProjects());
        let startup;
        try {
          startup = await window.editorAPI.getStartupProject();
        } catch (error) {
          notify(
            `Proje açılamadı: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (startup) {
          s.setProject(startup.project, startup.path);
          setInitialized(true);
          return;
        }
        const autosave = await window.editorAPI.getAutosave();
        if (autosave && (autosave.clips.length || autosave.assets.length))
          setRecover(autosave);
      }
      setInitialized(true);
    }).finally(() => setInitialized(true));
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    window.editorAPI?.setDirty(s.dirty);
  }, [s.dirty]);
  useEffect(() => {
    if (!initialized || recover || !window.editorAPI) return;
    const timer = setTimeout(() => {
      void window
        .editorAPI!.autosaveProject(s.project)
        .catch((error) => notify(`Otomatik kayıt başarısız: ${String(error)}`));
    }, 1000);
    return () => clearTimeout(timer);
  }, [s.project, initialized, recover]);
  const confirmReplace = () =>
    !useEditorStore.getState().dirty ||
    window.confirm("Projeyi kaydetmeden çıkmak istiyor musunuz? Kaydedilmemiş değişiklikler kaybolabilir.");
  const importMedia = async (paths?: string[]) => {
    if (!window.editorAPI) {
      notify("Medyaları sürükleyip bırakarak içe aktarabilirsiniz.");
      return;
    }
    const projectId = useEditorStore.getState().project.id;
    setImporting(true);
    try {
      const assets = await window.editorAPI.importMedia(paths);
      if (useEditorStore.getState().project.id !== projectId) {
        notify("Proje değiştirildi.");
        return;
      }
      s.addAssets(assets);
      if (assets.length) notify(`${assets.length} medya içe aktarıldı`);
    } finally {
      setImporting(false);
    }
  };
  const save = async (as = false) => {
    if (saving.current) {
      notify("Proje kaydediliyor, lütfen bekleyin...");
      return false;
    }
    if (!window.editorAPI) {
      const blob = new Blob([JSON.stringify(s.project, null, 2)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = s.project.name + ".reacut";
      a.click();
      URL.revokeObjectURL(url);
      notify("Proje dosyası indirildi.");
      return false;
    }
    saving.current = true;
    try {
      const state = useEditorStore.getState(),
        captured = state.project,
        file = await window.editorAPI.saveProject(
          captured,
          as ? undefined : state.path,
        );
      if (!file) return false;
      setRecent(await window.editorAPI.getRecentProjects());
      const latest = useEditorStore.getState();
      if (latest.project.id !== captured.id) {
        notify("Proje yedeği kaydedildi.");
        return false;
      }
      const unchanged = latest.project === captured;
      if (unchanged) latest.markSaved(file);
      else useEditorStore.setState({ path: file, dirty: true });
      notify(unchanged ? "Proje kaydedildi" : "Anlık durum kaydedildi");
      return unchanged;
    } finally {
      saving.current = false;
    }
  };
  const open = async () => {
    if (!confirmReplace()) return;
    if (!window.editorAPI) {
      notify("Projeyi açmak için masaüstü sürümü gereklidir.");
      return;
    }
    const result = await window.editorAPI.openProject();
    if (result) s.setProject(result.project, result.path);
  };
  const newProject = () => {
    if (confirmReplace()) s.setProject(createProject());
  };
  const handleAction = async (action: string) => {
    // Native menu accelerators bypass DOM key handlers; keep modal workflows intact.
    if ((modal || recover) && action !== "save-and-close") return;
    setFileMenu(false);
    switch (action) {
      case "new":
        newProject();
        break;
      case "open":
        await open();
        break;
      case "open-external":
        if (confirmReplace()) {
          const result = await window.editorAPI?.getStartupProject();
          if (result) s.setProject(result.project, result.path);
        }
        break;
      case "save":
        await save();
        break;
      case "save-as":
        await save(true);
        break;
      case "save-and-close":
        try {
          if (await save()) {
            window.editorAPI?.setDirty(false);
            window.editorAPI?.closeWindow();
          } else window.editorAPI?.cancelCloseRequest();
        } catch (error) {
          window.editorAPI?.cancelCloseRequest();
          throw error;
        }
        break;
      case "import":
        await importMedia();
        break;
      case "import-capcut-file":
        await importDraft("file");
        break;
      case "import-capcut-directory":
        await importDraft("directory");
        break;
      case "export":
        s.setPlaying(false);
        setModal("export");
        break;
      case "undo":
        s.undo();
        break;
      case "redo":
        s.redo();
        break;
      case "shortcuts":
        setModal("shortcuts");
        break;
      case "about":
        setModal("about");
        break;
    }
  };
  const actionRef = useRef(handleAction);
  actionRef.current = handleAction;
  useEffect(
    () =>
      window.editorAPI?.onMenuAction(
        (action) => void safe(() => actionRef.current(action)),
      ),
    [safe],
  );
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (modal === "capcut") {
        if (e.key === "Escape") {
          e.preventDefault();
          cancelCapcutImport();
        }
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest("input,textarea,select,[contenteditable=true]"))
        return;
      if (modal || recover) {
        if (e.key === "Escape" && modal !== "export" && modal !== "package") {
          setModal(null);
        }
        return;
      }
      const state = useEditorStore.getState(),
        modifier = e.metaKey || e.ctrlKey;
      let handled = true;
      if (modifier) {
        switch (e.key.toLowerCase()) {
          case "n":
            void safe(() => actionRef.current("new"));
            break;
          case "o":
            void safe(() => actionRef.current("open"));
            break;
          case "s":
            void safe(() => actionRef.current(e.shiftKey ? "save-as" : "save"));
            break;
          case "i":
            void safe(() => actionRef.current("import"));
            break;
          case "e":
            void safe(() => actionRef.current("export"));
            break;
          case "b":
            state.split();
            break;
          case "d":
            state.duplicate();
            break;
          case "z":
            e.shiftKey ? state.redo() : state.undo();
            break;
          case "y":
            state.redo();
            break;
          case "c":
            state.copy();
            break;
          case "v":
            state.paste();
            break;
          case "a":
            state.select(state.project.clips.map((c) => c.id));
            break;
          default:
            handled = false;
        }
      } else
        switch (e.key) {
          case " ":
            if (state.playhead >= projectDuration(state.project)) state.seek(0);
            state.setPlaying(!state.playing && !!state.project.clips.length);
            break;
          case "Backspace":
          case "Delete":
            state.deleteSelected();
            break;
          case "ArrowLeft":
            state.seek(
              Math.max(
                0,
                state.playhead - (e.shiftKey ? 1 : 1 / state.project.fps),
              ),
            );
            break;
          case "ArrowRight":
            state.seek(
              Math.min(
                projectDuration(state.project),
                state.playhead + (e.shiftKey ? 1 : 1 / state.project.fps),
              ),
            );
            break;
          case "Home":
            state.seek(0);
            break;
          case "End":
            state.seek(projectDuration(state.project));
            break;
          case "+":
          case "=":
            state.setZoom(state.zoom * 1.25);
            break;
          case "-":
            state.setZoom(state.zoom / 1.25);
            break;
          case "Escape":
            state.select([]);
            setFileMenu(false);
            break;
          default:
            handled = false;
        }
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [modal, recover, safe]);
  const addStyledText = (preset: TextPreset) => {
    const result = addTextPreset(s.project, preset, s.playhead);
    s.commit(result.project);
    s.select([result.clip.id]);
    setTab("text");
  };
  const readSubtitles = async () => {
    if (!window.editorAPI) {
      setSubtitleAction("import");
      subtitleInput.current?.click();
      return;
    }
    const result = await window.editorAPI.readTextFile(["srt", "vtt"]);
    if (!result) return;
    const cues = parseSubtitles(result.text);
    if (!cues.length) throw new Error("Geçerli bir SRT / VTT altyazısı bulunamadı");
    s.addSubtitles(cues);
    notify(`${cues.length} altyazı içe aktarıldı`);
  };
  const exportSubtitles = async () => {
    const cues = s.project.clips
      .filter((c) => c.text)
      .sort((a, b) => a.start - b.start)
      .map((c) => ({
        start: c.start,
        end: c.start + c.duration,
        text: c.text!.text,
      }));
    if (!cues.length) throw new Error("Projede metin veya altyazı bulunmuyor");
    const text = stringifySubtitles(cues);
    if (window.editorAPI)
      await window.editorAPI.writeTextFile(text, s.project.name + ".srt");
    else {
      const url = URL.createObjectURL(
          new Blob([text], { type: "text/plain;charset=utf-8" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = s.project.name + ".srt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  const cancelCapcutImport = () => {
    if (capcutBusyRef.current) return;
    const token = capcutImportRef.current?.selection.token;
    capcutImportRef.current = null;
    setCapcutImport(null);
    setModal(null);
    if (token)
      void window.editorAPI?.discardCapcutProject(token).catch(() => {});
  };
  const finishCapcutImport = async (
    pending: PendingCapcutImport,
    timelineId?: string,
  ) => {
    if (!window.editorAPI) return;
    capcutBusyRef.current = true;
    setCapcutBusy(true);
    try {
      const result = await window.editorAPI.readCapcutDraft(
        pending.selection.token,
        timelineId,
      );
      const imported = importCapcutDraft(result.text, { name: result.name });
      const loaded: MediaAsset[] = [];
      for (const asset of imported.project.assets) {
        try {
          const probed = (await window.editorAPI.importMedia([asset.path]))[0];
          if (!probed) throw new Error("Medya okunamadı");
          loaded.push({ ...asset, ...probed, id: asset.id, kind: asset.kind });
        } catch {
          loaded.push({
            ...asset,
            missing: true,
            url: `reacut-media://asset?path=${encodeURIComponent(asset.path)}`,
          });
        }
      }
      const latest = useEditorStore.getState();
      if (latest.project.id !== pending.capturedProject.id) {
        notify("Lütfen taslağı mevcut projede tekrar içe aktarın.");
        return;
      }
      if (latest.project !== pending.capturedProject && !confirmReplace())
        return;
      imported.project.assets = loaded;
      s.setProject(imported.project);
      notify([...new Set([...result.warnings, ...imported.warnings])].join(" "));
    } finally {
      await window.editorAPI
        .discardCapcutProject(pending.selection.token)
        .catch(() => {});
      capcutImportRef.current = null;
      setCapcutImport(null);
      setModal((value) => (value === "capcut" ? null : value));
      capcutBusyRef.current = false;
      setCapcutBusy(false);
    }
  };
  const importDraft = async (mode: "file" | "directory" = "file") => {
    setFileMenu(false);
    if (capcutBusyRef.current || capcutImportRef.current) {
      notify("Lütfen mevcut içe aktarımı tamamlayın.");
      return;
    }
    if (!window.editorAPI && mode === "directory") {
      notify("CapCut proje klasörü aktarmak için masaüstü sürüm gereklidir.");
      return;
    }
    if (!confirmReplace()) return;
    if (!window.editorAPI) {
      setSubtitleAction("draft");
      subtitleInput.current?.click();
      return;
    }
    const capturedProject = useEditorStore.getState().project;
    capcutBusyRef.current = true;
    setCapcutBusy(true);
    try {
      const selection = await window.editorAPI.chooseCapcutProject(mode);
      if (!selection) return;
      const pending = { selection, capturedProject };
      capcutImportRef.current = pending;
      if (selection.requiresTimelineChoice) {
        setCapcutImport(pending);
        setCapcutTimelineId(
          selection.recommendedTimelineId ?? selection.timelines[0]?.id ?? "",
        );
        setModal("capcut");
      } else {
        await finishCapcutImport(pending, selection.recommendedTimelineId);
      }
    } finally {
      capcutBusyRef.current = false;
      setCapcutBusy(false);
    }
  };
  const detachAudio = () => {
    if (!active || !active.assetId) return;
    const asset = s.project.assets.find((a) => a.id === active.assetId);
    if (!asset?.hasAudio || asset.kind === "audio")
      throw new Error("Lütfen ses içeren bir video klibi seçin");
    if (activeTrack?.locked) throw new Error("Lütfen önce kanal kilidini açın");
    const audio = {
      ...asset,
      id: id(),
      kind: "audio" as const,
      name: asset.name + " · Ses",
      width: 0,
      height: 0,
      thumbnail: undefined,
      previewUrl: asset.previewUrl,
    };
    const track =
      s.project.tracks.find((t) => t.kind === "audio" && !t.locked) ??
      createTrack("audio", "Ayrılmış Ses");
    const clip = {
      ...clone(active),
      id: id(),
      assetId: audio.id,
      trackId: track.id,
      name: audio.name,
      keyframes: active.keyframes
        .filter((k) => k.property === "volume")
        .map((k) => ({ ...k, id: id() })),
    };
    s.commit({
      ...s.project,
      assets: [...s.project.assets, audio],
      tracks: s.project.tracks.includes(track)
        ? s.project.tracks
        : [...s.project.tracks, track],
      clips: [
        ...s.project.clips.map((c) =>
          c.id === active.id ? { ...c, muted: true } : c,
        ),
        clip,
      ],
    });
    s.select([clip.id]);
    notify("Ses ayrı bir kanala ayrıldı");
  };
  const applySceneTransition = (transition: TransitionId, seconds: number) => {
    if (!active) throw new Error("Lütfen bir video klibi seçin");
    const result = applyTransition(s.project, active.id, transition, seconds);
    s.commit(result.project);
    notify(transition === "dissolve"
      ? `${result.duration.toFixed(2)} sn çapraz geçiş eklendi (sonraki klip örtüşüyor)`
      : `${result.duration.toFixed(2)} sn geçiş eklendi, geri alınabilir`);
  };
  return (
    <div
      className="app-shell"
      style={{
        gridTemplateRows: `44px minmax(180px,1fr) ${timelineHeight}px 26px`,
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        void safe(async () => {
          if (window.editorAPI)
            await importMedia(
              files
                .map((file) => window.editorAPI!.getPathForFile(file))
                .filter(Boolean),
            );
          else s.addAssets(await browserAssets(files));
        });
      }}
    >
      <header className="titlebar">
        <div className="brand">
          <span className="brand-icon">
            <img src="./icons/reacut.png" alt="" />
          </span>
          <strong>ReaCut</strong>
          <span className="brand-cn">{t.brandEditor}</span>
          <a
            href="https://github.com/xavierlayne"
            target="_blank"
            rel="noreferrer"
            title="Geliştirici: @xavierlayne"
            style={{
              fontSize: "11px",
              color: "#45d6c0",
              textDecoration: "none",
              padding: "2px 6px",
              background: "rgba(69, 214, 192, 0.12)",
              borderRadius: "4px",
              marginLeft: "6px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            by @xavierlayne
          </a>
        </div>
        <div className="titlebar-menus">
          <div className="file-menu-container">
            <button
              aria-label={t.fileMenu}
              onClick={() => setFileMenu(!fileMenu)}
            >
              {t.fileMenu}
              <ChevronDown size={12} />
            </button>
            {fileMenu && (
              <div className="file-menu">
                {[
                  ["new", t.newProject, "Ctrl+N"],
                  ["open", t.openProject, "Ctrl+O"],
                  ["save", t.save, "Ctrl+S"],
                  ["save-as", t.saveAs, "Ctrl+Shift+S"],
                  ["import", t.importMedia, "Ctrl+I"],
                  ["export", t.exportVideo, "Ctrl+E"],
                ].map(([action, label, shortcut]) => (
                  <button
                    key={action}
                    onClick={() => void safe(() => handleAction(action))}
                  >
                    {label}
                    <kbd>{shortcut}</kbd>
                  </button>
                ))}
                <hr />
                <button onClick={() => { setFileMenu(false); setModal("package"); }}>{t.packageMedia}</button>
                <button onClick={() => void safe(() => importDraft("file"))}>
                  {t.importCapcutDraft}<span>{t.experimental}</span>
                </button>
                <button
                  onClick={() => void safe(() => importDraft("directory"))}
                >
                  {t.importCapcutFolder}<span>{t.experimental}</span>
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setModal("shortcuts")}>{t.shortcuts}</button>
        </div>
        <div className="project-title">
          <input
            aria-label={t.projectName}
            value={s.project.name}
            onFocus={() => s.beginTransaction()}
            onBlur={() => s.endTransaction()}
            onChange={(e) => s.updateProject({ name: e.target.value })}
          />
          <span
            title={s.dirty ? t.hasUnsavedChanges : t.saved}
            className={`save-dot ${s.dirty ? "dirty" : ""}`}
          />
        </div>
        <div className="titlebar-actions">
          <div className="language-selector" title={t.languageSelect}>
            <Globe size={14} />
            <select
              value={language}
              aria-label={t.languageSelect}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              style={{
                background: "transparent",
                color: "var(--text-color, #e0e0e0)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              <option value="tr" style={{ background: "#202028", color: "#fff" }}>Türkçe</option>
              <option value="zh" style={{ background: "#202028", color: "#fff" }}>中文</option>
              <option value="en" style={{ background: "#202028", color: "#fff" }}>English</option>
            </select>
          </div>
          <button aria-label={t.assistant} className={assistantOpen ? "active" : ""} onClick={() => setAssistantOpen(!assistantOpen)}><MessageSquare size={15} />{t.assistant}</button>
          <span className="offline-pill">
            <CloudOff size={12} />
            {t.offline}
          </span>
          <button
            title={t.saveProjectTooltip}
            aria-label={t.save}
            onClick={() => void safe(() => save())}
          >
            <Save size={16} />
          </button>
          <button
            title={t.settings}
            aria-label={t.settings}
            onClick={() => setModal("settings")}
          >
            <Settings2 size={16} />
          </button>
          <button
            className="primary export-button"
            onClick={() => {
              s.setPlaying(false);
              setModal("export");
            }}
          >
            <Upload size={15} />
            {t.exportBtn}
          </button>
        </div>
      </header>
      <EditorWorkspace assistantOpen={assistantOpen}>
        <section className="resource-panel panel">
          <nav className="resource-tabs">
            {[
              ["media", t.tabMedia, Video],
              ["audio", t.tabAudio, Music2],
              ["text", t.tabText, Type],
              ["stickers", t.tabSticker, Shapes],
              ["effects", t.tabEffect, WandSparkles],
              ["transitions", t.tabTransition, Sparkles],
              ["subtitles", t.tabSubtitle, Subtitles],
            ].map(([tabKey, label, Icon]) => (
              <button
                key={tabKey as string}
                className={tab === tabKey ? "active" : ""}
                onClick={() => setTab(tabKey as string)}
              >
                {typeof Icon !== "string" && <Icon size={19} />}
                <span>{label as string}</span>
              </button>
            ))}
          </nav>
          <div className="resource-body">
            {tab === "stickers" && <AssetLibrary onAdd={addBuiltin} addingId={addingBuiltin} />}
            {(tab === "media" || tab === "audio") && (
              <MediaLibrary
                project={
                  tab === "audio"
                    ? {
                        ...s.project,
                        assets: s.project.assets.filter(
                          (a) => a.kind === "audio",
                        ),
                      }
                    : s.project
                }
                onImport={(paths) => void safe(() => importMedia(paths))}
                onPreviewAsset={(assetId) => { s.setPlaying(false); setSourceAssetId(assetId); }}
                onAddAsset={(assetId) => { setSourceAssetId(null); s.addAssetClip(assetId); }}
                onRemoveAsset={(assetId) =>
                  void safe(() => s.removeAsset(assetId))
                }
                importing={importing}
                onImportFiles={(files) =>
                  void safe(async () => s.addAssets(await browserAssets(files)))
                }
                onRevealAsset={(assetId) =>
                  void safe(() => {
                    const asset = s.project.assets.find(
                      (a) => a.id === assetId,
                    );
                    if (asset?.missing) return relink(asset);
                    if (asset && window.editorAPI)
                      return window.editorAPI.revealPath(asset.path);
                  })
                }
              />
            )}
            {tab === "text" && <TextLibrary onAdd={addStyledText} onBlank={s.addText} />}
            {tab === "subtitles" && <SubtitlePanel onImport={() => safe(readSubtitles)} onExport={() => safe(exportSubtitles)} />}
            {tab === "effects" && (
              <EffectsPanel
                clip={active}
                project={s.project}
                kind={activeTrack?.kind}
                locked={activeTrack?.locked}
                onApply={(patch) => {
                  if (active) s.updateClip(active.id, patch);
                  else notify("Önce bir zaman çizelgesi klibi seçin");
                }}
              />
            )}
            {tab === "transitions" && <TransitionLibrary
              disabled={!active || !!active.text || activeTrack?.kind === "audio" || !!activeTrack?.locked}
              onApply={(transition,seconds)=>void safe(()=>applySceneTransition(transition,seconds))}
            />}
          </div>
        </section>
        {sourceAsset ? <SourcePreview
          asset={sourceAsset}
          fps={s.project.fps}
          onClose={() => setSourceAssetId(null)}
          onAddRange={(sourceIn, duration) => void safe(() => {
            s.addAssetClip(sourceAsset.id, s.playhead, undefined, { sourceIn, duration });
            setSourceAssetId(null);
          })}
        /> : <Player
          project={s.project}
          selectedIds={s.selectedIds}
          playhead={s.playhead}
          playing={s.playing}
          onSelect={s.select}
          onUpdateClip={s.updateClip}
          onSeek={s.seek}
          onPlayingChange={s.setPlaying}
        />}
        {assistantOpen ? <AssistantPanel onClose={() => setAssistantOpen(false)} /> : <Inspector
          project={s.project}
          clip={active}
          playhead={s.playhead}
          onUpdate={(patch) => active && s.updateClip(active.id, patch)}
          onProjectUpdate={s.updateProject}
        />}
      </EditorWorkspace>
      <div className="timeline-pane">
        <div
          className="timeline-resize"
          role="separator"
          tabIndex={0}
          aria-label="Zaman çizelgesi yüksekliğini ayarla"
          aria-orientation="horizontal"
          aria-valuenow={Math.round(timelineHeight)}
          aria-valuemin={190}
          aria-valuemax={Math.max(190, window.innerHeight - 290)}
          title="Yüksekliği ayarlamak için sürükleyin"
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              resizeTimeline(
                timelineHeight + (event.key === "ArrowUp" ? 20 : -20),
              );
            }
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            timelineResize.current = {
              y: event.clientY,
              height: timelineHeight,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = timelineResize.current;
            if (drag) resizeTimeline(drag.height + drag.y - event.clientY);
          }}
          onPointerUp={(event) => {
            timelineResize.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            timelineResize.current = null;
          }}
        />
        <Timeline
          project={s.project}
          selectedIds={s.selectedIds}
          playhead={s.playhead}
          playing={s.playing}
          zoom={s.zoom}
          onSeek={(time) => { setSourceAssetId(null); s.seek(time); }}
          onSelect={(ids) => { setSourceAssetId(null); s.select(ids); }}
          onClipUpdate={s.updateClip}
          onMoveClips={s.moveClips}
          onTrim={s.trim}
          onSplit={s.split}
          onDelete={s.deleteSelected}
          onZoom={s.setZoom}
          onTrackUpdate={s.updateTrack}
          onTrackDelete={s.deleteTrack}
          onTrackMove={s.reorderTrack}
          onAddTrack={s.addTrack}
          onDropAsset={(assetId, time, trackId) => {
            setSourceAssetId(null); s.addAssetClip(assetId, time, trackId);
          }}
          snapping={s.snapping}
          onSnappingChange={s.setSnapping}
          magnetic={s.magnetic}
          onMagneticChange={s.setMagnetic}
          onDuplicate={s.duplicate}
          onAddText={s.addText}
          onUndo={s.undo}
          onRedo={s.redo}
          canUndo={s.past.length > 0}
          canRedo={s.future.length > 0}
        />
      </div>
      <footer className="app-status">
        <span>
          <span className="status-dot" />{" "}
          {window.editorAPI ? "Masaüstü Sürümü" : "Web Önizleme"} ·{" "}
          {s.project.assets.length} Medya · {s.project.clips.length} Klip ·{" "}
          <a
            href="https://github.com/xavierlayne"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#45d6c0", textDecoration: "none", fontWeight: 500 }}
          >
            github.com/xavierlayne
          </a>
        </span>
        <div>
          {active?.assetId &&
            s.project.assets.find((a) => a.id === active.assetId)?.hasAudio && (
              <button onClick={() => void safe(detachAudio)}>Sesi Ayır</button>
            )}
          {s.project.assets.some((a) => a.missing) && (
            <button
              onClick={() =>
                void safe(() =>
                  relink(s.project.assets.find((a) => a.missing)!),
                )
              }
            >
              Kayıp Medyaları Yeniden Bağla
            </button>
          )}
          <span>{s.dirty ? "Kaydedilmedi · Otomatik kurtarma devrede" : "Proje Hazır"}</span>
          <button title="Son Projeler" onClick={() => setModal("settings")}>
            <FolderOpen size={12} />
          </button>
        </div>
      </footer>
      {toast && (
        <div role="status" className="toast">
          <Info size={16} />
          <span>{toast}</span>
          <button aria-label="Bildirimi Kapat" onClick={() => setToast("")}>
            <X size={13} />
          </button>
        </div>
      )}
      {modal === "package" && <PackageDialog project={clone(s.project)} onClose={() => setModal(null)} />}
      {modal === "export" && (
        <ExportDialog
          project={s.project}
          selectedIds={s.selectedIds}
          onClose={() => setModal(null)}
          notify={notify}
        />
      )}
      {modal === "capcut" && capcutImport && (
        <ModalShell title="CapCut Zaman Çizelgesi Seç" onClose={cancelCapcutImport}>
          <div className="modal-body">
            <p>
              <strong>{capcutImport.selection.name}</strong>{" "}
              Birden fazla zaman çizelgesi bulundu, içe aktarılacak olanı seçin.
            </p>
            <label>
              Zaman Çizelgesi
              <select
                aria-label="CapCut Zaman Çizelgesi"
                value={capcutTimelineId}
                disabled={capcutBusy}
                onChange={(event) => setCapcutTimelineId(event.target.value)}
              >
                {capcutImport.selection.timelines.map((timeline) => (
                  <option key={timeline.id} value={timeline.id}>
                    {timeline.name}
                    {timeline.isActive ? " · Aktif Düzenleme" : ""}
                    {timeline.isMain ? " · Ana Kanal" : ""}
                  </option>
                ))}
              </select>
            </label>
            {capcutImport.selection.warnings.map((warning) => (
              <p className="muted" key={warning}>
                {warning}
              </p>
            ))}
            <p className="muted">İçe aktardıktan sonra video, metin ve efektleri kontrol edin.</p>
          </div>
          <footer>
            <button disabled={capcutBusy} onClick={cancelCapcutImport}>
              İptal
            </button>
            <button
              className="primary"
              disabled={capcutBusy || !capcutTimelineId}
              onClick={() =>
                void safe(() =>
                  finishCapcutImport(capcutImport, capcutTimelineId),
                )
              }
            >
              {capcutBusy ? "İçe aktarılıyor..." : "Seçilen Zaman Çizelgesini Aktar"}
            </button>
          </footer>
        </ModalShell>
      )}
      {modal === "shortcuts" && (
        <ModalShell title={t.shortcuts} onClose={() => setModal(null)}>
          <div className="shortcut-list">
            {[
              [`${t.play} / ${t.pause}`, "Space"],
              [t.splitClip, "Ctrl + B"],
              [t.deleteClip, "Delete / Backspace"],
              [`${t.undo} / ${t.redo}`, "Ctrl + Z / Ctrl + Shift + Z"],
              [`${t.copy} / ${t.paste}`, "Ctrl + C / Ctrl + V"],
              [t.duplicateClip, "Ctrl + D"],
              [t.selectAll, "Ctrl + A"],
              [t.prevNextFrame, "← / →"],
              [`${t.newProject} / ${t.openProject} / ${t.save}`, "Ctrl + N / O / S"],
              [`${t.importMedia} / ${t.exportVideo}`, "Ctrl + I / E"],
              [t.zoomInOut, "+ / −"],
              [t.jumpHomeEnd, "Home / End"],
            ].map(([action, keys]) => (
              <div key={action}>
                <span>{action}</span>
                <kbd>{keys}</kbd>
              </div>
            ))}
          </div>
          <footer>
            <span className="muted small">
              {t.windowsCtrlNote}
            </span>
            <button className="primary" onClick={() => setModal(null)}>
              {t.gotIt}
            </button>
          </footer>
        </ModalShell>
      )}
      {modal === "about" && (
        <ModalShell title={t.aboutTitle} onClose={() => setModal(null)}>
          <div className="about-body">
            <div className="about-logo">
              <img src="./icons/reacut.png" width="58" height="58" alt="ReaCut Logosu" />
            </div>
            <h2>ReaCut</h2>
            <span>{appVersion} · {t.aboutSubtitle}</span>
            <p>{t.aboutDesc}</p>
            <p className="small" style={{ margin: "8px 0" }}>
              Geliştirici / Katkıcı: <a href="https://github.com/xavierlayne" target="_blank" rel="noreferrer" style={{ color: "var(--accent-color, #45d6c0)", textDecoration: "none" }}>@xavierlayne</a>
            </p>
            <p className="muted">{t.aboutDisclaimer}</p>
          </div>
          <footer>
            <button className="primary" onClick={() => setModal(null)}>
              {t.close}
            </button>
          </footer>
        </ModalShell>
      )}
      {modal === "settings" && (
        <ModalShell title={t.settingsTitle} onClose={() => setModal(null)}>
          <div className="modal-body">
            <h3>{t.languageSelect}</h3>
            <div style={{ marginBottom: "16px" }}>
              <select
                value={language}
                aria-label={t.languageSelect}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                style={{
                  background: "var(--bg-secondary, #202028)",
                  color: "var(--text-color, #e0e0e0)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  width: "100%",
                  cursor: "pointer"
                }}
              >
                <option value="tr">Türkçe (Turkish)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="en">English (English)</option>
              </select>
            </div>
            <h3>{t.localRenderEngine}</h3>
            <div className={`engine-status ${system.ffmpeg ? "ready" : ""}`}>
              {system.ffmpeg ? <CheckCircle2 size={18} /> : <Info size={18} />}
              <div>
                <strong>
                  {system.ffmpeg ? t.ffmpegReady : t.ffmpegNotFound}
                </strong>
                <span>
                  {system.ffmpegVersion ?? t.selectFfmpegPrompt}
                </span>
              </div>
            </div>
            <p className="muted small">
              {system.ffmpegPath ?? t.installedFfmpegUsed}
            </p>
            <div className="button-row">
              <button
                onClick={() =>
                  void safe(async () => {
                    await window.editorAPI?.chooseMediaTool("ffmpeg");
                    await refreshSystem();
                  })
                }
              >
                {t.chooseFfmpeg}
              </button>
              <button
                onClick={() =>
                  void safe(async () => {
                    await window.editorAPI?.chooseMediaTool("ffprobe");
                    await refreshSystem();
                  })
                }
              >
                {t.chooseFfprobe}
              </button>
            </div>
            <h3>{t.recentProjects}</h3>
            {recent.length === 0 ? (
              <p className="muted small">{t.noRecentProjects}</p>
            ) : (
              <div className="recent-list">
                {recent.map((p) => (
                  <button
                    key={p.path}
                    onClick={() =>
                      void safe(async () => {
                        if (!confirmReplace()) return;
                        const result =
                          await window.editorAPI?.openRecentProject(p.path);
                        if (result) {
                          s.setProject(result.project, result.path);
                          setModal(null);
                        }
                      })
                    }
                  >
                    <FolderOpen size={16} />
                    <div>
                      <strong>{p.name}</strong>
                      <span>{p.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="future-feature">
              <CloudOff size={16} />
              <div>
                <strong>{t.cloudAndApiServices}</strong>
                <p>{t.cloudServicesDesc}</p>
              </div>
            </div>
          </div>
          <footer>
            <button onClick={() => setModal("about")}>{t.about}</button>
            <button className="primary" onClick={() => setModal(null)}>
              {t.ok}
            </button>
          </footer>
        </ModalShell>
      )}
      {recover && (
        <ModalShell
          title={t.recoverTitle}
          onClose={() => {
            setRecover(null);
          }}
        >
          <div className="modal-body">
            <p>
              {t.recoverFound} <strong>{recover.name}</strong> (
              {recover.clips.length} klip)
            </p>
            <p className="muted">{t.recoverHelp}</p>
          </div>
          <footer>
            <button onClick={() => setRecover(null)}>{t.newEmptyProject}</button>
            <button
              className="primary"
              onClick={() => {
                s.setProject(recover);
                setRecover(null);
                notify(t.recoveredNotification);
              }}
            >
              {t.recoverProject}
            </button>
          </footer>
        </ModalShell>
      )}
      <input
        ref={subtitleInput}
        type="file"
        style={{ display: "none" }}
        accept={subtitleAction === "draft" ? ".json" : ".srt,.vtt"}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file)
            void safe(async () => {
              const text = await file.text();
              if (subtitleAction === "draft") {
                const imported = importCapcutDraft(text);
                s.setProject(imported.project);
                notify(imported.warnings.join(" "));
              } else {
                const cues = parseSubtitles(text);
                if (!cues.length) throw new Error("Altyazı dosyasında geçerli altyazı bulunamadı");
                s.addSubtitles(cues);
              }
            });
          e.target.value = "";
        }}
      />
    </div>
  );
  async function relink(asset: MediaAsset) {
    if (!window.editorAPI) return;
    const projectId = useEditorStore.getState().project.id;
    const result = await window.editorAPI.relinkAsset(asset);
    if (!result) return;
    // A separated audio layer still references the same video source. Relink every
    // reference together, preserving its role and identity within the project.
    let source = result;
    if (
      result.kind === "audio" &&
      useEditorStore
        .getState()
        .project.assets.some((a) => a.path === asset.path && a.kind === "video")
    )
      source = (await window.editorAPI.importMedia([result.path]))[0] ?? result;
    const current = useEditorStore.getState();
    if (current.project.id !== projectId) return;
    if (current.project.assets.some((a) => a.id === asset.id))
      current.commit({
        ...current.project,
        assets: current.project.assets.map((a) =>
          a.path === asset.path
            ? {
                ...source,
                id: a.id,
                name: a.name,
                kind: a.kind,
                ...(a.kind === "audio"
                  ? { width: 0, height: 0, thumbnail: undefined }
                  : {}),
              }
            : a,
        ),
      });
  }
}
