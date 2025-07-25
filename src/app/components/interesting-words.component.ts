import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InterestingWordsService } from '../services/interesting-words.service';
import { InterestingWord } from '../models/interesting-word.interface';

@Component({
  selector: 'app-interesting-words',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './interesting-words.component.html',
  styleUrl: './interesting-words.component.scss',
})
export class InterestingWordsComponent implements OnInit {
  interestingWords: InterestingWord[] = [];
  newWord: string = '';
  loading = false;
  error: string | null = null;

  constructor(private interestingWordsService: InterestingWordsService) {}

  async ngOnInit() {
    await this.loadInterestingWords();
  }

  async loadInterestingWords() {
    this.loading = true;
    try {
      this.interestingWords =
        await this.interestingWordsService.getAllInterestingWords();
    } catch (err: any) {
      this.error = err.message || 'Failed to load interesting words.';
    } finally {
      this.loading = false;
    }
  }

  async addWord() {
    const word = this.newWord.trim();
    if (!word) return;
    this.loading = true;
    try {
      await this.interestingWordsService.addInterestingWord(word);
      this.newWord = '';
      await this.loadInterestingWords();
    } catch (err: any) {
      this.error = err.message || 'Failed to add word.';
    } finally {
      this.loading = false;
    }
  }

  async unmarkWord(word: string) {
    this.loading = true;
    try {
      await this.interestingWordsService.toggleInterestingWord(word);
      await this.loadInterestingWords();
    } catch (err: any) {
      this.error = err.message || 'Failed to unmark word.';
    } finally {
      this.loading = false;
    }
  }
}
