import {Component, ChangeDetectionStrategy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';

@Component({
    selector: 'app',
    templateUrl: 'app.html',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

    constructor() {
        console.log("AppComponent has been initialized.");
    }

}
