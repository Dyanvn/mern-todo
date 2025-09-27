import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // tên công việc
  completed: { type: Boolean, default: false, index: true }, // đã hoàn thành hay chưa
  dueAt: { type: Date }, // deadline (có thể có hoặc không)
}, { timestamps: true }); // tự động tạo createdAt, updatedAt

// Tạo index theo thời gian tạo → giúp filter / phân trang nhanh
TodoSchema.index({ createdAt: 1 });

export default mongoose.model("Todo", TodoSchema);
