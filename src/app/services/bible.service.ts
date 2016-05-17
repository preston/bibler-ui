import {Component, Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import {BiblerService} from './bibler.service';

@Injectable()
@Component({
	providers: [Http, BiblerService]
})
export class BibleService {

	private path = '/bibles.json';
	private bibles;

	// bibles = [
	// 	{"id":1,"name":"American Standard-ASV1901","abbreviation":"ASV","slug":"american-standard-asv1901"},
	// 	{"id":2,"name":"Bible in Basic English","abbreviation":"BBE","slug":"bible-in-basic-english"}];

	constructor(private biblerService: BiblerService, private http: Http) {
	}

	index() {
		var url = this.biblerService.getUrl() + this.path;
		return this.http.get(url).map(res => res.json());
	}

}
