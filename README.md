# Akshara Mitra (అక్షర మిత్ర)
### TISC 2026 · Challenge 06: Every Child Reads: Telugu AI Assessment
**School Education Department · Government of Telangana**

Built by **Gamada** ([gamada.app](https://gamada.app))  
*Founders:* Dinesh Kumar Kothuru (+91 99664 26599) & Mahesh Gudladona (+91 80562 26280)

---

## 1. Overview & Problem Statement

Under the **NIPUN Bharat Mission** and Telangana SCERT's **Tholimettulu** framework, achieving universal Foundational Literacy and Numeracy (FLN) by Grade 3 is a paramount goal. However, primary schools face severe structural challenges:

1. **Teacher Time Bottleneck:** In multi-grade classrooms, conducting 1-on-1 oral reading assessments manually takes 8–10 minutes per child. Evaluating a class of 35 students takes over 5 hours, resulting in assessments occurring only once or twice a year.
2. **Generic Speech Engine Pitfalls:** Standard cloud speech-to-text models (e.g., Whisper or Google ASR) auto-correct child pronunciation, masking critical Telugu phonemic flaws such as dropped *vottulu* (ద్విత్వ/సంయుక్త అక్షరాలు) or shortened vowels.
3. **Disability Exclusion:** Traditional oral reading tools fail Children with Special Needs (CwSN). Non-verbal/mute students, deaf learners, and visually impaired children are routinely penalized or marked as "unable to read".

**Akshara Mitra** solves this with an edge-first, bilingual (Telugu & English) reading assessment studio and teacher diagnostic desk featuring comprehensive **RPwD Act 2016** inclusive accommodations.

---

## 2. Core Architecture & Modules

```
D:\akshara-mitra
├── src/
│   ├── engine/
│   │   ├── literacy.ts          # Core FLN evaluation (WPM, Accuracy %, Diacritics, Vottulu, Dynamic Tokenizer, Remedial Generator)
│   │   ├── inclusive.ts         # CwSN modalities (Visual Silent Comprehension, Receptive Touch, AAC Tap-to-Voice)
│   │   └── literacy.test.ts     # Automated test suite (7/7 passing tests)
│   ├── components/
│   │   ├── StudentReadingStudio.tsx       # Live microphone neural voice AI (te-IN), word highlight, TTS pronunciation guide
│   │   ├── InclusiveAssessmentStudio.tsx # Dedicated CwSN testing (Blind Auditory, Deaf Visual, Mute Touch & AAC)
│   │   ├── TeacherDashboard.tsx           # Class FLN distribution, student dossiers, bilingual parent slips
│   │   ├── AppMenuDrawer.tsx              # Mobile slide-out drawer menu with active school card & navigation
│   │   └── SettingsModal.tsx              # In-app dynamic configurator (School U-DISE, custom passages, student roster)
│   ├── data/
│   │   ├── literacy-sample.ts   # Graded passages (Levels 1–5), 8-student cohort profiles, touch cloze tasks
│   │   └── config-storage.ts    # LocalStorage persistence for custom passages, school info, and roster
│   ├── styles.css               # Educational styling, mobile-first responsive layout, dark-glass drawer, Telugu typography
│   ├── i18n.ts                  # Complete Telugu (తెలుగు) and English localization
│   ├── App.tsx                  # Main application shell with menu drawer, sticky mobile bottom bar, and tab navigation
│   └── main.tsx                 # React DOM root entry
├── application/
│   ├── decks/
│   │   ├── project/
│   │   │   ├── deck.json        # Pitch deck definition and slide sequence
│   │   │   └── slides/          # 13 high-resolution HTML widescreen slides (1920x1080)
│   │   ├── build-pdf.py         # Headless browser PDF compiler
│   │   └── build-pptx.py        # 4K image-rendered PPTX generator with speaker notes
│   └── submission/
│       ├── Akshara-Mitra-Challenge-06-Pitch-Deck.pptx # Official PowerPoint submission
│       ├── Akshara-Mitra-Challenge-06-Pitch-Deck.pdf  # Official PDF pitch deck
│       ├── Challenge 06 - description.txt             # TISC portal description (1,470 chars)
│       └── How to submit.txt                          # Step-by-step submission guide
├── package.json
├── tsconfig.json
└── vite.config.ts (Port 3050)
```

---

## 3. Pedagogical FLN Progression (Tholimettulu & NIPUN Bharat)

| Level | Telugu Name | Focus Area | Reading Fluency Target |
|---|---|---|---|
| **Level 1** | *Aksharamulu* (అక్షరములు) | Single Alphabet Letters & Vowels | 15+ letters/min |
| **Level 2** | *Sarala Padalu* (సరళ పదాలు) | Simple Consonant-Vowel 2 & 3 letter words | 20+ WPM |
| **Level 3** | *Guninthalu & Vottulu* (గుణింతాలు & వొత్తులు) | Diacritics, Geminate (*Dvitva*) & Conjunct (*Samyukta*) | 25+ WPM, strict vottu retention |
| **Level 4** | *Vakyalu* (సరళ వాక్యాలు) | Syntactic fluency in connected sentences | 30–45 WPM |
| **Level 5** | *Katha* (కథ & అవగాహన) | Story reading and comprehension retrieval | 60+ WPM with retell questions |

---

## 4. Inclusive CwSN Framework (RPwD Act 2016 Compliant)

Akshara Mitra provides three dedicated, certified assessment pathways to ensure every child is evaluated equitably:

1. **Blind / Low-Vision Learners (Oral-Aural Auditory Mode):**
   - High-contrast 200% scalable font typography.
   - Screen-reader / TalkBack ARIA semantic labeling.
   - Auditory phonological prompts where the child hears phoneme sequences and responds verbally.
2. **Deaf / Hard-of-Hearing Learners (Silent Visual Mode):**
   - Zero audio or microphone dependency.
   - Word-to-image semantic association (matching Telugu orthography to illustrated concepts).
   - Sentence cloze tests and visual story sequencing to evaluate genuine reading comprehension.
3. **Mute / Non-Verbal / Speech-Impaired Learners (Receptive Touch & AAC Mode):**
   - Receptive touch literacy: identifying syllables, initial consonants, and *vottu* pairs on touch screens.
   - AAC (Augmentative and Alternative Communication) Tap-to-Voice sentence builder: evaluates syntactic and morphological competence without unfair vocal penalties (eliminates false "0 WPM" failure).

---

## 5. Instant Remedial Drill Generation

When the diagnostic engine detects specific phoneme drop patterns, it automatically synthesizes closed-loop remedial drills:
- **Pa-vottu drop** in "కప్ప" → Generates targeted drill words: కప్ప, తప్ప, చెప్ప.
- **Ra-vottu drop** in "గుర్రం" → Generates targeted drill words: గుర్రం, కర్ర, తొర్ర.
- **Vowel shortening** in "కాలము" → Generates minimal pair contrast drills: కల vs కాల, తల vs తాల.
- Students tap any word to hear native Telugu audio guidance, allowing independent practice at home or during peer learning time.

---

## 6. Verification & Development

### Run the Development Server
```bash
cd D:\akshara-mitra
npm run dev
# Running at: http://localhost:3050
```

### Run Automated Unit Tests
```bash
cd D:\akshara-mitra
npx vitest run
```
*Result: 7/7 tests passing (100% pass rate).*

### Production Build
```bash
npm run build
# Compiles cleanly with zero errors to dist/
```

### Pitch Deck Compilation
```bash
cd D:\akshara-mitra\application\decks
python build-pdf.py     # Generates application/submission/Akshara-Mitra-Challenge-06-Pitch-Deck.pdf
python build-pptx.py    # Generates application/submission/Akshara-Mitra-Challenge-06-Pitch-Deck.pptx
```

---

## 7. Submission Artifacts

All files required for TISC 2026 Challenge 06 submission are staged in `D:\akshara-mitra\application\submission`:
- **`Akshara-Mitra-Challenge-06-Pitch-Deck.pptx`**: 13-slide PowerPoint presentation with full speaker notes.
- **`Akshara-Mitra-Challenge-06-Pitch-Deck.pdf`**: 13-page vector-rendered PDF equivalent.
- **`Challenge 06 - description.txt`**: 1,470-character portal summary (strictly under 1,500 characters).
- **`How to submit.txt`**: Detailed portal submission instructions.
