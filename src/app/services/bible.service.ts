import {Component, Injectable} from 'angular2/core';
import {Http} from 'angular2/http';

import {BookService} from './book.service';

@Injectable()
@Component({
	providers: [Http]
})
export class BibleService {

	bibles = [
		{"id":1,"name":"American Standard-ASV1901","abbreviation":"ASV","slug":"american-standard-asv1901"},
		{"id":2,"name":"Bible in Basic English","abbreviation":"BBE","slug":"bible-in-basic-english"}];

	constructor(private bookService: BookService, private http: Http) {

	}

	getBibles() : Object[] {
		var url = 'http://bibler.prestonlee.com/bibles.json'
		// var result = this.http.get(url);
		// console.log(result);
		return this.bibles;
	}

}
