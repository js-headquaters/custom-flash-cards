import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <h2>Settings</h2>
      <form [formGroup]="form" (ngSubmit)="saveKey()">
        <label for="openaiKey">OpenAI API Key</label>
        <input
          id="openaiKey"
          type="password"
          formControlName="openaiKey"
          placeholder="Enter your OpenAI API key"
        />
        <div class="actions">
          <button type="submit" [disabled]="form.invalid">Save Key</button>
          <button type="button" (click)="resetKey()" *ngIf="hasKey">
            Reset Key
          </button>
        </div>
      </form>
      <div *ngIf="hasKey" class="info">
        <p><strong>Key is set.</strong></p>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        max-width: 400px;
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
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      input {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      .actions {
        display: flex;
        gap: 1rem;
      }
      button {
        padding: 0.5rem 1.2rem;
        border: none;
        border-radius: 4px;
        background: #1976d2;
        color: #fff;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      button[disabled] {
        background: #ccc;
        cursor: not-allowed;
      }
      .info {
        margin-top: 1rem;
        color: #388e3c;
        text-align: center;
      }
    `,
  ],
})
export class SettingsComponent {
  form: FormGroup;
  hasKey = false;

  constructor(private fb: FormBuilder) {
    const existingKey = localStorage.getItem('openaiKey') || '';
    this.form = this.fb.group({
      openaiKey: [existingKey],
    });
    this.hasKey = !!existingKey;
  }

  saveKey() {
    const key = this.form.value.openaiKey;
    if (key) {
      localStorage.setItem('openaiKey', key);
      this.hasKey = true;
    }
  }

  resetKey() {
    localStorage.removeItem('openaiKey');
    this.form.patchValue({ openaiKey: '' });
    this.hasKey = false;
  }
}
