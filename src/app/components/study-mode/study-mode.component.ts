import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlashCardService } from '../../services/flash-card.service';
import { FlashCard } from '../../models/flash-card.interface';
import { NgIf } from '@angular/common';
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
    NgIf,
    MatButtonModule,
    MatProgressBarModule,
    FlashCardComponent,
  ],
  template: `
    <mat-card *ngIf="!studying">
      <mat-card-header>
        <mat-card-title>Study Mode</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Start studying your flash cards here.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" (click)="startStudying()">
          Start Studying
        </button>
      </mat-card-actions>
    </mat-card>
    <app-flash-card
      *ngIf="studying && currentCard"
      [card]="currentCard"
      [showAnswer]="showAnswer"
      [showEnglish]="showEnglish"
      (showAnswerChange)="showAnswer = $event"
      (markCorrect)="markCorrect()"
      (markIncorrect)="markIncorrect()"
    ></app-flash-card>

    <mat-progress-bar
      *ngIf="studying && currentCard"
      mode="determinate"
      [value]="progress"
    ></mat-progress-bar>

    <mat-card
      *ngIf="studying && cards.length > 0 && currentIndex >= cards.length"
    >
      <mat-card-header>
        <mat-card-title>Session Complete!</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>You studied all your flash cards.</p>
        <button mat-button color="primary" (click)="restart()">Restart</button>
      </mat-card-content>
    </mat-card>
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
  cards: FlashCard[] = [];
  currentIndex = 0;
  showAnswer = false;
  showEnglish = true;

  constructor(private flashCardService: FlashCardService) {}

  get currentCard(): FlashCard | null {
    return this.cards[this.currentIndex] || null;
  }

  get progress(): number {
    return this.cards.length
      ? (this.currentIndex / this.cards.length) * 100
      : 0;
  }

  async startStudying() {
    const allCards = await this.flashCardService.getAllFlashCards();
    this.cards = shuffle([...allCards]);
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
