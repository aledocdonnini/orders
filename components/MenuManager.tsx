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
  available: boolean;
}

interface MenuManagerProps {
  eventId: number;
  menu: MenuItem[];
  mutate: () => void; // Funzione per aggiornare i dati (es. da SWR)
}

export default function MenuManager({
  eventId,
  menu,
  mutate,
}: MenuManagerProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Aggiunge una nuova portata
  const handleAdd = async () => {
    if (!title || !price) {
      toast.error("Inserisci sia il nome che il prezzo della portata.");
      return;
    }
    try {
      await addMenuItem(eventId, title, parseFloat(price));
      toast.success("Portata aggiunta!");
      setTitle("");
      setPrice("");
      mutate(); // Aggiorna la lista
    } catch (error: any) {
      toast.error("Errore nell'aggiunta della portata.");
      console.error(error);
    }
  };

  // Gestisce il cambio dello stato del checkbox
  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Elimina le portate selezionate
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Seleziona almeno una portata da eliminare.");
      return;
    }
    try {
      await deleteMenuItems(selectedIds);
      toast.success("Portate eliminate!");
      setSelectedIds([]);
      mutate();
    } catch (error: any) {
      toast.error("Errore nell'eliminazione delle portate.");
      console.error(error);
    }
  };

  // Cambia lo stato di disponibilità della portata
  const handleToggleStatus = async (id: number, available: boolean) => {
    try {
      await toggleMenuItemStatus(id, !available);
      toast.info(
        !available ? "Portata resa disponibile." : "Portata terminata."
      );
      mutate();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento della portata.");
      console.error(error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">Gestione Menu</h2>

      {/* Form per aggiungere portata */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome portata"
          className="border p-2 flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Prezzo"
          className="border p-2 w-24"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
                {item.available && (
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) =>
                      handleCheckboxChange(item.id, e.target.checked)
                    }
                  />
                )}
                <span className={`${!item.available ? "text-gray-500" : ""}`}>
                  {item.title} - €{item.price.toFixed(2)}
                </span>
              </div>
              <div>
                <button
                  onClick={() => handleToggleStatus(item.id, item.available)}
                  className="text-blue-500 underline"
                >
                  {item.available ? "Termina" : "Ripristina"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

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
