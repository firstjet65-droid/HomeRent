-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE');

-- AlterTable
ALTER TABLE "listings"
ADD COLUMN "propertyType" "PropertyType" NOT NULL DEFAULT 'APARTMENT';

-- Backfill existing standalone homes into HOUSE for immediate filtering support
UPDATE "listings"
SET "propertyType" = 'HOUSE'
WHERE (COALESCE("title", '') || ' ' || COALESCE("description", '')) ~* '(house|villa|chalet|yurt|cottage|home)';
