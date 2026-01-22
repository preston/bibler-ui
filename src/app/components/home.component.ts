// Author: Preston Lee

import { Component } from '@angular/core';

@Component({
    selector: 'home',
    templateUrl: 'home.html',
    standalone: true,
    imports: []
})
export class HomeComponent {

    constructor() {
        console.log("HomeComponent has been initialized.");
    }

}
