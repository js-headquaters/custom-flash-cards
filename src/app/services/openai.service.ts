import { Injectable } from '@angular/core';

export interface RollPhrase {
  portuguese: string;
  russian: string;
  verbs: string;
  tense: string;
}

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  constructor() {}

  async generateRollPhrase(
    originalPortuguese: string,
    originalRussian: string,
    existingPhrases: RollPhrase[] = []
  ): Promise<RollPhrase> {
    const apiKey = localStorage.getItem('openaiKey');
    if (!apiKey) {
      throw new Error('No OpenAI API key set. Please set it in Settings.');
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const functions = [
          {
            name: 'generate_modified_phrase',
            description:
              'Generate a modified version of the given Portuguese phrase and its Russian translation with one or a few word changed.',
            parameters: {
              type: 'object',
              properties: {
                portuguese: {
                  type: 'string',
                  description:
                    'The modified Portuguese phrase with one word changed.',
                },
                russian: {
                  type: 'string',
                  description:
                    'The Russian translation of the modified Portuguese phrase.',
                },
                verbs: {
                  type: 'string',
                  description:
                    'The verbs in the example sentence, все глаголы через запятую. Пример: [ir assistir].',
                },
                tense: {
                  type: 'string',
                  description:
                    'The tense of the example sentence in russian like будущее время, прошлое, настоящее. Detect the tense of the used form of the verb.',
                },
              },
              required: ['portuguese', 'russian', 'verbs', 'tense'],
            },
          },
        ];

        // Create a list of existing phrases to avoid repetition
        const existingPhrasesText =
          existingPhrases.length > 0
            ? `\n\nAlready generated phrases (avoid these):\n${existingPhrases
                .map(
                  (p, i) =>
                    `${i + 1}. Portuguese: "${p.portuguese}" | Russian: "${
                      p.russian
                    }"`
                )
                .join('\n')}`
            : '';

        const messages = [
          {
            role: 'system',
            content:
              'You are a helpful assistant for language learners. Generate a modified meaningful common conversational version of the given Portuguese phrase by changing one or a few word, and provide its Russian translation. The modification should be natural and grammatically correct. IMPORTANT: Do not repeat any phrases that have already been generated. Also provide the verbs used in the phrase and the grammatical tense.',
          },
          {
            role: 'user',
            content: `Original Portuguese: "${originalPortuguese}"

Generate a modified conversational common meaningful version by changing one or a few meaningful words (maybe with prepositions, like change "Eu" to "A gente" or vice versa or the main noun (like change "eu" to "segurança") and changing according verb) or change the tense from present to past or conversational future (ir + infinitive) or use antonyms (avoid using synonyms, avoid using "NO/NAO") in the Portuguese phrase and provide its Russian translation. Ensure that the modified phrase is not the same as the original phrase. Also identify the verbs used and the grammatical tense. Use the verb in the correct form for the tense with the correct conjugation.${existingPhrasesText}`,
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
              model: 'gpt-4o-mini',
              messages,
              functions,
              function_call: { name: 'generate_modified_phrase' },
              temperature: 1.0,
            }),
          }
        );

        const data = await response.json();
        const choice = data.choices?.[0];
        const functionCall = choice?.message?.function_call;
        const finishReason = choice?.finish_reason;

        // Check if we need to retry based on finish_reason
        if (
          finishReason === 'length' ||
          finishReason === 'content_filter' ||
          finishReason === 'null'
        ) {
          attempt++;
          if (attempt < maxRetries) {
            console.log(
              `Retrying due to finish_reason: ${finishReason}, attempt ${
                attempt + 1
              }/${maxRetries}`
            );
            continue;
          }
        }

        // If finish_reason is 'stop' but no function call, retry
        if (finishReason === 'stop' && !functionCall) {
          attempt++;
          if (attempt < maxRetries) {
            console.log(
              `Retrying due to missing function call with finish_reason: ${finishReason}, attempt ${
                attempt + 1
              }/${maxRetries}`
            );
            continue;
          }
        }

        if (functionCall && functionCall.arguments) {
          try {
            const args = JSON.parse(functionCall.arguments);
            return {
              portuguese: this.decodeUnicode(args.portuguese),
              russian: this.decodeUnicode(args.russian),
              verbs: this.decodeUnicode(args.verbs),
              tense: this.decodeUnicode(args.tense),
            };
          } catch {
            throw new Error(
              'Could not parse function call arguments from OpenAI response.'
            );
          }
        } else {
          throw new Error('No function call result from OpenAI.');
        }
      } catch (err: any) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(
            err.message ||
              'Failed to generate modified phrase after multiple attempts.'
          );
        }
        console.log(`Error on attempt ${attempt}, retrying...`, err.message);
      }
    }

    throw new Error(
      'Failed to generate modified phrase after maximum retries.'
    );
  }

  private decodeUnicode(str: string): string {
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (m, g1) =>
      String.fromCharCode(parseInt(g1, 16))
    );
  }
}
