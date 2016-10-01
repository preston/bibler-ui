import {Component, OnInit, Injectable} from '@angular/core';
import {Http} from '@angular/http';
// import 'rxjs/add/operator/map';


import {BiblerService} from './bibler.service';

@Injectable()
@Component({
	providers: [BiblerService, Http]
})
export class TestamentService implements OnInit {

	private path = '/testaments';
	private testaments;

	constructor(private biblerService: BiblerService, private http: Http) {
	}

	ngOnInit() {
	}

	index() {
		var url = this.biblerService.getUrl() + this.path + '.json';
		// console.log('URL: ' + url);
		this.testaments = this.http.get(url).map(res => res.json());
		return this.testaments;
	}

}
