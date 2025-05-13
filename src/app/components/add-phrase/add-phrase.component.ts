import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlashCardService } from '../../services/flash-card.service';

@Component({
  selector: 'app-add-phrase',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
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
            <mat-label>English Phrase</mat-label>
            <input
              matInput
              formControlName="english"
              placeholder="Enter English phrase"
            />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Spanish Phrase</mat-label>
            <input
              matInput
              formControlName="spanish"
              placeholder="Enter Spanish phrase"
            />
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" (click)="onSubmit()">
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

  constructor(
    private fb: FormBuilder,
    private flashCardService: FlashCardService,
    private snackBar: MatSnackBar
  ) {
    this.phraseForm = this.fb.group({
      english: ['', Validators.required],
      spanish: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.phraseForm.valid) {
      try {
        await this.flashCardService.addFlashCard(this.phraseForm.value);
        this.snackBar.open('Phrase added!', 'Close', { duration: 2000 });
        this.phraseForm.reset();
      } catch (err) {
        this.snackBar.open('Error adding phrase', 'Close', { duration: 2000 });
      }
    }
  }
}
