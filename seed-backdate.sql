-- ================================================================
-- Sanos y Salvos — Backdate seed
-- Distribuye los registros seed en los últimos 12 meses para
-- poder probar los filtros de fecha del dashboard de análisis.
-- ================================================================

-- PASO 1: Ejecutar contra la BD de ms-users  (tabla: users)
-- docker exec <container_ms_users> psql -U postgres -d ms_users
-- o:  psql "postgresql://usuario:clave@localhost:5432/ms_users"

WITH ranked AS (
  SELECT
    id,
    (row_number() OVER (ORDER BY created_at, id) - 1) AS rn,
    COUNT(*) OVER ()::float                            AS total
  FROM users
  WHERE email LIKE '%@example.cl'
)
UPDATE users
SET created_at =
  DATE_TRUNC('month', NOW())
  - (FLOOR(rn * 12.0 / total) * INTERVAL '1 month')
  + ((rn % 4)                  * INTERVAL '6 days')
FROM ranked
WHERE users.id = ranked.id;


-- PASO 2: Ejecutar contra la BD de ms-mascotas  (tabla: reportes)
-- docker exec <container_ms_mascotas> psql -U postgres -d ms_mascotas
-- o:  psql "postgresql://usuario:clave@localhost:5432/ms_mascotas"

WITH ranked AS (
  SELECT
    id,
    (row_number() OVER (ORDER BY fecha_publicacion, id) - 1) AS rn,
    COUNT(*) OVER ()::float                                   AS total
  FROM reportes
)
UPDATE reportes
SET fecha_publicacion =
  DATE_TRUNC('month', NOW())
  - (FLOOR(rn * 12.0 / total) * INTERVAL '1 month')
  + ((rn % 4)                  * INTERVAL '6 days')
FROM ranked
WHERE reportes.id = ranked.id;
