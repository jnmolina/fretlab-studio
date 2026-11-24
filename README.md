# 🎸 FretLab Studio — Guitar Mastery & Tab Studio

An interactive guitar mastery, music theory, and **TuxGuitar / Guitar Pro-style tab studio** built for experienced players bridging **Classical & Acoustic fingerstyle (`p-i-m-a`)** into **modern Electric Pick, Hybrid Picking, and Band Styles** (**Polyphia**, **Unearth**, **Deftones**, and **HORSE the band**).

---

## 🚀 3 Ways to Use FretLab Studio

### 1. 🌐 Try It Instantly in Your Browser (Desktop & Mobile)
No install required—works directly in any desktop, iPhone, or Android browser:
👉 **[Launch Live Web App: https://jnmolina.github.io/fretlab-studio/](https://jnmolina.github.io/fretlab-studio/)**

> **Mobile Tip:** On iOS (Safari) or Android (Chrome), open the link above and tap **"Add to Home Screen"** to install FretLab Studio as a full-screen mobile app.

---

### 2. 💻 Download the Standalone Portable Windows `.exe`
Run FretLab Studio offline on any 64-bit Windows PC as a self-contained desktop app (no installer or Node.js required):
👉 **[Download `FretLab-Studio-Portable.exe` (Direct Download)](https://github.com/jnmolina/fretlab-studio/raw/main/release/FretLab-Studio-Portable.exe)**
*(Or view it in the repository at [`release/FretLab-Studio-Portable.exe`](./release/FretLab-Studio-Portable.exe))*

---

### 3. 📦 Download or Clone the Full Project (Source Code)
Want to customize the lessons, add your own band presets, or build from source?

- **Download ZIP:** Click the green **`<> Code`** button at the top of [github.com/jnmolina/fretlab-studio](https://github.com/jnmolina/fretlab-studio) and select **Download ZIP** (or [click here to download the full repo ZIP](https://github.com/jnmolina/fretlab-studio/archive/refs/heads/main.zip)).
- **Or Clone with Git:**
  ```bash
  git clone https://github.com/jnmolina/fretlab-studio.git
  cd fretlab-studio
  npm install
  npm run dev
  ```
- **Rebuild the Portable Windows `.exe`:**
  ```bash
  npm run dist:portable
  ```

---

## ✨ Key Features

- **Home 4-Stage Guided Practice Plan:**
  1. **Step 1: Warm-Ups** (*1-2-3-4 Chromatic Spider*, *Left-Hand Stretch & Legato Slurs*)
  2. **Step 2: Chords & Arpeggios** (*Triad Inversions Up the Neck*, *Lush Add9 & Maj9 Clouds*, *Harmonic Minor & Diminished 7th Climbs*)
  3. **Step 3: Fingerstyle (`P-I-M-A`)** (*Giuliani Sequential Planting & Thumb-Bass Separation*, *Classical Tremolo `p-a-m-i` into Harp Harmonics*)
  4. **Step 4: Pick & Hybrid (Bands)** (*Polyphia Hybrid String-Skips*, *Unearth 5-7-8 Pedal Gallop & Sweep-Tap Apex*, *Deftones Syncopated PM → Shoegaze Wall*, *HORSE the band 8-Bit Synth Arpeggio & Panic Stab*)
- **TuxGuitar / Guitar Pro Interactive 6-String Tab Editor:**
  - Click any string/beat cell and type fret numbers (`0–24`) or use the on-screen touch keypad.
  - Built-in **Speed Trainer (`50% / 75% / 100%`)**, right-hand picking/articulation markers (`↓`, `↑`, `p`, `i`, `m`, `a`, `Pick`, `M`, `R`, `PM`, `Sweep`, `Tap`, `Harm`, `H/O`), and **Save as Custom Lesson** persistence.
- **Drum Loops + Supporting Root Bass & Harmony Chord Pad:**
  - 8 built-in Web Audio drum grooves (*Basic 4/4 Drum Beat*, *Acoustic / Fingerstyle Pulse*, *Syncopated Groove / Funk*, *Trap / Math-Rock*, *Half-Time Alt-Metal*, *Double-Kick Metal*, *Fast Nintendocore*, and *Metronome Click*) paired with a real-time **Root-Note Bassline** and **Supporting Harmony Pad** (`Minor`, `Major`, `Maj7`, `Power 5th`).
- **Scales, Chords, Circle of Fifths & 12-Step Band Roadmap:**
  - Interactive 6-string fretboard supporting **Standard**, **Drop D**, **Drop C**, and **DADGAD** tunings plus 5 synthesized guitar tones (*Classical Nylon*, *Acoustic Steel*, *Clean Electric*, *High-Gain Metal*, and *8-Bit Chiptune*).
- **Quick Search & Minimal AI Guitar Coach (`Ctrl+K`):**
  - Press `Ctrl+K` (or click **Search / Ask AI**) to jump to any tab, scale, chord, or drum beat, or ask music theory questions (e.g., *"Notes & chords in D Harmonic Minor"*, *"How to play like Unearth?"*, *"Bridge Classical PIMA to Polyphia hybrid"*).
