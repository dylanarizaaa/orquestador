import { TestBed } from '@angular/core/testing';

import { RemoteLoaderService } from './remote-loader.service';

describe('RemoteLoaderService', () => {
  let service: RemoteLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteLoaderService);
  });

  afterEach(() => {
    document
      .querySelectorAll('[data-test-resource]')
      .forEach((el) => el.remove());
    jest.restoreAllMocks();
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('injects an element with the given id and attributes into <head> by default', async () => {
    const promise = service.loadResource({
      id: 'res-head',
      tag: 'link',
      attributes: { rel: 'stylesheet', href: 'styles.css', 'data-test-resource': 'true' },
    });

    const el = document.getElementById('res-head');
    expect(el).not.toBeNull();
    expect(el?.parentElement).toBe(document.head);
    expect(el?.tagName.toLowerCase()).toBe('link');
    expect(el?.getAttribute('rel')).toBe('stylesheet');
    expect(el?.getAttribute('href')).toBe('styles.css');

    el?.dispatchEvent(new Event('load'));
    await expect(promise).resolves.toBeUndefined();
  });

  it('injects into <body> when targetNode is "body"', async () => {
    const promise = service.loadResource({
      id: 'res-body',
      tag: 'script',
      attributes: { src: 'app.js', 'data-test-resource': 'true' },
      targetNode: 'body',
    });

    const el = document.getElementById('res-body');
    expect(el?.parentElement).toBe(document.body);

    el?.dispatchEvent(new Event('load'));
    await promise;
  });

  it('handles boolean attributes (sets empty when true, omits when false)', async () => {
    const promise = service.loadResource({
      id: 'res-bool',
      tag: 'script',
      attributes: { src: 'a.js', async: true, defer: false, 'data-test-resource': 'true' },
    });

    const el = document.getElementById('res-bool');
    expect(el?.getAttribute('async')).toBe('');
    expect(el?.hasAttribute('defer')).toBe(false);

    el?.dispatchEvent(new Event('load'));
    await promise;
  });

  it('does not inject a duplicate and resolves with a warning', async () => {
    const existing = document.createElement('link');
    existing.id = 'res-dup';
    existing.setAttribute('data-test-resource', 'true');
    document.head.appendChild(existing);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await service.loadResource({
      id: 'res-dup',
      tag: 'link',
      attributes: { href: 'other.css', 'data-test-resource': 'true' },
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('res-dup')
    );
    expect(document.querySelectorAll('#res-dup').length).toBe(1);
    expect(document.getElementById('res-dup')?.getAttribute('href')).toBeNull();
  });

  it('loadAll resolves once every resource has loaded', async () => {
    const spy = jest
      .spyOn(service, 'loadResource')
      .mockResolvedValue(undefined);

    const result = await service.loadAll([
      { id: 'a', tag: 'link', attributes: {} },
      { id: 'b', tag: 'link', attributes: {} },
    ]);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result).toEqual([undefined, undefined]);
  });
});
