import { Turno } from "./model";

type DatosNuevoTurno = {
  paciente: string;
  especialidad: string;
  fecha: Date;
};

export function crearTurno(datos: DatosNuevoTurno) {
  return Turno.create(datos);
}

export function buscarTurnoPorId(id: string) {
  return Turno.findById(id);
}

export function buscarTodosLosTurnos() {
  return Turno.find();
}

export function eliminarTurno(id: string) {
  return Turno.findByIdAndDelete(id);
}

export function actualizarTurno(id: string, datos: DatosNuevoTurno & { estado: string }) {
  return Turno.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
}
