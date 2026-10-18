import { create } from "zustand";

export type SupportedLanguage = "tr" | "zh" | "en";

export interface Translations {
  // Brand & Top bar
  appTitle: string;
  brandEditor: string;
  fileMenu: string;
  newProject: string;
  openProject: string;
  save: string;
  saveAs: string;
  importMedia: string;
  exportVideo: string;
  packageMedia: string;
  importCapcutDraft: string;
  importCapcutFolder: string;
  experimental: string;
  shortcuts: string;
  projectName: string;
  hasUnsavedChanges: string;
  saved: string;
  assistant: string;
  offline: string;
  saveProjectTooltip: string;
  settings: string;
  exportBtn: string;

  // Tabs
  tabMedia: string;
  tabAudio: string;
  tabText: string;
  tabSticker: string;
  tabEffect: string;
  tabTransition: string;
  tabSubtitle: string;

  // Timeline & Workspace
  adjustMediaWidth: string;
  adjustInspectorWidth: string;
  workspaceResizeTip: string;
  adjustTimelineHeight: string;
  play: string;
  pause: string;
  splitClip: string;
  deleteClip: string;
  undo: string;
  redo: string;
  copy: string;
  paste: string;
  duplicateClip: string;
  selectAll: string;
  prevNextFrame: string;
  zoomInOut: string;
  jumpHomeEnd: string;
  windowsCtrlNote: string;
  gotIt: string;

  // Settings & About
  settingsTitle: string;
  languageSelect: string;
  localRenderEngine: string;
  ffmpegReady: string;
  ffmpegNotFound: string;
  selectFfmpegPrompt: string;
  installedFfmpegUsed: string;
  chooseFfmpeg: string;
  chooseFfprobe: string;
  recentProjects: string;
  noRecentProjects: string;
  cloudAndApiServices: string;
  cloudServicesDesc: string;
  about: string;
  ok: string;
  close: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDesc: string;
  aboutDisclaimer: string;

  // Dialogs & Notifications
  recoverTitle: string;
  recoverFound: string;
  recoverHelp: string;
  newEmptyProject: string;
  recoverProject: string;
  recoveredNotification: string;
  audioSeparated: string;
  selectVideoClipError: string;
  crossDissolveAdded: string;
  transitionAdded: string;
  selectTimelineClipFirst: string;
  noValidSubtitles: string;
  audioOnly: string;
  videoOnly: string;

  // Inspector
  inspectorTitle: string;
  noClipSelected: string;
  transform: string;
  positionX: string;
  positionY: string;
  scale: string;
  rotation: string;
  opacity: string;
  flipHorizontal: string;
  flipVertical: string;
  colorAdjustments: string;
  brightness: string;
  contrast: string;
  saturation: string;
  temperature: string;
  blur: string;
  audioSettings: string;
  volume: string;
  fadeIn: string;
  fadeOut: string;
  mute: string;
  textProperties: string;
  textContent: string;
  fontSize: string;
  textColor: string;
  resetAll: string;

