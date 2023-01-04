// Author: Preston Lee

import {Component} from '@angular/core';


import {BibleBasedComponent} from './bibleBased.component';

import {BiblerService} from '../services/bibler.service';
import {BibleService} from '../services/bible.service';
import {BookService} from '../services/book.service';
import {TestamentService} from '../services/testament.service';
import {VerseService} from '../services/verse.service';
import {SearchService} from '../services/search.service';
import { Verse } from '../models/verse';

@Component({
    selector: 'search',
    templateUrl: 'search.html'
})
export class SearchComponent extends BibleBasedComponent {

    verses: Verse[] = [];

    ascending = true;

    constructor(
        biblerService: BiblerService,
        bibleService: BibleService,
        testamentService: TestamentService,
        protected bookService: BookService,
        protected verseService: VerseService,
        protected searchService: SearchService) {
        super(biblerService, bibleService, testamentService);
        console.log("SearchComponent has been initialized.");
    }

    resort() {
        this.ascending = !this.ascending;
        if (this.ascending) {
            this.verses = this.verses.sort((a, b) => b.book.name.localeCompare(a.book.name));
        } else {
            this.verses = this.verses.sort((a, b) => a.book.name.localeCompare(b.book.name));
        }
    }

    afterBibleLoad(): void {
        // Meh
    }

    afterBibleSelect() { this.search(); }

    search() {
        console.log("Searching...");
        if (this.validSearch() && this.bible) {
            var obs = this.searchService.search(this.bible.slug, this.searchText);
            obs.subscribe(d => {
                this.verses = <Verse[]>d;
                for (var i = 0; i < this.verses.length; i++) {
                    this.verses[i]['highlightedText'] = this.highlighted(this.searchText, this.verses[i]['text']);
                }
                this.resort();
                // console.log(d);
            });
        }
        // return false;
    }

    validSearch() {
        return this.bible != null && this.searchText != null && this.searchText.length >= 3
    }

}
