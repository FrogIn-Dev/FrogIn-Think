import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  Validators,
  ValidatorFn,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DialogRef, DialogModule } from '@angular/cdk/dialog';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[&!\.\-\+\*]).{8,}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DialogModule ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  dialogRef = inject<DialogRef<boolean> | null>(DialogRef, { optional: true });

  registerForm = this.fb.nonNullable.group(
    {
      username: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(5),
      ]),
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
      ]),
      confirmedEmail: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(PASSWORD_REGEX),
      ]),
      confirmedPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    },
    { validators: [emailsMatchValidator(), passwordsMatchValidator()] }
  );

  // Getters fortement typés (simplifient le template)
  get usernameCtrl() { return this.registerForm.controls.username; }
  get emailCtrl() { return this.registerForm.controls.email; }
  get confirmedEmailCtrl() { return this.registerForm.controls.confirmedEmail; }
  get passwordCtrl() { return this.registerForm.controls.password; }
  get confirmedPasswordCtrl() { return this.registerForm.controls.confirmedPassword; }

  errorMessage: string | null = null;

  onSubmit() {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }

    const raw = this.registerForm.getRawValue();
    const username = (raw.username ?? '').trim();
    const email = (raw.email ?? '').trim().toLowerCase();
    const password = (raw.password ?? '').trim();

    this.authService.register(username, email, password).subscribe({
      next: () => { this.dialogRef?.close(true); /* ... */ },
      error: (err) => { this.errorMessage = err?.message ?? 'Registration failed'; }
    });
  }

}

/* ---- Validateurs cross-field ---- */
function emailsMatchValidator(): ValidatorFn {
  return (group: AbstractControl) => {
    const email = group.get('email')?.value;
    const confirmed = group.get('confirmedEmail')?.value;
    return email && confirmed && email === confirmed ? null : { emailsNotMatch: true };
  };
}

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl) => {
    const pwd = group.get('password')?.value;
    const confirmed = group.get('confirmedPassword')?.value;
    return pwd && confirmed && pwd === confirmed ? null : { passwordsNotMatch: true };
  };
}
