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
    this.dbPromise = openDB<CategoryDB>('flash-card-db', 2, {
      upgrade(db, oldVersion) {
        console.log('CategoryService DB upgrade', oldVersion);
        if (oldVersion < 1) {
          db.createObjectStore('flashcards', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          // Создаем хранилище для категорий
          db.createObjectStore('categories', { keyPath: 'id' });
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
    const db = await this.dbPromise;
    return db.getAll('categories');
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const db = await this.dbPromise;
    return db.get('categories', id);
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
