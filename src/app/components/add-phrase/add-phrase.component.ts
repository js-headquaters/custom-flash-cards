import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlashCardService } from '../../services/flash-card.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-add-phrase',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Add New Phrase</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="phraseForm" (ngSubmit)="onSubmit()">
          <mat-form-field>
            <mat-label>Category</mat-label>
            <mat-select formControlName="categoryId" required>
              @for (category of categories; track category.id) {
              <mat-option [value]="category.id">
                {{ category.name }}
              </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>English Phrase</mat-label>
            <input
              matInput
              formControlName="english"
              placeholder="Enter English phrase"
            />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Portuguese (Brazil) Phrase</mat-label>
            <input
              matInput
              formControlName="portuguese"
              placeholder="Enter Portuguese (Brazil) phrase"
            />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Verbs (optional)</mat-label>
            <input matInput formControlName="verbs" placeholder="Enter verbs" />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Explanation (optional)</mat-label>
            <input
              matInput
              formControlName="explanation"
              placeholder="Enter explanation"
            />
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions>
        <button
          mat-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="!phraseForm.valid"
        >
          Add Phrase
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        margin-bottom: 20px;
      }
      mat-form-field {
        width: 100%;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class AddPhraseComponent {
  phraseForm: FormGroup;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private flashCardService: FlashCardService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.phraseForm = this.fb.group({
      categoryId: ['', Validators.required],
      english: ['', Validators.required],
      portuguese: ['', Validators.required],
      verbs: [''],
      explanation: [''],
    });

    this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.categoryService.getAllCategories();
  }

  async onSubmit() {
    if (this.phraseForm.valid) {
      try {
        const formValue = this.phraseForm.value;
        await this.flashCardService.addFlashCard({
          english: formValue.english,
          portuguese: formValue.portuguese,
          verbs: formValue.verbs || '',
          explanation: formValue.explanation || '',
          categoryId: formValue.categoryId,
        });

        // Обновляем количество слов в категории
        const categoryCards =
          await this.flashCardService.getFlashCardsByCategory(
            formValue.categoryId
          );
        await this.categoryService.updateWordCount(
          formValue.categoryId,
          categoryCards.length
        );

        this.snackBar.open('Phrase added!', 'Close', { duration: 2000 });
        this.phraseForm.reset();
      } catch (err) {
        this.snackBar.open('Error adding phrase', 'Close', { duration: 2000 });
      }
    }
  }
}
