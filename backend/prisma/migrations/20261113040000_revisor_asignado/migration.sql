-- AlterTable
ALTER TABLE "archivos_digitales" ADD COLUMN     "revisor_asignado_id" UUID;

-- CreateIndex
CREATE INDEX "archivos_digitales_revisor_asignado_id_idx" ON "archivos_digitales"("revisor_asignado_id");

-- AddForeignKey
ALTER TABLE "archivos_digitales" ADD CONSTRAINT "archivos_digitales_revisor_asignado_id_fkey" FOREIGN KEY ("revisor_asignado_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
