import { Component } from '@angular/core';

import { BiblerService } from '../services/bibler.service';
import { BibleService } from '../services/bible.service';
import { BookService } from '../services/book.service';
import { TestamentService } from '../services/testament.service';
import { VerseService } from '../services/verse.service';
import { BookBasedComponent } from './bookBased.component';
import { Verse } from '../models/verse';
import { Bible } from '../models/bible';

@Component({
    selector: 'comparator',
    templateUrl: 'comparator.html'
    // ,
    // providers: [BiblerService, BibleService, BookService, TestamentService, VerseService]
})
export class ComparatorComponent extends BookBasedComponent {

    bibleRight: Bible | null = null;
    versesLeft: Verse[] = [];
    versesRight: Verse[] = [];

    constructor(
        biblerService: BiblerService,
        bibleService: BibleService,
        bookService: BookService,
        testamentService: TestamentService,
        verseService: VerseService) {
        super(biblerService, bibleService, testamentService, bookService, verseService);
        console.log("ComparatorComponent has been initialized.");
    }

    afterBibleLoad() {
        super.afterBibleLoad();
        if (this.bibleRight == null && this.bibles.length > 1)
            this.selectBibleRight(this.bibles[1]['slug']);
    }

    selectChapter(n: number) {
        console.log("Updating verses for chapter " + n);
        this.chapter = n;
        if (this.bible && this.bibleRight && this.book) {
            this.verseService.index(this.bible, this.book, this.chapter).subscribe(left => {
                this.updateHighlights(left);
                this.versesLeft = left;
                if (this.bibleRight && this.book && this.chapter) {
                    this.verseService.index(this.bibleRight, this.book, this.chapter).subscribe(right => {
                        this.updateHighlights(right);
                        this.versesRight = right;
                    });
                }
            });
        }
    }

    updateAllHighlights() {
        this.updateHighlights(this.versesLeft);
        this.updateHighlights(this.versesRight);
    }
    updateHighlights(verses: Verse[]) {
        console.log("Updating highlights for both bibles...");
        for (var i = 0; i < verses.length; i++) {
            verses[i]['highlightedText'] = this.highlighted(this.searchText, verses[i]['text']);
        }
    }

    selectBibleRight(slug: string) {
        console.log("Changing right bible to " + slug);
        this.bibleRight = this.bibleForSlug(slug);
        this.afterBibleSelect();
    }


}
