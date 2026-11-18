import { TestBed } from '@angular/core/testing';
import { RemoteLoaderService } from '../services/remote-loader.service';
import { loadRemoteStyles } from './remote-styles';

describe('loadRemoteStyles', () => {
  afterEach(() => {
    document.querySelectorAll('[id^="mf-styles-"]').forEach((el) => el.remove());
    jest.restoreAllMocks();
  });

  const load = (remote: string, href: string | undefined) =>
    TestBed.runInInjectionContext(() => loadRemoteStyles(remote, href));

  it('carga la hoja del micro front al entrar a su ruta y espera a que termine', async () => {
    let listo = false;
    const promesa = load('reportes', 'https://cdn/reportes-styles.css').then(() => (listo = true));

    const link = document.getElementById('mf-styles-reportes') as HTMLLinkElement;
    expect(link.rel).toBe('stylesheet');
    expect(link.getAttribute('href')).toBe('https://cdn/reportes-styles.css');
    await Promise.resolve();
    expect(listo).toBe(false);

    link.dispatchEvent(new Event('load'));
    await promesa;
    expect(listo).toBe(true);
  });

  it('si la hoja falla, lo registra y deja cargar la pantalla; al reintentar la vuelve a pedir', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const promesa = load('reportes', 'https://cdn/no-existe.css');
    document.getElementById('mf-styles-reportes')!.dispatchEvent(new Event('error'));

    await expect(promesa).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      '[RemoteStyles] No se cargaron los estilos de "reportes".',
      expect.any(Error),
    );
    expect(document.getElementById('mf-styles-reportes')).toBeNull();

    load('reportes', 'https://cdn/no-existe.css');
    expect(document.getElementById('mf-styles-reportes')).not.toBeNull();
  });

  it('sin hoja configurada no carga nada', async () => {
    const loader = jest.spyOn(TestBed.inject(RemoteLoaderService), 'loadResource');

    await expect(load('sin-estilos', undefined)).resolves.toBeUndefined();
    expect(loader).not.toHaveBeenCalled();
  });
});
