import {Component, Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {BiblerService} from './bibler.service';

@Injectable()
@Component({
    providers: [Http, BiblerService]
})
export class SearchService {

    // private verses;

    constructor(private biblerService: BiblerService, private http: Http) {
    }

    search(bible, searchText) {
		// console.log("Search " + bible + " for " + searchText);
        var url = this.biblerService.getUrl() + '/' + bible + '/search.json';
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');

		var args = "text=" + searchText;
        return this.http.post(url, args, {headers: headers}).toPromise().then(res => res.json());
    }

}
