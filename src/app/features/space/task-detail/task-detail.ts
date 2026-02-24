import { Component, inject, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { DEFAULT_STATUSES, PRIORITY_CONFIG, Priority } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-detail',
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatInputModule, MatCheckboxModule, MatChipsModule, DatePipe, FormsModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss',
})
export class TaskDetailComponent {
  protected readonly ws = inject(WorkspaceService);
  protected readonly PRIORITY_CONFIG = PRIORITY_CONFIG;
  protected readonly DEFAULT_STATUSES = DEFAULT_STATUSES;
  protected readonly priorities: Priority[] = ['urgent', 'high', 'normal', 'low'];

  protected readonly task = computed(() => {
    const id = this.ws.selectedTaskId();
    return id ? this.ws.getTaskById(id) : null;
  });

  protected readonly newComment = signal('');
  protected readonly editingName = signal(false);
  protected readonly editedName = signal('');
  protected readonly activeTab = signal<'subtasks' | 'comments' | 'activity'>('subtasks');
  protected readonly newSubtaskName = signal('');

  protected close(): void {
    this.ws.selectTask(null);
  }

  protected startEditName(): void {
    const t = this.task();
    if (t) {
      this.editedName.set(t.name);
      this.editingName.set(true);
    }
  }

  protected saveEditName(): void {
    const name = this.editedName().trim();
    const t = this.task();
    if (name && t) {
      this.ws.updateTask(t.id, { name });
    }
    this.editingName.set(false);
  }

  protected setStatus(statusId: string): void {
    const status = DEFAULT_STATUSES.find(s => s.id === statusId);
    const t = this.task();
    if (status && t) this.ws.updateTask(t.id, { status });
  }

  protected setPriority(priority: Priority): void {
    const t = this.task();
    if (t) this.ws.updateTask(t.id, { priority });
  }

  protected toggleSubtask(subtaskId: string): void {
    const t = this.task();
    if (!t) return;
    const subtasks = t.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    this.ws.updateTask(t.id, { subtasks });
  }

  protected addSubtask(): void {
    const name = this.newSubtaskName().trim();
    const t = this.task();
    if (!name || !t) return;
    const subtasks = [...t.subtasks, { id: `st-${Date.now()}`, name, completed: false }];
    this.ws.updateTask(t.id, { subtasks });
    this.newSubtaskName.set('');
  }

  protected submitComment(): void {
    const text = this.newComment().trim();
    const t = this.task();
    if (!text || !t) return;
    const comment = {
      id: `c-${Date.now()}`,
      text,
      author: this.ws.currentUser(),
      createdAt: new Date(),
    };
    this.ws.updateTask(t.id, { comments: [...t.comments, comment] });
    this.newComment.set('');
  }

  protected getSubtaskProgress(): number {
    const t = this.task();
    if (!t || t.subtasks.length === 0) return 0;
    return Math.round((t.subtasks.filter(s => s.completed).length / t.subtasks.length) * 100);
  }
}
