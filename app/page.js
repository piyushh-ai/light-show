"use client";
import { useEffect, useRef, useState } from "react";

const AUTO_MIX = 11;

export default function Home() {
  const [state, setState] = useState(null);
  const [speed, setSpeed] = useState(200);
  const [error, setError] = useState("");
  const loaded = useRef(false);

  async function load() {
    try {
      const res = await fetch("/api/esp", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState(data);
      if (!loaded.current) { setSpeed(data.speed); loaded.current = true; }
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function send(action, v) {
    try {
      const res = await fetch("/api/esp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, v }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState(data);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const isOn = state && state.mode !== 0;

  return (
    <main style={{ background: "#111", color: "#fff", minHeight: "100vh", padding: 16, fontFamily: "sans-serif", textAlign: "center" }}>
      <h2 style={{ color: "#ffd400" }}>Light Ladi Control</h2>

      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

      <button
        onClick={() => send("mode", isOn ? 0 : AUTO_MIX)}
        disabled={!state}
        style={{
          width: "100%", padding: 22, fontSize: 22, fontWeight: "bold", border: 0, borderRadius: 14,
          background: isOn ? "#c0392b" : "#27ae60", color: "#fff", margin: "10px 0",
        }}
      >
        {isOn ? "OFF karo" : "ON karo"}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "15px 0" }}>
        {state?.names.map((name, i) => (
          <button
            key={i}
            onClick={() => send("mode", i)}
            style={{
              padding: "18px 5px", fontSize: 17, borderRadius: 12, cursor: "pointer",
              border: "2px solid " + (state.mode === i ? "#ffd400" : "#444"),
              background: state.mode === i ? "#ffd400" : "#222",
              color: state.mode === i ? "#000" : "#fff",
              fontWeight: state.mode === i ? "bold" : "normal",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <p>Speed (right = tez)</p>
      <input
        type="range" min="60" max="600"
        value={660 - speed}
        onChange={(e) => setSpeed(660 - Number(e.target.value))}
        onPointerUp={() => send("speed", speed)}
        style={{ width: "90%", height: 30 }}
      />
    </main>
  );
}