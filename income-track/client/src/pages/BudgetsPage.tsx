import { useEffect, useState } from "react";
import { api } from "../api";

export function BudgetsPage() {
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  async function load() {
    const [cats, b] = await Promise.all([
      api.get("/categories"),
      api.get(`/budgets?month=${month}&year=${year}`)
    ]);
    setCategories(cats.data.data.categories);
    setBudgets(b.data.data.budgets);
    if (!categoryId && cats.data.data.categories.length > 0) {
      setCategoryId(cats.data.data.categories[0]._id);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    await api.put("/budgets", { categoryId, amount, month, year });
    await load();
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Monthly budgets</h2>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} type="number" />
        <button onClick={save}>Save budget</button>
      </div>
      <div className="card">
        <h2>Saved budgets</h2>
        <ul>
          {budgets.map((b) => (
            <li key={b._id}>
              {b.categoryId?.name ?? "Category"}: {b.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
