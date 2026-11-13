-- AlterTable
ALTER TABLE "piezas" ADD COLUMN     "autor" TEXT,
ADD COLUMN     "palabras_clave" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tema" TEXT;
