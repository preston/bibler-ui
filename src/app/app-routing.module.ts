// Author: Preston Lee

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiComponent } from './components/api.component';
import { ReaderComponent } from './components/reader.component';
import { ComparatorComponent } from './components/comparator.component';
import { SearchComponent } from './components/search.component';
import { StudiesListComponent } from './components/studies-list.component';
import { StudyDetailComponent } from './components/study-detail.component';
import { StudyDetailDetailsComponent } from './components/study-detail-details.component';
import { StudyDetailAiComponent } from './components/study-detail-ai.component';
import { StudyPlanEmptyComponent } from './components/study-plan-empty.component';
import { StudyPlanCommentaryComponent } from './components/study-plan-commentary.component';
import { StudyPlanVerseComponent } from './components/study-plan-verse.component';
import { StudyPlanQuestionComponent } from './components/study-plan-question.component';
import { StudyPlanTaskComponent } from './components/study-plan-task.component';
import { StudyPlanBlankComponent } from './components/study-plan-blank.component';
import { StudyPlanWorshipComponent } from './components/study-plan-worship.component';
import { SettingsShellComponent } from './components/settings-shell.component';
import { SettingsAccessComponent } from './components/settings-access.component';
import { SettingsAiComponent } from './components/settings-ai.component';
import { SettingsStudiesComponent } from './components/settings-studies.component';
import { SettingsRolesComponent } from './components/settings-roles.component';
import { SettingsUsersComponent } from './components/settings-users.component';
import { LoginComponent } from './components/login.component';
import {
  guestOnlyRoute,
  requireAccessRoute,
  requireBiblesRoute,
  requireCurationRoute,
  requireSignedInRoute,
  studyDetailsEditorRoute
} from './guards/auth.guards';

const routes: Routes = [
    { path: '', redirectTo: '/studies', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [guestOnlyRoute] },
    { path: 'studies', component: StudiesListComponent },
    {
      path: 'studies/:uuid',
      component: StudyDetailComponent,
      children: [
        { path: 'details', component: StudyDetailDetailsComponent, canActivate: [studyDetailsEditorRoute] },
        { path: 'ai', component: StudyDetailAiComponent, canActivate: [studyDetailsEditorRoute] },
        { path: 'step/:planItemUuid/commentary', component: StudyPlanCommentaryComponent },
        { path: 'step/:planItemUuid/verse', component: StudyPlanVerseComponent },
        { path: 'step/:planItemUuid/question', component: StudyPlanQuestionComponent },
        { path: 'step/:planItemUuid/task', component: StudyPlanTaskComponent },
        { path: 'step/:planItemUuid/custom', component: StudyPlanBlankComponent },
        { path: 'step/:planItemUuid/worship', component: StudyPlanWorshipComponent },
        { path: '', pathMatch: 'full', component: StudyPlanEmptyComponent }
      ]
    },
    { path: 'reader', component: ReaderComponent },
    { path: 'comparator', component: ComparatorComponent },
    { path: 'search', component: SearchComponent },
    { path: 'api', component: ApiComponent },
    {
      path: 'settings',
      component: SettingsShellComponent,
      children: [
        { path: '', redirectTo: 'access', pathMatch: 'full' },
        { path: 'access', component: SettingsAccessComponent },
        {
          path: 'ai',
          component: SettingsAiComponent,
          canActivate: [requireSignedInRoute, requireBiblesRoute]
        },
        {
          path: 'studies',
          component: SettingsStudiesComponent,
          canActivate: [requireSignedInRoute, requireCurationRoute]
        },
        {
          path: 'roles',
          component: SettingsRolesComponent,
          canActivate: [requireSignedInRoute, requireAccessRoute]
        },
        {
          path: 'users',
          component: SettingsUsersComponent,
          canActivate: [requireSignedInRoute, requireAccessRoute]
        }
      ]
    }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
