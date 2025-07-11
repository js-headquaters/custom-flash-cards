import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RollPhrase } from '../../services/openai.service';

@Component({
  selector: 'app-roll-popup',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule],
  template: `
    <div class="popup-overlay" (click)="onOverlayClick($event)">
      <mat-card class="popup-card">
        <mat-card-header>
          <mat-card-title>Modified Phrase</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="phrase-container">
            <div class="phrase portuguese">
              <strong>Portuguese:</strong> {{ phrase.portuguese }}
            </div>
            <div class="phrase russian">
              <strong>Russian:</strong> {{ phrase.russian }}
            </div>
            <div class="phrase verbs">
              <strong>Verbs:</strong> {{ phrase.verbs }}
            </div>
            <div class="phrase tense">
              <strong>Tense:</strong> {{ phrase.tense }}
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button
            mat-button
            color="accent"
            (click)="onRoll()"
            [disabled]="loading"
          >
            {{ loading ? 'Rolling...' : 'Roll' }}
          </button>
          <button mat-button color="primary" (click)="onClose()">Close</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .popup-card {
        max-width: 500px;
        width: 90%;
        margin: 20px;
      }

      .phrase-container {
        margin: 20px 0;
      }

      .phrase {
        margin: 10px 0;
        padding: 10px;
        border-radius: 4px;
        background-color: #f5f5f5;
      }

      .phrase.portuguese {
        border-left: 4px solid #1976d2;
      }

      .phrase.russian {
        border-left: 4px solid #388e3c;
      }

      .phrase.verbs {
        border-left: 4px solid #ff9800;
      }

      .phrase.tense {
        border-left: 4px solid #9c27b0;
      }

      .phrase strong {
        color: #333;
      }

      mat-card-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class RollPopupComponent {
  @Input() phrase!: RollPhrase;
  @Input() loading = false;
  @Output() close = new EventEmitter<void>();
  @Output() roll = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onRoll() {
    this.roll.emit();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
