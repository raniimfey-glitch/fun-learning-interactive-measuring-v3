export interface UnitData {
  id: string;
  name: string;
  vocalizedName: string;
  short: string;
  vocalizedShort: string;
  ml: number;
  emoji: string;
  color: string;
  light: string;
  description: string;
  vocalizedDesc: string;
}

export type ExerciseType = 'mcq' | 'compare' | 'double' | 'visual' | 'fill';

export interface ExerciseItem {
  id: string;
  type: ExerciseType;
  q: string;
  vocalizedQ: string;
  unit?: string;
  choices?: string[];
  vocalizedChoices?: string[];
  answer: string;
  a?: string;
  b?: string;
  q1?: string;
  vocalizedQ1?: string;
  a1?: string;
  q2?: string;
  vocalizedQ2?: string;
  a2?: string;
  explanation?: string;
  vocalizedExplanation?: string;
}

export interface ComplementItem {
  id: string;
  op: '+' | '-';
  q: string;
  vocalizedQ: string;
  a: string;
  hint: string;
  vocalizedHint: string;
  twoAnswers?: boolean;
  labels?: string[];
  refML: number;
}

export interface PourActivity {
  id: string;
  src: string;
  tgt: string;
  task: string;
  vocalizedTask: string;
  goalML: number;
  stepML: number;
  vocalizedSuccess: string;
}

export interface AudioSettings {
  enabled: boolean;
  rate: number; // 0.75 - 1.2
  pitch: number; // 0.8 - 1.2
  volume: number; // 0 - 1
  voiceURI: string;
  useGeminiTTS: boolean;
  autoPlayQuestion: boolean;
}
