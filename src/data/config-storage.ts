import { Passage, StudentProfile, tokenizePassage } from '../engine/literacy';
import { SAMPLE_PASSAGES, SAMPLE_STUDENTS } from './literacy-sample';

export interface SchoolConfig {
  schoolName: string;
  mandal: string;
  district: string;
  academicYear: string;
}

const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  schoolName: 'ఎం.పి.పి.ఎస్ శంషాబాద్ (MPPS Shamshabad)',
  mandal: 'Shamshabad',
  district: 'Ranga Reddy',
  academicYear: '2026-27',
};

const KEY_SCHOOL = 'akshara-mitra:school-config';
const KEY_PASSAGES = 'akshara-mitra:custom-passages';
const KEY_STUDENTS = 'akshara-mitra:custom-students';

export function getStoredSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(KEY_SCHOOL);
    if (raw) return { ...DEFAULT_SCHOOL_CONFIG, ...JSON.parse(raw) };
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_SCHOOL_CONFIG;
}

export function saveSchoolConfig(config: SchoolConfig): void {
  try {
    localStorage.setItem(KEY_SCHOOL, JSON.stringify(config));
  } catch {
    // Ignore storage write error
  }
}

export function getStoredPassages(): Passage[] {
  try {
    const raw = localStorage.getItem(KEY_PASSAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Re-tokenize each passage so all tokens and methods are fresh
        return parsed.map((p) =>
          tokenizePassage(p.id, p.title, p.titleEn || p.title, p.grade || 3, p.language || 'te', p.level || 3, p.content)
        );
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return SAMPLE_PASSAGES;
}

export function savePassages(passages: Passage[]): void {
  try {
    localStorage.setItem(KEY_PASSAGES, JSON.stringify(passages));
  } catch {
    // Ignore storage write error
  }
}

export function resetPassagesToDefault(): Passage[] {
  try {
    localStorage.removeItem(KEY_PASSAGES);
  } catch {
    // Ignore
  }
  return SAMPLE_PASSAGES;
}

export function getStoredStudents(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(KEY_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }
  return SAMPLE_STUDENTS;
}

export function saveStudents(students: StudentProfile[]): void {
  try {
    localStorage.setItem(KEY_STUDENTS, JSON.stringify(students));
  } catch {
    // Ignore
  }
}

export function resetStudentsToDefault(): StudentProfile[] {
  try {
    localStorage.removeItem(KEY_STUDENTS);
  } catch {
    // Ignore
  }
  return SAMPLE_STUDENTS;
}
