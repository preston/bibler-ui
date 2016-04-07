import {Component} from 'angular2/core';

import {BiblerService} from '../services/bibler.service';
import {BibleService} from '../services/bible.service';
import {BookService} from '../services/book.service';
import {TestamentService} from '../services/testament.service';
import {VerseService} from '../services/verse.service';
import {BookBasedComponent} from './bookBased.component';

@Component({
    selector: 'comparator',
    templateUrl: 'app/components/comparator.html',
    providers: [BiblerService, BibleService, BookService, TestamentService, VerseService]
})
export class ComparatorComponent extends BookBasedComponent {

    bibleRight: Object = null;
    versesLeft: Object[] = [];
    versesRight: Object[] = [];

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
        if (this.bible && this.bibleRight) {
            this.verseService.index(this.bible, this.book, this.chapter).subscribe(d => {
                this.versesLeft = d;
                this.verseService.index(this.bibleRight, this.book, this.chapter).subscribe(d => {
                    this.versesRight = d;
                    this.updateHighlights();
                });
            });
        }
    }

    updateHighlights() {
        console.log("Updating highlights for both bibles...");
        for (var i = 0; i < this.versesLeft.length; i++) {
            this.versesLeft[i]['highlightedText'] = this.highlighted(this.searchText, this.versesLeft[i]['text']);
        }
        for (var i = 0; i < this.versesRight.length; i++) {
            this.versesRight[i]['highlightedText'] = this.highlighted(this.searchText, this.versesRight[i]['text']);
        }
    }

    selectBibleRight(slug: string) {
        console.log("Changing right bible to " + slug);
        this.bibleRight = this.bibleForSlug(slug);
        this.afterBibleSelect();
    }


}
