import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Category } from '../models/category.interface';
import { v4 as uuidv4 } from 'uuid';

interface CategoryDB extends DBSchema {
  categories: {
    key: string;
    value: Category;
  };
  flashcards: {
    key: string;
    value: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private dbPromise: Promise<IDBPDatabase<CategoryDB>>;

  constructor() {
    console.log('CategoryService constructor');
    this.dbPromise = openDB<CategoryDB>('flash-card-db', 3, {
      upgrade(db, oldVersion) {
        console.log(
          'CategoryService DB upgrade from version',
          oldVersion,
          'to 3'
        );
        if (oldVersion < 1) {
          console.log('CategoryService: Creating flashcards store');
          db.createObjectStore('flashcards', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          console.log('CategoryService: Creating categories store');
          // Создаем хранилище для категорий
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (oldVersion < 3) {
          console.log('CategoryService: Adding progress to existing cards');
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
      blocked() {
        console.error('IndexedDB upgrade blocked');
      },
      blocking() {
        console.error('IndexedDB blocking');
      },
      terminated() {
        console.error('IndexedDB terminated');
      },
    });
    this.dbPromise.catch((err) => {
      console.error('Error opening IndexedDB:', err);
    });
  }

  async addCategory(name: string): Promise<Category> {
    const db = await this.dbPromise;
    const category: Category = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      wordCount: 0,
    };
    await db.put('categories', category);
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    console.log('CategoryService: Getting all categories...');
    const db = await this.dbPromise;
    const categories = await db.getAll('categories');
    console.log('CategoryService: Retrieved', categories.length, 'categories');
    return categories;
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    console.log('CategoryService: Getting category by id', id);
    const db = await this.dbPromise;
    const category = await db.get('categories', id);
    console.log('CategoryService: Category found:', category);
    return category;
  }

  async updateCategory(category: Category): Promise<void> {
    const db = await this.dbPromise;
    await db.put('categories', category);
  }

  async deleteCategory(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('categories', id);
  }

  async updateWordCount(categoryId: string, count: number): Promise<void> {
    const category = await this.getCategoryById(categoryId);
    if (category) {
      category.wordCount = count;
      await this.updateCategory(category);
    }
  }
}
