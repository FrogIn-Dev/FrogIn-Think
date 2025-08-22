import {Component, inject} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {LoginComponent} from '../login/login.component';
import {RegisterComponent} from '../register/register.component';

@Component({
  selector: 'app-not-connected',
  imports: [
    LoginComponent,
    RegisterComponent
  ],
  templateUrl: './not-connected.component.html',
  styleUrl: './not-connected.component.css'
})
export class NotConnectedComponent {
  authService= inject(AuthService);
}
