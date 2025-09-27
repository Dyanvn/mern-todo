import { useEffect, useState } from "react";
import api from "../services/api";

export default function Home() {
  // Query state (lọc + phân trang)
  const [q, setQ] = useState({
    page: 1,
    limit: 6,
    status: "",
    from: "",
    to: "",
    dueFrom: "",
    dueTo: "",
  });

  // Data state (server trả về)
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });

  // Stats state
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    total: 0,
  });

  // Input thêm mới
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState(""); // Thêm state cho dueDate

  // Load data từ server
  const load = async () => {
    const res = await api.get("/todos", { params: q });
    setData(res.data);

    // Load stats riêng (giả sử API /todos/stats tồn tại)
    const statsRes = await api.get("/todos/stats");
    setStats(statsRes.data);
  };

  useEffect(() => {
    load();
  }, [q]);

  // Thêm todo
  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/todos", { title, dueAt }); // Gửi kèm dueAt
    setTitle("");
    setDueAt("");
    load();
  };

  // Toggle completed
  const toggle = async (id, completed) => {
    await api.put(`/todos/${id}`, { completed: !completed });
    load();
  };

  // Xoá todo
  const remove = async (id) => {
  try {
    console.log("Deleting todo with ID:", id); // Debug ID
    await api.delete(`/todos/${id}`);
    console.log("Delete request sent successfully");
    load(); // Luôn gọi load để cập nhật UI, ngay cả khi server trả lỗi
  } catch (err) {
    console.error("Error deleting todo:", err);
    load(); // Gọi load lại để làm mới danh sách
  }
};

  // Format ngày cho hiển thị
  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6 bg-white shadow-lg rounded-xl">
      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold text-center text-blue-600">To Do List</h1>

      {/* Form thêm mới */}
      <form onSubmit={add} className="flex flex-col gap-3 md:flex-row">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
        >
          Add
        </button>
      </form>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 items-end bg-gray-100 p-4 rounded-lg">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Status</label>
          <select
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={q.status}
            onChange={(e) => setQ({ ...q, status: e.target.value, page: 1 })}
          >
            <option value="">All</option>
            <option value="true">Completed</option>
            <option value="false">Not completed</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Created From</label>
          <input
            type="date"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setQ({ ...q, from: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Created To</label>
          <input
            type="date"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setQ({ ...q, to: e.target.value, page: 1 })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Due From</label>
          <input
            type="date"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setQ({ ...q, dueFrom: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Due To</label>
          <input
            type="date"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setQ({ ...q, dueTo: e.target.value, page: 1 })}
          />
        </div>
      </div>

      {/* Danh sách todo */}
      <ul className="space-y-3">
        {data.items.map((t) => (
          <li
            key={t._id}
            className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition duration-200"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggle(t._id, t.completed)}
                className="w-5 h-5"
              />
              <div>
                <span className={t.completed ? "line-through opacity-60" : "font-medium"}>
                  {t.title}
                </span>
                <p className="text-sm text-gray-500">Due: {formatDate(t.dueAt)}</p>
              </div>
            </div>
            <button
              onClick={() => remove(t._id)}
              className="text-red-600 hover:text-red-800 transition duration-200"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Phân trang */}
      <div className="flex items-center justify-center gap-3">
        <button
          disabled={data.page <= 1}
          onClick={() => setQ({ ...q, page: q.page - 1 })}
          className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition duration-200"
        >
          Prev
        </button>
        <span className="font-medium">
          Page {data.page} / {data.pages}
        </span>
        <button
          disabled={data.page >= data.pages}
          onClick={() => setQ({ ...q, page: q.page + 1 })}
          className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition duration-200"
        >
          Next
        </button>
      </div>

      {/* Thống kê */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
        <ul className="space-y-1">
          <li>Total Tasks: {stats.total}</li>
          <li>Completed: {stats.completed}</li>
          <li>Pending: {stats.pending}</li>
        </ul>
      </div>
    </div>
  );
}