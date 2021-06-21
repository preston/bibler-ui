import { ApiComponent } from './components/api.component';
import { AppComponent } from './components/app.component';
import { ComparatorComponent } from './components/comparator.component';
import { HomeComponent } from './components/home.component';
import { ReaderComponent } from './components/reader.component';
import { SearchComponent } from './components/search.component';
import { VerseComponent } from './components/verse.component';

import { BiblerService } from './services/bibler.service';
import { BibleService } from './services/bible.service';
import { BookService } from './services/book.service';
import { SearchService } from './services/search.service';
import { TestamentService } from './services/testament.service';
import { VerseService } from './services/verse.service';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';

@NgModule({
    declarations: [
        ApiComponent,
        AppComponent,
        HomeComponent,
        ComparatorComponent,
        ReaderComponent,
        SearchComponent,
        VerseComponent
    ],
    imports: [
        HttpClientModule,
        BrowserModule,
        AppRoutingModule,
        FormsModule,
    ],
    providers: [
        BiblerService,
        BibleService,
        BookService,
        SearchService,
        TestamentService,
        VerseService,
        HttpClient
    ],
    bootstrap: [AppComponent]     // root component
})
export class AppModule {
}
