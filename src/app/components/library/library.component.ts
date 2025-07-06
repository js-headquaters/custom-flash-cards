import { Component, OnInit } from '@angular/core';
import { FlashCardService } from '../../services/flash-card.service';
import { CategoryService } from '../../services/category.service';
import { FlashCard } from '../../models/flash-card.interface';
import { Category } from '../../models/category.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
  ],
  template: `
    <div class="library-container">
      <h2>Library</h2>
      @if (loading) {
      <div>Loading...</div>
      } @else { @if (viewMode === 'categories') {
      <div class="categories-container">
        <!-- Создание новой категории -->
        <div class="create-category-section">
          <h3>Create New Category</h3>
          <div class="create-category-form">
            <input
              type="text"
              [(ngModel)]="newCategoryName"
              placeholder="Enter category name"
              class="category-input"
              (keyup.enter)="createCategory()"
            />
            <button
              class="create-btn"
              (click)="createCategory()"
              [disabled]="!newCategoryName.trim()"
            >
              Create Category
            </button>
          </div>
        </div>

        <!-- Список категорий -->
        <div class="categories-list">
          <h3>Your Categories</h3>
          @for (category of categories; track category.id) {
          <div class="category-card">
            <div class="category-info">
              <h4>{{ category.name }}</h4>
              <p>{{ category.wordCount }} words</p>
              <p class="category-date">
                Created: {{ category.createdAt | date : 'short' }}
              </p>
            </div>
            <div class="category-actions">
              <button class="view-btn" (click)="viewCategory(category.id)">
                View Words
              </button>
              <button class="delete-btn" (click)="deleteCategory(category.id)">
                Delete Category
              </button>
            </div>
          </div>
          } @if (categories.length === 0) {
          <div class="empty-state">
            <p>No categories in your library.</p>
            <p>Create your first category above or upload a CSV file!</p>
          </div>
          }
        </div>
      </div>
      } @if (viewMode === 'words') {
      <div class="words-container">
        <div class="header-actions">
          <button class="back-btn" (click)="backToCategories()">
            ← Back to Categories
          </button>
          @if (categoryWords.length > 0) {
          <button class="delete-all-btn" (click)="deleteAllWordsInCategory()">
            Delete All Words
          </button>
          }
        </div>

        <h3>{{ currentCategory?.name }} - Words</h3>

        <div class="words-list">
          @for (card of categoryWords; track card.id) {
          <div class="word-card">
            <div class="word-info">
              <span><strong>PT:</strong> {{ card.portuguese }}</span>
              <span><strong>EN:</strong> {{ card.english }}</span>
              <span><strong>Verbs:</strong> {{ card.verbs }}</span>
              <span><strong>Notes:</strong> {{ card.explanation }}</span>
              <div class="word-progress">
                <span class="progress-text"
                  >Progress: {{ card.progress || 0 | number : '1.0-0' }}%</span
                >
                <div class="progress-bar-container">
                  <div
                    class="progress-bar"
                    [style.width.%]="card.progress || 0"
                  ></div>
                </div>
              </div>
            </div>
            <button class="delete-word-btn" (click)="deleteWord(card.id)">
              Delete
            </button>
          </div>
          } @if (categoryWords.length === 0) {
          <div class="empty-state">
            <p>No words in this category.</p>
          </div>
          }
        </div>
      </div>
      } }
    </div>
  `,
  styles: [
    `
      .library-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
      }

      h2 {
        text-align: center;
        margin-bottom: 1.5rem;
        color: #333;
      }

      h3 {
        margin-bottom: 1rem;
        color: #444;
      }

      .create-category-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .create-category-form {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .category-input {
        flex: 1;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      .create-btn {
        background: #4caf50;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.8rem 1.5rem;
        cursor: pointer;
        font-weight: 500;
        font-size: 1rem;
      }

      .create-btn:hover:not(:disabled) {
        background: #45a049;
      }

      .create-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .categories-container {
        display: flex;
        flex-direction: column;
      }

      .categories-list {
        display: flex;
        flex-direction: column;
      }

      .category-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fafafa;
        margin-bottom: 1rem;
      }

      .category-info h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .category-info p {
        margin: 0.2rem 0;
        color: #666;
      }

      .category-date {
        font-size: 0.9rem;
        color: #888;
      }

      .category-actions {
        display: flex;
        gap: 0.5rem;
      }

      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .words-container {
        margin-top: 1rem;
      }

      .words-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .word-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.8rem;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: #fff;
      }

      .word-info {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .word-info span {
        font-size: 0.9rem;
      }

      .word-progress {
        margin-top: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .progress-text {
        font-size: 0.8rem;
        color: #666;
        font-weight: 500;
      }

      .progress-bar-container {
        width: 100%;
        height: 4px;
        background-color: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #4caf50, #8bc34a);
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      button {
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9rem;
      }

      .view-btn {
        background: #1976d2;
        color: #fff;
      }

      .view-btn:hover {
        background: #1565c0;
      }

      .back-btn {
        background: #666;
        color: #fff;
      }

      .back-btn:hover {
        background: #555;
      }

      .delete-btn,
      .delete-word-btn {
        background: #d32f2f;
        color: #fff;
      }

      .delete-btn:hover,
      .delete-word-btn:hover {
        background: #b71c1c;
      }

      .delete-all-btn {
        background: #f57c00;
        color: #fff;
      }

      .delete-all-btn:hover {
        background: #e65100;
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      .empty-state p {
        margin: 0.5rem 0;
      }

      @media (max-width: 600px) {
        .create-category-form {
          flex-direction: column;
          align-items: stretch;
        }

        .category-card {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }

        .category-actions {
          justify-content: center;
        }
      }
    `,
  ],
})
export class LibraryComponent implements OnInit {
  categories: Category[] = [];
  categoryWords: FlashCard[] = [];
  currentCategory: Category | null = null;
  viewMode: 'categories' | 'words' = 'categories';
  loading = false;
  newCategoryName: string = '';

