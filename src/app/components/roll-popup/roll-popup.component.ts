import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { RollPhrase } from '../../services/openai.service';
import { ClickableWordComponent } from '../clickable-word/clickable-word.component';
import { InterestingWordsService } from '../../services/interesting-words.service';
import {
  WordConfirmationDialogComponent,
  WordConfirmationDialogData,
} from '../word-confirmation-dialog/word-confirmation-dialog.component';

@Component({
  selector: 'app-roll-popup',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    ClickableWordComponent,
    MatDialogModule,
  ],
  templateUrl: './roll-popup.component.html',
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

      .phrase.attempts {
        border-left: 4px solid #f44336;
        background-color: #ffebee;
      }

      .phrase strong {
        color: #333;
      }

      .interesting-indicator {
        font-size: 0.8em;
        color: #ff9800;
        font-weight: normal;
        margin-left: 10px;
        background-color: #fff3e0;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #ffcc02;
      }

      .word-container {
        display: inline;
        line-height: 1.5;
      }

      .word-separator {
        white-space: pre;
      }

      mat-card-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class RollPopupComponent implements OnInit, OnChanges {
  @Input() phrase!: RollPhrase;
  @Input() loading = false;
  @Input() rollAttempts = 0;
  @Input() maxRollAttempts = 3;
  @Output() close = new EventEmitter<void>();
  @Output() roll = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();

  showDetailedInfo = false;
  interestingWords: Set<string> = new Set();
  portugueseWords: string[] = [];

  constructor(
    private interestingWordsService: InterestingWordsService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadInterestingWords();
    this.parsePortugueseWords();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['phrase'] && this.phrase) {
      this.parsePortugueseWords();
    }
  }

  private async loadInterestingWords() {
    try {
      const words =
        await this.interestingWordsService.getInterestingWordsList();
      this.interestingWords = new Set(words);
    } catch (error) {
      console.error('Error loading interesting words:', error);
    }
  }

  private parsePortugueseWords() {
    if (this.phrase.portuguese) {
      this.portugueseWords = this.phrase.portuguese
        .split(/\s+/)
        .filter((word) => word.trim().length > 0);
    }
  }

  isWordInteresting(word: string): boolean {
    const normalizedWord = word.toLowerCase().trim();

    // Check for exact match first
    if (this.interestingWords.has(normalizedWord)) {
      return true;
    }

    // Check for partial matches only for words longer than 3 characters
    // This prevents false positives with common short words like "o", "a", "e", etc.
    if (normalizedWord.length > 3) {
      for (const interestingWord of this.interestingWords) {
        // Only check if the interesting word is also longer than 3 characters
        if (interestingWord.length > 3) {
          // Check if the current word contains the interesting word
          if (normalizedWord.includes(interestingWord)) {
            return true;
          }
          // Check if the interesting word contains the current word (for longer interesting words)
          if (interestingWord.includes(normalizedWord)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  wasInterestingWordsUsed(): boolean {
    console.log(
      '>> was interesting words used',
      this.portugueseWords.some((word) => this.isWordInteresting(word))
    );
    return this.portugueseWords.some((word) => this.isWordInteresting(word));
  }

  async onWordClick(word: string) {
    const isCurrentlyInteresting = this.isWordInteresting(word);
    const dialogRef = this.dialog.open(WordConfirmationDialogComponent, {
      width: '400px',
      data: {
        word,
        isCurrentlyInteresting,
      } as WordConfirmationDialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const wasAdded =
          await this.interestingWordsService.toggleInterestingWord(word);
        await this.loadInterestingWords();

        if (wasAdded) {
          console.log(`Word "${word}" marked as interesting`);
        } else {
          console.log(`Word "${word}" unmarked as interesting`);
        }
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onRoll() {
    this.showDetailedInfo = false;
    this.roll.emit();
  }

  onContinue() {
    this.continue.emit();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onPopupDoubleTap() {
    this.showDetailedInfo = !this.showDetailedInfo;
  }
}
