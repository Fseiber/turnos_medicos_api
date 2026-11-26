import { Turno } from "./model";

type DatosNuevoTurno = {
  paciente: string;
  especialidad: string;
  fecha: Date;
};

export function crearTurno(datos: DatosNuevoTurno) {
  return Turno.create(datos);
}