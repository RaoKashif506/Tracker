import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./api";
import { AuthPage } from "./pages/AuthPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BudgetsPage } from "./pages/BudgetsPage";

type User = { userId: string; email: string };

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((r) => setUser(r.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Smart Expense Tracker</h1>
      {user ? (
        <nav className="nav">
          <Link to="/expenses">Expenses</Link>
          <Link to="/budgets">Budgets</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      ) : null}
      <Routes>
        <Route path="/auth" element={<AuthPage onAuth={() => window.location.reload()} />} />
        <Route path="/expenses" element={user ? <ExpensesPage /> : <Navigate to="/auth" />} />
        <Route path="/budgets" element={user ? <BudgetsPage /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <ProfilePage onLogout={() => setUser(null)} /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to={user ? "/expenses" : "/auth"} />} />
      </Routes>
    </div>
  );
}
