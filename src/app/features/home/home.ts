import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, NgClass } from '@angular/common';
import { WorkspaceService } from '../../core/services/workspace.service';
import { PRIORITY_CONFIG } from '../../core/models/task.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatProgressBarModule, MatTooltipModule, DatePipe, NgClass],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly ws = inject(WorkspaceService);
  protected readonly PRIORITY_CONFIG = PRIORITY_CONFIG;

  protected readonly myTasks = computed(() => this.ws.getMyTasks());
  protected readonly overdueTasks = computed(() => this.ws.getOverdueTasks());
  protected readonly dueTodayTasks = computed(() => this.ws.getDueTodayTasks());
  protected readonly recentTasks = computed(() => this.ws.getAllTasks().slice(0, 8));

  protected readonly hour = new Date().getHours();
  protected readonly greeting = this.hour < 12 ? 'Good morning' : this.hour < 17 ? 'Good afternoon' : 'Good evening';
  protected readonly todayDate = new Date();

  protected readonly stats = computed(() => {
    const all = this.ws.getAllTasks();
    const done = all.filter(t => t.status.type === 'done' || t.status.type === 'closed');
    const inProgress = all.filter(t => t.status.type === 'in-progress');
    return {
      total: all.length,
      done: done.length,
      inProgress: inProgress.length,
      overdue: this.overdueTasks().length,
      dueToday: this.dueTodayTasks().length,
      completion: all.length ? Math.round((done.length / all.length) * 100) : 0,
    };
  });

  protected openTask(taskId: string): void {
    this.ws.selectTask(taskId);
  }
}
