// Author: Preston Lee

import {Component} from '@angular/core';

@Component({
	selector: 'bibler-verse',
	templateUrl: 'verse.html'
	// providers: [BiblerService, BibleService]
})
export class VerseComponent {

	constructor() {
		console.log("VerseComponent has been initialized.");
	}
}
