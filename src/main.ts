import { initFederation } from '@angular-architects/native-federation';
import { environment } from './environments/environment';

const getRemotes = (): Promise<Record<string, string>> => {
  return Promise.resolve({
    "factura-pendiente": "https://portalfinanciero-dev.interrapidisimo.co/MF-PendientesxFacturar/remoteEntry.json",
    "anulaciones": "https://portalfinanciero-dev.interrapidisimo.co/MF-RepNacAnu/remoteEntry.json",
    "nota-credito": "https://portalfinanciero-dev.interrapidisimo.co/MF-Notas/remoteEntry.json",
    "conciliacion-interpay": "http://localhost:4205/remoteEntry.json",
    "auditoria-pesos": "https://portalfinanciero-dev.interrapidisimo.co/MF-RepPesos/remoteEntry.json"
  });
  // return fetch(environment.secureUrl + '/seguridad/federation/manifest')
  //   .then((response) => response.json());
};

getRemotes()
  .then((remotes) => {
    return initFederation(remotes)
  })
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));