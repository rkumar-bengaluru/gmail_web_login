// types/index.ts
export interface Question {
  id: string;
  question: string;
  timeout: number;
  order: number;
  weight?: number;
  wav_file?: string;
}

export interface Test {
  test_name: string;
  role: string;
  date: string;
  session_timeout?: number;
  questions: Question[];
}

export interface Topic {
  topic: string;
  tests: Test[];
}

export type UserData = Topic[];