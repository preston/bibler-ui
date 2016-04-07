import {Component, Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';

import {BiblerService} from './bibler.service';

@Injectable()
@Component({
	providers: [Http, BiblerService]
})
export class BookService {

	private path = '/books';


	constructor(private biblerService: BiblerService, private http: Http) {
	}

	index() {
		var url = this.biblerService.getUrl() + this.path + '.json';
		return this.http.get(url).map(res => res.json());
	}

	chaptersFor(bible: Object, book: Object) {
		var url = this.biblerService.getUrl() + '/' + bible['slug'] + '/' + book['slug'] + '.json';
		return this.http.get(url).map(res => res.json());
	}

}
