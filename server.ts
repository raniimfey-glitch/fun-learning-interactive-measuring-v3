import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // In-memory audio cache for frequent educational phrases to avoid rate limits
  const ttsCache = new Map<string, string>();

  // Gemini TTS Endpoint for pristine pronunciation (Arabic & English)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, lang = "ar", voice = lang === "en" ? "Aoede" : "Kore" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing text parameter" });
      }

      const cleanText = text.trim();
      const cacheKey = `${lang}_${voice}_${cleanText}`;
      if (ttsCache.has(cacheKey)) {
        return res.json({
          success: true,
          audioData: ttsCache.get(cacheKey),
          mimeType: "audio/pcm;rate=24000",
          cached: true,
        });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(200).json({
          fallback: true,
          message: "GEMINI_API_KEY not configured, using Web Speech",
        });
      }

      const prompt = lang === "en"
        ? `Say clearly and pleasantly: ${cleanText}`
        : `انطق بوضوح وفصاحة: ${cleanText}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        ttsCache.set(cacheKey, base64Audio);
        return res.json({
          success: true,
          audioData: base64Audio,
          mimeType: "audio/pcm;rate=24000",
        });
      }

      return res.status(200).json({ fallback: true, message: "No audio stream returned" });
    } catch (err: any) {
      // Return 200 with fallback: true on quota or rate limit errors so client smoothly switches without uncaught network errors
      return res.status(200).json({
        fallback: true,
        rateLimited: err?.status === "RESOURCE_EXHAUSTED" || err?.message?.includes("429") || err?.message?.includes("quota"),
        error: err?.message || "TTS error",
      });
    }
  });

  // Arabic Phonetization & Tashkeel Enhancer Endpoint
  app.post("/api/tashkeel", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing text parameter" });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({ error: "GEMINI_API_KEY not configured", fallback: true });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `أنت خبير لغوي في النطق العربي الفصيح والتعليمي. قم بتشكيل النص التالي تشكيلاً إعرابياً وصوتياً تاماً ودقيقاً ومناسباً لنطق الأطفال، مع كتابة الأرقام والكسور (مثل ½ ل و 250 مل و 1000 مل) بالحروف العربية الفصيحة المشكولة. تنبيه مهم: انطق واكتب العدد 1000 بلفظ "أَلْفٌ" أو "أَلْفُ مِيلِيلِتْرٍ" وتجنب تماماً لفظ "صفر ألف".
أرجع فقط النص المشكول بدون أي مقدمات أو تعليقات.
النص: ${text}`,
      });

      const vocalizedText = response.text?.trim();
      return res.json({ success: true, vocalizedText });
    } catch (err: any) {
      console.warn("Tashkeel error:", err?.message || err);
      return res.status(500).json({ error: err?.message || "Internal error", fallback: true });
    }
  });

  // PWA Specific Headers for Service Worker & Manifest
  app.get("/sw.js", (_req, res, next) => {
    res.setHeader("Service-Worker-Allowed", "/");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    next();
  });

  app.get("/manifest.json", (_req, res, next) => {
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
