import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  AudioLines,
  Camera,
  Check,
  ChevronDown,
  CloudRain,
  Copy,
  Image as ImageIcon,
  Leaf,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
  Volume2,
  X,
  Cloud,
  LogIn,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  auth,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  validateFirestoreConnection,
  type User,
} from "@/lib/firebase";
import {
  saveCloudCropLog,
  updateCloudCropLogStatus,
  syncUserProfile,
  syncLocalAndCloudLogs,
} from "@/lib/crop-sync";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DIAGNOSIS_ESCALATION_THRESHOLD,
  diseaseSamples,
  getOfflineAnswer,
  needsExpertReview,
  type CropLogEntry,
  type DiseaseSample,
} from "@/lib/agri-data";
import {
  SUPPORTED_LANGUAGES,
  translations,
  type LanguageCode,
  type TranslationDictionary,
} from "@/lib/i18n";
import { classifyLeaf } from "@/lib/crop-model";

import farmScene from "@/assets/assam-farm-scene.jpg";
import logoSvg from "@/assets/agrisathi-minimal-logo.svg";
import avatarGreeting from "@/assets/sathi-greeting.png";
import avatarInspecting from "@/assets/sathi-inspecting.png";
import avatarExcited from "@/assets/sathi-excited.png";
import avatarTablet from "@/assets/sathi-tablet.png";
import avatarCelebrating from "@/assets/sathi-celebrating.png";
import avatarThinking from "@/assets/sathi-thinking.png";
import avatarIcon from "@/assets/sathi-avatar.png";
import { registerAgriSathiOffline } from "@/lib/pwa-registration";

type View = "chat" | "analyzer" | "voice";
type Pose =
  "greeting" | "inspecting" | "excited" | "tablet" | "celebrating" | "thinking" | "avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
  source?: "gemini-3.8-flash" | "offline-dataset";
}

const poseAssets: Record<Pose, { url: string; alt: string }> = {
  greeting: {
    url: avatarGreeting,
    alt: "Sathi, the AgriSathi farmer companion, greeting with a warm wave",
  },
  inspecting: {
    url: avatarInspecting,
    alt: "Sathi inspecting a crop seedling with a magnifying glass",
  },
  excited: { url: avatarExcited, alt: "Sathi celebrating a confident crop diagnosis" },
  tablet: { url: avatarTablet, alt: "Sathi pointing at his crop advice tablet" },
  celebrating: { url: avatarCelebrating, alt: "Sathi cheering for a healthy crop yield" },
  thinking: { url: avatarThinking, alt: "Sathi carefully evaluating an uncertain leaf condition" },
  avatar: { url: avatarIcon, alt: "Sathi agricultural icon" },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriSathi AI — Your Assam Farm Companion" },
      {
        name: "description",
        content:
          "Practical crop-care guidance, offline leaf checks with TensorFlow.js, and a multilingual voice companion for farmers in Assam.",
      },
      { property: "og:title", content: "AgriSathi AI — Your Assam Farm Companion" },
      {
        property: "og:description",
        content:
          "Practical crop-care guidance, offline leaf checks with TensorFlow.js, and a multilingual voice companion for farmers in Assam.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgriSathiApp,
});

