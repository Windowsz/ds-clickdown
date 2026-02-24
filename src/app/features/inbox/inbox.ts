import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { WorkspaceService } from '../../core/services/workspace.service';

@Component({
  selector: 'app-inbox',
  imports: [MatIconModule, MatButtonModule, MatTabsModule, DatePipe],
  templateUrl: './inbox.html',
  styleUrl: './inbox.scss',
})
export class InboxComponent {
  protected readonly ws = inject(WorkspaceService);
}
