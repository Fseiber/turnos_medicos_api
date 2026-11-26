import type { Request, Response } from "express";
import { crearTurno, ErrorValidacionTurno } from "./service";

export async function crear(req: Request, res: Response) {
  try {
    const turno = await crearTurno(req.body);
    res.status(201).json(turno);
  } catch (error) {
    if (error instanceof ErrorValidacionTurno) {
      res.status(400).json({ mensaje: error.message });
      return;
    }

    res.status(500).json({ mensaje: "No se pudo crear el turno" });
  }
}