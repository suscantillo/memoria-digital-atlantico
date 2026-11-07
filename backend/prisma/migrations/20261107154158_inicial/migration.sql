-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'PERSONAL', 'PUBLICO');

-- CreateEnum
CREATE TYPE "TipoPieza" AS ENUM ('DOCUMENTO', 'FOTOGRAFIA', 'PERIODICO');

-- CreateEnum
CREATE TYPE "EstadoPieza" AS ENUM ('REGISTRADA', 'ESCANEADA', 'REVISADA', 'PUBLICADA');

-- CreateEnum
CREATE TYPE "EstadoArchivoDigital" AS ENUM ('EN_REVISION', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocada_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" UUID NOT NULL,
    "deposito" TEXT NOT NULL,
    "estanteria" TEXT NOT NULL,
    "caja" TEXT NOT NULL,
    "descripcion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoPieza" NOT NULL,
    "estado" "EstadoPieza" NOT NULL DEFAULT 'REGISTRADA',
    "anio" INTEGER,
    "restringida" BOOLEAN NOT NULL DEFAULT false,
    "ubicacion_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "piezas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos_digitales" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "nombre_original" TEXT NOT NULL,
    "ruta_almacenamiento" TEXT NOT NULL,
    "tipo_mime" TEXT NOT NULL,
    "tamano_bytes" INTEGER NOT NULL,
    "estado" "EstadoArchivoDigital" NOT NULL DEFAULT 'EN_REVISION',
    "motivo_rechazo" TEXT,
    "subido_por_id" UUID NOT NULL,
    "revisado_por_id" UUID,
    "revisado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archivos_digitales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_pieza" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "usuario_id" UUID,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pieza_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_token_hash_key" ON "sesiones"("token_hash");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_idx" ON "sesiones"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_deposito_estanteria_caja_key" ON "ubicaciones"("deposito", "estanteria", "caja");

-- CreateIndex
CREATE UNIQUE INDEX "piezas_codigo_key" ON "piezas"("codigo");

-- CreateIndex
CREATE INDEX "piezas_titulo_idx" ON "piezas"("titulo");

-- CreateIndex
CREATE INDEX "piezas_estado_idx" ON "piezas"("estado");

-- CreateIndex
CREATE INDEX "piezas_tipo_idx" ON "piezas"("tipo");

-- CreateIndex
CREATE INDEX "piezas_anio_idx" ON "piezas"("anio");

-- CreateIndex
CREATE INDEX "piezas_ubicacion_id_idx" ON "piezas"("ubicacion_id");

-- CreateIndex
CREATE INDEX "archivos_digitales_estado_idx" ON "archivos_digitales"("estado");

-- CreateIndex
CREATE INDEX "archivos_digitales_pieza_id_idx" ON "archivos_digitales"("pieza_id");

-- CreateIndex
CREATE INDEX "eventos_pieza_pieza_id_idx" ON "eventos_pieza"("pieza_id");

-- CreateIndex
CREATE INDEX "eventos_pieza_creado_en_idx" ON "eventos_pieza"("creado_en");

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_digitales" ADD CONSTRAINT "archivos_digitales_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_digitales" ADD CONSTRAINT "archivos_digitales_subido_por_id_fkey" FOREIGN KEY ("subido_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_digitales" ADD CONSTRAINT "archivos_digitales_revisado_por_id_fkey" FOREIGN KEY ("revisado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_pieza" ADD CONSTRAINT "eventos_pieza_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_pieza" ADD CONSTRAINT "eventos_pieza_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
