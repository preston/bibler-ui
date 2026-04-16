// Author: Preston Lee

import { Component, signal, computed, effect, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { BookBasedComponent } from './bookBased.component';
import { ComparatorAiCommentaryRequest, ComparatorAiSseMessage, ComparatorAiVerseCommentary, Verse } from '../models/verse';
import { Bible } from '../models/bible';
import { Book } from '../models/book';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    selector: 'comparator',
    templateUrl: 'comparator.html',
    standalone: true,
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparatorComponent extends BookBasedComponent {
    private aiRunSub: Subscription | undefined;
    private defaultsApplied = false;

    selectedBibleRightUuid = signal<string | null>(null);
    bibleRight = computed(() => {
        const uuid = this.selectedBibleRightUuid();
        if (!uuid) return null;
        return this.bibleForUuid(uuid);
    });

    private booksRightSignal = signal<Book[]>([]);
    booksRight = computed(() => this.booksRightSignal());

    selectedBookRightUuid = signal<string | null>(null);
    bookRight = computed(() => {
        const uuid = this.selectedBookRightUuid();
        if (!uuid) return null;
        return this.objectForUuid<Book>(this.booksRight(), uuid);
    });

    chaptersRight = signal<number[]>([]);

    versesLeft = signal<Verse[]>([]);
    versesRight = signal<Verse[]>([]);
    aiCommentaryLoading = signal(false);
    aiCommentaryError = signal('');
    aiCommentaryStatus = signal('');
    aiCommentaryByOrdinal = signal<Record<number, ComparatorAiVerseCommentary>>({});
    expandedVerseOrdinals = signal<Record<number, boolean>>({});

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

    versesAreAligned = computed(() => {
        const left = this.versesLeft();
        const right = this.versesRight();
        if (left.length === 0 || right.length === 0 || left.length !== right.length) return false;
        for (let i = 0; i < left.length; i++) {
            if (left[i].ordinal !== right[i].ordinal) return false;
        }
        return true;
    });

    comparisonRows = computed(() => {
        if (!this.versesAreAligned()) return [];
        const left = this.highlightedVersesLeft();
        const rightByOrdinal = new Map(this.highlightedVersesRight().map((v) => [v.ordinal, v]));
        const aiByOrdinal = this.aiCommentaryByOrdinal();
        return left.map((lv) => ({
            ordinal: lv.ordinal,
            leftText: lv.highlightedText,
            rightText: rightByOrdinal.get(lv.ordinal)?.highlightedText ?? '',
            ai: aiByOrdinal[lv.ordinal] ?? null
        }));
    });

    constructor() {
        super();

        // Load books for right bible when it changes
        effect((onCleanup) => {
            const bibleRight = this.bibleRight();
            if (bibleRight) {
                const sub = this.bookService.index(bibleRight).subscribe((books: Book[]) => {
                    this.booksRightSignal.set(books);
                    // Match left book when possible; otherwise first book so right column can load.
                    const leftBook = this.book();
                    if (books.length === 0) {
                        this.selectedBookRightUuid.set(null);
                    } else if (leftBook) {
                        const matchingBook = books.find((b) => b.ordinal === leftBook.ordinal);
                        this.selectedBookRightUuid.set(
                            matchingBook ? matchingBook.uuid : books[0].uuid
                        );
                    } else {
                        this.selectedBookRightUuid.set(books[0].uuid);
                    }
                });
                onCleanup(() => sub.unsubscribe());
            } else {
                this.booksRightSignal.set([]);
                this.selectedBookRightUuid.set(null);
            }
        });

        // Update chapters for right bible when book changes
        effect((onCleanup) => {
            const bibleRight = this.bibleRight();
            const bookRight = this.bookRight();
            if (bibleRight && bookRight) {
                const sub = this.bookService.chaptersFor(bibleRight, bookRight).subscribe((d: number[]) => {
                    this.chaptersRight.set(d);
                });
                onCleanup(() => sub.unsubscribe());
            } else {
                this.chaptersRight.set([]);
            }
        });

        // When left book changes, sync the right book by book ordinal.
        effect(() => {
            const leftBook = this.book();
            const booksRight = this.booksRight();
            if (leftBook && booksRight.length > 0) {
                const matchingBook = booksRight.find((b) => b.ordinal === leftBook.ordinal);
                this.selectedBookRightUuid.set(
                    matchingBook ? matchingBook.uuid : booksRight[0].uuid
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

        effect(() => {
            this.bible();
            this.bibleRight();
            this.book();
            this.bookRight();
            this.chapter();
            this.resetAiCommentaryState();
        });
    }

    override afterBibleLoad() {
        super.afterBibleLoad();
        const bibles = this.bibles();
        if (bibles.length === 0 || this.defaultsApplied) return;
        this.defaultsApplied = true;

        const defaultLeft = bibles.find((b) => !!b.ai_default_english) ?? bibles[0];
        this.selectBible(defaultLeft.uuid);

        const defaultRight = bibles.find((b) => !!b.ai_default_hebrew_ot)
            ?? bibles.find((b) => b.uuid !== defaultLeft.uuid)
            ?? defaultLeft;
        if (!this.selectedBibleRightUuid()) {
            this.selectBibleRight(defaultRight.uuid);
        }
    }

    selectChapterString(s: string) {
        this.selectChapter(parseInt(s));
    }
    
    selectChapter(n: number) {
        this.chapter.set(n);
        const bible = this.bible();
        const book = this.book();
        if (bible && book && n !== null) {
            const requestChapter = n;
            this.verseService.index(bible, book, n).subscribe((left: Verse[]) => {
                if (this.chapter() !== requestChapter) return;
                this.versesLeft.set(left);
            });
        }
        // Right verses are loaded in the constructor effect so they still load when right
        // book becomes available after the initial selectChapter (async books load race).
    }

    selectBookRight(uuid: string) {
        if (uuid) {
            this.selectedBookRightUuid.set(uuid);
        }
    }

    selectBibleRight(uuid: string) {
        this.selectedBibleRightUuid.set(uuid);
        // Books will be reloaded automatically via effect
    }

    runAiCommentary() {
        if (!this.versesAreAligned()) return;
        const leftBible = this.bible();
        const rightBible = this.bibleRight();
        const leftBook = this.book();
        const rightBook = this.bookRight();
        const chapter = this.chapter();
        if (!leftBible || !rightBible || !leftBook || !rightBook || chapter === null) return;

        const payload: ComparatorAiCommentaryRequest = {
            left_bible_uuid: leftBible.uuid,
            right_bible_uuid: rightBible.uuid,
            left_book_uuid: leftBook.uuid,
            right_book_uuid: rightBook.uuid,
            chapter,
            left_verses: this.versesLeft().map((v) => ({ ordinal: v.ordinal, text: v.text })),
            right_verses: this.versesRight().map((v) => ({ ordinal: v.ordinal, text: v.text }))
        };

        this.aiRunSub?.unsubscribe();
        this.aiCommentaryLoading.set(true);
        this.aiCommentaryError.set('');
        this.aiCommentaryStatus.set('Requesting AI analysis...');
        this.aiCommentaryByOrdinal.set({});
        this.expandedVerseOrdinals.set({});

        this.aiRunSub = this.verseService.streamComparatorAiCommentary(payload).subscribe({
            next: (msg) => this.onAiSse(msg),
            error: (err: Error) => {
                this.aiCommentaryLoading.set(false);
                this.aiCommentaryError.set(err?.message ?? 'AI commentary request failed.');
            },
            complete: () => this.aiCommentaryLoading.set(false)
        });
    }

    toggleVerseDetails(ordinal: number) {
        this.expandedVerseOrdinals.update((state) => ({ ...state, [ordinal]: !state[ordinal] }));
    }

    isVerseDetailsOpen(ordinal: number): boolean {
        return !!this.expandedVerseOrdinals()[ordinal];
    }

    private onAiSse(msg: ComparatorAiSseMessage) {
        if (msg.event === 'status') {
            const status = msg.data['message'];
            if (typeof status === 'string' && status.trim().length > 0) {
                this.aiCommentaryStatus.set(status);
            }
            return;
        }

        if (msg.event === 'verse') {
            const parsed = this.parseVerseCommentary(msg.data);
            if (!parsed) return;
            this.aiCommentaryByOrdinal.update((current) => ({ ...current, [parsed.ordinal]: parsed }));
            return;
        }

        if (msg.event === 'error') {
            const errorMessage = msg.data['error'];
            if (typeof errorMessage === 'string' && errorMessage.length > 0) {
                this.aiCommentaryError.set(errorMessage);
            } else {
                this.aiCommentaryError.set('AI commentary failed.');
            }
            return;
        }

        if (msg.event === 'complete') {
            this.aiCommentaryStatus.set('AI commentary ready.');
        }
    }

    private parseVerseCommentary(data: Record<string, unknown>): ComparatorAiVerseCommentary | null {
        const ordinalRaw = data['ordinal'];
        const ordinal = typeof ordinalRaw === 'number' ? ordinalRaw : Number(ordinalRaw);
        if (!Number.isFinite(ordinal)) return null;

        const commentary = data['commentary'];
        return {
            ordinal,
            commentary: typeof commentary === 'string' ? commentary : '',
            linguistic_notes: this.stringOrUndefined(data['linguistic_notes']),
            translation_issues: this.stringOrUndefined(data['translation_issues']),
            cultural_context: this.stringOrUndefined(data['cultural_context']),
            anthropological_context: this.stringOrUndefined(data['anthropological_context']),
            translation_lens: this.stringOrUndefined(data['translation_lens']),
            grammar_notes: this.stringOrUndefined(data['grammar_notes']),
            idiom_notes: this.stringArrayOrUndefined(data['idiom_notes']),
            interlinear_tokens: this.parseInterlinearTokens(data['interlinear_tokens'])
        };
    }

    private parseInterlinearTokens(raw: unknown): ComparatorAiVerseCommentary['interlinear_tokens'] {
        if (!Array.isArray(raw)) return undefined;
        const tokens = raw
            .map((item) => {
                if (!item || typeof item !== 'object') return null;
                const token = this.stringOrUndefined((item as Record<string, unknown>)['token']);
                if (!token) return null;
                const confidenceRaw = (item as Record<string, unknown>)['confidence'];
                const confidence = typeof confidenceRaw === 'number' ? confidenceRaw : Number(confidenceRaw);
                return {
                    token,
                    transliteration: this.stringOrUndefined((item as Record<string, unknown>)['transliteration']),
                    lemma: this.stringOrUndefined((item as Record<string, unknown>)['lemma']),
                    morphology: this.stringOrUndefined((item as Record<string, unknown>)['morphology']),
                    gloss: this.stringOrUndefined((item as Record<string, unknown>)['gloss']),
                    confidence: Number.isFinite(confidence) ? confidence : undefined,
                    ambiguity_note: this.stringOrUndefined((item as Record<string, unknown>)['ambiguity_note'])
                };
            })
            .filter((v): v is NonNullable<typeof v> => !!v);
        return tokens.length > 0 ? tokens : undefined;
    }

    private stringOrUndefined(value: unknown): string | undefined {
        return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
    }

    private stringArrayOrUndefined(value: unknown): string[] | undefined {
        if (!Array.isArray(value)) return undefined;
        const list = value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
        return list.length > 0 ? list : undefined;
    }

    private resetAiCommentaryState() {
        this.aiRunSub?.unsubscribe();
        this.aiCommentaryLoading.set(false);
        this.aiCommentaryError.set('');
        this.aiCommentaryStatus.set('');
        this.aiCommentaryByOrdinal.set({});
        this.expandedVerseOrdinals.set({});
    }

    ngOnDestroy(): void {
        this.aiRunSub?.unsubscribe();
    }

}
