// Author: Preston Lee

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiComponent } from './components/api.component';
import { HomeComponent } from './components/home.component';
import { ReaderComponent } from './components/reader.component';
import { ComparatorComponent } from './components/comparator.component';
import { SearchComponent } from './components/search.component';

const routes: Routes = [
    { path: '', redirectTo: '/reader', pathMatch: 'full' },
    { path: 'reader', component: ReaderComponent },
    { path: 'comparator', component: ComparatorComponent },
    { path: 'search', component: SearchComponent },
    { path: 'api', component: ApiComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
