import { ESPECIALIDADES, ESTADOS_TURNO } from "./model";
import { actualizarTurno as actualizarTurnoEnDB, buscarTurnoPorId, buscarTodosLosTurnos, crearTurno as guardarTurno, eliminarTurno as eliminarTurnoEnDB } from "./dao";

export class ErrorValidacionTurno extends Error {}

function validarEspecialidad(especialidad: unknown): asserts especialidad is string {
  if (typeof especialidad !== "string" || !ESPECIALIDADES.includes(especialidad)) {
    throw new ErrorValidacionTurno("La especialidad no está permitida");
  }
}

export function listarTurnos(consulta: { estado?: unknown; especialidad?: unknown } = {}) {
  const { estado, especialidad } = consulta;
  const filtros: { estado?: string; especialidad?: string } = {};

  if (Array.isArray(estado) || Array.isArray(especialidad)) {
    throw new ErrorValidacionTurno("Los filtros estado y especialidad no pueden repetirse");
  }
  if (estado !== undefined) {
    if (typeof estado !== "string" || !ESTADOS_TURNO.includes(estado)) {
      throw new ErrorValidacionTurno("El estado no está permitido");
    }
    filtros.estado = estado;
  }
  if (especialidad !== undefined) {
    validarEspecialidad(especialidad);
    filtros.especialidad = especialidad;
  }

  return buscarTodosLosTurnos(filtros);
}

export function crearTurno(datos: unknown) {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new ErrorValidacionTurno("Enviá los datos del turno en un objeto JSON");
  }

  const { paciente, especialidad, fecha } = datos as Record<string, unknown>;

  if (typeof paciente !== "string" || paciente.trim() === "") {
    throw new ErrorValidacionTurno("El nombre del paciente es obligatorio");
  }

  validarEspecialidad(especialidad);

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
function validarIdTurno(id: string) {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ErrorValidacionTurno("El ID del turno no es válido");
  }
}

export function obtenerTurnoPorId(id: string) {
  validarIdTurno(id);
  return buscarTurnoPorId(id);
}

export function eliminarTurno(id: string) {
  validarIdTurno(id);
  return eliminarTurnoEnDB(id);
}

export async function actualizarTurno(id: string, datos: unknown) {
  const turno = await obtenerTurnoPorId(id);
  if (!turno) {
    return null;
  }

  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new ErrorValidacionTurno("Enviá los datos del turno en un objeto JSON");
  }

  const { paciente, especialidad, fecha, estado } = datos as Record<string, unknown>;
  if (typeof paciente !== "string" || paciente.trim() === "") {
    throw new ErrorValidacionTurno("El nombre del paciente es obligatorio");
  }
  validarEspecialidad(especialidad);

  if (typeof fecha !== "string") {
    throw new ErrorValidacionTurno("La fecha debe enviarse como texto");
  }
  const fechaTurno = new Date(fecha);
  if (Number.isNaN(fechaTurno.getTime())) {
    throw new ErrorValidacionTurno("La fecha del turno debe ser válida");
  }
  if (fechaTurno.getTime() !== turno.fecha.getTime() && fechaTurno.getTime() <= Date.now()) {
    throw new ErrorValidacionTurno("La nueva fecha del turno debe ser futura");
  }

  if (typeof estado !== "string" || !ESTADOS_TURNO.includes(estado)) {
    throw new ErrorValidacionTurno("El estado no está permitido");
  }
  if (estado !== turno.estado && turno.estado !== "PENDIENTE") {
    throw new ErrorValidacionTurno("Solo un turno PENDIENTE puede cambiar de estado");
  }

  return actualizarTurnoEnDB(id, {
    paciente: paciente.trim(),
    especialidad,
    fecha: fechaTurno,
    estado,
  });
}
