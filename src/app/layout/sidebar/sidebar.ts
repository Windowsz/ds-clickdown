import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { NgClass, TitleCasePipe } from '@angular/common';
import { WorkspaceService } from '../../core/services/workspace.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, MatMenuModule, MatButtonModule, MatBadgeModule, MatDividerModule, NgClass, TitleCasePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected readonly ws = inject(WorkspaceService);
  protected readonly router = inject(Router);
  protected readonly searchExpanded = signal(false);
  protected readonly searchQuery = signal('');

  protected navigate(listId: string, spaceId: string): void {
    this.ws.setActiveList(listId);
    this.ws.setActiveSpace(spaceId);
    this.router.navigate(['/space', spaceId, 'list', listId]);
  }

  protected navigateSpace(spaceId: string): void {
    const space = this.ws.getSpaceById(spaceId);
    if (space) {
      const firstList = space.lists[0] || space.folders[0]?.lists[0];
      if (firstList) {
        this.navigate(firstList.id, spaceId);
      }
    }
  }
}
