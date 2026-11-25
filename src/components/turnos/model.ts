import { Schema, model } from "mongoose";

export const ESPECIALIDADES = ["Clínica Médica", "Pediatría", "Dermatología"];
export const ESTADOS_TURNO = ["PENDIENTE", "ATENDIDO", "CANCELADO"];

const esquemaTurno = new Schema({
  paciente: { type: String, required: true, trim: true },
  especialidad: { type: String, required: true, enum: ESPECIALIDADES },
  fecha: { type: Date, required: true },
  estado: { type: String, enum: ESTADOS_TURNO, default: "PENDIENTE" },
});

export const Turno = model("Turno", esquemaTurno);