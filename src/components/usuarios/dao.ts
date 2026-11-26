import { User } from "./model";

export function buscarUsuarioPorEmail(email: string) {
  return User.findOne({ email });
}

export function crearUsuario(datos: { email: string; passwordHash: string }) {
  return User.create(datos);
}
