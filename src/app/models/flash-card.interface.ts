export interface FlashCard {
  id: string;
  english: string;
  spanish: string;
  correctCount?: number;
  incorrectCount?: number;
  lastStudied?: Date;
  examples?: { english: string; spanish: string }[];
}
