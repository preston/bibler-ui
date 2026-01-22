// Author: Preston Lee

import { BiblerService } from '../services/bibler.service';
import { BibleService } from '../services/bible.service';
import { BookService } from '../services/book.service';
import { TestamentService } from '../services/testament.service';
import { VerseService } from '../services/verse.service';
import { BibleBasedComponent } from './bibleBased.component';
import { Book } from '../models/book';
import { Verse } from '../models/verse';

export abstract class BookBasedComponent extends BibleBasedComponent {

    books: Book[] = [];
    chapters: number[] = [];

    book: Book | null = null;
    chapter: number | null = null;

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
        this.bookService.index().subscribe((d: Book[]) => {
            this.books = d;
            if (this.book == null && this.books.length > 0)
                this.selectBook(this.books[0].slug);
        });
        console.log("afterBibleLoad");
    }


    selectBook(slug: string) {
        if (slug) {
            console.log("Changing book to " + slug);
            this.book = this.bookForSlug(slug);
            this.afterBibleSelect();
        }
    }

    afterBibleSelect() {
        var bible = this.bible;
        var book = this.book;
        if (this.bible != null && this.book != null) {
            console.log("Updating chapter list.");
            this.bookService.chaptersFor(this.bible, this.book).subscribe((d: number[]) => {
                this.chapters = d;
                this.selectChapter(this.chapters[0]);
            });
        } else {
            console.log("Bible and book must be selected to update chapter counts.");
        }
    }

    abstract selectChapter(n: number): any;


    verseDataPermalink(verse: Verse, format: string) {
        return this.biblerService.getUrl() + '/' + this.bible?.slug + '/' + this.book?.slug + '/' + this.chapter + '/' + verse['ordinal'] + '.' + format
    }


    protected bookForSlug(slug: string): Book | null {
        return this.objectForSlug<Book>(this.books, slug);
    }

}
