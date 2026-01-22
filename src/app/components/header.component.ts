// Author: Preston Lee

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: 'header.html',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

    constructor() {
        console.log("HeaderComponent has been initialized.");
    }

}
