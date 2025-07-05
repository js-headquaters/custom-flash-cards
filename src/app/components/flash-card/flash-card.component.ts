import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FlashCard } from '../../models/flash-card.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

function decodeUnicode(str: string): string {
  // Decodes unicode escape sequences like \u00ed
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (m, g1) =>
    String.fromCharCode(parseInt(g1, 16))
  );
}

@Component({
  selector: 'app-flash-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './flash-card.component.html',
  styleUrl: './flash-card.component.scss',
})
export class FlashCardComponent implements OnChanges {
  @Input() card!: FlashCard;
  @Input() showAnswer = false;
  @Input() showEnglish = false;
  @Output() showAnswerChange = new EventEmitter<boolean>();
  @Output() markCorrect = new EventEmitter<void>();
  @Output() markIncorrect = new EventEmitter<void>();

  loading = false;
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['card'] && this.card && !this.card.examples) {
      this.generateExamples();
    }
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
            },
            required: ['portuguese', 'english'],
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
    this.markCorrect.emit();
  }

  onMarkIncorrect() {
    this.markIncorrect.emit();
  }
}
