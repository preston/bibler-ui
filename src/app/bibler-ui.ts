import {Component} from '@angular/core';
import {Routes, Route, ROUTER_DIRECTIVES} from '@angular/router';

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
@Routes([
    {path: '/', component: HomeComponent},
    {path: '/api', component: ApiComponent}
])
export class BiblerUiApp {
}
