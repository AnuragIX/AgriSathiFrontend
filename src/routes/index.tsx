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
  CircleHelp,
  CloudRain,
  Copy,
  Image as ImageIcon,
  Leaf,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  UserRound,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
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
  uiCopy,
  type CropLogEntry,
  type DiseaseSample,
  type LanguageCode,
} from "@/lib/agri-data";
import { classifyLeaf } from "@/lib/crop-model";

import farmScene from "@/assets/assam-farm-scene.jpg";
import avatarGreeting from "@/assets/sathi-greeting.png";
import avatarInspecting from "@/assets/sathi-inspecting.png";
import avatarExcited from "@/assets/sathi-excited.png";
import avatarTablet from "@/assets/sathi-tablet.png";
import avatarCelebrating from "@/assets/sathi-celebrating.png";
import avatarThinking from "@/assets/sathi-thinking.png";
import avatarIcon from "@/assets/sathi-avatar.png";
import agrisathiCrest from "@/assets/agrisathi-crest.png";
import { registerAgriSathiOffline } from "@/lib/pwa-registration";

type View = "chat" | "analyzer" | "voice";
type Pose =
  "greeting" | "inspecting" | "excited" | "tablet" | "celebrating" | "thinking" | "avatar";
type Message = { id: string; role: "user" | "assistant"; text: string; timestamp?: string };

const languageOptions: { code: LanguageCode; label: string; short: string; locale: string }[] = [
  { code: "en", label: "English", short: "EN", locale: "en-IN" },
  { code: "as", label: "অসমীয়া", short: "AS", locale: "as-IN" },
  { code: "bn", label: "বাংলা", short: "BN", locale: "bn-IN" },
  { code: "brx", label: "बर'", short: "BRX", locale: "brx-IN" },
];

