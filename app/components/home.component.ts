import {Component} from '@angular/core';

import {ReaderComponent} from './reader.component';
import {ComparatorComponent} from './comparator.component';
import {SearchComponent} from './search.component';


@Component({
    selector: 'home',
    templateUrl: 'app/components/home.html'
})
export class HomeComponent {

	tab: string = 'reader';

    constructor() {
        console.log("HomeComponent has been initialized.");
    }

}
