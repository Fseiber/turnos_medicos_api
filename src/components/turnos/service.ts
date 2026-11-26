import { crearTurno as guardarTurno } from "./dao";
import { ESPECIALIDADES } from "./model";

export class ErrorValidacionTurno extends Error {}

export function crearTurno(datos: unknown) {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new ErrorValidacionTurno("Enviá los datos del turno en un objeto JSON");
  }

  const { paciente, especialidad, fecha } = datos as Record<string, unknown>;

  if (typeof paciente !== "string" || paciente.trim() === "") {
    throw new ErrorValidacionTurno("El nombre del paciente es obligatorio");
  }

  if (typeof especialidad !== "string" || !ESPECIALIDADES.includes(especialidad)) {
    throw new ErrorValidacionTurno("La especialidad no está permitida");
  }

  if (typeof fecha !== "string") {
    throw new ErrorValidacionTurno("La fecha debe enviarse como texto");
  }

  const fechaTurno = new Date(fecha);

  if (Number.isNaN(fechaTurno.getTime()) || fechaTurno.getTime() <= Date.now()) {
    throw new ErrorValidacionTurno("La fecha del turno debe ser válida y futura");
  }

  return guardarTurno({
    paciente: paciente.trim(),
    especialidad,
    fecha: fechaTurno,
  });
}