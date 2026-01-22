import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/components/app.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { VerseService } from './app/services/verse.service';
import { TestamentService } from './app/services/testament.service';
import { SearchService } from './app/services/search.service';
import { BookService } from './app/services/book.service';
import { BibleService } from './app/services/bible.service';
import { BiblerService } from './app/services/bibler.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule),
        BiblerService,
        BibleService,
        BookService,
        SearchService,
        TestamentService,
        VerseService,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
