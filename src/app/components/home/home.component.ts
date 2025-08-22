import {Component, inject} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {RouterLink} from '@angular/router';
import {LoginComponent} from '../login/login.component';
import {RegisterComponent} from '../register/register.component';
import { Dialog } from '@angular/cdk/dialog';
import {AsyncPipe} from '@angular/common';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {filter, switchMap} from 'rxjs/operators';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    AsyncPipe,
    ProjectCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);
  private dialog = inject(Dialog);
  private projects = inject(ProjectService);

  openLogin() {
    this.dialog.open(LoginComponent, {
      panelClass: 'auth-dialog',
      backdropClass: 'auth-backdrop',
      disableClose: false,
    });
  }

  openRegister() {
    this.dialog.open(RegisterComponent, {
      panelClass: 'auth-dialog',
      backdropClass: 'auth-backdrop',
      disableClose: false
    });
  }

  projects$ = this.authService.user$.pipe(
    filter(u => !!u),
    switchMap(u => this.projects.userProjects$(u!.uid))
  );
}