  constructor(
    private flashCardService: FlashCardService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    console.log('LibraryComponent ngOnInit');
    await this.loadCategories();
  }

  async loadCategories() {
    console.log('LibraryComponent: Starting to load categories...');
    this.loading = true;
    try {
      console.log(
        'LibraryComponent: Calling categoryService.getAllCategories()...'
      );
      this.categories = await this.categoryService.getAllCategories();
      console.log(
        'LibraryComponent: Categories loaded successfully:',
        this.categories
      );
    } catch (error) {
      console.error('LibraryComponent: Error loading categories:', error);
    } finally {
      this.loading = false;
      console.log('LibraryComponent: Loading completed, loading = false');
    }
  }

  async createCategory() {
    if (!this.newCategoryName.trim()) return;

    try {
      await this.categoryService.addCategory(this.newCategoryName.trim());
      this.newCategoryName = '';
      await this.loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  }

  async viewCategory(categoryId: string) {
    console.log('LibraryComponent: Viewing category', categoryId);
    this.loading = true;
    try {
      this.currentCategory =
        this.categories.find((c) => c.id === categoryId) || null;
      console.log('LibraryComponent: Current category:', this.currentCategory);

      console.log('LibraryComponent: Getting flash cards for category...');
      this.categoryWords = await this.flashCardService.getFlashCardsByCategory(
        categoryId
      );
      console.log(
        'LibraryComponent: Flash cards loaded:',
        this.categoryWords.length,
        'cards'
      );

      this.viewMode = 'words';
    } catch (error) {
      console.error('LibraryComponent: Error viewing category:', error);
    } finally {
      this.loading = false;
      console.log('LibraryComponent: View category completed, loading = false');
    }
  }

  backToCategories() {
    this.viewMode = 'categories';
    this.currentCategory = null;
    this.categoryWords = [];
  }

  async deleteWord(id: string) {
    if (confirm('Are you sure you want to delete this word?')) {
      await this.flashCardService.deleteFlashCard(id);
      if (this.currentCategory) {
        this.categoryWords =
          await this.flashCardService.getFlashCardsByCategory(
            this.currentCategory.id
          );
        await this.categoryService.updateWordCount(
          this.currentCategory.id,
          this.categoryWords.length
        );
      }
    }
  }

  async deleteAllWordsInCategory() {
    if (!this.currentCategory) return;

    if (
      confirm(
        `Are you sure you want to delete all words in "${this.currentCategory.name}" category?`
      )
    ) {
      this.loading = true;
      try {
        await this.flashCardService.deleteFlashCardsByCategory(
          this.currentCategory.id
        );
        this.categoryWords = [];
        await this.categoryService.updateWordCount(this.currentCategory.id, 0);
        await this.loadCategories(); // Обновляем список категорий
      } catch (error) {
        console.error('Error deleting all words:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  async deleteCategory(id: string) {
    const category = this.categories.find((c) => c.id === id);
    if (!category) return;

    if (category.wordCount > 0) {
      if (
        confirm(
          `Category "${category.name}" contains ${category.wordCount} words. Delete category and all its words?`
        )
      ) {
        this.loading = true;
        try {
          await this.flashCardService.deleteFlashCardsByCategory(id);
          await this.categoryService.deleteCategory(id);
          await this.loadCategories();
        } catch (error) {
          console.error('Error deleting category:', error);
        } finally {
          this.loading = false;
        }
      }
    } else {
      if (
        confirm(`Are you sure you want to delete "${category.name}" category?`)
      ) {
        this.loading = true;
        try {
          await this.categoryService.deleteCategory(id);
          await this.loadCategories();
        } catch (error) {
          console.error('Error deleting category:', error);
        } finally {
          this.loading = false;
        }
      }
    }
  }
}
