import { Component, OnInit } from '@angular/core';
import { MigrationService } from './services/migration.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Custom Flash Cards</h1>
      <button class="menu-toggle" (click)="toggleMenu()" aria-label="Open menu">
        <span class="material-icons">menu</span>
      </button>
      <nav class="nav-bar" [class.hide-mobile]="isMobileMenuOpen">
        <a routerLink="/study" routerLinkActive="active">Study</a>
        <a routerLink="/add" routerLinkActive="active">Add Phrase</a>
        <a routerLink="/upload" routerLinkActive="active">Upload CSV</a>
        <a routerLink="/library" routerLinkActive="active">Library</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>
      <div class="mobile-menu" *ngIf="isMobileMenuOpen">
        <a routerLink="/study" routerLinkActive="active" (click)="closeMenu()"
          >Study</a
        >
        <a routerLink="/add" routerLinkActive="active" (click)="closeMenu()"
          >Add Phrase</a
        >
        <a routerLink="/upload" routerLinkActive="active" (click)="closeMenu()"
          >Upload CSV</a
        >
        <a routerLink="/library" routerLinkActive="active" (click)="closeMenu()"
          >Library</a
        >
        <a
          routerLink="/settings"
          routerLinkActive="active"
          (click)="closeMenu()"
          >Settings</a
        >
      </div>
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
      .menu-toggle {
        display: none;
        background: none;
        border: none;
        position: absolute;
        top: 18px;
        right: 18px;
        z-index: 1001;
        cursor: pointer;
      }
      .menu-toggle .material-icons {
        font-size: 2rem;
        color: #333;
      }
      .nav-bar {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .nav-bar a {
        text-decoration: none;
        color: #333;
        font-weight: 500;
        font-size: 1rem;
        padding-bottom: 2px;
        border-bottom: 2px solid transparent;
        transition: border-color 0.2s;
        white-space: nowrap;
      }
      .nav-bar a.active {
        border-bottom: 2px solid #1976d2;
        color: #1976d2;
      }
      .mobile-menu {
        display: none;
      }
      @media (max-width: 600px) {
        .container {
          padding: 8px;
        }
        h1 {
          font-size: 1.4rem;
          margin-bottom: 18px;
        }
        .menu-toggle {
          display: block;
        }
        .nav-bar {
          display: none;
        }
        .mobile-menu {
          display: flex;
          flex-direction: column;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          margin: 0 0 1rem 0;
          padding: 1rem 0.5rem;
          z-index: 1000;
        }
        .mobile-menu a {
          padding: 0.7rem 1rem;
          font-size: 1.1rem;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #eee;
        }
        .mobile-menu a:last-child {
          border-bottom: none;
        }
        .mobile-menu a.active {
          color: #1976d2;
          font-weight: 600;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'custom-flash-cards';
  isMobileMenuOpen = false;

  constructor(private migrationService: MigrationService) {}

  async ngOnInit() {
    // Запускаем миграцию при инициализации приложения
    await this.migrationService.checkAndMigrate();
  }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  closeMenu() {
    this.isMobileMenuOpen = false;
  }
}
