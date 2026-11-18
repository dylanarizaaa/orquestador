import { Injectable } from '@angular/core';

// 1. Definimos la interfaz de configuración
export interface ResourceConfig {
    id: string;                               // Identificador único
    tag: string;                              // 'script', 'link', 'iframe', etc.
    attributes: { [key: string]: any };       // Atributos dinámicos (src, href, rel, async...)
    targetNode?: 'head' | 'body';             // ¿Dónde lo inyectamos? Por defecto en 'head'
}

@Injectable({
    providedIn: 'root'
})
export class RemoteLoaderService {

    constructor() { }

    /**
     * Carga cualquier tipo de recurso inyectándolo en el DOM.
     * @param config Configuración del recurso a inyectar.
     * @returns Una promesa que se resuelve al terminar la carga.
     */
    public loadResource(config: ResourceConfig): Promise<void> {
        return new Promise((resolve, reject) => {

            // Evitar duplicados
            if (document.getElementById(config.id)) {
                console.warn(`El recurso con ID [${config.id}] ya está cargado.`);
                return resolve();
            }

            // Crear el elemento HTML de forma dinámica (ej. <script>, <link>)
            const element = document.createElement(config.tag);
            element.id = config.id;

            // Iterar sobre los atributos pasados en la configuración y asignarlos
            Object.keys(config.attributes).forEach(key => {
                const value = config.attributes[key];

                // Manejo especial para atributos booleanos (como async o defer en scripts)
                if (typeof value === 'boolean') {
                    if (value) element.setAttribute(key, '');
                } else {
                    element.setAttribute(key, value);
                }
            });

            // Escuchar los eventos de éxito o error. Si falla, se quita el elemento para que una
            // carga posterior (p. ej. al volver a entrar a la ruta) lo intente de nuevo.
            element.onload = () => resolve();
            element.onerror = () => {
                element.remove();
                reject(new Error(`No se pudo cargar el recurso [${config.id}].`));
            };

            // Inyectar en el DOM (en el <head> o en el <body>)
            const targetElement = config.targetNode === 'body' ? document.body : document.head;
            targetElement.appendChild(element);
        });
    }

    /**
     * (Opcional) Método de utilidad para cargar múltiples recursos en paralelo
     */
    public loadAll(configs: ResourceConfig[]): Promise<void[]> {
        const promises = configs.map(config => this.loadResource(config));
        return Promise.all(promises);
    }
}