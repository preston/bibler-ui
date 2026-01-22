// Author: Preston Lee

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: 'footer.html',
    standalone: true,
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {

    constructor() {
        console.log("FooterComponent has been initialized.");
    }

}
