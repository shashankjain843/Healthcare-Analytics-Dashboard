import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

app.use(express.json());

// Health check
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Real-time AI Discharge Summary Generator
app.post("/api/generate-summary", async (req: express.Request, res: express.Response) => {
  try {
    const { patient } = req.body;
    if (!patient) {
      return res.status(400).json({ error: "Missing patient payload." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not set. Please set it in your .env file at the project root." 
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are an elite clinical physician and AI Medical Advisor. 
Create a highly professional, clinical, and structured Patient Discharge Dossier. 
Focus on:
1. Patient health status based on vitals and admission details.
2. Readmission risk analysis (highlighting any clinical concerns).
3. Detailed list of prescribed discharge medications (GDMT) with timing and usage warnings.
4. Comprehensive post-discharge care protocols (diet, daily vital monitoring, activity limitations).
5. Recommended follow-up appointments (which specialists, timeframes).

Format your output beautifully using clean Markdown headings, tables, or bullet lists. Maintain a professional, structured clinical tone.`
      },
      contents: `Generate a clinical discharge synopsis for this patient record:
Name: ${patient.name}
Age: ${patient.age} / Gender: ${patient.gender}
Diagnosis: ${patient.diagnosis}
Length of Stay: ${patient.lengthOfStay} Days
Previous Admissions (12M): ${patient.previousAdmissions}
Vitals: ${JSON.stringify(patient.vitals)}
Comorbidities: ${patient.comorbidities.join(", ")}
Discharge Medications: ${patient.dischargeMeds.join(", ")}
Calculated Readmission Risk: ${patient.riskScore}% (${patient.riskCategory} Risk)
Current Case Notes: ${patient.notes || "None"}`
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("AI Generate Summary Error:", error);
    res.status(500).json({ error: error?.message || "Failed to contact Gemini API." });
  }
});

// Interactive AI Clinical Copilot Chat
app.post("/api/chat-consultation", async (req: express.Request, res: express.Response) => {
  try {
    const { patient, messages } = req.body;
    if (!patient || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing patient data or messages history." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not set. Please set it in your .env file at the project root." 
      });
    }

    // Format messages into Google Gen AI format
    // [{ role: "user" | "model", parts: [{ text: string }] }]
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are an expert AI Clinical Advisor and Medical Consultant. 
You are discussing this specific patient dossier with a clinician:
Name: ${patient.name}
Age: ${patient.age} / Gender: ${patient.gender}
Diagnosis: ${patient.diagnosis}
Length of Stay: ${patient.lengthOfStay} Days
Vitals: ${JSON.stringify(patient.vitals)}
Comorbidities: ${patient.comorbidities.join(", ")}
Discharge Medications: ${patient.dischargeMeds.join(", ")}
Calculated Readmission Risk: ${patient.riskScore}% (${patient.riskCategory} Risk)

Provide highly accurate, evidence-based guidelines on:
- Drug-drug interactions in their medication list.
- Post-discharge monitoring benchmarks.
- Special diets or lifestyle restrictions.
- Warning signs of deterioration.

Always base your suggestions on the patient's specific parameters. 
Keep answers concise, professional, and clinically oriented. 
Crucial: At the very end of your response, add this exact disclaimer: "DISCLAIMER: AI clinical suggestions are advisory only. Attending physician retains full decision-making responsibility."`
      },
      contents: formattedContents
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Chat Consultation Error:", error);
    res.status(500).json({ error: error?.message || "Failed to contact Gemini API." });
  }
});

// Setup Vite or Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: 24700, // Fixed HMR port to avoid conflicts
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ Server running at http://localhost:${PORT}\n`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n❌ Port ${PORT} is already in use!\n` +
        `   Fix: Run this command first to free it:\n` +
        `   taskkill /F /IM node.exe\n` +
        `   Then run: npm run dev\n`
      );
      process.exit(1);
    } else {
      throw err;
    }
  });
}

startServer();
