// Author: Preston Lee

import { signal, computed, effect, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookService } from '../services/book.service';
import { VerseService } from '../services/verse.service';
import { BibleBasedComponent } from './bibleBased.component';
import { Book } from '../models/book';
import { Verse } from '../models/verse';

export abstract class BookBasedComponent extends BibleBasedComponent {

    protected bookService = inject(BookService);
    protected verseService = inject(VerseService);
    protected destroyRef = inject(DestroyRef);
    protected cdr = inject(ChangeDetectorRef);

    private booksSignal = signal<Book[]>([]);
    books = computed(() => this.booksSignal());

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

        // Reload books when bible changes
        effect(() => {
            const bible = this.bible();
            console.log("BookBasedComponent effect: bible changed to", bible?.slug || "null");
            if (bible) {
                console.log("Loading books for bible: " + bible.slug);
                const url = this.biblerService.getUrl() + '/bibles/' + bible.slug + '/books.json';
                console.log("Requesting books from URL:", url);
                this.bookService.index(bible)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: (books: Book[]) => {
                            console.log("Books loaded:", books.length, "books for bible", bible.slug);
                            console.log("Books data:", books);
                            if (books && Array.isArray(books)) {
                                this.booksSignal.set(books);
                                // Reset selected book if current book doesn't exist in new bible
                                const currentSlug = this.selectedBookSlug();
                                if (currentSlug && !this.bookForSlug(currentSlug)) {
                                    this.selectedBookSlug.set(null);
                                }
                                // Manually trigger change detection for OnPush components
                                this.cdr.markForCheck();
                            } else {
                                console.warn("Books response is not an array:", books);
                                this.booksSignal.set([]);
                                this.cdr.markForCheck();
                            }
                        },
                        error: (err) => {
                            console.error("Error loading books for bible", bible.slug, err);
                            console.error("Error details:", JSON.stringify(err, null, 2));
                            if (err.error) {
                                console.error("Error response:", err.error);
                            }
                            if (err.status) {
                                console.error("HTTP status:", err.status);
                            }
                            this.booksSignal.set([]);
                            this.cdr.markForCheck();
                        }
                    });
            } else {
                // Clear books when no bible is selected
                console.log("No bible selected, clearing books");
                this.booksSignal.set([]);
                this.selectedBookSlug.set(null);
            }
        });

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
