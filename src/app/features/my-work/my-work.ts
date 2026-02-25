import { Component, inject, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Task, PRIORITY_CONFIG } from '../../core/models/task.model';

@Component({
  selector: 'app-my-work',
  imports: [MatIconModule, MatButtonModule, MatTabsModule, MatTooltipModule, DatePipe],
  templateUrl: './my-work.html',
  styleUrl: './my-work.scss',
})
export class MyWorkComponent {
  protected readonly ws = inject(WorkspaceService);
  protected readonly PRIORITY_CONFIG = PRIORITY_CONFIG;
  protected readonly today = new Date();

  protected readonly myTasks = computed(() => this.ws.getMyTasks());
  protected readonly overdueTasks = computed(() => this.ws.getOverdueTasks().filter(t => t.assignees.some(a => a.id === this.ws.currentUser().id)));
  protected readonly dueTodayTasks = computed(() => this.ws.getDueTodayTasks());
  protected readonly upcomingTasks = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return this.myTasks().filter(t => t.dueDate && t.dueDate >= tomorrow && t.dueDate < nextWeek && t.status.type !== 'done');
  });

  protected openTask(taskId: string): void {
    this.ws.selectTask(taskId);
  }

  protected isOverdue(task: Task): boolean {
    return !!task.dueDate && task.dueDate < this.today && task.status.type !== 'done' && task.status.type !== 'closed';
  }
}
