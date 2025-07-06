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
    console.log('FlashCardService: Initializing database...');
    this.dbPromise = openDB<FlashCardDB>('flash-card-db', 3, {
      upgrade(db, oldVersion) {
        console.log(
          'FlashCardService: Database upgrade from version',
          oldVersion,
          'to 3'
        );
        if (oldVersion < 1) {
          console.log('FlashCardService: Creating flashcards store');
          db.createObjectStore('flashcards', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          console.log('FlashCardService: Adding categoryId to existing cards');
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
        if (oldVersion < 3) {
          console.log('FlashCardService: Adding progress to existing cards');
          // Обновляем существующие карточки, добавляя progress
          const transaction = db.transaction('flashcards', 'readwrite');
          const store = transaction.objectStore('flashcards');
          store.openCursor().then(function (cursor) {
            if (cursor) {
              const card = cursor.value;
              if (card.progress === undefined) {
                card.progress = 0; // По умолчанию прогресс 0
                cursor.update(card);
              }
              cursor.continue();
            }
          });
        }
      },
    });
    console.log('FlashCardService: Database initialization complete');
  }

  async addFlashCard(card: Omit<FlashCard, 'id'>): Promise<void> {
    const db = await this.dbPromise;
    await db.put('flashcards', {
      ...card,
      id: uuidv4(),
      progress: card.progress || 0,
    });
  }

  async getAllFlashCards(): Promise<FlashCard[]> {
    console.log('FlashCardService: Getting all flash cards...');
    const db = await this.dbPromise;
    const cards = await db.getAll('flashcards');
    console.log('FlashCardService: Retrieved', cards.length, 'cards');
    return cards;
  }

  async getFlashCardsByCategory(categoryId: string): Promise<FlashCard[]> {
    console.log('FlashCardService: Getting cards for category', categoryId);
    const db = await this.dbPromise;
    const allCards = await db.getAll('flashcards');
    const filteredCards = allCards.filter(
      (card) => card.categoryId === categoryId
    );
    console.log(
      'FlashCardService: Found',
      filteredCards.length,
      'cards for category',
      categoryId
    );
    return filteredCards;
  }

  async getFlashCardsByCategorySortedByProgress(
    categoryId: string
  ): Promise<FlashCard[]> {
    console.log(
      'FlashCardService: Getting cards sorted by progress for category',
      categoryId
    );
    const cards = await this.getFlashCardsByCategory(categoryId);
    // Сортируем по прогрессу: сначала слова с меньшим прогрессом (хуже изученные)
    const sortedCards = cards.sort(
      (a, b) => (a.progress || 0) - (b.progress || 0)
    );
    console.log('FlashCardService: Sorted cards by progress');
    return sortedCards;
  }

  async updateCardProgress(cardId: string, isCorrect: boolean): Promise<void> {
    const db = await this.dbPromise;
    const card = await db.get('flashcards', cardId);
    if (!card) return;

    let currentProgress = card.progress || 0;

    if (isCorrect) {
      // Увеличиваем прогресс на 12.5% (100% / 8 повторений)
      currentProgress = Math.min(100, currentProgress + 12.5);
    }
    // Если неправильно - прогресс не меняется

    // Обновляем счетчики
    const correctCount = (card.correctCount || 0) + (isCorrect ? 1 : 0);
    const incorrectCount = (card.incorrectCount || 0) + (isCorrect ? 0 : 1);

    await db.put('flashcards', {
      ...card,
      progress: currentProgress,
      correctCount,
      incorrectCount,
      lastStudied: new Date(),
    });
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
