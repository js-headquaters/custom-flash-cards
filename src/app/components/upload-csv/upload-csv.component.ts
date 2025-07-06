import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { FlashCardService } from '../../services/flash-card.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-upload-csv',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Upload CSV</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Upload a CSV file with English and Portuguese (Brazil) phrases.</p>

        <mat-form-field
          appearance="outline"
          style="width: 100%; margin-bottom: 1rem;"
        >
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="selectedCategoryId" required>
            @for (category of categories; track category.id) {
            <mat-option [value]="category.id">
              {{ category.name }} ({{ category.wordCount }} words)
            </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field
          appearance="outline"
          style="width: 100%; margin-bottom: 1rem;"
        >
          <mat-label>Or create new category</mat-label>
          <input
            matInput
            [(ngModel)]="newCategoryName"
            placeholder="Enter category name"
          />
        </mat-form-field>

        <input
          type="file"
          accept=".csv"
          (change)="onFileSelected($event)"
          style="display: none"
          #fileInput
        />
        <button mat-button color="primary" (click)="fileInput.click()">
          Choose File
        </button>
        @if (selectedFile) {
        <span>{{ selectedFile.name }}</span>
        }
      </mat-card-content>
      <mat-card-actions>
        <button
          mat-button
          color="primary"
          (click)="onUpload()"
          [disabled]="
            !selectedFile || (!selectedCategoryId && !newCategoryName)
          "
        >
          Upload
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        margin-bottom: 20px;
      }
      span {
        margin-left: 16px;
      }
    `,
  ],
})
export class UploadCsvComponent {
  selectedFile: File | null = null;
  categories: Category[] = [];
  selectedCategoryId: string = '';
  newCategoryName: string = '';

  constructor(
    private flashCardService: FlashCardService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.categoryService.getAllCategories();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  async onUpload() {
    if (!this.selectedFile) return;

    try {
      let categoryId = this.selectedCategoryId;

      // Если выбрана новая категория, создаем её
      if (!categoryId && this.newCategoryName.trim()) {
        const newCategory = await this.categoryService.addCategory(
          this.newCategoryName.trim()
        );
        categoryId = newCategory.id;
        await this.loadCategories(); // Обновляем список категорий
      }

      if (!categoryId) {
        this.snackBar.open('Please select or create a category', 'Close', {
          duration: 2000,
        });
        return;
      }

      const text = await this.selectedFile.text();
      const rows = text.split(/\r?\n/).filter((r) => r.trim());
      let count = 0;

      for (const row of rows) {
        const [portuguese, english, verbs, explanation] = row
          .split(',')
          .map((s) => s.trim());
        if (english && portuguese) {
          await this.flashCardService.addFlashCard({
            english,
            portuguese,
            verbs,
            explanation,
            categoryId,
          });
          count++;
        }
      }

      // Обновляем количество слов в категории
      const categoryCards = await this.flashCardService.getFlashCardsByCategory(
        categoryId
      );
      await this.categoryService.updateWordCount(
        categoryId,
        categoryCards.length
      );

      this.snackBar.open(`${count} phrases uploaded to category!`, 'Close', {
        duration: 2000,
      });

      this.selectedFile = null;
      this.selectedCategoryId = '';
      this.newCategoryName = '';
    } catch (err) {
      this.snackBar.open('Error uploading CSV', 'Close', { duration: 2000 });
    }
  }
}
