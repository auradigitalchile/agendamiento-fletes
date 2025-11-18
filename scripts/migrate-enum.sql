-- Script SQL para migrar movimientos de caja antes de eliminar valores del enum

-- 1. Asegurar que existan cuentas de transferencia para cada organización
-- (Ejecutar el siguiente código para cada organización manualmente si es necesario)

-- 2. Para cada organización, crear cuentas si no existen
DO $$
DECLARE
    org RECORD;
    account1_id TEXT;
    account2_id TEXT;
BEGIN
    FOR org IN SELECT id, name, slug FROM organizations LOOP
        RAISE NOTICE 'Procesando organización: % (%)', org.name, org.slug;

        -- Verificar si ya existen cuentas
        SELECT id INTO account1_id FROM transfer_accounts
        WHERE "organizationId" = org.id AND "isActive" = true
        ORDER BY "createdAt" ASC LIMIT 1;

        -- Si no existe la primera cuenta, crearla
        IF account1_id IS NULL THEN
            INSERT INTO transfer_accounts ("id", "organizationId", "name", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, org.id, 'Transfer. Andrés', true, NOW(), NOW())
            RETURNING id INTO account1_id;
            RAISE NOTICE '  Creada cuenta 1: %', account1_id;
        END IF;

        -- Buscar segunda cuenta
        SELECT id INTO account2_id FROM transfer_accounts
        WHERE "organizationId" = org.id AND "isActive" = true AND id != account1_id
        ORDER BY "createdAt" ASC LIMIT 1;

        -- Si no existe la segunda cuenta, crearla
        IF account2_id IS NULL THEN
            INSERT INTO transfer_accounts ("id", "organizationId", "name", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, org.id, 'Transfer. Leonardo', true, NOW(), NOW())
            RETURNING id INTO account2_id;
            RAISE NOTICE '  Creada cuenta 2: %', account2_id;
        END IF;

        -- Migrar movimientos TRANSFERENCIA_ANDRES
        UPDATE cash_movements
        SET
            method = 'TRANSFERENCIA',
            "transferAccountId" = account1_id
        WHERE "organizationId" = org.id
          AND method = 'TRANSFERENCIA_ANDRES'
          AND "transferAccountId" IS NULL;

        RAISE NOTICE '  Migrados movimientos TRANSFERENCIA_ANDRES';

        -- Migrar movimientos TRANSFERENCIA_HERMANO
        UPDATE cash_movements
        SET
            method = 'TRANSFERENCIA',
            "transferAccountId" = account2_id
        WHERE "organizationId" = org.id
          AND method = 'TRANSFERENCIA_HERMANO'
          AND "transferAccountId" IS NULL;

        RAISE NOTICE '  Migrados movimientos TRANSFERENCIA_HERMANO';
    END LOOP;
END $$;

-- 3. Verificar que no queden movimientos sin migrar
SELECT
    o.name as organizacion,
    COUNT(*) as movimientos_pendientes
FROM cash_movements cm
JOIN organizations o ON o.id = cm."organizationId"
WHERE cm.method IN ('TRANSFERENCIA_ANDRES', 'TRANSFERENCIA_HERMANO')
GROUP BY o.name;

-- Si el resultado está vacío, la migración fue exitosa
