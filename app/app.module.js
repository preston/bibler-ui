"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var api_component_1 = require('./components/api.component');
var app_component_1 = require('./components/app.component');
var comparator_component_1 = require('./components/comparator.component');
var home_component_1 = require('./components/home.component');
var reader_component_1 = require('./components/reader.component');
var search_component_1 = require('./components/search.component');
var verse_component_1 = require('./components/verse.component');
var bibler_service_1 = require('./services/bibler.service');
var bible_service_1 = require('./services/bible.service');
var book_service_1 = require('./services/book.service');
var search_service_1 = require('./services/search.service');
var testament_service_1 = require('./services/testament.service');
var verse_service_1 = require('./services/verse.service');
core_1.enableProdMode();
var core_2 = require('@angular/core');
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
var http_1 = require('@angular/http');
var appRoutes = [
    { path: '', component: home_component_1.HomeComponent },
    { path: 'api', component: api_component_1.ApiComponent }
];
var appRoutingProviders = [];
var routing = router_1.RouterModule.forRoot(appRoutes);
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_2.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                routing,
                forms_1.FormsModule,
                http_1.HttpModule
            ],
            declarations: [
                api_component_1.ApiComponent,
                app_component_1.AppComponent,
                home_component_1.HomeComponent,
                comparator_component_1.ComparatorComponent,
                reader_component_1.ReaderComponent,
                search_component_1.SearchComponent,
                verse_component_1.VerseComponent
            ],
            providers: [
                appRoutingProviders,
                bibler_service_1.BiblerService,
                bible_service_1.BibleService,
                book_service_1.BookService,
                search_service_1.SearchService,
                testament_service_1.TestamentService,
                verse_service_1.VerseService
            ],
            bootstrap: [app_component_1.AppComponent] // root component
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map