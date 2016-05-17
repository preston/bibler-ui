import {Component, OnInit} from '@angular/core';

import {BiblerService} from '../services/bibler.service';
import {BibleService} from '../services/bible.service';
import {BookService} from '../services/book.service';
import {TestamentService} from '../services/testament.service';
import {VerseService} from '../services/verse.service';
import {BibleBasedComponent} from './bibleBased.component';

export abstract class BookBasedComponent extends BibleBasedComponent {

    books: Object[] = [];
    chapters: number[] = [];

    book: Object;
    chapter: number;

    constructor(
        biblerService: BiblerService,
        bibleService: BibleService,
        testamentService: TestamentService,
        protected bookService: BookService,
        protected verseService: VerseService) {
        super(biblerService, bibleService, testamentService);
        console.log("BookBasedComponent created!");
    }

	afterBibleLoad() {
        this.bookService.index().subscribe(d => {
            this.books = d;
            if (this.book == null && this.books.length > 0)
                this.selectBook(this.books[0]['slug']);
        });
        console.log("afterBibleLoad");
    }


    selectBook(slug: string) {
        console.log("Changing book to " + slug);
        this.book = this.bookForSlug(slug);
        this.afterBibleSelect();
    }

    afterBibleSelect() {
        var bible = this.bible;
        var book = this.book;
        if (this.bible != null && this.book != null) {
            console.log("Updating chapter list.");
            this.bookService.chaptersFor(this.bible, this.book).subscribe(d => {
                this.chapters = d;
                this.selectChapter(this.chapters[0]);
            });
        } else {
            console.log("Bible and book must be selected to update chapter counts.");
        }
    }

	abstract selectChapter(n: number);


    verseDataPermalink(verse, format) {
        return this.biblerService.getUrl() + '/' + this.bible['slug'] + '/' + this.book['slug'] + '/' + this.chapter + '/' + verse['ordinal'] + '.' + format
    }


    protected bookForSlug(slug: string): Object {
        return this.objectForSlug(this.books, slug);
    };

}
