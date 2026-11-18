# PortalFinanciero

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.17.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Componentes de UI (spartan.ng)

El portal usa [spartan.ng](https://spartan.ng) oficial:

- `@spartan-ng/brain` (dependencia de npm) aporta el comportamiento y la accesibilidad. Al ser una
  dependencia, Native Federation la comparte con los micro front ends.
- Los componentes `helm` (estilos) viven en `libs/ui/<componente>` y se importan con el alias
  `@spartan-ng/helm/<componente>` (ver `tsconfig.json` y `components.json`). Incluyen los ajustes del
  sistema de diseño del portal (sidebar flotante, badge `tertiary`, botón e input).

Para agregar un componente nuevo:

```bash
npx ng g @spartan-ng/cli:ui <componente> --directory=libs/ui
```

Las pruebas de `libs/ui` están en `src/testing/spartan/` y su cobertura se mide junto con la de `src/app`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
