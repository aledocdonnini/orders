"use client";

import { useState } from "react";
import { useOrderContext, MenuItem } from "@/context/OrderContext";

export default function MenuManager() {
  const {
    selectedEvent,
    addMenuItem,
    menu,
    deleteMenuItems,
    terminateMenuItem,
    reopenMenuItem,
  } = useOrderContext();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleAdd = () => {
    if (!title || !price) return;
    addMenuItem(title, parseFloat(price));
    setTitle("");
    setPrice("");
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      deleteMenuItems(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleTerminate = (id: number) => {
    terminateMenuItem(id);
  };

  const handleReopen = (id: number) => {
    reopenMenuItem(id);
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">Menu di {selectedEvent?.title}</h2>
      <ul className="space-y-2">
        {menu.map((item: MenuItem) => (
          <li
            key={item.id}
            className={`border p-2 flex items-center justify-between ${
              item.terminated ? "bg-gray-300" : ""
            }`}
          >
            <div className="flex items-center">
              {!item.terminated && (
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) =>
                    handleCheckboxChange(item.id, e.target.checked)
                  }
                />
              )}
              <span>
                {item.title} - €{item.price.toFixed(2)}
              </span>
            </div>
            <div>
              {item.terminated ? (
                <button
                  className="text-green-500 underline"
                  onClick={() => handleReopen(item.id)}
                >
                  Rendi Disponibile
                </button>
              ) : (
                <button
                  className="text-blue-500 underline"
                  onClick={() => handleTerminate(item.id)}
                >
                  Termina
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {selectedIds.length > 0 && (
        <button
          className="bg-red-500 text-white px-4 py-2 mt-2"
          onClick={handleDelete}
        >
          Elimina Portate Selezionate
        </button>
      )}
      <div className="mt-4">
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
    </div>
  );
}
