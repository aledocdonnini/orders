"use client";

import { useState, useCallback } from "react";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { updateMenuOrder, addMenuCategory } from "@/lib/supabase";
import {
  addMenuItem,
  toggleMenuItemStatus,
  deleteMenuItems,
} from "@/app/api/menu";
import { toast } from "react-toastify";

interface MenuItem {
  id: number;
  event_id: number;
  title: string;
  price: number;
  terminated: boolean;
  position: number; // Cambiato 'order' a 'position'
  category?: string;
}

interface Props {
  eventId: number;
  menu: MenuItem[];
  mutate: () => void;
}

// Componente Drag & Drop per le portate
const DraggableMenuItem = ({
  item,
  index,
  moveItem,
}: {
  item: MenuItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "MENU_ITEM",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "MENU_ITEM",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => {
        if (node) drag(drop(node));
      }}
      className={`p-2 border bg-white ${isDragging ? "opacity-50" : ""}`}
    >
      {item.title} - €{item.price} {item.terminated && "(Terminato)"}
    </div>
  );
};

export default function MenuManager({ eventId, menu, mutate }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [menuState, setMenuState] = useState<MenuItem[]>(menu);

  // Funzione per riordinare le portate
  const moveItem = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      const updatedMenu = [...menuState];
      const draggedItem = updatedMenu.splice(dragIndex, 1)[0];
      updatedMenu.splice(hoverIndex, 0, draggedItem);

      // Aggiorna la posizione delle portate
      const reorderedMenu = updatedMenu.map((item, idx) => ({
        ...item,
        position: idx + 1, // Assicurati che la posizione parta da 1 (1-based indexing)
        event_id: item.event_id, // Assicurati che event_id venga passato
      }));

      setMenuState(reorderedMenu);

      try {
        console.log("Aggiornamento ordine:", reorderedMenu);
        await updateMenuOrder(reorderedMenu); // Funzione aggiornata
        mutate();
      } catch (error) {
        console.error("Errore aggiornamento ordine:", error);
        toast.error("Errore nell'aggiornamento dell'ordine!");
      }
    },
    [menuState, mutate]
  );

  // Aggiungi una nuova portata
  async function handleAddMenuItem() {
    if (!newTitle.trim() || !newPrice)
      return toast.error("Inserisci titolo e prezzo!");

    await addMenuItem(eventId, newTitle, parseFloat(newPrice));
    setNewTitle("");
    setNewPrice("");
    mutate();
  }

  // Aggiungi una categoria
  async function handleAddCategory() {
    if (!newCategory.trim())
      return toast.error("Inserisci un nome per la categoria!");
    await addMenuCategory(eventId, newCategory);
    setNewCategory("");
    mutate();
  }

  // Elimina le portate selezionate
  async function handleDeleteItems() {
    if (selectedItems.length === 0)
      return toast.error("Seleziona almeno una portata da eliminare!");
    if (!confirm("Sei sicuro di voler eliminare le portate selezionate?"))
      return;
    await deleteMenuItems(selectedItems);
    setSelectedItems([]);
    mutate();
  }

  // Cambia stato "terminata" della portata
  async function handleToggleTerminated(itemId: number, terminated: boolean) {
    await toggleMenuItemStatus(itemId, !terminated);
    mutate();
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">Aggiungi Portata</h2>
          <input
            type="text"
            placeholder="Titolo"
            className="border p-2 mr-2"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="Prezzo"
            className="border p-2 mr-2"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <button
            onClick={handleAddMenuItem}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Aggiungi
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold">Aggiungi Categoria</h2>
          <input
            type="text"
            placeholder="Nome categoria"
            className="border p-2 mr-2"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            onClick={handleAddCategory}
            className="bg-green-500 text-white px-4 py-2"
          >
            Aggiungi
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold">Gestisci Portate</h2>
          {menuState.length === 0 ? (
            <p>Nessuna portata trovata.</p>
          ) : (
            menuState
              .sort((a, b) => a.position - b.position) // Ordinamento per posizione
              .map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 border p-2"
                >
                  <input
                    type="checkbox"
                    onChange={() =>
                      setSelectedItems((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      )
                    }
                  />
                  <DraggableMenuItem
                    item={item}
                    index={index}
                    moveItem={moveItem}
                  />
                  <button
                    onClick={() =>
                      handleToggleTerminated(item.id, item.terminated)
                    }
                    className="text-sm px-2 py-1 bg-gray-500 text-white"
                  >
                    {item.terminated ? "Ripristina" : "Termina"}
                  </button>
                </div>
              ))
          )}
          <button
            onClick={handleDeleteItems}
            className="bg-red-500 text-white px-4 py-2 mt-4"
          >
            Elimina Selezionati
          </button>
        </div>
      </div>
    </DndProvider>
  );
}
