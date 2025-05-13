import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Custom Flash Cards</h1>
      <nav class="nav-bar">
        <a routerLink="/study" routerLinkActive="active">Study</a>
        <a routerLink="/add" routerLinkActive="active">Add Phrase</a>
        <a routerLink="/upload" routerLinkActive="active">Upload CSV</a>
        <a routerLink="/library" routerLinkActive="active">Library</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
      }
      .nav-bar {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 2rem;
      }
      .nav-bar a {
        text-decoration: none;
        color: #333;
        font-weight: 500;
        font-size: 1.1rem;
        padding-bottom: 2px;
        border-bottom: 2px solid transparent;
        transition: border-color 0.2s;
      }
      .nav-bar a.active {
        border-bottom: 2px solid #1976d2;
        color: #1976d2;
      }
    `,
  ],
})
export class AppComponent {
  title = 'custom-flash-cards';
}
