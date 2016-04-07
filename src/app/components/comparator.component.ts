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
            this.verseService.index(this.bible, this.book, this.chapter).subscribe(left => {
                this.updateHighlights(left);
                this.versesLeft = left;
                this.verseService.index(this.bibleRight, this.book, this.chapter).subscribe(right => {
                    this.updateHighlights(right);
                    this.versesRight = right;
                });
            });
        }
    }

    updateHighlights(data: Object[]) {
        console.log("Updating highlights for both bibles...");
        for (var i = 0; i < data.length; i++) {
            data[i]['highlightedText'] = this.highlighted(this.searchText, data[i]['text']);
        }
    }

    selectBibleRight(slug: string) {
        console.log("Changing right bible to " + slug);
        this.bibleRight = this.bibleForSlug(slug);
        this.afterBibleSelect();
    }


}
