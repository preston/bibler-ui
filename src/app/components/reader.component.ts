// Author: Preston Lee

import { Component, signal, computed, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookBasedComponent } from './bookBased.component';
import { Verse } from '../models/verse';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'reader',
    templateUrl: 'reader.html',
    standalone: true,
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReaderComponent extends BookBasedComponent {

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    verses = signal<Verse[]>([]);
    targetVerseOrdinal = signal<number | null>(null);
    private pendingBibleUuid = signal<string | null>(null);
    private pendingBookUuid = signal<string | null>(null);
    private pendingChapter = signal<number | null>(null);
    private applyingDeepLink = false;
    canNavigatePrevious = computed(() => {
        const currentBook = this.book();
        const currentChapter = this.chapter();
        const chapters = this.chapters();
        if (!currentBook || currentChapter === null || chapters.length === 0) return false;

        const chapterIndex = chapters.indexOf(currentChapter);
        if (chapterIndex > 0) return true;

        const bookIndex = this.books().findIndex((book) => book.uuid === currentBook.uuid);
        return bookIndex > 0;
    });
    canNavigateNext = computed(() => {
        const currentBook = this.book();
        const currentChapter = this.chapter();
        const chapters = this.chapters();
        if (!currentBook || currentChapter === null || chapters.length === 0) return false;

        const chapterIndex = chapters.indexOf(currentChapter);
        if (chapterIndex !== -1 && chapterIndex < chapters.length - 1) return true;

        const books = this.books();
        const bookIndex = books.findIndex((book) => book.uuid === currentBook.uuid);
        return bookIndex !== -1 && bookIndex < books.length - 1;
    });

    highlightedVerses = computed(() => {
        const verses = this.verses();
        const searchText = this.searchText();
        return verses.map(verse => {
            // Ensure we preserve all properties including book
            const highlightedVerse = { ...verse };
            highlightedVerse.highlightedText = this.highlighted(searchText, verse.text);
            return highlightedVerse;
        });
    });

    constructor() {
        super();
        this.route.queryParamMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => this.applyDeepLinkParams(params.get('bible'), params.get('book'), params.get('chapter'), params.get('verse')));

        effect(() => {
            this.bibles();
            this.books();
            this.chapters();
            this.applyPendingSelections();
        });

        effect(() => {
            const target = this.targetVerseOrdinal();
            this.verses();
            if (!target) return;
            queueMicrotask(() => {
                document.getElementById(`reader-verse-${target}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            });
        });
    }

    private applyDeepLinkParams(
        bibleUuid: string | null,
        bookUuid: string | null,
        chapterRaw: string | null,
        verseRaw: string | null
    ): void {
        this.applyingDeepLink = true;
        this.pendingBibleUuid.set(bibleUuid && bibleUuid.trim() ? bibleUuid : null);
        this.pendingBookUuid.set(bookUuid && bookUuid.trim() ? bookUuid : null);
        this.pendingChapter.set(this.parsePositiveInt(chapterRaw));
        this.targetVerseOrdinal.set(this.parsePositiveInt(verseRaw));
        this.applyPendingSelections();
        this.applyingDeepLink = false;
    }

    private parsePositiveInt(raw: string | null): number | null {
        if (!raw) return null;
        const parsed = Number(raw);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }

    private applyPendingSelections(): void {
        const pendingBibleUuid = this.pendingBibleUuid();
        if (pendingBibleUuid && this.bibles().some((b) => b.uuid === pendingBibleUuid)) {
            if (this.selectedBibleUuid() !== pendingBibleUuid) {
                this.selectBible(pendingBibleUuid);
            }
            this.pendingBibleUuid.set(null);
        }

        const pendingBookUuid = this.pendingBookUuid();
        if (pendingBookUuid && this.books().some((b) => b.uuid === pendingBookUuid)) {
            if (this.selectedBookUuid() !== pendingBookUuid) {
                this.selectBook(pendingBookUuid);
            }
            this.pendingBookUuid.set(null);
        }

        const pendingChapter = this.pendingChapter();
        if (pendingChapter !== null && this.chapters().includes(pendingChapter)) {
            if (this.chapter() !== pendingChapter) {
                this.selectChapter(pendingChapter);
            }
            this.pendingChapter.set(null);
        }
    }

    override selectBible(uuid: string) {
        super.selectBible(uuid);
        this.clearDeepLinkTargetForManualNavigation();
    }

    override selectBook(uuid: string) {
        super.selectBook(uuid);
        this.clearDeepLinkTargetForManualNavigation();
    }

    selectChapter(n: number) {
        this.chapter.set(n);
        this.clearDeepLinkTargetForManualNavigation();
        this.syncReaderQueryParams();
        const bible = this.bible();
        const book = this.book();
        if (bible && book) {
            this.verseService.index(bible, book, n).subscribe((d: Verse[]) => {
                this.verses.set(d);
                this.applyPendingSelections();
            });
        }
    }

    navigatePrevious() {
        if (!this.canNavigatePrevious()) return;
        this.targetVerseOrdinal.set(null);

        const chapters = this.chapters();
        const currentChapter = this.chapter();
        const chapterIndex = currentChapter === null ? -1 : chapters.indexOf(currentChapter);
        if (chapterIndex > 0) {
            this.selectChapter(chapters[chapterIndex - 1]);
            return;
        }

        const bible = this.bible();
        const currentBook = this.book();
        if (!bible || !currentBook) return;

        const books = this.books();
        const currentBookIndex = books.findIndex((book) => book.uuid === currentBook.uuid);
        if (currentBookIndex <= 0) return;

        const previousBook = books[currentBookIndex - 1];
        this.bookService.chaptersFor(bible, previousBook).subscribe((bookChapters: number[]) => {
            if (bookChapters.length > 0) {
                this.pendingChapter.set(bookChapters[bookChapters.length - 1]);
            }
            this.selectBook(previousBook.uuid);
        });
    }

    navigateNext() {
        if (!this.canNavigateNext()) return;
        this.targetVerseOrdinal.set(null);

        const chapters = this.chapters();
        const currentChapter = this.chapter();
        const chapterIndex = currentChapter === null ? -1 : chapters.indexOf(currentChapter);
        if (chapterIndex !== -1 && chapterIndex < chapters.length - 1) {
            this.selectChapter(chapters[chapterIndex + 1]);
            return;
        }

        const bible = this.bible();
        const currentBook = this.book();
        if (!bible || !currentBook) return;

        const books = this.books();
        const currentBookIndex = books.findIndex((book) => book.uuid === currentBook.uuid);
        if (currentBookIndex === -1 || currentBookIndex >= books.length - 1) return;

        const nextBook = books[currentBookIndex + 1];
        this.bookService.chaptersFor(bible, nextBook).subscribe((bookChapters: number[]) => {
            if (bookChapters.length > 0) {
                this.pendingChapter.set(bookChapters[0]);
            }
            this.selectBook(nextBook.uuid);
        });
    }

    private clearDeepLinkTargetForManualNavigation(): void {
        if (!this.applyingDeepLink && !this.hasPendingDeepLinkSelection()) {
            this.targetVerseOrdinal.set(null);
        }
    }

    private syncReaderQueryParams(): void {
        if (this.applyingDeepLink || this.hasPendingDeepLinkSelection()) return;
        const bible = this.bible();
        const book = this.book();
        const chapter = this.chapter();
        if (!bible || !book || chapter === null) return;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                bible: bible.uuid,
                book: book.uuid,
                chapter,
                verse: null
            },
            replaceUrl: true
        });
    }

    private hasPendingDeepLinkSelection(): boolean {
        return this.pendingBibleUuid() !== null
            || this.pendingBookUuid() !== null
            || this.pendingChapter() !== null;
    }
}
