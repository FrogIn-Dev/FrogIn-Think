import {Component, inject} from '@angular/core';
import {ProjectFormComponent} from "../project-form/project-form.component";
import {AuthService} from '../../services/auth.service';
import {ProjectService} from '../../services/project.service';
import {NotConnectedComponent} from '../not-connected/not-connected.component';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {Dialog} from '@angular/cdk/dialog';
import { filter, switchMap } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common'

@Component({
  selector: 'app-projects',
  imports: [
    NotConnectedComponent,
    ProjectCardComponent,
    AsyncPipe
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  authService = inject(AuthService);
  private dialog = inject(Dialog);
  private projects = inject(ProjectService);

  openProjectCreation(): void {
    this.dialog.open(ProjectFormComponent, {
      panelClass: 'auth-dialog',
      backdropClass: 'auth-backdrop',
      disableClose: false,
    });

  }

  projects$ = this.authService.user$.pipe(
    filter(u => !!u),
    switchMap(u => this.projects.userProjects$(u!.uid))
  );

  async rename(id: string) {
    const t = prompt('Nouveau titre ?');
    if (t) await this.projects.renameProject(id, t);
  }

  async markDone(id: string, done: boolean) {
    await this.projects.setDone(id, done);
  }

  async remove(id: string) {
    if (confirm('Supprimer ce projet ?')) await this.projects.deleteProject(id);
  }
}
