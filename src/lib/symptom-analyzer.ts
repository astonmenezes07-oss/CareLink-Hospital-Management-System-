// ============================================================
// CareLink — Symptom Analyzer & WHO ETAT ABCD Scoring
// ============================================================

import { PriorityScore, PriorityLevel, TriageCategory, VitalSigns } from '@/types';

// ---- keyword maps ----

const EMERGENCY_KEYWORDS: { keyword: string; score: number; triage: TriageCategory }[] = [
  // A — Airway
  { keyword: 'choking', score: 95, triage: 'A' },
  { keyword: 'airway obstruction', score: 98, triage: 'A' },
  { keyword: 'cannot breathe', score: 96, triage: 'A' },
  { keyword: 'throat swelling', score: 90, triage: 'A' },
  { keyword: 'anaphylaxis', score: 97, triage: 'A' },

  // B — Breathing
  { keyword: 'severe breathing difficulty', score: 94, triage: 'B' },
  { keyword: 'breathing difficulty', score: 85, triage: 'B' },
  { keyword: 'respiratory distress', score: 92, triage: 'B' },
  { keyword: 'fast breathing', score: 78, triage: 'B' },
  { keyword: 'shortness of breath', score: 82, triage: 'B' },
  { keyword: 'low oxygen', score: 90, triage: 'B' },
  { keyword: 'asthma attack', score: 85, triage: 'B' },
  { keyword: 'wheezing', score: 70, triage: 'B' },

  // C — Circulation / Consciousness
  { keyword: 'heart attack', score: 98, triage: 'C' },
  { keyword: 'cardiac arrest', score: 100, triage: 'C' },
  { keyword: 'chest pain', score: 88, triage: 'C' },
  { keyword: 'stroke', score: 96, triage: 'C' },
  { keyword: 'unconscious', score: 95, triage: 'C' },
  { keyword: 'unresponsive', score: 95, triage: 'C' },
  { keyword: 'convulsions', score: 90, triage: 'C' },
  { keyword: 'seizure', score: 88, triage: 'C' },
  { keyword: 'heavy bleeding', score: 92, triage: 'C' },
  { keyword: 'severe bleeding', score: 92, triage: 'C' },
  { keyword: 'shock', score: 93, triage: 'C' },
  { keyword: 'weak pulse', score: 88, triage: 'C' },
  { keyword: 'coma', score: 97, triage: 'C' },
  { keyword: 'fainting', score: 72, triage: 'C' },
  { keyword: 'loss of consciousness', score: 90, triage: 'C' },
  { keyword: 'palpitations', score: 65, triage: 'C' },

  // D — Dehydration
  { keyword: 'severe dehydration', score: 82, triage: 'D' },
  { keyword: 'dehydration', score: 60, triage: 'D' },
  { keyword: 'lethargy', score: 65, triage: 'D' },
  { keyword: 'sunken eyes', score: 70, triage: 'D' },

  // General urgent
  { keyword: 'high fever', score: 68, triage: 'none' },
  { keyword: 'fracture', score: 72, triage: 'none' },
  { keyword: 'broken bone', score: 72, triage: 'none' },
  { keyword: 'severe pain', score: 75, triage: 'none' },
  { keyword: 'trauma', score: 78, triage: 'none' },
  { keyword: 'accident', score: 76, triage: 'none' },
  { keyword: 'burn', score: 70, triage: 'none' },
  { keyword: 'severe burn', score: 85, triage: 'none' },
  { keyword: 'poisoning', score: 90, triage: 'C' },
  { keyword: 'overdose', score: 92, triage: 'C' },
  { keyword: 'allergic reaction', score: 78, triage: 'B' },
  { keyword: 'difficulty swallowing', score: 70, triage: 'A' },
  { keyword: 'vomiting blood', score: 88, triage: 'C' },
  { keyword: 'blood in stool', score: 72, triage: 'C' },

  // Low-priority
  { keyword: 'headache', score: 30, triage: 'none' },
  { keyword: 'mild headache', score: 20, triage: 'none' },
  { keyword: 'cold', score: 20, triage: 'none' },
  { keyword: 'cough', score: 25, triage: 'none' },
  { keyword: 'sore throat', score: 22, triage: 'none' },
  { keyword: 'runny nose', score: 15, triage: 'none' },
  { keyword: 'routine checkup', score: 10, triage: 'none' },
  { keyword: 'general consultation', score: 10, triage: 'none' },
  { keyword: 'follow up', score: 10, triage: 'none' },
  { keyword: 'vaccination', score: 10, triage: 'none' },
  { keyword: 'minor injury', score: 25, triage: 'none' },
  { keyword: 'rash', score: 25, triage: 'none' },
  { keyword: 'back pain', score: 35, triage: 'none' },
  { keyword: 'stomach ache', score: 30, triage: 'none' },
  { keyword: 'nausea', score: 28, triage: 'none' },
  { keyword: 'dizziness', score: 40, triage: 'none' },
  { keyword: 'fatigue', score: 25, triage: 'none' },
  { keyword: 'fever', score: 45, triage: 'none' },
  { keyword: 'joint pain', score: 30, triage: 'none' },
  { keyword: 'muscle pain', score: 28, triage: 'none' },
  { keyword: 'weakness', score: 40, triage: 'none' },
  { keyword: 'insomnia', score: 15, triage: 'none' },
  { keyword: 'anxiety', score: 20, triage: 'none' },
];

