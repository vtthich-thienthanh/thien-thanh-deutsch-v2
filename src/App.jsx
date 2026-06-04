import { useEffect, useState } from "react";
import "./App.css";

const COMMON_SENTENCES = [
  "Toi khong hieu",
  "Xin noi cham lai",
  "Toi can nghi 5 phut",
  "May gio roi?",
  "Toi dang lam viec",
  "Toi bi dau tay",
  "Toi met",
  "Hom nay rat ban",
  "Cam on rat nhieu",
  "Tam biet",
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
    setResult({
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
        de: "AI error",
        deType: "",
        deRead: "",
        deExample: "",
        deExampleRead: "",
        vi: err.message,
        en: "",
        enType: "",
        enRead: "",
        enExample: "",
        enExampleRead: "",
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

  const useCommonSentence = (sentence) => {
    setMode("vi-de");
    setInput(sentence);
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
          }}
        >
          Viet → Duc + Anh
        </button>

        <button
          className={mode === "de-vi" ? "mode active" : "mode"}
          onClick={() => {
            setMode("de-vi");
            setInput("");
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
          <p><b>Tu loai:</b> {result.deType}</p>
          <p className="read"><b>Cach doc:</b> {result.deRead}</p>

          <div className="btn-row">
            <button onClick={() => speak(result.de, "de-DE")}>Nghe Duc</button>
            <button onClick={() => copyText(result.de)}>Copy</button>
          </div>
        </div>

        <div className="card">
          <div className="badge">2. VI DU DUC</div>
          <h2>{result.deExample}</h2>
          <p className="read"><b>Cach doc:</b> {result.deExampleRead}</p>
          <p><b>Nghia Viet:</b> {result.vi}</p>

          <div className="btn-row">
            <button onClick={() => speak(result.deExample, "de-DE")}>Nghe cau Duc</button>
            <button onClick={() => copyText(result.deExample)}>Copy</button>
          </div>
        </div>

        <div className="card">
          <div className="badge">3. TIENG ANH</div>
          <h2>{result.en}</h2>
          <p><b>Word type:</b> {result.enType}</p>
          <p className="read"><b>IPA / Read:</b> {result.enRead}</p>
          <p>{result.enExample}</p>

          <div className="btn-row">
            <button onClick={() => speak(result.enExample || result.en, "en-US")}>
              Listen English
            </button>
            <button onClick={() => copyText(result.enExample || result.en)}>Copy</button>
          </div>
        </div>
      </section>

      <section className="common-card">
        <h2>CAU THONG DUNG</h2>

        <div className="chips">
          {COMMON_SENTENCES.map((item, index) => (
            <button key={index} className="chip" onClick={() => useCommonSentence(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;