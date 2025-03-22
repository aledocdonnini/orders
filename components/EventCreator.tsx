"use client";

import { useState } from "react";
import { useOrderContext } from "@/context/OrderContext";

// Definizione delle props del componente (anche se non strettamente necessaria qui)
interface EventCreatorProps {}

export default function EventCreator({}: EventCreatorProps) {
  const { addEvent } = useOrderContext();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!title || !date) return;
    addEvent(title, date);
    setTitle("");
    setDate("");
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">Crea un nuovo evento</h2>
      <input
        className="border p-2 w-full mt-2"
        placeholder="Titolo evento"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="border p-2 w-full mt-2"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-2"
        onClick={handleSubmit}
      >
        Aggiungi Evento
      </button>
    </div>
  );
}
