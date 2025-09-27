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

// Thêm middleware xử lý lỗi toàn cục ngay tại đây
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/todos", todoRoutes);

// Thêm log cho DELETE request ngay tại đây
app.delete("/api/todos/:id", (req, res, next) => {
  console.log("Received DELETE request for ID:", req.params.id); // Log ID
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});