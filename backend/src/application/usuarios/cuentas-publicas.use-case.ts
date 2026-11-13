import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { CuentaPublicaDto, CuentasPublicasPaginadasDto } from './dto/cuenta-publica.dto';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';

const SOLO_PUBLICO = ['PUBLICO'] as const;

/** El ADMIN consulta las cuentas del portal, con búsqueda por nombre o correo. */
export class ListarCuentasPublicas {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(consulta: ListarUsuariosDto): Promise<CuentasPublicasPaginadasDto> {
    const resultado = await this.usuarios.listarPublico({
      pagina: consulta.pagina,
      limite: consulta.limite,
      direccion: consulta.direccion,
      // el rol de todas es PUBLICO: ordenar por él no dice nada
      orden: consulta.orden === 'rol' ? 'nombre' : consulta.orden,
      busqueda: consulta.busqueda?.trim(),
    });
    const respuesta = new CuentasPublicasPaginadasDto();
    respuesta.datos = resultado.datos.map((usuario) => CuentaPublicaDto.desdeEntidad(usuario));
    respuesta.meta = resultado.meta;
    return respuesta;
  }
}

/** Desactiva una cuenta del portal y revoca sus sesiones: no puede volver a entrar. */
export class DesactivarCuentaPublica {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(id: string): Promise<CuentaPublicaDto> {
    const usuario = await this.usuarios.desactivar(id, new Date(), [...SOLO_PUBLICO]);
    return CuentaPublicaDto.desdeEntidad(usuario);
  }
}

export class ReactivarCuentaPublica {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(id: string): Promise<CuentaPublicaDto> {
    return CuentaPublicaDto.desdeEntidad(await this.usuarios.reactivar(id, [...SOLO_PUBLICO]));
  }
}