const EXISTING_CONDITION_MULTIPLIERS: Record<string, number> = {
  diabetes: 1.15,
  hypertension: 1.12,
  'heart disease': 1.25,
  asthma: 1.15,
  cancer: 1.20,
  kidney_disease: 1.18,
  liver_disease: 1.15,
  hiv: 1.10,
  pregnancy: 1.15,
  immunocompromised: 1.20,
};

// ---- public API ----

export function analyzeSymptoms(
  symptomsText: string,
  age?: number,
  vitalSigns?: VitalSigns,
  existingConditions?: string[]
): PriorityScore {
  const normalized = symptomsText.toLowerCase().trim();

  // 1. Symptom score (40 %)
  const { symptomScore, bestTriage, matchedKeywords } =
    computeSymptomScore(normalized);

  // 2. Age score (15 %)
  const ageScore = computeAgeScore(age);

  // 3. Vital-signs score (20 %)
  const vitalScore = computeVitalScore(vitalSigns);

  // 4. Existing conditions multiplier (15 %)
  const conditionScore = computeConditionScore(existingConditions);

  // 5. Emergency-keyword bonus (10 %)
  const emergencyBonus = symptomScore >= 85 ? 10 : symptomScore >= 70 ? 5 : 0;

  // Weighted total
  let total = Math.round(
    symptomScore * 0.4 +
      ageScore * 0.15 +
      vitalScore * 0.2 +
      conditionScore * 0.15 +
      emergencyBonus
  );

  total = Math.min(100, Math.max(0, total));

  const level = scoreToLevel(total);
  const reasoning = buildReasoning(matchedKeywords, age, vitalSigns, existingConditions);
  const recommendedAction = buildAction(level);

  return {
    total,
    level,
    triageCategory: bestTriage,
    symptomScore,
    ageScore,
    vitalScore,
    conditionScore,
    emergencyBonus,
    reasoning,
    recommendedAction,
  };
}

/** Quick estimate while the user is typing. */
export function quickEstimate(symptomsText: string): {
  level: PriorityLevel;
  score: number;
} {
  const { symptomScore } = computeSymptomScore(
    symptomsText.toLowerCase().trim()
  );
  const total = Math.round(symptomScore * 0.55 + 20); // rough
  return { level: scoreToLevel(total), score: Math.min(100, total) };
}

// ---- internal helpers ----

