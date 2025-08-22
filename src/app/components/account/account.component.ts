import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { switchMap, of } from 'rxjs';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import {ActivatedRoute} from '@angular/router';
import {mapFirebaseError} from '../../utils/firebase-errors';
import {NotConnectedComponent} from '../not-connected/not-connected.component';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[&!\.\-\+\*]).{8,}$/;

function emailsMatch(): ValidatorFn {
  return (group: AbstractControl) => {
    const e = group.get('email')?.value?.trim().toLowerCase();
    const c = group.get('confirmEmail')?.value?.trim().toLowerCase();
    return e && c && e === c ? null : { emailsNotMatch: true };
  };
}
function passwordsMatch(): ValidatorFn {
  return (group: AbstractControl) => {
    const p = group.get('newPassword')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p === c ? null : { passwordsNotMatch: true };
  };
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotConnectedComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  uid: string | null = null;

  usernameForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(5)]]
  });

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    confirmEmail: ['', [Validators.required, Validators.email]],
    currentPassword: ['', [Validators.required]]
  }, { validators: [emailsMatch()] });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_REGEX)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: [passwordsMatch()] });

  // messages d’état
  usernameMsg: string | null = null;
  emailMsg: string | null = null;
  passwordMsg: string | null = null;
  pendingEmail: string | null = null;

  constructor(
    // ...
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.user$
      .pipe(
        switchMap(u => {
          if (!u) return of(null);
          this.uid = u.uid;
          return this.authService.userDoc$(u.uid);
        })
      )
      .subscribe(doc => {
        if (!doc) return;
      });

    this.route.queryParamMap.subscribe(async (params) => {
      if (params.get('changedEmail') === '1') {
        await this.authService.refreshCurrentUser();
        this.pendingEmail = null;
        this.emailForm.markAsPristine();
      }
    });
  }


  saveUsername() {
    this.usernameMsg = null;
    if (this.usernameForm.invalid || !this.uid) { this.usernameForm.markAllAsTouched(); return; }
    const { username } = this.usernameForm.getRawValue();
    this.authService.updateUsername(this.uid, username.trim()).subscribe({
      next: () => this.usernameMsg = 'Username updated 🎉',
      error: (err) => this.usernameMsg = mapFirebaseError(err)
    });
  }

  saveEmail() {
    this.emailMsg = null;
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }

    const { email, currentPassword } = this.emailForm.getRawValue();
    const target = email.trim().toLowerCase();

    this.pendingEmail = target;

    this.authService.changeEmail(target, currentPassword).subscribe({
      next: () => this.emailMsg = `A verification email has been sent to ${target}. Click the link to complete the process.`,
      error: (err) => {
        this.pendingEmail = null;
        this.emailMsg = mapFirebaseError(err);
      }
    });
  }

  savePassword() {
    this.passwordMsg = null;
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.authService.changePassword(newPassword, currentPassword).subscribe({
      next: () => {
        this.passwordMsg = 'Password updated 🎉';
        this.passwordForm.reset();
      },
      error: (err) => this.passwordMsg = mapFirebaseError(err)
    });
  }

  // account.component.ts (ajoute ce form + état)
  deleteForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]]
  });
  deleteMsg: string | null = null;
  deleting = false;

  deleteAccount() {
    this.deleteMsg = null;
    if (this.deleteForm.invalid) { this.deleteForm.markAllAsTouched(); return; }

    const { currentPassword } = this.deleteForm.getRawValue();

    const sure = confirm('This will permanently delete your account. Continue?');
    if (!sure) return;

    this.deleting = true;
    this.authService.deleteAccount(currentPassword).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteMsg = 'Your account has been deleted. 👋';
      },
      error: (err) => {
        this.deleting = false;
        this.deleteMsg = mapFirebaseError(err)
      }
    });
  }

}
