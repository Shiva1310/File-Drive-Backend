import express from "express";
import { getUploadUrl, listUserFiles, deleteFile } from "../controllers/fileController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/signed-url", verifyToken, getUploadUrl);
router.get("/", verifyToken, listUserFiles);
router.delete("/:key", verifyToken, deleteFile);

export default router;
