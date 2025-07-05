import { Component, OnInit } from '@angular/core';
import { FlashCardService } from '../../services/flash-card.service';
import { FlashCard } from '../../models/flash-card.interface';

@Component({
  selector: 'app-library',
  standalone: true,
  template: `
    <div class="library-container">
      <h2>Library</h2>
      @if (loading) {
      <div>Loading...</div>
      } @if (!loading) {
      <div class="actions">
        @if (cards.length > 0) {
        <button class="delete-all" (click)="deleteAllCards()">
          Delete All Cards
        </button>
        }
      </div>
      <div class="cards-container">
        @for (card of cards; track card.id) {
        <div class="card">
          <span><strong>ES:</strong> {{ card.portuguese }}</span>
          <span style="margin-left: 1em;"
            ><strong>EN:</strong> {{ card.english }}</span
          >
          <span>глаголы: {{ card.verbs }}</span>
          <span>отметки: {{ card.explanation }}</span>
          <button (click)="deleteCard(card.id)">Delete</button>
        </div>
        }
      </div>
      @if (cards.length === 0) {
      <div>No cards in your library.</div>
      } }
    </div>
  `,
  styles: [
    `
      .library-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
      }
      h2 {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
      }
      button {
        background: #d32f2f;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.3rem 1rem;
        cursor: pointer;
        font-weight: 500;
        margin-left: 1em;
      }
      button:hover {
        background: #b71c1c;
      }
    `,
  ],
})
export class LibraryComponent implements OnInit {
  cards: FlashCard[] = [];
  loading = false;

  constructor(private flashCardService: FlashCardService) {}

  async ngOnInit() {
    await this.loadCards();
  }

  async loadCards() {
    this.loading = true;
    this.cards = await this.flashCardService.getAllFlashCards();
    this.loading = false;
  }

  async deleteCard(id: string) {
    await this.flashCardService.deleteFlashCard(id);
    await this.loadCards();
  }

  async deleteAllCards() {
    if (
      confirm(
        'Are you sure you want to delete all cards? This action cannot be undone.'
      )
    ) {
      this.loading = true;
      try {
        await this.flashCardService.clearAll();
        await this.loadCards();
      } catch (error) {
        console.error('Error deleting all cards:', error);
        // You might want to show a user-friendly error message here
      } finally {
        this.loading = false;
      }
    }
  }
}
