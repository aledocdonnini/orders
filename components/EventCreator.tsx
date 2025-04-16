"use client";

import { useState } from "react";

interface EventCreatorProps {
  onEventCreated: (title: string, date: string) => void;
}

export default function EventCreator({ onEventCreated }: EventCreatorProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !date) return;

    setLoading(true);
    setError(null);

    try {
      await onEventCreated(title, date);
      setTitle("");
      setDate("");
    } catch (err: any) {
      console.error("Errore nella creazione dell'evento:", err);
      setError("Errore nella creazione dell'evento.");
    } finally {
      setLoading(false);
    }
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
        className="bg-blue-500 text-white px-4 py-2 mt-2 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creazione in corso..." : "Aggiungi Evento"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
