import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // tên công việc
  completed: { type: Boolean, default: false, index: true }, // đã hoàn thành hay chưa
  dueAt: { type: Date }, // deadline (có thể có hoặc không)
}, { timestamps: true }); // tự động tạo createdAt, updatedAt

// Tạo index theo thời gian tạo và ngày đến hạn → giúp filter / phân trang nhanh
TodoSchema.index({ createdAt: 1 });
TodoSchema.index({ dueAt: 1 }); // Thêm index cho dueAt để hỗ trợ filter theo deadline

export default mongoose.model("Todo", TodoSchema);