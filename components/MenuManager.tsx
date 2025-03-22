"use client";

import { useState } from "react";
import { useOrderContext } from "@/context/OrderContext";

export default function MenuManager() {
  const { selectedEvent, addMenuItem, menu } = useOrderContext();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = () => {
    if (!title || !price) return;
    addMenuItem(title, parseFloat(price));
    setTitle("");
    setPrice("");
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">Menu di {selectedEvent?.title}</h2>
      <ul className="space-y-2">
        {menu.map((item) => (
          <li key={item.id} className="border p-2">
            {item.title} - €{item.price.toFixed(2)}
          </li>
        ))}
      </ul>
      <input
        className="border p-2 w-full mt-2"
        placeholder="Nome portata"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="border p-2 w-full mt-2"
        type="number"
        placeholder="Prezzo"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button
        className="bg-green-500 text-white px-4 py-2 mt-2"
        onClick={handleAdd}
      >
        Aggiungi Portata
      </button>
    </div>
  );
}