const initialMessages: Message[] = [
  {
    id: "u1",
    role: "user",
    text: "What is the best time to sow wheat in Assam?",
    timestamp: "10:14 AM",
  },
  {
    id: "a1",
    role: "assistant",
    text: "The best time to sow wheat in Assam is from mid-November to mid-December. This allows the crop to mature during the cooler months, ensuring healthy tillering and higher grain yield.\n\n• Sowing depth: 3–5 cm\n• Recommended varieties: Sonalika, DBW 39, or HD 2967\n• Ensure adequate residual soil moisture or give a light pre-sowing irrigation.",
    timestamp: "10:15 AM",
  },
  {
    id: "u2",
    role: "user",
    text: "My tomato plants have small insects on the underside of the leaves. What should I do?",
    timestamp: "10:18 AM",
  },
  {
    id: "a2",
    role: "assistant",
    text: "These are most likely aphids or whiteflies, common during humid spells in Assam. Here is how to manage them safely:\n\n• Spray neem seed kernel extract (NSKE 5%) or commercial neem oil (5 ml per litre of water with a few drops of mild soap).\n• Remove and compost heavily curled or yellowing leaves to stop the spread.\n• Avoid spraying during hot midday sun; spray during early morning or late afternoon.\n• If infestation persists, consult your local KVK for recommended bio-pesticides.",
    timestamp: "10:19 AM",
  },
  {
    id: "u3",
    role: "user",
    text: "Will it rain in Rangia this week before I apply fertilizer?",
    timestamp: "10:22 AM",
  },
  {
    id: "a3",
    role: "assistant",
    text: "In the Kamrup/Rangia cluster, light to moderate rainfall is expected in the next 2–3 days with 84% humidity. \n\n• Hold off on broadcast urea right before heavy rain to prevent nitrogen leaching.\n• Apply fertilizer in split doses once the field water stabilizes.\n• Scout for fungal leaf blast, as current humidity levels are favorable for spore germination.",
    timestamp: "10:23 AM",
  },
];

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
      { title: "AgriSathi — Your Assam Farm Companion" },
      {
        name: "description",
        content:
          "Practical crop-care guidance, offline leaf checks, and a multilingual voice companion for farmers in Assam.",
      },
      { property: "og:title", content: "AgriSathi — Your Assam Farm Companion" },
      {
        property: "og:description",
        content:
          "Practical crop-care guidance, offline leaf checks, and a multilingual voice companion for farmers in Assam.",
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
    <img
      className={`mascot-image object-contain shrink-0 ${className}`}
      src={asset.url}
      alt={alt || asset.alt}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

function AgriSathiApp() {
  const [view, setView] = useState<View>("chat");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [question, setQuestion] = useState("");
  const [log, setLog] = useState<CropLogEntry[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [expertOpen, setExpertOpen] = useState(false);
  const [expertCaseReady, setExpertCaseReady] = useState(false);
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

  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<{
    stop: () => void;
    onresult: ((event: unknown) => void) | null;
    onend: (() => void) | null;
  } | null>(null);

  const copy = uiCopy[language] || uiCopy.en;

  useEffect(() => {
    void registerAgriSathiOffline();
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
      if (savedLanguage && languageOptions.some((option) => option.code === savedLanguage)) {
        setLanguage(savedLanguage);
      }
    } catch {
      setLog([]);
    }

    const syncNetwork = () => setOnline(navigator.onLine);
    syncNetwork();
    window.addEventListener("online", syncNetwork);
    window.addEventListener("offline", syncNetwork);

    return () => {
      viewport?.removeEventListener("resize", syncHeight);
      window.removeEventListener("resize", syncHeight);
      document.documentElement.style.removeProperty("--app-height");
      window.removeEventListener("online", syncNetwork);
      window.removeEventListener("offline", syncNetwork);
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
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
      /* storage optional */
    }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageOptions.find((option) => option.code === language)?.locale ?? "en-IN";
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
      setVoiceTranscript(
        "Voice input is not available in this browser. You can type your question in the box below.",
      );
      return;
    }
    const recognition = new Recognition();
    recognition.lang =
      languageOptions.find((option) => option.code === language)?.locale ?? "en-IN";
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
      setVoiceTranscript(
        "Microphone access was unavailable. Please check your browser microphone permission.",
      );
    };
    recognitionRef.current = recognition;
    setRecording(true);
    recognition.start();
  }

  function submitQuestion(text = question) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const answer = getOfflineAnswer(trimmed, language);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((existing) => [
      ...existing,
      { id: `user-${Date.now()}`, role: "user", text: trimmed, timestamp: now },
      { id: `assistant-${Date.now() + 1}`, role: "assistant", text: answer, timestamp: now },
    ]);
    setQuestion("");

    window.setTimeout(() => {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
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
      /* local storage can be restricted */
    }
    setLogOpen(true);
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
      /* local storage */
    }
  }

  function submitExpertCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExpertCaseReady(true);
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
          <img src={agrisathiCrest} alt="AgriSathi Official Crest" className="topbar-crest" />
          <div className="brand-title">
            <span>AgriSathi</span>
            <span className="brand-ai-badge">AI</span>
            <span className="brand-subtitle-lang">কৃষি साथी</span>
          </div>
        </div>

        {/* Desktop View Switcher */}
        <nav className="topbar-nav hidden md:flex" aria-label="Main views">
          <button
            type="button"
            className={`topbar-tab ${view === "chat" ? "topbar-tab-active" : ""}`}
            onClick={() => setView("chat")}
            aria-current={view === "chat" ? "page" : undefined}
          >
            <MessageSquare size={16} />
            <span>{copy.chat}</span>
          </button>
          <button
            type="button"
            className={`topbar-tab ${view === "analyzer" ? "topbar-tab-active" : ""}`}
            onClick={() => setView("analyzer")}
            aria-current={view === "analyzer" ? "page" : undefined}
          >
            <ImageIcon size={16} />
            <span>{copy.analyzer}</span>
          </button>
          <button
            type="button"
            className={`topbar-tab ${view === "voice" ? "topbar-tab-active" : ""}`}
            onClick={() => setView("voice")}
            aria-current={view === "voice" ? "page" : undefined}
          >
            <Mic size={16} />
            <span>{copy.voice}</span>
          </button>
        </nav>

        {/* Tools (Language + Connectivity + Mobile Trigger) */}
        <div className="topbar-tools">
          <label className="lang-selector" aria-label="Select Interface Language">
            <select
              value={language}
              onChange={(event) => changeLanguage(event.target.value as LanguageCode)}
              aria-label="Choose language"
            >
              {languageOptions.map((opt) => (
                <option value={opt.code} key={opt.code}>
                  {opt.label} ({opt.short})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="text-muted-foreground pointer-events-none" />
          </label>

          <div
            className="connectivity-badge"
            title={
              online
                ? "Local models and offline advice are active"
                : "Running offline on local database"
            }
          >
            <span className={`connectivity-dot ${online ? "" : "offline"}`} />
            <span>{online ? copy.ready : "Offline Mode"}</span>
          </div>

          <Button
            ref={menuTriggerRef}
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            aria-label="Open farm navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-card">
          <SheetHeader className="p-4 border-b border-border text-left flex flex-row items-center gap-3">
            <img
              src={agrisathiCrest}
              alt="AgriSathi Crest"
              className="h-10 w-auto object-contain"
            />
            <div>
              <SheetTitle className="text-lg font-bold text-forest">AgriSathi AI</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Assam Agricultural Companion
              </SheetDescription>
            </div>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-2 border-b border-border">
            <button
              type="button"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                view === "chat"
                  ? "bg-secondary text-primary"
                  : "text-foreground hover:bg-secondary/60"
              }`}
              onClick={() => {
                setView("chat");
                setMenuOpen(false);
              }}
            >
              <MessageSquare size={18} />
              <span>{copy.chat}</span>
            </button>
            <button
              type="button"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                view === "analyzer"
                  ? "bg-secondary text-primary"
                  : "text-foreground hover:bg-secondary/60"
              }`}
              onClick={() => {
                setView("analyzer");
                setMenuOpen(false);
              }}
            >
              <ImageIcon size={18} />
              <span>{copy.analyzer}</span>
            </button>
            <button
              type="button"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                view === "voice"
                  ? "bg-secondary text-primary"
                  : "text-foreground hover:bg-secondary/60"
              }`}
              onClick={() => {
                setView("voice");
                setMenuOpen(false);
              }}
            >
              <Mic size={18} />
              <span>{copy.voice}</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FarmSidebarContent
              log={log}
              onOpenLog={() => {
                setLogOpen(true);
                setMenuOpen(false);
              }}
              onOpenExpert={() => {
                setExpertCaseReady(false);
                setExpertOpen(true);
                setMenuOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main App Workspace */}
      <div className="workspace">
        {/* Left Scenic Sidebar (matches Reference 2 & Assamese Heritage) */}
        <aside className="scenic-sidebar hidden lg:flex">
          <div className="sidebar-scroll">
            <div className="sidebar-section-kicker">YOUR FARM, TODAY</div>
            <FarmSidebarContent
              log={log}
              onOpenLog={() => setLogOpen(true)}
              onOpenExpert={() => {
                setExpertCaseReady(false);
                setExpertOpen(true);
              }}
            />
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
              <span className="text-[10px] text-leaf">Assam Agro Zone</span>
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
              onMic={() => startRecognition((text) => setQuestion(text))}
              micSupported={micSupported}
              onUpload={() => {
                setView("analyzer");
                window.requestAnimationFrame(() => uploadRef.current?.click());
              }}
              inputRef={inputRef}
              chatScrollRef={chatScrollRef}
              copy={copy}
              language={language}
              onQuickQuestion={submitQuestion}
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
              onAskExpert={() => {
                setExpertCaseReady(false);
                setExpertOpen(true);
              }}
              onOpenLog={() => setLogOpen(true)}
              copy={copy}
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
      />

      {/* KVK Expert Escalation Dialog */}
      <ExpertDialog
        open={expertOpen}
        onOpenChange={setExpertOpen}
        diagnosis={selectedDiagnosis}
        hasPhoto={!!photoUrl}
        ready={expertCaseReady}
        onSubmit={submitExpertCase}
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

function FarmSidebarContent({
  log,
  onOpenLog,
  onOpenExpert,
}: {
  log: CropLogEntry[];
  onOpenLog: () => void;
  onOpenExpert: () => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Weather & Disease Risk Card */}
      <section className="weather-card">
        <div className="weather-header">
          <div className="weather-title">
            <CloudRain size={16} className="text-primary" />
            <span>Weather & Risk</span>
          </div>
          <div className="weather-loc-tag">
            <MapPin size={12} />
            <span>Rangia</span>
          </div>
        </div>

        <div className="weather-main-row">
          <div className="weather-temp">27°C</div>
          <div className="weather-meta-col">
            <span>84% Humidity</span>
            <span>Light rain in 2–3 days</span>
          </div>
        </div>

        <div className="weather-risk-box">
          <strong>Fungal Blast Advisory:</strong> Warm humidity raises risk for rice leaf blast &
          tomato early blight this week.
        </div>
      </section>

      {/* Crop Health Log Card */}
      <section className="crop-log-card" onClick={onOpenLog} role="button" tabIndex={0}>
        <div className="crop-log-info">
          <div className="crop-log-icon">
            <Leaf size={18} />
          </div>
          <div className="crop-log-text">
            <span className="crop-log-label">Crop Health Log</span>
            <span className="crop-log-sub">{log.length} records tracked</span>
          </div>
        </div>
        <ArrowUpRight size={17} className="text-muted-foreground" />
      </section>

      {/* KVK Expert Card */}
      <section className="kvk-card" onClick={onOpenExpert} role="button" tabIndex={0}>
        <div className="kvk-badge">KVK EXPERT CONNECT</div>
        <div className="kvk-title">Need a second opinion?</div>
        <div className="kvk-desc">
          Draft a field note with leaf photos for your local Krishi Vigyan Kendra specialist.
        </div>
        <div className="kvk-action">
          <span>Ask agricultural expert</span>
          <ArrowUpRight size={15} />
        </div>
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
  onMic,
  micSupported,
  onUpload,
  inputRef,
  chatScrollRef,
  copy,
  language,
  onQuickQuestion,
}: {
  messages: Message[];
  question: string;
  setQuestion: (val: string) => void;
  onSubmit: (val?: string) => void;
  onSpeak: (text: string) => void;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
  onMic: () => void;
  micSupported: boolean;
  onUpload: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  copy: typeof uiCopy.en;
  language: LanguageCode;
  onQuickQuestion: (val: string) => void;
}) {
  const quickPrompts = [
    {
      title: "Best crops for this season",
      icon: <Sprout size={16} />,
      query: "What crops should I grow this season in Assam?",
    },
    {
      title: "What disease is on my plant?",
      icon: <Leaf size={16} />,
      query: "How can I tell if my crop has a disease or pest infestation?",
    },
    {
      title: "Which fertilizer should I use?",
      icon: <Sparkles size={16} />,
      query: "Which fertilizer dosage should I use for rice transplanting?",
    },
    {
      title: "Weather forecast for my area",
      icon: <CloudRain size={16} />,
      query: "Will it rain in Rangia Kamrup this week?",
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
          <div className="welcome-kicker">YOUR FARMING COMPANION · कृषि साथी</div>
          <h1 className="welcome-heading">
            How can I <span className="welcome-heading-highlight">help you</span> today?
          </h1>
          <p className="welcome-subtitle">
            {copy.welcomeSub ||
              "Ask me about crops, plant diseases, weather, fertilizer, or better farming practices for Assam."}
          </p>

          {/* Quick Prompts (Reference 2 Layout) */}
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
                      <span className="assistant-author-badge">· Assam Advisor</span>
                    </div>
                    <div className="assistant-actions">
                      <button
                        type="button"
                        className="assistant-action-btn"
                        title="Listen to this advice"
                        aria-label="Listen to answer"
                        onClick={() => onSpeak(message.text)}
                      >
                        <Volume2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="assistant-action-btn"
                        title={copiedId === message.id ? "Copied" : "Copy advice"}
                        aria-label="Copy advice to clipboard"
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
            title="Upload leaf photo or open scanner"
            aria-label="Upload crop image"
            onClick={onUpload}
          >
            <Plus size={20} />
          </button>

          <button
            type="button"
            className="composer-action-btn"
            title="Camera capture"
            aria-label="Camera leaf inspection"
            onClick={onUpload}
          >
            <Camera size={19} />
          </button>

          <button
            type="button"
            className={`composer-action-btn ${micSupported ? "text-primary" : "opacity-40 cursor-not-allowed"}`}
            title={micSupported ? "Ask with your voice" : "Speech recognition unavailable"}
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
            placeholder={copy.ask || "Ask your farming question about crops, weather, or pests…"}
            aria-label="Ask AgriSathi farming question"
          />

          <button
            type="submit"
            className="composer-send-btn"
            disabled={!question.trim()}
            aria-label={copy.send || "Send Question"}
          >
            <Send size={16} />
          </button>
        </form>

        <div className="composer-disclaimer">
          <ShieldCheck size={13} className="text-primary shrink-0" />
          <span>
            Answers work offline on-device · Consult local KVK extension officers for urgent blight
            outbreaks
          </span>
        </div>
      </section>
    </div>
  );
}

function AnalyzerView({
  diagnosis,
  photoUrl,
  diagnosing,
  simulated,
  remedyTab,
  setRemedyTab,
  uploadRef,
  onUpload,
  onSample,
  onSave,
  onSpeak,
  onAskExpert,
  onOpenLog,
  copy,
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
  onAskExpert: () => void;
  onOpenLog: () => void;
  copy: typeof uiCopy.en;
}) {
  const pose: Pose = diagnosis?.healthy
    ? "celebrating"
    : diagnosis && needsExpertReview(diagnosis.confidence)
      ? "thinking"
      : diagnosis
        ? "excited"
        : "inspecting";

  const triggerFileInput = () => uploadRef.current?.click();

  const adviceContent = {
    organic: diagnosis
      ? diagnosis.healthy
        ? "Your crop looks vigorous. Maintain soil biology by applying well-decomposed cow dung compost or vermicompost (2 tonnes/bigha). Spray Jeevamrit every 15 days to encourage beneficial soil microbes."
        : `For ${diagnosis.crop} ${diagnosis.disease}, prepare a botanical spray using 5% Neem Seed Kernel Extract (NSKE) or commercial cold-pressed neem oil (5ml/L water) mixed with mild soap. Trichoderma viride (10g/L) can be applied as a bio-foliar spray to suppress fungal pathogens naturally.`
      : "",
    chemical: diagnosis
      ? diagnosis.healthy
        ? "No chemical fungicide or bactericide is warranted for healthy foliage. Routine chemical sprays deplete beneficial microflora and increase cost without yield benefit."
        : `Confirm diagnosis before spraying. If leaf lesions exceed 10% threshold, apply an approved protective fungicide such as Mancozeb 75% WP @ 2g/L or Carbendazim 50% WP @ 1g/L. Always wear protective gloves and observe the 14-day pre-harvest waiting interval prescribed by the Assam Agricultural University.`
      : "",
    prevention: diagnosis
      ? diagnosis.healthy
        ? "Maintain wide 20x15 cm seedling spacing for optimal sunlight penetration and airflow. Avoid stagnant standing water deeper than 3 cm during non-critical phases."
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
              <span>FIELD DIAGNOSTIC LAB · ON-DEVICE TENSORFLOW</span>
            </div>
            <h1 className="analyzer-title">Crop Health Analyzer</h1>
            <p className="analyzer-desc">
              Understand what is affecting your crops, evaluate leaf symptoms, and discover
              practical treatment guidance calibrated for Assam.
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 border-border" onClick={onOpenLog}>
            <Activity size={16} className="text-primary" />
            <span>Crop Health Log</span>
          </Button>
        </div>

        {/* Upper Diagnostic Grid (Intake & Samples) */}
        <div className="analyzer-grid">
          {/* Upload Dropzone Studio */}
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
                {photoUrl ? "Leaf Photo Ready for Analysis" : "Photograph or Upload a Leaf"}
              </h2>
              <p className="upload-cta-desc">
                Take a clear photo of an infected leaf in natural sunlight. Ensure the leaf edges
                and lesions are in focus.
              </p>
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
                    <span>Analyzing Leaf…</span>
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    <span>{copy.camera || "Capture / Upload Photo"}</span>
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
              <span>Private on-device check · No photos sent to external servers</span>
            </div>
          </div>

          {/* Exhibition Diagnostic Samples Panel */}
          <div className="samples-panel">
            <div className="samples-header">
              <div className="samples-title">Verified Field Diagnostic Samples</div>
              <div className="samples-subtitle">
                Tap any sample below to preview full symptoms &amp; treatment protocol:
              </div>
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
                        {sample.confidence.toFixed(1)}% match
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
                <span className="report-kicker">EXAMINATION RESULT</span>
                <div
                  className={`confidence-chip ${needsExpertReview(diagnosis.confidence) ? "low" : ""}`}
                >
                  <span>{diagnosis.confidence.toFixed(1)}% Confidence</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                <span>Screening Advice</span>
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
                  Pathogen: <strong>{diagnosis.pathogen}</strong> ·{" "}
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

            {/* Low Confidence Warning */}
            {needsExpertReview(diagnosis.confidence) && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <MascotAvatar pose="thinking" className="h-12 w-auto" />
                <div className="flex-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>Low Model Confidence ({diagnosis.confidence.toFixed(1)}%):</strong>{" "}
                  Symptoms on this leaf sample are atypical or ambiguous. Do not apply chemical
                  fungicides based solely on this image. Connect with your local Krishi Vigyan
                  Kendra for a confirmed botanical diagnosis.
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs bg-card"
                  onClick={onAskExpert}
                >
                  Ask KVK Expert
                </Button>
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
                    Organic &amp; Biological
                  </button>
                  <button
                    type="button"
                    className={`treatment-tab-btn ${remedyTab === "chemical" ? "active" : ""}`}
                    onClick={() => setRemedyTab("chemical")}
                  >
                    Chemical Safety
                  </button>
                  <button
                    type="button"
                    className={`treatment-tab-btn ${remedyTab === "prevention" ? "active" : ""}`}
                    onClick={() => setRemedyTab("prevention")}
                  >
                    Cultural Prevention
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-primary"
                  onClick={() => onSpeak(adviceContent[remedyTab])}
                >
                  <Volume2 size={15} />
                  <span>{copy.listen || "Listen to advice"}</span>
                </Button>
              </div>

              <div className="treatment-content-box">
                <MascotAvatar pose="tablet" className="treatment-mascot" />
                <div className="flex-1">
                  <p>{adviceContent[remedyTab]}</p>
                </div>
              </div>
            </div>

            {/* Weather & Field Context */}
            <div className="p-3 bg-secondary rounded-xl flex items-center gap-3 text-xs text-foreground">
              <CloudRain size={20} className="text-primary shrink-0" />
              <div>
                <strong>Local Agro-Climatic Context (Rangia, Kamrup):</strong> Current relative
                humidity (84%) creates an active spore incubation window. Avoid foliar spraying
                within 4 hours of anticipated afternoon showers.
              </div>
            </div>

            {/* Actions */}
            <div className="report-actions">
              <Button className="gap-2 bg-primary hover:bg-forest text-white" onClick={onSave}>
                <Check size={16} />
                <span>Save to Crop Health Log</span>
              </Button>
              <Button variant="outline" className="gap-2 border-border" onClick={onAskExpert}>
                <CircleHelp size={16} />
                <span>Ask KVK Extension Expert</span>
              </Button>
            </div>
          </section>
        ) : (
          <div className="p-8 text-center bg-card border border-border rounded-xl flex flex-col items-center gap-2 text-muted-foreground">
            <Sprout size={28} className="text-primary" />
            <div className="font-semibold text-foreground text-sm">Ready for Diagnosis</div>
            <div className="text-xs max-w-sm">
              Capture or upload a crop leaf image above, or choose one of the 5 verified reference
              samples to inspect symptoms and treatments.
            </div>
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
}: {
  onBack: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  recording: boolean;
  transcript: string;
  onMic: () => void;
  onSpeak: (text: string) => void;
}) {
  const quickQuestions = [
    "What crops are recommended for this season in Assam?",
    "How do I protect my rice from stem borer and blast?",
    "Will it rain before I apply urea fertilizer to my field?",
    "What is the organic remedy for tomato leaf curl virus?",
  ];

  return (
    <div className="voice-workspace">
      <div className="w-full max-w-2xl flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Chat</span>
        </Button>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          HANDS-FREE FARM ASSISTANT
        </span>
      </div>

      <div className="voice-center-stage">
        {/* Language selector pills */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary rounded-full border border-border">
          {languageOptions.map((opt) => (
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
              {opt.label}
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
          <div className="text-xs font-bold text-primary tracking-wide mb-1">
            {recording ? "LISTENING TO YOUR VOICE…" : "READY WHEN YOU ARE"}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {recording ? "Speak clearly into your microphone" : "How can I help your farm today?"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Ask in Assamese, Bengali, Bodo, or English about your crops, pests, fertilizers, or
            local Assam weather.
          </p>
        </div>

        {/* Big Mic Button */}
        <button
          type="button"
          className={`voice-mic-main ${recording ? "active" : ""}`}
          onClick={onMic}
          aria-label={recording ? "Stop listening" : "Start speaking"}
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
              <div className="text-sm text-foreground font-medium leading-relaxed">
                {transcript}
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
            <span>NOT SURE WHAT TO ASK?</span>
            <span>TAP TO HEAR ADVICE</span>
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: CropLogEntry[];
  onStatus: (id: string, status: CropLogEntry["status"]) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <div className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
            <Activity size={14} />
            <span>FIELD MONITORING DIARY</span>
          </div>
          <DialogTitle className="text-xl font-bold text-forest">
            Crop Health Monitoring Log
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Saved diagnostic history stored locally on your device for crop tracking.
          </DialogDescription>
        </DialogHeader>

        {entries.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-2 text-muted-foreground">
            <Leaf size={32} className="text-primary" />
            <div className="font-semibold text-foreground">No Crop Records Yet</div>
            <p className="text-xs max-w-xs">
              Perform a leaf check in the Crop Analyzer and click "Save to Crop Health Log" to track
              progress here.
            </p>
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
                    <div className="w-10 h-10 rounded-lg bg-pale-sage text-primary grid place-items-center">
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
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Crop Improved">Crop Improved</option>
                  <option value="Worsened">Worsened</option>
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-primary" />
            <span>Encrypted locally in browser localStorage</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExpertDialog({
  open,
  onOpenChange,
  diagnosis,
  hasPhoto,
  ready,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagnosis: DiseaseSample | null;
  hasPhoto: boolean;
  ready: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <div className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
            <Sprout size={14} />
            <span>KRISHI VIGYAN KENDRA · ICAR ASSAM</span>
          </div>
          <DialogTitle className="text-xl font-bold text-forest">
            {ready ? "Your KVK Case Summary is Ready" : "Prepare KVK Expert Field Note"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {ready
              ? "Share this structured summary with your nearest district agricultural extension officer or KVK scientist."
              : "Generate a structured field note with symptoms and leaf photographs for professional agricultural review."}
          </DialogDescription>
        </DialogHeader>

        {ready ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white grid place-items-center">
                <Check size={20} />
              </div>
              <div className="text-xs text-emerald-900 dark:text-emerald-100">
                <strong>Field Note Compiled:</strong> You can copy or screenshot this card to show
                directly at your local KVK or send via WhatsApp to your block extension officer.
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-xl flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-border/70 pb-1.5">
                <span className="text-muted-foreground">Crop Specimen:</span>
                <span className="font-bold text-foreground">
                  {diagnosis ? `${diagnosis.crop} (${diagnosis.disease})` : "General Paddy/Crop"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/70 pb-1.5">
                <span className="text-muted-foreground">Location Cluster:</span>
                <span className="font-bold text-foreground">Rangia, Kamrup District, Assam</span>
              </div>
              <div className="flex justify-between border-b border-border/70 pb-1.5">
                <span className="text-muted-foreground">Leaf Photo Attached:</span>
                <span className="font-bold text-primary">
                  {hasPhoto ? "Yes (Stored on Device)" : "No Specimen Photo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preliminary Classifier:</span>
                <span className="font-bold text-foreground">
                  {diagnosis ? `${diagnosis.confidence.toFixed(1)}% match` : "Manual Entry"}
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-forest text-white"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-3 py-2" onSubmit={onSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                Crop &amp; Observed Symptoms
              </label>
              <input
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary"
                defaultValue={diagnosis ? `${diagnosis.crop} · ${diagnosis.disease}` : ""}
                placeholder="e.g. Rice · spindle-shaped brown spots on leaf blades"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                Village / Gaon Panchayat &amp; District
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg">
                <MapPin size={15} className="text-muted-foreground shrink-0" />
                <input
                  className="w-full text-sm bg-transparent outline-none"
                  defaultValue="Rangia, Kamrup"
                  placeholder="e.g. Rangia, Kamrup"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-secondary rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-primary" />
                <span>Leaf Photo Attachment</span>
              </div>
              <span
                className={`font-semibold ${hasPhoto ? "text-primary" : "text-muted-foreground"}`}
              >
                {hasPhoto ? "Photo Attached" : "None Selected"}
              </span>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 my-1">
              <ShieldCheck size={14} className="text-primary shrink-0" />
              <span>
                AgriSathi organizes your note locally without transmitting personal farmer
                credentials.
              </span>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-forest text-white mt-1">
              Generate Expert Note
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
