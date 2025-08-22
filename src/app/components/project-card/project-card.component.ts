import {Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Project} from '../../data/project.interface';


@Component({
  selector: 'app-project-card',
  imports: [DatePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Input() canModify = false;
}
