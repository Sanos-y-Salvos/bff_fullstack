# BFF (Backend for Frontend) — Sanos y Salvos

Capa intermedia entre el API Gateway y los microservicios. Recibe todas las peticiones del frontend (vía el gateway) y las reenvía al microservicio correspondiente, aplicando las reescrituras de ruta necesarias.

**Puerto:** `3000`

---

## Stack

- Node.js 20 + Express 4 + TypeScript

---

## Rutas expuestas

| Prefijo BFF | Microservicio destino | Puerto | Reescritura de ruta |
|---|---|---|---|
| `ANY /api/auth/*` | ms-auth | 3001 | Elimina `/api`, reenvía el resto |
| `ANY /api/users/*` | ms-users | 3002 | Elimina `/api`, reenvía el resto |
| `ANY /api/mascotas/*` | ms-mascotas | 3003 | Elimina `/api` **y** `/mascotas` |
| `ANY /api/localizacion/*` | ms-localizacion | 3004 | Elimina `/api` **y** `/localizacion` |
| `ANY /api/reportes/*` | ms-mascotas | 3003 | Elimina `/api`, reenvía el resto (ruta legacy) |
| `ANY /api/tickets/*` | ms-soporte | 3005 | Elimina `/api`, reenvía el resto |
| `ANY /api/chatbot/*` | ms-soporte | 3005 | Elimina `/api`, reenvía el resto |

> `ms-matching` y `ms-mensajeria-privada` **no** pasan por el BFF. El frontend accede a ms-mensajeria-privada directamente por HTTP y Socket.io en el puerto 3006; ms-matching opera solo vía eventos RabbitMQ.

---

## Variables de entorno

Copia `.env.example` a `.env`:

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del BFF |
| `AUTH_URL` | `http://localhost:3001` | URL de ms-auth |
| `USERS_URL` | `http://localhost:3002` | URL de ms-users |
| `MASCOTAS_URL` | `http://localhost:3003` | URL de ms-mascotas |
| `LOCALIZACION_URL` | `http://localhost:3004` | URL de ms-localizacion (local) |
| `SOPORTE_URL` | `http://localhost:3005` | URL de ms-soporte (tickets + chatbot) |

> **Docker en Windows:** si la conexión a la URL configurada es rechazada, el BFF reintenta automáticamente con `host.docker.internal` como fallback.

> **ms-localizacion en Docker:** su `.env.example` expone el puerto 8000 internamente. Cuando se ejecuta localmente (sin Docker), debe iniciarse en el puerto 3004 para que el BFF lo encuentre.

---

## Ejecución

```bash
# Desarrollo con hot-reload
npm install
npm run dev

# Producción
npm run build
npm start

# Docker
docker compose up -d --build
```

---

## Comportamiento del proxy

- Propaga método HTTP, headers (`Authorization`, `x-user-id`, `x-user-role`, `Content-Type`, etc.), body y query string al microservicio destino.
- Si el upstream no responde: devuelve `502 Bad Gateway` con el campo `details.attempted` indicando la URL intentada.
- Los headers `x-user-id` y `x-user-role` son inyectados por el API Gateway antes de llegar al BFF; el BFF los reenvía sin modificación al microservicio.

---

## Logs y depuración

```bash
# Ver logs del contenedor BFF
docker logs -f bff

# Verificar red Docker
docker network inspect sanos-y-salvos-net
```
