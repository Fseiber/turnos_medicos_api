import { Router } from "express";
import { crear } from "./controller";

const router = Router();

router.post("/", crear);

export default router;