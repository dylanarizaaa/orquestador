import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAuthResponse } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { Header } from './header';

function buildUser(partial: Partial<UserAuthResponse> = {}): UserAuthResponse {
  return {
    NombreUsuario: 'Andrés',
    Usuario: 'andres',
    NombreRol: 'Admin',
    NombreAplicacion: 'App',
    ...partial,
  };
}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let redirectToLogin: jest.Mock;

  async function setup(user: UserAuthResponse | null) {
    redirectToLogin = jest.fn();
    const authServiceMock: Pick<AuthService, 'user' | 'redirectToLogin'> = {
      user: (() => user) as AuthService['user'],
      redirectToLogin,
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup(buildUser());
    expect(component).toBeTruthy();
  });

  it('exposes the authenticated user name and role from AuthService', async () => {
    await setup(buildUser({ NombreUsuario: 'Andrés', NombreRol: 'Admin' }));

    expect(component.userName).toBe('Andrés');
    expect(component.roleName).toBe('Admin');
  });

  it('renders the user name and role in the template', async () => {
    await setup(buildUser({ NombreUsuario: 'Marta', NombreRol: 'Cajero' }));

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Marta');
    expect(host.textContent).toContain('Cajero');
  });

  it('leaves name and role undefined when there is no session', async () => {
    await setup(null);

    expect(component.userName).toBeUndefined();
    expect(component.roleName).toBeUndefined();
  });

  it('exit() delegates to AuthService.redirectToLogin', async () => {
    await setup(buildUser());

    component.exit();

    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('invokes exit() when the "Salir" button is clicked', async () => {
    await setup(buildUser());

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.dispatchEvent(new MouseEvent('click'));

    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });
});
