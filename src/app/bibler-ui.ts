import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {CliRouteConfig} from './route-config';

import {ReaderComponent} from './components/reader.component';
import {ComparatorComponent} from './components/comparator.component';
import {SearchComponent} from './components/search.component';

@Component({
    selector: 'bibler-ui-app',
    providers: [ROUTER_PROVIDERS],
    templateUrl: 'app/bibler-ui.html',
    directives: [ROUTER_DIRECTIVES, ReaderComponent, ComparatorComponent, SearchComponent],
    pipes: [],
    styleUrls: [
        'app/bibler-ui.css'
        //   'app/bibler-ui.css'
    ]
})
// @RouteConfig([
// ].concat(CliRouteConfig))

export class BiblerUiApp {

    tab: string = 'reader';

    // defaultMeaning: number = 42;
    //
    // meaningOfLife(meaning?: number) {
    //     return `The meaning of life is ${meaning || this.defaultMeaning}`;
    // }
}
