import {Component} from 'angular2/core';



import {ReaderComponent} from './reader.component';
import {ComparatorComponent} from './comparator.component';
import {SearchComponent} from './search.component';


@Component({
    selector: 'home',
    templateUrl: 'app/components/home.html',
    directives: [ReaderComponent, ComparatorComponent, SearchComponent]
})
export class HomeComponent {

	tab: string = 'reader';

    constructor() {
        console.log("HomeComponent has been initialized.");
    }

}
