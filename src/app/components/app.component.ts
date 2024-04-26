import {Component} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app',
    templateUrl: 'app.html',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class AppComponent {

    constructor() {
        console.log("AppComponent has been initialized.");
    }

}
