import React, { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Slider } from "./components/ui/slider";
import { Card, CardContent } from "./components/ui/card";

const UI = () => {
  const [page, setPage] = useState(1);
  const [keyboardInput, setKeyboardInput] = useState("");
  const [tempo, setTempo] = useState(50);
  const [volume, setVolume] = useState(5);
  const [darkMode, setDarkMode] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const [activeSection, setActiveSection] = useState("instructions");

  const handleKeyboardChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 20);
    setKeyboardInput(value);
  };
 
  const previewEmotionMusic = async (emotion) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/preview-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: keyboardInput, emotion }),
      });
      const data = await res.json();
      const audio = new Audio(`http://127.0.0.1:5000${data.file}`);
      audio.play();
    } catch (error) {
      console.error("Error previewing emotion:", error);
    }
  };
  
  const playNote = async () => {
    const res = await fetch("http://127.0.0.1:5000/play-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: "ACDF" }),
    });
  
    const data = await res.json();
    const audio = new Audio(data.file);
    audio.play();
  };
 
  const sendNotesToBackend = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/play-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: keyboardInput }),
      });
  
      const data = await res.json();
      if (data.file) {
        const audio = new Audio(`http://127.0.0.1:5000${data.file}`);
        audio.play();
      } else {
        alert("No audio file returned.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending notes.");
    }
  };
  
  const generateAudio = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: keyboardInput, tempo, volume }),
      });

      const data = await res.json();
      if (data.audio_url) {
        setAudioUrl(`http://127.0.0.1:5000/${data.audio_url}`);
      } else {
        alert("Failed to generate audio.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
      {page === 1 && (
        <div className="welcome-page">
          <Card>
            <CardContent className="space-y-4">
              <h1 className="text-2xl font-bold">🎵 Welcome to Music Generator</h1>
              <button className="button" onClick={() => setPage(2)}>🎹 Keyboard Input</button>
              <button className="button">🎼 Load Existing MIDI File</button>
              <Button onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {page === 2 && (
        <div className="main-container">
          <div className="vertical-nav">
            <div 
              className={`nav-item ${activeSection === 'instructions' ? 'active' : ''}`}
              onClick={() => setActiveSection('instructions')}
            >
              🎹 Keyboard Instructions
            </div>
            <div 
              className={`nav-item ${activeSection === 'emotion' ? 'active' : ''}`}
              onClick={() => setActiveSection('emotion')}
            >
              😃 Emotion Selection
            </div>
            <div 
              className={`nav-item ${activeSection === 'instrument' ? 'active' : ''}`}
              onClick={() => setActiveSection('instrument')}
            >
              🎸 Choose Instrument
            </div>
            <div 
              className={`nav-item ${activeSection === 'fine-tune' ? 'active' : ''}`}
              onClick={() => setActiveSection('fine-tune')}
            >
              🎚️ Fine-Tune Settings
            </div>
            <div 
              className={`nav-item ${activeSection === 'final' ? 'active' : ''}`}
              onClick={() => setActiveSection('final')}
            >
              🎧 Final Section
            </div>
            <Button 
              onClick={() => setDarkMode(!darkMode)}
              className="mt-auto mx-2"
            >
              {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </Button>
          </div>

          <div className="content-area">
            {activeSection === 'instructions' && (
              <Card>
                <CardContent className="space-y-2">
                  <h2 className="text-xl font-semibold">🎹 Keyboard Instructions</h2>
                  <p>Press A-Z to play notes. Max 20 notes. Press ESC to stop playing.</p>
                  <Input
                    placeholder="Enter up to 20 keys (A-Z)"
                    value={keyboardInput}
                    onChange={handleKeyboardChange}
                  />
                  <button className="button" onClick={sendNotesToBackend}>🔊 Preview Input Notes</button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'emotion' && (
              <Card className="emotion-section">
                <CardContent className="space-y-2">
                  <h2 className="text-xl font-semibold">😃 Step 1: Select Emotion</h2>
                  <div className="flex gap-2 flex-wrap">
                    {["Happy", "Sad", "Energetic", "Calm"].map((emotion) => (
                      <button key={emotion} className="button" onClick={() => previewEmotionMusic(emotion)}>
                        {emotion}
                      </button>
                    ))}
                  </div>
                  <button className="button" onClick={sendNotesToBackend}>🔊 Preview Emotion Music</button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'instrument' && (
              <Card className="instrument-section">
                <CardContent className="space-y-2">
                  <h2 className="text-xl font-semibold">🎸 Step 2: Choose Instrument</h2>
                  <div className="flex gap-2 flex-wrap">
                    {["Piano", "Flute", "Violin", "Drums", "Guitar", "All Instruments"].map((instrument) => (
                      <button key={instrument} className="button">{instrument}</button>
                    ))}
                  </div>
                  <button className="button" onClick={sendNotesToBackend}>🔊 Preview Instrument + Emotion</button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'fine-tune' && (
              <Card className="fine-tune-section">
                <CardContent className="space-y-4">
                  <h2 className="text-xl font-semibold">🎚️ Step 3: Modify & Fine-Tune</h2>
                  <div>
                    <p>🕒 Adjust Tempo</p>
                    <label className="text-sm font-medium">Tempo: {tempo}</label>
                    <Slider value={[tempo]} max={100} step={1} onValueChange={(v) => setTempo(v[0])} />
                  </div>
                  <div>
                    <p>🎼 Change Key & Scale</p>
                    <select className="border rounded px-2 py-1">
                      <option>C Major</option>
                      <option>G Major</option>
                      <option>A Minor</option>
                    </select>
                  </div>
                  <div>
                    <p>🔊 Modify Volume & Dynamics</p>
                    <label className="text-sm font-medium">Volume: {volume}</label>
                    <Slider value={[volume]} max={10} step={1} onValueChange={(v) => setVolume(v[0])} />
                  </div>
                  <div>
                    <p>➕➖ Add/Remove Instruments</p>
                    <div className="flex gap-2 flex-wrap">
                      {["Piano", "Flute", "Violin", "Drums", "Guitar"].map((inst) => (
                        <label key={inst}><input type="checkbox" /> {inst}</label>
                      ))}
                    </div>
                  </div>
                  <button className="button">🔊 Play Adjusted Music</button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'final' && (
              <Card>
                <CardContent className="space-y-2">
                  <h2 className="text-xl font-semibold">🎧 Final Section: Generate & Save</h2>
                  <button className="button" onClick={generateAudio}>🎶 Generate & Fetch Audio</button>
                  {audioUrl && (
                    <div className="space-y-2">
                      <audio id="dynamicAudio" src={audioUrl} controls />
                      <button className="button" onClick={() => document.getElementById("dynamicAudio").play()}>
                        ▶️ Play Generated Audio
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button className="button">Save as MIDI</button>
                    <button className="button">Save as WAV</button>
                    <button className="button">Save as MP3</button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UI;



