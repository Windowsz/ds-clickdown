import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { DatePipe, NgClass } from '@angular/common';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { Task, PRIORITY_CONFIG, DEFAULT_STATUSES } from '../../../core/models/task.model';

@Component({
  selector: 'app-list-view',
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatCheckboxModule, MatTooltipModule, MatInputModule, DatePipe, NgClass],
  templateUrl: './list-view.html',
  styleUrl: './list-view.scss',
})
export class ListViewComponent {
  protected readonly ws = inject(WorkspaceService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly PRIORITY_CONFIG = PRIORITY_CONFIG;
  protected readonly DEFAULT_STATUSES = DEFAULT_STATUSES;
  protected readonly today = new Date();

  protected readonly newTaskName = signal('');
  protected readonly addingTask = signal(false);
  protected readonly expandedGroups = signal<Set<string>>(new Set(['s-1', 's-2', 's-3', 's-4']));

  protected readonly list = computed(() => {
    const listId = this.ws.activeListId();
    return listId ? this.ws.getListById(listId) : null;
  });

  protected readonly tasksByStatus = computed(() => {
    const list = this.list();
    if (!list) return [];

    const statusMap = new Map<string, Task[]>();
    list.statuses.forEach(s => statusMap.set(s.id, []));

    list.tasks.forEach(t => {
      if (statusMap.has(t.status.id)) {
        statusMap.get(t.status.id)!.push(t);
      } else {
        statusMap.get('s-1')!.push(t);
      }
    });

    return list.statuses.map(status => ({
      status,
      tasks: statusMap.get(status.id) || [],
    }));
  });

  protected toggleGroup(statusId: string): void {
    this.expandedGroups.update(s => {
      const next = new Set(s);
      if (next.has(statusId)) next.delete(statusId); else next.add(statusId);
      return next;
    });
  }

  protected isGroupExpanded(statusId: string): boolean {
    return this.expandedGroups().has(statusId);
  }

  protected startAddTask(): void {
    this.addingTask.set(true);
  }

  protected cancelAddTask(): void {
    this.addingTask.set(false);
    this.newTaskName.set('');
  }

  protected submitNewTask(): void {
    const name = this.newTaskName().trim();
    const list = this.list();
    if (!name || !list) return;

    this.ws.addTask(list.id, {
      name,
      status: DEFAULT_STATUSES[0],
      priority: 'normal',
      assignees: [],
      subtasks: [],
      tags: [],
      comments: [],
      attachments: [],
      order: list.tasks.length,
      listId: list.id,
    });

    this.newTaskName.set('');
    this.addingTask.set(false);
  }

  protected markDone(task: Task, event: Event): void {
    event.stopPropagation();
    const isDone = task.status.type === 'done';
    this.ws.updateTask(task.id, {
      status: isDone ? DEFAULT_STATUSES[0] : DEFAULT_STATUSES[3],
    });
  }

  protected openTask(taskId: string): void {
    this.ws.selectTask(taskId);
  }

  protected isOverdue(task: Task): boolean {
    return !!task.dueDate && task.dueDate < this.today && task.status.type !== 'done' && task.status.type !== 'closed';
  }

  protected completedSubtasks(task: Task): number {
    return task.subtasks.filter(s => s.completed).length;
  }
}
