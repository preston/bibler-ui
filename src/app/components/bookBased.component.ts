// Author: Preston Lee

import { signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookService } from '../services/book.service';
import { VerseService } from '../services/verse.service';
import { BibleBasedComponent } from './bibleBased.component';
import { Book } from '../models/book';
import { Verse } from '../models/verse';

export abstract class BookBasedComponent extends BibleBasedComponent {

    protected bookService = inject(BookService);
    protected verseService = inject(VerseService);
    private destroyRef = inject(DestroyRef);

    private booksSignal = toSignal(this.bookService.index(), { initialValue: [] as Book[] });
    books = computed(() => this.booksSignal() ?? []);

    selectedBookSlug = signal<string | null>(null);
    book = computed(() => {
        const slug = this.selectedBookSlug();
        if (!slug) return null;
        return this.bookForSlug(slug);
    });

    chapters = signal<number[]>([]);
    chapter = signal<number | null>(null);

    constructor() {
        super();
        console.log("BookBasedComponent created!");

        // Auto-select first book when books load
        effect(() => {
            const books = this.books();
            const currentSlug = this.selectedBookSlug();
            if (books.length > 0 && !currentSlug) {
                this.selectBook(books[0].slug);
            }
        });

        // Update chapters when bible or book changes
        effect(() => {
            const bible = this.bible();
            const book = this.book();
            if (bible && book) {
                console.log("Updating chapter list.");
                this.bookService.chaptersFor(bible, book)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((d: number[]) => {
                        this.chapters.set(d);
                        if (d.length > 0) {
                            this.selectChapter(d[0]);
                        }
                    });
            } else {
                console.log("Bible and book must be selected to update chapter counts.");
            }
        });
    }

    afterBibleLoad() {
        console.log("afterBibleLoad");
    }

    selectBook(slug: string) {
        if (slug) {
            console.log("Changing book to " + slug);
            this.selectedBookSlug.set(slug);
        }
    }

    afterBibleSelect() {
        // Handled by effect in constructor
    }

    abstract selectChapter(n: number): any;

    verseDataPermalink(verse: Verse, format: string) {
        const bible = this.bible();
        const book = this.book();
        const chapter = this.chapter();
        if (!bible || !book || chapter === null) return '';
        return this.biblerService.getUrl() + '/' + bible.slug + '/' + book.slug + '/' + chapter + '/' + verse.ordinal + '.' + format;
    }

    protected bookForSlug(slug: string): Book | null {
        return this.objectForSlug<Book>(this.books(), slug);
    }

}
