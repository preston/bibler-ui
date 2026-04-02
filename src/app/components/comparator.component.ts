// Author: Preston Lee

import { Component, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookBasedComponent } from './bookBased.component';
import { Verse } from '../models/verse';
import { Bible } from '../models/bible';
import { Book } from '../models/book';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'comparator',
    templateUrl: 'comparator.html',
    standalone: true,
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparatorComponent extends BookBasedComponent {

    selectedBibleRightSlug = signal<string | null>(null);
    bibleRight = computed(() => {
        const slug = this.selectedBibleRightSlug();
        if (!slug) return null;
        return this.bibleForSlug(slug);
    });

    private booksRightSignal = signal<Book[]>([]);
    booksRight = computed(() => this.booksRightSignal());

    selectedBookRightSlug = signal<string | null>(null);
    bookRight = computed(() => {
        const slug = this.selectedBookRightSlug();
        if (!slug) return null;
        return this.objectForSlug<Book>(this.booksRight(), slug);
    });

    chaptersRight = signal<number[]>([]);

    versesLeft = signal<Verse[]>([]);
    versesRight = signal<Verse[]>([]);

    highlightedVersesLeft = computed(() => {
        const verses = this.versesLeft();
        const searchText = this.searchText();
        return verses.map(verse => ({
            ...verse,
            highlightedText: this.highlighted(searchText, verse.text)
        }));
    });

    highlightedVersesRight = computed(() => {
        const verses = this.versesRight();
        const searchText = this.searchText();
        return verses.map(verse => ({
            ...verse,
            highlightedText: this.highlighted(searchText, verse.text)
        }));
    });

    constructor() {
        super();
        console.log("ComparatorComponent has been initialized.");

        // Load books for right bible when it changes
        effect(() => {
            const bibleRight = this.bibleRight();
            if (bibleRight) {
                console.log("Loading books for right bible: " + bibleRight.slug);
                this.bookService.index(bibleRight)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((books: Book[]) => {
                        this.booksRightSignal.set(books);
                        // Match left book when possible; otherwise first book so right column can load.
                        // (Right books often finish before the left book is selected — do not leave slug unset.)
                        const leftBook = this.book();
                        if (books.length === 0) {
                            this.selectedBookRightSlug.set(null);
                        } else if (leftBook) {
                            const matchingBook = this.objectForSlug<Book>(books, leftBook.slug);
                            this.selectedBookRightSlug.set(
                                matchingBook ? matchingBook.slug : books[0].slug
                            );
                        } else {
                            this.selectedBookRightSlug.set(books[0].slug);
                        }
                    });
            } else {
                this.booksRightSignal.set([]);
                this.selectedBookRightSlug.set(null);
            }
        });

        // Update chapters for right bible when book changes
        effect(() => {
            const bibleRight = this.bibleRight();
            const bookRight = this.bookRight();
            if (bibleRight && bookRight) {
                console.log("Updating chapter list for right bible.");
                this.bookService.chaptersFor(bibleRight, bookRight)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((d: number[]) => {
                        this.chaptersRight.set(d);
                    });
            } else {
                this.chaptersRight.set([]);
            }
        });

        // When left book changes, sync the right book (match by slug, else first book in right bible).
        effect(() => {
            const leftBook = this.book();
            const booksRight = this.booksRight();
            if (leftBook && booksRight.length > 0) {
                const matchingBook = this.objectForSlug<Book>(booksRight, leftBook.slug);
                this.selectedBookRightSlug.set(
                    matchingBook ? matchingBook.slug : booksRight[0].slug
                );
            }
        });

        // Load right-column verses whenever right bible, right book, and chapter are ready.
        // (selectChapter often runs before right books finish loading, so right verses were never fetched.)
        effect((onCleanup) => {
            const bibleRight = this.bibleRight();
            const bookRight = this.bookRight();
            const n = this.chapter();
            if (bibleRight && bookRight && n !== null) {
                const sub = this.verseService.index(bibleRight, bookRight, n).subscribe((right: Verse[]) => {
                    this.versesRight.set(right);
                    this.cdr.markForCheck();
                });
                onCleanup(() => sub.unsubscribe());
            } else {
                this.versesRight.set([]);
            }
        });
    }

    override afterBibleLoad() {
        super.afterBibleLoad();
        const bibles = this.bibles();
        if (!this.selectedBibleRightSlug() && bibles.length > 0) {
            // Prefer a second translation when available; otherwise use the same bible so the right column can still load.
            this.selectBibleRight(bibles.length > 1 ? bibles[1].slug : bibles[0].slug);
        }
    }

    selectChapterString(s: string) {
        this.selectChapter(parseInt(s));
    }
    
    selectChapter(n: number) {
        console.log("Updating verses for chapter " + n);
        this.chapter.set(n);
        const bible = this.bible();
        const book = this.book();
        if (bible && book && n !== null) {
            this.verseService.index(bible, book, n).subscribe((left: Verse[]) => {
                this.versesLeft.set(left);
            });
        }
        // Right verses are loaded in the constructor effect so they still load when right
        // book becomes available after the initial selectChapter (async books load race).
    }

    selectBookRight(slug: string) {
        if (slug) {
            console.log("Changing right book to " + slug);
            this.selectedBookRightSlug.set(slug);
        }
    }

    updateAllHighlights() {
        // Highlights are now computed automatically
    }

    updateHighlights(verses: Verse[]) {
        console.log("Updating highlights for both bibles...");
        // Highlights are now computed automatically via computed signals
    }

    selectBibleRight(slug: string) {
        console.log("Changing right bible to " + slug);
        this.selectedBibleRightSlug.set(slug);
        // Books will be reloaded automatically via effect
    }

}
