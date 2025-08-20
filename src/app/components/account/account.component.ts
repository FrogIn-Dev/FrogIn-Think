import { Component, inject } from '@angular/core';
import {LoginComponent} from '../login/login.component';
import {RegisterComponent} from '../register/register.component';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-account',
  imports: [
    LoginComponent,
    RegisterComponent
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
  isConnected = false;
  authService = inject(AuthService);
}
