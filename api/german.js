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

    const { text, mode } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Missing text",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a professional German-Vietnamese-English learning assistant.

Input text:
"${text}"

Mode:
"${mode}"

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
- If mode is "vi-de": translate Vietnamese to natural German and English.
- If mode is "de-vi": translate German to Vietnamese and English.
- "de" must be the German word, phrase, or sentence.
- "deType" must be the German word type or sentence type.
- "deRead" must be Vietnamese-style pronunciation of the German result only.
- "deExample" must be a short useful German example sentence.
- "deExampleRead" must be Vietnamese-style pronunciation of the German example.
- "vi" must be the Vietnamese meaning or explanation.
- "en" must be the English equivalent.
- "enType" must be the English word type or sentence type.
- "enRead" must be clear English IPA or easy Vietnamese-style pronunciation.
- "enExample" must be a short useful English example sentence.
- "enExampleRead" must be clear English IPA or easy Vietnamese-style pronunciation.
- Do not put Vietnamese input pronunciation into deRead.
- Do not put German pronunciation into enRead.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
    });

    const content = completion.choices[0].message.content;
    const data = JSON.parse(content);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}