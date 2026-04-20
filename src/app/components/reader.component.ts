// Author: Preston Lee

import { Component, signal, computed, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    verses = signal<Verse[]>([]);
    targetVerseOrdinal = signal<number | null>(null);
    private pendingBibleUuid = signal<string | null>(null);
    private pendingBookUuid = signal<string | null>(null);
    private pendingChapter = signal<number | null>(null);

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
        this.pendingBibleUuid.set(bibleUuid && bibleUuid.trim() ? bibleUuid : null);
        this.pendingBookUuid.set(bookUuid && bookUuid.trim() ? bookUuid : null);
        this.pendingChapter.set(this.parsePositiveInt(chapterRaw));
        this.targetVerseOrdinal.set(this.parsePositiveInt(verseRaw));
        this.applyPendingSelections();
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

    selectChapter(n: number) {
        this.chapter.set(n);
        const bible = this.bible();
        const book = this.book();
        if (bible && book) {
            this.verseService.index(bible, book, n).subscribe((d: Verse[]) => {
                this.verses.set(d);
                this.applyPendingSelections();
            });
        }
    }
}
