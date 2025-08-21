import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {NgClass} from '@angular/common';
import {AuthService} from './services/auth.service';
import {RegisterComponent} from './components/register/register.component';
import {LoginComponent} from './components/login/login.component';
import { Dialog } from '@angular/cdk/dialog';
import {of, switchMap} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  router = inject(Router)
  authService = inject(AuthService);
  private dialog = inject(Dialog);

  ngOnInit() {
    this.authService.user$
      .pipe(
        switchMap(u => {
          if (!u) return of(null);
          return this.authService.userDoc$(u.uid);
        })
      )
      .subscribe(userDoc => {
        if (userDoc) {
          this.authService.currentUserSig.set({
            email: userDoc.email,
            username: userDoc.username
          });
        } else {
          this.authService.currentUserSig.set(null);
        }
      });
  }

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

  logOut() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

}
