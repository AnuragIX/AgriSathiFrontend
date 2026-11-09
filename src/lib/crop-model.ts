import { diseaseSamples, type DiseaseSample } from "@/lib/agri-data";

// Labels follow the common 38-label PlantVillage leaf-classification order.
const plantVillageLabels = [
  "Apple___Apple_scab",
  "Apple___Black_rot",
  "Apple___Cedar_apple_rust",
  "Apple___healthy",
  "Blueberry___healthy",
  "Cherry_(including_sour)___Powdery_mildew",
  "Cherry_(including_sour)___healthy",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
  "Corn_(maize)___Common_rust_",
  "Corn_(maize)___Northern_Leaf_Blight",
  "Corn_(maize)___healthy",
  "Grape___Black_rot",
  "Grape___Esca_(Black_Measles)",
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
  "Grape___healthy",
  "Orange___Haunglongbing_(Citrus_greening)",
  "Peach___B bacterial_spot",
  "Peach___healthy",
  "Pepper,_bell___Bacterial_spot",
  "Pepper,_bell___healthy",
  "Potato___Early_blight",
  "Potato___Late_blight",
  "Potato___healthy",
  "Raspberry___healthy",
  "Soybean___healthy",
  "Squash___Powdery_mildew",
  "Strawberry___Leaf_scorch",
  "Strawberry___healthy",
  "Tomato___Bacterial_spot",
  "Tomato___Early_blight",
  "Tomato___Late_blight",
  "Tomato___Leaf_Mold",
  "Tomato___Septoria_leaf_spot",
  "Tomato___Spider_mites Two-spotted_spider_mite",
  "Tomato___Target_Spot",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
  "Tomato___Tomato_mosaic_virus",
  "Tomato___healthy",
];

let modelPromise: Promise<import("@tensorflow/tfjs").LayersModel | null> | undefined;

async function loadModel() {
  try {
    const response = await fetch("/model/model.json", { method: "HEAD" });
    if (!response.ok) return null;
    const tf = await import("@tensorflow/tfjs");
    await tf.ready();
    return await tf.loadLayersModel("/model/model.json");
  } catch {
    return null;
  }
}

export async function classifyLeaf(
  file: File,
): Promise<{ diagnosis: DiseaseSample; simulated: boolean }> {
  modelPromise ??= loadModel();
  const model = await modelPromise;
  if (model) {
    try {
      const tf = await import("@tensorflow/tfjs");
      const image = await createImageBitmap(file);
      const tensor = tf.browser
        .fromPixels(image)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(255)
        .expandDims(0);
      image.close();
      const prediction = model.predict(tensor);
      const outputTensor = Array.isArray(prediction) ? prediction[0] : prediction;
      if (!outputTensor) throw new Error("The crop model returned no prediction.");
      const values = Array.from(await outputTensor.data());
      const bestIndex = values.reduce<number>(
        (best, value, index) => (value > (values[best] ?? 0) ? index : best),
        0,
      );
      tensor.dispose();
      if (Array.isArray(prediction)) prediction.forEach((part) => part.dispose());
      else prediction.dispose();
      const label = plantVillageLabels[bestIndex];
      if (label) {
        const [cropName, condition] = label.split("___");
        const crop = cropName?.replaceAll("_", " ").replace("(maize)", "") ?? "Leaf";
        const healthy = condition?.toLowerCase().includes("healthy") ?? false;
        const confidence = Math.round((values[bestIndex] ?? 0) * 1000) / 10;
        return {
          diagnosis: {
            id: `model-${Date.now()}`,
            crop: crop.trim(),
            disease: condition?.replaceAll("_", " ") ?? "Uncertain leaf condition",
            pathogen: healthy ? "None" : "Possible disease",
            confidence,
            healthy,
          },
          simulated: false,
        };
      }
    } catch {
      // Use the transparent demo result below when a model file is incompatible.
    }
  }
  const fallback = diseaseSamples.find((sample) => sample.id === "tea-rust");
  if (!fallback) throw new Error("No fallback leaf result is available.");
  return {
    diagnosis: {
      ...fallback,
      id: `demo-${Date.now()}`,
      crop: "Uploaded leaf",
      disease: "Needs a closer look",
      confidence: 54,
    },
    simulated: true,
  };
}
