// Importa los tipos `Request` y `Response` desde Express para tipado de parámetros en handlers.
import { Request, Response } from 'express';
// Importa `axios` para realizar peticiones HTTP y `Method` para tipar el método HTTP.
import axios, { Method } from 'axios';

// buildUrl: construye la URL completa a la que se reenviará la petición.
// - `base`: URL base del servicio destino (sin sufijo `/`).
// - `path`: ruta que se quiere añadir a la base (sin prefijo `/`).
// - `query`: objeto con parámetros de consulta que se convertirá a query string.
function buildUrl(base: string, path: string, query: any) {
  // Eliminar una barra final de la base para evitar `//` al concatenar.
  const url = base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  // Convertir el objeto `query` a una cadena de parámetros URL codificados.
  const params = new URLSearchParams(query).toString();
  // Si hay parámetros, devolver `url?params`, si no, devolver `url`.
  return params ? `${url}?${params}` : url;
}

// Función exportada que crea un middleware proxy configurado.
// - `envVar`: nombre de la variable de entorno que puede sobreescribir la URL base.
// - `defaultUrl`: URL por defecto si no existe la variable de entorno.
export default function proxyHandler(envVar: string, defaultUrl: string) {
  // Tomar la URL base desde la variable de entorno indicada o usar la por defecto.
  const base = process.env[envVar] || defaultUrl;

  // Devolver el middleware real que Express usará: (req, res) => Promise
  return async (req: Request, res: Response) => {
    // `attempted` guardará las URLs a las que intentamos conectar (útil para depuración y errores).
    const attempted: string[] = [];
    // Tomar el método HTTP de la petición entrante (GET, POST, PUT, etc.).
    const method = req.method as Method;
    // Copiar los headers para reenviarlos; usamos spread para no mutar `req.headers`.
    const headers = { ...req.headers };
    // Eliminar el header `host` para evitar enviar la cabecera original al upstream.
    delete (headers as any).host;
    // Eliminar headers que pueden interferir cuando axios reenvía la petición.
    delete (headers as any)['content-length'];
    delete (headers as any)['transfer-encoding'];
    delete (headers as any)['content-encoding'];

    // tryRequest: función auxiliar que intenta hacer la petición hacia `targetBase`.
    const tryRequest = async (targetBase: string) => {
      // Quitar el prefijo `/api` de la URL original para que el servicio upstream reciba la ruta esperada.
      const forwardPath = req.originalUrl.replace(/^\/api/, '') || '/';
      // Construir la URL completa usando la base objetivo, la ruta y los query params.
      const forwardUrl = buildUrl(targetBase, forwardPath, req.query);
      // Guardar la URL intentada para información en caso de error.
      attempted.push(forwardUrl);
      // Realizar la petición con axios: pasar URL, método, headers y el body original.
      return axios.request({
        url: forwardUrl,
        method,
        headers,
        data: req.body,
        // `validateStatus: () => true` evita que axios lance excepciones por códigos HTTP >=400;
        // así se devuelve la respuesta al cliente con su código real para que el proxy no falle aquí.
        validateStatus: () => true
      });
    };

    try {
      // Primer intento usando la URL base configurada.
      const resp = await tryRequest(base);
      // Reenviar al cliente el estatus, los headers y el body recibidos del upstream.
      return res.status(resp.status).set(resp.headers).send(resp.data);
    } catch (err: any) {
      // Si algo falla (p. ej. conexión rechazada), registrarlo en consola para debugging.
      console.error('Proxy first attempt error:', err && err.message ? err.message : err);

      // Intento especial: si la base apunta a localhost y la conexión fue rechazada,
      // probar con `host.docker.internal` — útil al ejecutar dentro de Docker en Windows/macOS.
      try {
        if ((base.includes('localhost') || base.includes('127.0.0.1')) && err && err.code === 'ECONNREFUSED') {
          // Reemplazar `localhost` o `127.0.0.1` por `host.docker.internal`.
          const altBase = base.replace('localhost', 'host.docker.internal').replace('127.0.0.1', 'host.docker.internal');
          try {
            // Intentar de nuevo con la base alternativa.
            const resp2 = await tryRequest(altBase);
            // Si funciona, reenviar la respuesta al cliente.
            return res.status(resp2.status).set(resp2.headers).send(resp2.data);
          } catch (err2: any) {
            // Si el segundo intento también falla, registrarlo y devolver 502 con detalles.
            console.error('Proxy second attempt error:', err2 && err2.message ? err2.message : err2);
            return res.status(502).json({ error: 'Bad Gateway', details: { message: err2.message, code: err2.code, attempted } });
          }
        }

        // Si no aplicó la condición anterior, devolver 502 Bad Gateway con detalles del error.
        return res.status(502).json({ error: 'Bad Gateway', details: { message: err.message, code: err.code, attempted } });
      } catch (finalErr: any) {
        // Captura eventualidades inesperadas en la lógica de manejo de errores y devolver 500.
        console.error('Proxy final error:', finalErr);
        return res.status(500).json({ error: String(finalErr) });
      }
    }
  };
}
