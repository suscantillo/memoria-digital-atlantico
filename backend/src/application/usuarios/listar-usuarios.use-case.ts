import { UsuarioRepositorio } from '../../domain/usuarios/usuario.repositorio';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { UsuarioAdministradoDto, UsuariosPaginadosDto } from './dto/usuario-administrado.dto';

export class ListarUsuarios {
  constructor(private readonly usuarios: UsuarioRepositorio) {}

  async ejecutar(consulta: ListarUsuariosDto): Promise<UsuariosPaginadosDto> {
    const parametros = {
      pagina: consulta.pagina,
      limite: consulta.limite,
      direccion: consulta.direccion,
      orden: consulta.orden,
      busqueda: consulta.busqueda?.trim(),
    };
    const resultado = await this.usuarios.listarPersonal(parametros);
    const respuesta = new UsuariosPaginadosDto();
    respuesta.datos = resultado.datos.map((usuario) =>
      UsuarioAdministradoDto.desdeEntidad(usuario),
    );
    respuesta.meta = resultado.meta;
    return respuesta;
  }
}
