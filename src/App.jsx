import { useEffect, useState } from "react";
import "./App.css";

const COMMON_SENTENCES = [
  {
    vi: "Toi khong hieu",
    de: "Ich verstehe nicht.",
    en: "I do not understand.",
  },
  {
    vi: "Xin noi cham lai",
    de: "Bitte sprechen Sie langsam.",
    en: "Please speak slowly.",
  },
  {
    vi: "Toi can nghi 5 phut",
    de: "Ich brauche funf Minuten Pause.",
    en: "I need a five-minute break.",
  },
  {
    vi: "May gio roi?",
    de: "Wie spat ist es?",
    en: "What time is it?",
  },
  {
    vi: "Toi dang lam viec",
    de: "Ich arbeite gerade.",
    en: "I am working now.",
  },
  {
    vi: "Toi bi dau tay",
    de: "Meine Hand tut weh.",
    en: "My hand hurts.",
  },
  {
    vi: "Toi met",
    de: "Ich bin mude.",
    en: "I am tired.",
  },
  {
    vi: "Hom nay rat ban",
    de: "Heute ist sehr viel los.",
    en: "Today is very busy.",
  },
  {
    vi: "Cam on rat nhieu",
    de: "Vielen Dank.",
    en: "Thank you very much.",
  },
  {
    vi: "Tam biet",
    de: "Auf Wiedersehen.",
    en: "Goodbye.",
  },
];

function App() {
  const [mode, setMode] = useState("vi-de");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  const [result, setResult] = useState({
    de: "",
    deType: "",
    deRead: "",
    deExample: "",
    deExampleRead: "",
    vi: "",
    en: "",
    enType: "",
    enRead: "",
    enExample: "",
    enExampleRead: "",
  });

  const emptyResult = {
    de: "",
    deType: "",
    deRead: "",
    deExample: "",
    deExampleRead: "",
    vi: "",
    en: "",
    enType: "",
    enRead: "",
    enExample: "",
    enExampleRead: "",
  };

  const speak = (text, lang) => {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  const copyText = async (text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  const translate = async (text, selectedMode) => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(emptyResult);

    try {
      const res = await fetch("/api/german", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          mode: selectedMode,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setResult({
        ...emptyResult,
        de: "AI error",
        vi: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        translate(input, mode);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [input, mode]);

  const chooseCommon = (item) => {
    setMode("vi-de");
    setInput(item.vi);
    setResult({
      de: item.de,
      deType: "Sentence",
      deRead: "",
      deExample: item.de,
      deExampleRead: "",
      vi: item.vi,
      en: item.en,
      enType: "Sentence",
      enRead: "",
      enExample: item.en,
      enExampleRead: "",
    });
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <div className="topbar">
        <div>
          <h1>THIEN THANH - Deutsch Schnell Lernen V2</h1>
          <p>Hoc nhanh tieng Duc - tieng Viet - tieng Anh bang AI</p>
        </div>

        <button className="small-btn" onClick={() => setDark(!dark)}>
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      <div className="mode-box">
        <button
          className={mode === "vi-de" ? "mode active" : "mode"}
          onClick={() => {
            setMode("vi-de");
            setInput("");
            setResult(emptyResult);
          }}
        >
          Viet → Duc + Anh
        </button>

        <button
          className={mode === "de-vi" ? "mode active" : "mode"}
          onClick={() => {
            setMode("de-vi");
            setInput("");
            setResult(emptyResult);
          }}
        >
          Duc → Viet + Anh
        </button>
      </div>

      <section className="input-card">
        <label>{mode === "vi-de" ? "Nhap tieng Viet" : "Nhap tieng Duc"}</label>

        <div className="input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "vi-de"
                ? "Vi du: tinh yeu, toi khong hieu..."
                : "Beispiel: lieben, arbeiten..."
            }
          />

          {mode === "de-vi" && (
            <div className="instant-read">
              <b>Cach doc:</b>
              <span>{result.deRead || "..."}</span>
            </div>
          )}
        </div>

        <p>{loading ? "Dang xu ly..." : "Chi can nhap, khong can bam nut."}</p>
      </section>

      <section className="cards">
        <div className="card">
          <div className="badge">1. TIENG DUC</div>
          <h2>{loading ? "Dang xu ly..." : result.de}</h2>
          <p>
            <b>Tu loai:</b> {result.deType}
          </p>
          <p className="read">
            <b>Cach doc:</b> {result.deRead}
          </p>

          <div className="btn-row">
            <button onClick={() => speak(result.de, "de-DE")}>Nghe Duc</button>
            <button onClick={() => copyText(result.de)}>Copy</button>
          </div>
        </div>

        <div className="card">
          <div className="badge">
            {mode === "de-vi" ? "2. NGHIA TIENG VIET" : "2. VI DU DUC"}
          </div>

          {mode === "de-vi" ? (
            <>
              <h2>{result.vi}</h2>
              <p>
                <b>Vi du Duc:</b> {result.deExample}
              </p>
              <p className="read">
                <b>Cach doc:</b> {result.deExampleRead}
              </p>
            </>
          ) : (
            <>
              <h2>{result.deExample}</h2>
              <p className="read">
                <b>Cach doc:</b> {result.deExampleRead}
              </p>
              <p>
                <b>Nghia Viet:</b> {result.vi}
              </p>
            </>
          )}

          <div className="btn-row">
            <button onClick={() => speak(result.deExample, "de-DE")}>
              Nghe cau Duc
            </button>
            <button onClick={() => copyText(result.deExample || result.vi)}>
              Copy
            </button>
          </div>
        </div>

        <div className="card">
          <div className="badge">3. TIENG ANH</div>
          <h2>{result.en}</h2>
          <p>
            <b>Word type:</b> {result.enType}
          </p>
          <p className="read">
            <b>IPA / Read:</b> {result.enRead}
          </p>
          <p>{result.enExample}</p>

          <div className="btn-row">
            <button onClick={() => speak(result.enExample || result.en, "en-US")}>
              Listen English
            </button>
            <button onClick={() => copyText(result.enExample || result.en)}>
              Copy
            </button>
          </div>
        </div>
      </section>

      <section className="common-card">
        <h2>CAU THONG DUNG</h2>

        <div className="common-list">
          {COMMON_SENTENCES.map((item, index) => (
            <button
              key={index}
              className="common-item"
              onClick={() => chooseCommon(item)}
            >
              <b>{item.vi}</b>
              <span>{item.de}</span>
              <small>{item.en}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;