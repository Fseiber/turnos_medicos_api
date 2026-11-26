import { Router } from "express";
import { autenticar } from "../../middlewares/autenticacion";
import { actualizar, crear, eliminar, listar, obtenerPorId } from "./controller";

const router = Router();

router.use(autenticar);

router.post("/", crear);
router.get("/", listar);
router.get("/:id", obtenerPorId);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;
