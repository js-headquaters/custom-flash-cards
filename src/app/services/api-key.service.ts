import { Injectable } from '@angular/core';

const API_KEY_STORAGE = 'openai_api_key';

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  setApiKey(key: string) {
    localStorage.setItem(API_KEY_STORAGE, key);
  }

  getApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE);
  }

  clearApiKey() {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}
