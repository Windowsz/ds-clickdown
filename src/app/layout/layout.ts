import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { TaskDetailComponent } from '../features/space/task-detail/task-detail';
import { WorkspaceService } from '../core/services/workspace.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Header, TaskDetailComponent],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <div class="main-area">
        <app-header />
        <div class="content-row">
          <main class="main-content">
            <router-outlet />
          </main>
          @if (ws.taskDetailOpen()) {
            <app-task-detail class="task-detail-panel" />
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #F5F6F8;
    }
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
    .content-row {
      flex: 1;
      display: flex;
      overflow: hidden;
      min-height: 0;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-width: 0;
    }
    .task-detail-panel {
      flex-shrink: 0;
      animation: slideIn 0.25s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `],
})
export class Layout {
  protected readonly ws = inject(WorkspaceService);
}
