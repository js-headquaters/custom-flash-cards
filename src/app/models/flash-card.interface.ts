export interface FlashCard {
  id: string;
  english: string;
  portuguese: string;
  verbs: string;
  explanation: string;
  correctCount?: number;
  incorrectCount?: number;
  lastStudied?: Date;
  examples?: { english: string; portuguese: string }[];
}
