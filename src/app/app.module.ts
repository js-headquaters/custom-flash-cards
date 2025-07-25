import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

import { AppComponent } from './app.component';
import { StudyModeComponent } from './components/study-mode/study-mode.component';
import { AddPhraseComponent } from './components/add-phrase/add-phrase.component';
import { UploadCsvComponent } from './components/upload-csv/upload-csv.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LibraryComponent } from './components/library/library.component';
import { InterestingWordsComponent } from './components/interesting-words.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    StudyModeComponent,
    AddPhraseComponent,
    UploadCsvComponent,
    SettingsComponent,
    LibraryComponent,
    InterestingWordsComponent,
    RouterModule.forRoot(routes),
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
