import React, { useState, useRef } from "react";
import "./seek.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Slider } from "./components/ui/slider";
import { Card, CardContent } from "./components/ui/card";
import { FaArrowLeft } from "react-icons/fa";
// Import icons (you can use react-icons or your own)
import { FaPlay, FaPause, FaVolumeUp, FaMusic, FaSave } from "react-icons/fa";

const UI = () => {
  const [page, setPage] = useState(1);
  const [keyboardInput, setKeyboardInput] = useState("");
  const [tempo, setTempo] = useState(50);
  const [volume, setVolume] = useState(5);
  const [darkMode, setDarkMode] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const [activeSection, setActiveSection] = useState("instructions");
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedKey, setSelectedKey] = useState("C Major");
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const audioRef = useRef(null);

  // ... (keep all your existing handler functions)
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

  const toggleInstrument = (instrument) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument) 
        : [...prev, instrument]
    );
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
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
        <button className="back-button" onClick={() => setPage(1)}>
      <FaArrowLeft /> Back
    </button>
   
           <div className="vertical-nav">
           
    <br></br>
    <br></br>
    
   
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
                <CardContent className="space-y-4">
                  <h2 className="section-title">🎹 Keyboard Instructions</h2>
                  <p className="section-subtitle">Enter your musical notes below (A-Z) and preview them</p>
                  
                  <div className="select-container">
                    <Input
                      placeholder="Enter up to 20 keys (A-Z)"
                      value={keyboardInput}
                      onChange={handleKeyboardChange}
                    />
                  </div>
                  
                  <button 
                    className={`button ${!keyboardInput ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={sendNotesToBackend}
                    disabled={!keyboardInput}
                  >
                    🔊 Preview Input Notes
                  </button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'emotion' && (
              <Card className="emotion-section">
                <CardContent className="space-y-4">
                  <h2 className="section-title">😃 Emotion Selection</h2>
                  <p className="section-subtitle">Choose the emotion you want to express in your music</p>
                  
                  <div className="flex gap-3 flex-wrap justify-center">
                    {["Happy", "Sad", "Energetic", "Calm"].map((emotion) => (
                      <button 
                        key={emotion}
                        className={`button ${selectedEmotion === emotion ? 'selected-emotion pulse' : ''}`}
                        onClick={() => {
                          setSelectedEmotion(emotion);
                          previewEmotionMusic(emotion);
                        }}
                      >
                        {emotion}
                        {selectedEmotion === emotion && ' ✓'}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className={`button ${!selectedEmotion ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={sendNotesToBackend}
                    disabled={!selectedEmotion}
                  >
                    🔊 Preview Emotion Music
                  </button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'instrument' && (
              <Card className="instrument-section">
                <CardContent className="space-y-4">
                  <h2 className="section-title">🎸 Choose Instrument</h2>
                  <p className="section-subtitle">Select the instrument(s) for your composition</p>
                  
                  <div className="flex gap-3 flex-wrap justify-center">
                    {["Piano", "Flute", "Violin", "Drums", "Guitar", "All Instruments"].map((instrument) => (
                      <button 
                        key={instrument}
                        className={`button ${selectedInstrument === instrument ? 'selected-instrument pulse' : ''}`}
                        onClick={() => {
                          setSelectedInstrument(instrument);
                          // Add your instrument preview logic here
                        }}
                      >
                        {instrument}
                        {selectedInstrument === instrument && ' ✓'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Or select multiple instruments:</h3>
                    <div className="flex flex-col gap-2">
                      {["Piano", "Flute", "Violin", "Drums", "Guitar"].map((instrument) => (
                        <label key={instrument} className="checkbox-container">
                          <input 
                            type="checkbox" 
                            checked={selectedInstruments.includes(instrument)}
                            onChange={() => toggleInstrument(instrument)}
                          />
                          <span>{instrument}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className={`button mt-4 ${!selectedInstrument && selectedInstruments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={sendNotesToBackend}
                    disabled={!selectedInstrument && selectedInstruments.length === 0}
                  >
                    🔊 Preview Instrument Sound
                  </button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'fine-tune' && (
      <Card className="fine-tune-section">
        <CardContent className="space-y-4">
          <h2 className="section-title">🎚️ Fine-Tune Settings</h2>
          <p className="section-subtitle">Adjust the parameters to perfect your composition</p>
          
          <div className="tune-item tempo-item">
            <div className="tune-item-header">
              <div className="tune-item-icon">🕒</div>
              <span>Tempo Settings</span>
            </div>
            <div className="slider-container">
              <div className="slider-label">
                <span>Beats Per Minute</span>
                <span className="slider-value">{tempo} BPM</span>
              </div>
              <Slider 
                value={[tempo]} 
                max={200} 
                min={20}
                step={1} 
                onValueChange={(v) => setTempo(v[0])} 
              />
            </div>
          </div>
          
          <div className="tune-item key-item">
            <div className="tune-item-header">
              <div className="tune-item-icon">🎼</div>
              <span>Key & Scale</span>
            </div>
            <div className="select-container">
              <select 
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                <option>C Major</option>
                <option>G Major</option>
                <option>D Major</option>
                <option>A Minor</option>
                <option>E Minor</option>
              </select>
            </div>
          </div>
          
          <div className="tune-item volume-item">
            <div className="tune-item-header">
              <div className="tune-item-icon">🔊</div>
              <span>Volume Control</span>
            </div>
            <div className="slider-container">
              <div className="slider-label">
                <span>Output Volume</span>
                <span className="slider-value">{volume}/10</span>
              </div>
              <Slider 
                value={[volume]} 
                max={10} 
                step={0.5} 
                onValueChange={(v) => setVolume(v[0])} 
              />
            </div>
          </div>
          
          <div className="tune-item instruments-item">
            <div className="tune-item-header">
              <div className="tune-item-icon">🎛️</div>
              <span>Instrument Mix</span>
            </div>
            <div className="flex flex-col gap-3 mt-3">
              {["Piano", "Flute", "Violin", "Drums", "Guitar"].map((instrument) => (
                <label key={instrument} className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedInstruments.includes(instrument)}
                    onChange={() => toggleInstrument(instrument)}
                  />
                  <span>{instrument}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button className="button selected-setting w-full mt-4">
            🔄 Apply Adjustments
          </button>
        </CardContent>
      </Card>
    )}

            {activeSection === 'final' && (
              <Card>
                <CardContent className="space-y-4">
                  <h2 className="section-title">🎧 Generate & Save</h2>
                  <p className="section-subtitle">Create your final composition and download it</p>
                  
                  <button 
                    className="button"
                    onClick={generateAudio}
                  >
                    🎶 Generate Audio
                  </button>
                  
                  {audioUrl && (
                    <div className="audio-container">
                      <audio 
                        ref={audioRef}
                        src={audioUrl} 
                        controls 
                        className="w-full"
                      />
                      <div className="audio-controls">
                        <button onClick={handlePlayPause}>
                          <FaPlay />
                        </button>
                        <button onClick={() => audioRef.current.volume = 0.5}>
                          <FaVolumeUp />
                        </button>
                        <span className="text-sm ml-auto">
                          {selectedEmotion && `Emotion: ${selectedEmotion}`}
                          {selectedInstrument && ` | Instrument: ${selectedInstrument}`}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 flex-wrap justify-center mt-6">
                    <button className="button">
                      <FaSave className="mr-2" /> Save as MIDI
                    </button>
                    <button className="button">
                      <FaSave className="mr-2" /> Save as WAV
                    </button>
                    <button className="button">
                      <FaSave className="mr-2" /> Save as MP3
                    </button>
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