function computeSymptomScore(text: string): {
  symptomScore: number;
  bestTriage: TriageCategory;
  matchedKeywords: string[];
} {
  let maxScore = 10; // baseline for unknown symptoms
  let bestTriage: TriageCategory = 'none';
  const matchedKeywords: string[] = [];

  for (const { keyword, score, triage } of EMERGENCY_KEYWORDS) {
    if (text.includes(keyword)) {
      matchedKeywords.push(keyword);
      if (score > maxScore) {
        maxScore = score;
        bestTriage = triage;
      }
    }
  }

  // Multiple critical symptoms compound slightly
  if (matchedKeywords.length > 1) {
    const bonus = Math.min(matchedKeywords.length * 3, 10);
    maxScore = Math.min(100, maxScore + bonus);
  }

  return { symptomScore: maxScore, bestTriage, matchedKeywords };
}

function computeAgeScore(age?: number): number {
  if (age === undefined) return 50; // neutral
  if (age <= 1) return 95;
  if (age <= 5) return 80;
  if (age <= 12) return 60;
  if (age <= 60) return 50;
  if (age <= 75) return 70;
  return 85; // 75+
}

function computeVitalScore(vitals?: VitalSigns): number {
  if (!vitals) return 50; // neutral when not supplied
  let score = 50;

  if (vitals.temperature !== undefined) {
    if (vitals.temperature >= 40) score += 20;
    else if (vitals.temperature >= 38.5) score += 10;
    else if (vitals.temperature < 35) score += 15;
  }

  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate > 120 || vitals.heartRate < 50) score += 20;
    else if (vitals.heartRate > 100 || vitals.heartRate < 60) score += 10;
  }

  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation < 90) score += 25;
    else if (vitals.oxygenSaturation < 95) score += 12;
  }

  if (
    vitals.bloodPressureSystolic !== undefined &&
    vitals.bloodPressureDiastolic !== undefined
  ) {
    if (
      vitals.bloodPressureSystolic > 180 ||
      vitals.bloodPressureDiastolic > 120
    )
      score += 20;
    else if (
      vitals.bloodPressureSystolic > 140 ||
      vitals.bloodPressureDiastolic > 90
    )
      score += 10;
    else if (vitals.bloodPressureSystolic < 90) score += 20;
  }

  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate > 30 || vitals.respiratoryRate < 8)
      score += 20;
    else if (vitals.respiratoryRate > 20) score += 10;
  }

  return Math.min(100, score);
}

function computeConditionScore(conditions?: string[]): number {
  if (!conditions || conditions.length === 0) return 50;
  let multiplier = 1;
  for (const c of conditions) {
    const key = c.toLowerCase().trim();
    if (EXISTING_CONDITION_MULTIPLIERS[key]) {
      multiplier *= EXISTING_CONDITION_MULTIPLIERS[key];
    }
  }
  return Math.min(100, Math.round(50 * multiplier));
}

function scoreToLevel(score: number): PriorityLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function buildReasoning(
  keywords: string[],
  age?: number,
  vitals?: VitalSigns,
  conditions?: string[]
): string {
  const parts: string[] = [];
  if (keywords.length)
    parts.push(`Detected symptoms: ${keywords.join(', ')}`);
  if (age !== undefined) parts.push(`Patient age: ${age}`);
  if (vitals) {
    const v: string[] = [];
    if (vitals.temperature) v.push(`temp ${vitals.temperature}°C`);
    if (vitals.heartRate) v.push(`HR ${vitals.heartRate}`);
    if (vitals.oxygenSaturation) v.push(`SpO2 ${vitals.oxygenSaturation}%`);
    if (v.length) parts.push(`Vitals: ${v.join(', ')}`);
  }
  if (conditions?.length)
    parts.push(`Pre-existing: ${conditions.join(', ')}`);
  return parts.join('. ') || 'Standard assessment.';
}

function buildAction(level: PriorityLevel): string {
  switch (level) {
    case 'high':
      return 'Immediate medical attention required. Patient will be fast-tracked to emergency care.';
    case 'medium':
      return 'Urgent assessment needed. Patient placed ahead of non-urgent cases.';
    case 'low':
      return 'Standard consultation. Patient enters normal waiting queue.';
  }
}
