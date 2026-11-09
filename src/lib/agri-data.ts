export type LanguageCode = "en" | "as" | "bn" | "brx";

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

const offlineAdvice: Record<LanguageCode, AdviceByLanguage> = {
  en: {
    rice: "For rice in Assam, keep a shallow water level after transplanting and scout weekly for leaf spots. Remove badly affected leaves and ask your local KVK before applying a pesticide.",
    potato:
      "Check potato leaves for dark, spreading patches, especially after humid weather. Remove affected foliage, avoid overhead watering, and follow local KVK guidance before any spray.",
    tomato:
      "For tomato leaf insects, check the underside for aphids. A small trial of neem oil (5 ml per litre of water) may help; avoid spraying in direct sun and follow the product label.",
    fertilizer:
      "Choose fertilizer after checking the soil and crop stage. Split nitrogen applications rather than applying all at once, and avoid spreading fertilizer just before heavy rain.",
    pest: "Inspect both sides of leaves and look for beneficial insects before treating. Remove heavily infested leaves; use only a labelled product at its stated dose if needed.",
    weather:
      "Rangia/Kamrup sample advisory: humid conditions can raise fungal disease risk. This is not a live forecast—check the local weather service before irrigation or spraying.",
    default:
      "I can help with rice, potato, tomato, fertilizer, pests, and Assam farming. For urgent crop damage, share a clear leaf photo or contact your local KVK. This offline guidance is general, not a live expert diagnosis.",
  },
  as: {
    rice: "অসমত ধানৰ খেতিত ৰোপণৰ পিছত পথাৰত কম পানী ৰাখক আৰু পাতৰ দাগ সপ্তাহত এবাৰ পৰীক্ষা কৰক। বেছি আক্ৰান্ত পাত আঁতৰাই কীটনাশক দিয়াৰ আগতে স্থানীয় কৃষি বিজ্ঞান কেন্দ্ৰৰ পৰামৰ্শ লওক।",
    potato:
      "আৰ্দ্ৰ বতৰত আলুৰ পাতত ক'লা দাগ বিয়পিছে নেকি চাওক। আক্ৰান্ত পাত আঁতৰাওক, ওপৰৰ পৰা পানী নিদিব, আৰু স্প্ৰে কৰাৰ আগতে স্থানীয় কৃষি বিজ্ঞান কেন্দ্ৰৰ পৰামৰ্শ লওক।",
    tomato:
      "টমেটোৰ পাতৰ তলত জাব পোক আছে নেকি চাওক। নিম তেল (প্ৰতি লিটাৰ পানীত ৫ মি.লি.) অলপ ঠাইত পৰীক্ষা কৰিব পাৰে; ৰ'দত স্প্ৰে নকৰিব আৰু সামগ্ৰীৰ নিৰ্দেশনা মানক।",
    fertilizer:
      "মাটি আৰু শস্যৰ অৱস্থা চাই সাৰ বাছনি কৰক। নাইট্ৰজেন সাৰ ভাগে ভাগে দিয়ক আৰু ডাঙৰ বৰষুণৰ আগতে সাৰ নিদিব।",
    pest: "পাতৰ দুয়োফালে পোক আৰু উপকাৰী পোক পৰীক্ষা কৰক। বেছি আক্ৰান্ত পাত আঁতৰাওক; প্ৰয়োজন হ'লে লেবেলত দিয়া সঠিক মাত্ৰাহে ব্যৱহাৰ কৰক।",
    weather:
      "ৰঙিয়া/কামৰূপৰ নমুনা পৰামৰ্শ: আৰ্দ্ৰতাই ভেঁকুৰজনিত ৰোগৰ আশংকা বঢ়াব পাৰে। এইটো বৰ্তমানৰ বতৰৰ পূৰ্বাভাস নহয়—সিঁচা বা স্প্ৰেৰ আগতে স্থানীয় বতৰৰ তথ্য চাওক।",
    default:
      "ধান, আলু, টমেটো, সাৰ, কীট-পতংগ আৰু অসমৰ খেতিৰ বিষয়ে সুধিব পাৰে। শস্যৰ ক্ষতি বেছি হ'লে পাতৰ স্পষ্ট ফটো দিয়ক বা স্থানীয় কৃষি বিজ্ঞান কেন্দ্ৰৰ সৈতে যোগাযোগ কৰক।",
  },
  bn: {
    rice: "অসমে ধান চাষে রোপণের পরে জমিতে অল্প পানি রাখুন এবং সপ্তাহে একবার পাতের দাগ দেখুন। বেশি আক্রান্ত পাতা সরিয়ে কীটনাশক দেওয়ার আগে স্থানীয় কৃষি বিজ্ঞান কেন্দ্রের পরামর্শ নিন।",
    potato:
      "আর্দ্র আবহাওয়ায় আলুর পাতায় কালো দাগ ছড়াচ্ছে কি না দেখুন। আক্রান্ত পাতা সরান, উপর থেকে পানি দেবেন না, এবং স্প্রে করার আগে স্থানীয় কৃষি বিজ্ঞান কেন্দ্রের পরামর্শ নিন।",
    tomato:
      "টমেটো পাতার নিচে জাব পোকা আছে কি না দেখুন। নিম তেল (প্রতি লিটার পানিতে ৫ মি.লি.) ছোট জায়গায় পরীক্ষা করতে পারেন; রোদে স্প্রে করবেন না এবং পণ্যের নির্দেশ মানুন।",
    fertilizer:
      "মাটি ও ফসলের অবস্থা দেখে সার বাছুন। নাইট্রোজেন সার ভাগ করে দিন এবং ভারী বৃষ্টির আগে সার ছড়াবেন না।",
    pest: "পাতার দুই দিক এবং উপকারী পোকা পরীক্ষা করুন। বেশি আক্রান্ত পাতা সরান; প্রয়োজন হলে লেবেলে দেওয়া সঠিক মাত্রা মেনে চলুন।",
    weather:
      "রঙিয়া/কামরূপ নমুনা পরামর্শ: আর্দ্রতায় ছত্রাকজনিত রোগের ঝুঁকি বাড়তে পারে। এটি সরাসরি আবহাওয়ার পূর্বাভাস নয়—সেচ বা স্প্রের আগে স্থানীয় আবহাওয়া দেখুন।",
    default:
      "ধান, আলু, টমেটো, সার, পোকা এবং অসমের চাষ নিয়ে জিজ্ঞাসা করুন। ফসলের ক্ষতি বেশি হলে পাতার পরিষ্কার ছবি দিন বা স্থানীয় কৃষি বিজ্ঞান কেন্দ্রের সঙ্গে যোগাযোগ করুন।",
  },
  brx: {
    rice: "Assamni dhaan khetiyao, ropan ni jabai khethawao gwdanwi da. Patni thikhriyao saptayao nwngdw. Affected pat fwnai, pesticide hwnai agwi local KVK ni salha lw.",
    potato:
      "Aarjwi hawani alu patayao gala daag thangnw nanga. Affected pat fwnai, paani uparni hwnai, spray ni agwi local KVK ni salha lw.",
    tomato:
      "Tomato patni gwnangaw aphid da nanga nwngdw. Neem oil (liter paaniyawo 5 ml) gwsw jagayao test khala; gwswni spray hwnai, product label ni salha lw.",
    fertilizer:
      "Matini aro crop ni stage ni gwdan fertilizer khwnai. Nitrogen khwnai bhag-bhag hwnai aro gwswni barsha ni agwi fertilizer hwnai nanga.",
    pest: "Patni gwsw aro gwnang beneficial insect nwngdw. Gwsw affected pat fwnai; proyojan jao label ni dose manai.",
    weather:
      "Rangia/Kamrup sample advice: aarjwi hawani fungus rog ni risk baray. Be live forecast nonga—irrigation aro spray ni agwi local forecast nwngdw.",
    default:
      "Dhaan, alu, tomato, fertilizer, pest aro Assamni khetiyao swlw. Crop damage gwsw jao patni clear photo hwnai, aro local KVK ni salha lw.",
  },
};

