import {Component, ChangeDetectionStrategy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
    selector: 'app',
    templateUrl: 'app.html',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

    constructor() {
        console.log("AppComponent has been initialized.");
    }

}
