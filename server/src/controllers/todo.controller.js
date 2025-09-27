import Todo from "../models/todo.model.js";

// GET /api/todos?status=true/false&from=2025-01-01&to=2025-12-31&page=1&limit=10
export const list = async (req, res) => {
  const { status, from, to, page = 1, limit = 10 } = req.query;
  const q = {};
  if (status === "true" || status === "false") q.completed = status === "true";
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Todo.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Todo.countDocuments(q),
  ]);
  res.json({
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
};

export const create = async (req, res) => {
  const { title, dueAt } = req.body;
  const todo = await Todo.create({ title, dueAt });
  res.status(201).json(todo);
};

export const update = async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(todo);
};

// GET /api/todos/stats
export const stats = async (_req, res) => {
  const [byStatus, byDay] = await Promise.all([
    Todo.aggregate([{ $group: { _id: "$completed", count: { $sum: 1 } } }]),
    Todo.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);
  res.json({ byStatus, byDay });
};

const listTodos = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, from, to, dueFrom, dueTo } = req.query;

    const query = {};
    if (status !== undefined && status !== "") {
      query.completed = status === "true";
    }
    if (from && to) {
      query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }
    if (dueFrom && dueTo) {
      query.dueAt = { $gte: new Date(dueFrom), $lte: new Date(dueTo) };
    }

    const skip = (page - 1) * limit;
    const total = await Todo.countDocuments(query);
    const items = await Todo.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};