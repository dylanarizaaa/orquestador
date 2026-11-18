import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { HlmSidebarImports } from '@helm/sidebar';
import { Header } from 'src/app/shared/components/header/header';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterOutlet,
    Sidebar,
    Header,
    HlmSidebarImports,
  ],
  template: `
		<app-sidebar>
			<app-header header />
			<main hlmSidebarInset>
        <router-outlet />
			</main>
		</app-sidebar>
  `
})
export class Dashboard { }
