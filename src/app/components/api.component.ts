import { Component } from '@angular/core';


import { BookBasedComponent } from './bookBased.component';

import { BiblerService } from '../services/bibler.service';
import { BibleService } from '../services/bible.service';
import { BookService } from '../services/book.service';
import { TestamentService } from '../services/testament.service';
import { VerseService } from '../services/verse.service';
import { SearchService } from '../services/search.service';
import { Verse } from '../models/verse';
import { NgIf } from '@angular/common';

@Component({
    selector: 'api',
    templateUrl: 'api.html',
    standalone: true,
    imports: [NgIf]
})
export class ApiComponent extends BookBasedComponent {


    verses: Verse[] = [];

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
        if (this.bible && this.book) {
            this.verseService.index(this.bible, this.book, this.chapter).subscribe(d => {
                this.verses = d;
            });
        }
    }

    stringify(obj: any): string {
        return JSON.stringify(obj, null, "\t").trim();
    }

}
