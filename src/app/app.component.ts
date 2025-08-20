import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {NgClass} from '@angular/common';
import {AuthService} from './services/auth.service';
import {RegisterComponent} from './components/register/register.component';
import {LoginComponent} from './components/login/login.component';
import { Dialog } from '@angular/cdk/dialog';

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
    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username :user.displayName!
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    })
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
