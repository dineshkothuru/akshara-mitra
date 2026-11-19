import { describe, expect, it } from 'vitest';
import {
  Passage,
  evaluateOralReading,
  generateTeacherDiagnosticReport,
  tokenizePassage,
} from './literacy';
import {
  VisualQuestion,
  TouchPhonicsTask,
  evaluateReceptiveTouch,
  evaluateVisualComprehension,
} from './inclusive';

describe('Akshara Mitra - Foundational Literacy Assessment Engine', () => {
  const samplePassage: Passage = tokenizePassage(
    'p-01',
    'మన ఊరు - మన చెట్టు',
    'Our Village - Our Tree',
    3,
    'te',
    4,
    'మా ఊరి మధ్యలో ఒక పెద్ద మర్రి చెట్టు ఉంది. ఆ చెట్టు నీడలో పిల్లలు ఆడుకుంటారు. పక్షులు గూళ్ళు కట్టుకున్నాయి.',
  );

  it('tokenizes passage and flags Telugu gunintham and vottu diacritics accurately', () => {
    expect(samplePassage.tokens.length).toBe(16);
    const chettuToken = samplePassage.tokens.find((t) => t.word === 'చెట్టు');
    expect(chettuToken).toBeDefined();
    expect(chettuToken?.hasVottu).toBe(true);
    expect(chettuToken?.hasGunintham).toBe(true);
  });

  it('evaluates fluent reader with high accuracy and Level 5 classification', () => {
    const spokenWords = [
      'మా', 'ఊరి', 'మధ్యలో', 'ఒక', 'పెద్ద', 'మర్రి', 'చెట్టు', 'ఉంది',
      'ఆ', 'చెట్టు', 'నీడలో', 'పిల్లలు', 'ఆడుకుంటారు', 'పక్షులు', 'గూళ్ళు', 'కట్టుకున్నాయి'
    ];
    // Read 15 words in 18 seconds -> ~50 WPM
    const result = evaluateOralReading(samplePassage, spokenWords, 18, 'STU-01');

    expect(result.accuracyPct).toBeGreaterThanOrEqual(90);
    expect(result.wpm).toBeGreaterThanOrEqual(45);
    expect(result.assessedLevel).toBe(5);
    expect(result.mispronouncedWords).toBe(0);
  });

  it('detects vottu (conjunct consonant) pronunciation errors and diagnoses gap', () => {
    // Child misreads 'పెద్ద' as 'పెద', 'చెట్టు' as 'చెటు', 'కట్టుకున్నాయి' as 'కటుకున్నాయి'
    const spokenWords = [
      'మా', 'ఊరి', 'మధ్యలో', 'ఒక', 'పెద', 'మర్రి', 'చెటు', 'ఉంది',
      'ఆ', 'చెటు', 'నీడలో', 'పిల్లలు', 'ఆడుకుంటారు', 'పక్షులు', 'గూళ్ళు', 'కటుకున్నాయి'
    ];
    const result = evaluateOralReading(samplePassage, spokenWords, 30, 'STU-02');

    expect(result.wordAssessments.some((w) => w.status === 'vottu')).toBe(true);
    expect(result.diagnosedGaps.some((g) => g.includes('వత్తుల ఉచ్చారణలో'))).toBe(true);
    expect(result.remedialRecommendationsTe.some((r) => r.includes('వత్తుల సాధన'))).toBe(true);
  });

  it('evaluates silent visual comprehension for Deaf students without audio input', () => {
    const questions: VisualQuestion[] = [
      {
        id: 'q1',
        questionTe: 'ఊరి మధ్యలో ఏ చెట్టు ఉంది?',
        questionEn: 'Which tree is in the middle of the village?',
        options: [
          { id: 1, textTe: 'వేప చెట్టు', textEn: 'Neem tree', isCorrect: false },
          { id: 2, textTe: 'మర్రి చెట్టు', textEn: 'Banyan tree', isCorrect: true },
          { id: 3, textTe: 'మామిడి చెట్టు', textEn: 'Mango tree', isCorrect: false },
        ],
      },
      {
        id: 'q2',
        questionTe: 'చెట్టు నీడలో ఎవరు ఆడుకుంటారు?',
        questionEn: 'Who plays in the shade of the tree?',
        options: [
          { id: 1, textTe: 'పిల్లలు', textEn: 'Children', isCorrect: true },
          { id: 2, textTe: 'పెద్దలు', textEn: 'Elders', isCorrect: false },
        ],
      },
    ];

    const result = evaluateVisualComprehension('STU-DEAF-01', questions, { q1: 2, q2: 1 });
    expect(result.scorePct).toBe(100);
    expect(result.assessedLevel).toBe(5);
    expect(result.category).toBe('hearing');
  });

  it('evaluates receptive touch literacy for non-verbal / mute students', () => {
    const tasks: TouchPhonicsTask[] = [
      {
        id: 't1',
        instructionTe: '‘వత్తు’ ఉన్న పదాన్ని ఎంచుకోండి',
        instructionEn: 'Tap the word with a conjunct consonant',
        taskType: 'vottu_match',
        targetWordTe: 'పిల్లి',
        options: ['కాయ', 'పిల్లి', 'వల'],
        correctIndex: 1,
      },
      {
        id: 't2',
        instructionTe: 'సరైన పదాన్ని ఖాళీలో చేర్చండి: పిల్లలు చెట్టు నీడలో ___',
        instructionEn: 'Fill in the blank',
        taskType: 'cloze_sentence',
        targetWordTe: 'ఆడుకుంటారు',
        options: ['ఎగురుతారు', 'ఆడుకుంటారు', 'ఈదుతారు'],
        correctIndex: 1,
      },
    ];

    const result = evaluateReceptiveTouch('STU-MUTE-01', tasks, { t1: 1, t2: 1 });
    expect(result.scorePct).toBe(100);
    expect(result.assessedLevel).toBe(5);
    expect(result.category).toBe('speech');
  });

  it('generates official bilingual diagnostic reports for teachers and parents', () => {
    const spokenWords = ['మా', 'ఊరి', 'మధ్యలో', 'ఒక', 'పెద్ద', 'మర్రి', 'చెట్టు'];
    const res = evaluateOralReading(samplePassage, spokenWords, 15, 'STU-03');
    const student = {
      id: 'STU-03',
      name: 'K. Sneha',
      rollNo: '24',
      gender: 'F' as const,
      grade: 3,
      schoolName: 'MPPS Shamshabad (Bilingual)',
      mandal: 'Shamshabad',
      district: 'Ranga Reddy',
      assessmentMode: 'general_oral' as const,
    };

    const report = generateTeacherDiagnosticReport(student, res, samplePassage);
    expect(report.te).toContain('తెలంగాణ పాఠశాల విద్యాశాఖ');
    expect(report.te).toContain('K. Sneha');
    expect(report.en).toContain('GOVERNMENT OF TELANGANA');
    expect(report.en).toContain('THOLIMETTULU (FLN)');
  });

  it('correctly tokenizes and configures custom teacher-submitted passages across Grades 1 to 5', () => {
    const customText = 'రాముడు బడికి వెళ్ళాడు. పుస్తకం తీసి చదివాడు.';
    const customPassage = tokenizePassage('custom-01', 'రాముడు కథ', 'Ramudu Story', 2, 'te', 3, customText);

    expect(customPassage.grade).toBe(2);
    expect(customPassage.level).toBe(3);
    expect(customPassage.tokens.length).toBe(6);
    // 'వెళ్ళాడు' has vottu 'ళ్ళ'
    const velladu = customPassage.tokens.find((t) => t.word === 'వెళ్ళాడు');
    expect(velladu?.hasVottu).toBe(true);
  });
});
