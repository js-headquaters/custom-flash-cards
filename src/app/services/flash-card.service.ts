import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FlashCard } from '../models/flash-card.interface';
import { v4 as uuidv4 } from 'uuid';

interface FlashCardDB extends DBSchema {
  flashcards: {
    key: string;
    value: FlashCard;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FlashCardService {
  private dbPromise: Promise<IDBPDatabase<FlashCardDB>>;

  constructor() {
    this.dbPromise = openDB<FlashCardDB>('flash-card-db', 1, {
      upgrade(db) {
        db.createObjectStore('flashcards', { keyPath: 'id' });
      },
    });
  }

  async addFlashCard(card: Omit<FlashCard, 'id'>): Promise<void> {
    const db = await this.dbPromise;
    await db.put('flashcards', { ...card, id: uuidv4() });
  }

  async getAllFlashCards(): Promise<FlashCard[]> {
    const db = await this.dbPromise;
    return db.getAll('flashcards');
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('flashcards');
  }

  async deleteFlashCard(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('flashcards', id);
  }
}
