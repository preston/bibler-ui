// Author: Preston Lee

import { Component, signal, computed, effect } from '@angular/core';
import { BookBasedComponent } from './bookBased.component';
import { Verse } from '../models/verse';
import { Bible } from '../models/bible';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'comparator',
    templateUrl: 'comparator.html',
    standalone: true,
    imports: [FormsModule]
})
export class ComparatorComponent extends BookBasedComponent {

    selectedBibleRightSlug = signal<string | null>(null);
    bibleRight = computed(() => {
        const slug = this.selectedBibleRightSlug();
        if (!slug) return null;
        return this.bibleForSlug(slug);
    });

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
    }

    override afterBibleLoad() {
        super.afterBibleLoad();
        const bibles = this.bibles();
        if (!this.selectedBibleRightSlug() && bibles.length > 1) {
            this.selectBibleRight(bibles[1].slug);
        }
    }

    selectChapterString(s: string) {
        this.selectChapter(parseInt(s));
    }
    
    selectChapter(n: number) {
        console.log("Updating verses for chapter " + n);
        this.chapter.set(n);
        const bible = this.bible();
        const bibleRight = this.bibleRight();
        const book = this.book();
        if (bible && bibleRight && book) {
            this.verseService.index(bible, book, n).subscribe((left: Verse[]) => {
                this.versesLeft.set(left);
                if (bibleRight && book && n !== null) {
                    this.verseService.index(bibleRight, book, n).subscribe((right: Verse[]) => {
                        this.versesRight.set(right);
                    });
                }
            });
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
        this.afterBibleSelect();
    }

}
