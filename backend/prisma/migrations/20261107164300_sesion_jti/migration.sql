-- DropIndex
DROP INDEX "sesiones_token_hash_key";

-- AlterTable
ALTER TABLE "sesiones" DROP COLUMN "token_hash",
ADD COLUMN     "jti" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_jti_key" ON "sesiones"("jti");
