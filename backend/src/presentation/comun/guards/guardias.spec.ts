import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { ServicioTokensFalso } from '../../../../test/dobles/seguridad.memoria';
import { UsuarioRepositorioMemoria } from '../../../../test/dobles/usuario-repositorio.memoria';
import { Autenticado } from '../decoradores/autenticado.decorator';
import { Publica } from '../decoradores/publica.decorator';
import { SolicitudAutenticada } from '../solicitud-autenticada';
import { GuardiaJwt } from './guardia-jwt.guard';
import { GuardiaRoles } from './guardia-roles.guard';

class ControladorDePrueba {
  @Publica()
  abierta() {}

  sinMarca() {}

  @Autenticado()
  conSesion() {}

  @Autenticado('ADMIN', 'PERSONAL')
  delPersonal() {}
}

@Publica()
class ControladorPublico {
  cualquiera() {}
}

function contexto(
  clase: new () => object,
  metodo: string,
  authorization?: string,
): { ctx: ExecutionContextHost; solicitud: SolicitudAutenticada } {
  const solicitud = { headers: { authorization } } as SolicitudAutenticada;
  const manejador = (clase.prototype as Record<string, () => void>)[metodo];
  const ctx = new ExecutionContextHost([solicitud], clase, manejador);
  return { ctx, solicitud };
}

describe('Guardias de autenticación y roles', () => {
  const reflector = new Reflector();
  const usuarios = new UsuarioRepositorioMemoria();
  const jwt = new GuardiaJwt(new ServicioTokensFalso(), usuarios, reflector);
  const roles = new GuardiaRoles(reflector);

  async function pasa(clase: new () => object, metodo: string, token?: string) {
    const { ctx } = contexto(clase, metodo, token ? `Bearer ${token}` : undefined);
    return (await jwt.canActivate(ctx)) && roles.canActivate(ctx);
  }

  it('deja pasar sin token las rutas marcadas como públicas', async () => {
    await expect(pasa(ControladorDePrueba, 'abierta')).resolves.toBe(true);
  });

  it('respeta @Publica puesta en el controlador completo', async () => {
    await expect(pasa(ControladorPublico, 'cualquiera')).resolves.toBe(true);
  });

  it('exige token en una ruta sin ninguna marca: nace protegida', async () => {
    await expect(pasa(ControladorDePrueba, 'sinMarca')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza un token inválido con 401', async () => {
    await expect(pasa(ControladorDePrueba, 'conSesion', 'basura')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deja pasar a cualquier rol con sesión cuando la ruta no pide roles', async () => {
    await expect(pasa(ControladorDePrueba, 'conSesion', 'acceso:u1:PUBLICO')).resolves.toBe(true);
  });

  it('rechaza con 403 a una cuenta PUBLICO en una ruta del personal', async () => {
    await expect(
      pasa(ControladorDePrueba, 'delPersonal', 'acceso:u1:PUBLICO'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deja pasar a PERSONAL y ADMIN en una ruta del personal', async () => {
    await expect(pasa(ControladorDePrueba, 'delPersonal', 'acceso:u1:PERSONAL')).resolves.toBe(
      true,
    );
    await expect(pasa(ControladorDePrueba, 'delPersonal', 'acceso:u2:ADMIN')).resolves.toBe(true);
  });

  it('deja en la solicitud el usuario del token para los controladores', async () => {
    const { ctx, solicitud } = contexto(ControladorDePrueba, 'conSesion', 'Bearer acceso:u9:ADMIN');
    await jwt.canActivate(ctx);
    expect(solicitud.usuario).toEqual({ id: 'u9', correo: 'u9@prueba.local', rol: 'ADMIN' });
  });
});
