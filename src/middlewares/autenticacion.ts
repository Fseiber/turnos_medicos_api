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
    const payload = verify(coincidencia[1], secreto, { algorithms: ["HS256"] });
    if (typeof payload === "string" || typeof payload.sub !== "string" || !/^[0-9a-fA-F]{24}$/.test(payload.sub)) {
      res.status(401).json({ mensaje: "Token inválido o vencido" });
      return;
    }
    res.locals.usuarioId = payload.sub;
  } catch (error) {
    res.status(401).json({ mensaje: "Token inválido o vencido" });
    return;
  }

  next();
}
