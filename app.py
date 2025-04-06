from flask import Flask, request, jsonify, send_file
import pygame
import numpy as np
import mido
from mido import Message, MidiFile, MidiTrack
import time
import random
import os
from werkzeug.utils import secure_filename


from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Add this line to enable CORS for all routes

@app.route('/')
def home():
    return jsonify({"message": "Music Generator Backend is running!", "status": "OK"})

# Configure upload folder
UPLOAD_FOLDER = 'generated_midi'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Mapping keys (A-Z) to MIDI notes (Middle C = 60)
key_to_note = {chr(i): 60 + (i - 65) % 12 for i in range(65, 91)}
note_to_key = {v: k for k, v in key_to_note.items()}

# Instrument mapping based on emotion
instrument_map = {
    "happy": 24,      # Acoustic Guitar
    "sad": 0,        # Piano
    "calm": 40,      # Violin
    "energetic": 30  # Electric Guitar
}

# Initialize pygame mixer
pygame.mixer.init()

def generate_beep(frequency=440, duration=0.2, sample_rate=44100):
    samples = (np.sin(2 * np.pi * np.arange(sample_rate * duration) * frequency / sample_rate)).astype(np.float32)
    stereo_samples = np.column_stack((samples, samples))
    sound = pygame.sndarray.make_sound((stereo_samples * 32767).astype(np.int16))
    return sound

def modify_melody(emotion, notes, tempo=120):
    """Modify the melody based on emotion without changing the instrument."""
    time_gap = int(60000 / tempo)  # Convert BPM to milliseconds
    
    if emotion == "happy":
        new_notes = [min(n + 12, 127) for n in notes]  # Increase octave
    elif emotion == "sad":
        new_notes = [max(n - 12, 0) for n in notes]  # Decrease octave
    elif emotion == "energetic":
        new_notes = notes[:]
        time_gap = int(time_gap * 0.7)  # Faster playback
    elif emotion == "calm":
        new_notes = notes[:]
        time_gap = int(time_gap * 1.5)  # Slower playback
    else:
        new_notes = notes  # No change

    return new_notes, time_gap

@app.route('/play-note', methods=['POST'])
def play_note():
    data = request.json
    keys = data.get('notes', '')
    
    if not keys:
        return jsonify({"error": "No notes provided"}), 400
    
    try:
        # Play each note individually
        for key in keys:
            key = key.upper()
            if key in key_to_note:
                midi_note = key_to_note[key]
                frequency = 200 + (midi_note - 60) * 50
                beep_sound = generate_beep(frequency=frequency)
                beep_sound.play()
                time.sleep(0.2)
        
        return jsonify({"message": "Notes played successfully", "notes_played": len(keys)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/preview-emotion', methods=['POST'])
def preview_emotion():
    data = request.json
    keys = data.get('keys', '')
    emotion = data.get('emotion', 'happy').lower()
    
    if not keys or not emotion:
        return jsonify({"error": "Missing keys or emotion"}), 400
    
    try:
        # Convert keys to MIDI notes
        notes = [key_to_note[key.upper()] for key in keys if key.upper() in key_to_note]
        
        if not notes:
            return jsonify({"error": "No valid notes provided"}), 400
        
        # Modify melody based on emotion
        transformed_notes, time_gap = modify_melody(emotion, notes)
        
        # Create MIDI file in memory
        midi_data = MidiFile()
        track = MidiTrack()
        midi_data.tracks.append(track)
        
        # Set instrument based on emotion
        instrument = instrument_map.get(emotion, 0)
        track.append(Message('program_change', program=instrument, time=0))
        
        # Add notes to track
        for note in transformed_notes:
            track.append(Message('note_on', note=note, velocity=64, time=time_gap))
            track.append(Message('note_off', note=note, velocity=64, time=time_gap))
        
        # Save to temporary file in memory
        from io import BytesIO
        buffer = BytesIO()
        midi_data.save(file=buffer)
        buffer.seek(0)
        
        # Return the file with correct headers
        return send_file(
            buffer,
            mimetype='audio/midi',
            as_attachment=False,
            download_name=f"preview_{emotion}.mid"
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-midi', methods=['POST'])
def generate_midi():
    data = request.json
    keys = data.get('keys', '')
    emotion = data.get('emotion', 'happy').lower()
    tempo = data.get('tempo', 120)
    
    if not keys:
        return jsonify({"error": "No keys provided"}), 400
    
    try:
        # Convert keys to MIDI notes
        notes = [key_to_note[key.upper()] for key in keys if key.upper() in key_to_note]
        
        if not notes:
            return jsonify({"error": "No valid notes provided"}), 400
        
        # Modify melody based on emotion and tempo
        transformed_notes, time_gap = modify_melody(emotion, notes, tempo)
        
        # Create MIDI file
        midi_data = MidiFile()
        track = MidiTrack()
        midi_data.tracks.append(track)
        
        # Set instrument based on emotion
        instrument = instrument_map.get(emotion, 0)
        track.append(Message('program_change', program=instrument, time=0))
        
        # Add notes to track
        for note in transformed_notes:
            track.append(Message('note_on', note=note, velocity=64, time=time_gap))
            track.append(Message('note_off', note=note, velocity=64, time=time_gap))
        
        # Save file with timestamp
        timestamp = int(time.time())
        filename = f"generated_music_{timestamp}.mid"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        midi_data.save(filepath)
        
        # Return the file
        return send_file(filepath, mimetype='audio/midi', as_attachment=True, download_name=filename)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)

