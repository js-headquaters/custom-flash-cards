import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { FlashCardComponent } from '../flash-card/flash-card.component';
import { InterestingWordsService } from '../../services/interesting-words.service';
import { OpenaiService, RollPhrase } from '../../services/openai.service';
import { FlashCard } from '../../models/flash-card.interface';
import { InterestingWord } from '../../models/interesting-word.interface';

@Component({
  selector: 'app-interesting-words-study-mode',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule,
    FlashCardComponent,
  ],
  template: `
    <div class="study-container">
      <!-- Initial state - no interesting words -->
      @if (!hasInterestingWords && !loading) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>Interesting Words Study Mode</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>You don't have any interesting words yet.</p>
          <p>
            Go to the "Interesting Words" section to add some words, then come
            back here to study with AI-generated phrases!
          </p>
        </mat-card-content>
        <mat-card-actions>
          <button
            mat-raised-button
            color="primary"
            routerLink="/interesting-words"
          >
            Go to Interesting Words
          </button>
        </mat-card-actions>
      </mat-card>
      }

      <!-- Loading state -->
      @if (loading) {
      <mat-card>
        <mat-card-content>
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>{{ loadingMessage }}</p>
          </div>
        </mat-card-content>
      </mat-card>
      }

      <!-- Study mode with flash card -->
      @if (hasInterestingWords && currentCard && !loading) {
      <div class="study-info">
        <h3>Studying with {{ interestingWordsCount }} interesting words</h3>
        <p>Generated phrase using interesting words from your collection</p>
      </div>

      <app-flash-card
        [card]="currentCard"
        [showAnswer]="showAnswer"
        [showEnglish]="showAnswer"
        [isInterestingWordsMode]="true"
        [isLoading]="generating"
        (showAnswerChange)="showAnswer = $event"
        (markCorrect)="nextCard()"
        (markIncorrect)="nextCard()"
      ></app-flash-card>
      }

      <!-- Error state -->
      @if (error) {
      <mat-card>
        <mat-card-content>
          <div class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ error }}</p>
            <button mat-raised-button color="primary" (click)="retry()">
              Try Again
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .study-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 20px;
      }

      .study-info {
        text-align: center;
        margin-bottom: 20px;
      }

      .study-info h3 {
        color: #1976d2;
        margin-bottom: 8px;
      }

      .study-info p {
        color: #666;
        margin: 0;
      }

      .words-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .word-tag {
        background: #e3f2fd;
        color: #1565c0;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.9rem;
        border: 1px solid #90caf9;
      }

      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 20px;
        text-align: center;
      }

      .error-container mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      @media (max-width: 600px) {
        .study-container {
          padding: 10px;
        }

        .study-controls {
          flex-direction: column;
          align-items: center;
        }

        .study-controls button {
          width: 100%;
          max-width: 300px;
        }
      }
    `,
  ],
})
export class InterestingWordsStudyModeComponent implements OnInit {
  loading = true;
  loadingMessage = 'Loading interesting words...';
  generating = false;
  error: string | null = null;

  interestingWords: InterestingWord[] = [];
  hasInterestingWords = false;
  interestingWordsCount = 0;

  currentCard: FlashCard | null = null;
  showAnswer = false;

  generatedPhrases: RollPhrase[] = [];

  constructor(
    private interestingWordsService: InterestingWordsService,
    private openaiService: OpenaiService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    console.log('InterestingWordsStudyModeComponent: Initializing...');
    await this.loadInterestingWords();
  }

  async loadInterestingWords() {
    this.loading = true;
    this.loadingMessage = 'Loading interesting words...';
    this.error = null;

    try {
      this.interestingWords =
        await this.interestingWordsService.getAllInterestingWords();
      this.interestingWordsCount = this.interestingWords.length;
      this.hasInterestingWords = this.interestingWordsCount > 0;

      if (this.hasInterestingWords) {
        await this.generateInitialPhrase();
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to load interesting words.';
    } finally {
      this.loading = false;
    }
  }

  async generateInitialPhrase() {
    if (!this.hasInterestingWords) return;

    this.loading = true;
    this.loadingMessage = 'Generating your first phrase...';

    try {
      await this.generateNewPhraseInternal();
    } catch (err: any) {
      this.error = err.message || 'Failed to generate phrase.';
    } finally {
      this.loading = false;
    }
  }

  async generateNewPhrase() {
    // Reset roll attempts for each new phrase generation

    this.generating = true;
    this.error = null;

    try {
      await this.generateNewPhraseInternal();
    } catch (err: any) {
      this.error = err.message || 'Failed to generate new phrase.';
    } finally {
      this.generating = false;
    }
  }

  private async generateNewPhraseInternal() {
    const interestingWordsList = this.interestingWords.map((w) => w.word);
    const maxRetries = 2; // Try up to 2 times to get a good phrase

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const newPhrase = await this.openaiService.generateInterestingWordsPhrase(
        interestingWordsList
      );

      // Validate the generated phrase
      const isValid = await this.openaiService.validatePhraseQuality(newPhrase);

      if (isValid) {
        console.log(`✅ Phrase accepted on attempt ${attempt + 1}`);
        // Add to history
        this.generatedPhrases.push(newPhrase);

        // Convert RollPhrase to FlashCard format
        this.currentCard = {
          id: `generated-${Date.now()}`,
          english: newPhrase.russian,
          portuguese: newPhrase.portuguese,
          verbs: newPhrase.verbs,
          explanation: `Tense: ${newPhrase.tense}`,
          categoryId: 'interesting-words',
          examples: [],
        };

        this.showAnswer = false;
        return; // Success, exit the retry loop
      } else {
        console.log(
          `❌ Phrase rejected on attempt ${attempt + 1}, retrying...`
        );
        if (attempt === maxRetries - 1) {
          // Last attempt failed, use the phrase anyway
          console.log(
            '⚠️ All validation attempts failed, using the generated phrase'
          );
          this.generatedPhrases.push(newPhrase);

          this.currentCard = {
            id: `generated-${Date.now()}`,
            english: newPhrase.russian,
            portuguese: newPhrase.portuguese,
            verbs: newPhrase.verbs,
            explanation: `Tense: ${newPhrase.tense}`,
            categoryId: 'interesting-words',
            examples: [],
          };

          this.showAnswer = false;
        }
      }
    }
  }

  toggleAnswer() {
    this.showAnswer = !this.showAnswer;
  }

  nextCard() {
    this.generateNewPhrase();
  }

  retry() {
    this.error = null;
    this.generatedPhrases = [];
    this.loadInterestingWords();
  }
}
