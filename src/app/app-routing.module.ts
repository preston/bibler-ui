// Author: Preston Lee

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiComponent } from './components/api.component';
import { HomeComponent } from './components/home.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'api', component: ApiComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
