import {Component} from 'angular2/core';
// import {RouteConfig} from 'angular2/router';
import {RouteConfig, Route, ROUTER_DIRECTIVES} from 'angular2/router';

import {HomeComponent} from './components/home.component';
import {ApiComponent} from './components/api.component';

@Component({
    selector: 'bibler-ui-app',
    templateUrl: 'app/bibler-ui.html',
    directives: [ROUTER_DIRECTIVES],
    // directives: [RouterOutlet],
    pipes: [],
    styleUrls: [
        // 'app/bibler-ui.css'
    ]
})
@RouteConfig([
    new Route({path: '/home', name: 'Home', component: HomeComponent, useAsDefault: true}),
    new Route({path: '/api', name: 'Api', component: ApiComponent})
    // new Route({path: '/*', name: 'Other', redirectTo: ['Home']})
])
export class BiblerUiApp {
}
