import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, KeyRound, MessageSquare, RefreshCw, Send, Square, X } from "lucide-react";
import { useEditorStore } from "../editor/store";
import { assistantProjectContext, previewAssistantEdits, type AssistantEditPreview } from "../core/assistantEdits";
import type { AssistantMessage, AssistantProvider, AssistantProviderInfo } from "../core/assistantTypes";
import type { Project } from "../core/types";
import "./AssistantPanel.css";

type Proposal = { preview: AssistantEditPreview; base: string; applied: boolean };

const getSenderLabel = (message: AssistantMessage) => {
  if (message.role === "user") return "Siz";
  switch (message.provider) {
    case "gemini": return "Google Gemini";
    case "openai": return "ChatGPT";
    case "claude": return "Claude";
    case "codex": return "Codex";
    default: return "Asistan";
  }
};

const getProviderDisplayName = (prov: AssistantProvider) => {
  switch (prov) {
    case "gemini": return "Google Gemini";
    case "openai": return "ChatGPT";
    case "claude": return "Claude";
    case "codex": return "Codex";
  }
};

const formatTime = (ts?: number) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
};

export default function AssistantPanel({ onClose }: { onClose(): void }) {
  const project = useEditorStore(s => s.project);
  const [provider, setProvider] = useState<AssistantProvider>(() => {
    if (localStorage.getItem("reacut_gemini_key")) return "gemini";
    if (localStorage.getItem("reacut_openai_key")) return "openai";
    return "gemini";
  });
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("reacut_gemini_key") || "");
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem("reacut_openai_key") || "");
  const [authInput, setAuthInput] = useState("");
  const [providers, setProviders] = useState<AssistantProviderInfo[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false), [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState(""), [error, setError] = useState("");
  const [stream, setStream] = useState(""), [proposal, setProposal] = useState<Proposal | null>(null);
  const active = useRef<{ id: string; provider: AssistantProvider; project: Project; base: string; history: AssistantMessage[]; startTime?: number } | null>(null);
  const generation = useRef(0), lastPrompt = useRef("");
  const history = useRef<AssistantMessage[]>([]), chatEnd = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    try { setProviders(await window.editorAPI!.getAssistantProviders()); }
    catch (e) { setError(String(e)); }
  };

  useEffect(() => { if (window.editorAPI) void refresh(); }, []);

  useEffect(() => {
    const current = ++generation.current;
    const old = active.current; active.current = null;
    if (old) void window.editorAPI?.cancelAssistant(old.id).catch(() => {});
    history.current = []; setMessages([]); setProposal(null); setBusy(false); setStream(""); setError(""); setStatus(""); setLoaded(false);
    void window.editorAPI?.getAssistantHistory(project.id).then(items => {
      if (generation.current === current) { history.current = items; setMessages(items); setLoaded(true); }
    }).catch(e => { if (generation.current === current) { setError(String(e)); setLoaded(true); } });
    return () => { ++generation.current; const request = active.current; active.current = null; if (request) void window.editorAPI?.cancelAssistant(request.id).catch(() => {}); };
  }, [project.id]);

  const persist = (items: AssistantMessage[], projectId: string) => {
    const limited = items.slice(-40).map(m => ({ ...m, content: m.content.slice(0, 6000) }));
    history.current = limited; setMessages(limited);
    void window.editorAPI?.saveAssistantHistory(projectId, limited).catch(e => setError(`Sohbet kaydedilemedi: ${String(e)}`));
  };

  useEffect(() => window.editorAPI?.onAssistantEvent(event => {
    const request = active.current;
    if (!request || event.requestId !== request.id) return;
    if (event.type === "status") setStatus(event.message);
    if (event.type === "text") setStream(text => text + event.text);
    if (event.type === "complete") {
      const durationMs = request.startTime ? Date.now() - request.startTime : undefined;
      persist([...request.history, {
        role: "assistant",
        content: event.response.reply,
        provider: request.provider,
        timestamp: Date.now(),
        durationMs,
      }], request.project.id);
      if (event.response.actions.length) {
        try { setProposal({ preview: previewAssistantEdits(request.project, event.response.actions), base: request.base, applied: false }); }
        catch (e) { setError(`Öneri doğrulanamadı, proje değiştirilmedi: ${String(e)}`); }
      }
      active.current = null; setBusy(false); setStream(""); setStatus("Yanıt tamamlandı");
    }
    if (event.type === "error" || event.type === "cancelled") {
      active.current = null; setBusy(false); setStream(""); setStatus(event.type === "cancelled" ? "İptal edildi" : "");
      if (event.type === "error") setError(event.message);
    }
  }), []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ block: "nearest" }); }, [messages, stream, status]);

  const saveKey = () => {
    const key = authInput.trim();
    if (!key) return;
    if (provider === "gemini") {
      localStorage.setItem("reacut_gemini_key", key);
      setGeminiKey(key);
    } else if (provider === "openai") {
      localStorage.setItem("reacut_openai_key", key);
      setOpenaiKey(key);
    }
    setAuthInput("");
    setError("");
  };

  const removeKey = (target: "gemini" | "openai") => {
    if (target === "gemini") {
      localStorage.removeItem("reacut_gemini_key");
      setGeminiKey("");
    } else {
      localStorage.removeItem("reacut_openai_key");
      setOpenaiKey("");
    }
  };

  const currentProvider = providers.find(p => p.id === provider);
  const isDirect = provider === "gemini" || provider === "openai";
  const directKey = provider === "gemini" ? geminiKey : openaiKey;
  const isAvailable = isDirect ? !!directKey : (currentProvider?.available ?? false);

  const send = async (value = prompt) => {
    if (!value.trim() || active.current || !window.editorAPI) return;
    const s = useEditorStore.getState();
    const base = JSON.stringify(s.project), captured: Project = JSON.parse(base);
    const now = Date.now();
    const userMsg: AssistantMessage = {
      role: "user",
      content: value.trim(),
      timestamp: now,
    };
    const items: AssistantMessage[] = [...history.current, userMsg];
    const requestId = crypto.randomUUID();
    const request = {
      id: requestId,
      provider,
      project: captured,
      base,
      history: items,
      startTime: now,
    };
    active.current = request;
    lastPrompt.current = value;
    setBusy(true);
    setError("");
    setProposal(null);
    setStream("");
    setPrompt("");

    const previous = history.current.slice(-20).map(m => ({ ...m, content: m.content.slice(0, 4000) }));
    persist(items, captured.id);

    if (isDirect) {
      const providerLabel = getProviderDisplayName(provider);
      setStatus(`${providerLabel} yanıt hazırlıyor...`);
      try {
        const response = await window.editorAPI.directAssistantQuery!({
          provider,
          apiKey: directKey,
          prompt: value.trim(),
          context: assistantProjectContext(captured, s.selectedIds, s.playhead),
          history: previous
        });
        const durationMs = Date.now() - now;
        const assistantMsg: AssistantMessage = {
          role: "assistant",
          content: response.reply,
          provider,
          timestamp: Date.now(),
          durationMs,
        };
        persist([...items, assistantMsg], captured.id);
        if (response.actions.length) {
          try {
            setProposal({ preview: previewAssistantEdits(captured, response.actions), base, applied: false });
          } catch (err) {
            setError(`Öneri doğrulanamadı, proje değiştirilmedi: ${String(err)}`);
          }
        }
        active.current = null;
        setBusy(false);
        setStatus("Yanıt tamamlandı");
      } catch (err) {
        if (active.current?.id === requestId) {
          active.current = null;
          setBusy(false);
          setError(err instanceof Error ? err.message : String(err));
          setStatus("");
        }
      }
      return;
    }

    setStatus("CLI bağlantısı kuruluyor...");
    try {
      await window.editorAPI.startAssistant({
        requestId: request.id,
        provider,
        prompt: value.trim(),
        history: previous,
        context: assistantProjectContext(captured, s.selectedIds, s.playhead)
      });
    } catch (e) {
      if (active.current?.id === requestId) {
        active.current = null;
        setBusy(false);
        setError(String(e));
        setStatus("");
      }
    }
  };

  const stale = proposal && JSON.stringify(project) !== proposal.base;

  return (
    <aside className="assistant-panel panel" aria-label="Video Asistanı">
      <header>
        <strong><MessageSquare size={16} />Video Asistanı</strong>
        <button aria-label="Asistanı Kapat" onClick={onClose}><X size={16} /></button>
      </header>

      <div className="assistant-config">
        <select
          aria-label="Asistan Motoru"
          value={provider}
          disabled={busy}
          onChange={e => {
            setProvider(e.target.value as AssistantProvider);
            setError("");
          }}
        >
          <option value="gemini">Google Gemini (Tek Tıkla Giriş)</option>
          <option value="openai">ChatGPT / OpenAI (Tek Tıkla Giriş)</option>
          <option value="codex">Codex CLI (Yerel Araç)</option>
          <option value="claude">Claude Code (Yerel Araç)</option>
        </select>
        {!isDirect && (
          <>
            <button aria-label="Durumu Yenile" disabled={busy} onClick={() => void refresh()}><RefreshCw size={14} /></button>
            <button disabled={busy || !window.editorAPI} onClick={() => void window.editorAPI!.chooseAssistantCLI(provider).then(setProviders).catch(e => setError(String(e)))}>CLI Seç</button>
          </>
        )}
      </div>

      {isDirect ? (
        directKey ? (
          <div className="assistant-auth-active">
            <span><Check size={14} /> {provider === "gemini" ? "Google Gemini Bağlandı (Aktif)" : "ChatGPT / OpenAI Bağlandı (Aktif)"}</span>
            <button onClick={() => removeKey(provider)}>Değiştir</button>
          </div>
        ) : (
          <div className="assistant-auth-card">
            <h4><KeyRound size={14} /> {provider === "gemini" ? "Google Gemini ile Bağlan" : "ChatGPT / OpenAI ile Bağlan"}</h4>
            <p>
              {provider === "gemini"
                ? "CLI veya terminal gerekmez. Google hesabınızla ücretsiz API anahtarı alın ve tek tıkla bağlanın."
                : "CLI veya terminal gerekmez. OpenAI hesabınızla API anahtarı alarak tek tıkla bağlanın."}
            </p>
            <div className="assistant-auth-btn-row">
              <button
                type="button"
                className={`assistant-oauth-btn ${provider}`}
                onClick={() => {
                  const url = provider === "gemini"
                    ? "https://aistudio.google.com/app/apikey"
                    : "https://platform.openai.com/api-keys";
                  void window.editorAPI?.openExternal?.(url);
                }}
              >
                <ExternalLink size={13} /> {provider === "gemini" ? "Google ile Giriş Yap / Anahtar Al" : "OpenAI ile Giriş Yap / Anahtar Al"}
              </button>
            </div>
            <div className="assistant-auth-input-row">
              <input
                type="password"
                placeholder={provider === "gemini" ? "Google API Anahtarını yapıştırın (AIzaSy...)" : "OpenAI API Anahtarını yapıştırın (sk-...)"}
                value={authInput}
                onChange={e => setAuthInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveKey(); }}
              />
              <button className="primary" onClick={saveKey}>Giriş Yap</button>
            </div>
          </div>
        )
      ) : (
        <p className="assistant-provider-status">
          {currentProvider?.available
            ? `Algılandı: ${currentProvider.label} ${currentProvider.version ?? ""}`
            : currentProvider?.error ?? "Sistem CLI taranıyor..."}
        </p>
      )}

      <div className="assistant-chat" aria-live="polite">
        {!messages.length && (
          <div className="assistant-welcome">
            <MessageSquare size={28} />
            <h3>Düzenleme fikrinizi yazın</h3>
            <p>Zaman çizelgesine göre düzenlemeler önerir; onayınızla tek tıkla uygulanır.</p>
            <button onClick={() => setPrompt("İmleç konumuna 3 saniyelik başlık ekle")}>Giriş Başlığı Ekle</button>
            <button onClick={() => setPrompt("Zaman çizelgesini analiz et ve 3 öneri ver")}>Önerileri Gör</button>
          </div>
        )}
        {messages.map((message, i) => (
          <div key={i} className={`assistant-message ${message.role}`}>
            <div className="assistant-message-header">
              <span className="assistant-message-sender">{getSenderLabel(message)}</span>
              <span className="assistant-message-meta">
                {formatTime(message.timestamp)}
                {message.durationMs ? ` · ${(message.durationMs / 1000).toFixed(1)} sn` : ""}
              </span>
            </div>
            <p>{message.content}</p>
          </div>
        ))}
        {busy && (
          <div className="assistant-message assistant thinking">
            <div className="assistant-message-header">
              <span className="assistant-message-sender">{getProviderDisplayName(provider)}</span>
              <span className="assistant-message-meta">Düşünüyor...</span>
            </div>
            <div className="assistant-thinking-body">
              <span className="assistant-thinking-dots">
                <span></span><span></span><span></span>
              </span>
              <span className="assistant-thinking-text">{status || `${getProviderDisplayName(provider)} yanıt hazırlıyor...`}</span>
            </div>
          </div>
        )}
        {stream && (
          <div className="assistant-message assistant">
            <div className="assistant-message-header">
              <span className="assistant-message-sender">{getProviderDisplayName(provider)}</span>
              <span className="assistant-message-meta">Yazıyor...</span>
            </div>
            <p>{stream}</p>
          </div>
        )}
        {status && !busy && <p className="assistant-status">{status}</p>}
        {error && <p className="assistant-error" role="alert">{error}</p>}
        {proposal && (
          <div className="assistant-proposal">
            <strong>İncelenecek Değişiklikler · {proposal.preview.descriptions.length} Adım</strong>
            <ol>
              {proposal.preview.descriptions.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
            <p>{proposal.preview.before.clips} → {proposal.preview.after.clips} Klip · {proposal.preview.after.duration.toFixed(2)} sn</p>
            <button
              className="primary"
              disabled={proposal.applied || !!stale}
              onClick={() => {
                if (JSON.stringify(useEditorStore.getState().project) !== proposal.base) {
                  setError("Proje değişti, lütfen öneriyi tekrar oluşturun");
                  return;
                }
                useEditorStore.getState().commit(proposal.preview.project);
                setProposal({ ...proposal, applied: true });
              }}
            >
              {proposal.applied ? "Uygulandı · Geri alınabilir" : stale ? "Proje değişti, tekrar oluşturun" : `${proposal.preview.descriptions.length} Değişikliği Uygula`}
            </button>
          </div>
        )}
        <div ref={chatEnd} />
      </div>

      <div className="assistant-compose">
        <p>Sorular ve zaman çizelgesi özeti seçilen AI servisine iletilir. Medya dosyaları gönderilmez.</p>
        <textarea
          aria-label="Asistan Mesajı"
          placeholder={isAvailable ? (busy ? "Asistan yanıtlıyor..." : "Örneğin: Seçili klibin sesini yarıya indir... (Enter ile gönder)") : "Lütfen yukarıdan giriş yapın veya API anahtarınızı girin..."}
          maxLength={8000}
          disabled={busy}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!busy && loaded && isAvailable && prompt.trim()) void send();
            } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              if (!busy && loaded && isAvailable && prompt.trim()) void send();
            }
          }}
        />
        <div>
          <button
            disabled={busy || !messages.length}
            onClick={() => {
              persist([], project.id);
              setProposal(null);
              setError("");
            }}
          >
            Sohbeti Temizle
          </button>
          {!busy && lastPrompt.current && (
            <button onClick={() => void send(lastPrompt.current)} disabled={!isAvailable}>
              Tekrar Dene
            </button>
          )}
          {busy ? (
            <button
              onClick={() => {
                const req = active.current;
                if (req) void window.editorAPI?.cancelAssistant(req.id).catch(e => setError(String(e)));
              }}
            >
              <Square size={13} /> İptal
            </button>
          ) : (
            <button
              className="primary"
              disabled={!loaded || !prompt.trim() || !isAvailable}
              onClick={() => void send()}
            >
              <Send size={13} /> Gönder
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
