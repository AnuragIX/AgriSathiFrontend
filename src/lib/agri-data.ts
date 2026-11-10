import { translations, type LanguageCode } from "./i18n";

export type { LanguageCode };

export type DiseaseSample = {
  id: string;
  crop: string;
  disease: string;
  pathogen: string;
  confidence: number;
  healthy?: boolean;
};

export type CropLogEntry = DiseaseSample & {
  imageUrl?: string;
  status: "Under Treatment" | "Crop Improved" | "Worsened";
  createdAt: string;
};

export const DIAGNOSIS_ESCALATION_THRESHOLD = 65;

export const diseaseSamples: DiseaseSample[] = [
  { id: "rice-blast", crop: "Rice", disease: "Leaf blast", pathogen: "Fungus", confidence: 96.4 },
  {
    id: "potato-blight",
    crop: "Potato",
    disease: "Late blight",
    pathogen: "Fungus",
    confidence: 94.8,
  },
  {
    id: "tomato-blight",
    crop: "Tomato",
    disease: "Early blight",
    pathogen: "Fungus",
    confidence: 92.1,
  },
  { id: "tea-rust", crop: "Tea", disease: "Red rust", pathogen: "Algae", confidence: 54 },
  {
    id: "healthy-paddy",
    crop: "Paddy",
    disease: "Healthy leaf",
    pathogen: "None",
    confidence: 99.1,
    healthy: true,
  },
];

export function needsExpertReview(confidence: number) {
  return confidence < DIAGNOSIS_ESCALATION_THRESHOLD;
}

type AdviceTopic = "rice" | "potato" | "tomato" | "fertilizer" | "pest" | "weather" | "default";
type AdviceByLanguage = Record<AdviceTopic, string>;

