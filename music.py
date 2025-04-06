import pygame
import numpy as np
import mido
from mido import Message, MidiFile, MidiTrack
import time
import random

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


pygame.init()
pygame.mixer.init()

screen = pygame.display.set_mode((600, 400))
pygame.display.set_caption("Music Generator")

def generate_beep(frequency=440, duration=0.2, sample_rate=44100):
    samples = (np.sin(2 * np.pi * np.arange(sample_rate * duration) * frequency / sample_rate)).astype(np.float32)
    stereo_samples = np.column_stack((samples, samples))
    sound = pygame.sndarray.make_sound((stereo_samples * 32767).astype(np.int16))
    return sound

# MIDI setup
midi_file = MidiFile()
track = MidiTrack()
midi_file.tracks.append(track)

notes = []
keys_pressed = []

print("Press keys (A-Z) to play notes. Max 20 notes. Press ESC to stop recording.")

running = True
while running:
    screen.fill((0, 0, 0))
    font = pygame.font.Font(None, 36)
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            key = pygame.key.name(event.key).upper()

            if key == "ESCAPE":
                running = False
            elif key in key_to_note and len(notes) < 50:
                midi_note = key_to_note[key]
                notes.append(midi_note)
                keys_pressed.append(key)  # Keep track of exact key order

                # Play beep sound
                beep_sound = generate_beep(frequency=200 + (midi_note - 60) * 50)
                beep_sound.play()

                # Add to MIDI file
                track.append(Message('note_on', note=midi_note, velocity=64, time=100))
                track.append(Message('note_off', note=midi_note, velocity=64, time=100))

                time.sleep(0.2)

    text_surface = font.render(f"Keys Pressed: {''.join(keys_pressed)}", True, (255, 255, 255))
    screen.blit(text_surface, (50, 130))
    
    pygame.display.flip()

pygame.quit()

# Save the original tune
if notes:
    midi_filename = "generated_tune.mid"
    midi_file.save(midi_filename)
    print(f"Tune saved as {midi_filename} 🎵")
    print(f"Original Keys: {''.join(keys_pressed)}")
else:
    print("No notes recorded.")

# VAES

def modify_melody(emotion, notes):
    """Modify the melody based on emotion without changing the instrument."""
    time_gap = 100  # Default time gap
    
    if emotion == "happy":
        new_notes = [min(n + 12, 127) for n in notes]  # Increase octave
    elif emotion == "sad":
        new_notes = [max(n - 12, 0) for n in notes]  # Decrease octave
    elif emotion == "energetic":
        new_notes = notes[:]
        time_gap = 50  # Faster playback
    elif emotion == "calm":
        new_notes = notes[:]
        time_gap = 200  # Slower playback
    else:
        new_notes = notes  # No change

    return new_notes, time_gap


# Ask user for emotion
print("\nChoose an emotion to transform your tune:")
print("1. Happy 😊 (Higher Octave)")
print("2. Sad 😢 (Lower Octave)")
print("3. Calm 🌿 (Slower Tempo)")
print("4. Energetic 🚀 (Faster Tempo)")

choice = input("Enter a number (1-4): ").strip()
emotion_map = {"1": "happy", "2": "sad", "3": "calm", "4": "energetic"}
selected_emotion = emotion_map.get(choice, "original")

if selected_emotion != "original":
    transformed_notes, time_gap = modify_melody(selected_emotion, notes)

    # Save transformed MIDI
    new_midi = MidiFile()
    new_track = MidiTrack()
    new_midi.tracks.append(new_track)

    # Set Instrument
    instrument = instrument_map[selected_emotion]
    new_track.append(Message('program_change', program=instrument, time=0))

    for note in transformed_notes:
        new_track.append(Message('note_on', note=note, velocity=64, time=time_gap))
        new_track.append(Message('note_off', note=note, velocity=64, time=time_gap))

    new_filename = f"generated_tune_{selected_emotion}.mid"
    new_midi.save(new_filename)
    print(f"Transformed tune saved as {new_filename} 🎶 ({selected_emotion.upper()})")

    # ========== Play the Transformed Tune ==========
    pygame.mixer.quit()
    pygame.mixer.init()
    try:
        pygame.mixer.music.load(new_filename)
        pygame.mixer.music.play()
        print(f"Playing {new_filename}...")
        print(f"Original Notes: {notes} → Transformed Notes: {transformed_notes}")
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
    except pygame.error as e:
        print(f"Error playing music: {e}")
else:
    print("No transformation applied.")

