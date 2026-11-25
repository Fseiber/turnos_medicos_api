import mongoose from "mongoose";

export async function conectarDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Falta MONGO_URI en el archivo .env");
  }

  await mongoose.connect(uri, { dbName: "turnos_medicos" });
  console.log("MongoDB conectado");
}