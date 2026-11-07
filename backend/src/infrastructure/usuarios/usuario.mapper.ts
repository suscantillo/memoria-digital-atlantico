import { Usuario as UsuarioFila } from '@prisma/client';
import { Usuario } from '../../domain/usuarios/usuario.entity';

export const UsuarioMapper = {
  aEntidad(fila: UsuarioFila): Usuario {
    return Usuario.reconstruir({
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      contrasenaHash: fila.contrasenaHash,
      rol: fila.rol,
      activo: fila.activo,
      creadoEn: fila.creadoEn,
      actualizadoEn: fila.actualizadoEn,
    });
  },
};
