import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WorkspaceService } from '../../core/services/workspace.service';
import { ListViewComponent } from './list-view/list-view';
import { BoardViewComponent } from './board-view/board-view';
import { CalendarViewComponent } from './calendar-view/calendar-view';
import { TaskDetailComponent } from './task-detail/task-detail';
import { effect } from '@angular/core';

@Component({
  selector: 'app-space',
  imports: [MatIconModule, ListViewComponent, BoardViewComponent, CalendarViewComponent, TaskDetailComponent],
  template: `
    <div class="space-container">
      <div class="view-area">
        @switch (ws.activeView()) {
          @case ('board') { <app-board-view /> }
          @case ('calendar') { <app-calendar-view /> }
          @default { <app-list-view /> }
        }
      </div>
      @if (ws.taskDetailOpen()) {
        <app-task-detail class="task-detail-slide" />
      }
    </div>
  `,
  styles: [`
    .space-container {
      display: flex;
      height: 100%;
      overflow: hidden;
    }
    .view-area {
      flex: 1;
      overflow: auto;
      min-width: 0;
    }
    .task-detail-slide {
      animation: slideIn 0.25s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class SpaceComponent {
  protected readonly ws = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      const spaceId = this.route.snapshot.paramMap.get('spaceId');
      const listId = this.route.snapshot.paramMap.get('listId');
      if (spaceId) this.ws.setActiveSpace(spaceId);
      if (listId) this.ws.setActiveList(listId);
    });

    this.route.paramMap.subscribe(params => {
      const spaceId = params.get('spaceId');
      const listId = params.get('listId');
      if (spaceId) this.ws.setActiveSpace(spaceId);
      if (listId) this.ws.setActiveList(listId);
    });
  }
}
