import {Component, inject} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {RouterLink} from '@angular/router';
import {LoginComponent} from '../login/login.component';
import {RegisterComponent} from '../register/register.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);
  private dialog = inject(Dialog);

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
}
