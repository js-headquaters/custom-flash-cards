import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlashCardService } from '../../services/flash-card.service';

@Component({
  selector: 'app-upload-csv',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Upload CSV</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Upload a CSV file with English and Portuguese (Brazil) phrases.</p>
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
        <span *ngIf="selectedFile">{{ selectedFile?.name }}</span>
      </mat-card-content>
      <mat-card-actions>
        <button
          mat-button
          color="primary"
          (click)="onUpload()"
          [disabled]="!selectedFile"
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

  constructor(
    private flashCardService: FlashCardService,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  async onUpload() {
    if (!this.selectedFile) return;
    try {
      const text = await this.selectedFile.text();
      const rows = text.split(/\r?\n/).filter((r) => r.trim());
      let count = 0;
      for (const row of rows) {
        const [portuguese, english] = row.split(',').map((s) => s.trim());
        if (english && portuguese) {
          await this.flashCardService.addFlashCard({
            english,
            portuguese,
          });
          count++;
        }
      }
      this.snackBar.open(`${count} phrases uploaded!`, 'Close', {
        duration: 2000,
      });
      this.selectedFile = null;
    } catch (err) {
      this.snackBar.open('Error uploading CSV', 'Close', { duration: 2000 });
    }
  }
}