export function getOfflineAnswer(question: string, language: LanguageCode = "en") {
  const query = question.toLocaleLowerCase();
  const advice = offlineAdvice[language];
  if (/\b(rice|paddy|ধান|চাউল)\b/.test(query)) return advice.rice;
  if (/\b(potato|আলু|alu)\b/.test(query)) return advice.potato;
  if (/\b(tomato|টমেটো|tomato)\b/.test(query)) return advice.tomato;
  if (/fertili[sz]er|urea|সাৰ|সার/.test(query)) return advice.fertilizer;
  if (/pest|insect|aphid|bug|পোক|কীট/.test(query)) return advice.pest;
  if (/weather|rain|forecast|বতৰ|আবহাওয়া|বৃষ্টি/.test(query)) return advice.weather;
  return advice.default;
}

type UiCopy = {
  chat: string;
  analyzer: string;
  voice: string;
  ready: string;
  ask: string;
  send: string;
  welcome: string;
  welcomeSub: string;
  listen: string;
  log: string;
  expert: string;
  camera: string;
  offline: string;
};

export const uiCopy: Record<LanguageCode, UiCopy> = {
  en: {
    chat: "Chat",
    analyzer: "Crop Image Analyzer",
    voice: "Voice Assistant",
    ready: "Offline ready",
    ask: "Ask about crops, pests, soil, or weather…",
    send: "Send",
    welcome: "Namaste! I’m AgriSathi",
    welcomeSub: "Your farming assistant for crop care, pests, weather and more.",
    listen: "Listen to advice",
    log: "My crop log",
    expert: "Ask an expert",
    camera: "Open camera / upload a leaf photo",
    offline: "Offline guidance • General advice",
  },
  as: {
    chat: "কথা-বতৰা",
    analyzer: "শস্যৰ ছবি পৰীক্ষা",
    voice: "কণ্ঠ সহায়ক",
    ready: "অফলাইন সাজু",
    ask: "শস্য, কীট, মাটি বা বতৰৰ বিষয়ে সোধক…",
    send: "পঠিয়াওক",
    welcome: "নমস্কাৰ! মই কৃষি সাথী",
    welcomeSub: "শস্যৰ যত্ন, কীট-পতংগ আৰু বতৰৰ সহায়ক।",
    listen: "পৰামৰ্শ শুনক",
    log: "মোৰ শস্যৰ খতিয়ান",
    expert: "বিশেষজ্ঞক সোধক",
    camera: "কেমেৰা খোলক / পাতৰ ফটো দিয়ক",
    offline: "অফলাইন পৰামৰ্শ • সাধাৰণ তথ্য",
  },
  bn: {
    chat: "আলাপ",
    analyzer: "ফসলের ছবি পরীক্ষা",
    voice: "ভয়েস সহায়ক",
    ready: "অফলাইনে প্রস্তুত",
    ask: "ফসল, পোকা, মাটি বা আবহাওয়া সম্পর্কে জিজ্ঞাসা করুন…",
    send: "পাঠান",
    welcome: "নমস্কার! আমি কৃষি সাথী",
    welcomeSub: "ফসলের যত্ন, পোকা ও আবহাওয়ার সহায়ক।",
    listen: "পরামর্শ শুনুন",
    log: "আমার ফসলের নথি",
    expert: "বিশেষজ্ঞকে জিজ্ঞাসা",
    camera: "ক্যামেরা খুলুন / পাতার ছবি দিন",
    offline: "অফলাইন পরামর্শ • সাধারণ তথ্য",
  },
  brx: {
    chat: "Rao",
    analyzer: "Crop Photo NWngdw",
    voice: "Voice Helper",
    ready: "Offline ready",
    ask: "Crop, insect, matini aro weather swlw…",
    send: "Thang",
    welcome: "Namaste! Ang AgriSathi",
    welcomeSub: "Crop care, pest aro weather ni helper.",
    listen: "Advice khw",
    log: "Angni Crop Log",
    expert: "Expert ni swlw",
    camera: "Camera khul / Leaf photo hwnai",
    offline: "Offline advice • General info",
  },
};
