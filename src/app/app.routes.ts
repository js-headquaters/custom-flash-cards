import { Routes } from '@angular/router';
import { StudyModeComponent } from './components/study-mode/study-mode.component';
import { AddPhraseComponent } from './components/add-phrase/add-phrase.component';
import { UploadCsvComponent } from './components/upload-csv/upload-csv.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LibraryComponent } from './components/library/library.component';
import { InterestingWordsComponent } from './components/interesting-words.component';

export const routes: Routes = [
  { path: '', redirectTo: 'study', pathMatch: 'full' },
  { path: 'study', component: StudyModeComponent },
  { path: 'add', component: AddPhraseComponent },
  { path: 'upload', component: UploadCsvComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'interesting-words', component: InterestingWordsComponent },
];
