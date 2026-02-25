import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WorkspaceService } from '../../core/services/workspace.service';
import { ListViewComponent } from './list-view/list-view';
import { BoardViewComponent } from './board-view/board-view';
import { CalendarViewComponent } from './calendar-view/calendar-view';

@Component({
  selector: 'app-space',
  imports: [MatIconModule, ListViewComponent, BoardViewComponent, CalendarViewComponent],
  template: `
    <div class="space-container">
      @switch (ws.activeView()) {
        @case ('board') { <app-board-view /> }
        @case ('calendar') { <app-calendar-view /> }
        @default { <app-list-view /> }
      }
    </div>
  `,
  styles: [`
    .space-container {
      height: 100%;
      overflow: auto;
    }
  `],
})
export class SpaceComponent {
  protected readonly ws = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const spaceId = params.get('spaceId');
      const listId = params.get('listId');
      if (spaceId) this.ws.setActiveSpace(spaceId);
      if (listId) this.ws.setActiveList(listId);
    });
  }
}
