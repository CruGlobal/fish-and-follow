-- 1. Rename old enum
ALTER TYPE role_enum RENAME TO role_enum_old;

-- 2. Create new enum
CREATE TYPE role_enum AS ENUM ('admin', 'staff');

-- 3. Drop default on role column (if any)
ALTER TABLE "user" ALTER COLUMN role DROP DEFAULT;

-- 4. Alter column type, mapping 'user' → 'staff'
ALTER TABLE "user"
ALTER COLUMN role TYPE role_enum
USING CASE 
         WHEN role = 'user' THEN 'staff'::role_enum
         ELSE role::text::role_enum
      END;

-- 5. Set new default (adjust as needed, for example 'staff')
ALTER TABLE "user" ALTER COLUMN role SET DEFAULT 'admin';

-- 6. Drop old enum
DROP TYPE role_enum_old;