  // Assistant
  you: string;
  assistantDefault: string;
  askAssistantPlaceholder: string;
  send: string;
  thinking: string;
  applyChanges: string;
  applied: string;
  discard: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  tr: {
    appTitle: "ReaCut Video Düzenleyici",
    brandEditor: "Editör",
    fileMenu: "Dosya",
    newProject: "Yeni Proje",
    openProject: "Projeyi Aç",
    save: "Kaydet",
    saveAs: "Farklı Kaydet",
    importMedia: "Medya İçe Aktar",
    exportVideo: "Videoyu Dışa Aktar",
    packageMedia: "Proje Medyalarını Paketle…",
    importCapcutDraft: "CapCut Taslak Dosyası İçe Aktar",
    importCapcutFolder: "CapCut Proje Klasörü İçe Aktar",
    experimental: "Deneysel",
    shortcuts: "Kısayollar",
    projectName: "Proje Adı",
    hasUnsavedChanges: "Kaydedilmemiş değişiklikler var",
    saved: "Kaydedildi",
    assistant: "Asistan",
    offline: "Çevrimdışı",
    saveProjectTooltip: "Projeyi Kaydet (Ctrl+S)",
    settings: "Ayarlar",
    exportBtn: "Dışa Aktar",

    tabMedia: "Medya",
    tabAudio: "Ses",
    tabText: "Metin",
    tabSticker: "Çıkartma",
    tabEffect: "Efekt",
    tabTransition: "Geçiş",
    tabSubtitle: "Altyazı",

    adjustMediaWidth: "Medya paneli genişliğini ayarla",
    adjustInspectorWidth: "Özellik paneli genişliğini ayarla",
    workspaceResizeTip: "Genişliği ayarlamak için sürükleyin · Sıfırlamak için çift tıklayın · ← / → İnce ayar",
    adjustTimelineHeight: "Zaman çizelgesi yüksekliğini ayarla",
    play: "Oynat",
    pause: "Duraklat",
    splitClip: "Klibi Böl",
    deleteClip: "Klibi Sil",
    undo: "Geri Al",
    redo: "Yinele",
    copy: "Kopyala",
    paste: "Yapıştır",
    duplicateClip: "Klibi Çoğalt",
    selectAll: "Tümünü Seç",
    prevNextFrame: "Önceki / Sonraki Kare",
    zoomInOut: "Yakınlaştır / Uzaklaştır",
    jumpHomeEnd: "Başa / Sona Git",
    windowsCtrlNote: "Windows üzerinde Ctrl kullanılır",
    gotIt: "Anladım",

    settingsTitle: "Ayarlar ve Son Projeler",
    languageSelect: "Dil (Language / 语言)",
    localRenderEngine: "Yerel Render Motoru",
    ffmpegReady: "FFmpeg Hazır",
    ffmpegNotFound: "FFmpeg / FFprobe Bulunamadı",
    selectFfmpegPrompt: "Lütfen kurulu FFmpeg / FFprobe dosyasını seçin.",
    installedFfmpegUsed: "Sisteminizde kurulu FFmpeg motoru kullanılmaktadır.",
    chooseFfmpeg: "FFmpeg Seç",
    chooseFfprobe: "FFprobe Seç",
    recentProjects: "Son Projeler",
    noRecentProjects: "Kaydedilen veya açılan projeler burada görünür.",
    cloudAndApiServices: "Bulut ve API Servisleri",
    cloudServicesDesc: "Bu sürüm tamamen yerel olarak çalışır.",
    about: "Hakkında",
    ok: "Tamam",
    close: "Kapat",
    aboutTitle: "ReaCut Hakkında",
    aboutSubtitle: "Açık Kaynak Masaüstü Video Düzenleyici",
    aboutDesc: "REA araştırmalarıyla geliştirilen, bağımsız ve açık kaynaklı çevrimdışı masaüstü video düzenleyici. MIT lisansı ile dağıtılmaktadır.",
    aboutDisclaimer: "Bağımsız açık kaynaklı projedir; CapCut/Jianying tescilli kod veya içeriklerini barındırmaz.",

    recoverTitle: "Önceki Projeyi Kurtar",
    recoverFound: "Otomatik kaydedilmiş proje bulundu:",
    recoverHelp: "Kurtardıktan sonra düzenlemeye devam edebilir ve kaydedebilirsiniz.",
    newEmptyProject: "Yeni Boş Proje",
    recoverProject: "Projeyi Kurtar",
    recoveredNotification: "Önceki düzenleme kurtarıldı",
    audioSeparated: "Ses ayrı bir kanala ayrıldı",
    selectVideoClipError: "Lütfen bir video klibi seçin",
    crossDissolveAdded: "sn çapraz geçiş eklendi (sonraki klip örtüşüyor)",
    transitionAdded: "sn geçiş eklendi, geri alınabilir",
    selectTimelineClipFirst: "Önce bir zaman çizelgesi klibi seçin",
    noValidSubtitles: "Altyazı dosyasında geçerli altyazı bulunamadı",
    audioOnly: "Sadece Ses",
    videoOnly: "Sadece Video",

    inspectorTitle: "Özellikler",
    noClipSelected: "Seçili klip yok",
    transform: "Dönüşüm",
    positionX: "Konum X",
    positionY: "Konum Y",
    scale: "Ölçek",
    rotation: "Döndürme",
    opacity: "Opaklık",
    flipHorizontal: "Yatay Çevir",
    flipVertical: "Dikey Çevir",
    colorAdjustments: "Renk Ayarları",
    brightness: "Parlaklık",
    contrast: "Kontrast",
    saturation: "Doygunluk",
    temperature: "Sıcaklık",
    blur: "Bulanıklık",
    audioSettings: "Ses Ayarları",
    volume: "Ses Düzeyi",
    fadeIn: "Girişte Açılma",
    fadeOut: "Çıkışta Kısılma",
    mute: "Sesi Kapat",
    textProperties: "Metin Özellikleri",
    textContent: "Metin İçeriği",
    fontSize: "Yazı Boyutu",
    textColor: "Metin Rengi",
    resetAll: "Sıfırla",

    you: "Siz",
    assistantDefault: "Asistan",
    askAssistantPlaceholder: "Videoda ne yapmak istersiniz?...",
    send: "Gönder",
    thinking: "Düşünülüyor...",
    applyChanges: "Değişiklikleri Uygula",
    applied: "Uygulandı",
    discard: "Vazgeç"
  },
  zh: {
    appTitle: "ReaCut · 映刻视频编辑器",
    brandEditor: "编辑器",
    fileMenu: "文件",
    newProject: "新建项目",
    openProject: "打开项目",
    save: "保存",
    saveAs: "另存为",
    importMedia: "导入素材",
    exportVideo: "导出视频",
    packageMedia: "打包项目素材…",
    importCapcutDraft: "导入剪映草稿文件",
    importCapcutFolder: "导入剪映项目文件夹",
    experimental: "实验性",
    shortcuts: "快捷键",
    projectName: "项目名称",
    hasUnsavedChanges: "有未保存的修改",
    saved: "已保存",
    assistant: "AI 助手",
    offline: "离线",
    saveProjectTooltip: "保存项目 (Ctrl+S)",
    settings: "设置",
    exportBtn: "导出",

    tabMedia: "素材",
    tabAudio: "音频",
    tabText: "文本",
    tabSticker: "贴纸",
    tabEffect: "特效",
    tabTransition: "转场",
    tabSubtitle: "字幕",

    adjustMediaWidth: "调整素材面板宽度",
    adjustInspectorWidth: "调整属性面板宽度",
    workspaceResizeTip: "拖动调整宽度 · 双击重置 · ← / → 微调",
    adjustTimelineHeight: "调整时间线高度",
    play: "播放",
    pause: "暂停",
    splitClip: "分割片段",
    deleteClip: "删除片段",
    undo: "撤销",
    redo: "重做",
    copy: "复制",
    paste: "粘贴",
    duplicateClip: "复制副本",
    selectAll: "全选",
    prevNextFrame: "上一帧 / 下一帧",
    zoomInOut: "放大 / 缩小",
    jumpHomeEnd: "跳转开头 / 结尾",
    windowsCtrlNote: "Windows 使用 Ctrl 键",
    gotIt: "知道了",

    settingsTitle: "设置与最近项目",
    languageSelect: "语言 (Language / Dil)",
    localRenderEngine: "本地渲染引擎",
    ffmpegReady: "FFmpeg 已就绪",
    ffmpegNotFound: "未找到 FFmpeg / FFprobe",
    selectFfmpegPrompt: "请检查或选择已安装的 FFmpeg / FFprobe 文件。",
    installedFfmpegUsed: "使用系统中安装的 FFmpeg 引擎。",
    chooseFfmpeg: "选择 FFmpeg",
    chooseFfprobe: "选择 FFprobe",
    recentProjects: "最近项目",
    noRecentProjects: "保存或打开项目后会出现在这里。",
    cloudAndApiServices: "云端与 API 服务",
    cloudServicesDesc: "此版本完全在本地离线运行。",
    about: "关于",
    ok: "完成",
    close: "关闭",
    aboutTitle: "关于 ReaCut · 映刻",
    aboutSubtitle: "开源桌面视频编辑器",
    aboutDesc: "利用 REA 研究可观察的剪辑流程，以独立代码实现离线编辑。核心源码采用 MIT 许可证。",
    aboutDisclaimer: "非剪映官方产品。不包含剪映的专有代码、库或素材。",

    recoverTitle: "恢复上次编辑",
    recoverFound: "发现本机自动保存的项目：",
    recoverHelp: "恢复后可继续编辑，并另存为项目文件。",
    newEmptyProject: "新建空项目",
    recoverProject: "恢复项目",
    recoveredNotification: "已恢复上次编辑",
    audioSeparated: "音频已分离为独立轨道",
    selectVideoClipError: "请选择一个视频片段",
    crossDissolveAdded: "秒叠化转场已添加（与后续片段重叠）",
    transitionAdded: "秒转场已添加，可撤销",
    selectTimelineClipFirst: "请先选择时间线上的片段",
    noValidSubtitles: "字幕文件中没有有效字幕",
    audioOnly: "仅音频",
    videoOnly: "仅视频",

    inspectorTitle: "属性",
    noClipSelected: "未选择片段",
    transform: "基础变换",
    positionX: "坐标 X",
    positionY: "坐标 Y",
    scale: "缩放",
    rotation: "旋转",
    opacity: "不透明度",
    flipHorizontal: "水平翻转",
    flipVertical: "垂直翻转",
    colorAdjustments: "画面调节",
    brightness: "亮度",
    contrast: "对比度",
    saturation: "饱和度",
    temperature: "色温",
    blur: "模糊",
    audioSettings: "音频属性",
    volume: "音量",
    fadeIn: "淡入",
    fadeOut: "淡出",
    mute: "静音",
    textProperties: "文本属性",
    textContent: "文本内容",
    fontSize: "字号",
    textColor: "颜色",
    resetAll: "重置",

    you: "您",
    assistantDefault: "AI 助手",
    askAssistantPlaceholder: "想如何剪辑这段视频？...",
    send: "发送",
    thinking: "正在思考...",
    applyChanges: "应用修改",
    applied: "已应用",
    discard: "放弃"
  },
  en: {
    appTitle: "ReaCut Video Editor",
    brandEditor: "Editor",
    fileMenu: "File",
    newProject: "New Project",
    openProject: "Open Project",
    save: "Save",
    saveAs: "Save As",
    importMedia: "Import Media",
    exportVideo: "Export Video",
    packageMedia: "Package Project Media…",
    importCapcutDraft: "Import CapCut Draft File",
    importCapcutFolder: "Import CapCut Project Folder",
    experimental: "Experimental",
    shortcuts: "Shortcuts",
    projectName: "Project Name",
    hasUnsavedChanges: "Unsaved changes",
    saved: "Saved",
    assistant: "Assistant",
    offline: "Offline",
    saveProjectTooltip: "Save Project (Ctrl+S)",
    settings: "Settings",
    exportBtn: "Export",

    tabMedia: "Media",
    tabAudio: "Audio",
    tabText: "Text",
    tabSticker: "Stickers",
    tabEffect: "Effects",
    tabTransition: "Transitions",
    tabSubtitle: "Subtitles",

    adjustMediaWidth: "Adjust media panel width",
    adjustInspectorWidth: "Adjust inspector panel width",
    workspaceResizeTip: "Drag to adjust width · Double-click to reset · ← / → Fine-tune",
    adjustTimelineHeight: "Adjust timeline height",
    play: "Play",
    pause: "Pause",
    splitClip: "Split Clip",
    deleteClip: "Delete Clip",
    undo: "Undo",
    redo: "Redo",
    copy: "Copy",
    paste: "Paste",
    duplicateClip: "Duplicate Clip",
    selectAll: "Select All",
    prevNextFrame: "Prev / Next Frame",
    zoomInOut: "Zoom In / Out",
    jumpHomeEnd: "Jump to Start / End",
    windowsCtrlNote: "Ctrl is used on Windows",
    gotIt: "Got It",

    settingsTitle: "Settings & Recent Projects",
    languageSelect: "Language (Dil / 语言)",
    localRenderEngine: "Local Render Engine",
    ffmpegReady: "FFmpeg Ready",
    ffmpegNotFound: "FFmpeg / FFprobe Not Found",
    selectFfmpegPrompt: "Please verify or select your installed FFmpeg / FFprobe executable.",
    installedFfmpegUsed: "Using FFmpeg engine installed on your system.",
    chooseFfmpeg: "Select FFmpeg",
    chooseFfprobe: "Select FFprobe",
    recentProjects: "Recent Projects",
    noRecentProjects: "Saved or opened projects will appear here.",
    cloudAndApiServices: "Cloud & API Services",
    cloudServicesDesc: "This version runs entirely locally offline.",
    about: "About",
    ok: "Done",
    close: "Close",
    aboutTitle: "About ReaCut",
    aboutSubtitle: "Open Source Desktop Video Editor",
    aboutDesc: "An independent, open-source offline desktop video editor developed with REA workflows. Distributed under the MIT License.",
    aboutDisclaimer: "Not an official CapCut product. Does not distribute proprietary code, libraries, or assets.",

    recoverTitle: "Recover Previous Project",
    recoverFound: "Autosaved project found:",
    recoverHelp: "You can continue editing and save as a project file after recovery.",
    newEmptyProject: "New Empty Project",
    recoverProject: "Recover Project",
    recoveredNotification: "Recovered previous edit",
    audioSeparated: "Audio separated into a dedicated track",
    selectVideoClipError: "Please select a video clip",
    crossDissolveAdded: "s cross-dissolve added (overlaps next clip)",
    transitionAdded: "s transition added, undoable",
    selectTimelineClipFirst: "Select a timeline clip first",
    noValidSubtitles: "No valid subtitles found in file",
    audioOnly: "Audio Only",
    videoOnly: "Video Only",

    inspectorTitle: "Properties",
    noClipSelected: "No clip selected",
    transform: "Transform",
    positionX: "Position X",
    positionY: "Position Y",
    scale: "Scale",
    rotation: "Rotation",
    opacity: "Opacity",
    flipHorizontal: "Flip Horizontal",
    flipVertical: "Flip Vertical",
    colorAdjustments: "Color Adjustments",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    temperature: "Temperature",
    blur: "Blur",
    audioSettings: "Audio Settings",
    volume: "Volume",
    fadeIn: "Fade In",
    fadeOut: "Fade Out",
    mute: "Mute",
    textProperties: "Text Properties",
    textContent: "Text Content",
    fontSize: "Font Size",
    textColor: "Text Color",
    resetAll: "Reset",

    you: "You",
    assistantDefault: "Assistant",
    askAssistantPlaceholder: "How would you like to edit this video?...",
    send: "Send",
    thinking: "Thinking...",
    applyChanges: "Apply Changes",
    applied: "Applied",
    discard: "Discard"
  }
};

const STORAGE_KEY = "reacut_language";

export function getInitialLanguage(): SupportedLanguage {
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  if (saved === "tr" || saved === "zh" || saved === "en") return saved;
  // Default to Turkish as per user profile preferences
  return "tr";
}

interface LanguageState {
  language: SupportedLanguage;
  t: Translations;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageState>((set) => {
  const initial = getInitialLanguage();
  return {
    language: initial,
    t: translations[initial],
    setLanguage: (lang: SupportedLanguage) => {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {}
      set({ language: lang, t: translations[lang] });
    }
  };
});
