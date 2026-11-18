import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideUser } from '@ng-icons/lucide';
import { HlmBadge } from '@helm/badge';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    HlmBadge,
    NgIcon
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-(--header-height) sticky top-0 z-40 block bg-background shadow-[-2px_4px_12px_0px_rgba(87,87,87,0.15)]'
  },
  viewProviders: [
    provideIcons({
      lucideLogOut,
      lucideUser
    })
  ]
})
export class Header {
  private readonly authService = inject(AuthService);
  userName = this.authService.user()?.NombreUsuario
  roleName = this.authService.user()?.NombreRol

  exit() {
    this.authService.redirectToLogin()
  }
}
