import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { FlashCard } from '../../models/flash-card.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { OpenaiService, RollPhrase } from '../../services/openai.service';
import { InterestingWordsService } from '../../services/interesting-words.service';
import { RollPopupComponent } from '../roll-popup/roll-popup.component';
import { ClickableWordComponent } from '../clickable-word/clickable-word.component';
import {
  WordConfirmationDialogComponent,
  WordConfirmationDialogData,
} from '../word-confirmation-dialog/word-confirmation-dialog.component';

function decodeUnicode(str: string): string {
  // Decodes unicode escape sequences like \u00ed
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (m, g1) =>
    String.fromCharCode(parseInt(g1, 16))
  );
}

@Component({
  selector: 'app-flash-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    DecimalPipe,
    RollPopupComponent,
    ClickableWordComponent,
    WordConfirmationDialogComponent,
  ],
  templateUrl: './flash-card.component.html',
  styleUrl: './flash-card.component.scss',
})
export class FlashCardComponent implements OnChanges, OnInit {
  @Input() card!: FlashCard;
  @Input() showAnswer = false;
  @Input() showEnglish = false;
  @Output() showAnswerChange = new EventEmitter<boolean>();
  @Output() markCorrect = new EventEmitter<void>();
  @Output() markIncorrect = new EventEmitter<void>();

  loading = false;
  error: string | null = null;
  showRollPopup = false;
  currentRollPhrase: RollPhrase | null = null;
  rollLoading = false;
  generatedPhrases: RollPhrase[] = [];
  rollAttempts = 0;
  maxRollAttempts = 3;
  showDetailedInfo = false;

  // New properties for interesting words
  interestingWords: Set<string> = new Set();
  portugueseWords: string[] = [];

  constructor(
    private openaiService: OpenaiService,
    private interestingWordsService: InterestingWordsService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadInterestingWords();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['card'] && this.card && !this.card.examples) {
      this.generateExamples();
    }
    if (changes['card'] && this.card) {
      this.parseWords();
    }
  }

  private parseWords() {
    if (this.card.portuguese) {
      this.portugueseWords = this.card.portuguese
        .split(/\s+/)
        .filter((word) => word.trim().length > 0);
    }
  }

  private async loadInterestingWords() {
    try {
      const portugueseWords =
        await this.interestingWordsService.getInterestingWordsList();
      this.interestingWords = new Set(portugueseWords);
    } catch (error) {
      console.error('Error loading interesting words:', error);
    }
  }

  onWordClick(word: string) {
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

  async generateExamples() {
    return;

    this.loading = true;
    this.error = null;
    const apiKey = localStorage.getItem('openaiKey');
    if (!apiKey) {
      this.error = 'No OpenAI API key set. Please set it in Settings.';
      this.loading = false;
      return;
    }
    try {
      // Define the function for OpenAI function calling
      const functions = [
        {
          name: 'generate_portuguese_brazil_example',
          description:
            'Generate a Portuguese (Brazil) example sentence using the given phrase and provide its English translation.',
          parameters: {
            type: 'object',
            properties: {
              portuguese: {
                type: 'string',
                description: 'The example sentence in Portuguese(brazil).',
              },
              english: {
                type: 'string',
                description: 'The English translation of the example sentence.',
              },
              verbs: {
                type: 'string',
                description:
                  'The verbs in the example sentence, все глаголы через запятую. Пример: [ir assistir].',
              },
              tense: {
                type: 'string',
                description:
                  'The tense of the example sentence in russian like будущее время, прошлое, настоящее.',
              },
            },
            required: ['portuguese', 'english', 'verbs', 'tense'],
          },
        },
      ];
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant for language learners.',
        },
        {
          role: 'user',
          content: `Generate a Portuguese (Brazil) example sentence using the phrase: "${this.card.portuguese}" and provide its English translation.`,
        },
      ];
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo-1106',
            messages,
            functions,
            function_call: { name: 'generate_portuguese_brazil_example' },
            temperature: 0.7,
          }),
        }
      );
      const data = await response.json();
      const functionCall = data.choices?.[0]?.message?.function_call;
      let examples: { english: string; portuguese: string }[] = [];
      if (functionCall && functionCall.arguments) {
        try {
          const args = JSON.parse(functionCall.arguments);
          examples = [
            {
              english: decodeUnicode(args.english),
              portuguese: decodeUnicode(args.portuguese),
            },
          ];
        } catch {
          throw new Error(
            'Could not parse function call arguments from OpenAI response.'
          );
        }
      } else {
        throw new Error('No function call result from OpenAI.');
      }
      this.card.examples = examples;
    } catch (err: any) {
      this.error = err.message || 'Failed to generate examples.';
    } finally {
      this.loading = false;
    }
  }

  revealEnglish() {
    this.showAnswerChange.emit(true);
  }

  onMarkCorrect() {
    this.showRollPopup = false;
    this.currentRollPhrase = null;
    this.generatedPhrases = []; // Clear history for next card
    this.rollAttempts = 0; // Reset roll attempts
    this.showDetailedInfo = false; // Reset detailed info
    this.markCorrect.emit();
  }

  onMarkIncorrect() {
    this.showRollPopup = false;
    this.currentRollPhrase = null;
    this.generatedPhrases = []; // Clear history for next card
    this.rollAttempts = 0; // Reset roll attempts
    this.showDetailedInfo = false; // Reset detailed info
    this.markIncorrect.emit();
  }

  async onRoll() {
    if (!this.card || this.rollAttempts >= this.maxRollAttempts) return;

    this.rollLoading = true;
    try {
      // Get interesting words for the prompt
      const interestingWords =
        await this.interestingWordsService.getInterestingWordsList();

      const newPhrase = await this.openaiService.generateRollPhrase(
        this.card.portuguese,
        this.card.english,
        this.generatedPhrases,
        interestingWords
      );

      // Add the new phrase to history
      this.generatedPhrases.push(newPhrase);
      this.currentRollPhrase = newPhrase;
      this.showRollPopup = true;
      this.rollAttempts++;
    } catch (err: any) {
      this.error = err.message || 'Failed to generate modified phrase.';
    } finally {
      this.rollLoading = false;
    }
  }

  onRollPopupClose() {
    this.showRollPopup = false;
    this.currentRollPhrase = null;
    this.generatedPhrases = []; // Clear history when closing popup
    this.rollAttempts = 0; // Reset roll attempts
  }

  onContinue() {
    this.showRollPopup = false;
    this.currentRollPhrase = null;
    this.generatedPhrases = []; // Clear history for next card
    this.rollAttempts = 0; // Reset roll attempts
    this.markCorrect.emit();
  }

  onCardDoubleTap() {
    this.showDetailedInfo = !this.showDetailedInfo;
  }
}
