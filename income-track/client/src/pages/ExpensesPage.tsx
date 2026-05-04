import { useEffect, useState } from "react";
import { api } from "../api";

type Transaction = {
  _id?: string;
  id?: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  date: string;
};

export function ExpensesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<"" | "expense" | "income">("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  async function load() {
    const [tx, cats] = await Promise.all([
      api.get("/transactions"),
      api.get("/categories")
    ]);
    setTransactions(tx.data.data.transactions);
    setCategories(cats.data.data.categories);
    if (!category && cats.data.data.categories.length > 0) {
      setCategory(cats.data.data.categories[0]._id);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create() {
    if (!type || !category) return;
    await api.post("/transactions", {
      type,
      amount,
      category,
      description,
      date: new Date().toISOString()
    });
    setDescription("");
    setAmount(0);
    await load();
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Add transaction</h2>
        <select value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="">Choose type</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" type="number" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={create}>Save</button>
      </div>
      <div className="card">
        <h2>Transactions</h2>
        <ul>
          {transactions.map((t) => (
            <li key={t.id ?? t._id}>
              {t.description} - {t.amount} ({t.type})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
