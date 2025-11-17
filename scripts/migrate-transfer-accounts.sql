-- ============================================
-- Script de migración de cuentas de transferencia
-- EJECUTAR ANTES de hacer: npx prisma db push
-- ============================================

-- Paso 1: Crear tabla transfer_accounts
CREATE TABLE IF NOT EXISTS transfer_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL,
  name TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT transfer_accounts_organizationId_fkey
    FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS transfer_accounts_organizationId_idx ON transfer_accounts("organizationId");

-- Paso 2: Agregar columna transferAccountId a cash_movements
ALTER TABLE cash_movements
ADD COLUMN IF NOT EXISTS "transferAccountId" TEXT;

CREATE INDEX IF NOT EXISTS cash_movements_transferAccountId_idx ON cash_movements("transferAccountId");

-- Paso 3: Agregar columna transferTotals a daily_closes
ALTER TABLE daily_closes
ADD COLUMN IF NOT EXISTS "transferTotals" JSONB;

-- Paso 4: Crear cuentas de transferencia por defecto para cada organización
INSERT INTO transfer_accounts (id, "organizationId", name, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  id,
  'Transfer. Leonardo',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM transfer_accounts
  WHERE transfer_accounts."organizationId" = organizations.id
    AND transfer_accounts.name = 'Transfer. Leonardo'
);

INSERT INTO transfer_accounts (id, "organizationId", name, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  id,
  'Transfer. Andrés',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM transfer_accounts
  WHERE transfer_accounts."organizationId" = organizations.id
    AND transfer_accounts.name = 'Transfer. Andrés'
);

-- Paso 5: Migrar datos de CashMovement - TRANSFERENCIA_HERMANO → Leonardo
UPDATE cash_movements cm
SET
  method = 'TRANSFERENCIA'::"PaymentMethod",
  "transferAccountId" = ta.id
FROM transfer_accounts ta
WHERE cm."organizationId" = ta."organizationId"
  AND ta.name = 'Transfer. Leonardo'
  AND cm.method = 'TRANSFERENCIA_HERMANO'::"PaymentMethod";

-- Paso 6: Migrar datos de CashMovement - TRANSFERENCIA_ANDRES → Andrés
UPDATE cash_movements cm
SET
  method = 'TRANSFERENCIA'::"PaymentMethod",
  "transferAccountId" = ta.id
FROM transfer_accounts ta
WHERE cm."organizationId" = ta."organizationId"
  AND ta.name = 'Transfer. Andrés'
  AND cm.method = 'TRANSFERENCIA_ANDRES'::"PaymentMethod";

-- Paso 7: Migrar datos de DailyClose - crear JSON con totales
DO $$
DECLARE
  org_record RECORD;
  close_record RECORD;
  leonardo_id TEXT;
  andres_id TEXT;
  totals_json JSONB;
BEGIN
  FOR org_record IN SELECT id FROM organizations LOOP
    -- Obtener IDs de cuentas
    SELECT id INTO leonardo_id FROM transfer_accounts
    WHERE "organizationId" = org_record.id AND name = 'Transfer. Leonardo';

    SELECT id INTO andres_id FROM transfer_accounts
    WHERE "organizationId" = org_record.id AND name = 'Transfer. Andrés';

    -- Actualizar cada cierre
    FOR close_record IN
      SELECT id, "totalTransferHermano", "totalTransferAndres"
      FROM daily_closes
      WHERE "organizationId" = org_record.id
    LOOP
      totals_json := jsonb_build_object(
        leonardo_id, close_record."totalTransferHermano",
        andres_id, close_record."totalTransferAndres"
      );

      UPDATE daily_closes
      SET "transferTotals" = totals_json
      WHERE id = close_record.id;
    END LOOP;
  END LOOP;
END $$;

-- Paso 8: Actualizar enum PaymentMethod para eliminar valores antiguos
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA');

ALTER TABLE cash_movements
  ALTER COLUMN method TYPE "PaymentMethod"
  USING method::text::"PaymentMethod";

DROP TYPE "PaymentMethod_old";

-- Paso 9: Eliminar columnas antiguas de daily_closes
ALTER TABLE daily_closes DROP COLUMN IF EXISTS "totalTransferAndres";
ALTER TABLE daily_closes DROP COLUMN IF EXISTS "totalTransferHermano";

-- Paso 10: Agregar constraint de foreign key para transferAccountId
ALTER TABLE cash_movements
ADD CONSTRAINT IF NOT EXISTS cash_movements_transferAccountId_fkey
  FOREIGN KEY ("transferAccountId") REFERENCES transfer_accounts(id) ON DELETE SET NULL;

-- ============================================
-- Migración completada
-- Ahora puedes ejecutar: npx prisma db push
-- ============================================
