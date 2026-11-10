export type LanguageCode = "en" | "as" | "bn" | "brx";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
  short: string;
  locale: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    label: "English",
    native: "English",
    short: "EN",
    locale: "en-IN",
    speechLocale: "en-IN",
  },
  {
    code: "as",
    label: "Assamese",
    native: "অসমীয়া",
    short: "AS",
    locale: "as-IN",
    speechLocale: "as-IN",
  },
  {
    code: "bn",
    label: "Bengali",
    native: "বাংলা",
    short: "BN",
    locale: "bn-IN",
    speechLocale: "bn-IN",
  },
  {
    code: "brx",
    label: "Bodo",
    native: "बर'",
    short: "BRX",
    locale: "brx-IN",
    speechLocale: "hi-IN",
  },
];

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  tagline: string;
  statusOnline: string;
  statusOffline: string;
  navChat: string;
  navAnalyzer: string;
  navVoice: string;
  navLog: string;
  navSettings: string;
  sidebarKicker: string;
  weatherTitle: string;
  weatherLocation: string;
  weatherHumidity: string;
  weatherRainForecast: string;
  weatherRiskTitle: string;
  weatherRiskText: string;
  logRecordsTracked: string;
  welcomeKicker: string;
  welcomeHeading1: string;
  welcomeHeadingHighlight: string;
  welcomeHeading2: string;
  welcomeSubtitle: string;
  promptCropsTitle: string;
  promptCropsQuery: string;
  promptDiseaseTitle: string;
  promptDiseaseQuery: string;
  promptFertilizerTitle: string;
  promptFertilizerQuery: string;
  promptWeatherTitle: string;
  promptWeatherQuery: string;
  chatPlaceholder: string;
  chatSend: string;
  chatDisclaimer: string;
  chatListen: string;
  chatCopy: string;
  chatCopied: string;
  chatThinking: string;
  analyzerKicker: string;
  analyzerTitle: string;
  analyzerDescription: string;
  uploadTitle: string;
  uploadSubtitle: string;
  uploadBtn: string;
  uploadAnalyzing: string;
  uploadPrivacyNote: string;
  samplesTitle: string;
  samplesSubtitle: string;
  sampleMatch: string;
  reportHeading: string;
  reportConfidence: string;
  reportScreeningAdvice: string;
  reportPathogen: string;
  reportLowConfidenceWarning: string;
  tabOrganic: string;
  tabChemical: string;
  tabPrevention: string;
  actionListen: string;
  actionSaveLog: string;
  actionSaved: string;
  agroContextTitle: string;
  agroContextDesc: string;
  readyForDiagnosis: string;
  readyForDiagnosisDesc: string;
  voiceKicker: string;
  voiceReadyTitle: string;
  voiceListeningTitle: string;
  voiceSubtitle: string;
  voiceStart: string;
  voiceStop: string;
  voiceTranscriptHeading: string;
  voiceUnsureKicker: string;
  voiceTapToHear: string;
  voiceFallbackAlert: string;
  logTitle: string;
  logSubtitle: string;
  logEmptyTitle: string;
  logEmptyDesc: string;
  logStatusUnderTreatment: string;
  logStatusImproved: string;
  logStatusWorsened: string;
  logDismiss: string;
  settingsTitle: string;
  settingsLanguage: string;
  settingsZone: string;
  settingsDismiss: string;
  authSignIn: string;
  authSignOut: string;
  authSignedInAs: string;
  authCloudSynced: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "AgriSathi AI",
    appSubtitle: "কৃষি साथी",
    tagline: "Assam Agricultural Field Lab",
    statusOnline: "Online & Ready",
    statusOffline: "Offline Mode (Local)",
    navChat: "Farm Advisor Chat",
    navAnalyzer: "Crop Image Analyzer",
    navVoice: "Voice Assistant",
    navLog: "Crop Health Log",
    navSettings: "Settings & Region",
    sidebarKicker: "YOUR FARM TODAY",
    weatherTitle: "Weather & Risk",
    weatherLocation: "Rangia, Kamrup",
    weatherHumidity: "84% Humidity",
    weatherRainForecast: "Light rain in 2–3 days",
    weatherRiskTitle: "Fungal Spore Advisory",
    weatherRiskText:
      "High humidity raises risk for rice leaf blast & tomato early blight this week.",
    logRecordsTracked: "records saved",
    welcomeKicker: "YOUR FARMING COMPANION · কৃষি साथी",
    welcomeHeading1: "How can I",
    welcomeHeadingHighlight: "help your farm",
    welcomeHeading2: "today?",
    welcomeSubtitle:
      "Ask me about crop diseases, pest remedies, weather in Assam, fertilizer dosages, or flood-resilient farming techniques.",
    promptCropsTitle: "Best crops for this season",
    promptCropsQuery: "What crops should I cultivate this season in Assam?",
    promptDiseaseTitle: "What disease is on my plant?",
    promptDiseaseQuery: "How can I tell if my plant has a fungal or bacterial disease?",
    promptFertilizerTitle: "Which fertilizer should I use?",
    promptFertilizerQuery: "What fertilizer dosage is recommended for rice transplanting in Assam?",
    promptWeatherTitle: "Weather forecast for my area",
    promptWeatherQuery: "Will it rain in Rangia Kamrup this week before fertilizer spraying?",
    chatPlaceholder: "Ask your farming question about crops, weather, or pests…",
    chatSend: "Send Question",
    chatDisclaimer:
      "On-device AI advisor · Consult an agricultural scientist for confirmed chemical applications",
    chatListen: "Listen to advice",
    chatCopy: "Copy advice",
    chatCopied: "Copied!",
    chatThinking: "AgriSathi is formulating agricultural recommendations…",
    analyzerKicker: "FIELD DIAGNOSTIC LAB · ON-DEVICE TENSORFLOW",
    analyzerTitle: "Crop Health Analyzer",
    analyzerDescription:
      "Evaluate leaf symptoms with our on-device visual classifier. Identify foliar diseases and review integrated organic, chemical, and cultural treatments.",
    uploadTitle: "Photograph or Upload a Leaf",
    uploadSubtitle:
      "Take a sharp, close-up photo of an affected leaf in natural daylight. Ensure lesions and leaf margins are clear.",
    uploadBtn: "Capture / Upload Leaf Photo",
    uploadAnalyzing: "Analyzing Leaf Symptoms…",
    uploadPrivacyNote: "Private on-device inference · Images are analyzed locally and not shared",
    samplesTitle: "Verified Field Diagnostic Samples",
    samplesSubtitle: "Select any exhibition sample to preview diagnostic metrics & treatment:",
    sampleMatch: "match",
    reportHeading: "EXAMINATION REPORT",
    reportConfidence: "Confidence Score",
    reportScreeningAdvice: "Visual Screening Protocol",
    reportPathogen: "Pathogen Group",
    reportLowConfidenceWarning:
      "Low Model Confidence: Leaf symptoms appear ambiguous or atypical. Do not apply chemical fungicides based solely on this image. Have the specimen inspected by an experienced agronomist.",
    tabOrganic: "Organic & Biological",
    tabChemical: "Chemical Safety",
    tabPrevention: "Cultural Prevention",
    actionListen: "Listen to advice",
    actionSaveLog: "Save to Crop Health Log",
    actionSaved: "Saved to Log",
    agroContextTitle: "Local Agro-Climatic Context (Rangia, Kamrup)",
    agroContextDesc:
      "Current relative humidity (84%) creates an active spore incubation window. Avoid foliar spraying within 4 hours of anticipated afternoon showers.",
    readyForDiagnosis: "Ready for Diagnosis",
    readyForDiagnosisDesc:
      "Upload or photograph a leaf above, or tap any verified exhibition sample to inspect full symptoms and management guidelines.",
    voiceKicker: "HANDS-FREE FIELD ASSISTANT",
    voiceReadyTitle: "How can I help your farm today?",
    voiceListeningTitle: "Listening to your voice…",
    voiceSubtitle:
      "Speak clearly about your crops, pest issues, fertilizer needs, or weather in Assam.",
    voiceStart: "Start Speaking",
    voiceStop: "Stop Listening",
    voiceTranscriptHeading: "Speech Transcribed",
    voiceUnsureKicker: "FREQUENT FIELD QUESTIONS",
    voiceTapToHear: "TAP TO HEAR ADVICE",
    voiceFallbackAlert:
      "Voice recognition is not supported in this browser. Please use text input or check microphone permissions.",
    logTitle: "Crop Health Monitoring Log",
    logSubtitle: "Locally saved leaf diagnoses and recovery tracking records.",
    logEmptyTitle: "No Crop Records Saved",
    logEmptyDesc:
      "Analyze a leaf in the Crop Analyzer and click 'Save to Crop Health Log' to monitor its recovery here.",
    logStatusUnderTreatment: "Under Treatment",
    logStatusImproved: "Crop Improved",
    logStatusWorsened: "Worsened",
    logDismiss: "Dismiss",
    settingsTitle: "Field Lab Settings",
    settingsLanguage: "Preferred Language",
    settingsZone: "Agro-Climatic Zone: Lower Brahmaputra Valley (Rangia)",
    settingsDismiss: "Done",
    authSignIn: "Sign in with Google",
    authSignOut: "Sign out",
    authSignedInAs: "Signed in as",
    authCloudSynced: "Cloud Synced",
  },
  as: {
    appName: "কৃষি সাথী AI",
    appSubtitle: "অসমীয়া",
    tagline: "অসম কৃষি ফিল্ড লেব",
    statusOnline: "অনলাইন আৰু সাজু",
    statusOffline: "অফলাইন ম'ড (স্থানীয়)",
    navChat: "কৃষি পৰামৰ্শ কথা-বতৰা",
    navAnalyzer: "শস্যৰ ছবি পৰীক্ষা",
    navVoice: "কণ্ঠ সহায়ক",
    navLog: "শস্যৰ স্বাস্থ্য খতিয়ান",
    navSettings: "ছেটিংছ আৰু অঞ্চল",
    sidebarKicker: "আজি আপোনাৰ পথাৰ",
    weatherTitle: "বতৰ আৰু আশংকা",
    weatherLocation: "ৰঙিয়া, কামৰূপ",
    weatherHumidity: "৮৪% আৰ্দ্ৰতা",
    weatherRainForecast: "২-৩ দিনত পাতলীয়া বৰষুণ",
    weatherRiskTitle: "ভেঁকুৰ ৰোগৰ সতৰ্কবাৰ্তা",
    weatherRiskText: "অধিক আৰ্দ্ৰতাই এই সপ্তাহত ধানৰ ব্লাষ্ট আৰু বিলাহীৰ দাগ ৰোগৰ আশংকা বঢ়ায়।",
    logRecordsTracked: "টা তথ্য সংৰক্ষিত",
    welcomeKicker: "আপোনাৰ খেতিৰ সংগী · কৃষি সাথী",
    welcomeHeading1: "আজি আপোনাৰ খেতিত",
    welcomeHeadingHighlight: "কেনেকৈ সহায় কৰিব",
    welcomeHeading2: "পাৰোঁ?",
    welcomeSubtitle:
      "শস্যৰ ৰোগ, কীট প্ৰতিকাৰ, অসমৰ বতৰ, সাৰৰ মাত্ৰা বা বানপানী সহনশীল খেতিৰ বিষয়ে মোক সোধক।",
    promptCropsTitle: "এই বতৰৰ উত্তম শস্য",
    promptCropsQuery: "অসমত এই বতৰত কোনবোৰ শস্য কৰা উচিত?",
    promptDiseaseTitle: "মোৰ গছত কি ৰোগ হৈছে?",
    promptDiseaseQuery: "মোৰ গছত ভেঁকুৰ নে বেক্টেৰিয়াৰ সংক্ৰমণ হৈছে কেনেকৈ জানিম?",
    promptFertilizerTitle: "কোনটো সাৰ ব্যৱহাৰ কৰিম?",
    promptFertilizerQuery: "অসমত ধান ৰোৱাৰ বাবে কিমান সাৰ প্ৰয়োগ কৰা উচিত?",
    promptWeatherTitle: "মোৰ এলেকাৰ বতৰৰ আগজাননী",
    promptWeatherQuery: "সাৰ দিয়াৰ আগতে এই সপ্তাহত ৰঙিয়াত বৰষুণ হ'ব নেকি?",
    chatPlaceholder: "শস্য, বতৰ বা কীট-পতংগ সম্পৰ্কে আপোনাৰ প্ৰশ্ন সোধক…",
    chatSend: "প্ৰশ্ন পঠিয়াওক",
    chatDisclaimer:
      "অন-ডিভাইচ এআই পৰামৰ্শদাতা · নিৰ্দিষ্ট ৰাসায়নিক স্প্ৰেৰ বাবে কৃষি বিশেষজ্ঞৰ পৰামৰ্শ লওক",
    chatListen: "পৰামৰ্শ শুনক",
    chatCopy: "পৰামৰ্শ কপি কৰক",
    chatCopied: "কপি হ'ল!",
    chatThinking: "কৃষি সাথীয়ে কৃষি পৰামৰ্শ প্ৰস্তুত কৰি আছে…",
    analyzerKicker: "ফিল্ড ডায়েগনিষ্টিক লেব · অন-ডিভাইচ টেনচৰফ্ল'",
    analyzerTitle: "শস্যৰ স্বাস্থ্য পৰীক্ষক",
    analyzerDescription:
      "অন-ডিভাইচ দৃষ্টি পৰীক্ষাৰ জৰিয়তে পাতৰ লক্ষণ পৰীক্ষা কৰক। ৰোগ চিনাক্ত কৰি জৈৱিক, ৰাসায়নিক আৰু প্ৰতিৰোধমূলক বিধান চাওক।",
    uploadTitle: "পাতৰ ফটো তোলক বা আপলোড কৰক",
    uploadSubtitle:
      "প্ৰাকৃতিক পোহৰত আক্ৰান্ত পাতখনৰ এটা স্পষ্ট ফটো তোলক। পাতৰ দাগ স্পষ্ট হোৱাটো নিশ্চিত কৰক।",
    uploadBtn: "পাতৰ ফটো তোলক / বাছক",
    uploadAnalyzing: "পাতৰ লক্ষণ পৰীক্ষা কৰি থকা হৈছে…",
    uploadPrivacyNote: "সম্পূৰ্ণ গোপনীয় অন-ডিভাইচ পৰীক্ষা · কোনো ফটো চাৰ্ভাৰলৈ প্ৰেৰণ কৰা নহয়",
    samplesTitle: "পৰীক্ষিত ফিল্ড নমুনা",
    samplesSubtitle: "সম্পূৰ্ণ লক্ষণ আৰু প্ৰতিকাৰ চাবলৈ যিকোনো নমুনা নিৰ্বাচন কৰক:",
    sampleMatch: "মিল",
    reportHeading: "পৰীক্ষা প্ৰতিবেদন",
    reportConfidence: "বিশ্বাসযোগ্যতা",
    reportScreeningAdvice: "প্ৰাথমিক পৰীক্ষা বিধান",
    reportPathogen: "ৰোগজনক শ্ৰেণী",
    reportLowConfidenceWarning:
      "কম বিশ্বাসযোগ্যতা: পাতৰ লক্ষণবোৰ অস্পষ্ট। কেৱল এই ছবিৰ ভিত্তিত ৰাসায়নিক কীটনাশক ব্যৱহাৰ নকৰিব। জ্যেষ্ঠ কৃষিবিদক দেখুৱাওক।",
    tabOrganic: "জৈৱিক আৰু প্ৰাকৃতিক",
    tabChemical: "ৰাসায়নিক সুৰক্ষা",
    tabPrevention: "প্ৰতিৰোধমূলক যত্ন",
    actionListen: "পৰামৰ্শ শুনক",
    actionSaveLog: "খতিয়ানত সংৰক্ষণ কৰক",
    actionSaved: "সংৰক্ষিত হ'ল",
    agroContextTitle: "স্থানীয় কৃষি-জলবায়ু প্ৰেক্ষাপট (ৰঙিয়া, কামৰূপ)",
    agroContextDesc:
      "বৰ্তমানৰ আৰ্দ্ৰতাই (৮৪%) ভেঁকুৰ বিস্তাৰত সহায় কৰে। দুপৰীয়া বৰষুণৰ সম্ভাৱনা থাকিলে তাৰ ৪ ঘণ্টা আগতে স্প্ৰে নকৰিব।",
    readyForDiagnosis: "পৰীক্ষাৰ বাবে সাজু",
    readyForDiagnosisDesc: "ওপৰত পাতৰ ফটো দিয়ক নাইবা পৰীক্ষিত ৫টা নমুনাৰ এটা বাছি লওক।",
    voiceKicker: "হেণ্ডছ-ফ্ৰী ফিল্ড সহায়ক",
    voiceReadyTitle: "আজি আপোনাৰ খেতিত কেনেকৈ সহায় কৰিম?",
    voiceListeningTitle: "আপোনাৰ মাত শুনি থকা হৈছে…",
    voiceSubtitle: "আপোনাৰ শস্য, কীট, সাৰ বা অসমৰ বতৰ সম্পৰ্কে স্পষ্টকৈ কওক।",
    voiceStart: "কথা কওক",
    voiceStop: "বন্ধ কৰক",
    voiceTranscriptHeading: "কণ্ঠলিপি",
    voiceUnsureKicker: "প্ৰায়ে সোধা কৃষি প্ৰশ্ন",
    voiceTapToHear: "পৰামৰ্শ শুনিবলৈ টিপক",
    voiceFallbackAlert: "এই ব্ৰাউজাৰত কণ্ঠ চিনাক্তকৰণ উপলব্ধ নহয়। অনুগ্ৰহ কৰি লিখি প্ৰশ্ন সোধক।",
    logTitle: "শস্যৰ স্বাস্থ্য খতিয়ান",
    logSubtitle: "স্থানীয়ভাৱে সংৰক্ষিত পাতৰ ৰোগ আৰু আৰোগ্য নিৰীক্ষণ খতিয়ান।",
    logEmptyTitle: "কোনো তথ্য সংৰক্ষিত হোৱা নাই",
    logEmptyDesc: "শস্য পৰীক্ষকত পাত পৰীক্ষা কৰি 'খতিয়ানত সংৰক্ষণ কৰক'ত টিপি ইয়াত যোগ দিয়ক।",
    logStatusUnderTreatment: "চিকিৎসাধীন",
    logStatusImproved: "শস্যৰ উন্নতি হৈছে",
    logStatusWorsened: "অৱস্থা বেয়া হৈছে",
    logDismiss: "বন্ধ কৰক",
    settingsTitle: "ফিল্ড লেব ছেটিংছ",
    settingsLanguage: "পছন্দৰ ভাষা",
    settingsZone: "কৃষি-জলবায়ু মণ্ডল: নিম্ন ব্ৰহ্মপুত্ৰ উপত্যকা (ৰঙিয়া)",
    settingsDismiss: "সম্পূৰ্ণ",
    authSignIn: "Googleৰে প্ৰৱেশ কৰক",
    authSignOut: "প্ৰস্থান কৰক",
    authSignedInAs: "প্ৰৱেশ কৰা হৈছে:",
    authCloudSynced: "ক্লাউডত সংৰক্ষিত",
  },
  bn: {
    appName: "কৃষি সাথী AI",
    appSubtitle: "বাংলা",
    tagline: "আসাম এগ্রিকালচারাল ফিল্ড ল্যাব",
    statusOnline: "অনলাইন ও প্রস্তুত",
    statusOffline: "অফলাইন মোড (লোকাল)",
    navChat: "কৃষি পরামর্শ আলাপ",
    navAnalyzer: "ফসলের ছবি পরীক্ষা",
    navVoice: "ভয়েস সহায়ক",
    navLog: "ফসলের স্বাস্থ্য নথি",
    navSettings: "সেটিংস ও অঞ্চল",
    sidebarKicker: "আজ আপনার খেত",
    weatherTitle: "আবহাওয়া ও ঝুঁকি",
    weatherLocation: "রঙিয়া, কামরূপ",
    weatherHumidity: "৮৪% আর্দ্রতা",
    weatherRainForecast: "২-৩ দিনে হালকা বৃষ্টি",
    weatherRiskTitle: "ছত্রাক রোগের সতর্কতা",
    weatherRiskText: "উচ্চ আর্দ্রতা এই সপ্তাহে ধানের ব্লাস্ট ও টমেটোর দাগ রোগের ঝুঁকি বৃদ্ধি করে।",
    logRecordsTracked: "টি রেকর্ড সংরক্ষিত",
    welcomeKicker: "আপনার চাষের সঙ্গী · কৃষি সাথী",
    welcomeHeading1: "আজ আপনার চাষে",
    welcomeHeadingHighlight: "কীভাবে সাহায্য",
    welcomeHeading2: "করতে পারি?",
    welcomeSubtitle:
      "ফসলের রোগ, পোকা দমন, আসামের আবহাওয়া, সারের মাত্রা বা বন্যা সহনশীল চাষ সম্পর্কে আমাকে জিজ্ঞাসা করুন।",
    promptCropsTitle: "এই মরশুমের সেরা ফসল",
    promptCropsQuery: "আসামে এই মরশুমে কোন ফসল চাষ করা উচিত?",
    promptDiseaseTitle: "আমার গাছে কী রোগ হয়েছে?",
    promptDiseaseQuery: "আমার গাছে ছত্রাক নাকি ব্যাকটেরিয়ার সংক্রমণ হয়েছে কীভাবে বুঝব?",
    promptFertilizerTitle: "কোন সার ব্যবহার করব?",
    promptFertilizerQuery: "আসামে ধান রোপণের জন্য কতটা সার দেওয়া উচিত?",
    promptWeatherTitle: "আমার এলাকার আবহাওয়া পূর্বাভাস",
    promptWeatherQuery: "সার দেওয়ার আগে এই সপ্তাহে রঙিয়া কামরূপে বৃষ্টি হবে কি?",
    chatPlaceholder: "ফসল, আবহাওয়া বা পোকা সম্পর্কে আপনার প্রশ্ন লিখুন…",
    chatSend: "প্রশ্ন পাঠান",
    chatDisclaimer:
      "অন-ডিভাইস এআই পরামর্শদাতা · নিশ্চিত রাসায়নিক প্রয়োগের জন্য কৃষি বিশেষজ্ঞের পরামর্শ নিন",
    chatListen: "পরামর্শ শুনুন",
    chatCopy: "পরামর্শ কপি করুন",
    chatCopied: "কপি হয়েছে!",
    chatThinking: "কৃষি সাথী কৃষি পরামর্শ প্রস্তুত করছে…",
    analyzerKicker: "ফিল্ড ডায়াগনস্টিক ল্যাব · অন-ডিভাইস টেনসরফ্লো",
    analyzerTitle: "ফসলের স্বাস্থ্য পরীক্ষক",
    analyzerDescription:
      "অন-ডিভাইস ভিজ্যুয়াল ক্লাসিফায়ারের সাহায্যে পাতার লক্ষণ পরীক্ষা করুন। রোগ শনাক্ত করে জৈব, রাসায়নিক ও প্রতিরোধমূলক সমাধান দেখুন।",
    uploadTitle: "পাতার ছবি তুলুন বা আপলোড করুন",
    uploadSubtitle:
      "দিনের আলোয় আক্রান্ত পাতার একটি স্পষ্ট ছবি তুলুন। পাতার দাগ ও কিনারা যেন স্পষ্ট থাকে।",
    uploadBtn: "পাতার ছবি তুলুন / বাছাই করুন",
    uploadAnalyzing: "পাতার লক্ষণ বিশ্লেষণ করা হচ্ছে…",
    uploadPrivacyNote: "সম্পূর্ণ ব্যক্তিগত অন-ডিভাইস পরীক্ষা · কোনো ছবি সার্ভারে পাঠানো হয় না",
    samplesTitle: "যাচাইকৃত ফিল্ড নমুনা",
    samplesSubtitle: "সম্পূর্ণ লক্ষণ ও প্রতিকার দেখতে যেকোনো নমুনা নির্বাচন করুন:",
    sampleMatch: "মিল",
    reportHeading: "পরীক্ষা রিপোর্ট",
    reportConfidence: "নির্ভরযোগ্যতা",
    reportScreeningAdvice: "প্রাথমিক স্ক্রিনিং নির্দেশিকা",
    reportPathogen: "রোগসৃষ্টিকারী শ্রেণি",
    reportLowConfidenceWarning:
      "স্বল্প নির্ভরযোগ্যতা: পাতার লক্ষণগুলো স্পষ্ট নয়। শুধু এই ছবির ওপর ভিত্তি করে রাসায়নিক কীটনাশক প্রয়োগ করবেন না। সিনিয়র কৃষি বিশেষজ্ঞের মতামত নিন।",
    tabOrganic: "জৈব ও প্রাকৃতিক",
    tabChemical: "রাসায়নিক নিরাপত্তা",
    tabPrevention: "প্রতিরোধমূলক যত্ন",
    actionListen: "পরামর্শ শুনুন",
    actionSaveLog: "নথিতে সংরক্ষণ করুন",
    actionSaved: "সংরক্ষিত হয়েছে",
    agroContextTitle: "স্থানীয় কৃষি-আবহাওয়া প্রেক্ষাপট (রঙিয়া, কামরূপ)",
    agroContextDesc:
      "বর্তমান আর্দ্রতা (৮৪%) ছত্রাক বিস্তারের অনুকূল। বিকেলের বৃষ্টির সম্ভাবনার ৪ ঘণ্টার মধ্যে স্প্রে করবেন না।",
    readyForDiagnosis: "পরীক্ষার জন্য প্রস্তুত",
    readyForDiagnosisDesc: "উপরে পাতার ছবি আপলোড করুন অথবা ৫টি যাচাইকৃত নমুনার একটি বেছে নিন।",
    voiceKicker: "হ্যান্ডস-ফ্রি ফিল্ড সহকারী",
    voiceReadyTitle: "আজ আপনার চাষে কীভাবে সাহায্য করব?",
    voiceListeningTitle: "আপনার কথা শোনা হচ্ছে…",
    voiceSubtitle: "আপনার ফসল, পোকা, সার বা আসামের আবহাওয়া নিয়ে স্পষ্ট করে বলুন।",
    voiceStart: "কথা বলুন",
    voiceStop: "থামান",
    voiceTranscriptHeading: "কথার প্রতিলিপি",
    voiceUnsureKicker: "প্রচলিত কৃষি প্রশ্নাবলী",
    voiceTapToHear: "পরামর্শ শুনতে ট্যাপ করুন",
    voiceFallbackAlert: "এই ব্রাউজারে ভয়েস রেকগনিশন সমর্থিত নয়। অনুগ্রহ করে লিখে প্রশ্ন করুন।",
    logTitle: "ফসলের স্বাস্থ্য নথি",
    logSubtitle: "স্থানীয়ভাবে সংরক্ষিত পাতার রোগ ও সুস্থতার ট্র্যাকিং রেকর্ড।",
    logEmptyTitle: "কোনো রেকর্ড সংরক্ষিত নেই",
    logEmptyDesc: "ক্রপ অ্যানালাইজারে পাতা পরীক্ষা করে 'নথিতে সংরক্ষণ করুন' বোতামে চাপুন।",
    logStatusUnderTreatment: "চিকিৎসাধীন",
    logStatusImproved: "ফসলের উন্নতি হয়েছে",
    logStatusWorsened: "অবনতি হয়েছে",
    logDismiss: "বন্ধ করুন",
    settingsTitle: "ফিল্ড ল্যাব সেটিংস",
    settingsLanguage: "পছন্দের ভাষা",
    settingsZone: "কৃষি-আবহাওয়া অঞ্চল: নিম্ন ব্রহ্মপুত্র উপত্যকা (রঙিয়া)",
    settingsDismiss: "সম্পন্ন",
    authSignIn: "Google দিয়ে লগইন করুন",
    authSignOut: "লগআউট",
    authSignedInAs: "লগইন করা আছে:",
    authCloudSynced: "ক্লাউডে সংরক্ষিত",
  },
  brx: {
    appName: "AgriSathi AI",
    appSubtitle: "बर'",
    tagline: "Assam Kheti Lab",
    statusOnline: "Online aro Ready",
    statusOffline: "Offline Mode (Local)",
    navChat: "Kheti Salha Rao",
    navAnalyzer: "Crop Photo Analyzer",
    navVoice: "Voice Helper",
    navLog: "Crop Health Log",
    navSettings: "Settings aro Zone",
    sidebarKicker: "DINI NWNGNI KHETI",
    weatherTitle: "Bar-hawa aro Risk",
    weatherLocation: "Rangia, Kamrup",
    weatherHumidity: "84% Humidity",
    weatherRainForecast: "2-3 saano mikham barsha",
    weatherRiskTitle: "Fungus Rog Warning",
    weatherRiskText: "Gwbwr aarjwi hawani rice blast aro tomato blight risk baray.",
    logRecordsTracked: "record do",
    welcomeKicker: "NWNGNI KHETI COMPANION · कृषि साथी",
    welcomeHeading1: "Dini nwngni khetiyao",
    welcomeHeadingHighlight: "mabwrwi modod",
    welcomeHeading2: "khalamnw hanai?",
    welcomeSubtitle:
      "Assamni dhaan, alu, fertilizer, insect remedies aro banphani tolerant crop ni swlw.",
    promptCropsTitle: "Be season ni gaha crop",
    promptCropsQuery: "Assamni be seasonao ma crop ropan khalamnw nangw?",
    promptDiseaseTitle: "Angni phanthao ma rog jadw?",
    promptDiseaseQuery: "Angni cropao fungus na bacteria rog jadw mabwrwi mithinw?",
    promptFertilizerTitle: "Ma fertilizer hwnw nangw?",
    promptFertilizerQuery: "Dhaan ropan khalamnw ma fertilizer dose hwnw nangw?",
    promptWeatherTitle: "Rangiani weather forecast",
    promptWeatherQuery: "Fertilizer spray ni agwi Rangiaao barsha fagwn na?",
    chatPlaceholder: "Crop, weather, insect ni swlw…",
    chatSend: "Question Thang",
    chatDisclaimer: "On-device AI salha · Chemical spray ni agwi agriculture officer ni salha lw",
    chatListen: "Salha khwnaw",
    chatCopy: "Copy khala",
    chatCopied: "Copied!",
    chatThinking: "AgriSathi farming advice formulate khalamdo…",
    analyzerKicker: "FIELD DIAGNOSTIC LAB · TENSORFLOW",
    analyzerTitle: "Crop Health Analyzer",
    analyzerDescription:
      "Leaf photo nwngnan rog check khala. Organic, chemical aro cultural care nwngdw.",
    uploadTitle: "Leaf Photo Khul na Upload Khala",
    uploadSubtitle: "Daylightao leafni clear photo labo. Daag aro edges clear jathwng.",
    uploadBtn: "Leaf Photo Capture / Upload",
    uploadAnalyzing: "Leaf check khalamdo…",
    uploadPrivacyNote: "Private on-device check · Photo serverao thanga",
    samplesTitle: "Field Diagnostic Samples",
    samplesSubtitle: "Symptoms aro treatment nwnwnw sample click khala:",
    sampleMatch: "match",
    reportHeading: "DIAGNOSTIC REPORT",
    reportConfidence: "Confidence Score",
    reportScreeningAdvice: "Visual Screening Protocol",
    reportPathogen: "Pathogen Group",
    reportLowConfidenceWarning:
      "Low Confidence: Leaf symptoms ambiguous. Chemical pesticide da hwnai. Agriculture expert nwngdw.",
    tabOrganic: "Organic & Biological",
    tabChemical: "Chemical Safety",
    tabPrevention: "Cultural Care",
    actionListen: "Salha khwnaw",
    actionSaveLog: "Crop Logao Save Khala",
    actionSaved: "Saved to Log",
    agroContextTitle: "Local Agro Context (Rangia, Kamrup)",
    agroContextDesc:
      "Humidity 84% spore incubation create khala. Barsha ni 4 ghanta agwi spray da khalam.",
    readyForDiagnosis: "Diagnosis Ready",
    readyForDiagnosisDesc: "Leaf photo upload khala na 5 sample ni select khala.",
    voiceKicker: "HANDS-FREE FIELD HELPER",
    voiceReadyTitle: "Dini mabwrwi modod khalamnw hanai?",
    voiceListeningTitle: "Nwngni rao khwnaswngdo…",
    voiceSubtitle: "Crop, pest, fertilizer na Assam weather ni clear rao hwnai.",
    voiceStart: "Rao Fwnai",
    voiceStop: "Stop",
    voiceTranscriptHeading: "Speech Transcript",
    voiceUnsureKicker: "POPULAR FARM QUESTIONS",
    voiceTapToHear: "CLICK TO LISTEN",
    voiceFallbackAlert: "Be browserao speech recognition gwiya. Typing khalanan swlw.",
    logTitle: "Crop Health Monitoring Log",
    logSubtitle: "Local deviceao save jwnai diagnostic history.",
    logEmptyTitle: "Record Gwiya",
    logEmptyDesc: "Leaf analysis khalanan 'Crop Logao Save Khala'ao click khala.",
    logStatusUnderTreatment: "Treatment Chalu",
    logStatusImproved: "Crop Thik Jadw",
    logStatusWorsened: "Crop Kharab Jadw",
    logDismiss: "Dismiss",
    settingsTitle: "Field Lab Settings",
    settingsLanguage: "Language Selection",
    settingsZone: "Agro Zone: Lower Brahmaputra Valley (Rangia)",
    settingsDismiss: "Done",
    authSignIn: "Google Log-in",
    authSignOut: "Log-out",
    authSignedInAs: "User:",
    authCloudSynced: "Cloud-ao Save",
  },
};
