import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface WordConfirmationDialogData {
  word: string;
  isCurrentlyInteresting: boolean;
}

@Component({
  selector: 'app-word-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  template: `
    <h2 mat-dialog-title>
      {{
        data.isCurrentlyInteresting ? 'Unmark Word' : 'Mark Word as Interesting'
      }}
    </h2>
    <mat-dialog-content>
      <p>
        {{
          data.isCurrentlyInteresting
            ? 'Do you want to unmark this word as interesting?'
            : 'Do you want to mark this word as interesting?'
        }}
      </p>
      <p class="word-highlight">{{ data.word }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>No</button>
      <button mat-button [mat-dialog-close]="true" color="primary">
        {{ data.isCurrentlyInteresting ? 'Yes, Unmark' : 'Yes, Mark' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .word-highlight {
        font-weight: bold;
        color: #1976d2;
        font-size: 1.2em;
        text-align: center;
        margin: 10px 0;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 4px;
      }
    `,
  ],
})
export class WordConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WordConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WordConfirmationDialogData
  ) {}
}
