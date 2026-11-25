import "dotenv/config";
import express from "express";

const app = express();
const puerto = Number(process.env.PORT || "3000");

app.use(express.json());

app.get("/api/salud", (_req, res) => {
  res.status(200).json({ mensaje: "API de turnos médicos funcionando" });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});