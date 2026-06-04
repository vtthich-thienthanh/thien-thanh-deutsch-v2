import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { text, mode } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Missing text",
      });
    }

    let prompt = "";

    if (mode === "de-vi") {
      prompt = `
Tra từ hoặc cụm từ tiếng Đức sau:

${text}

Trả về JSON đúng cấu trúc:

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

Yêu cầu:
- de = từ tiếng Đức gốc
- deRead = cách đọc tiếng Việt dễ hiểu
- vi = nghĩa tiếng Việt
- en = từ tiếng Anh tương đương
- enRead = cách đọc tiếng Việt của tiếng Anh
- có ví dụ Đức và Anh
- chỉ trả JSON
`;
    } else {
      prompt = `
Dịch từ hoặc cụm từ tiếng Việt sau:

${text}

Trả về JSON đúng cấu trúc:

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

Yêu cầu:
- de = tiếng Đức chuẩn
- deRead = cách đọc tiếng Việt
- deType = từ loại
- deExample = ví dụ tiếng Đức
- deExampleRead = cách đọc ví dụ Đức
- vi = giải thích nghĩa tiếng Việt
- en = từ tiếng Anh tương đương
- enType = từ loại tiếng Anh
- enRead = cách đọc tiếng Việt của tiếng Anh
- enExample = ví dụ tiếng Anh
- enExampleRead = cách đọc tiếng Việt của ví dụ Anh
- chỉ trả JSON
`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content;

    const json = JSON.parse(raw);

    return res.status(200).json(json);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}