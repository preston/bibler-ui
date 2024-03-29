// Author: Preston Lee

import { Component } from '@angular/core';

import { BiblerService } from '../services/bibler.service';
import { BibleService } from '../services/bible.service';
import { BookService } from '../services/book.service';
import { TestamentService } from '../services/testament.service';
import { VerseService } from '../services/verse.service';
import { BookBasedComponent } from './bookBased.component';
import { Verse } from '../models/verse';

@Component({
    selector: 'reader',
    templateUrl: 'reader.html'
})
export class ReaderComponent extends BookBasedComponent {

    verses: Verse[] = [];

    constructor(
        biblerService: BiblerService,
        bibleService: BibleService,
        testamentService: TestamentService,
        bookService: BookService,
        verseService: VerseService) {
        super(biblerService, bibleService, testamentService, bookService, verseService);
        console.log("ReaderComponent created!");
    }

    selectChapter(n: number) {
        console.log("Updating verses for chapter " + n);
        this.chapter = n;
        if (this.bible && this.book) {
            this.verseService.index(this.bible, this.book, this.chapter).subscribe(d => {
                this.verses = d;
                this.updateHighlights();
            });
        }
    }

    updateHighlights() {
        console.log("Updating highlights...");
        // console.log(s);
        for (var i = 0; i < this.verses.length; i++) {
            // console.log(this.verses[i]['text']);
            this.verses[i]['highlightedText'] = this.highlighted(this.searchText, this.verses[i]['text']);
        }
    }

}