function MascotAvatar({
  pose,
  className = "",
  alt,
}: {
  pose: Pose;
  className?: string;
  alt?: string;
}) {
  const asset = poseAssets[pose] || poseAssets.greeting;
  return (
    <div className={`mascot-container ${className}`}>
      <img
        className="mascot-image"
        src={asset.url}
        alt={alt || asset.alt}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function AgriSathiApp() {
  const [view, setView] = useState<View>("chat");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [log, setLog] = useState<CropLogEntry[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiseaseSample | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [remedyTab, setRemedyTab] = useState<"organic" | "chemical" | "prevention">("organic");
  const [recording, setRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [micSupported, setMicSupported] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justSavedLog, setJustSavedLog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<LanguageCode>(language);
  const recognitionRef = useRef<{
    stop: () => void;
    onresult: ((event: unknown) => void) | null;
    onend: (() => void) | null;
  } | null>(null);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const t: TranslationDictionary = translations[language] || translations.en;

  // Initialize initial welcome messages in current language
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "initial-assistant",
          role: "assistant",
          text:
            language === "as"
              ? "নমস্কাৰ! মই কৃষি সাথী। অসমৰ শস্য ৰোগ, বতৰৰ তথ্য, সাৰৰ মাত্ৰা বা বানপানী সহনশীল খেতিৰ বিষয়ে যিকোনো প্ৰশ্ন মোক সোধক।"
              : language === "bn"
                ? "নমস্কার! আমি কৃষি সাথী। আসামের ফসলের রোগ, আবহাওয়া, সার প্রয়োগ ও উন্নত চাষাবাদ সম্পর্কে যেকোনো প্রশ্ন আমাকে করতে পারেন।"
                : language === "brx"
                  ? "Namaste! Ang AgriSathi. Assamni dhaan kheti, fertilizer dose aro pest management ni swlw."
                  : "Namaste! I am AgriSathi, your agricultural advisor for Assam. Ask me about crop diseases, weather conditions in Kamrup, fertilizer doses, or upload a leaf photo to diagnose symptoms.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "offline-dataset",
        },
      ]);
    }
  }, [language, messages.length]);

  useEffect(() => {
    void registerAgriSathiOffline();
    void validateFirestoreConnection();
    setMicSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    const viewport = window.visualViewport;
    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${viewport?.height ?? window.innerHeight}px`,
      );
    };
    syncHeight();
    viewport?.addEventListener("resize", syncHeight);
    window.addEventListener("resize", syncHeight);

    try {
      const stored = localStorage.getItem("agrisathi-crop-log");
      if (stored) setLog(JSON.parse(stored) as CropLogEntry[]);
      const savedLanguage = localStorage.getItem("agrisathi-language") as LanguageCode | null;
      if (savedLanguage && SUPPORTED_LANGUAGES.some((option) => option.code === savedLanguage)) {
        setLanguage(savedLanguage);
      }
    } catch {
      setLog([]);
    }

    const syncNetwork = () => setOnline(navigator.onLine);
    syncNetwork();
    window.addEventListener("online", syncNetwork);
    window.addEventListener("offline", syncNetwork);

    // Subscribe to Firebase Auth and auto-sync logs
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          await syncUserProfile(user.uid, user.displayName, languageRef.current);
          const currentLog = (() => {
            try {
              const s = localStorage.getItem("agrisathi-crop-log");
              return s ? (JSON.parse(s) as CropLogEntry[]) : [];
            } catch {
              return [];
            }
          })();
          const merged = await syncLocalAndCloudLogs(user.uid, currentLog);
          setLog(merged);
          try {
            localStorage.setItem(
              "agrisathi-crop-log",
              JSON.stringify(merged.map(({ imageUrl: _imageUrl, ...rest }) => rest)),
            );
          } catch {
            /* ignore */
          }
        } catch (err) {
          console.warn("Background cloud log sync:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => {
      viewport?.removeEventListener("resize", syncHeight);
      window.removeEventListener("resize", syncHeight);
      document.documentElement.style.removeProperty("--app-height");
      window.removeEventListener("online", syncNetwork);
      window.removeEventListener("offline", syncNetwork);
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  function changeLanguage(code: LanguageCode) {
    setLanguage(code);
    try {
      localStorage.setItem("agrisathi-language", code);
    } catch {
      /* ignore */
    }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langOpt = SUPPORTED_LANGUAGES.find((opt) => opt.code === language);
    utterance.lang = langOpt?.speechLocale ?? "en-IN";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  function copyText(id: string, text: string) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function startRecognition(onText: (text: string) => void) {
    const browser = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceTranscript(t.voiceFallbackAlert);
      return;
    }
    const recognition = new Recognition();
    const langOpt = SUPPORTED_LANGUAGES.find((opt) => opt.code === language);
    recognition.lang = langOpt?.speechLocale ?? "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const resultEvent = event as { results: ArrayLike<ArrayLike<{ transcript: string }>> };
      const transcript = Array.from(resultEvent.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setVoiceTranscript(transcript);
        onText(transcript);
      }
    };
    recognition.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setRecording(false);
      setVoiceTranscript(t.voiceFallbackAlert);
    };
    recognitionRef.current = recognition;
    setRecording(true);
    recognition.start();
  }

  async function submitQuestion(text = question) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: now,
    };

    setMessages((existing) => [...existing, userMsg]);
    setQuestion("");
    setIsAiThinking(true);

    // Scroll down to newly added user message
    window.setTimeout(() => {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 40);

    let answerText = "";
    let source: "gemini-3.8-flash" | "offline-dataset" = "offline-dataset";

    try {
      if (navigator.onLine) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, language }),
        });
        if (response.ok) {
          const data = (await response.json()) as {
            answer?: string;
            source?: "gemini-3.8-flash" | "offline-dataset";
          };
          if (data.answer) {
            answerText = data.answer;
            source = data.source || "gemini-3.8-flash";
          }
        }
      }
    } catch (err) {
      console.warn("Server chat fetch failed, falling back to local rule-based advisor:", err);
    }

    if (!answerText) {
      answerText = getOfflineAnswer(trimmed, language);
      source = "offline-dataset";
    }

    setIsAiThinking(false);
    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source,
    };

    setMessages((existing) => [...existing, assistantMsg]);

    window.setTimeout(() => {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setSelectedDiagnosis(null);
    setDiagnosing(true);
    const result = await classifyLeaf(file);
    setSelectedDiagnosis(result.diagnosis);
    setSimulated(result.simulated);
    setDiagnosing(false);
  }

  function chooseSample(sample: DiseaseSample) {
    setSelectedFile(null);
    setSelectedDiagnosis(sample);
    setSimulated(false);
  }

  async function handleSignIn() {
    try {
      setIsSyncing(true);
      const user = await loginWithGoogle();
      setCurrentUser(user);
      await syncUserProfile(user.uid, user.displayName, language);
      const merged = await syncLocalAndCloudLogs(user.uid, log);
      setLog(merged);
      try {
        localStorage.setItem(
          "agrisathi-crop-log",
          JSON.stringify(merged.map(({ imageUrl: _imageUrl, ...rest }) => rest)),
        );
      } catch {
        /* ignore */
      }
    } catch (err) {
      console.warn("Google sign in cancelled or failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleSignOut() {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err) {
      console.warn("Sign out failed:", err);
    }
  }

  function saveDiagnosis() {
    if (!selectedDiagnosis) return;
    const entry: CropLogEntry = {
      ...selectedDiagnosis,
      id: `${selectedDiagnosis.id}-${Date.now()}`,
      ...(photoUrl ? { imageUrl: photoUrl } : {}),
      status: "Under Treatment",
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...log];
    setLog(updated);
    try {
      localStorage.setItem(
        "agrisathi-crop-log",
        JSON.stringify(updated.map(({ imageUrl: _imageUrl, ...rest }) => rest)),
      );
    } catch {
      /* ignore */
    }
    if (currentUser) {
      void saveCloudCropLog(currentUser.uid, entry).catch((err) =>
        console.warn("Cloud save failed:", err),
      );
    }
    setJustSavedLog(true);
    setTimeout(() => setJustSavedLog(false), 2500);
  }

  function updateStatus(id: string, status: CropLogEntry["status"]) {
    const updated = log.map((entry) => (entry.id === id ? { ...entry, status } : entry));
    setLog(updated);
    try {
      localStorage.setItem(
        "agrisathi-crop-log",
        JSON.stringify(updated.map(({ imageUrl: _imageUrl, ...rest }) => rest)),
      );
    } catch {
      /* ignore */
    }
    if (currentUser) {
      void updateCloudCropLogStatus(currentUser.uid, id, status).catch((err) =>
        console.warn("Cloud status update failed:", err),
      );
    }
  }

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div
          className="topbar-brand"
          onClick={() => setView("chat")}
          role="button"
          tabIndex={0}
          aria-label="Go to AgriSathi home"
        >
          <img src={logoSvg} alt="AgriSathi Minimalist Logo" className="topbar-logo" />
          <div className="brand-title">
            <span>AgriSathi</span>
            <span className="brand-ai-badge">AI</span>
            <span className="brand-subtitle-lang">{t.appSubtitle}</span>
          </div>
        </div>

        {/* Tools: Language Selector + Connectivity + Auth + Hamburger */}
        <div className="topbar-tools">
          <label className="lang-selector" aria-label="Select Interface Language">
            <select
              value={language}
              onChange={(event) => changeLanguage(event.target.value as LanguageCode)}
              aria-label="Choose language"
            >
              {SUPPORTED_LANGUAGES.map((opt) => (
                <option value={opt.code} key={opt.code}>
                  {opt.native} ({opt.short})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="text-muted-foreground pointer-events-none" />
          </label>

          <div className="connectivity-badge" title={online ? t.statusOnline : t.statusOffline}>
            <span className={`connectivity-dot ${online ? "" : "offline"}`} />
            <span>{online ? t.statusOnline : t.statusOffline}</span>
          </div>

          {/* User Auth Profile / Login Button */}
          {currentUser ? (
            <div
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-secondary/80 border border-border rounded-full text-xs font-semibold text-foreground cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setSettingsOpen(true)}
              title={`${t.authSignedInAs || "Signed in as"} ${currentUser.displayName || currentUser.email || "Farmer"}`}
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User avatar"}
                  className="w-5 h-5 rounded-full object-cover border border-primary/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary grid place-items-center text-[10px] font-bold">
                  {(currentUser.displayName || currentUser.email || "F")[0].toUpperCase()}
                </div>
              )}
              <span className="max-w-[100px] truncate text-primary font-medium">
                {currentUser.displayName?.split(" ")[0] || "Farmer"}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse"
                title="Cloud Sync Active"
              />
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold h-8 rounded-full border-border bg-card hover:bg-secondary text-primary"
              onClick={handleSignIn}
              disabled={isSyncing}
            >
              <LogIn size={13} />
              <span>{isSyncing ? "..." : t.authSignIn || "Sign In"}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-card">
          <SheetHeader className="p-4 border-b border-border text-left flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoSvg} alt="AgriSathi Logo" className="h-9 w-9 object-contain" />
              <div>
                <SheetTitle className="text-base font-bold text-deep">AgriSathi AI</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {t.tagline}
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </Button>
          </SheetHeader>

          {/* Drawer Nav Items */}
          <div className="p-3 flex flex-col gap-1.5 border-b border-border">
            <button
              type="button"
              className={`sidebar-nav-btn ${view === "chat" ? "active" : ""}`}
              onClick={() => {
                setView("chat");
                setMenuOpen(false);
              }}
            >
              <div className="sidebar-nav-icon">
                <MessageSquare size={16} />
              </div>
              <span>{t.navChat}</span>
            </button>
            <button
              type="button"
              className={`sidebar-nav-btn ${view === "analyzer" ? "active" : ""}`}
              onClick={() => {
                setView("analyzer");
                setMenuOpen(false);
              }}
            >
              <div className="sidebar-nav-icon">
                <ImageIcon size={16} />
              </div>
              <span>{t.navAnalyzer}</span>
            </button>
            <button
              type="button"
              className={`sidebar-nav-btn ${view === "voice" ? "active" : ""}`}
              onClick={() => {
                setView("voice");
                setMenuOpen(false);
              }}
            >
              <div className="sidebar-nav-icon">
                <Mic size={16} />
              </div>
              <span>{t.navVoice}</span>
            </button>
            <button
              type="button"
              className="sidebar-nav-btn"
              onClick={() => {
                setLogOpen(true);
                setMenuOpen(false);
              }}
            >
              <div className="sidebar-nav-icon">
                <Activity size={16} />
              </div>
              <div className="flex items-center justify-between flex-1">
                <span>{t.navLog}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-mono">
                  {log.length}
                </span>
              </div>
            </button>
          </div>

          {/* Drawer Weather & Widgets */}
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarWidgets
              t={t}
              log={log}
              onOpenLog={() => {
                setLogOpen(true);
                setMenuOpen(false);
              }}
            />
          </div>

          {/* Drawer Footer with Auth & Settings */}
          <div className="p-3 border-t border-border mt-auto flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 bg-secondary/80 rounded-lg">
                <div className="flex items-center gap-2 truncate">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-primary/30"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-soft-mint text-primary text-xs font-bold grid place-items-center">
                      {(currentUser.displayName || currentUser.email || "F")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="text-xs font-bold text-foreground truncate">
                      {currentUser.displayName || "Farmer"}
                    </div>
                    <div className="text-[10px] text-leaf font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-leaf" />
                      <span>{t.authCloudSynced}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                  title={t.authSignOut}
                >
                  <LogOut size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-primary"
                onClick={handleSignIn}
                disabled={isSyncing}
              >
                <LogIn size={14} />
                <span>{isSyncing ? "..." : t.authSignIn || "Sign In"}</span>
              </Button>
            )}
            <button
              type="button"
              className="sidebar-nav-btn text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSettingsOpen(true);
                setMenuOpen(false);
              }}
            >
              <div className="sidebar-nav-icon bg-muted text-muted-foreground">
                <Settings size={15} />
              </div>
              <span className="text-xs">{t.navSettings}</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Workspace */}
      <div className="workspace">
        {/* Desktop Persistent Left Sidebar */}
        <aside className="scenic-sidebar hidden lg:flex">
          <div className="sidebar-scroll">
            <div className="sidebar-section-kicker">{t.sidebarKicker}</div>

            {/* Main View Navigation Links */}
            <nav className="sidebar-nav-group" aria-label="Desktop primary navigation">
              <button
                type="button"
                className={`sidebar-nav-btn ${view === "chat" ? "active" : ""}`}
                onClick={() => setView("chat")}
                aria-current={view === "chat" ? "page" : undefined}
              >
                <div className="sidebar-nav-icon">
                  <MessageSquare size={16} />
                </div>
                <span>{t.navChat}</span>
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${view === "analyzer" ? "active" : ""}`}
                onClick={() => setView("analyzer")}
                aria-current={view === "analyzer" ? "page" : undefined}
              >
                <div className="sidebar-nav-icon">
                  <ImageIcon size={16} />
                </div>
                <span>{t.navAnalyzer}</span>
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${view === "voice" ? "active" : ""}`}
                onClick={() => setView("voice")}
                aria-current={view === "voice" ? "page" : undefined}
              >
                <div className="sidebar-nav-icon">
                  <Mic size={16} />
                </div>
                <span>{t.navVoice}</span>
              </button>
            </nav>

            {/* Sidebar Weather, Log & Agro Context */}
            <SidebarWidgets t={t} log={log} onOpenLog={() => setLogOpen(true)} />

            {/* Settings Trigger */}
            <button
              type="button"
              className="sidebar-nav-btn text-muted-foreground hover:text-foreground mt-auto"
              onClick={() => setSettingsOpen(true)}
            >
              <div className="sidebar-nav-icon bg-muted text-muted-foreground">
                <Settings size={15} />
              </div>
              <span className="text-xs">{t.navSettings}</span>
            </button>
          </div>

          {/* Authentic Assam Landscape Scenic Anchor */}
          <div className="sidebar-scenic-frame">
            <img
              src={farmScene}
              alt="Assam tea valleys and agricultural landscape"
              className="sidebar-scenic-art"
              loading="lazy"
            />
            <div className="sidebar-scenic-caption">
              <span>Rangia, Kamrup District</span>
              <span className="text-[10px] text-leaf font-mono">Assam Agro Zone</span>
            </div>
          </div>
        </aside>

        {/* Central Workspace Main Area */}
        <main className="main-area">
          {view === "chat" && (
            <ChatView
              messages={messages}
              question={question}
              setQuestion={setQuestion}
              onSubmit={submitQuestion}
              onSpeak={speak}
              onCopy={copyText}
              copiedId={copiedId}
              isAiThinking={isAiThinking}
              onMic={() => startRecognition((text) => setQuestion(text))}
              micSupported={micSupported}
              onUpload={() => {
                setView("analyzer");
                window.requestAnimationFrame(() => uploadRef.current?.click());
              }}
              inputRef={inputRef}
              chatScrollRef={chatScrollRef}
              t={t}
              onQuickQuestion={(q) => submitQuestion(q)}
            />
          )}

          {view === "analyzer" && (
            <AnalyzerView
              diagnosis={selectedDiagnosis}
              photoUrl={photoUrl}
              diagnosing={diagnosing}
              simulated={simulated}
              remedyTab={remedyTab}
              setRemedyTab={setRemedyTab}
              uploadRef={uploadRef}
              onUpload={handleImage}
              onSample={chooseSample}
              onSave={saveDiagnosis}
              onSpeak={speak}
              onOpenLog={() => setLogOpen(true)}
              t={t}
              language={language}
              justSavedLog={justSavedLog}
            />
          )}

          {view === "voice" && (
            <VoiceView
              onBack={() => setView("chat")}
              language={language}
              setLanguage={changeLanguage}
              recording={recording}
              transcript={voiceTranscript}
              onMic={() =>
                recording
                  ? recognitionRef.current?.stop()
                  : startRecognition((text) => setVoiceTranscript(text))
              }
              onSpeak={speak}
              t={t}
            />
          )}
        </main>
      </div>

      {/* Crop Log Dialog */}
      <CropLogDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        entries={log}
        onStatus={updateStatus}
        currentUser={currentUser}
        t={t}
      />

      {/* Settings / Region Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        language={language}
        onLanguageChange={changeLanguage}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
        t={t}
      />
    </div>
  );
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function SidebarWidgets({
  t,
  log,
  onOpenLog,
}: {
  t: TranslationDictionary;
  log: CropLogEntry[];
  onOpenLog: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Weather & Disease Risk Card */}
      <section className="weather-card" aria-label="Local weather and disease advisory">
        <div className="weather-header">
          <div className="weather-title">
            <CloudRain size={16} className="text-primary" />
            <span>{t.weatherTitle}</span>
          </div>
          <div className="weather-loc-tag">
            <MapPin size={12} />
            <span>{t.weatherLocation}</span>
          </div>
        </div>

        <div className="weather-main-row">
          <div className="weather-temp">27°C</div>
          <div className="weather-meta-col">
            <span>{t.weatherHumidity}</span>
            <span>{t.weatherRainForecast}</span>
          </div>
        </div>

        <div className="weather-risk-box">
          <strong>{t.weatherRiskTitle}:</strong> {t.weatherRiskText}
        </div>
      </section>

      {/* Crop Health Log Action Card */}
      <section
        className="crop-log-card"
        onClick={onOpenLog}
        role="button"
        tabIndex={0}
        aria-label="Open Crop Health Log"
      >
        <div className="crop-log-info">
          <div className="crop-log-icon">
            <Leaf size={17} />
          </div>
          <div className="crop-log-text">
            <span className="crop-log-label">{t.navLog}</span>
            <span className="crop-log-sub">
              {log.length} {t.logRecordsTracked}
            </span>
          </div>
        </div>
        <ArrowUpRight size={16} className="text-muted-foreground" />
      </section>
    </div>
  );
}

function MessageBody({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: Array<{ type: "paragraph" | "list"; lines: string[] }> = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph });
    paragraph = [];
  };
  const flushBullets = () => {
    if (bullets.length) blocks.push({ type: "list", lines: bullets });
    bullets = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(?:[•*-]|\d+[.)])\s+/.test(trimmed)) {
      flushParagraph();
      bullets.push(trimmed.replace(/^(?:[•*-]|\d+[.)])\s+/, ""));
    } else if (!trimmed) {
      flushParagraph();
      flushBullets();
    } else {
      flushBullets();
      paragraph.push(trimmed);
    }
  }
  flushParagraph();
  flushBullets();

  return (
    <div className="assistant-content">
      {blocks.map((block, idx) =>
        block.type === "list" ? (
          <ul key={idx}>
            {block.lines.map((bullet, bIdx) => (
              <li key={bIdx}>{bullet}</li>
            ))}
          </ul>
        ) : (
          <p key={idx}>{block.lines.join(" ")}</p>
        ),
      )}
    </div>
  );
}

function ChatView({
  messages,
  question,
  setQuestion,
  onSubmit,
  onSpeak,
  onCopy,
  copiedId,
  isAiThinking,
  onMic,
  micSupported,
  onUpload,
  inputRef,
  chatScrollRef,
  t,
  onQuickQuestion,
}: {
  messages: Message[];
  question: string;
  setQuestion: (val: string) => void;
  onSubmit: (val?: string) => void;
  onSpeak: (text: string) => void;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
  isAiThinking: boolean;
  onMic: () => void;
  micSupported: boolean;
  onUpload: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  t: TranslationDictionary;
  onQuickQuestion: (val: string) => void;
}) {
  const quickPrompts = [
    {
      title: t.promptCropsTitle,
      icon: <Sprout size={16} />,
      query: t.promptCropsQuery,
    },
    {
      title: t.promptDiseaseTitle,
      icon: <Leaf size={16} />,
      query: t.promptDiseaseQuery,
    },
    {
      title: t.promptFertilizerTitle,
      icon: <Sparkles size={16} />,
      query: t.promptFertilizerQuery,
    },
    {
      title: t.promptWeatherTitle,
      icon: <CloudRain size={16} />,
      query: t.promptWeatherQuery,
    },
  ];

  return (
    <div className="chat-screen">
      <div
        className="chat-scroll-container"
        ref={chatScrollRef}
        role="log"
        aria-label="Conversation Transcript"
      >
        {/* Welcome Section */}
        <section className="welcome-hero">
          <div className="welcome-mascot-wrap">
            <div className="welcome-mascot-halo" />
            <MascotAvatar pose="greeting" className="welcome-mascot-img" />
          </div>
          <div className="welcome-kicker">{t.welcomeKicker}</div>
          <h1 className="welcome-heading">
            {t.welcomeHeading1}{" "}
            <span className="welcome-heading-highlight">{t.welcomeHeadingHighlight}</span>{" "}
            {t.welcomeHeading2}
          </h1>
          <p className="welcome-subtitle">{t.welcomeSubtitle}</p>

          {/* Quick Prompts (4 Contextual Cards) */}
          <div
            className="welcome-quick-pills"
            role="region"
            aria-label="Suggested Agricultural Questions"
          >
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-prompt-card"
                onClick={() => onQuickQuestion(item.query)}
              >
                <div className="quick-prompt-icon">{item.icon}</div>
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Conversation Transcript */}
        <div className="chat-messages">
          {messages.map((message) =>
            message.role === "user" ? (
              <div className="message-row user-row" key={message.id}>
                <div className="user-bubble">
                  {message.text}
                  {message.timestamp && (
                    <div className="text-[10px] text-muted-foreground mt-1 text-right">
                      {message.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="message-row assistant-row" key={message.id}>
                <div className="assistant-avatar-wrap">
                  <img src={avatarIcon} alt="AgriSathi avatar" className="assistant-avatar-img" />
                </div>
                <div className="assistant-bubble">
                  <div className="assistant-header">
                    <div className="assistant-name-group">
                      <span className="assistant-author-title">AgriSathi AI</span>
                      <span className="assistant-author-badge">
                        ·{" "}
                        {message.source === "gemini-3.8-flash"
                          ? "Gemini 3.8 Flash"
                          : "Assam Field Model"}
                      </span>
                    </div>
                    <div className="assistant-actions">
                      <button
                        type="button"
                        className="assistant-action-btn"
                        title={t.chatListen}
                        aria-label={t.chatListen}
                        onClick={() => onSpeak(message.text)}
                      >
                        <Volume2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="assistant-action-btn"
                        title={copiedId === message.id ? t.chatCopied : t.chatCopy}
                        aria-label={t.chatCopy}
                        onClick={() => onCopy(message.id, message.text)}
                      >
                        {copiedId === message.id ? (
                          <Check size={14} className="text-primary" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  <MessageBody text={message.text} />
                  {message.timestamp && (
                    <div className="text-[10px] text-muted-foreground self-end">
                      {message.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}

          {/* AI Thinking Animation */}
          {isAiThinking && (
            <div className="message-row assistant-row">
              <div className="assistant-avatar-wrap">
                <img src={avatarIcon} alt="AgriSathi thinking" className="assistant-avatar-img" />
              </div>
              <div className="assistant-bubble">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw size={14} className="animate-spin text-primary" />
                  <span>{t.chatThinking}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Anchored Message Composer */}
      <section className="chat-composer-section">
        <form
          className="chat-composer-box"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <button
            type="button"
            className="composer-action-btn"
            title="Upload leaf photo"
            aria-label="Upload crop image"
            onClick={onUpload}
          >
            <Plus size={20} />
          </button>

          <button
            type="button"
            className="composer-action-btn"
            title="Camera leaf inspection"
            aria-label="Camera leaf inspection"
            onClick={onUpload}
          >
            <Camera size={19} />
          </button>

          <button
            type="button"
            className={`composer-action-btn ${micSupported ? "text-primary" : "opacity-40 cursor-not-allowed"}`}
            title={micSupported ? "Ask with voice" : "Speech recognition unavailable"}
            disabled={!micSupported}
            aria-label="Voice input"
            onClick={onMic}
          >
            <Mic size={19} />
          </button>

          <input
            ref={inputRef}
            type="text"
            className="composer-input"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={t.chatPlaceholder}
            aria-label={t.chatPlaceholder}
          />

          <button
            type="submit"
            className="composer-send-btn"
            disabled={!question.trim() || isAiThinking}
            aria-label={t.chatSend}
          >
            <Send size={16} />
          </button>
        </form>

        <div className="composer-disclaimer">
          <ShieldCheck size={13} className="text-primary shrink-0" />
          <span>{t.chatDisclaimer}</span>
        </div>
      </section>
    </div>
  );
}

function AnalyzerView({
  diagnosis,
  photoUrl,
  diagnosing,
  simulated: _simulated,
  remedyTab,
  setRemedyTab,
  uploadRef,
  onUpload,
  onSample,
  onSave,
  onSpeak,
  onOpenLog,
  t,
  language,
  justSavedLog,
}: {
  diagnosis: DiseaseSample | null;
  photoUrl: string | null;
  diagnosing: boolean;
  simulated: boolean;
  remedyTab: "organic" | "chemical" | "prevention";
  setRemedyTab: (tab: "organic" | "chemical" | "prevention") => void;
  uploadRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSample: (sample: DiseaseSample) => void;
  onSave: () => void;
  onSpeak: (text: string) => void;
  onOpenLog: () => void;
  t: TranslationDictionary;
  language: LanguageCode;
  justSavedLog: boolean;
}) {
  const pose: Pose = diagnosis?.healthy
    ? "celebrating"
    : diagnosis && needsExpertReview(diagnosis.confidence)
      ? "thinking"
      : diagnosis
        ? "excited"
        : "inspecting";

  const triggerFileInput = () => uploadRef.current?.click();

  // Multi-lingual treatment protocol mapping
  const adviceContent = {
    organic: diagnosis
      ? diagnosis.healthy
        ? language === "as"
          ? "শস্যৰ স্বাস্থ্য উত্তম অৱস্থাত আছে। মাটিৰ উৰ্বৰতা বৃদ্ধিৰ বাবে বিঘাই প্ৰতি ২ টন পচন সাৰ দিয়ক আৰু ১৫ দিনৰ অন্তৰে অন্তৰে জীৱামৃত স্প্ৰে কৰক।"
          : language === "bn"
            ? "ফসল পুরোপুরি সুস্থ। মাটির উর্বরতা ধরে রাখতে প্রতি বিঘায় ২ টন পচা গোবর সার বা কেঁচো সার দিন এবং ১৫ দিন পরপর জীবামৃত স্প্রে করুন।"
            : "Your crop foliage looks vigorous. Maintain soil biology by applying well-decomposed farmyard compost or vermicompost (2 tonnes/bigha). Spray Jeevamrit every 15 days to encourage beneficial soil microbes."
        : language === "as"
          ? `${diagnosis.crop}ৰ ${diagnosis.disease} প্ৰতিৰোধৰ বাবে ৫% নিম বীজৰ নিষ্কাশন (NSKE) বা কোল্ড-প্ৰেছড নিম তেল (৫ মি.লি./লিটাৰ পানী) ব্যৱহাৰ কৰক। ট্ৰাইক'ডাৰ্মা ভিৰিডি (১০ গ্ৰাম/লিটাৰ) প্ৰয়োগ কৰিলে ভেঁকুৰ সংক্ৰমণ নিয়ন্ত্ৰণ হয়।`
          : language === "bn"
            ? `${diagnosis.crop}-এর ${diagnosis.disease} নিয়ন্ত্রণে ৫% নিম বীজের নির্যাস বা কোল্ড-প্রেসড নিম তেল (প্রতি লিটারে ৫ মিলি) ব্যবহার করুন। ট্রাইকোডার্মা ভিরিডি (১০ গ্রাম/লিটার) স্প্রে করলে ছত্রাক রোগ প্রাকৃতিকভাবে কমে।`
            : `For ${diagnosis.crop} ${diagnosis.disease}, prepare a botanical spray using 5% Neem Seed Kernel Extract (NSKE) or cold-pressed neem oil (5ml/L water) mixed with mild soap. Trichoderma viride (10g/L) can be applied as a bio-foliar spray to suppress fungal pathogens naturally.`
      : "",
    chemical: diagnosis
      ? diagnosis.healthy
        ? language === "as"
          ? "স্বাস্থ্যৱান শস্যত কোনো ৰাসায়নিক কীটনাশক বা ভেঁকুৰনাশক দিয়াৰ প্ৰয়োজন নাই। ইয়াৰ দ্বাৰা খৰচ বৃদ্ধি পায় আৰু উপকাৰী অনুজীৱ নষ্ট হয়।"
          : language === "bn"
            ? "সুস্থ ফসলে কোনো রাসায়নিক ছত্রাকনাশক দেওয়ার প্রয়োজন নেই। এতে অযথা খরচ বাড়ে এবং উপকারী জীবাণু মারা যায়।"
            : "No chemical fungicide or bactericide is warranted for healthy foliage. Routine chemical sprays deplete beneficial microflora and increase cost without yield benefit."
        : language === "as"
          ? "যদি পাতৰ ১০% অংশ সংক্ৰমিত হয়, তেন্তে মেনক'জেব ৭৫% WP (২ গ্ৰাম/লিটাৰ) বা কাৰ্বেনডাজিম ৫০% WP (১ গ্ৰাম/লিটাৰ) স্প্ৰে কৰক। অসম কৃষি বিশ্ববিদ্যালয়ৰ নিৰ্দেশনা অনুসৰি চপোৱাৰ ১৪ দিন আগতে স্প্ৰে বন্ধ কৰক।"
          : language === "bn"
            ? "পাতার ১০% এর বেশি আক্রান্ত হলে ম্যানকোজেব ৭৫% ডব্লিউপি (২ গ্রাম/লিটার) বা কার্বেনডাজিম ৫০% ডব্লিউপি (১ গ্রাম/লিটার) স্প্রে করুন। ফসল তোলার ১৪ দিন আগে কোনো রাসায়নিক স্প্রে করবেন না।"
            : `Confirm diagnosis before spraying. If leaf lesions exceed 10% threshold, apply an approved protective fungicide such as Mancozeb 75% WP @ 2g/L or Carbendazim 50% WP @ 1g/L. Always wear protective gloves and observe the 14-day pre-harvest waiting interval prescribed by the Assam Agricultural University.`
      : "",
    prevention: diagnosis
      ? diagnosis.healthy
        ? language === "as"
          ? "ৰ'দ আৰু বতাহ চলাচলৰ বাবে শস্যৰ মাজত ২০x১৫ ছে.মি. ব্যৱধান ৰাখক। অপ্ৰয়োজনীয়ভাৱে ৩ ছে.মি.ৰ অধিক পানী জমা কৰি নাৰাখিব।"
          : language === "bn"
            ? "পর্যাপ্ত রোদ ও বাতাস চলাচলের জন্য চারার মাঝে ২০x১৫ সেমি দূরত্ব বজায় রাখুন। জমিতে অতিরিক্ত পানি জমতে দেবেন না।"
            : "Maintain wide 20x15 cm seedling spacing for optimal sunlight penetration and airflow. Avoid stagnant standing water deeper than 3 cm during non-critical phases."
        : language === "as"
          ? "গধূলি ওপৰৰ পৰা পানী নিসিঁচিব। সংক্ৰমিত তলৰ পাতবোৰ আঁতৰাই মাটিত পুতি পেলাওক। কৃষি সঁজুলিবোৰ ৫% ব্লিচিং পানীত ধুই পৰিষ্কাৰ কৰক।"
          : language === "bn"
            ? "বিকেলের পর উপরিভাগে জল ছেটাবেন না। আক্রান্ত পাতা ছিঁড়ে মাটিতে পুঁতে ফেলুন। চাষের যন্ত্রপাতি ব্যবহারের পর জীবাণুমুক্ত করুন।"
            : `Avoid overhead irrigation during evening hours. Remove and incinerate heavily infected lower leaves to disrupt spore dissemination. Clean farm tools with 5% bleach between plots and implement crop rotation with legumes next season.`
      : "",
  };

  return (
    <div className="analyzer-container">
      <div className="analyzer-content">
        {/* Page Heading */}
        <div className="analyzer-heading-row">
          <div className="analyzer-title-group">
            <div className="analyzer-kicker">
              <Leaf size={14} />
              <span>{t.analyzerKicker}</span>
            </div>
            <h1 className="analyzer-title">{t.analyzerTitle}</h1>
            <p className="analyzer-desc">{t.analyzerDescription}</p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 border-border" onClick={onOpenLog}>
            <Activity size={16} className="text-primary" />
            <span>{t.navLog}</span>
          </Button>
        </div>

        {/* Diagnostic Intake & Exhibition Samples Grid */}
        <div className="analyzer-grid">
          {/* Upload Dropzone */}
          <div className="analyzer-upload-box">
            <div className="upload-mascot-preview">
              {photoUrl ? (
                <img src={photoUrl} alt="Uploaded leaf" className="upload-leaf-photo" />
              ) : (
                <MascotAvatar pose={pose} className="upload-mascot-img" />
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <h2 className="upload-cta-title">
                {photoUrl ? "Leaf Photo Ready for Analysis" : t.uploadTitle}
              </h2>
              <p className="upload-cta-desc">{t.uploadSubtitle}</p>
            </div>

            <div className="upload-button-group">
              <button
                type="button"
                className="upload-primary-btn"
                onClick={triggerFileInput}
                disabled={diagnosing}
              >
                {diagnosing ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>{t.uploadAnalyzing}</span>
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    <span>{t.uploadBtn}</span>
                    <ArrowDownToLine size={16} />
                  </>
                )}
              </button>
            </div>

            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onUpload}
            />

            <div className="upload-device-note">
              <ShieldCheck size={14} className="text-primary" />
              <span>{t.uploadPrivacyNote}</span>
            </div>
          </div>

          {/* Exhibition Diagnostic Samples Panel */}
          <div className="samples-panel">
            <div className="samples-header">
              <div className="samples-title">{t.samplesTitle}</div>
              <div className="samples-subtitle">{t.samplesSubtitle}</div>
            </div>

            <div className="samples-list" role="list">
              {diseaseSamples.map((sample) => {
                const isSelected = diagnosis?.id === sample.id;
                const isUncertain = needsExpertReview(sample.confidence);

                return (
                  <div
                    key={sample.id}
                    className={`sample-item-card ${isSelected ? "selected" : ""}`}
                    onClick={() => onSample(sample)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="sample-left">
                      <div
                        className={`sample-icon-badge ${sample.healthy ? "healthy" : isUncertain ? "warning" : ""}`}
                      >
                        {sample.healthy ? <Check size={16} /> : <Leaf size={16} />}
                      </div>
                      <div className="sample-meta">
                        <span className="sample-name">
                          {sample.crop} · {sample.disease}
                        </span>
                        <span className="sample-crop-tag">{sample.pathogen} Pathogen Group</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="sample-confidence-pill">
                        {sample.confidence.toFixed(1)}% {t.sampleMatch}
                      </span>
                      <ArrowUpRight size={15} className="text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Diagnostic Report Result */}
        {diagnosis ? (
          <section className="diagnostic-report-card" aria-label="Diagnostic Report">
            <div className="report-topbar">
              <div className="report-badge-group">
                <span className="report-kicker">{t.reportHeading}</span>
                <div
                  className={`confidence-chip ${needsExpertReview(diagnosis.confidence) ? "low" : ""}`}
                >
                  <span>
                    {diagnosis.confidence.toFixed(1)}% {t.reportConfidence}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                <span>{t.reportScreeningAdvice}</span>
              </div>
            </div>

            {/* Title & Summary */}
            <div className="report-header-grid">
              <div className="report-crop-badge">
                {diagnosis.healthy ? <Check size={24} /> : <Sprout size={24} />}
              </div>
              <div>
                <h2 className="report-title">
                  {diagnosis.crop}: {diagnosis.disease}
                </h2>
                <div className="report-sub">
                  {t.reportPathogen}: <strong>{diagnosis.pathogen}</strong> ·{" "}
                  {diagnosis.healthy ? "Vigorous crop sample" : "Visual screening advisory"}
                </div>
              </div>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Analyzed specimen"
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
              )}
            </div>

            {/* Low Confidence Warning (Clean & Scientific, No KVK) */}
            {needsExpertReview(diagnosis.confidence) && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <MascotAvatar pose="thinking" className="h-12 w-auto shrink-0" />
                <div className="flex-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>Low Model Confidence ({diagnosis.confidence.toFixed(1)}%):</strong>{" "}
                  {t.reportLowConfidenceWarning}
                </div>
              </div>
            )}

            {/* Treatment Protocol Tabs */}
            <div className="treatment-section">
              <div className="flex items-center justify-between">
                <div className="treatment-tab-bar">
                  <button
                    type="button"
                    className={`treatment-tab-btn ${remedyTab === "organic" ? "active" : ""}`}
                    onClick={() => setRemedyTab("organic")}
                  >
                    {t.tabOrganic}
                  </button>
                  <button
                    type="button"
                    className={`treatment-tab-btn ${remedyTab === "chemical" ? "active" : ""}`}
                    onClick={() => setRemedyTab("chemical")}
                  >
                    {t.tabChemical}
                  </button>
                  <button
                    type="button"
                    className={`treatment-tab-btn ${remedyTab === "prevention" ? "active" : ""}`}
                    onClick={() => setRemedyTab("prevention")}
                  >
                    {t.tabPrevention}
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-primary"
                  onClick={() => onSpeak(adviceContent[remedyTab])}
                >
                  <Volume2 size={15} />
                  <span>{t.actionListen}</span>
                </Button>
              </div>

              <div className="treatment-content-box">
                <MascotAvatar pose="tablet" className="treatment-mascot" />
                <div className="flex-1">
                  <p>{adviceContent[remedyTab]}</p>
                </div>
              </div>
            </div>

            {/* Local Agro Context Box */}
            <div className="p-3 bg-secondary rounded-xl flex items-center gap-3 text-xs text-foreground">
              <CloudRain size={20} className="text-primary shrink-0" />
              <div>
                <strong>{t.agroContextTitle}:</strong> {t.agroContextDesc}
              </div>
            </div>

            {/* Actions: Save to Log */}
            <div className="report-actions">
              <Button
                className={`gap-2 text-white ${justSavedLog ? "bg-emerald-700" : "bg-primary hover:bg-deep"}`}
                onClick={onSave}
              >
                <Check size={16} />
                <span>{justSavedLog ? t.actionSaved : t.actionSaveLog}</span>
              </Button>
            </div>
          </section>
        ) : (
          <div className="p-8 text-center bg-card border border-border rounded-xl flex flex-col items-center gap-2 text-muted-foreground">
            <Sprout size={28} className="text-primary" />
            <div className="font-semibold text-foreground text-sm">{t.readyForDiagnosis}</div>
            <div className="text-xs max-w-sm">{t.readyForDiagnosisDesc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceView({
  onBack,
  language,
  setLanguage,
  recording,
  transcript,
  onMic,
  onSpeak,
  t,
}: {
  onBack: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  recording: boolean;
  transcript: string;
  onMic: () => void;
  onSpeak: (text: string) => void;
  t: TranslationDictionary;
}) {
  const quickQuestions = [
    t.promptCropsQuery,
    t.promptDiseaseQuery,
    t.promptFertilizerQuery,
    t.promptWeatherQuery,
  ];

  return (
    <div className="voice-workspace">
      <div className="w-full max-w-2xl flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>{t.navChat}</span>
        </Button>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          {t.voiceKicker}
        </span>
      </div>

      <div className="voice-center-stage">
        {/* Language selector pills */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary rounded-full border border-border">
          {SUPPORTED_LANGUAGES.map((opt) => (
            <button
              key={opt.code}
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                language === opt.code
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setLanguage(opt.code)}
            >
              {opt.native}
            </button>
          ))}
        </div>

        {/* Mascot stage with listening pulse rings */}
        <div className="voice-mascot-pod">
          <div className="voice-ring voice-ring-1" />
          <div className="voice-ring voice-ring-2" />
          <MascotAvatar pose="greeting" className="voice-mascot-hero" />
        </div>

        <div>
          <div className="text-xs font-bold text-primary tracking-wide mb-1 uppercase">
            {recording ? t.voiceListeningTitle : "AGRISATHI READY"}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {recording ? t.voiceListeningTitle : t.voiceReadyTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">{t.voiceSubtitle}</p>
        </div>

        {/* Big Mic Button */}
        <button
          type="button"
          className={`voice-mic-main ${recording ? "active" : ""}`}
          onClick={onMic}
          aria-label={recording ? t.voiceStop : t.voiceStart}
        >
          {recording ? <MicOff size={32} /> : <Mic size={34} />}
        </button>

        {/* Animated Audio Waveform */}
        <div className={`waveform-bars ${recording ? "active" : ""}`} aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="waveform-bar"
              style={{
                animationDelay: `${(i % 7) * 0.12}s`,
                height: recording ? undefined : "6px",
              }}
            />
          ))}
        </div>

        {/* Transcribed Speech Bubble */}
        {transcript && (
          <div className="w-full p-4 bg-card border border-border rounded-xl text-left shadow-subtle flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AudioLines size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground font-semibold mb-0.5">
                  {t.voiceTranscriptHeading}:
                </div>
                <div className="text-sm text-foreground font-medium leading-relaxed">
                  {transcript}
                </div>
              </div>
            </div>
            {!recording && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 text-primary"
                onClick={() => onSpeak(transcript)}
                title="Listen to transcription"
              >
                <Volume2 size={16} />
              </Button>
            )}
          </div>
        )}

        {/* Quick Voice Prompt Cards */}
        <div className="w-full mt-4 text-left">
          <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <span>{t.voiceUnsureKicker}</span>
            <span>{t.voiceTapToHear}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {quickQuestions.map((prompt, index) => (
              <button
                key={index}
                type="button"
                className="flex items-center justify-between p-3 bg-card hover:bg-secondary/70 border border-border rounded-lg text-left text-xs font-semibold text-foreground transition-colors"
                onClick={() => onSpeak(prompt)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary font-mono font-bold text-[11px]">0{index + 1}</span>
                  <span>{prompt}</span>
                </div>
                <ArrowUpRight size={15} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CropLogDialog({
  open,
  onOpenChange,
  entries,
  onStatus,
  currentUser,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: CropLogEntry[];
  onStatus: (id: string, status: CropLogEntry["status"]) => void;
  currentUser?: User | null;
  t: TranslationDictionary;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <div className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
            <Activity size={14} />
            <span>FIELD MONITORING DIARY</span>
          </div>
          <DialogTitle className="text-xl font-bold text-deep">{t.logTitle}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t.logSubtitle}
          </DialogDescription>
        </DialogHeader>

        {entries.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-2 text-muted-foreground">
            <Leaf size={32} className="text-primary" />
            <div className="font-semibold text-foreground">{t.logEmptyTitle}</div>
            <p className="text-xs max-w-xs">{t.logEmptyDesc}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 my-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-secondary/60 border border-border rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.crop}
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-soft-mint text-primary grid place-items-center">
                      <Leaf size={18} />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {entry.crop} · {entry.disease}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()} ·{" "}
                      {entry.confidence.toFixed(1)}% match
                    </div>
                  </div>
                </div>

                <select
                  className="bg-card text-xs font-semibold border border-border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                  value={entry.status}
                  onChange={(e) => onStatus(entry.id, e.target.value as CropLogEntry["status"])}
                  aria-label={`Status for ${entry.crop}`}
                >
                  <option value="Under Treatment">{t.logStatusUnderTreatment}</option>
                  <option value="Crop Improved">{t.logStatusImproved}</option>
                  <option value="Worsened">{t.logStatusWorsened}</option>
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {currentUser ? (
              <>
                <Cloud size={14} className="text-leaf shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[260px]">
                  {t.authCloudSynced} (
                  {currentUser.email || currentUser.displayName || "Google Cloud"})
                </span>
              </>
            ) : (
              <>
                <ShieldCheck size={13} className="text-primary shrink-0" />
                <span>Encrypted locally in browser localStorage</span>
              </>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
            {t.logDismiss}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
  language,
  onLanguageChange,
  currentUser,
  onSignIn,
  onSignOut,
  isSyncing,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  t: TranslationDictionary;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <div className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
            <Settings size={14} />
            <span>{t.settingsTitle}</span>
          </div>
          <DialogTitle className="text-lg font-bold text-deep">
            Settings & Cloud Account
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t.settingsZone}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* User Account / Firebase Sync Card */}
          <div className="p-3 bg-secondary/80 rounded-xl border border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-primary/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-soft-mint text-primary font-bold grid place-items-center text-sm shrink-0">
                  {currentUser ? (
                    (currentUser.displayName || currentUser.email || "F")[0].toUpperCase()
                  ) : (
                    <ShieldCheck size={20} />
                  )}
                </div>
              )}
              <div className="truncate">
                <div className="text-xs font-bold text-foreground truncate">
                  {currentUser
                    ? currentUser.displayName || currentUser.email || "Farmer"
                    : "Guest Farmer"}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  {currentUser ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-leaf" />
                      <span className="text-leaf font-medium">{t.authCloudSynced}</span>
                    </>
                  ) : (
                    <span>Sign in with Google to sync crop records</span>
                  )}
                </div>
              </div>
            </div>

            {currentUser ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 shrink-0"
                onClick={onSignOut}
              >
                <LogOut size={13} className="mr-1" />
                <span>{t.authSignOut}</span>
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-deep text-white text-xs h-8 shrink-0"
                onClick={onSignIn}
                disabled={isSyncing}
              >
                <LogIn size={13} className="mr-1" />
                <span>{isSyncing ? "..." : t.authSignIn}</span>
              </Button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-2">
              {t.settingsLanguage}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    language === opt.code
                      ? "border-primary bg-secondary text-primary"
                      : "border-border bg-card text-foreground hover:bg-secondary/60"
                  }`}
                  onClick={() => onLanguageChange(opt.code)}
                >
                  <div>
                    <div>{opt.native}</div>
                    <div className="text-[10px] text-muted-foreground">{opt.label}</div>
                  </div>
                  {language === opt.code && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-secondary rounded-lg text-xs text-foreground">
            <strong>Target Agro-Climatic Zone:</strong> Lower Brahmaputra Valley, Kamrup District,
            Assam. Localized for alluvial soil, Ahu &amp; Sali rice cycles, and subtropical weather.
          </div>
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <Button
            size="sm"
            className="bg-primary hover:bg-deep text-white"
            onClick={() => onOpenChange(false)}
          >
            {t.settingsDismiss}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
