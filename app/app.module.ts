import {ModuleWithProviders, enableProdMode} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ApiComponent} from './components/api.component';
import {AppComponent} from './components/app.component';
import {ComparatorComponent} from './components/comparator.component';
import {HomeComponent} from './components/home.component';
import {ReaderComponent} from './components/reader.component';
import {SearchComponent} from './components/search.component';
import {VerseComponent} from './components/verse.component';

import {BiblerService} from './services/bibler.service';
import {BibleService} from './services/bible.service';
import {BookService} from './services/book.service';
import {SearchService} from './services/search.service';
import {TestamentService} from './services/testament.service';
import {VerseService} from './services/verse.service';


enableProdMode();


import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'api', component: ApiComponent }
]
const appRoutingProviders: any[] = [];
const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

@NgModule({
    imports: [
		BrowserModule,
        routing,
        FormsModule,
        HttpModule
    ],       // module dependencies
    declarations: [
        ApiComponent,
		AppComponent,
        HomeComponent,
        ComparatorComponent,
        ReaderComponent,
        SearchComponent,
        VerseComponent
    ],   // components and directives
    providers: [
        appRoutingProviders,
        BiblerService,
        BibleService,
        BookService,
        SearchService,
        TestamentService,
        VerseService
    ],                    // services
    bootstrap: [AppComponent]     // root component
})
export class AppModule {
}
