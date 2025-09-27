import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import todoRoutes from "./src/routes/todo.routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("dev"));

const clientUrl = process.env.CLIENT_URL || "*";
app.use(cors({
  origin: clientUrl,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"]
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/todos", todoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
