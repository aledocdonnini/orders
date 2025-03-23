"use client";

import { useState, useEffect, useCallback } from "react";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { updateMenuOrder, addMenuCategory } from "@/lib/supabase";
import {
  addMenuItem,
  toggleMenuItemStatus,
  deleteMenuItems,
  updateMenuItemCategory,
} from "@/app/api/menu";
import { toast } from "react-toastify";
import { getCategories } from "@/lib/supabase"; // Importa la funzione getCategories
import MenuCategories from "./MenuCategories";

interface MenuItem {
  id: number;
  event_id: number;
  title: string;
  price: number;
  terminated: boolean;
  position: number;
  category_id?: number; // Utilizziamo category_id per il riferimento alla categoria
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  eventId: number;
  menu: MenuItem[];
  mutate: () => void;
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [menuState, setMenuState] = useState<MenuItem[]>(menu);

  // Carica le categorie
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoryList = await getCategories(eventId);
        setCategories(categoryList);
      } catch (error) {
        toast.error("Errore nel recupero delle categorie.");
      }
    }
    fetchCategories();
  }, [eventId]);

  const moveItem = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      const updatedMenu = [...menuState];
      const draggedItem = updatedMenu.splice(dragIndex, 1)[0];
      updatedMenu.splice(hoverIndex, 0, draggedItem);

      const reorderedMenu = updatedMenu.map((item, idx) => ({
        ...item,
        position: idx + 1,
        event_id: item.event_id,
      }));

      setMenuState(reorderedMenu);

      try {
        await updateMenuOrder(reorderedMenu);
        mutate();
      } catch (error) {
        console.error("Errore aggiornamento ordine:", error);
        toast.error("Errore nell'aggiornamento dell'ordine!");
      }
    },
    [menuState, mutate]
  );

  async function handleAddMenuItem() {
    if (!newTitle.trim() || !newPrice || selectedCategory === "") {
      return toast.error("Inserisci titolo, prezzo e categoria!");
    }

    try {
      // Passiamo anche la categoria nella funzione addMenuItem
      await addMenuItem(
        eventId,
        newTitle,
        parseFloat(newPrice),
        selectedCategory
      );
      setNewTitle("");
      setNewPrice("");
      setSelectedCategory(""); // Resetta la categoria selezionata
      mutate();
    } catch (error) {
      toast.error("Errore nell'aggiunta della portata.");
    }
  }

  // Gestione dell'aggiunta della categoria
  async function handleAddCategory() {
    if (!newCategory.trim()) {
      return toast.error("Inserisci un nome per la categoria!");
    }

    try {
      await addMenuCategory(eventId, newCategory);
      setNewCategory(""); // Pulisce il campo categoria
      mutate(); // Ricarica i dati
    } catch (error) {
      toast.error("Errore nell'aggiunta della categoria");
    }
  }

  async function handleDeleteItems() {
    if (selectedItems.length === 0)
      return toast.error("Seleziona almeno una portata da eliminare!");
    if (!confirm("Sei sicuro di voler eliminare le portate selezionate?"))
      return;
    await deleteMenuItems(selectedItems);
    setSelectedItems([]);
    mutate();
  }

  async function handleToggleTerminated(itemId: number, terminated: boolean) {
    await toggleMenuItemStatus(itemId, !terminated);
    mutate();
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-2 gap-4">
        {/* Gestione Portate */}
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
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(parseInt(e.target.value) || "")
            }
            className="border p-2"
          >
            <option value="">Seleziona una categoria</option>
            {categories
              .sort((a, b) => a.id - b.id)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>

          <button
            onClick={handleAddMenuItem}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Aggiungi
          </button>

          <h2 className="text-lg font-bold mt-6">Gestisci Portate</h2>
          {menuState.length === 0 ? (
            <p>Nessuna portata trovata.</p>
          ) : (
            menuState
              .sort((a, b) => a.position - b.position)
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

        {/* Gestione Categorie */}
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

          <MenuCategories eventId={eventId} />
        </div>
      </div>
    </DndProvider>
  );
}
