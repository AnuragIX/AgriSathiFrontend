# Agrisathiai

Build "AgriSathi (कृषि साथी)", a responsive, offline-capable AI agricultural assistant web application built with React, TypeScript, Tailwind CSS, and Lucide React icons. Match the exact visual layout, light botanical color palette, 3-tab navigation, and 3D Assamese farmer mascot system described below.

====================================================================

1. COLOR PALETTE & DESIGN TOKENS (LIGHT BOTANICAL THEME)

====================================================================

- Primary Canvas Background: Warm off-white / pale mint (#F8FAF7)

- Card / Surface Background: Pure white (#FFFFFF) with subtle border (#E6EFE8) and soft shadow (0 2px 10px rgba(20, 54, 27, 0.04))

- Primary Brand Forest Green: #1B4D20 (Logo text, primary headings, active states)

- Action / Send Button Green: #28662B (Hover: #1E4E20)

- Active Tab & User Bubble Pastel Green: #DCFCE7 / #E3F6E5

- Leaf Emblem Accent Green: #34A853 / #22C55E

- Primary Text Ink: #14361B (Headings) and #1F2937 (Body copy)

- Secondary Muted Text: #4A6B53 / #6B7280

- Typography: Inter or Plus Jakarta Sans. Clean, high-contrast, accessible sizing for farmers.

====================================================================

2. TOP NAVIGATION BAR & GLOBAL CONTROLS

====================================================================

Create a sticky top navigation bar (h-16, bg-white, border-b border-[#E5ECE6], px-6, flex items-center justify-between):

- Left Brand Identity:

  - Two-leaf green sprout SVG icon + bold dark-green wordmark "AgriSathi" (text-2xl, font-bold, text-[#1B4D20]), followed by a vertical divider (h-6 w-[1px] bg-gray-200).

- Center Navigation Tabs (3 Core Views):

  1. "Chat" (MessageCircle icon): Active state features a soft green pill background (bg-[#D8F3DC] text-[#1B4D20] font-semibold px-4 py-1.5 rounded-full) and a 2px bottom indicator bar in #28662B.

  2. "Crop Image Analyzer" (Image/Scan icon): Switches main view to the TensorFlow.js 38-class leaf disease scanner.

  3. "Voice Assistant" (Mic icon): Switches main view to the full-screen multilingual voice interaction mode.

- Right Utility Controls:

  - Language & Audio Selector Pill: Dropdown to switch UI and Text-to-Speech (TTS) language between:

    - English

    - অসমীয়া (Assamese)

    - বাংলা (Bengali)

    - बर' (Bodo)

  - Offline Edge AI Badge: Green pulsing dot + "Offline Ready (TF.js Cached)" indicator showing the app works in low-network rural areas.

====================================================================

3. LEFT SCENIC PANEL & RETRACTABLE FARM DRAWER

====================================================================

- On desktop, render a left vertical column (w-56 to w-64, hidden on mobile or toggleable via drawer):

  - Background: A serene painterly illustration of sunlit green crop rows leading to a small traditional Assamese farmhouse under a soft morning sky, fading smoothly into the #F8FAF7 background at the top.

  - Overlay 3 compact glassmorphic quick-widgets stacked cleanly at the top of the sidebar:

    1. "Weather & Disease Risk" Widget: Shows local Rangia/Kamrup weather (e.g., "27°C · 84% Humidity · Light Rain in 2–3 days") + Seasonal Context Alert ("High humidity increases Fungal Blast & Blight risk this week").

    2. "Saved Crop History" Mini-Counter: Shows number of tracked diagnoses and a button to open the "Disease Monitoring Log" modal.

    3. "KVK Expert Help" Button: Quick trigger to submit uncertain cases to an agricultural scientist.

====================================================================

4. MASCOT SYSTEM ("SATHI" — 3D ASSAMESE FARMER CHARACTER)

====================================================================

Create a reusable `<MascotAvatar pose="..." />` component supporting uploaded sprite images (with clean SVG/avatar fallbacks) representing our 3D mascot—a friendly young Assamese farmer in a cream kurta, green leaf-emblem vest, and traditional white-and-red patterned Assamese Gamosa scarf:

- `pose="greeting"`: Waving with open palm (Used in Chat welcome header).

- `pose="inspecting"`: Kneeling with magnifying glass over a young green sprout (Used in Crop Image Analyzer dropzone).

- `pose="excited"`: Holding magnifying glass and cheering (Used when disease diagnosis confidence >= 80%).

- `pose="tablet"`: Pointing at a digital tablet with the green leaf logo (Used on Treatment Protocol & Weather Context cards).

- `pose="celebrating"`: Both arms raised in victory (Used when a leaf is "Healthy" or marked "Improved" in Disease Monitoring).

- `pose="thinking"`: Holding tablet to chin with a green "?" icon (Used when diagnosis confidence < 65%, prompting Expert Assistance).

====================================================================

5. VIEW 1: CHAT INTERFACE (DEFAULT LANDING VIEW)

====================================================================

Match the exact screenshot layout:

- Welcome Banner (Top of chat container):

  - Left: 56x56px pale green circle (#E2F5E6) with the dark green two-leaf sprout icon (or Greeting Mascot).

  - Right:

    - Heading: "Namaste! I’m AgriSathi 👋" (text-2xl font-bold text-[#14361B])

    - Subtitle: "Your farming assistant for crop care, pest control, weather and more." (text-[#4A6B53])

- Pre-populated Conversation Thread (with "Listen in Assamese/Bengali/Bodo" speaker icon on every AI message):

  1. User Bubble (Right-aligned, bg-[#E3F6E5], text-[#1E3A23], rounded-2xl px-4 py-3, with a small user outline icon inside the left of the bubble):

     "What is the best time to sow wheat?"

  2. AgriSathi Response (Left-aligned, circular leaf avatar on left, white card bg-white border border-[#EAEFEA] rounded-2xl p-4 shadow-sm max-w-xl):

     "The best time to sow wheat is from mid-November to mid-December. This gives good growth and higher yield."

  3. User Bubble (Right-aligned):

     "My tomato plants have small insects on the leaves. What should I do?"

  4. AgriSathi Response (Left-aligned white card with bullet list):

     "They could be aphids. You can:

     • Spray neem oil (5 ml per liter of water), or

     • Use a mild insecticidal soap.

     Also, remove heavily infested leaves."

  5. User Bubble (Right-aligned):

     "Will it rain in my area this week?"

  6. AgriSathi Response (Left-aligned white card):

     "Yes, light to moderate rain is likely in your area in the next 2–3 days. It’s a good time for irrigation and fertilizer application."

- Bottom Sticky Input Bar:

  - Full-width rounded-full container (bg-white, border border-[#D5E2D7], px-4 py-2, shadow-sm, flex items-center gap-3).

  - Left: Microphone icon button (triggers browser Speech-to-Text) + vertical divider line.

  - Center: Text input with placeholder `"Ask about crops, pests, soil, or weather..."`.

  - Right: Pill-shaped dark green send button (bg-[#28662B] text-white px-5 py-2 rounded-full) with a white paper-plane Send icon.

  - Include local smart-matching logic so new questions about rice, potato, tomato, fertilizer, pests, or Assam weather return instant offline-capable agricultural answers.

====================================================================

6. VIEW 2: CROP IMAGE ANALYZER (38-CLASS EDGE AI & 5 CORE FEATURES)

====================================================================

When the user clicks "Crop Image Analyzer" in the top bar:

- Camera & Upload Card:

  - Features the Mascot in `pose="inspecting"` (with magnifying glass).

  - Large button: "Open Camera / Upload Leaf Photo" (`<input type="file" accept="image/*" capture="environment" />`).

  - TensorFlow.js Integration Hook: Load `/model/model.json` from the `public/model` folder if present, with an automatic smooth fallback simulator so the app works immediately in preview.

  - Quick Exhibition Sample Strip (One-tap test buttons for judges):

    - [Rice Leaf Blast (96.4%)]

    - [Potato Late Blight (94.8%)]

    - [Tomato Early Blight (92.1%)]

    - [Tea Red Rust - Uncertain (54.0%)] -> Demonstrates low-confidence Expert Escalation!

    - [Healthy Paddy Leaf (99.1%)]

- Comprehensive Diagnostic Output Card:

  - Header: Crop & Disease Name, Pathogen Type (Fungus/Bacteria/Virus/Pest), and Confidence Badge.

  - Feature 1 (Regional Language & Voice Support): Prominent "🔊 Listen to Advice" button that reads the diagnosis and dosage aloud in the selected language (Assamese/Bengali/Bodo/English) using Web Speech API / audio playback so farmers don't have to read complex terms.

  - Actionable Remedy Tabs (NCERT Class 9 Chapter 15 aligned):

    - Organic / Biological Control (e.g., Neem oil 5ml/L, Trichoderma viride)

    - Chemical Control (Exact safe fungicide/pesticide dosage per liter)

    - Cultural & Preventive Practices (Crop rotation, drainage)

  - Feature 5 (Weather & Seasonal Risk Context Card): Connects current weather ("84% Humidity + Rain likely in 2-3 days") to the diagnosis (e.g., "Warning: Upcoming rain will wash away foliar sprays; apply organic sticker or wait 48h").

  - Feature 4 (Disease Monitoring Action): "Save to My Crop Log" button. Opens the Disease Monitoring tracker (stored in `localStorage`) where farmers view past diagnoses and toggle status between `[Under Treatment]`, `[Crop Improved ✅]`, or `[Worsened ⚠️]`.

  - Feature 3 (Expert Assistance Escalation): Whenever confidence is <65% (or when the user clicks "Ask Agricultural Expert"), display the Mascot in `pose="thinking"` (?) and open a 1-click form to submit the leaf photo, GPS/district, and voice note to a Krishi Vigyan Kendra (KVK) specialist.

====================================================================

7. VIEW 3: VOICE ASSISTANT (HANDS-FREE REGIONAL VOICE MODE)

====================================================================

When the user clicks "Voice Assistant" in the top bar:

- Center stage shows the 3D Mascot (`pose="greeting"` / speaking animation) surrounded by soft pulsing green acoustic rings.

- Language selector pills at top: `[অসমীয়া Assamese] [বাংলা Bengali] [बर' Bodo] [English]`.

- Big tap-to-speak microphone button with live waveform visualization and clickable voice prompt chips for farmers who prefer speaking and listening over typing.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://agrisathiai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/38e62c78-6103-40c7-9bc1-c5e5b1c7f12d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
