// Author: Preston Lee

import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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

    verses = signal<Verse[]>([]);

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
    }

    selectChapter(n: number) {
        this.chapter.set(n);
        const bible = this.bible();
        const book = this.book();
        if (bible && book) {
            this.verseService.index(bible, book, n).subscribe((d: Verse[]) => {
                this.verses.set(d);
            });
        }
    }
}
