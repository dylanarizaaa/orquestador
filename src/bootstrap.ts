import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerSpanishLocale } from './app/core/config/locale.config';
import { environment } from './environments/environment';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { provideRouter } from '@angular/router';
import { authGuard } from './app/core/guards/auth.guard';
import { roleGuard } from './app/core/guards/role.guard';
import { loadRemoteStyles } from './app/core/config/remote-styles';

registerSpanishLocale();

interface IAppConfig {
    providers: Record<string, string>;
    routes: {
        path: string;
        remoteName: string;
        exposedModule: string;
    }[];
    styles: Record<string, string>;
}

const getAppConfig = (): Promise<IAppConfig> => {
    return Promise.resolve({
        "providers": {
            "factura-pendiente": "./Providers"
        },
        "routes": [
            {
                "path": "anulaciones",
                "remoteName": "anulaciones",
                "exposedModule": "./Routes"
            },
            {
                "path": "auditoria-pesos",
                "remoteName": "auditoria-pesos",
                "exposedModule": "./Routes"
            },
            {
                "path": "facturas-pendientes",
                "remoteName": "factura-pendiente",
                "exposedModule": "./Routes"
            },
            {
                "path": "movilizados-cliente",
                "remoteName": "conciliacion-interpay",
                "exposedModule": "./ClientMobilized"
            },
            {
                "path": "notas",
                "remoteName": "nota-credito",
                "exposedModule": "./Routes"
            },
            {
                "path": "ventas-descuento",
                "remoteName": "conciliacion-interpay",
                "exposedModule": "./DiscountSales"
            }
        ],
        "styles": {
            "factura-pendiente": "https://portalfinanciero-dev.interrapidisimo.co/MF-PendientesxFacturar/factura-pendiente-styles.css",
            "anulaciones": "https://portalfinanciero-dev.interrapidisimo.co/MF-RepNacAnu/anulaciones-styles.css",
            "conciliacion-interpay": "http://localhost:4205/reporte-descuentos-interpay-styles.css",
            "auditoria-pesos": "https://portalfinanciero-dev.interrapidisimo.co/MF-RepPesos/auditoriaPesos-styles.css"
        }
    });
    // return fetch(environment.secureUrl + '/seguridad/federation/layout')
    //     .then((response) => response.json() as Promise<IAppConfig>);
}

const initApp = async () => {
    try {
        const config = await getAppConfig();

        // 1. Extraemos y esperamos a que carguen todos los providers
        const providerPromises = Object.entries(config.providers).map(
            ([remoteName, exposedModule]) => loadRemoteModule(remoteName, exposedModule)
        );
        const providers = (await Promise.all(providerPromises)).map(m => m.default);

        // 2. Una vez cargados, usamos el config original para inicializar la app
        const mergedConfig = {
            ...appConfig,
            providers: [
                ...appConfig.providers,
                ...providers,
                provideRouter([
                    {
                        path: '',
                        canActivate: [authGuard],
                        loadComponent: () => import('./app/features/dashboard/dashboard').then(c => c.Dashboard),
                        children: config.routes.map(route => ({
                            path: route.path,
                            canActivate: [roleGuard],
                            // Los estilos del micro front se cargan al entrar a su ruta (no todos al
                            // arrancar) y se espera a que estén listos antes de mostrar la pantalla.
                            loadChildren: () => {
                                const styles = loadRemoteStyles(route.remoteName, config.styles[route.remoteName]);
                                return styles
                                    .then(() => loadRemoteModule(route.remoteName, route.exposedModule))
                                    .then((m) => m.default);
                            }
                        }))
                    }
                ]),
            ]
        };

        // 3. Arrancamos la aplicación
        await bootstrapApplication(App, mergedConfig);

    } catch (err) {
        console.error("Error inicializando la app:", err);
    }
};

initApp();