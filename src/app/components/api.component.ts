import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { BookBasedComponent } from './bookBased.component';
import { Verse } from '../models/verse';

@Component({
    selector: 'api',
    templateUrl: 'api.html',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiComponent extends BookBasedComponent {

    verses = signal<Verse[]>([]);

    constructor() {
        super();
        console.log("ApiComponent has been initialized.");
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

    stringify(obj: any): string {
        return JSON.stringify(obj, null, "\t").trim();
    }

}
