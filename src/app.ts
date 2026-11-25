import "dotenv/config";
import express from "express";
import { conectarDB } from "./db";

const app = express();
const puerto = Number(process.env.PORT || "3000");

app.use(express.json());

app.get("/api/salud", (_req, res) => {
  res.status(200).json({ mensaje: "API de turnos médicos funcionando" });
});

async function iniciar() {
  await conectarDB();

  app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
  });
}

iniciar().catch((error: unknown) => {
  const tipo = error instanceof Error ? error.name : "Error desconocido";
  console.error(`No se pudo iniciar la API (${tipo}). Revisá MONGO_URI y el acceso en Atlas.`);
  process.exitCode = 1;
});