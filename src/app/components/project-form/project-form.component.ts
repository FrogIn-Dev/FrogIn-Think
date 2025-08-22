import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule, DialogRef } from '@angular/cdk/dialog';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule, DialogModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);

  dialogRef = inject<DialogRef<boolean> | null>(DialogRef, { optional: true });
  errorMessage: string | null = null;
  isSubmitting = false;

  projectForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(25)]]
    // done et collab n’est pas dans le form à la création, on mettra false dans le service
  });

  async onSubmit() {
    if (this.projectForm.invalid || this.isSubmitting) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

    try {
      // 1) user courant
      const firebaseUser = await firstValueFrom(this.authService.user$);
      if (!firebaseUser) throw new Error('You need to be logged in.');

      // 2) data form
      const {title} = this.projectForm.getRawValue();

      // 3) création Firestore
      const projectId = await this.projectService.createProject({
        ownerUid: firebaseUser.uid!,
        title
      });

      // 4) fermer la modale et, si tu veux, naviguer
      this.dialogRef?.close(true);
      // await this.router.navigate(['/projects', projectId]);
    } catch (e: any) {
      this.errorMessage = e?.message ?? 'Unable to create project.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
