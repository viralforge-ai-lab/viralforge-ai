import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const port = process.env.PORT || 3000;
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.post("/api/generate", async (req, res) => {
  try {
    if (!client) return res.status(500).json({ error: "OPENAI_API_KEY não configurada no servidor." });

    const { idea, niche = "Fitness", duration = "30 segundos", lang = "Português" } = req.body;
    if (!idea?.trim()) return res.status(400).json({ error: "Escreve uma ideia primeiro." });

    const prompt = `
Você é o motor de conteúdo do ViralForge AI.
Crie conteúdo curto e forte para TikTok/Reels/Shorts.
Idioma: ${lang}
Nicho: ${niche}
Duração: ${duration}
Ideia do usuário: ${idea}

Responda SOMENTE com JSON válido neste formato:
{
  "hook": "hook forte de 1 frase",
  "script": "roteiro completo e natural",
  "scenes": "lista curta de cenas com tempo",
  "voice": "texto da narração",
  "caption": "legenda pronta",
  "cta": "CTA curto + 5 hashtags"
}
Não invente resultados garantidos. Priorize clareza, retenção e linguagem natural.
`;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: prompt
    });

    const text = response.output_text.trim();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      data = JSON.parse(cleaned);
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Não foi possível gerar o conteúdo agora." });
  }
});

app.listen(port, () => console.log(`ViralForge AI rodando em http://localhost:${port}`));
