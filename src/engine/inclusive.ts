/**
 * Akshara Mitra - Inclusive Education Engine (CwSN - Children with Special Needs)
 * Compliant with RPwD Act 2016 and Telangana Samagra Shiksha Inclusive Policy.
 *
 * Provides specialized evaluation modalities:
 * 1. Blind / Low-Vision: Oral-Aural Phonological Auditory Mode
 * 2. Deaf / Hard-of-Hearing: Visual Silent Reading Comprehension Mode
 * 3. Mute / Non-Verbal: Receptive Touch Literacy & AAC Tap-to-Voice Mode
 */

import { FLNLevel } from './literacy';

export type SpecialNeedCategory = 'none' | 'visual' | 'hearing' | 'speech';

export interface VisualQuestion {
  id: string;
  questionTe: string;
  questionEn: string;
  options: {
    id: number;
    textTe: string;
    textEn: string;
    imageUrl?: string;
    isCorrect: boolean;
  }[];
}

export interface TouchPhonicsTask {
  id: string;
  instructionTe: string;
  instructionEn: string;
  taskType: 'vottu_match' | 'cloze_sentence' | 'word_picture';
  targetWordTe: string;
  options: string[];
  correctIndex: number;
}

export interface InclusiveAssessmentResult {
  studentId: string;
  category: SpecialNeedCategory;
  scorePct: number;
  assessedLevel: FLNLevel;
  levelNameTe: string;
  levelNameEn: string;
  strengths: string[];
  recommendationsTe: string[];
  recommendationsEn: string[];
}

/**
 * Evaluates silent reading comprehension for Deaf / Hard-of-Hearing students.
 * Does not require microphone speech.
 */
export function evaluateVisualComprehension(
  studentId: string,
  questions: VisualQuestion[],
  selectedAnswers: Record<string, number>,
): InclusiveAssessmentResult {
  let correct = 0;
  for (const q of questions) {
    const selected = selectedAnswers[q.id];
    const opt = q.options.find((o) => o.id === selected);
    if (opt && opt.isCorrect) {
      correct++;
    }
  }

  const scorePct = Math.round((correct / Math.max(1, questions.length)) * 100);

  let assessedLevel: FLNLevel = 1;
  let levelNameTe = 'స్థాయి 1: ప్రాథమిక దృశ్య అక్షర గుర్తింపు';
  let levelNameEn = 'Level 1: Visual Letter / Sign Association';

  if (scorePct >= 80) {
    assessedLevel = 5;
    levelNameTe = 'స్థాయి 5: ఉన్నత నిశ్శబ్ద కథా గ్రహణశక్తి (Fluent Silent Comprehension)';
    levelNameEn = 'Level 5: Advanced Silent Reading Comprehension';
  } else if (scorePct >= 65) {
    assessedLevel = 4;
    levelNameTe = 'స్థాయి 4: వాక్య స్థాయి దృశ్య పఠనం (Sentence Comprehension)';
    levelNameEn = 'Level 4: Sentence Visual Comprehension';
  } else if (scorePct >= 50) {
    assessedLevel = 3;
    levelNameTe = 'స్థాయి 3: సంయుక్త పదాలు & భావ గ్రహణశక్తి';
    levelNameEn = 'Level 3: Compound Word Comprehension';
  } else if (scorePct >= 35) {
    assessedLevel = 2;
    levelNameTe = 'స్థాయి 2: సరళ పదాల దృశ్య పఠనం';
    levelNameEn = 'Level 2: Simple Word Visual Association';
  }

  return {
    studentId,
    category: 'hearing',
    scorePct,
    assessedLevel,
    levelNameTe,
    levelNameEn,
    strengths: ['చిత్రాల ద్వారా పద భావాలను చక్కగా గ్రహిస్తున్నారు.', 'నిశ్శబ్ద పఠన ఏకాగ్రత బాగుంది.'],
    recommendationsTe: [
      'దృశ్య చిత్ర కథల పుస్తకాలు (Visual Comic Strips) ద్వారా పదజాలాన్ని పెంచండి.',
      'సంకేత భాష (ISL) వీడియో వివరణలతో కూడిన పఠన సాధన అందించండి.',
    ],
    recommendationsEn: [
      'Provide visual illustrated stories to enrich silent vocabulary.',
      'Incorporate Indian Sign Language (ISL) video contextual cues for complex words.',
    ],
  };
}

/**
 * Evaluates receptive reading and phonics for Mute / Speech-Impaired children via touch interaction.
 */
export function evaluateReceptiveTouch(
  studentId: string,
  tasks: TouchPhonicsTask[],
  selectedIndices: Record<string, number>,
): InclusiveAssessmentResult {
  let correct = 0;
  for (const t of tasks) {
    if (selectedIndices[t.id] === t.correctIndex) {
      correct++;
    }
  }

  const scorePct = Math.round((correct / Math.max(1, tasks.length)) * 100);

  let assessedLevel: FLNLevel = 1;
  let levelNameTe = 'స్థాయి 1: ప్రాథమిక స్పర్శ అక్షర ఎంపిక';
  let levelNameEn = 'Level 1: Receptive Letter Selection';

  if (scorePct >= 80) {
    assessedLevel = 5;
    levelNameTe = 'స్థాయి 5: ఉన్నత గ్రహణశక్తి & వాక్య నిర్మాణం (Advanced Receptive Comprehension)';
    levelNameEn = 'Level 5: Advanced Receptive Reading Comprehension';
  } else if (scorePct >= 65) {
    assessedLevel = 4;
    levelNameTe = 'స్థాయి 4: వాక్యాల ఖాళీలు & భావ గ్రహణశక్తి';
    levelNameEn = 'Level 4: Sentence Cloze & Grammar Mastery';
  } else if (scorePct >= 50) {
    assessedLevel = 3;
    levelNameTe = 'స్థాయి 3: వత్తులు & గుణింతాల స్పర్శ గుర్తింపు';
    levelNameEn = 'Level 3: Vottu & Diacritic Touch Discrimination';
  } else if (scorePct >= 35) {
    assessedLevel = 2;
    levelNameTe = 'స్థాయి 2: సరళ పదాల స్పర్శ ఎంపిక';
    levelNameEn = 'Level 2: Simple Word Matching';
  }

  return {
    studentId,
    category: 'speech',
    scorePct,
    assessedLevel,
    levelNameTe,
    levelNameEn,
    strengths: ['ధ్వని-లిపి సంబంధాలను మనస్సులో ఖచ్చితంగా గుర్తిస్తున్నారు.', 'స్పర్శ ద్వారా త్వరిత స్పందన.'],
    recommendationsTe: [
      'ట్యాప్-టు-వాయిస్ (AAC) కీబోర్డ్ ద్వారా వాక్యాలు రూపొందించే సాధన చేయించాలి.',
      'చిత్ర ఆధారిత కథలను చదివి క్రమంలో పెట్టే యాక్టివిటీలను ఇవ్వండి.',
    ],
    recommendationsEn: [
      'Introduce Augmentative & Alternative Communication (AAC) tap-to-voice tile drills.',
      'Engage in interactive Telugu drag-and-drop story ordering to build sentence syntax.',
    ],
  };
}
