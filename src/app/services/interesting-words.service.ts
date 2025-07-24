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

  async removeInterestingWord(word: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('interestingWords', 'readwrite');
    const store = tx.objectStore('interestingWords');
    const index = store.index('by-word');
    const cursor = await index.openCursor();

    while (cursor) {
      if (cursor.value.word === word.toLowerCase().trim()) {
        await cursor.delete();
        break;
      }
      await cursor.continue();
    }
  }

  async toggleInterestingWord(word: string): Promise<boolean> {
    const db = await this.dbPromise;
    const tx = db.transaction('interestingWords', 'readwrite');
    const store = tx.objectStore('interestingWords');
    const index = store.index('by-word');
    const cursor = await index.openCursor();

    while (cursor) {
      if (cursor.value.word === word.toLowerCase().trim()) {
        // Word exists, remove it
        await cursor.delete();
        return false; // Word was removed
      }
      await cursor.continue();
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
}
