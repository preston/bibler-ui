// Author: Preston Lee

import { Component, signal, computed, effect } from '@angular/core';
import { BookBasedComponent } from './bookBased.component';
import { Verse } from '../models/verse';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'reader',
    templateUrl: 'reader.html',
    standalone: true,
    imports: [FormsModule]
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
        console.log("ReaderComponent created!");
    }

    selectChapter(n: number) {
        console.log("Updating verses for chapter " + n);
        this.chapter.set(n);
        const bible = this.bible();
        const book = this.book();
        if (bible && book) {
            this.verseService.index(bible, book, n).subscribe((d: Verse[]) => {
                this.verses.set(d);
            });
        }
    }

    updateHighlights() {
        console.log("Updating highlights...");
        // Highlights are now computed automatically via highlightedVerses
    }

}
