import express from "express";
import { list, create, update, stats } from "../controllers/todo.controller.js";
import * as todoCtrl from "../controllers/todo.controller.js";

const router = express.Router();

// CRUD & stats
router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.delete("/todos/:id", todoCtrl.remove);
router.get("/stats", stats);

export default router;
