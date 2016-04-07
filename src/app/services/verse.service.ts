import {Component, Injectable} from 'angular2/core'
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';

import {BiblerService} from './bibler.service';

@Injectable()
@Component({
	providers: [Http, BiblerService]
})
export class VerseService {

	constructor(private biblerService: BiblerService, private http: Http) {
	}

	index(bible: Object, book: Object, chapter: number) {
		var url = this.biblerService.getUrl() + '/' + bible['slug'] + '/' + book['slug'] + '/' + chapter;
		return this.http.get(url).map(res => res.json());
	}

}
