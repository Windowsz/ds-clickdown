import { Component, inject, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { Task } from '../../../core/models/task.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-calendar-view',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './calendar-view.html',
  styleUrl: './calendar-view.scss',
})
export class CalendarViewComponent {
  protected readonly ws = inject(WorkspaceService);
  protected readonly currentDate = signal(new Date());

  protected readonly list = computed(() => {
    const listId = this.ws.activeListId();
    return listId ? this.ws.getListById(listId) : null;
  });

  protected readonly monthYear = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  protected readonly calendarDays = computed((): CalendarDay[] => {
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();
    const list = this.list();
    const tasks = list?.tasks || this.ws.getAllTasks();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fill leading days from previous month
    for (let i = firstDay.getDay(); i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      days.push({ date, isCurrentMonth: false, isToday: false, tasks: [] });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayStart = new Date(year, month, d);
      const dayEnd = new Date(year, month, d + 1);
      const dayTasks = tasks.filter(t =>
        t.dueDate && t.dueDate >= dayStart && t.dueDate < dayEnd
      );
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        tasks: dayTasks,
      });
    }

    // Fill trailing days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ date, isCurrentMonth: false, isToday: false, tasks: [] });
    }

    return days;
  });

  protected prevMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  protected nextMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  protected goToToday(): void {
    this.currentDate.set(new Date());
  }

  protected openTask(taskId: string, event: Event): void {
    event.stopPropagation();
    this.ws.selectTask(taskId);
  }

  protected readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
