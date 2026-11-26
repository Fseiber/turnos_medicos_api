import type { Request, Response } from "express";
import { actualizarTurno, crearTurno, eliminarTurno, ErrorValidacionTurno, listarTurnos, obtenerTurnoPorId } from "./service";

export async function eliminar(req: Request<{ id: string }>, res: Response) {
  try {
    const turno = await eliminarTurno(req.params.id);
    if (!turno) {
      res.status(404).json({ mensaje: "Turno no encontrado" });
      return;
    }
    res.status(200).json({ mensaje: "Turno eliminado" });
  } catch (error) {
    if (error instanceof ErrorValidacionTurno) {
      res.status(400).json({ mensaje: error.message });
      return;
    }
    res.status(500).json({ mensaje: "No se pudo eliminar el turno" });
  }
}

export async function actualizar(req: Request<{ id: string }>, res: Response) {
  try {
    const turno = await actualizarTurno(req.params.id, req.body);
    if (!turno) {
      res.status(404).json({ mensaje: "Turno no encontrado" });
      return;
    }
    res.status(200).json(turno);
  } catch (error) {
    if (error instanceof ErrorValidacionTurno) {
      res.status(400).json({ mensaje: error.message });
      return;
    }
    res.status(500).json({ mensaje: "No se pudo actualizar el turno" });
  }
}

export async function listar(_req: Request, res: Response) {
  try {
    const turnos = await listarTurnos();
    res.status(200).json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron listar los turnos" });
  }
}

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

export async function obtenerPorId(req: Request<{ id: string }>, res: Response) {
  try {
    const turno = await obtenerTurnoPorId(req.params.id);

    if (!turno) {
      res.status(404).json({ mensaje: "Turno no encontrado" });
      return;
    }

    res.status(200).json(turno);
  } catch (error) {
    if (error instanceof ErrorValidacionTurno) {
      res.status(400).json({ mensaje: error.message });
      return;
    }

    res.status(500).json({ mensaje: "No se pudo consultar el turno" });
  }
}
