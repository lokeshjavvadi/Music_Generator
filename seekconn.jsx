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

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [error, setError] = useState(null);
  
  
  const audioRef = useRef(null);

  // ... (keep all your existing handler functions)
  const handleKeyboardChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 20);
    setKeyboardInput(value);
  };
 
  // Update your previewEmotionMusic function in UI.jsx
  const previewEmotionMusic = async (emotion) => {
    try {
      setSelectedEmotion(emotion);
      setGenerationStatus(`Generating ${emotion.toLowerCase()} preview...`);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const res = await fetch('http://localhost:5000/preview-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keys: keyboardInput,
          emotion: emotion.toLowerCase()
        }),
      });
  
      if (!res.ok) {
        throw new Error('Failed to generate preview');
      }

      // Check if response has content
      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error('Empty audio response from server');
      }

      const audioUrl = URL.createObjectURL(blob);
      audioRef.current = new Audio(audioUrl);
      
      // Handle audio errors
      audioRef.current.onerror = () => {
        setError('Failed to play audio: ' + audioRef.current.error.message);
        setGenerationStatus('Playback failed');
      };
      
      audioRef.current.play().catch(err => {
        setError('Playback failed: ' + err.message);
        setGenerationStatus('Playback failed');
      });
      
      setGenerationStatus('Preview playing...');
      
      audioRef.current.onended = () => {
        setGenerationStatus('Preview finished');
        URL.revokeObjectURL(audioUrl); // Clean up
      };
      
    } catch (err) {
      setError(err.message);
      setGenerationStatus('Preview failed');
      console.error("Error previewing emotion:", err);
    }
};
  
  // Update your sendNotesToBackend function
  const sendNotesToBackend = async () => {
    try {
      setGenerationStatus('Playing notes...');
      
      const res = await fetch('http://localhost:5000/play-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: keyboardInput 
        }),
      });
  
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to play notes');
      }
  
      setGenerationStatus(`Played ${data.notes_played || keyboardInput.length} notes successfully`);
      
    } catch (err) {
      setError(err.message);
      setGenerationStatus('Playback failed');
      console.error("Error playing notes:", err);
    }
};
  
  // Update your generateAudio function
  const generateAudio = async () => {
    setIsGenerating(true);
    setGenerationStatus('Generating your music...');
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/generate-midi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keys: keyboardInput,
          emotion: selectedEmotion?.toLowerCase(),
          tempo: tempo,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate MIDI file');
      }
  
      // Create download link for the MIDI file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Create a download link automatically
      const a = document.createElement('a');
      a.href = url;
      a.download = `music_${selectedEmotion || 'composition'}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setGenerationStatus('MIDI file generated and downloaded!');
      
    } catch (err) {
      setError(err.message);
      setGenerationStatus('Generation failed');
      console.error('Error generating audio:', err);
    } finally {
      setIsGenerating(false);
    }
};
  
      // Create download link for the MIDI file
     

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
      
      <div className="space-y-4">
        <button 
          className={`button ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={generateAudio}
          disabled={isGenerating}
        >
          {isGenerating ? '⚙️ Generating...' : '🎶 Generate MIDI File'}
        </button>
        
        {generationStatus && (
          <div className={`p-3 rounded-md ${
            error ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
          }`}>
            {error ? `Error: ${error}` : generationStatus}
          </div>
        )}
        
        {audioUrl && (
  <div className="audio-container">
    <p className="text-sm mb-2">Your MIDI file is ready!</p>
    <div className="flex gap-3">
      <button 
        className="button"
        onClick={() => {
          const link = document.createElement('a');
          link.href = audioUrl;
          link.download = `music_${selectedEmotion || 'composition'}.mid`;
          link.click();
        }}
      >
        <FaSave className="mr-2" /> Download MIDI
      </button>
      <button 
        className="button"
        onClick={async () => {
          try {
            setGenerationStatus('Playing generated music...');
            
            // Create a new audio element
            const audio = new Audio(audioUrl);
            
            audio.onerror = () => {
              setError('Failed to play audio: ' + audio.error.message);
              setGenerationStatus('Playback failed');
            };
            
            await audio.play().catch(err => {
              setError('Playback failed: ' + err.message);
              setGenerationStatus('Playback failed');
            });
            
            audio.onended = () => {
              setGenerationStatus('Playback completed');
            };
            
          } catch (err) {
            setError(err.message);
            setGenerationStatus('Playback failed');
          }
        }}
      >
        <FaPlay className="mr-2" /> Play
      </button>
    </div>
  </div>
)}
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