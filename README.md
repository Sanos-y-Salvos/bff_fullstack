## Back-for-Frontend (Express + TypeScript)

Proyecto: Back-for-Frontend (BFF) — puerta de entrada para `auth`, `users` y `reportes`.

Resumen
 - BFF expone rutas bajo `/api/*` y proxea todas las solicitudes hacia los microservicios correspondientes (`auth`, `users`, `reportes`).
 - Diseñado para usarse en desarrollo (local) y en Docker dentro de la red `sanos-y-salvos` para comunicarse por nombres de servicio.

Variables de entorno (recomendadas)
- `PORT` — puerto en el que corre el BFF (por defecto `3000`).
- `USERS_URL` — URL base del servicio `users` (p. ej. `http://users:3000` o `http://localhost:3001`).
- `REPORTS_URL` — URL base del servicio `reportes` (p. ej. `http://ms-mascotas:3003` o `http://localhost:3003`).
- `AUTH_URL` — URL base del servicio `auth` (p. ej. `http://auth:3000` or `http://localhost:3000`).
- `PETS_URL` — alias para mascotas si aplica (opcional).

Archivo example: `.env.example` incluido en el repo.

Rutas expuestas (proxy)
- `ANY /api/auth/*` → reenvía a `AUTH_URL/*` (login, register, refresh, etc.)
- `ANY /api/users/*` → reenvía a `USERS_URL/*` (listar usuarios, detalle, etc.)
- `ANY /api/reportes/*` → reenvía a `REPORTS_URL/*` (crear/listar/editar reportes)

Notas sobre comportamiento
- El proxy reenvía método HTTP, headers, body y query string. También intenta propagar la cabecera `Authorization` si está presente.
- Si el upstream no está disponible, el proxy devuelve `502 Bad Gateway` con un campo `details.attempted` con las URLs que intentó.
- En entornos Docker on Windows, el proxy intentará un fallback a `host.docker.internal` cuando el servicio esté mapeado al host.

Ejecutar localmente (desarrollo)
1. Instala dependencias y ejecuta en modo `dev` (usa `ts-node-dev`):

```bash
cd Back_For_Fronent/backforfrontend
npm install
npm run dev
```

2. Configura `.env` (copia `.env.example`) y apunta `REPORTS_URL` a `http://localhost:3003` si `ms-mascotas` corre en host.

Pruebas con Postman / curl
- `GET http://localhost:3000/api/reportes` → reenvía a `REPORTS_URL/reportes`
- `POST http://localhost:3000/api/auth/login` → reenvía a `AUTH_URL/login` (body JSON)

Docker — build y run
Este proyecto incluye un `Dockerfile` y un `docker-compose.yml` pensado para integrarse con la red `sanos-y-salvos` usada por los demás microservicios.

Construir imagen localmente:
```bash
cd Back_For_Fronent/backforfrontend
docker build -t backforfrontend:local .
```

Levantar con `docker run` (con variables env):
```bash
docker run -p 3000:3000 --env REPORTS_URL=http://host.docker.internal:3003 backforfrontend:local
```

Levantar con `docker-compose` (recomendado cuando existe la red `sanos-y-salvos`):
```bash
cd Back_For_Fronent/backforfrontend
docker compose up -d --build
```

El `docker-compose.yml` configura `REPORTS_URL` por defecto como `http://ms-mascotas:3003`. Para que esto funcione los demás servicios deben estar conectados a la red `sanos-y-salvos-net` y usar los nombres de servicio `ms-mascotas`, `auth`, `users`.

Logs y depuración
- Ver logs del contenedor:
```bash
docker logs -f backforfrontend
```
- Si tienes problemas de conectividad entre contenedores, verifica la red:
```bash
docker network inspect sanos-y-salvos-net
```

Consejos y buenas prácticas
- En producción expón sólo las rutas necesarias y añade rate-limiting y caching según carga.
- Considera agregar un `circuit-breaker` / retries para endpoints flakey.
- Si el upstream requiere envío de archivos (multipart/form-data), el proxy soporta passthrough; para transformaciones complejas considera implementar handlers específicos.


- ¿Cómo apunto el BFF a mi microservicio `ms-mascotas` que corre en host?  
	A: en `.env` pon `REPORTS_URL=http://host.docker.internal:3003` o `http://localhost:3003` cuando ejecutas el BFF en tu máquina local.


#