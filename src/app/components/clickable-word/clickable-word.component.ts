import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clickable-word',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="clickable-word"
      [class.interesting]="isInteresting"
      [class.read-only]="readOnly"
      (click)="onWordClick()"
      [title]="getTooltip()"
    >
      {{ word }}
    </span>
  `,
  styles: [
    `
      .clickable-word {
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        position: relative;

        &:hover {
          background-color: #f0f8ff;
          color: #1976d2;
          transform: translateY(-1px);
        }

        &.interesting {
          background-color: #e3f2fd;
          color: #1565c0;
          font-weight: 600;
          border: 1px solid #90caf9;

          &:hover {
            background-color: #bbdefb;
            border-color: #64b5f6;
          }

          &::after {
            content: '★';
            position: absolute;
            top: -8px;
            right: -8px;
            font-size: 12px;
            color: #ff9800;
            background: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }
        }

        &.read-only {
          cursor: default;

          &:hover {
            transform: none;
            background-color: transparent;
            color: inherit;
          }
        }
      }
    `,
  ],
})
export class ClickableWordComponent {
  @Input() word: string = '';
  @Input() isInteresting: boolean = false;
  @Input() readOnly: boolean = false;
  @Output() wordClick = new EventEmitter<string>();

  onWordClick() {
    if (!this.readOnly) {
      this.wordClick.emit(this.word);
    }
  }

  getTooltip(): string {
    if (this.readOnly) {
      return this.isInteresting ? 'Interesting word used in this phrase' : '';
    }
    return this.isInteresting
      ? 'Click to unmark as interesting'
      : 'Click to mark as interesting';
  }
}
