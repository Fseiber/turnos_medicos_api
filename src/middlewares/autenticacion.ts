import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const coincidencia = /^Bearer\s+(\S+)$/i.exec(authorization ?? "");
  const secreto = process.env.JWT_SECRET;

  if (!coincidencia || !secreto || secreto.trim() === "") {
    res.status(401).json({ mensaje: "Token ausente o inválido" });
    return;
  }

  try {
    verify(coincidencia[1], secreto, { algorithms: ["HS256"] });
  } catch (error) {
    res.status(401).json({ mensaje: "Token inválido o vencido" });
    return;
  }

  next();
}