// Clean, KVK-free regional agricultural advisory
const offlineAdvice: Record<LanguageCode, AdviceByLanguage> = {
  en: {
    rice: "For rice in Assam, maintain a shallow 2–3 cm water level after transplanting and scout weekly for spindle-shaped blast lesions. Remove badly affected leaves. Apply cold-pressed neem oil (5 ml/L) or an approved foliar fungicide if blast spots exceed field threshold.",
    potato:
      "Check potato leaves for dark water-soaked patches, especially during humid Assam winters. Remove affected foliage immediately, avoid overhead sprinkler watering, and spray copper oxychloride or Mancozeb before infection spreads.",
    tomato:
      "For tomato leaf pests, check the undersides for aphids and whiteflies. Prepare a bio-spray of neem seed kernel extract (NSKE 5%) with a few drops of mild soap. Spray during early morning or late afternoon away from direct sun.",
    fertilizer:
      "Choose fertilizer based on soil testing and crop vegetative stage. Apply nitrogen in three split doses (basal, tillering, and panicle initiation) rather than all at once. Never broadcast urea immediately before heavy rainfall.",
    pest: "Inspect both upper and lower leaf surfaces for caterpillars, mites, and beneficial predators like ladybird beetles. Remove heavily damaged leaves and use targeted biological sprays before resorting to chemical options.",
    weather:
      "Rangia/Kamrup agro-climatic advisory: relative humidity at 84% creates favorable conditions for fungal spore germination. Ensure field drainage channels are clear before anticipated light showers.",
    default:
      "I can assist with rice, potato, tomato, fertilizer management, pest control, and Assam agro-climatic practices. Share a clear leaf photo in the analyzer or ask your specific crop question.",
  },
  as: {
    rice: "অসমত ধানৰ খেতিত ৰোপণৰ পিছত পথাৰত পাতল ২-৩ ছে.মি. পানী ৰাখক আৰু পাতৰ ব্লাষ্ট দাগ পৰীক্ষা কৰক। বেছি আক্ৰান্ত পাত আঁতৰাওক আৰু প্ৰয়োজন হ'লে অনুমোদিত ভেঁকুৰনাশক স্প্ৰে কৰক।",
    potato:
      "আৰ্দ্ৰ বতৰত আলুৰ পাতত ক'লা দাগ বিয়পিছে নেকি লক্ষ্য কৰক। আক্ৰান্ত পাত তৎক্ষণাৎ আঁতৰাওক, ওপৰৰ পৰা পানী নিদিব আৰু সংক্ৰমণ ৰোধৰ বাবে মেনক'জেব স্প্ৰে কৰক।",
    tomato:
      "টমেটোৰ পাতৰ তলত জাব পোক বা বগা মাখি আছে নেকি চাওক। নিম তেল (প্ৰতি লিটাৰ পানীত ৫ মি.লি.) সামান্য চাবোনৰ লগত মিহলাই পুৱা বা গধূলি স্প্ৰে কৰক।",
    fertilizer:
      "মাটি আৰু শস্যৰ বৃদ্ধি চাই সাৰ বাছক। নাইট্ৰজেন সাৰ তিনিটা কিস্তিত (ৰোপণৰ সময়ত, পোখা মেলাৰ সময়ত আৰু থোৰ ওলোৱাৰ সময়ত) দিয়ক। বৰষুণৰ ঠিক আগতে ইউৰিয়া নিসিঁচিব।",
    pest: "পাতৰ দুয়োফালে পোক আৰু উপকাৰী পোক পৰীক্ষা কৰক। বেছি আক্ৰান্ত পাত আঁতৰাওক আৰু প্ৰথমে জৈৱিক পদ্ধতি প্ৰয়োগ কৰক।",
    weather:
      "ৰঙিয়া/কামৰূপৰ বতৰৰ পৰামৰ্শ: ৮৪% আৰ্দ্ৰতাই ভেঁকুৰজনিত ৰোগৰ আশংকা বঢ়াব পাৰে। বৰষুণৰ আগতে পথাৰৰ পানী নিষ্কাশনৰ নলাবোৰ পৰিষ্কাৰ কৰি ৰাখক।",
    default:
      "ধান, আলু, বিলাহী, সাৰ প্ৰয়োগ, কীট-পতংগ আৰু অসমৰ খেতিৰ বিষয়ে সুধিব পাৰে। শস্য পৰীক্ষকত পাতৰ স্পষ্ট ফটো তুলি নিদান লাভ কৰক।",
  },
  bn: {
    rice: "অসমে ধান চাষে রোপণের পর জমিতে ২-৩ সেমি পানি রাখুন এবং সপ্তাহে একবার ব্লাস্ট রোগের দাগ পরীক্ষা করুন। বেশি আক্রান্ত পাতা সরিয়ে অনুমোদিত ছত্রাকনাশক স্প্রে করুন।",
    potato:
      "আর্দ্র আবহাওয়ায় আলুর পাতায় কালো দাগ ছড়াচ্ছে কি না দেখুন। আক্রান্ত পাতা সরিয়ে ফেলুন, উপরিভাগে জল ছেটাবেন না এবং ম্যানকোজেব স্প্রে করে সংক্রমণ রোধ করুন।",
    tomato:
      "টমেটো পাতার নিচে জাব পোকা আছে কি না দেখুন। নিম তেল (প্রতি লিটার পানিতে ৫ মি.লি.) সামান্য সাবান জলে মিশিয়ে সকালে বা বিকেলে স্প্রে করুন।",
    fertilizer:
      "মাটি ও ফসলের অবস্থা দেখে সার নির্বাচন করুন। নাইট্রোজেন সার তিন কিস্তিতে দিন। ভারী বৃষ্টির ঠিক আগে ইউরিয়া জমিতে ছড়াবেন না।",
    pest: "পাতার দুই দিক এবং উপকারী পোকা পর্যবেক্ষণ করুন। বেশি আক্রান্ত পাতা সরান এবং যথাসম্ভব জৈব বালাইনাশক ব্যবহার করুন।",
    weather:
      "রঙিয়া/কামরূপ কৃষি-আবহাওয়া পরামর্শ: ৮৪% আর্দ্রতায় ছত্রাকজনিত রোগের ঝুঁকি বাড়তে পারে। বৃষ্টির আগে নিকাশী নালা পরিষ্কার রাখুন।",
    default:
      "ধান, আলু, টমেটো, সার প্রয়োগ, পোকা দমন এবং আসামের চাষাবাদ নিয়ে প্রশ্ন করুন। ক্রপ অ্যানালাইজারে পাতার স্পষ্ট ছবি দিয়ে পরামর্শ নিন।",
  },
  brx: {
    rice: "Assamni dhaan khetiyao, ropan ni jabai khethawao 2-3 cm paani da. Blast daag saptayao nwngdw. Affected pat fwnai, aro foliar spray khalam.",
    potato:
      "Aarjwi hawani alu patayao gala daag thangnw nanga. Affected pat fwnai, paani uparni hwnai nanga, aro Mancozeb spray khalam.",
    tomato:
      "Tomato patni gwnangaw aphid da nanga nwngdw. Neem oil (liter paaniyawo 5 ml) milai spray khala; san dwi spray da khalam.",
    fertilizer:
      "Matini aro crop stage ni gwdan fertilizer khwnai. Nitrogen khwnai 3 bhagao hwnai aro barsha ni agwi urea hwnai nanga.",
    pest: "Patni gwsw aro gwnang beneficial insect nwngdw. Gwsw affected pat fwnai; biological spray agwi apply khalam.",
    weather:
      "Rangia/Kamrup weather advice: 84% humidityao fungus rog ni risk baray. Barsha ni agwi drainage channel clear da.",
    default:
      "Dhaan, alu, tomato, fertilizer, pest aro Assamni khetiyao swlw. Crop analyzer-ao leaf photo hwnan advice lw.",
  },
};

