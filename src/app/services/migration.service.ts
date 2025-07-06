import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FlashCard } from '../models/flash-card.interface';
import { Category } from '../models/category.interface';
import { v4 as uuidv4 } from 'uuid';

interface MigrationDB extends DBSchema {
  flashcards: {
    key: string;
    value: FlashCard;
  };
  categories: {
    key: string;
    value: Category;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MigrationService {
  private dbPromise: Promise<IDBPDatabase<MigrationDB>>;

  constructor() {
    this.dbPromise = openDB<MigrationDB>('flash-card-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('flashcards', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
      },
    });
  }

  async migrateExistingData(): Promise<void> {
    const db = await this.dbPromise;

    // Проверяем, есть ли существующие карточки без categoryId
    const allCards = await db.getAll('flashcards');
    const cardsWithoutCategory = allCards.filter((card) => !card.categoryId);

    if (cardsWithoutCategory.length > 0) {
      // Создаем категорию "Default" для существующих карточек
      const defaultCategory: Category = {
        id: uuidv4(),
        name: 'Default',
        createdAt: new Date(),
        wordCount: cardsWithoutCategory.length,
      };

      await db.put('categories', defaultCategory);

      // Обновляем все карточки, добавляя categoryId
      for (const card of cardsWithoutCategory) {
        card.categoryId = defaultCategory.id;
        await db.put('flashcards', card);
      }
    }
  }

  async checkAndMigrate(): Promise<void> {
    try {
      await this.migrateExistingData();
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
}
