require('dotenv').config();
const { sequelize } = require('../models');
const {
  ROLE_DISTRICT_EDO_LEGACY,
  ROLE_ENVIRONMENTAL_DISTRICT_OFFICER,
} = require('../utils/roles');

const escapeSqlLiteral = (value) => String(value).replaceAll("'", "''");

async function main() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && process.env.CONFIRM_ROLE_RENAME !== 'yes') {
    throw new Error(
      'Refusing to rename roles in production. Set CONFIRM_ROLE_RENAME=yes to proceed.',
    );
  }

  await sequelize.authenticate();

  const [rows] = await sequelize.query(`
    SELECT t.typname AS enum_type
    FROM pg_type t
    JOIN pg_attribute a ON a.atttypid = t.oid
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND c.relname = 'users'
      AND a.attname = 'role'
      AND t.typtype = 'e'
    LIMIT 1;
  `);

  const enumType = rows?.[0]?.enum_type;
  if (!enumType || !/^[A-Za-z0-9_]+$/.test(enumType)) {
    throw new Error(
      `Could not determine enum type for public.users.role (got: ${enumType || 'null'})`,
    );
  }

  const newValue = escapeSqlLiteral(ROLE_ENVIRONMENTAL_DISTRICT_OFFICER);
  const oldValue = escapeSqlLiteral(ROLE_DISTRICT_EDO_LEGACY);

  // Ensure the new enum value exists (idempotent)
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = '${enumType}'
          AND e.enumlabel = '${newValue}'
      ) THEN
        EXECUTE 'ALTER TYPE "' || '${enumType}' || '" ADD VALUE ' || quote_literal('${newValue}');
      END IF;
    END $$;
  `);

  const [result] = await sequelize.query(`
    UPDATE public.users
    SET role = '${newValue}'
    WHERE role = '${oldValue}';
  `);

  const updated = result?.rowCount ?? 0;
  console.log(
    `✅ Updated ${updated} user(s) from ${ROLE_DISTRICT_EDO_LEGACY} -> ${ROLE_ENVIRONMENTAL_DISTRICT_OFFICER}`,
  );
}

main()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌', err.message || err);
    try {
      await sequelize.close();
    } catch {}
    process.exit(1);
  });
