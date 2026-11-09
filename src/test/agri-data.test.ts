import { describe, expect, it } from "vitest";
import {
  DIAGNOSIS_ESCALATION_THRESHOLD,
  diseaseSamples,
  getOfflineAnswer,
  needsExpertReview,
  uiCopy,
  type LanguageCode,
} from "@/lib/agri-data";

describe("AgriSathi agricultural data & logic", () => {
  it("determines expert review threshold correctly", () => {
    expect(DIAGNOSIS_ESCALATION_THRESHOLD).toBe(65);
    expect(needsExpertReview(54)).toBe(true);
    expect(needsExpertReview(64.9)).toBe(true);
    expect(needsExpertReview(65)).toBe(false);
    expect(needsExpertReview(96.4)).toBe(false);
  });

  it("contains all 5 required exhibition samples", () => {
    expect(diseaseSamples).toHaveLength(5);
    const ids = diseaseSamples.map((s) => s.id);
    expect(ids).toContain("rice-blast");
    expect(ids).toContain("potato-blight");
    expect(ids).toContain("tomato-blight");
    expect(ids).toContain("tea-rust");
    expect(ids).toContain("healthy-paddy");

    const healthySample = diseaseSamples.find((s) => s.id === "healthy-paddy");
    expect(healthySample?.healthy).toBe(true);

    const teaSample = diseaseSamples.find((s) => s.id === "tea-rust");
    expect(needsExpertReview(teaSample!.confidence)).toBe(true);
  });

  it("answers offline queries in English, Assamese, Bengali, and Bodo", () => {
    const languages: LanguageCode[] = ["en", "as", "bn", "brx"];

    for (const lang of languages) {
      expect(uiCopy[lang]).toBeDefined();
      expect(uiCopy[lang].chat).toBeTruthy();
      expect(uiCopy[lang].analyzer).toBeTruthy();
      expect(uiCopy[lang].voice).toBeTruthy();

      const riceAnswer = getOfflineAnswer("rice blast management", lang);
      expect(riceAnswer).toBeTruthy();

      const weatherAnswer = getOfflineAnswer("will it rain this week?", lang);
      expect(weatherAnswer).toBeTruthy();

      const pestAnswer = getOfflineAnswer("insects on leaf", lang);
      expect(pestAnswer).toBeTruthy();
    }
  });

  it("correctly identifies regional terms in queries", () => {
    expect(getOfflineAnswer("ধানৰ খেতি", "as")).toContain("ধান");
    expect(getOfflineAnswer("আলু", "bn")).toContain("আলু");
    expect(getOfflineAnswer("বতৰৰ তথ্য", "as")).toContain("ৰঙিয়া");
  });
});
