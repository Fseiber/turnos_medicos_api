import type { Request, Response } from "express";
import { ErrorCredencialesInvalidas, ErrorValidacionUsuario, loginUsuario, registrarUsuario } from "./service";

export async function login(req: Request, res: Response) {
  try {
    const resultado = await loginUsuario(req.body);
    res.status(200).json(resultado);
  } catch (error) {
    if (error instanceof ErrorValidacionUsuario) {
      res.status(400).json({ mensaje: error.message });
      return;
    }
    if (error instanceof ErrorCredencialesInvalidas) {
      res.status(401).json({ mensaje: error.message });
      return;
    }
    res.status(500).json({ mensaje: "No se pudo iniciar sesión" });
  }
}

export async function registrar(req: Request, res: Response) {
  try {
    const usuario = await registrarUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    if (error instanceof ErrorValidacionUsuario) {
      res.status(400).json({ mensaje: error.message });
      return;
    }
    res.status(500).json({ mensaje: "No se pudo registrar el usuario" });
  }
}
