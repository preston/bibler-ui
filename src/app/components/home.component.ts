// Author: Preston Lee

import { Component } from '@angular/core';
import { SearchComponent } from './search.component';
import { ComparatorComponent } from './comparator.component';
import { ReaderComponent } from './reader.component';

@Component({
    selector: 'home',
    templateUrl: 'home.html',
    standalone: true,
    imports: [ReaderComponent, ComparatorComponent, SearchComponent]
})
export class HomeComponent {

    tab: string = 'reader';

    constructor() {
        console.log("HomeComponent has been initialized.");
    }

}
