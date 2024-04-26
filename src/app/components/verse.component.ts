// Author: Preston Lee

import {Component} from '@angular/core';

@Component({
    selector: 'bibler-verse',
    templateUrl: 'verse.html',
    standalone: true
})
export class VerseComponent {

	constructor() {
		console.log("VerseComponent has been initialized.");
	}
}