export function getOfflineAnswer(question: string, language: LanguageCode = "en"): string {
  const query = question.toLocaleLowerCase();
  const advice = offlineAdvice[language] ?? offlineAdvice.en;
  if (/\b(rice|paddy|ধান|চাউল|dhaan)\b/.test(query)) return advice.rice;
  if (/\b(potato|আলু|alu)\b/.test(query)) return advice.potato;
  if (/\b(tomato|টমেটো|বিলাহী)\b/.test(query)) return advice.tomato;
  if (/fertili[sz]er|urea|সাৰ|সার|saar/.test(query)) return advice.fertilizer;
  if (/pest|insect|aphid|bug|পোক|কীট|pok/.test(query)) return advice.pest;
  if (/weather|rain|forecast|বতৰ|আবহাওয়া|বৃষ্টি|barsha/.test(query)) return advice.weather;
  return advice.default;
}

// Backward-compatible UI copy adapter for components & tests
export const uiCopy = {
  en: {
    chat: translations.en.navChat,
    analyzer: translations.en.navAnalyzer,
    voice: translations.en.navVoice,
    ready: translations.en.statusOnline,
    ask: translations.en.chatPlaceholder,
    send: translations.en.chatSend,
    welcome: "Namaste! I'm AgriSathi",
    welcomeSub: translations.en.welcomeSubtitle,
    listen: translations.en.chatListen,
    log: translations.en.navLog,
    expert: "Agricultural Scientist",
    camera: translations.en.uploadBtn,
    offline: translations.en.statusOffline,
  },
  as: {
    chat: translations.as.navChat,
    analyzer: translations.as.navAnalyzer,
    voice: translations.as.navVoice,
    ready: translations.as.statusOnline,
    ask: translations.as.chatPlaceholder,
    send: translations.as.chatSend,
    welcome: "নমস্কাৰ! মই কৃষি সাথী",
    welcomeSub: translations.as.welcomeSubtitle,
    listen: translations.as.chatListen,
    log: translations.as.navLog,
    expert: "কৃষি বিজ্ঞানী",
    camera: translations.as.uploadBtn,
    offline: translations.as.statusOffline,
  },
  bn: {
    chat: translations.bn.navChat,
    analyzer: translations.bn.navAnalyzer,
    voice: translations.bn.navVoice,
    ready: translations.bn.statusOnline,
    ask: translations.bn.chatPlaceholder,
    send: translations.bn.chatSend,
    welcome: "নমস্কার! আমি কৃষি সাথী",
    welcomeSub: translations.bn.welcomeSubtitle,
    listen: translations.bn.chatListen,
    log: translations.bn.navLog,
    expert: "কৃষি বিজ্ঞানী",
    camera: translations.bn.uploadBtn,
    offline: translations.bn.statusOffline,
  },
  brx: {
    chat: translations.brx.navChat,
    analyzer: translations.brx.navAnalyzer,
    voice: translations.brx.navVoice,
    ready: translations.brx.statusOnline,
    ask: translations.brx.chatPlaceholder,
    send: translations.brx.chatSend,
    welcome: "Namaste! Ang AgriSathi",
    welcomeSub: translations.brx.welcomeSubtitle,
    listen: translations.brx.chatListen,
    log: translations.brx.navLog,
    expert: "Agriculture Officer",
    camera: translations.brx.uploadBtn,
    offline: translations.brx.statusOffline,
  },
};
