import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Loader from "../components/Loader";

export default function SelectCategory({
  onSelectCategory,
  onViewAppointments,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://service-bot-backend.onrender.com/categories"
        );
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("❌ Помилка отримання категорій:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: "16px" }}>
      <h2>Оберіть категорію послуг:</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {categories.map((cat) => (
          <li key={cat.id} style={{ marginBottom: "12px" }}>
            <Button
              onClick={() => onSelectCategory(cat)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {cat.name}
            </Button>
          </li>
        ))}
      </ul>

      <Button
        onClick={onViewAppointments}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#10b981",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        type="success"
      >
        📅 Мої записи
      </Button>
    </div>
  );
}
