import { RolUsuario } from './rol-usuario';
import { Usuario } from './usuario.entity';

function usuarioCon(rol: RolUsuario): Usuario {
  return Usuario.crear({ nombre: 'Ana', correo: 'ana@ejemplo.com', contrasenaHash: 'hash', rol });
}

describe('Usuario.puedeEliminarSuCuenta', () => {
  it('una cuenta del portal puede eliminarse a sí misma', () => {
    expect(usuarioCon('PUBLICO').puedeEliminarSuCuenta()).toBe(true);
  });

  it('las cuentas del personal no, porque firman el historial de las piezas', () => {
    expect(usuarioCon('PERSONAL').puedeEliminarSuCuenta()).toBe(false);
    expect(usuarioCon('ADMIN').puedeEliminarSuCuenta()).toBe(false);
  });
});
