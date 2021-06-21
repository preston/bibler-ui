import { Component } from '@angular/core';

@Component({
    selector: 'home',
    templateUrl: 'home.html'
})
export class HomeComponent {

    tab: string = 'reader';

    constructor() {
        console.log("HomeComponent has been initialized.");
    }

}
