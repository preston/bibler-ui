// Author: Preston Lee

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudyPlanItemEditorComponent } from './study-plan-item-editor.component';
import { StudyPlanWorkspaceBaseComponent } from './study-plan-workspace-base.component';

@Component({
  selector: 'app-study-plan-task',
  templateUrl: './study-plan-task.html',
  standalone: true,
  imports: [CommonModule, FormsModule, StudyPlanItemEditorComponent]
})
export class StudyPlanTaskComponent extends StudyPlanWorkspaceBaseComponent {}
