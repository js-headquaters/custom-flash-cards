import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { FlashCardService } from '../../services/flash-card.service';
import { CategoryService } from '../../services/category.service';
import { FlashCard } from '../../models/flash-card.interface';
import { Category } from '../../models/category.interface';
import { FlashCardComponent } from '../flash-card/flash-card.component';

function shuffle<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
  let m = array.length,
    t: T,
    i: number;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

@Component({
  selector: 'app-study-mode',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    FlashCardComponent,
  ],
  template: `
    @if (!studying && !categorySelected) {
    <mat-card>
      <mat-card-header>
        <mat-card-title>Study Mode</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Select a category to start studying your flash cards.</p>

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
      </mat-card-content>
      <mat-card-actions>
        <button
          mat-button
          color="primary"
          (click)="selectCategory()"
          [disabled]="!selectedCategoryId"
        >
          Select Category
        </button>
      </mat-card-actions>
    </mat-card>
    } @if (!studying && categorySelected) {
    <mat-card>
      <mat-card-header>
        <mat-card-title
          >Study Mode - {{ selectedCategory?.name }}</mat-card-title
        >
      </mat-card-header>
      <mat-card-content>
        <p>
          Ready to study {{ cards.length }} cards from "{{
            selectedCategory?.name
          }}" category.
        </p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" (click)="startStudying()">
          Start Studying
        </button>
        <button mat-button (click)="backToCategorySelection()">
          Back to Categories
        </button>
      </mat-card-actions>
    </mat-card>
    } @if (studying && currentCard) {
    <app-flash-card
      [card]="currentCard"
      [showAnswer]="showAnswer"
      [showEnglish]="showEnglish"
      (showAnswerChange)="showAnswer = $event"
      (markCorrect)="markCorrect()"
      (markIncorrect)="markIncorrect()"
    ></app-flash-card>

    <mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
    } @if (studying && cards.length > 0 && currentIndex >= cards.length) {
    <mat-card>
      <mat-card-header>
        <mat-card-title>Session Complete!</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>
          You studied all your flash cards from "{{ selectedCategory?.name }}"
          category.
        </p>
        <button mat-button color="primary" (click)="restart()">Restart</button>
        <button mat-button (click)="backToCategorySelection()">
          Back to Categories
        </button>
      </mat-card-content>
    </mat-card>
    }
  `,
  styles: [
    `
      mat-card {
        margin-bottom: 20px;
      }
      p {
        margin-bottom: 16px;
      }
    `,
  ],
})
export class StudyModeComponent {
  studying = false;
  categorySelected = false;
  cards: FlashCard[] = [];
  categories: Category[] = [];
  selectedCategoryId: string = '';
  selectedCategory: Category | null = null;
  currentIndex = 0;
  showAnswer = false;
  showEnglish = true;

  constructor(
    private flashCardService: FlashCardService,
    private categoryService: CategoryService
  ) {
    this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.categoryService.getAllCategories();
  }

  get currentCard(): FlashCard | null {
    return this.cards[this.currentIndex] || null;
  }

  get progress(): number {
    return this.cards.length
      ? (this.currentIndex / this.cards.length) * 100
      : 0;
  }

  async selectCategory() {
    if (!this.selectedCategoryId) return;

    this.selectedCategory =
      this.categories.find((c) => c.id === this.selectedCategoryId) || null;
    if (!this.selectedCategory) return;

    const categoryCards = await this.flashCardService.getFlashCardsByCategory(
      this.selectedCategoryId
    );
    this.cards = categoryCards;
    this.categorySelected = true;
  }

  backToCategorySelection() {
    this.categorySelected = false;
    this.studying = false;
    this.selectedCategoryId = '';
    this.selectedCategory = null;
    this.cards = [];
    this.currentIndex = 0;
    this.showAnswer = false;
    this.showEnglish = true;
  }

  async startStudying() {
    if (this.cards.length === 0) {
      const categoryCards = await this.flashCardService.getFlashCardsByCategory(
        this.selectedCategoryId
      );
      this.cards = shuffle([...categoryCards]);
    } else {
      this.cards = shuffle([...this.cards]);
    }

    this.currentIndex = 0;
    this.studying = true;
    this.showAnswer = false;
    this.showEnglish = false;
  }

  markCorrect() {
    this.nextCard();
  }

  markIncorrect() {
    this.nextCard();
  }

  nextCard() {
    this.currentIndex++;
    this.showAnswer = false;
    this.showEnglish = false;
  }

  restart() {
    this.currentIndex = 0;
    this.showAnswer = false;
    this.showEnglish = false;
    this.cards = shuffle([...this.cards]);
  }
}
