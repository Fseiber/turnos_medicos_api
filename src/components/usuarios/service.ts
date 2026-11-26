import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { buscarUsuarioPorEmail, crearUsuario } from "./dao";

export class ErrorValidacionUsuario extends Error {}
export class ErrorCredencialesInvalidas extends Error {}

export async function loginUsuario(datos: unknown) {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new ErrorValidacionUsuario("Enviá los datos del usuario en un objeto JSON");
  }

  const { email, password } = datos as Record<string, unknown>;
  if (typeof email !== "string") {
    throw new ErrorValidacionUsuario("El email no es válido");
  }
  const emailNormalizado = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    throw new ErrorValidacionUsuario("El email no es válido");
  }
  if (typeof password !== "string" || password.length === 0 || Buffer.byteLength(password, "utf8") > 72) {
    throw new ErrorValidacionUsuario("La contraseña es obligatoria y no debe superar 72 bytes");
  }

  const usuario = await buscarUsuarioPorEmail(emailNormalizado);
  if (!usuario || !(await compare(password, usuario.passwordHash))) {
    throw new ErrorCredencialesInvalidas("Credenciales inválidas");
  }

  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.trim() === "") {
    throw new Error("Falta configurar JWT_SECRET");
  }
  const token = sign({}, secreto, {
    subject: usuario._id.toString(),
    expiresIn: "1h",
    algorithm: "HS256",
  });
  return { token };
}

export async function registrarUsuario(datos: unknown) {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new ErrorValidacionUsuario("Enviá los datos del usuario en un objeto JSON");
  }

  const { email, password } = datos as Record<string, unknown>;
  if (typeof email !== "string") {
    throw new ErrorValidacionUsuario("El email no es válido");
  }
  const emailNormalizado = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    throw new ErrorValidacionUsuario("El email no es válido");
  }
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    throw new ErrorValidacionUsuario("La contraseña debe tener al menos 8 caracteres y no superar 72 bytes");
  }

  if (await buscarUsuarioPorEmail(emailNormalizado)) {
    throw new ErrorValidacionUsuario("El email ya está registrado");
  }

  const passwordHash = await hash(password, 10);
  try {
    const usuario = await crearUsuario({ email: emailNormalizado, passwordHash });
    return { id: usuario._id, email: usuario.email };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      throw new ErrorValidacionUsuario("El email ya está registrado");
    }
    throw error;
  }
}
