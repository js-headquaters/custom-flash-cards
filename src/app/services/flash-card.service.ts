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
    this.dbPromise = openDB<FlashCardDB>('flash-card-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('flashcards', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          // Обновляем существующие карточки, добавляя categoryId
          const transaction = db.transaction('flashcards', 'readwrite');
          const store = transaction.objectStore('flashcards');
          store.openCursor().then(function (cursor) {
            if (cursor) {
              const card = cursor.value;
              if (!card.categoryId) {
                card.categoryId = 'default'; // Временная категория для существующих карточек
                cursor.update(card);
              }
              cursor.continue();
            }
          });
        }
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

  async getFlashCardsByCategory(categoryId: string): Promise<FlashCard[]> {
    const db = await this.dbPromise;
    const allCards = await db.getAll('flashcards');
    return allCards.filter((card) => card.categoryId === categoryId);
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('flashcards');
  }

  async deleteFlashCard(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('flashcards', id);
  }

  async deleteFlashCardsByCategory(categoryId: string): Promise<void> {
    const db = await this.dbPromise;
    const allCards = await db.getAll('flashcards');
    const cardsToDelete = allCards.filter(
      (card) => card.categoryId === categoryId
    );

    for (const card of cardsToDelete) {
      await db.delete('flashcards', card.id);
    }
  }
}
