import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {DialogRef, DialogModule} from '@angular/cdk/dialog';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    DialogModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService= inject(AuthService);

  dialogRef = inject<DialogRef<boolean> | null>(DialogRef, { optional: true });
  errorMessage:string | null = null;

  logginForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  })

  onSubmit(): void {
    if (this.logginForm.invalid) {
      this.logginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.logginForm.getRawValue();
    this.authService.login(email, password).subscribe({
      next: () => {
        this.dialogRef?.close(true);
        this.router.navigateByUrl('/');
      },
      error: (err) => (this.errorMessage = err?.message ?? 'login failed'),
    });
  }
}
