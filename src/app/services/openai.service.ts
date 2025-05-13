import { Injectable } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';
import { ApiKeyService } from './api-key.service';

@Injectable({
  providedIn: 'root',
})
export class OpenAIService {
  private openai: OpenAIApi | null = null;

  constructor(private apiKeyService: ApiKeyService) {}

  private async getClient(): Promise<OpenAIApi> {
    if (!this.openai) {
      const apiKey = await this.apiKeyService.getApiKey();
      this.openai = new OpenAIApi(new Configuration({ apiKey }));
    }
    return this.openai;
  }

  async generateFlashCard(english: string, spanish: string): Promise<string> {
    const client = await this.getClient();
    // Example: Use OpenAI to generate a hint or example sentence
    const response = await client.createCompletion({
      model: 'text-davinci-003',
      prompt: `Create a helpful hint for learning this English-Spanish pair: "${english}" - "${spanish}"`,
      max_tokens: 60,
    });
    return response.data.choices?.[0]?.text?.trim() || '';
  }
}
