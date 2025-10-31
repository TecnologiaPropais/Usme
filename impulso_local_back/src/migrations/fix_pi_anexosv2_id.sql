-- Script para corregir la columna id de la tabla pi_anexosv2
-- Hacer que la columna id sea autoincremental (SERIAL en PostgreSQL)

-- Primero, eliminar la restricción NOT NULL si existe
ALTER TABLE pi_anexosv2 ALTER COLUMN id DROP NOT NULL;

-- Crear una secuencia para la columna id
CREATE SEQUENCE IF NOT EXISTS pi_anexosv2_id_seq;

-- Asignar la secuencia a la columna id
ALTER TABLE pi_anexosv2 ALTER COLUMN id SET DEFAULT nextval('pi_anexosv2_id_seq');

-- Hacer que la secuencia sea propiedad de la columna id
ALTER SEQUENCE pi_anexosv2_id_seq OWNED BY pi_anexosv2.id;

-- Establecer el valor inicial de la secuencia basado en el máximo id existente
SELECT setval('pi_anexosv2_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM pi_anexosv2;

-- Restablecer la restricción NOT NULL
ALTER TABLE pi_anexosv2 ALTER COLUMN id SET NOT NULL;

