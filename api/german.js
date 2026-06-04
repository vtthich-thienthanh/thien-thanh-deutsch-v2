import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      status: "OK",
      message: "API german is working",
    });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { text, mode } = req.body || {};

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const prompt = `
Return ONLY valid JSON.

Input: ${text}
Mode: ${mode}

JSON:
{
  "de":"",
  "deType":"",
  "deRead":"",
  "deExample":"",
  "deExampleRead":"",
  "vi":"",
  "en":"",
  "enType":"",
  "enRead":"",
  "enExample":"",
  "enExampleRead":""
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    return res.status(200).json(
      JSON.parse(completion.choices[0].message.content)
    );
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}