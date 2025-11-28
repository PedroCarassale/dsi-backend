-- Script para limpiar la base de datos de testing
-- Ejecutar si los tests fallan por conflictos de esquema

-- Desconectar todas las conexiones activas (opcional, solo si es necesario)
-- SELECT pg_terminate_backend(pg_stat_activity.pid)
-- FROM pg_stat_activity
-- WHERE pg_stat_activity.datname = 'dsi_backend'
-- AND pid <> pg_backend_pid();

-- Eliminar todas las tablas y tipos
DROP TABLE IF EXISTS "group_memories" CASCADE;
DROP TABLE IF EXISTS "group_users" CASCADE;
DROP TABLE IF EXISTS "memory_patents" CASCADE;
DROP TABLE IF EXISTS "memory_works" CASCADE;
DROP TABLE IF EXISTS "groups" CASCADE;
DROP TABLE IF EXISTS "memories" CASCADE;
DROP TABLE IF EXISTS "patents" CASCADE;
DROP TABLE IF EXISTS "works" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Eliminar tipos enum personalizados
DROP TYPE IF EXISTS "works_type_enum" CASCADE;

-- Confirmar limpieza
SELECT 'Base de datos limpiada exitosamente' AS status;

