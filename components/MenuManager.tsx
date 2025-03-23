"use client";

import { useState } from "react";
import {
  addMenuItem,
  deleteMenuItems,
  toggleMenuItemStatus,
} from "@/app/api/menu";
import { toast } from "react-toastify";

interface MenuItem {
  id: number;
  event_id: number;
  title: string;
  price: number;
  terminated: boolean;
}

interface MenuManagerProps {
  eventId: number;
  menu: MenuItem[];
  mutate: () => void; // Funzione per aggiornare i dati (ad es. da SWR)
}

export default function MenuManager({
  eventId,
  menu,
  mutate,
}: MenuManagerProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Aggiunge una nuova portata
  async function handleAdd() {
    if (!newTitle.trim() || !newPrice.trim()) {
      toast.error("Inserisci nome e prezzo della portata.");
      return;
    }
    try {
      await addMenuItem(eventId, newTitle, parseFloat(newPrice));
      toast.success("Portata aggiunta!");
      setNewTitle("");
      setNewPrice("");
      mutate();
    } catch (error: any) {
      toast.error("Errore nell'aggiunta della portata.");
      console.error(error);
    }
  }

  // Gestione checkbox per eliminazione multipla
  function handleCheckboxChange(id: number, checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  }

  // Eliminazione delle portate selezionate con conferma
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      toast.error("Seleziona almeno una portata da eliminare.");
      return;
    }
    if (!confirm("Sei sicuro di voler eliminare le portate selezionate?"))
      return;
    try {
      await deleteMenuItems(selectedIds);
      toast.success("Portate eliminate!");
      setSelectedIds([]);
      mutate();
    } catch (error: any) {
      toast.error("Errore nell'eliminazione delle portate.");
      console.error(error);
    }
  }

  // Cambia lo stato di terminazione della portata
  async function handleToggleStatus(
    itemId: number,
    currentTerminated: boolean
  ) {
    try {
      await toggleMenuItemStatus(itemId, !currentTerminated);
      toast.info(
        !currentTerminated ? "Portata terminata." : "Portata ripristinata."
      );
      mutate(); // Forza il refetch dei dati
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento dello stato della portata.");
      console.error(error);
    }
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Gestione Menu</h2>

      {/* Form per aggiungere una nuova portata */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome portata"
          className="border p-2 flex-1"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Prezzo"
          className="border p-2 w-24"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2"
          onClick={handleAdd}
        >
          Aggiungi
        </button>
      </div>

      {/* Lista delle portate */}
      {menu.length === 0 ? (
        <p>Nessuna portata presente per questo evento.</p>
      ) : (
        <ul className="space-y-2">
          {menu.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border p-2"
            >
              <div className="flex items-center">
                {/* Mostra checkbox solo se la portata è disponibile */}
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
                <span
                  className={`${item.terminated ? "text-gray-500 line-through" : ""}`}
                >
                  {item.title} - €{item.price.toFixed(2)}
                </span>
              </div>
              <div>
                <button
                  onClick={() => handleToggleStatus(item.id, item.terminated)}
                  className="text-blue-500 underline"
                >
                  {item.terminated ? "Ripristina" : "Termina"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Bottone per eliminare portate selezionate */}
      {selectedIds.length > 0 && (
        <button
          className="bg-red-500 text-white px-4 py-2 mt-4"
          onClick={handleDeleteSelected}
        >
          Elimina Portate Selezionate
        </button>
      )}
    </div>
  );
}
