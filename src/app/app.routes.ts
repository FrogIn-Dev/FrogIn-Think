import { Routes } from '@angular/router';
import {ProjectsComponent} from './components/projects/projects.component';
import {AccountComponent} from './components/account/account.component';
import {TutorialComponent} from './components/tutorial/tutorial.component';

export const routes: Routes = [
  {path: 'tutorial', component: TutorialComponent},
  {path: 'projects', component: ProjectsComponent},
  {path: 'projects/:id', component: ProjectsComponent},
  {path: 'account', component: AccountComponent},
  {path:'account/login', component: AccountComponent},
  {path:'account/register', component: AccountComponent},
];
