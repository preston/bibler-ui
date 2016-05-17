/// <reference path="../typings/index.d.ts" />

import 'core-js';
require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
import 'reflect-metadata'

import {bootstrap} from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS} from '@angular/http';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {ROUTER_PROVIDERS} from '@angular/router';
import {enableProdMode, provide} from '@angular/core';
import {APP_BASE_HREF} from '@angular/common';

// Custom app stuff.
import {BiblerUiApp} from './app/bibler-ui';
enableProdMode();
bootstrap(BiblerUiApp, [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy}),
    provide(APP_BASE_HREF, {useValue: '/'})
]).catch(err => console.error(err));
