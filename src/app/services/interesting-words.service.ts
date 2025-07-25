import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { InterestingWord } from '../models/interesting-word.interface';
import { v4 as uuidv4 } from 'uuid';

interface InterestingWordsDB extends DBSchema {
  interestingWords: {
    key: string;
    value: InterestingWord;
    indexes: {
      'by-word': string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class InterestingWordsService {
  private dbPromise: Promise<IDBPDatabase<InterestingWordsDB>>;

  constructor() {
    console.log('InterestingWordsService: Initializing database...');
    this.dbPromise = openDB<InterestingWordsDB>('interesting-words-db', 1, {
      upgrade(db, oldVersion) {
        console.log(
          'InterestingWordsService: Database upgrade from version',
          oldVersion,
          'to 1'
        );
        if (oldVersion < 1) {
          console.log(
            'InterestingWordsService: Creating interesting words store'
          );
          const store = db.createObjectStore('interestingWords', {
            keyPath: 'id',
          });
          store.createIndex('by-word', 'word', { unique: false });
        }
      },
    });
    console.log('InterestingWordsService: Database initialization complete');
  }

  async addInterestingWord(word: string): Promise<void> {
    const db = await this.dbPromise;
    const interestingWord: InterestingWord = {
      id: uuidv4(),
      word: word.toLowerCase().trim(),
      createdAt: new Date(),
      isActive: true,
    };
    await db.put('interestingWords', interestingWord);
  }

  async toggleInterestingWord(word: string): Promise<boolean> {
    const db = await this.dbPromise;
    const tx = db.transaction('interestingWords', 'readwrite');
    const store = tx.objectStore('interestingWords');
    const index = store.index('by-word');
    const key = await index.getKey(word.toLowerCase().trim());
    if (key) {
      await store.delete(key);
      return false; // Word was removed
    }
    // Word doesn't exist, add it
    await this.addInterestingWord(word);
    return true; // Word was added
  }

  async getAllInterestingWords(): Promise<InterestingWord[]> {
    const db = await this.dbPromise;
    return await db.getAll('interestingWords');
  }

  async getInterestingWordsList(): Promise<string[]> {
    const words = await this.getAllInterestingWords();
    return words.map((w) => w.word);
  }

  isWordInteresting(word: string, interestingWords: Set<string>): boolean {
    const normalizedWord = word.toLowerCase().trim();

    // Check for exact match first
    if (interestingWords.has(normalizedWord)) {
      return true;
    }

    // Check for partial matches only for words longer than 3 characters
    // This prevents false positives with common short words like "o", "a", "e", etc.
    if (normalizedWord.length > 3) {
      for (const interestingWord of interestingWords) {
        // Only check if the interesting word is also longer than 3 characters
        if (interestingWord.length > 3) {
          // Check if the current word contains the interesting word
          if (normalizedWord.includes(interestingWord)) {
            return true;
          }
          // Check if the interesting word contains the current word (for longer interesting words)
          if (interestingWord.includes(normalizedWord)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
