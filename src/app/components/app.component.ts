import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';

@Component({
    selector: 'app',
    templateUrl: 'app.html',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent]
})
export class AppComponent {

    constructor() {
        console.log("AppComponent has been initialized.");
    }

}
