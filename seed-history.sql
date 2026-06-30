-- seed-history.sql
-- Redistribuye los timestamps de los registros creados por seed.mjs
-- para simular 6 meses de actividad histórica en los gráficos de análisis.
--
-- Ejecutar DESPUÉS de haber corrido seed.mjs:
--
--   En la base de datos de ms-users:
--     psql -U <user> -d <db_ms_users> -f seed-history.sql
--
--   En la base de datos de ms_mascotas:
--     psql -U <user> -d <db_ms_mascotas> -f seed-history.sql
--
-- Ajusta los nombres de base de datos / usuario según tu .env.

-- =============================================================
-- ms-users: distribuir los 10 usuarios más recientes en 6 meses
-- =============================================================

-- Asigna mes i a cada par de usuarios (2 usuarios por mes)
WITH seed_users AS (
  SELECT id,
         (ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1) / 2 AS mes_offset
  FROM users
  ORDER BY created_at DESC
  LIMIT 10
)
UPDATE users
SET created_at = NOW()
                 - (seed_users.mes_offset || ' months')::INTERVAL
                 + (RANDOM() * INTERVAL '25 days')
FROM seed_users
WHERE users.id = seed_users.id;

-- =============================================================
-- ms_mascotas: distribuir los 10 reportes más recientes en 6 meses
-- =============================================================

-- 5 meses atrás hasta el mes actual, 2 reportes por mes
WITH seed_reportes AS (
  SELECT id,
         (ROW_NUMBER() OVER (ORDER BY fecha_publicacion DESC) - 1) / 2 AS mes_offset
  FROM reportes
  ORDER BY fecha_publicacion DESC
  LIMIT 10
)
UPDATE reportes
SET fecha_publicacion = NOW()
                        - (seed_reportes.mes_offset || ' months')::INTERVAL
                        + (RANDOM() * INTERVAL '25 days')
FROM seed_reportes
WHERE reportes.id = seed_reportes.id;
