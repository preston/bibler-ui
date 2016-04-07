import {Component} from 'angular2/core';


import {BookBasedComponent} from './bookBased.component';

import {BiblerService} from '../services/bibler.service';
import {BibleService} from '../services/bible.service';
import {BookService} from '../services/book.service';
import {TestamentService} from '../services/testament.service';
import {VerseService} from '../services/verse.service';
import {SearchService} from '../services/search.service';

@Component({
    selector: 'api',
    templateUrl: 'app/components/api.html',
    providers: [BiblerService, BibleService, BookService, TestamentService, VerseService, SearchService]
})
export class ApiComponent extends BookBasedComponent {


    verses: Object[] = [];

    constructor(
        biblerService: BiblerService,
        bibleService: BibleService,
        testamentService: TestamentService,
        bookService: BookService,
        verseService: VerseService) {
        super(biblerService, bibleService, testamentService, bookService, verseService);
        console.log("ApiComponent has been initialized.");
    }

    selectChapter(n: number) {
        console.log("Updating verses for chapter " + n);
        this.chapter = n;
        this.verseService.index(this.bible, this.book, this.chapter).subscribe(d => {
            this.verses = d;
        });
    }

    stringify(obj: any): string {
        return JSON.stringify(obj, null, "\t").trim();
    }

}
