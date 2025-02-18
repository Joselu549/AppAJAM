import { Router } from "express";
const router = Router();
import { join } from "path";

router.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

export default router;
