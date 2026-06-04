import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      status: "OK",
      message: "API german is working. Please use POST request.",
    });
  }

  try {
    const { text, mode } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Missing text",
      });
    }

    const prompt = `
You are a German-Vietnamese-English learning assistant.

Input text: "${text}"
Mode: "${mode}"

Return ONLY valid JSON. No markdown. No explanation.

JSON format:
{
  "de": "",
  "deType": "",
  "deRead": "",
  "deExample": "",
  "deExampleRead": "",
  "vi": "",
  "en": "",
  "enType": "",
  "enRead": "",
  "enExample": "",
  "enExampleRead": ""
}

Rules:
- If mode is "vi-de": translate Vietnamese to German and English.
- If mode is "de-vi": translate German to Vietnamese and English.
- deRead: easy Vietnamese-style pronunciation for German.
- deExample: useful German example sentence.
- deExampleRead: easy Vietnamese-style pronunciation for the German sentence.
- vi: Vietnamese meaning or explanation.
- en: English equivalent.
- enRead: easy Vietnamese-style pronunciation or IPA for English.
- enExample: useful English example sentence.
- enExampleRead: easy Vietnamese-style pronunciation for the English sentence.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content;
    const json = JSON.parse(raw);

    return res.status(200).json(json);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}