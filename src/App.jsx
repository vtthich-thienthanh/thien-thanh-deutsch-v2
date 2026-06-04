import { useEffect, useRef, useState } from "react";
import "./App.css";

const EMPTY = {
  de: "",
  deType: "",
  deRead: "",
  deExample: "",
  deExampleRead: "",
  deExampleVi: "",
  vi: "",
  en: "",
  enType: "",
  enRead: "",
  enExample: "",
  enExampleRead: "",
};

function App() {
  const [mode, setMode] = useState("vi-de");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [result, setResult] = useState(EMPTY);
  const requestRef = useRef(0);

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

    const requestId = Date.now();
    requestRef.current = requestId;

    setLoading(true);
    setResult(EMPTY);

    try {
      const res = await fetch("/api/german", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode: selectedMode }),
      });

      const data = await res.json();

      if (requestRef.current !== requestId) return;

      if (data.error) throw new Error(data.error);

      setResult({ ...EMPTY, ...data });
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setResult({ ...EMPTY, de: "AI error", vi: err.message });
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) translate(input, mode);
      else setResult(EMPTY);
    }, 700);

    return () => clearTimeout(timer);
  }, [input, mode]);

  const changeMode = (newMode) => {
    setMode(newMode);
    setInput("");
    setResult(EMPTY);
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <div className="topbar">
        <div>
          <h1>THIEN THANH - Deutsch Schnell Lernen V2</h1>
          <p>German - Vietnamese - English AI Learning Tool</p>
        </div>

        <button className="small-btn" onClick={() => setDark(!dark)}>
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      <div className="mode-box">
        <button className={mode === "vi-de" ? "mode active" : "mode"} onClick={() => changeMode("vi-de")}>
          Viet → Duc + Anh
        </button>

        <button className={mode === "de-vi" ? "mode active" : "mode"} onClick={() => changeMode("de-vi")}>
          Duc → Viet + Anh
        </button>
      </div>

      <section className="input-card">
        <label>{mode === "vi-de" ? "Nhap tieng Viet" : "Nhap tieng Duc"}</label>

        <div className="input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "vi-de" ? "Vi du: toi yeu gia dinh toi..." : "Beispiel: Ich liebe meine Familie..."}
          />

          {mode === "de-vi" && (
            <div className="instant-read">
              <b>Cach doc Duc:</b>
              <span>{result.deRead || "..."}</span>
            </div>
          )}
        </div>

        <p>{loading ? "Dang xu ly..." : "Chi can nhap, ket qua se tu hien."}</p>
      </section>

      <section className="cards">
        <div className="card">
          <div className="badge">TIENG DUC</div>

          <h2>{loading ? "Dang xu ly..." : result.de}</h2>

          <p><b>Tu loai:</b> {result.deType}</p>
          <p className="read"><b>Cach doc:</b> {result.deRead}</p>
          <p><b>Vi du:</b> {result.deExample}</p>
          <p className="read"><b>Doc vi du:</b> {result.deExampleRead}</p>
          <p><b>Nghia vi du:</b> {result.deExampleVi}</p>

          <div className="btn-row">
            <button onClick={() => speak(result.de, "de-DE")}>Nghe tu Duc</button>
            <button onClick={() => speak(result.deExample, "de-DE")}>Nghe cau Duc</button>
            <button onClick={() => copyText(result.deExample || result.de)}>Copy</button>
          </div>
        </div>

        <div className="card">
          <div className="badge">TIENG VIET</div>

          <h2>{result.vi}</h2>

          <p>
            {mode === "de-vi"
              ? "Day la nghia tieng Viet cua noi dung tieng Duc."
              : "Day la giai thich nghia tieng Viet cua tu/cum tu da nhap."}
          </p>

          <div className="btn-row">
            <button onClick={() => copyText(result.vi)}>Copy</button>
          </div>
        </div>

        <div className="card">
          <div className="badge">TIENG ANH</div>

          <h2>{result.en}</h2>

          <p><b>Word type:</b> {result.enType}</p>
          <p className="read"><b>IPA / Read:</b> {result.enRead}</p>
          <p><b>Example:</b> {result.enExample}</p>
          <p className="read"><b>Example read:</b> {result.enExampleRead}</p>

          <div className="btn-row">
            <button onClick={() => speak(result.en, "en-US")}>Listen word</button>
            <button onClick={() => speak(result.enExample, "en-US")}>Listen sentence</button>
            <button onClick={() => copyText(result.enExample || result.en)}>Copy</button>
          </div>
        </div>
      </section>

      <section className="common-card">
        <div className="software-info">
          <h2>THONG TIN PHAN MEM</h2>
          <h3>THIEN THANH - Deutsch Schnell Lernen V2</h3>
          <p>Hoc tieng Duc - Viet - Anh bang tri tue nhan tao AI.</p>
          <p><b>Tac gia:</b><br />Vo Thanh Thich</p>
          <p><b>Phat trien:</b><br />THIEN THANH AI LAB</p>
          <p><b>Phien ban:</b><br />V2.2</p>
          <p><b>Ngon ngu ho tro:</b><br />Tieng Viet - Tieng Duc - Tieng Anh</p>
          <p>(c) 2026 THIEN THANH<br />All Rights Reserved</p>
        </div>
      </section>
    </div>
  );
}

export default App;
