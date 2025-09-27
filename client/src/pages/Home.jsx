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
  });

  // Data state (server trả về)
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });

  // Input thêm mới
  const [title, setTitle] = useState("");

  // Load data từ server
  const load = async () => {
    const res = await api.get("/todos", { params: q });
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, [q]);

  // Thêm todo
  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/todos", { title });
    setTitle("");
    load();
  };

  // Toggle completed
  const toggle = async (id, completed) => {
    await api.put(`/todos/${id}`, { completed: !completed });
    load();
  };

  // Xoá todo
  const remove = async (id) => {
    await api.delete(`/todos/${id}`);
    load();
  };

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {/* Form thêm mới */}
      <form onSubmit={add} className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* Bộ lọc */}
<div className="flex flex-wrap gap-2 items-end">
  <select
    className="border rounded px-2 py-1"
    value={q.status}
    onChange={(e) => setQ({ ...q, status: e.target.value, page: 1 })}
  >
    <option value="">All</option>
    <option value="true">Completed</option>
    <option value="false">Not completed</option>
  </select>

  {/* Lọc theo ngày tạo */}
  <input
    type="date"
    className="border rounded px-2 py-1"
    onChange={(e) => setQ({ ...q, from: e.target.value, page: 1 })}
  />
  <input
    type="date"
    className="border rounded px-2 py-1"
    onChange={(e) => setQ({ ...q, to: e.target.value, page: 1 })}
  />

  {/* Lọc theo ngày đến hạn (dueAt) */}
  <input
    type="date"
    className="border rounded px-2 py-1"
    onChange={(e) => setQ({ ...q, dueFrom: e.target.value, page: 1 })}
  />
  <input
    type="date"
    className="border rounded px-2 py-1"
    onChange={(e) => setQ({ ...q, dueTo: e.target.value, page: 1 })}
  />
</div>

      {/* Danh sách todo */}
      <ul className="space-y-2">
        {data.items.map((t) => (
          <li
            key={t._id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggle(t._id, t.completed)}
              />
              <span className={t.completed ? "line-through opacity-60" : ""}>
                {t.title}
              </span>
            </div>
            <button
              onClick={() => remove(t._id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Phân trang */}
      <div className="flex items-center gap-2">
        <button
          disabled={data.page <= 1}
          onClick={() => setQ({ ...q, page: q.page - 1 })}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {data.page} / {data.pages}
        </span>
        <button
          disabled={data.page >= data.pages}
          onClick={() => setQ({ ...q, page: q.page + 1 })}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
