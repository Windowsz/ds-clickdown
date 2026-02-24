import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { WorkspaceService } from '../../core/services/workspace.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatBadgeModule, MatDividerModule, DatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly ws = inject(WorkspaceService);

  protected readonly views = [
    { id: 'list', icon: 'format_list_bulleted', label: 'List' },
    { id: 'board', icon: 'view_kanban', label: 'Board' },
    { id: 'calendar', icon: 'calendar_month', label: 'Calendar' },
    { id: 'gantt', icon: 'view_timeline', label: 'Gantt' },
    { id: 'table', icon: 'table_chart', label: 'Table' },
  ] as const;

  protected setView(view: 'list' | 'board' | 'calendar' | 'gantt' | 'table'): void {
    this.ws.activeView.set(view);
  }
}
