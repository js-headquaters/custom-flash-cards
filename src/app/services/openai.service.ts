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
    existingPhrases: RollPhrase[] = [],
    interestingWords: string[] = []
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

        // Create interesting words text with random chance
        let interestingWordsText = '';
        if (interestingWords.length > 0) {
          // 30% chance to use interesting words (between 20-40%)
          const shouldUseInterestingWords = Math.random() < 0.5;

          if (shouldUseInterestingWords) {
            interestingWordsText = `\n\nIMPORTANT: Try to use these interesting words in your generated phrase: ${interestingWords.join(
              ', '
            )}. If possible, incorporate one or more of these words naturally into the sentence.`;
          }
        }

        const messages = [
          {
            role: 'system',
            content:
              'You are a helpful assistant for language learners. Generate a modified meaningful common conversational version of the given Portuguese phrase by changing one or a few word, and provide its Russian translation. The modification should be natural and grammatically correct. IMPORTANT: Do not repeat any phrases that have already been generated. Also provide the verbs used in the phrase and the grammatical tense.',
          },
          {
            role: 'user',
            content: `Original Portuguese: "${originalPortuguese}"

Generate a modified conversational common meaningful version by changing one or a few meaningful words (maybe with prepositions, like change "Eu" to "A gente" or vice versa or the main noun (like change "eu" to "segurança") and changing according verb) or change the tense from present to past or conversational future (ir + infinitive) or use antonyms (avoid using synonyms, avoid using "NO/NAO") in the Portuguese phrase and provide its Russian translation. Ensure that the modified phrase is not the same as the original phrase. Also identify the verbs used and the grammatical tense. Use the verb in the correct form for the tense with the correct conjugation.${existingPhrasesText}${interestingWordsText}`,
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

  async generateInterestingWordsPhrase(
    interestingWords: string[] = []
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
            name: 'generate_interesting_words_phrase',
            description:
              'Generate a Portuguese phrase using interesting words for language learning.',
            parameters: {
              type: 'object',
              properties: {
                portuguese: {
                  type: 'string',
                  description: 'The Portuguese phrase using interesting words.',
                },
                russian: {
                  type: 'string',
                  description:
                    'The Russian translation of the Portuguese phrase.',
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

        // Create interesting words text
        let interestingWordsText = '';
        if (interestingWords.length > 0) {
          // Randomly select 1-2 words from the list to ensure variety
          const shuffledWords = [...interestingWords].sort(
            () => Math.random() - 0.5
          );
          const numWordsToUse = Math.random() < 0.5 ? 1 : 2; // 50% chance for 1 or 2 words
          const selectedWords = shuffledWords.slice(
            0,
            Math.min(numWordsToUse, shuffledWords.length)
          );

          // Add random context and situation to force variety
          const situations = [
            'shopping at a market',
            'at a restaurant or cafe',
            'at the doctor or in the pharmacy',
            'at the bank',
            'at the cinema',
            'at the park',
            'at bureaucratic procedures/at government services/at document processing',
            'at home',
            'at work',
            'at the post office',
          ];
          const randomSituation =
            situations[Math.floor(Math.random() * situations.length)];

          console.log(
            `🎲 Selected ${selectedWords.length} random words for generation:`,
            selectedWords
          );
          console.log(`🎯 Random situation: ${randomSituation}`);

          interestingWordsText = `\n\nUse 1-2 of these words: ${selectedWords.join(
            ', '
          )}. Use both only if they work well together naturally. Context: ${randomSituation}.`;
        }

        const messages = [
          {
            role: 'system',
            content:
              'Generate natural, practical Portuguese phrases that people actually use in real life. Use "voce" (not "tu") and "a genti" (not "nos"). Focus on everyday situations: shopping, cafe, doctor, bank, etc. Create variety in sentence structures and contexts. When using interesting words, use them in any conjugation/form with any subject that makes sense. Use 1-2 words based on what works naturally - quality over quantity. NEVER create nonsensical combinations like "checking cafe near window" or "choosing movie near entrance".',
          },
          {
            role: 'user',
            content: `Generate a conversational Portuguese phrase.${interestingWordsText}

Create a natural phrase about everyday situations. Use "voce" and "a genti". Provide Russian translation, verbs used, and tense.

Good examples:
- "A gente vai ao mercado comprar frutas" (We're going to the market to buy fruits)
- "Voce pode me ajudar com isso?" (Can you help me with this?)
- "A gente vai ao medico amanha" (We're going to the doctor tomorrow)
- "Voce quer um cafe?" (Do you want coffee?)

Bad examples to avoid:
- "Ты можешь выбрать фильм рядом с входом?" (choosing movie near entrance - nonsensical)
- "Проверить, открыто ли кафе рядом с окном" (checking cafe near window - illogical)
- "Мы подпишем контракт у окна" (signing contracts by window - impossible)

Focus on simple, direct actions that people actually do.`,
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
              function_call: { name: 'generate_interesting_words_phrase' },
              temperature: 0.3 + Math.random() * 0.4, // Random temperature between 0.3 and 0.7 for variety
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
          } catch (parseError) {
            console.error('Error parsing function call arguments:', parseError);
            attempt++;
            if (attempt < maxRetries) {
              continue;
            }
            throw new Error('Failed to parse AI response.');
          }
        }

        attempt++;
      } catch (error) {
        console.error('Error generating interesting words phrase:', error);
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate phrase after multiple attempts.');
  }

  async validatePhraseQuality(phrase: RollPhrase): Promise<boolean> {
    const apiKey = localStorage.getItem('openaiKey');
    if (!apiKey) {
      return true; // If no API key, assume phrase is valid
    }

    try {
      const functions = [
        {
          name: 'validate_phrase_quality',
          description:
            'Validate if a Portuguese phrase is natural and meaningful.',
          parameters: {
            type: 'object',
            properties: {
              isNatural: {
                type: 'boolean',
                description:
                  'Whether the phrase sounds natural and conversational.',
              },
              isMeaningful: {
                type: 'boolean',
                description:
                  'Whether the phrase has real meaning and makes sense.',
              },
              isLogical: {
                type: 'boolean',
                description:
                  "Whether the phrase has logical coherence and doesn't combine unrelated concepts.",
              },
              isRussianTranslationNatural: {
                type: 'boolean',
                description:
                  'Whether the Russian translation sounds natural to native Russian speakers (not literal word-by-word translation).',
              },
              reason: {
                type: 'string',
                description: 'Brief reason for the validation result.',
              },
            },
            required: [
              'isNatural',
              'isMeaningful',
              'isLogical',
              'isRussianTranslationNatural',
              'reason',
            ],
          },
        },
      ];

      const messages = [
        {
          role: 'system',
          content:
            'You are a language validation expert. You MUST be EXTREMELY strict and reject ANY phrase that sounds unnatural, illogical, or nonsensical. Your job is to ensure only REAL, PRACTICAL phrases that people actually use in everyday life pass validation. Reject anything that sounds like machine translation, forced combinations, or illogical situations.',
        },
        {
          role: 'user',
          content: `CRITICAL VALIDATION: Check this Portuguese phrase and Russian translation: "${phrase.portuguese}"
Russian translation: "${phrase.russian}"

You MUST reject this phrase if ANY of these are true:

1. isNatural: FALSE if the Portuguese phrase doesn't sound like something people actually say in real life
2. isMeaningful: FALSE if the phrase has no real meaning or purpose
3. isLogical: FALSE if the phrase combines unrelated concepts or creates illogical situations
4. isRussianTranslationNatural: FALSE if the Russian translation sounds unnatural or like machine translation

IMMEDIATELY REJECT phrases like:
- "Мы подпишем контракт у окна" (signing contracts by window - nonsensical)
- "Мы будем проверять варианты кофе рядом с окном" (checking coffee options near window - illogical)
- "Проверить, открыто ли кафе рядом с окном" (checking if cafe is open near window - nonsensical)
- "Мы собираемся проверить варианты десертов рядом с окном" (checking dessert options near window - illogical)
- "Ты можешь выбрать фильм рядом с входом?" (choosing movie near entrance - nonsensical)
- "Выбрать что-то рядом с чем-то" (choosing something near something - illogical)
- "Проверить что-то рядом с чем-то" (checking something near something - illogical)
- Any phrase that combines unrelated concepts
- Any phrase that sounds like it was translated word-by-word
- Any phrase that describes impossible or illogical actions
- Any phrase that no real person would ever say
- Any phrase that uses "рядом с" in nonsensical contexts
- Any phrase that describes choosing/checking things near other things when it doesn't make sense

Examples of phrases to REJECT:
- "подписать контракт у окна" (nonsensical location)
- "проверять варианты у окна" (illogical action)
- "рядом с окном" when it doesn't make sense in context
- "ресторан рядом отсюда" (literal translation)

ONLY ACCEPT phrases that:
- Describe real, practical actions people actually do
- Use natural, everyday language
- Have logical, coherent meaning
- Sound natural in both Portuguese and Russian

Be EXTREMELY strict. When in doubt, REJECT the phrase.`,
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
            function_call: { name: 'validate_phrase_quality' },
            temperature: 0.4, // Low temperature for consistent validation
          }),
        }
      );

      const data = await response.json();
      const functionCall = data.choices?.[0]?.message?.function_call;

      if (functionCall && functionCall.arguments) {
        const args = JSON.parse(functionCall.arguments);
        const isValid =
          args.isNatural &&
          args.isMeaningful &&
          args.isLogical &&
          args.isRussianTranslationNatural;

        // Log the full validation response for debugging
        console.log('=== PHRASE VALIDATION LOG ===');
        console.log('Portuguese phrase:', phrase.portuguese);
        console.log('Russian translation:', phrase.russian);
        console.log('Validation result:', {
          isNatural: args.isNatural,
          isMeaningful: args.isMeaningful,
          isLogical: args.isLogical,
          isRussianTranslationNatural: args.isRussianTranslationNatural,
          reason: args.reason,
          overallValid: isValid,
        });
        console.log('=== END VALIDATION LOG ===');

        if (!isValid) {
          console.log(`Phrase validation failed: ${args.reason}`);
        }

        return isValid;
      }

      return true; // If validation fails, assume phrase is valid
    } catch (error) {
      console.error('Error validating phrase quality:', error);
      return true; // If validation fails, assume phrase is valid
    }
  }

  private decodeUnicode(str: string): string {
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (m, g1) =>
      String.fromCharCode(parseInt(g1, 16))
    );
  }
}
