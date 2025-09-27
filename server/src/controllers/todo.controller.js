import Todo from "../models/todo.model.js";

// GET /api/todos?status=true/false&from=2025-01-01&to=2025-12-31&page=1&limit=10&dueFrom=2025-01-01&dueTo=2025-12-31
export const list = async (req, res) => {
  try {
    const { status, from, to, dueFrom, dueTo, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter theo trạng thái
    if (status !== undefined && status !== "") {
      query.completed = status === "true";
    }

    // Filter theo ngày tạo
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Filter theo ngày đến hạn (dueAt)
    if (dueFrom || dueTo) {
      query.dueAt = {};
      if (dueFrom) query.dueAt.$gte = new Date(dueFrom);
      if (dueTo) query.dueAt.$lte = new Date(dueTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Todo.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Todo.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { title, dueAt } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const todo = await Todo.create({ title, dueAt });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    console.log("Attempting to delete todo with ID:", req.params.id); // Log ID từ server
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/todos/stats
export const stats = async (_req, res) => {
  try {
    const [byStatus] = await Promise.all([
      Todo.aggregate([{ $group: { _id: "$completed", count: { $sum: 1 } } }]),
    ]);

    const stats = {
      total: 0,
      completed: 0,
      pending: 0,
    };

    byStatus.forEach((item) => {
      if (item._id === true) stats.completed = item.count;
      if (item._id === false) stats.pending = item.count;
      stats.total += item.count;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
