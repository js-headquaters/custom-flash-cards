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
      <div
        class="mobile-overlay"
        *ngIf="isMobileMenuOpen"
        (click)="closeMenu()"
      ></div>
      <nav class="nav-bar" [class.hide-mobile]="isMobileMenuOpen">
        <div
          class="dropdown"
          (mouseenter)="openDropdown()"
          (mouseleave)="closeDropdown()"
        >
          <a
            class="dropdown-toggle"
            (click)="toggleDropdown()"
            [class.active]="isDropdownOpen || isStudyActive()"
            >Study <span class="arrow">▼</span></a
          >
          <div class="dropdown-menu" *ngIf="isDropdownOpen">
            <a
              routerLink="/study"
              routerLinkActive="active"
              (click)="closeDropdown()"
              >Library</a
            >
            <a
              routerLink="/study/interesting-words"
              routerLinkActive="active"
              (click)="closeDropdown()"
              >Interesting Words</a
            >
          </div>
        </div>
        <a routerLink="/add" routerLinkActive="active">Add Phrase</a>
        <a routerLink="/upload" routerLinkActive="active">Upload CSV</a>
        <a routerLink="/library" routerLinkActive="active">Library</a>
        <a routerLink="/interesting-words" routerLinkActive="active"
          >Interesting Words</a
        >
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>
      <div class="mobile-menu" *ngIf="isMobileMenuOpen">
        <div class="dropdown-mobile">
          <a
            (click)="toggleMobileDropdown()"
            [class.active]="isMobileDropdownOpen || isStudyActive()"
            >Study <span class="arrow">▼</span></a
          >
          <div class="dropdown-menu-mobile" *ngIf="isMobileDropdownOpen">
            <a
              routerLink="/study"
              routerLinkActive="active"
              (click)="closeMenu()"
              >Library</a
            >
            <a
              routerLink="/study/interesting-words"
              routerLinkActive="active"
              (click)="closeMenu()"
              >Interesting Words</a
            >
          </div>
        </div>
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
          routerLink="/interesting-words"
          routerLinkActive="active"
          (click)="closeMenu()"
          >Interesting Words</a
        >
        <a
          routerLink="/settings"
          routerLinkActive="active"
          (click)="closeMenu()"
          >Settings</a
        >
      </div>
      <router-outlet></router-outlet>
      <div class="page-content" [class.hide-content]="isMobileMenuOpen">
        <!-- Контент страницы будет здесь, если потребуется -->
      </div>
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
      .mobile-overlay {
        display: none;
      }
      .dropdown {
        position: relative;
        display: inline-block;
      }
      .dropdown-toggle {
        cursor: pointer;
        user-select: none;
        display: inline-flex;
        align-items: center;
      }
      .dropdown-toggle .arrow {
        margin-left: 0.3em;
        font-size: 0.65em;
        line-height: 1;
      }
      .dropdown-menu {
        display: block;
        position: absolute;
        top: 100%;
        left: 0;
        background: #fff;
        min-width: 160px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        z-index: 1002;
        padding: 0.5em 0;
      }
      .dropdown-menu a {
        display: block;
        padding: 0.7em 1.2em;
        color: #333;
        text-decoration: none;
        white-space: nowrap;
        font-size: 1rem;
        border-bottom: 1px solid #eee;
      }
      .dropdown-menu a:last-child {
        border-bottom: none;
      }
      .dropdown-menu a.active {
        color: #1976d2;
        font-weight: 600;
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
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow-y: auto;
        }
        .mobile-overlay {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.25);
          z-index: 999;
        }
        .page-content.hide-content {
          display: none !important;
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
        .dropdown,
        .dropdown-toggle,
        .dropdown-menu {
          all: unset;
        }
        .dropdown-mobile {
          display: flex;
          flex-direction: column;
        }
        .dropdown-mobile > a {
          cursor: pointer;
          padding: 0.7rem 1rem;
          font-size: 1.1rem;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #eee;
          display: inline-flex;
          align-items: center;
        }
        .dropdown-mobile > a .arrow {
          font-size: 0.65em;
          margin-left: 0.3em;
        }
        .dropdown-menu-mobile {
          display: flex;
          flex-direction: column;
          background: #f9f9f9;
          border-radius: 8px;
          margin-left: 1rem;
        }
        .dropdown-menu-mobile a {
          padding: 0.7rem 1.5rem;
          font-size: 1.05rem;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #eee;
        }
        .dropdown-menu-mobile a:last-child {
          border-bottom: none;
        }
        .dropdown-menu-mobile a.active {
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
  isDropdownOpen = false;
  isMobileDropdownOpen = false;

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
    this.isMobileDropdownOpen = false;
  }
  // Dropdown logic for desktop
  openDropdown() {
    this.isDropdownOpen = true;
  }
  closeDropdown() {
    this.isDropdownOpen = false;
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  // Dropdown logic for mobile
  toggleMobileDropdown() {
    this.isMobileDropdownOpen = !this.isMobileDropdownOpen;
  }
  // Helper to highlight Study as active if on /study or /interesting-words
  isStudyActive(): boolean {
    return (
      location.hash.startsWith('#/study') ||
      location.hash.startsWith('#/study/interesting-words')
    );
  }
}
