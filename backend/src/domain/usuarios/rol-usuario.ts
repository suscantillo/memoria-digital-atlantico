export const ROLES_USUARIO = ['ADMIN', 'PERSONAL', 'PUBLICO'] as const;
export type RolUsuario = (typeof ROLES_USUARIO)[number];
