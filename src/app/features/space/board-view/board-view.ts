import { Component, inject, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { Task, PRIORITY_CONFIG, DEFAULT_STATUSES } from '../../../core/models/task.model';

@Component({
  selector: 'app-board-view',
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, DatePipe],
  templateUrl: './board-view.html',
  styleUrl: './board-view.scss',
})
export class BoardViewComponent {
  protected readonly ws = inject(WorkspaceService);
  protected readonly PRIORITY_CONFIG = PRIORITY_CONFIG;
  protected readonly today = new Date();

  protected readonly list = computed(() => {
    const listId = this.ws.activeListId();
    return listId ? this.ws.getListById(listId) : null;
  });

  protected readonly columns = computed(() => {
    const list = this.list();
    if (!list) return [];

    const statusMap = new Map<string, Task[]>();
    list.statuses.forEach(s => statusMap.set(s.id, []));
    list.tasks.forEach(t => {
      if (statusMap.has(t.status.id)) statusMap.get(t.status.id)!.push(t);
      else statusMap.get('s-1')!.push(t);
    });

    return list.statuses.map(status => ({
      status,
      tasks: statusMap.get(status.id) || [],
    }));
  });

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
